import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "@/lib/rate-limit";
import {
  sesiJurnalDariRequest,
  sesiPunyaPeran
} from "@/lib/jurnal/sesi-server";
import { daftarReviewerTersedia } from "@/lib/jurnal/review-server";
import { buatUndanganReviewer } from "@/lib/jurnal/undangan";
import { JURNAL_STAFF_ROLES } from "@/lib/jurnal/status";
import {
  bacaJsonTerbatas,
  batasiLajuJurnal,
  catatPeristiwaKeamanan,
  responsBadanTerlaluBesar
} from "@/lib/jurnal/keamanan";

// Daftar reviewer yang dapat ditugaskan (GET) dan undangan reviewer
// baru lewat email (POST) — keduanya khusus peran staf jurnal pada kedua
// mode data (Tahap 3). Undangan tidak mengirim email pada tahap ini
// (pengiriman email adalah Tahap 6); POST mengembalikan tautan klaim
// sekali tampil kepada staf untuk diserahkan kepada calon reviewer.

export const dynamic = "force-dynamic";

async function tuntutStaf(req: NextRequest) {
  const sesi = await sesiJurnalDariRequest(req);
  if (!sesi) {
    await catatPeristiwaKeamanan("review_ditolak", {
      ip: getClientIp(req),
      rincian: "reviewers:tanpa-sesi"
    });
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Sesi jurnal tidak ditemukan. Silakan masuk ulang." },
        { status: 401 }
      )
    };
  }
  if (!sesiPunyaPeran(sesi, JURNAL_STAFF_ROLES)) {
    await catatPeristiwaKeamanan("review_ditolak", {
      ip: getClientIp(req),
      email: sesi.email,
      rincian: "reviewers:bukan-staf"
    });
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Aksi ini memerlukan peran staf jurnal." },
        { status: 403 }
      )
    };
  }
  return { ok: true as const, sesi };
}

export async function GET(req: NextRequest) {
  const dibatasi = await batasiLajuJurnal(req, "review-daftar-reviewer", {
    perIp: { limit: 120, windowMs: 60 * 1000 }
  });
  if (dibatasi) return dibatasi;

  const gerbang = await tuntutStaf(req);
  if (!gerbang.ok) return gerbang.response;

  try {
    const reviewers = await daftarReviewerTersedia();
    return NextResponse.json({ reviewers });
  } catch (err) {
    console.error(
      "GET /api/jurnal/reviewers gagal:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { error: "Gagal memuat daftar reviewer." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const dibatasi = await batasiLajuJurnal(req, "review-undang", {
    perIp: { limit: 30, windowMs: 60 * 60 * 1000 }
  });
  if (dibatasi) return dibatasi;

  const gerbang = await tuntutStaf(req);
  if (!gerbang.ok) return gerbang.response;

  const { data: body, terlaluBesar } = await bacaJsonTerbatas(req, 8 * 1024);
  if (terlaluBesar) return responsBadanTerlaluBesar();
  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) {
    return NextResponse.json(
      { error: "Format email calon reviewer tidak sah." },
      { status: 400 }
    );
  }

  try {
    // Bila alamat sudah terdaftar sebagai reviewer, undangan tidak
    // diperlukan lagi.
    const tersedia = await daftarReviewerTersedia();
    if (tersedia.some((r) => r.email.toLowerCase() === email)) {
      return NextResponse.json(
        {
          error:
            "Alamat ini sudah terdaftar sebagai reviewer; tugaskan langsung dari daftar reviewer."
        },
        { status: 409 }
      );
    }
    const hasil = await buatUndanganReviewer(email, {
      userId: gerbang.sesi.userId,
      email: gerbang.sesi.email
    });
    return NextResponse.json(
      {
        email: hasil.email,
        kedaluwarsa: hasil.kedaluwarsa,
        tautanKlaim: `/jurnal/terima-undangan?token=${hasil.token}`,
        catatan:
          "Serahkan tautan klaim ini kepada calon reviewer. Pengiriman undangan lewat email adalah pekerjaan Tahap 6; pada tahap ini tautan diserahkan staf secara langsung."
      },
      { status: 201 }
    );
  } catch (err) {
    console.error(
      "POST /api/jurnal/reviewers gagal:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { error: "Gagal membuat undangan reviewer." },
      { status: 500 }
    );
  }
}

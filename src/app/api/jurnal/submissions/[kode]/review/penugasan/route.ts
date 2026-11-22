import { NextRequest, NextResponse } from "next/server";
import { tugaskanReviewer } from "@/lib/jurnal/review-server";
import { tuntutStafJurnal } from "@/lib/jurnal/gerbang";
import {
  JURNAL_TENGGET_MAX_HARI,
  JURNAL_TENGGET_MIN_HARI
} from "@/lib/jurnal/review";
import {
  bacaJsonTerbatas,
  batasiLajuJurnal,
  normalisasiKodeLacak,
  responsBadanTerlaluBesar
} from "@/lib/jurnal/keamanan";

// Menugaskan satu reviewer pada putaran telaah yang terbuka (khusus
// staf, Tahap 3). Reviewer dipilih menurut email dari daftar pengguna
// berperan reviewer; tenggat bawaan 28 hari sesuai susunan isi.

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ kode: string }> }
) {
  const dibatasi = await batasiLajuJurnal(req, "review-penugasan", {
    perIp: { limit: 60, windowMs: 60 * 1000 }
  });
  if (dibatasi) return dibatasi;

  const { kode: kodeMentah } = await params;
  const kode = normalisasiKodeLacak(kodeMentah);
  if (!kode) {
    return NextResponse.json(
      { error: "Format kode lacak tidak sah." },
      { status: 400 }
    );
  }

  const gerbang = await tuntutStafJurnal(req, "review-penugasan");
  if (!gerbang.ok) return gerbang.response;

  const { data: body, terlaluBesar } = await bacaJsonTerbatas(req, 8 * 1024);
  if (terlaluBesar) return responsBadanTerlaluBesar();
  const reviewerEmail =
    typeof body?.reviewerEmail === "string"
      ? body.reviewerEmail.trim().toLowerCase()
      : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(reviewerEmail)) {
    return NextResponse.json(
      { error: "Email reviewer wajib dikirim dalam format yang sah." },
      { status: 400 }
    );
  }
  let tenggatHari: number | undefined;
  if (body?.tenggatHari !== undefined) {
    if (
      typeof body.tenggatHari !== "number" ||
      !Number.isInteger(body.tenggatHari) ||
      body.tenggatHari < JURNAL_TENGGET_MIN_HARI ||
      body.tenggatHari > JURNAL_TENGGET_MAX_HARI
    ) {
      return NextResponse.json(
        {
          error: `Tenggat harus bilangan bulat antara ${JURNAL_TENGGET_MIN_HARI} dan ${JURNAL_TENGGET_MAX_HARI} hari.`
        },
        { status: 400 }
      );
    }
    tenggatHari = body.tenggatHari;
  }

  try {
    const hasil = await tugaskanReviewer(
      kode,
      { reviewerEmail, tenggatHari },
      { userId: gerbang.sesi.userId, email: gerbang.sesi.email }
    );
    return NextResponse.json(hasil, { status: 201 });
  } catch (err) {
    const pesan =
      err instanceof Error ? err.message : "Gagal menugaskan reviewer.";
    const status = /tidak ditemukan/i.test(pesan) ? 404 : 400;
    return NextResponse.json({ error: pesan }, { status });
  }
}

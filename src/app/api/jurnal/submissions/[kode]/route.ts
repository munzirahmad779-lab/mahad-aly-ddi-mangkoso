import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "@/lib/rate-limit";
import {
  getJurnalDataMode,
  getSubmission,
  updateSubmissionStatus
} from "@/lib/jurnal/store";
import { requireJurnalRole } from "@/lib/jurnal/auth";
import {
  emailDariHeaderLokal,
  sesiLokalStaf
} from "@/lib/jurnal/sesi-lokal";
import {
  isJurnalStatus,
  JURNAL_STAFF_ROLES,
  JURNAL_STATUSES,
  transisiStatusSah
} from "@/lib/jurnal/status";
import {
  BATAS_TEKS,
  bacaJsonTerbatas,
  batasiLajuJurnal,
  catatPeristiwaKeamanan,
  normalisasiKodeLacak,
  responsBadanTerlaluBesar
} from "@/lib/jurnal/keamanan";

// Satu naskah berdasarkan kode lacak JRN-YYYY-XXXX.
// GET dipakai halaman lacak (publik, kode lacak adalah kuncinya) dengan
// format kode divalidasi ketat sebelum menyentuh lapisan data.
// PATCH dipakai panel redaksi untuk mengubah status mengikuti kosakata
// alur OJS dan tabel transisi yang diizinkan; wajib sesi berperan staf
// pada KEDUA mode (mode supabase: peran jurnal; mode lokal: akun staf
// uji dari env JURNAL_LOCAL_STAFF_EMAILS). Setiap perubahan menulis
// linimasa. Lihat KEAMANAN-OJS-VERSI-KITA.md bagian 1.2 dan 1.4.

export const dynamic = "force-dynamic";

async function tolakKodeTidakSah(
  req: NextRequest,
  kodeMentah: string
): Promise<NextResponse> {
  await catatPeristiwaKeamanan("kode_tidak_sah", {
    ip: getClientIp(req),
    kode: kodeMentah.slice(0, 64),
    rincian: "format-kode-lacak"
  });
  return NextResponse.json(
    {
      error:
        "Format kode lacak tidak sah. Kode lacak berformat JRN-YYYY-XXXX (contoh: JRN-2026-1234)."
    },
    { status: 400 }
  );
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ kode: string }> }
) {
  const dibatasi = await batasiLajuJurnal(req, "lacak", {
    perIp: { limit: 60, windowMs: 60 * 1000 }
  });
  if (dibatasi) return dibatasi;

  const { kode: kodeMentah } = await params;
  const kode = normalisasiKodeLacak(kodeMentah);
  if (!kode) return tolakKodeTidakSah(req, kodeMentah);

  try {
    const naskah = await getSubmission(kode);
    if (!naskah) {
      return NextResponse.json(
        { error: "Kode lacak tidak ditemukan." },
        { status: 404 }
      );
    }
    return NextResponse.json({ submission: naskah });
  } catch (err) {
    console.error(
      "GET /api/jurnal/submissions/[kode] gagal:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { error: "Gagal membaca naskah." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ kode: string }> }
) {
  const dibatasi = await batasiLajuJurnal(req, "panel-ubah-status", {
    perIp: { limit: 60, windowMs: 60 * 1000 }
  });
  if (dibatasi) return dibatasi;

  const { kode: kodeMentah } = await params;
  const kode = normalisasiKodeLacak(kodeMentah);
  if (!kode) return tolakKodeTidakSah(req, kodeMentah);

  const { data: body, terlaluBesar } = await bacaJsonTerbatas(req, 8 * 1024);
  if (terlaluBesar) return responsBadanTerlaluBesar();
  const status = body?.status;
  const catatanMentah = body?.catatan;
  const catatan =
    typeof catatanMentah === "string" && catatanMentah.trim()
      ? catatanMentah.trim()
      : null;
  if (catatan && catatan.length > BATAS_TEKS.catatan) {
    return NextResponse.json(
      {
        error: `Catatan melebihi batas ${BATAS_TEKS.catatan} karakter.`
      },
      { status: 400 }
    );
  }

  if (!isJurnalStatus(status)) {
    return NextResponse.json(
      {
        error: `Status tidak dikenal. Pilihan sah: ${JURNAL_STATUSES.join(", ")}.`
      },
      { status: 400 }
    );
  }

  // Penegakan peran di server pada kedua mode. Peran dan identitas
  // pelaku tidak pernah dibaca dari badan permintaan.
  const mode = await getJurnalDataMode();
  let actor: { userId?: string | null; label?: string | null } | undefined;
  if (mode === "supabase") {
    const auth = await requireJurnalRole(req, JURNAL_STAFF_ROLES);
    if (!auth.ok) return auth.response;
    actor = { userId: auth.userId, label: auth.email };
  } else {
    const emailStaf = sesiLokalStaf(req);
    if (!emailStaf) {
      const emailPemanggil = emailDariHeaderLokal(req);
      await catatPeristiwaKeamanan("peran_ditolak", {
        ip: getClientIp(req),
        email: emailPemanggil,
        kode,
        rincian: emailPemanggil
          ? "patch-status:akun-lokal-bukan-staf"
          : "patch-status:tanpa-sesi"
      });
      return NextResponse.json(
        {
          error: emailPemanggil
            ? "Aksi ini memerlukan akun staf jurnal. Akun penulis tidak dapat mengubah status naskah."
            : "Sesi staf jurnal tidak ditemukan. Silakan masuk lewat panel redaksi."
        },
        { status: emailPemanggil ? 403 : 401 }
      );
    }
    actor = { label: emailStaf };
  }

  try {
    const berjalan = await getSubmission(kode);
    if (!berjalan) {
      return NextResponse.json(
        { error: "Kode lacak tidak ditemukan." },
        { status: 404 }
      );
    }
    if (!transisiStatusSah(berjalan.status, status)) {
      await catatPeristiwaKeamanan("transisi_ditolak", {
        ip: getClientIp(req),
        email: actor?.label ?? null,
        kode,
        rincian: `${berjalan.status} -> ${status}`
      });
      return NextResponse.json(
        {
          error: `Perpindahan status dari "${berjalan.status}" ke "${status}" tidak diizinkan oleh alur editorial.`
        },
        { status: 400 }
      );
    }

    const naskah = await updateSubmissionStatus(kode, status, actor, catatan);
    if (!naskah) {
      return NextResponse.json(
        { error: "Kode lacak tidak ditemukan." },
        { status: 404 }
      );
    }
    return NextResponse.json({ submission: naskah });
  } catch (err) {
    console.error(
      "PATCH /api/jurnal/submissions/[kode] gagal:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { error: "Gagal mengubah status naskah." },
      { status: 500 }
    );
  }
}

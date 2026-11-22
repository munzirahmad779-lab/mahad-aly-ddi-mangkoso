import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "@/lib/rate-limit";
import { setujuiCopyeditingOlehPenulis } from "@/lib/jurnal/alur-server";
import { sesiJurnalDariRequest } from "@/lib/jurnal/sesi-server";
import {
  batasiLajuJurnal,
  catatPeristiwaKeamanan,
  normalisasiKodeLacak
} from "@/lib/jurnal/keamanan";

// Persetujuan penulis atas hasil copyediting (Tahap 4, tahap periksa
// penulis ala OJS). Hanya pemilik naskah yang masuk; kepemilikan
// diperiksa ulang di fasad menurut email sesi.

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ kode: string }> }
) {
  const dibatasi = await batasiLajuJurnal(req, "alur-copy-setujui", {
    perIp: { limit: 30, windowMs: 60 * 60 * 1000 }
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

  const sesi = await sesiJurnalDariRequest(req);
  if (!sesi) {
    return NextResponse.json(
      {
        error:
          "Persetujuan copyediting memerlukan akun penulis. Silakan masuk terlebih dahulu."
      },
      { status: 401 }
    );
  }

  try {
    await setujuiCopyeditingOlehPenulis(kode, sesi.email);
    return NextResponse.json({ success: true });
  } catch (err) {
    const pesan =
      err instanceof Error ? err.message : "Gagal mencatat persetujuan.";
    const status = /tidak ditemukan/i.test(pesan)
      ? 404
      : /bukan milik/i.test(pesan)
        ? 403
        : 400;
    if (status === 403) {
      await catatPeristiwaKeamanan("review_ditolak", {
        ip: getClientIp(req),
        email: sesi.email,
        kode,
        rincian: "copyediting-setujui:bukan-pemilik"
      });
    }
    return NextResponse.json({ error: pesan }, { status });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "@/lib/rate-limit";
import { proofOlehPenulis } from "@/lib/jurnal/alur-server";
import { sesiJurnalDariRequest } from "@/lib/jurnal/sesi-server";
import {
  BATAS_TEKS,
  bacaJsonTerbatas,
  batasiLajuJurnal,
  catatPeristiwaKeamanan,
  normalisasiKodeLacak,
  responsBadanTerlaluBesar
} from "@/lib/jurnal/keamanan";

// Proofreading galley oleh penulis (Tahap 4): menyetujui proof atau
// meminta koreksi dengan catatan wajib. Hanya pemilik naskah yang
// masuk; kepemilikan diperiksa ulang di fasad menurut email sesi.

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ kode: string }> }
) {
  const dibatasi = await batasiLajuJurnal(req, "alur-produksi-proof", {
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
          "Proofread galley memerlukan akun penulis. Silakan masuk terlebih dahulu."
      },
      { status: 401 }
    );
  }

  const { data: body, terlaluBesar } = await bacaJsonTerbatas(req, 8 * 1024);
  if (terlaluBesar) return responsBadanTerlaluBesar();
  const keputusan =
    body?.keputusan === "setujui"
      ? "setujui"
      : body?.keputusan === "koreksi"
        ? "koreksi"
        : null;
  if (!keputusan) {
    return NextResponse.json(
      { error: "Keputusan proof harus 'setujui' atau 'koreksi'." },
      { status: 400 }
    );
  }
  const catatan =
    typeof body?.catatan === "string" && body.catatan.trim()
      ? body.catatan.trim()
      : null;
  if (catatan && catatan.length > BATAS_TEKS.catatan) {
    return NextResponse.json(
      { error: `Catatan melebihi batas ${BATAS_TEKS.catatan} karakter.` },
      { status: 400 }
    );
  }

  try {
    await proofOlehPenulis(kode, { keputusan, catatan }, sesi.email);
    return NextResponse.json({ success: true });
  } catch (err) {
    const pesan =
      err instanceof Error ? err.message : "Gagal mencatat hasil proofread.";
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
        rincian: "produksi-proof:bukan-pemilik"
      });
    }
    return NextResponse.json({ error: pesan }, { status });
  }
}

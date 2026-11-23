import { NextRequest, NextResponse } from "next/server";
import { tetapkanMetadataArtikel } from "@/lib/jurnal/publik5-server";
import { tuntutPeranJurnal } from "@/lib/jurnal/gerbang";
import {
  bacaJsonTerbatas,
  batasiLajuJurnal,
  normalisasiKodeLacak,
  responsBadanTerlaluBesar
} from "@/lib/jurnal/keamanan";

// Metadata artikel terbit (Tahap Penutup Celah): nomor halaman integer
// awal/akhir dan daftar referensi, untuk sitasi dan deposit Crossref.
// Hanya staf editorial (journal_manager atau editor).

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ kode: string }> }
) {
  const dibatasi = await batasiLajuJurnal(req, "artikel-metadata", {
    perIp: { limit: 60, windowMs: 60 * 60 * 1000 }
  });
  if (dibatasi) return dibatasi;
  const gerbang = await tuntutPeranJurnal(req, "artikel-metadata", [
    "journal_manager",
    "editor"
  ]);
  if (!gerbang.ok) return gerbang.response;

  const { kode: kodeMentah } = await params;
  const kode = normalisasiKodeLacak(kodeMentah);
  if (!kode) {
    return NextResponse.json(
      { error: "Kode lacak tidak sah." },
      { status: 400 }
    );
  }

  const { data: body, terlaluBesar } = await bacaJsonTerbatas(req, 32 * 1024);
  if (terlaluBesar) return responsBadanTerlaluBesar();

  const galat = await tetapkanMetadataArtikel(kode, {
    halamanMulai: body?.halamanMulai,
    halamanSelesai: body?.halamanSelesai,
    referensi: body?.referensi
  });
  if (galat) return NextResponse.json({ error: galat }, { status: 400 });
  return NextResponse.json({ ok: true });
}

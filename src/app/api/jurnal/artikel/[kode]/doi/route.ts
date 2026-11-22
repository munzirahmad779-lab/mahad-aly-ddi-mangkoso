import { NextRequest, NextResponse } from "next/server";
import { tetapkanDoiArtikel } from "@/lib/jurnal/publik5-server";
import { tuntutPeranJurnal } from "@/lib/jurnal/gerbang";
import {
  bacaJsonTerbatas,
  batasiLajuJurnal,
  normalisasiKodeLacak,
  responsBadanTerlaluBesar
} from "@/lib/jurnal/keamanan";

// Penetapan DOI per artikel (Tahap 5). Hanya journal_manager. Format
// DOI divalidasi di fasad (pola 10.<registrant>/<suffix>); DOI tampil
// publik sebagai tautan https://doi.org/... penuh. Mengirim DOI kosong
// menghapus DOI tersimpan.

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ kode: string }> }
) {
  const dibatasi = await batasiLajuJurnal(req, "artikel-doi", {
    perIp: { limit: 60, windowMs: 60 * 60 * 1000 }
  });
  if (dibatasi) return dibatasi;
  const gerbang = await tuntutPeranJurnal(req, "artikel-doi", [
    "journal_manager"
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

  const { data: body, terlaluBesar } = await bacaJsonTerbatas(req, 8 * 1024);
  if (terlaluBesar) return responsBadanTerlaluBesar();

  const galat = await tetapkanDoiArtikel(kode, body?.doi ?? null);
  if (galat) return NextResponse.json({ error: galat }, { status: 400 });
  return NextResponse.json({ ok: true });
}

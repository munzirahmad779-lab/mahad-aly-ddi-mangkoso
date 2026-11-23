import { NextRequest, NextResponse } from "next/server";
import { tetapkanStatusDoiArtikel } from "@/lib/jurnal/publik5-server";
import { tuntutPeranJurnal } from "@/lib/jurnal/gerbang";
import {
  bacaJsonTerbatas,
  batasiLajuJurnal,
  normalisasiKodeLacak,
  responsBadanTerlaluBesar
} from "@/lib/jurnal/keamanan";

// Status deposit DOI Crossref per artikel (Tahap Penutup Celah). Hanya
// journal_manager. Depositnya sendiri dilakukan di luar sistem (formulir
// web Crossref atau servlet deposit); rute ini mencatat hasilnya agar
// status DOI aktif dapat dilacak per artikel.

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ kode: string }> }
) {
  const dibatasi = await batasiLajuJurnal(req, "artikel-status-doi", {
    perIp: { limit: 60, windowMs: 60 * 60 * 1000 }
  });
  if (dibatasi) return dibatasi;
  const gerbang = await tuntutPeranJurnal(req, "artikel-status-doi", [
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

  const galat = await tetapkanStatusDoiArtikel(
    kode,
    body?.status,
    body?.idDeposit ?? null
  );
  if (galat) return NextResponse.json({ error: galat }, { status: 400 });
  return NextResponse.json({ ok: true });
}

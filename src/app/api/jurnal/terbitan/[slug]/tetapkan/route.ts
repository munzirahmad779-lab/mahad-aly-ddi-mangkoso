import { NextRequest, NextResponse } from "next/server";
import { tetapkanArtikelKeTerbitan } from "@/lib/jurnal/alur-server";
import { tuntutStafJurnal } from "@/lib/jurnal/gerbang";
import {
  bacaJsonTerbatas,
  batasiLajuJurnal,
  normalisasiKodeLacak,
  responsBadanTerlaluBesar
} from "@/lib/jurnal/keamanan";

// Menetapkan satu artikel berstatus production ke terbitan dengan
// urutan daftar isi (Tahap 4). Hanya peran staf; aturan status
// ditegakkan di fasad.

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const dibatasi = await batasiLajuJurnal(req, "terbitan-tetapkan", {
    perIp: { limit: 60, windowMs: 60 * 1000 }
  });
  if (dibatasi) return dibatasi;

  const gerbang = await tuntutStafJurnal(req, "terbitan-tetapkan");
  if (!gerbang.ok) return gerbang.response;

  const { slug } = await params;
  const { data: body, terlaluBesar } = await bacaJsonTerbatas(req, 8 * 1024);
  if (terlaluBesar) return responsBadanTerlaluBesar();
  const kode = normalisasiKodeLacak(body?.kode);
  if (!kode) {
    return NextResponse.json(
      { error: "Kode lacak artikel tidak sah." },
      { status: 400 }
    );
  }
  const urutan =
    typeof body?.urutan === "number" && Number.isFinite(body.urutan)
      ? Math.max(1, Math.trunc(body.urutan))
      : 1;

  try {
    await tetapkanArtikelKeTerbitan(decodeURIComponent(slug), kode, urutan, {
      userId: gerbang.sesi.userId,
      email: gerbang.sesi.email
    });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    const pesan =
      err instanceof Error ? err.message : "Gagal menetapkan artikel.";
    const status = /tidak ditemukan/i.test(pesan) ? 404 : 400;
    return NextResponse.json({ error: pesan }, { status });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { lepaskanArtikelDariTerbitan } from "@/lib/jurnal/alur-server";
import { tuntutStafJurnal } from "@/lib/jurnal/gerbang";
import {
  bacaJsonTerbatas,
  batasiLajuJurnal,
  normalisasiKodeLacak,
  responsBadanTerlaluBesar
} from "@/lib/jurnal/keamanan";

// Melepas penempatan satu artikel dari terbitan yang belum terbit
// (Tahap 4). Hanya peran staf.

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const dibatasi = await batasiLajuJurnal(req, "terbitan-lepaskan", {
    perIp: { limit: 60, windowMs: 60 * 1000 }
  });
  if (dibatasi) return dibatasi;

  const gerbang = await tuntutStafJurnal(req, "terbitan-lepaskan");
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

  try {
    await lepaskanArtikelDariTerbitan(decodeURIComponent(slug), kode, {
      userId: gerbang.sesi.userId,
      email: gerbang.sesi.email
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    const pesan =
      err instanceof Error ? err.message : "Gagal melepas penempatan artikel.";
    const status = /tidak ditemukan/i.test(pesan) ? 404 : 400;
    return NextResponse.json({ error: pesan }, { status });
  }
}

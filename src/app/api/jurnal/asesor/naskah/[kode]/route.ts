import { NextRequest, NextResponse } from "next/server";
import { rincianNaskahAsesor } from "@/lib/jurnal/asesor";
import { tuntutPeranJurnal } from "@/lib/jurnal/gerbang";
import {
  batasiLajuJurnal,
  normalisasiKodeLacak
} from "@/lib/jurnal/keamanan";

// Rincian proses editorial satu naskah untuk asesor (gerbang M2):
// putaran, penugasan anonim, keputusan, tahap copyediting/produksi,
// dan linimasa status. Tanpa identitas penulis dan reviewer.

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ kode: string }> }
) {
  const dibatasi = await batasiLajuJurnal(req, "asesor-rincian", {
    perIp: { limit: 120, windowMs: 60 * 1000 }
  });
  if (dibatasi) return dibatasi;
  const gerbang = await tuntutPeranJurnal(req, "asesor-rincian", [
    "asesor",
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
  try {
    const rincian = await rincianNaskahAsesor(kode);
    if (!rincian) {
      return NextResponse.json(
        { error: "Naskah tidak ditemukan." },
        { status: 404 }
      );
    }
    return NextResponse.json({ rincian });
  } catch (err) {
    console.error(
      "GET /api/jurnal/asesor/naskah/[kode] gagal:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { error: "Gagal memuat rincian naskah." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { daftarNaskahAsesor } from "@/lib/jurnal/asesor";
import { tuntutPeranJurnal } from "@/lib/jurnal/gerbang";
import { batasiLajuJurnal } from "@/lib/jurnal/keamanan";

// Daftar naskah untuk asesor (Tahap Penutup Celah, gerbang M2).
// Hanya peran asesor dan journal_manager. Objek yang dikembalikan
// dibangun modul asesor dan tidak memuat identitas penulis maupun
// reviewer.

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const dibatasi = await batasiLajuJurnal(req, "asesor-daftar", {
    perIp: { limit: 120, windowMs: 60 * 1000 }
  });
  if (dibatasi) return dibatasi;
  const gerbang = await tuntutPeranJurnal(req, "asesor-daftar", [
    "asesor",
    "journal_manager"
  ]);
  if (!gerbang.ok) return gerbang.response;
  try {
    const naskah = await daftarNaskahAsesor();
    return NextResponse.json({ naskah });
  } catch (err) {
    console.error(
      "GET /api/jurnal/asesor/naskah gagal:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { error: "Gagal memuat daftar naskah." },
      { status: 500 }
    );
  }
}

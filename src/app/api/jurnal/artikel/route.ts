import { NextRequest, NextResponse } from "next/server";
import { daftarArtikelDoiStaf } from "@/lib/jurnal/publik5-server";
import { tuntutPeranJurnal } from "@/lib/jurnal/gerbang";
import { batasiLajuJurnal } from "@/lib/jurnal/keamanan";

// Daftar artikel terbit untuk panel DOI dan penarikan (Tahap 5).
// Hanya journal_manager: DOI dan penarikan adalah wewenang pengelola.

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const dibatasi = await batasiLajuJurnal(req, "artikel-doi-daftar", {
    perIp: { limit: 120, windowMs: 60 * 1000 }
  });
  if (dibatasi) return dibatasi;
  const gerbang = await tuntutPeranJurnal(req, "artikel-doi-daftar", [
    "journal_manager"
  ]);
  if (!gerbang.ok) return gerbang.response;
  try {
    const artikel = await daftarArtikelDoiStaf();
    return NextResponse.json({ artikel });
  } catch (err) {
    console.error(
      "GET /api/jurnal/artikel gagal:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { error: "Gagal memuat daftar artikel." },
      { status: 500 }
    );
  }
}

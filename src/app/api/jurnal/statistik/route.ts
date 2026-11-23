import { NextRequest, NextResponse } from "next/server";
import { ringkasanStatistik } from "@/lib/jurnal/publik5-server";
import { ringkasanStatistikEditorial } from "@/lib/jurnal/statistik-editorial";
import { tuntutStafJurnal } from "@/lib/jurnal/gerbang";
import { batasiLajuJurnal } from "@/lib/jurnal/keamanan";

// Statistik bacaan dan unduhan untuk staf (Tahap 5). Sumbernya tabel
// metrik harian per artikel; tidak ada data pribadi pengunjung yang
// dicatat atau ditampilkan di mana pun pada jalur ini.

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const dibatasi = await batasiLajuJurnal(req, "statistik", {
    perIp: { limit: 120, windowMs: 60 * 1000 }
  });
  if (dibatasi) return dibatasi;
  const gerbang = await tuntutStafJurnal(req, "statistik");
  if (!gerbang.ok) return gerbang.response;
  try {
    const [statistik, editorial] = await Promise.all([
      ringkasanStatistik(),
      ringkasanStatistikEditorial()
    ]);
    return NextResponse.json({ statistik, editorial });
  } catch (err) {
    console.error(
      "GET /api/jurnal/statistik gagal:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { error: "Gagal memuat statistik." },
      { status: 500 }
    );
  }
}

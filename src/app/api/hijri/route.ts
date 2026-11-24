import { NextResponse } from "next/server";
import { getRealtimeHijriDate } from "@/lib/hijri-calendar";

export async function GET() {
  try {
    // Server (Cloudflare) berjalan UTC — tanpa zona eksplisit, tanggal
    // Hijriah meleset 1 hari pada pukul 00.00–08.00 WITA.
    const data = getRealtimeHijriDate(new Date(), "Asia/Makassar");
    return NextResponse.json({
      status: true,
      provider: "Lembaga Falakiyah PBNU / Kemenag MABIMS Realtime",
      data
    });
  } catch (error: any) {
    console.error("Hijri API error:", error);
    return NextResponse.json(
      { status: false, error: "Gagal memuat tanggal Hijriah. Silakan coba lagi." },
      { status: 500 }
    );
  }
}

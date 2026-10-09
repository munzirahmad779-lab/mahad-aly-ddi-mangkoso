import { NextResponse } from "next/server";
import { getRealtimeHijriDate } from "@/lib/hijri-calendar";

export async function GET() {
  try {
    const data = getRealtimeHijriDate(new Date());
    return NextResponse.json({
      status: true,
      provider: "Lembaga Falakiyah PBNU / Kemenag MABIMS Realtime",
      data
    });
  } catch (error: any) {
    return NextResponse.json({ status: false, error: error.message }, { status: 500 });
  }
}

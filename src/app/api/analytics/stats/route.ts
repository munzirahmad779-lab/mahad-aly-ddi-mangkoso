import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data: record, error } = await supabaseAdmin
      .from("site_content")
      .select("value")
      .eq("key", "global_traffic_stats")
      .maybeSingle();

    if (error) {
      console.error("Traffic stats read error:", error);
    }

    const fallbackStats = {
      totalViews: 0,
      uniqueVisitors: 0,
      pages: {},
      daily: {},
      recentVisits: [],
      lastVisit: ""
    };

    const stats = record?.value || fallbackStats;

    // Bersihkan hash internal sebelum dikirim ke client
    const { visitorHashes, ...safeStats } = stats;

    return NextResponse.json(
      {
        success: true,
        stats: safeStats
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0"
        }
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Gagal memuat statistik trafik.",
        stats: { totalViews: 0, uniqueVisitors: 0, pages: {}, daily: {}, recentVisits: [] }
      },
      { status: 500 }
    );
  }
}

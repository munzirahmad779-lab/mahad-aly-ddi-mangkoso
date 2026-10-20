import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireRole } from "@/lib/supabase/admin-guard";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Hanya Super Admin yang berhak mereset statistik trafik
  const auth = await requireRole(req, ["super_admin"]);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const emptyStats = {
      totalViews: 0,
      uniqueVisitors: 0,
      pages: {},
      daily: {},
      visitorHashes: {},
      recentVisits: [],
      lastVisit: new Date().toISOString()
    };

    await supabaseAdmin.from("site_content").upsert(
      {
        key: "global_traffic_stats",
        group_name: "analytics",
        label: "Global Traffic Analytics",
        value: emptyStats,
        updated_at: new Date().toISOString()
      },
      { onConflict: "key" }
    );

    return NextResponse.json({
      success: true,
      message: "Data statistik trafik berhasil direset menjadi 0."
    });
  } catch (err: any) {
    console.error("Reset traffic stats error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

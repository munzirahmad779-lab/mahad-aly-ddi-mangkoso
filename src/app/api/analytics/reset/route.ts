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
    // 1. Kosongkan era tabel (migrasi
    // supabase/migrations/003_traffic_daily.sql). Wajib ikut direset:
    // pembaca menjumlahkan dua era, jadi bila tabel tidak dikosongkan
    // angka era tabel akan muncul lagi sesudah blob direset.
    // Kode PGRST202 berarti fungsi belum terpasang (migrasi belum
    // dijalankan, belum ada era tabel yang perlu dikosongkan), jadi
    // dilewati dengan peringatan; error lain menggagalkan reset.
    const { error: rpcError } = await supabaseAdmin.rpc("reset_traffic_stats");
    if (rpcError) {
      if (rpcError.code === "PGRST202") {
        console.warn(
          "reset_traffic_stats belum terpasang (migrasi 003 belum dijalankan); reset era tabel dilewati."
        );
      } else {
        throw new Error(`Gagal mereset statistik trafik era tabel: ${rpcError.message}`);
      }
    }

    // 2. Kosongkan era blob seperti sebelumnya.
    const emptyStats = {
      totalViews: 0,
      uniqueVisitors: 0,
      pages: {},
      daily: {},
      visitorHashes: {},
      recentVisits: [],
      lastVisit: new Date().toISOString()
    };

    const { error: resetError } = await supabaseAdmin.from("site_content").upsert(
      {
        key: "global_traffic_stats",
        group_name: "analytics",
        label: "Global Traffic Analytics",
        value: emptyStats,
        updated_at: new Date().toISOString()
      },
      { onConflict: "key" }
    );
    if (resetError) {
      throw new Error(`Gagal mereset statistik trafik: ${resetError.message}`);
    }

    return NextResponse.json({
      success: true,
      message: "Data statistik trafik berhasil direset menjadi 0."
    });
  } catch (err: any) {
    console.error("Reset traffic stats error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

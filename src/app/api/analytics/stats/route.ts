import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import {
  EMPTY_TRAFFIC_AGGREGATES,
  mergeTrafficStats,
  normalizeTrafficAggregates,
  type TrafficAggregates
} from "@/lib/analytics/traffic-merge";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Era blob: arsip historis statistik sebelum migrasi 003. Sesudah
    // kode baru deploy blob ini tidak ditulis lagi, hanya dibaca.
    const { data: record, error } = await supabaseAdmin
      .from("site_content")
      .select("value")
      .eq("key", "global_traffic_stats")
      .maybeSingle();

    if (error) {
      console.error("Traffic stats read error:", error);
    }

    // Era tabel: agregat baris harian atomik (migrasi
    // supabase/migrations/003_traffic_daily.sql). Bila fungsi belum
    // terpasang (migrasi belum dijalankan), perlakukan era tabel
    // sebagai kosong dan sajikan era blob saja, jangan gagalkan route.
    let aggregates: TrafficAggregates = EMPTY_TRAFFIC_AGGREGATES;
    const { data: aggData, error: aggError } = await supabaseAdmin.rpc(
      "get_traffic_aggregates"
    );
    if (aggError) {
      console.error(
        "Traffic aggregates read error (migrasi 003 mungkin belum terpasang):",
        aggError.message
      );
    } else {
      aggregates = normalizeTrafficAggregates(aggData);
    }

    // Bentuk respons TIDAK berubah dari sebelum migrasi: panel admin,
    // ViewCount, dan halaman artikel membaca field yang sama.
    // visitorHashes tidak pernah diteruskan: hasil gabung dibangun
    // segar oleh mergeTrafficStats tanpa field itu.
    const safeStats = mergeTrafficStats(record?.value ?? null, aggregates);

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

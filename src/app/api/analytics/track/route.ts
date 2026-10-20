import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const pathname = typeof body.pathname === "string" ? body.pathname : "/";
    const referrer = typeof body.referrer === "string" ? body.referrer : "";

    // Abaikan jika pengunjung membuka halaman admin atau api internal agar tidak merusak statistik pembaca publik
    if (pathname.startsWith("/admin") || pathname.startsWith("/api") || pathname.startsWith("/_next")) {
      return NextResponse.json({ success: true, skipped: true });
    }

    // Ambil IP & User-Agent untuk menghitung pengunjung unik harian secara teranonimkan
    const forwardedFor = req.headers.get("x-forwarded-for") || "";
    const ip = forwardedFor.split(",")[0].trim() || req.headers.get("x-real-ip") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "Unknown";

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const visitorHash = crypto
      .createHash("sha256")
      .update(`${ip}-${userAgent}-${today}`)
      .digest("hex")
      .slice(0, 16);

    // Deteksi tipe perangkat
    const isMobile = /mobile|iphone|android|ipad/i.test(userAgent);
    const device = isMobile ? "Mobile" : "Desktop";

    // 1. Ambil data statistik dari Supabase site_content
    const { data: record } = await supabaseAdmin
      .from("site_content")
      .select("value")
      .eq("key", "global_traffic_stats")
      .maybeSingle();

    const current = record?.value || {
      totalViews: 0,
      uniqueVisitors: 0,
      pages: {},
      daily: {},
      visitorHashes: {},
      recentVisits: [],
      lastVisit: ""
    };

    const totalViews = (current.totalViews || 0) + 1;
    const pages = { ...(current.pages || {}) };
    pages[pathname] = (pages[pathname] || 0) + 1;

    // Daily & Unique Visitor tracking
    const daily = { ...(current.daily || {}) };
    const todayDaily = daily[today] || { views: 0, unique: 0 };
    todayDaily.views = (todayDaily.views || 0) + 1;

    const visitorHashes = { ...(current.visitorHashes || {}) };
    if (!visitorHashes[today]) {
      visitorHashes[today] = [];
    }

    let uniqueVisitors = current.uniqueVisitors || 0;
    if (!visitorHashes[today].includes(visitorHash)) {
      visitorHashes[today].push(visitorHash);
      todayDaily.unique = (todayDaily.unique || 0) + 1;
      uniqueVisitors += 1;
    }
    daily[today] = todayDaily;

    // Pangkas hash pengunjung hari-hari terdahulu agar ukuran data tetap ramping
    const allDays = Object.keys(visitorHashes).sort();
    if (allDays.length > 7) {
      for (let i = 0; i < allDays.length - 7; i++) {
        delete visitorHashes[allDays[i]];
      }
    }

    // Recent visits log (20 terakhir)
    const recent = Array.isArray(current.recentVisits) ? current.recentVisits : [];
    const newRecent = [
      {
        path: pathname,
        device,
        referrer: referrer ? referrer.slice(0, 50) : "Langsung",
        timestamp: new Date().toISOString()
      },
      ...recent
    ].slice(0, 20);

    const updatedStats = {
      totalViews,
      uniqueVisitors,
      pages,
      daily,
      visitorHashes,
      recentVisits: newRecent,
      lastVisit: new Date().toISOString()
    };

    // 2. Simpan kembali ke Supabase
    await supabaseAdmin.from("site_content").upsert(
      {
        key: "global_traffic_stats",
        group_name: "analytics",
        label: "Global Traffic Analytics",
        value: updatedStats,
        updated_at: new Date().toISOString()
      },
      { onConflict: "key" }
    );

    return NextResponse.json({
      success: true,
      totalViews,
      uniqueVisitors
    });
  } catch (err: any) {
    console.error("Traffic tracking error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

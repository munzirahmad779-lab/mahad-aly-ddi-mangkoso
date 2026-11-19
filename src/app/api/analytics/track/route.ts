import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import crypto from "crypto";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// Jalur lama (cadangan): catat kunjungan ke blob global_traffic_stats
// dengan pola baca-ubah-tulis persis seperti sebelum migrasi 003.
// Dipakai HANYA bila rpc record_traffic_visit gagal, yang berarti
// migrasi 003 belum terpasang di basis data; tujuannya agar pencatatan
// tidak pernah berhenti dan tidak pernah ganda (satu kunjungan dicatat
// ke tepat satu jalur). Error tulis blob tetap dibaca dan melempar,
// mengikuti perbaikan sapu error Gerbang 0.
async function catatKeBlobLama(params: {
  pathname: string;
  device: string;
  referrerDisplay: string;
  today: string;
  visitorHash: string;
}): Promise<{ totalViews: number; uniqueVisitors: number }> {
  const { pathname, device, referrerDisplay, today, visitorHash } = params;

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

  const recent = Array.isArray(current.recentVisits) ? current.recentVisits : [];
  const newRecent = [
    {
      path: pathname,
      device,
      referrer: referrerDisplay,
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

  const { error: statsError } = await supabaseAdmin.from("site_content").upsert(
    {
      key: "global_traffic_stats",
      group_name: "analytics",
      label: "Global Traffic Analytics",
      value: updatedStats,
      updated_at: new Date().toISOString()
    },
    { onConflict: "key" }
  );
  if (statsError) {
    throw new Error(`Gagal menyimpan statistik trafik: ${statsError.message}`);
  }

  return { totalViews, uniqueVisitors };
}

export async function POST(req: NextRequest) {
  // Rate limit: telemetri publik, batasi banjir bot
  const rl = checkRateLimit(`track:${getClientIp(req)}`, 120, 60 * 1000);
  if (!rl.allowed) return rateLimitResponse(rl);

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

    const referrerDisplay = referrer ? referrer.slice(0, 50) : "Langsung";

    // 1. Jalur utama: catat ke baris harian atomik lewat
    // rpc record_traffic_visit (migrasi
    // supabase/migrations/003_traffic_daily.sql). Dedup pengunjung,
    // kenaikan views/uniques, dan log kunjungan terbaru berjalan dalam
    // satu transaksi basis data, menggantikan pola baca-ubah-tulis blob
    // yang kehilangan hitungan saat kunjungan bersamaan.
    let totalViews: number;
    let uniqueVisitors: number;

    const { data: recorded, error: recordError } = await supabaseAdmin.rpc(
      "record_traffic_visit",
      {
        p_date: today,
        p_pathname: pathname,
        p_visitor_hash: visitorHash,
        p_device: device,
        p_referrer: referrerDisplay
      }
    );

    if (!recordError && recorded) {
      // rpc mengembalikan total ERA TABEL saja; tampilkan total
      // gabungan dengan menambahkan era blob yang sudah membeku
      // (blob hanya dibaca di sini, tidak ditulis).
      const { data: legacyRecord } = await supabaseAdmin
        .from("site_content")
        .select("value")
        .eq("key", "global_traffic_stats")
        .maybeSingle();
      const legacy = legacyRecord?.value || {};
      const rec = recorded as { totalViews?: number; uniqueVisitors?: number };
      totalViews = (legacy.totalViews || 0) + (rec.totalViews || 0);
      uniqueVisitors = (legacy.uniqueVisitors || 0) + (rec.uniqueVisitors || 0);
    } else {
      // Migrasi 003 belum terpasang atau rpc gagal: jatuh ke jalur blob
      // lama agar pencatatan tidak berhenti. Bukan tulis ganda: tepat
      // satu jalur yang berjalan per kunjungan.
      if (recordError) {
        console.error(
          "record_traffic_visit gagal, memakai jalur blob lama (migrasi 003 mungkin belum terpasang):",
          recordError.message
        );
      }
      const hasil = await catatKeBlobLama({
        pathname,
        device,
        referrerDisplay,
        today,
        visitorHash
      });
      totalViews = hasil.totalViews;
      uniqueVisitors = hasil.uniqueVisitors;
    }

    // 2. Naikkan penghitung views artikel (kolom articles.views) untuk
    // kunjungan halaman artikel, agar panel "Paling banyak dibaca" dan
    // urutan populer membaca angka sungguhan. Kenaikan dilakukan oleh
    // fungsi basis data increment_article_views (migrasi
    // supabase/migrations/002_increment_article_views.sql) sebagai SATU
    // UPDATE atomik di sisi server basis data, menggantikan pola lama
    // select-lalu-update yang kehilangan kenaikan saat bersamaan.
    // PRASYARAT: fungsi itu harus sudah terpasang di Supabase sebelum
    // kode ini di-deploy; bila belum, rpc mengembalikan error dan
    // kenaikan views gagal (tercatat sebagai peringatan di log server),
    // sementara pencatatan statistik utama di atas tidak ikut gagal.
    const cocokArtikel = pathname.match(/^\/artikel\/([^/]+)$/);
    if (cocokArtikel) {
      try {
        const slugArtikel = decodeURIComponent(cocokArtikel[1]);
        const { error: rpcError } = await supabaseAdmin.rpc("increment_article_views", {
          article_slug: slugArtikel
        });
        if (rpcError) {
          console.warn("Increment views artikel gagal:", rpcError.message);
        }
      } catch (e) {
        console.warn("Increment views artikel gagal:", e);
      }
    }

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

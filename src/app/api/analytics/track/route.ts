import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import crypto from "crypto";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// Blob global_traffic_stats adalah ARSIP BEKU era sebelum migrasi 003:
// hanya dibaca, TIDAK PERNAH ditulis lagi. Penulis blob lama
// (catatKeBlobLama, pola baca-ubah-tulis) dihapus permanen pada
// 21 Nov 2026 atas perintah user sesudah pola itu terbukti membuat
// angka tayang artikel berjalan mundur (kasus artikel Nurhayati:
// 55 pada 7 Nov menyusut menjadi sisa 10). Bila rpc atomik gagal,
// kunjungan itu tidak dicatat ke mana pun dan kegagalannya tercatat
// di log server; kehilangan satu catatan lebih aman daripada
// menghidupkan lagi penulis yang bisa menurunkan angka.

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
      // rpc atomik gagal: kunjungan ini TIDAK dicatat ke mana pun.
      // Blob tidak boleh ditulis lagi (lihat catatan arsip beku di
      // atas); total yang dikembalikan adalah total arsip blob apa
      // adanya, hanya dibaca. Kegagalan tercatat di log server.
      console.error(
        "record_traffic_visit gagal, kunjungan tidak dicatat (blob arsip tidak ditulis):",
        recordError ? recordError.message : "rpc tidak mengembalikan data"
      );
      const { data: legacyRecord } = await supabaseAdmin
        .from("site_content")
        .select("value")
        .eq("key", "global_traffic_stats")
        .maybeSingle();
      const legacy = legacyRecord?.value || {};
      totalViews = legacy.totalViews || 0;
      uniqueVisitors = legacy.uniqueVisitors || 0;
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

import { NextRequest, NextResponse } from "next/server";
import { jalankanRekapEmail } from "@/lib/analytics/rekap-email";

// Jalur terjadwal rekap email pagi (perintah user 27 Nov 2026: web
// mengotomatisasi sendiri, menggantikan skrip luar di VM Muse).
// Bukan rute panel: penjaganya rahasia bersama REKAP_CRON_SECRET yang
// dikirim Worker cron Cloudflare sebagai Authorization: Bearer, sama
// seperti rute rekap malam. Tanpa env itu rute menolak semua
// panggilan (gagal tertutup).
//
// Parameter kueri ?uji=1 menyusun rekap dan mengembalikan isinya
// TANPA mengirim email dan tanpa menulis penanda, untuk verifikasi
// sesudah pemasangan.

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const rahasia = process.env.REKAP_CRON_SECRET;
  if (!rahasia) {
    return NextResponse.json(
      { error: "Jalur terjadwal belum dikonfigurasi." },
      { status: 503 }
    );
  }
  const auth = req.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${rahasia}`) {
    return NextResponse.json({ error: "Tidak berwenang." }, { status: 401 });
  }
  const uji = new URL(req.url).searchParams.get("uji") === "1";
  try {
    const hasil = await jalankanRekapEmail(uji);
    return NextResponse.json({ ...hasil, ok: true });
  } catch (err) {
    console.error(
      "POST /api/analytics/internal/rekap-email gagal:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { error: "Gagal menjalankan rekap email." },
      { status: 500 }
    );
  }
}

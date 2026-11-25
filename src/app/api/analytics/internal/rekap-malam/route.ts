import { NextRequest, NextResponse } from "next/server";
import { jalankanRekapMalam } from "@/lib/analytics/rekap-malam";

// Jalur terjadwal rekap bacaan malam (perintah user 26 Nov 2026: web
// mengotomatisasi sendiri rekap bacaan tiap tengah malam, bukan
// pekerjaan luar). Bukan rute panel: penjaganya rahasia bersama
// REKAP_CRON_SECRET yang dikirim Worker cron Cloudflare sebagai
// Authorization: Bearer. Tanpa env itu rute menolak semua panggilan
// (gagal tertutup).

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
  try {
    const hasil = await jalankanRekapMalam();
    return NextResponse.json({ ...hasil, ok: true });
  } catch (err) {
    console.error(
      "POST /api/analytics/internal/rekap-malam gagal:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      {
        error: "Gagal menjalankan rekap malam.",
        // SEMENTARA (diagnosis 26 Nov 2026): pesan galat diteruskan ke
        // pemanggil berahasia supaya penyebab 500 pertama terbaca.
        // Hapus baris detail ini sesudah penyebabnya ditemukan.
        detail: err instanceof Error ? err.message : String(err)
      },
      { status: 500 }
    );
  }
}

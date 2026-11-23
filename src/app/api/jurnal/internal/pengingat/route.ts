import { NextRequest, NextResponse } from "next/server";
import { jalankanPengingatReviewer } from "@/lib/jurnal/review-server";

// Jalur terjadwal pengingat tenggat reviewer (Tahap Penutup Celah).
// Bukan rute panel: penjaganya rahasia bersama JURNAL_CRON_SECRET yang
// dikirim Worker cron Cloudflare sebagai Authorization: Bearer. Tanpa
// env itu rute menolak semua panggilan (gagal tertutup).

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const rahasia = process.env.JURNAL_CRON_SECRET;
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
    const hasil = await jalankanPengingatReviewer();
    return NextResponse.json({ ok: true, terkirim: hasil.terkirim });
  } catch (err) {
    console.error(
      "POST /api/jurnal/internal/pengingat gagal:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { error: "Gagal menjalankan pengingat." },
      { status: 500 }
    );
  }
}

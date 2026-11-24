import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/supabase/admin-guard";
import {
  bacaAksesPublikJurnal,
  tetapkanAksesPublikJurnal,
  type AksesPublikJurnal
} from "@/lib/jurnal/pengaturan";

// Sakelar buka/tutup akses publik jurnal dari panel admin kampus
// (perintah user 25 Nov 2026: tempat semua buka tutup di panel admin
// kampus saja, karena panel jurnal tidak terjangkau dari HP selama
// jurnal tertutup). Hanya Super Admin situs utama. Nilai tetap
// tinggal di tabel jurnal_pengaturan lewat facade pengaturan jurnal
// yang sama dengan kartu di panel jurnal, jadi sumber kebenarannya
// satu dan peristiwa keamanan 'akses_publik_diubah' tetap tercatat.
// Middleware membaca nilai ini dengan cache 30 detik, jadi perubahan
// berlaku dalam waktu kurang dari satu menit tanpa deploy ulang.

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireSuperAdmin(req);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const akses = await bacaAksesPublikJurnal();
    return NextResponse.json(
      { success: true, akses },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache"
        }
      }
    );
  } catch (err) {
    console.error(
      "GET /api/admin/jurnal-akses gagal:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { success: false, error: "Gagal membaca status akses jurnal." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireSuperAdmin(req);
  if (!auth.ok) {
    return auth.response;
  }

  const body = await req.json().catch(() => null);
  const akses = (body as { akses?: unknown } | null)?.akses;
  if (akses !== "terbuka" && akses !== "tertutup") {
    return NextResponse.json(
      { success: false, error: "Nilai akses harus 'terbuka' atau 'tertutup'." },
      { status: 400 }
    );
  }

  try {
    const tersimpan = await tetapkanAksesPublikJurnal(
      akses as AksesPublikJurnal,
      { id: auth.userId, email: auth.email }
    );
    return NextResponse.json({ success: true, akses: tersimpan });
  } catch (err) {
    console.error(
      "PATCH /api/admin/jurnal-akses gagal:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { success: false, error: "Gagal menyimpan status akses jurnal." },
      { status: 500 }
    );
  }
}

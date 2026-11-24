import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireRole } from "@/lib/supabase/admin-guard";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

// Endpoint simpan status naskah: KHUSUS admin yang sedang masuk
// (super_admin / editor). Sebelumnya ArticleContext menulis tabel
// submissions langsung dari peramban memakai klien anon, dan RLS menolak
// UPDATE-nya (permission denied for table submissions), sehingga status
// tidak pernah tersimpan, kode akses Tahap 2 tidak pernah lahir, dan email
// notify tidak pernah terpicu. Penulisan kini lewat klien server
// (service role) di belakang gerbang peran yang sama dengan route notify.
//
// Konsekuensi yang disadari: pemanggil tanpa sesi admin (halaman penulis,
// src/app/penulis/page.tsx, yang juga memakai updateSubmissionStatus)
// menerima 401 di sini, sama seperti yang sudah terjadi pada route notify
// untuk halaman itu.

// Nilai status yang dikenal alur naskah (lihat Submission["status"] di
// src/lib/types.ts, termasuk varian lama "revisi"/"publish"). Daftar yang
// sama dengan route notify.
const VALID_STATUSES = new Set([
  "submitted",
  "review",
  "under_review",
  "revision",
  "revisi",
  "accepted",
  "rejected",
  "published",
  "publish"
]);

export async function POST(req: NextRequest) {
  // Batas laju lebih dulu, sebelum pekerjaan sesi/basis data apa pun.
  // checkRateLimit berbasis memori proses (di Workers tidak berbagi antar
  // isolat), jadi ini lapis sementara, bukan penyelesaian akhir.
  const rl = checkRateLimit(`submission-status:${getClientIp(req)}`, 30, 60 * 1000);
  if (!rl.allowed) return rateLimitResponse(rl);

  // Gerbang sesi admin yang sah di sisi server (pola admin-guard yang sama
  // seperti route notify). Tanpa sesi: 401 sebelum data apa pun ditulis.
  const auth = await requireRole(req, ["super_admin", "editor"]);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const body = await req.json().catch(() => null);
    const { id, status, extraMeta } = (body ?? {}) as {
      id?: unknown;
      status?: unknown;
      extraMeta?: unknown;
    };

    if (typeof id !== "string" || !id || typeof status !== "string" || !status) {
      return NextResponse.json(
        { error: "Parameter 'id' dan 'status' wajib diisi." },
        { status: 400 }
      );
    }
    if (!VALID_STATUSES.has(status)) {
      return NextResponse.json(
        { error: `Status "${status}" tidak dikenal.` },
        { status: 400 }
      );
    }
    if (
      typeof extraMeta !== "object" ||
      extraMeta === null ||
      Array.isArray(extraMeta)
    ) {
      return NextResponse.json(
        { error: "Parameter 'extraMeta' wajib berupa objek metadata naskah." },
        { status: 400 }
      );
    }
    // Batas ukuran metadata: catatan_admin adalah satu kolom teks yang
    // dibaca utuh oleh banyak jalur; metadata raksasa menanam beban dan
    // risiko di semuanya.
    if (JSON.stringify(extraMeta).length > 16 * 1024) {
      return NextResponse.json(
        { error: "Ukuran metadata naskah melebihi batas maksimal 16 KB." },
        { status: 400 }
      );
    }

    // Tulis memakai klien server (service role), BUKAN klien anon: sesudah
    // gerbang peran di atas, penulisan ini tidak lagi bergantung pada
    // lolos/tidaknya RLS untuk kunci publishable. Hasil basis data
    // dikembalikan apa adanya: galat menjadi 500 dengan pesan aslinya, dan
    // nol baris terubah berarti naskah tidak ada (404).
    const { data: updated, error: dbError } = await supabaseAdmin
      .from("submissions")
      .update({
        status,
        catatan_admin: JSON.stringify(extraMeta),
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select("id");

    if (dbError) {
      return NextResponse.json(
        { error: `Status naskah gagal tersimpan di database: ${dbError.message}` },
        { status: 500 }
      );
    }
    if (!updated || updated.length === 0) {
      return NextResponse.json(
        { error: "Naskah tidak ditemukan di database." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Submission status error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

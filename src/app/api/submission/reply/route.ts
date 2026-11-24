import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

// Endpoint balasan penulis: satu-satunya jalur tulis tabel submissions yang
// boleh dipakai penulis TANPA sesi admin. Penulis membuktikan haknya dengan
// kode yang hanya ia miliki (kode pelacakan MAD-... atau kode akses Tahap 2
// MAD2-...); server mencocokkannya dengan kode yang TERSIMPAN di metadata
// catatan_admin naskah yang dituju, pola yang sama dengan route notify:
// kode dari pemanggil tidak pernah dipercaya selain untuk dicocokkan.
//
// Jalur lama halaman penulis memakai updateSubmissionStatus dari
// ArticleContext, yang kini menulis lewat route /api/submission/status
// khusus admin (super_admin/editor). Penulis tidak punya sesi itu, jadi
// balasannya selalu tertolak 401 dan tidak pernah tersimpan.
//
// Batas endpoint ini disengaja sempit:
// - TIDAK menerima status dari body dan TIDAK mengubah status naskah;
//   status ditulis kembali persis seperti yang terbaca dari basis data.
// - TIDAK memicu email apa pun.
// - Yang berubah hanya metadata: satu peristiwa linimasa baru berlabel
//   "Balasan Penulis" ditambahkan, dan feedback (catatan terakhir, pola
//   yang sama seperti updateSubmissionStatus menyusun extraMeta) diisi
//   catatan penulis. Kunci metadata lain tidak disentuh.

const MAX_NOTE_LENGTH = 2000;

// Status peristiwa linimasa mengikuti pemetaan yang sama seperti
// updateSubmissionStatus di ArticleContext: revision/accepted/rejected
// dipertahankan, status lain dicatat sebagai under_review.
function timelineStatusFor(
  currentStatus: string
): "revision" | "accepted" | "rejected" | "under_review" {
  if (currentStatus === "revision") return "revision";
  if (currentStatus === "accepted") return "accepted";
  if (currentStatus === "rejected") return "rejected";
  return "under_review";
}

export async function POST(req: NextRequest) {
  // Batas laju lebih dulu, sebelum pekerjaan basis data apa pun.
  // checkRateLimit berbasis memori proses (di Workers tidak berbagi antar
  // isolat), jadi ini lapis sementara, bukan penyelesaian akhir.
  const rl = checkRateLimit(`submission-reply:${getClientIp(req)}`, 30, 60 * 1000);
  if (!rl.allowed) return rateLimitResponse(rl);

  try {
    const body = await req.json().catch(() => null);
    const { id, code, note } = (body ?? {}) as {
      id?: unknown;
      code?: unknown;
      note?: unknown;
    };

    if (typeof id !== "string" || !id) {
      return NextResponse.json(
        { error: "Parameter 'id' wajib diisi." },
        { status: 400 }
      );
    }
    if (typeof code !== "string" || !code.trim()) {
      return NextResponse.json(
        { error: "Parameter 'code' wajib diisi." },
        { status: 400 }
      );
    }
    if (typeof note !== "string" || !note.trim()) {
      return NextResponse.json(
        { error: "Isi balasan tidak boleh kosong." },
        { status: 400 }
      );
    }
    if (note.length > MAX_NOTE_LENGTH) {
      return NextResponse.json(
        { error: `Isi balasan maksimal ${MAX_NOTE_LENGTH} karakter.` },
        { status: 400 }
      );
    }

    // 1. Baca naskah memakai klien server (service role), BUKAN klien anon:
    // bacaan ini tidak bergantung pada lolos/tidaknya RLS untuk kunci
    // publishable.
    const { data: subData, error: subError } = await supabaseAdmin
      .from("submissions")
      .select("*")
      .eq("id", id)
      .single();

    if (subError || !subData) {
      return NextResponse.json(
        { error: "Naskah tidak ditemukan di database." },
        { status: 404 }
      );
    }

    let extraMeta: any = {};
    if (subData.catatan_admin) {
      try {
        extraMeta = JSON.parse(subData.catatan_admin);
      } catch {
        extraMeta = { feedback: subData.catatan_admin };
      }
    }

    // 2. Verifikasi kode: cocok (tidak peka huruf besar/kecil) dengan kode
    // pelacakan ATAU kode akses Tahap 2 yang tersimpan untuk naskah INI.
    // Pesan galatnya umum dan tidak membocorkan kode mana yang tersimpan.
    const givenCode = code.trim().toUpperCase();
    const codeMatches = [extraMeta.trackingCode, extraMeta.accessCode].some(
      (stored) =>
        typeof stored === "string" && stored.trim().toUpperCase() === givenCode
    );
    if (!codeMatches) {
      return NextResponse.json(
        { error: "Kode tidak cocok untuk naskah ini." },
        { status: 403 }
      );
    }

    // 3. Susun metadata baru dari metadata tersimpan: tambah satu peristiwa
    // linimasa dan perbarui catatan terakhir. Status peristiwa mengikuti
    // status naskah saat ini lewat pemetaan ArticleContext.
    const formattedNote = `[Catatan Penulis]: ${note.trim()}`;
    const existingTimeline = Array.isArray(extraMeta.timeline)
      ? extraMeta.timeline
      : [];
    extraMeta.timeline = [
      ...existingTimeline,
      {
        status: timelineStatusFor(subData.status),
        label: "Balasan Penulis",
        timestamp: new Date().toISOString(),
        notes: formattedNote
      }
    ];
    extraMeta.feedback = formattedNote;

    // 4. Tulis kembali memakai klien server dengan status yang SAMA persis
    // seperti terbaca di langkah 1: endpoint ini tidak dapat menggerakkan
    // status naskah ke mana pun. Galat basis data menjadi 500 dengan pesan
    // generik (rincian hanya di log server; pemanggil endpoint ini tanpa
    // sesi), dan nol baris terubah berarti naskah tidak ada (404).
    const { data: updated, error: dbError } = await supabaseAdmin
      .from("submissions")
      .update({
        status: subData.status,
        catatan_admin: JSON.stringify(extraMeta),
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select("id");

    if (dbError) {
      console.error("Balasan penulis gagal tersimpan:", dbError);
      return NextResponse.json(
        { error: "Balasan gagal tersimpan. Silakan coba lagi." },
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
    console.error("Submission reply error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memproses balasan. Silakan coba lagi." },
      { status: 500 }
    );
  }
}

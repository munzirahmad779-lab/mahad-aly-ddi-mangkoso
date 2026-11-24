import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Rate limit: pelacakan publik, cegah enumerasi kode tracking massal
  const rl = checkRateLimit(`track-sub:${getClientIp(req)}`, 30, 60 * 1000);
  if (!rl.allowed) return rateLimitResponse(rl);

  try {
    const { searchParams } = new URL(req.url);
    const kode = searchParams.get("kode")?.trim().toUpperCase();

    if (!kode) {
      return NextResponse.json(
        { error: "Parameter kode pelacakan (?kode=MAD-YYYY-XXXXXX) wajib disertakan." },
        { status: 400 }
      );
    }

    // Validasi format ketat SEBELUM menyentuh basis data: hanya kode
    // pelacakan utuh MAD-YYYY-XXXXXX (kode lama 4 digit tetap diterima)
    // atau UUID sah yang diterima. Input di
    // luar pola ini (termasuk "%", "_", dan potongan kode) ditolak 400.
    // Ini menutup kebocoran wildcard ilike: sebelumnya kode "%" berfungsi
    // sebagai pola tangkap-semua dan mengembalikan kiriman terbaru.
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(kode);
    const isTrackingCode = /^MAD-\d{4}-(\d{4}|\d{6})$/.test(kode);
    if (!isUuid && !isTrackingCode) {
      return NextResponse.json(
        { error: "Format kode pelacakan tidak valid. Gunakan kode utuh yang Anda terima saat mengirim naskah (contoh: MAD-2026-000001)." },
        { status: 400 }
      );
    }

    // Pertahanan berlapis: loloskan karakter pola LIKE (\, %, _) pada input
    // sebelum masuk ilike, agar input tidak pernah bisa berfungsi sebagai
    // wildcard walaupun pola validasi di atas kelak dilonggarkan.
    const escapeLikePattern = (value: string) => value.replace(/[\\%_]/g, (ch) => `\\${ch}`);
    const safeKode = escapeLikePattern(kode);

    // Query submissions where catatan_admin contains the tracking code or id equals kode (if valid UUID)
    let query = supabaseAdmin.from("submissions").select("*");
    if (isUuid) {
      query = query.or(`catatan_admin.ilike.%${safeKode}%,id.eq.${kode.toLowerCase()}`);
    } else {
      query = query.ilike("catatan_admin", `%${safeKode}%`);
    }

    const { data: rows, error } = await query
      .order("created_at", { ascending: false })
      .limit(1);

    if (error || !rows || rows.length === 0) {
      return NextResponse.json(
        { error: `Naskah dengan kode pelacakan "${kode}" tidak ditemukan di database. Pastikan format kode benar (contoh: MAD-2026-000001).` },
        { status: 404 }
      );
    }

    const row = rows[0];

    // Parse metadata from catatan_admin
    let meta: any = {};
    try {
      if (row.catatan_admin && row.catatan_admin.startsWith("{")) {
        meta = JSON.parse(row.catatan_admin);
      }
    } catch {
      // Metadata rusak tidak diteruskan apa pun ke publik: catatan_admin
      // mentah dapat memuat data pribadi penulis (HP, NIM, kode akses).
      meta = {};
    }

    // Map internal status to standardized timeline status
    let mappedStatus = "submitted";
    if (row.status === "review" || row.status === "under_review") mappedStatus = "under_review";
    else if (row.status === "revisi" || row.status === "revision") mappedStatus = "revision";
    else if (row.status === "approved" || row.status === "accepted") mappedStatus = "accepted";
    else if (row.status === "published") mappedStatus = "published";
    else if (row.status === "rejected") mappedStatus = "rejected";
    else mappedStatus = "submitted";

    // Timeline defaults
    const timeline = meta.timeline || [
      {
        status: "submitted",
        date: row.created_at,
        note: "Naskah berhasil disubmit dan berkas Word telah diteruskan ke email dewan redaksi."
      }
    ];

    return NextResponse.json({
      success: true,
      data: {
        id: row.id,
        trackingCode: meta.trackingCode || kode,
        judul: row.judul,
        nama: row.nama,
        afiliasi: row.afiliasi,
        tipeNaskah: meta.tipeNaskah || "Artikel Ilmiah",
        kategori: meta.kategoriNama || "Fiqh Mu'asarah",
        fileName: meta.fileName || row.file_url?.replace("attachment:", ""),
        fileSize: meta.fileSize || "",
        status: mappedStatus,
        // Hanya feedback terstruktur yang tampil. catatan_admin mentah
        // TIDAK PERNAH menjadi cadangan: isinya metadata internal.
        feedback: meta.feedback || meta.catatanRevisi || "",
        submittedAt: row.created_at,
        updatedAt: row.updated_at,
        timeline: timeline
      }
    });

  } catch (error: any) {
    console.error("Tracking lookup error:", error);
    return NextResponse.json(
      { error: "Gagal memproses pelacakan naskah." },
      { status: 500 }
    );
  }
}

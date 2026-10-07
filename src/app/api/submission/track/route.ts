import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const kode = searchParams.get("kode")?.trim().toUpperCase();

    if (!kode) {
      return NextResponse.json(
        { error: "Parameter kode pelacakan (?kode=MAD-YYYY-XXXX) wajib disertakan." },
        { status: 400 }
      );
    }

    // Query submissions where catatan_admin contains the tracking code or id equals kode (if valid UUID)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(kode);
    let query = supabaseAdmin.from("submissions").select("*");
    if (isUuid) {
      query = query.or(`catatan_admin.ilike.%${kode}%,id.eq.${kode.toLowerCase()}`);
    } else {
      query = query.ilike("catatan_admin", `%${kode}%`);
    }

    const { data: rows, error } = await query
      .order("created_at", { ascending: false })
      .limit(1);

    if (error || !rows || rows.length === 0) {
      return NextResponse.json(
        { error: `Naskah dengan kode pelacakan "${kode}" tidak ditemukan di database. Pastikan format kode benar (contoh: MAD-2026-0001).` },
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
      meta = { feedback: row.catatan_admin };
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
        feedback: meta.feedback || meta.catatanRevisi || row.catatan_admin,
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

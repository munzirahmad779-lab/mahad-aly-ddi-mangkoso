import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { sendSubmissionEmailToAdmin, sendConfirmationEmailToAuthor } from "@/lib/email/service";

export const dynamic = "force-dynamic";

// Allowed MIME types and extensions for Word documents
const ALLOWED_EXTENSIONS = [".doc", ".docx"];
const ALLOWED_MIME_TYPES = [
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/octet-stream", // Fallback for some OS/browser uploads
];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const nama = (formData.get("nama") as string)?.trim();
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const hp = (formData.get("hp") as string)?.trim() || "";
    const afiliasi = (formData.get("afiliasi") as string)?.trim() || "-";
    const tipeNaskah = (formData.get("tipeNaskah") as string)?.trim() || "Artikel Ilmiah";
    const kategori = (formData.get("kategori") as string)?.trim() || "Fiqh Mu'asarah";
    const kategoriId = (formData.get("kategoriId") as string)?.trim() || null;
    const judul = (formData.get("judul") as string)?.trim();
    const abstrak = (formData.get("abstrak") as string)?.trim();
    const keyword = (formData.get("keyword") as string)?.trim();
    const originalitas = formData.get("originalitas");
    const file = formData.get("file") as File | null;

    // 1. Validasi Keberadaan Field Wajib
    if (!nama || !email || !judul || !abstrak || !keyword || !file) {
      return NextResponse.json(
        { error: "Semua kolom bertanda bintang (*) dan berkas naskah wajib diisi." },
        { status: 400 }
      );
    }

    if (!originalitas || originalitas === "false") {
      return NextResponse.json(
        { error: "Anda wajib mencentang pernyataan keaslian/originalitas naskah." },
        { status: 400 }
      );
    }

    // 2. Validasi Format Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Format alamat email tidak valid. Mohon periksa kembali email Anda." },
        { status: 400 }
      );
    }

    // 3. Validasi Judul (Maks 200 karakter)
    if (judul.length > 200) {
      return NextResponse.json(
        { error: `Judul naskah terlalu panjang (${judul.length} karakter). Maksimal 200 karakter.` },
        { status: 400 }
      );
    }

    // 4. Validasi Abstrak (Min 200 karakter, Maks 2000 karakter)
    if (abstrak.length < 200) {
      return NextResponse.json(
        { error: `Abstrak terlalu singkat (${abstrak.length} karakter). Minimal 200 karakter (sekitar 200-300 kata).` },
        { status: 400 }
      );
    }
    if (abstrak.length > 2000) {
      return NextResponse.json(
        { error: `Abstrak melebihi batas maksimal (${abstrak.length} karakter). Maksimal 2000 karakter.` },
        { status: 400 }
      );
    }

    // 5. Validasi Kata Kunci (3 - 5 kata, dipisah koma)
    const keywordsList = keyword.split(",").map((k) => k.trim()).filter(Boolean);
    if (keywordsList.length < 3 || keywordsList.length > 5) {
      return NextResponse.json(
        { error: `Kata kunci harus berjumlah antara 3 hingga 5 kata/frasa (saat ini: ${keywordsList.length}). Pisahkan dengan koma (,).` },
        { status: 400 }
      );
    }

    // 6. Validasi Berkas Word (.doc / .docx saja, Maks 10 MB)
    const fileName = file.name.toLowerCase();
    const hasValidExt = ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext));
    if (!hasValidExt) {
      return NextResponse.json(
        { error: "Format file tidak didukung! File naskah HANYA boleh berupa dokumen Microsoft Word (.doc atau .docx)." },
        { status: 400 }
      );
    }

    const maxSizeBytes = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        { error: `Ukuran file (${(file.size / (1024 * 1024)).toFixed(1)} MB) melebihi batas maksimal 10 MB. Silakan kurangi ukuran dokumen.` },
        { status: 400 }
      );
    }

    // 7. Rate Limiting: Maksimal 3 submission per email per hari
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const { data: recentSubmissions, error: countErr } = await supabaseAdmin
        .from("submissions")
        .select("id, created_at")
        .eq("email", email)
        .gte("created_at", startOfDay.toISOString());

      if (!countErr && recentSubmissions && recentSubmissions.length >= 3) {
        return NextResponse.json(
          { error: "Batas pengiriman harian tercapai! Maksimal 3 naskah per alamat email per hari untuk mencegah spam." },
          { status: 429 }
        );
      }
    } catch (e) {
      console.warn("Rate limit check notice:", e);
    }

    // 8. Generate Kode Tracking Unik (Format: MAD-YYYY-XXXX)
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const trackingCode = `MAD-${year}-${randomSuffix}`;

    // 9. Persiapan Data Berkas untuk Attachment Email
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    const fileSizeStr = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    // 10. Ambil Email Templates Kustom dari Database (jika ada)
    let customTemplates: any[] | undefined = undefined;
    try {
      const { data: tmplData } = await supabaseAdmin
        .from("site_content")
        .select("value")
        .eq("key", "email_templates")
        .single();
      if (tmplData?.value && Array.isArray(tmplData.value)) {
        customTemplates = tmplData.value;
      }
    } catch (e) {
      // Ignore fallback
    }

    // 11. Kirim Email Langsung ke Admin dengan Lampiran File Word
    const adminEmailResult = await sendSubmissionEmailToAdmin({
      submission: {
        trackingCode,
        nama,
        email,
        hp,
        afiliasi,
        tipeNaskah,
        kategori,
        judul,
        abstrak,
        keywords: keywordsList.join(", "),
        fileSizeStr
      },
      fileBuffer,
      fileName: file.name,
      customTemplates
    });

    // 12. Kirim Email Konfirmasi ke Author
    const authorEmailResult = await sendConfirmationEmailToAuthor({
      authorEmail: email,
      authorName: nama,
      title: judul,
      trackingCode,
      customTemplates
    });

    // 13. Simpan Metadata ke Tabel Submissions di Database
    const timelineNote = adminEmailResult.success
      ? `Naskah '${judul}' berhasil diterima sistem dan berkas Word telah diteruskan ke email Dewan Redaksi.`
      : `Naskah '${judul}' berhasil diterima dan tersimpan di sistem. Pengiriman email ke redaksi: ${adminEmailResult.error || "Gagal"}.`;

    const metadataPayload = {
      trackingCode,
      tipeNaskah,
      hp,
      fileName: file.name,
      fileSize: fileSizeStr,
      kategoriNama: kategori,
      adminEmailSent: adminEmailResult.success,
      adminEmailError: adminEmailResult.success ? null : adminEmailResult.error,
      authorEmailSent: authorEmailResult.success,
      authorEmailError: authorEmailResult.success ? null : authorEmailResult.error,
      timeline: [
        {
          status: "submitted",
          date: new Date().toISOString(),
          note: timelineNote
        }
      ]
    };

    const insertRecord: any = {
      nama,
      email,
      afiliasi,
      judul,
      abstrak,
      keyword: keywordsList.join(", "),
      file_url: `attachment:${file.name} (${fileSizeStr})`,
      status: "pending",
      catatan_admin: JSON.stringify(metadataPayload)
    };

    // Validasi UUID kategori_id
    const isValidUuid = (val?: string | null) =>
      Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));

    if (isValidUuid(kategoriId)) {
      insertRecord.kategori_id = kategoriId;
    }

    const { data: savedData, error: dbErr } = await supabaseAdmin
      .from("submissions")
      .insert(insertRecord)
      .select()
      .single();

    if (dbErr) {
      console.error("Gagal menyimpan metadata submission ke DB:", dbErr);
      return NextResponse.json(
        { error: "Pencatatan naskah ke database gagal: " + dbErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      trackingCode,
      adminEmailSent: adminEmailResult.success,
      adminEmailError: adminEmailResult.success ? null : adminEmailResult.error,
      authorEmailSent: authorEmailResult.success,
      authorEmailError: authorEmailResult.success ? null : authorEmailResult.error,
      message: adminEmailResult.success
        ? "Naskah berhasil terkirim langsung ke email dewan redaksi!"
        : "Naskah berhasil disimpan di sistem, namun pengiriman email otomatis terkendala konfigurasi server.",
      submission: {
        id: savedData.id,
        trackingCode,
        nama,
        email,
        judul,
        status: "submitted",
        createdAt: savedData.created_at
      }
    });

  } catch (error: any) {
    console.error("Submission error:", error);
    return NextResponse.json(
      { error: error?.message || "Terjadi kesalahan sistem saat memproses pengiriman naskah." },
      { status: 500 }
    );
  }
}

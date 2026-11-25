import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { sendSubmissionEmailToAdmin, sendConfirmationEmailToAuthor } from "@/lib/email/service";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// Allowed MIME types and extensions for manuscripts & thesis documents
const ALLOWED_EXTENSIONS = [".doc", ".docx", ".pdf"];
const ALLOWED_MIME_TYPES = [
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/pdf",
  "application/octet-stream", // Fallback for some OS/browser uploads
];

export async function POST(req: NextRequest) {
  // Rate limit: form publik, cegah spam submission bot
  const rl = await checkRateLimit(`submit:${getClientIp(req)}`, 5, 10 * 60 * 1000);
  if (!rl.allowed) return rateLimitResponse(rl);

  try {
    const formData = await req.formData();

    const nama = (formData.get("nama") as string)?.trim();
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const hp = (formData.get("hp") as string)?.trim() || "";
    const afiliasi = (formData.get("afiliasi") as string)?.trim() || "-";
    const tipeNaskah = (formData.get("tipeNaskah") as string)?.trim() || "Artikel Ilmiah";
    const kategori = (formData.get("kategori") as string)?.trim() || "Fiqh Mu'asarah";
    const kategoriId = (formData.get("kategoriId") as string)?.trim() || null;
    // Usulan kategori baru dari pilihan "Lain-lain" di formulir Kirim Tulisan.
    const kategoriUsulan = (formData.get("kategoriUsulan") as string)?.trim() || "";
    const isUsulanKategori = Boolean(kategoriUsulan);
    // Bentuk tampilan kategori yang disimpan & dikirim ke admin: selalu
    // berpenanda jelas bila berasal dari usulan Lain-lain.
    const kategoriFinal = isUsulanKategori
      ? kategori.toLowerCase().startsWith("lain-lain") && !kategori.includes(kategoriUsulan)
        ? `Lain-lain (Usulan kategori baru: ${kategoriUsulan})`
        : kategori
      : kategori;
    const judul = (formData.get("judul") as string)?.trim();
    const abstrak = (formData.get("abstrak") as string)?.trim();
    const keyword = (formData.get("keyword") as string)?.trim();
    const originalitas = formData.get("originalitas");
    const file = formData.get("file") as File | null;

    // Field Tambahan Khusus Skripsi Alumni / Mahasantri
    const nim = (formData.get("nim") as string)?.trim() || "";
    const angkatan = (formData.get("angkatan") as string)?.trim() || "";
    const thesisYear = (formData.get("year") as string)?.trim() || "";
    const advisor1 = (formData.get("advisor1") as string)?.trim() || "";
    const advisor2 = (formData.get("advisor2") as string)?.trim() || "";
    const driveUrl = (formData.get("driveUrl") as string)?.trim() || "";

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

    // Kategori Lain-lain wajib disertai nama kategori usulannya.
    if (kategori.toLowerCase().startsWith("lain-lain") && !kategoriUsulan) {
      return NextResponse.json(
        { error: "Anda memilih kategori Lain-lain. Nama kategori usulan wajib diisi." },
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

    // 6. Validasi Berkas Word / PDF (.doc, .docx, .pdf, Maks 10 MB)
    const fileName = file.name.toLowerCase();
    const hasValidExt = ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext));
    if (!hasValidExt) {
      return NextResponse.json(
        { error: "Format file tidak didukung! File naskah/skripsi harus berupa dokumen Microsoft Word (.doc, .docx) atau PDF (.pdf)." },
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

    // 6b. Tegakkan daftar MIME yang dinyatakan di kepala berkas ini.
    // Selama ini ALLOWED_MIME_TYPES hanya dinyatakan tanpa pernah
    // diperiksa. Bila browser melaporkan tipe berkas dan tipe itu di
    // luar daftar, berkas ditolak. Bila browser tidak melaporkan tipe
    // (string kosong), pemeriksaan isi pada langkah 6c yang memutuskan.
    const declaredMime = (file.type || "").trim().toLowerCase();
    if (declaredMime && !ALLOWED_MIME_TYPES.includes(declaredMime)) {
      return NextResponse.json(
        { error: "Tipe berkas tidak didukung! File naskah/skripsi harus berupa dokumen Microsoft Word (.doc, .docx) atau PDF (.pdf)." },
        { status: 400 }
      );
    }

    // 6c. Periksa isi berkas dari magic bytes, bukan hanya nama dan
    // ekstensinya, supaya berkas lain yang diganti nama ekstensinya
    // menjadi .pdf, .doc, atau .docx tidak ikut lolos.
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const head = fileBuffer.subarray(0, 8);
    const isPdf = fileBuffer.subarray(0, 5).toString("latin1") === "%PDF-";
    const isOleDoc = head.equals(
      Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])
    );
    const isZipPackage =
      head[0] === 0x50 &&
      head[1] === 0x4b &&
      ((head[2] === 0x03 && head[3] === 0x04) ||
        (head[2] === 0x05 && head[3] === 0x06) ||
        (head[2] === 0x07 && head[3] === 0x08));
    // DOCX adalah paket ZIP OOXML: di dalam arsipnya selalu ada entri
    // [Content_Types].xml dan folder word/. Nama entri tersimpan apa
    // adanya pada arsip, jadi keduanya bisa dicari pada isi berkas.
    const isDocx =
      isZipPackage &&
      fileBuffer.includes("[Content_Types].xml") &&
      fileBuffer.includes("word/");

    let contentMatches = false;
    let expectedFormatLabel = "";
    if (fileName.endsWith(".pdf")) {
      contentMatches = isPdf;
      expectedFormatLabel = "PDF (.pdf)";
    } else if (fileName.endsWith(".docx")) {
      contentMatches = isDocx;
      expectedFormatLabel = "Microsoft Word (.docx)";
    } else if (fileName.endsWith(".doc")) {
      contentMatches = isOleDoc;
      expectedFormatLabel = "Microsoft Word (.doc)";
    }

    if (!contentMatches) {
      return NextResponse.json(
        { error: `Isi berkas tidak cocok dengan format ${expectedFormatLabel}. Pastikan berkas yang diunggah benar-benar berformat ${expectedFormatLabel}, bukan berkas lain yang diganti nama ekstensinya.` },
        { status: 400 }
      );
    }

    // 7. Rate Limiting: Maksimal 3 submission per email per hari.
    // Gagal-tertutup: bila kueri hitung galat, pengiriman ditolak dengan
    // 500 generik, BUKAN melewatkan pemeriksaan (perilaku lama gagal-terbuka).
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const { data: recentSubmissions, error: countErr } = await supabaseAdmin
      .from("submissions")
      .select("id, created_at")
      .eq("email", email)
      .gte("created_at", startOfDay.toISOString());

    if (countErr) {
      console.error("Gagal memeriksa batas harian submission:", countErr);
      return NextResponse.json(
        { error: "Terjadi kesalahan sistem saat memeriksa batas pengiriman. Silakan coba lagi." },
        { status: 500 }
      );
    }

    if (recentSubmissions && recentSubmissions.length >= 3) {
      return NextResponse.json(
        { error: "Batas pengiriman harian tercapai! Maksimal 3 naskah per alamat email per hari untuk mencegah spam." },
        { status: 429 }
      );
    }

    // 8. Generate Kode Tracking Unik (Format: MAD-YYYY-XXXXXX, 6 digit;
    // perintah user 25 Nov 2026 menggantikan format lama 4 digit).
    // Keunikan diperiksa ke basis data dengan pola pencarian yang sama
    // seperti route lacak, dan kode digambar ulang bila bertabrakan,
    // supaya naskah lama tidak tertutup naskah baru yang berkode sama.
    const currentYear = new Date().getFullYear();
    let trackingCode = "";
    for (let percobaan = 0; percobaan < 10; percobaan++) {
      const randomSuffix = Math.floor(100000 + Math.random() * 900000);
      const kandidat = `MAD-${currentYear}-${randomSuffix}`;
      const { data: sudahAda } = await supabaseAdmin
        .from("submissions")
        .select("id")
        .ilike("catatan_admin", `%${kandidat}%`)
        .limit(1);
      if (!sudahAda || sudahAda.length === 0) {
        trackingCode = kandidat;
        break;
      }
    }
    if (!trackingCode) {
      return NextResponse.json(
        { error: "Gagal membuat kode pelacakan unik. Silakan coba lagi." },
        { status: 500 }
      );
    }

    // 9. Persiapan Data Berkas untuk Attachment Email
    // Buffer berkas sudah dibaca satu kali pada pemeriksaan isi langkah 6c.
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

    // 11. Simpan Metadata ke Tabel Submissions di Database DULU.
    // Urutan dibalik dari perilaku lama (email dulu, simpan kemudian):
    // bila simpan gagal, TIDAK ADA email yang terkirim, jadi tidak ada
    // kode lacak yatim di tangan penulis dan redaksi tidak menerima
    // naskah yang tidak tercatat. Status email pada metadata diisi
    // sesudah pengiriman pada langkah 14.
    const metadataPayload = {
      trackingCode,
      tipeNaskah,
      hp,
      nim,
      angkatan,
      year: thesisYear || currentYear.toString(),
      advisor1,
      advisor2,
      driveUrl,
      fileName: file.name,
      fileSize: fileSizeStr,
      kategoriNama: kategoriFinal,
      kategoriUsulan: kategoriUsulan || null,
      isUsulanKategori,
      adminEmailSent: false,
      adminEmailError: null as string | null,
      authorEmailSent: false,
      authorEmailError: null as string | null,
      timeline: [
        {
          status: "submitted",
          date: new Date().toISOString(),
          note: `Naskah '${judul}' berhasil diterima dan tersimpan di sistem.`
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
      status: "review",
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
        { error: "Pencatatan naskah ke database gagal. Silakan coba lagi." },
        { status: 500 }
      );
    }

    // 12. Kirim Email Langsung ke Admin dengan Lampiran File Word
    const adminEmailResult = await sendSubmissionEmailToAdmin({
      submission: {
        trackingCode,
        nama,
        email,
        hp,
        afiliasi,
        tipeNaskah,
        kategori: kategoriFinal,
        judul,
        abstrak,
        keywords: keywordsList.join(", "),
        fileSizeStr
      },
      fileBuffer,
      fileName: file.name,
      customTemplates
    });
    if (!adminEmailResult.success) {
      console.error("Email submission ke admin gagal:", adminEmailResult.error);
    }

    // 13. Kirim Email Konfirmasi ke Author
    const authorEmailResult = await sendConfirmationEmailToAuthor({
      authorEmail: email,
      authorName: nama,
      title: judul,
      trackingCode,
      customTemplates
    });
    if (!authorEmailResult.success) {
      console.error("Email konfirmasi ke penulis gagal:", authorEmailResult.error);
    }

    // 14. Perbarui metadata tersimpan dengan hasil pengiriman email.
    // Kegagalan pembaruan ini hanya tercatat di log server: naskah sudah
    // tersimpan dan email sudah terkirim, jadi pengiriman penulis tidak
    // boleh digagalkan olehnya.
    const timelineNote = adminEmailResult.success
      ? `Naskah '${judul}' berhasil diterima sistem dan berkas Word telah diteruskan ke email Dewan Redaksi.`
      : `Naskah '${judul}' berhasil diterima dan tersimpan di sistem. Pengiriman email ke redaksi terkendala.`;

    const finalMetadata = {
      ...metadataPayload,
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

    const { error: metaErr } = await supabaseAdmin
      .from("submissions")
      .update({ catatan_admin: JSON.stringify(finalMetadata) })
      .eq("id", savedData.id);
    if (metaErr) {
      console.error("Gagal memperbarui metadata hasil email submission:", metaErr);
    }

    // Respons publik TIDAK memuat pesan galat internal layanan email
    // atau basis data; rinciannya cukup di log server.
    return NextResponse.json({
      success: true,
      trackingCode,
      adminEmailSent: adminEmailResult.success,
      adminEmailError: null,
      authorEmailSent: authorEmailResult.success,
      authorEmailError: null,
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
      { error: "Terjadi kesalahan sistem saat memproses pengiriman naskah. Silakan coba lagi." },
      { status: 500 }
    );
  }
}

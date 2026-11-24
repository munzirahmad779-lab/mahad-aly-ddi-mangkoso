import { NextRequest, NextResponse } from "next/server";
import { r2Client, r2BucketName, r2PublicUrl, r2Endpoint, isR2Configured } from "@/lib/r2/client";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireRole } from "@/lib/supabase/admin-guard";

export const dynamic = "force-dynamic";

// Allowed MIME types (SVG dilarang untuk keamanan demi mencegah XSS tersimpan)
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];

// Folder yang diizinkan untuk penyimpanan file
const ALLOWED_FOLDERS = [
  "logo",
  "masyayikh",
  "sarana",
  "artikel",
  "berita",
  "galeri",
  "pmb",
  "skripsi-cover",
  "skripsi",
  "donasi",
  "dema",
  "umum"
];

export async function POST(req: NextRequest) {
  try {
    // 0. Autentikasi Pengguna: Harus admin (super_admin, editor, atau penulis)
    const auth = await requireRole(req, ["super_admin", "editor", "penulis"]);
    if (!auth.ok) {
      return auth.response;
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const requestedFolder = ((formData.get("folder") as string) || "umum").trim();
    // Utamakan UUID userId dari guard: kolom uploaded_by diuji
    // isValidUuid saat simpan, dan email selalu gagal uji itu sehingga
    // jejak pengunggah selalu kosong pada perilaku lama.
    const uploadedBy = auth.userId || auth.email;

    if (!file) {
      return NextResponse.json(
        { error: "Tidak ada file yang diunggah." },
        { status: 400 }
      );
    }

    // Validasi folder: Harus sesuai allowlist, pola [a-z0-9-], dan tolak path traversal
    if (
      !ALLOWED_FOLDERS.includes(requestedFolder) ||
      !/^[a-z0-9-]+$/.test(requestedFolder) ||
      requestedFolder.includes("..") ||
      requestedFolder.startsWith("/")
    ) {
      return NextResponse.json(
        { error: `Folder tujuan "${requestedFolder}" tidak diizinkan.` },
        { status: 400 }
      );
    }
    const folder = requestedFolder;

    // 1. Validasi Tipe File (Tolak SVG dan format liar)
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Format file "${file.type || "tidak dikenal"}" tidak didukung demi keamanan sistem.` },
        { status: 400 }
      );
    }

    // 2. Validasi Ukuran (Gambar maks 5 MB, PDF maks 10 MB)
    const isPdf = file.type === "application/pdf";
    const maxSizeBytes = (isPdf ? 10 : 5) * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        {
          error: `Ukuran file (${(file.size / (1024 * 1024)).toFixed(1)} MB) melebihi batas maksimal ${isPdf ? 10 : 5} MB.`,
        },
        { status: 400 }
      );
    }

    // 3. Generate Clean & Unique Key
    const fileExt = file.name.split(".").pop()?.toLowerCase() || (isPdf ? "pdf" : "png");
    const cleanBase = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9]/g, "-")
      .toLowerCase()
      .slice(0, 30);
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const sanitizedFileName = `${cleanBase}-${uniqueSuffix}.${fileExt}`;
    const key = `${folder}/${sanitizedFileName}`;

    const arrayBuffer = await file.arrayBuffer();
    let publicUrl = "";
    let storageProvider = "r2";

    // 4. Upload ke Cloudflare R2 jika kredensial R2 dikonfigurasi
    if (isR2Configured && r2Client && r2Endpoint) {
      try {
        const cleanEndpoint = r2Endpoint.replace(/\/+$/, "");
        const uploadUrl = `${cleanEndpoint}/${r2BucketName}/${key}`;

        const r2Res = await r2Client.fetch(uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": file.type || "application/octet-stream",
          },
          body: arrayBuffer,
        });

        if (r2Res.ok) {
          const cleanBaseUrl = (r2PublicUrl || "").replace(/\/+$/, "");
          publicUrl = cleanBaseUrl ? `${cleanBaseUrl}/${key}` : `/${key}`;
          storageProvider = "cloudflare-r2";
        } else {
          console.warn("R2 upload status not OK:", r2Res.status);
        }
      } catch (r2Err) {
        console.warn("R2 upload notice (falling back to Supabase):", r2Err);
      }
    }

    // 5. Fallback ke Supabase Storage (media bucket) jika R2 belum dikonfigurasi atau terkendala
    if (!publicUrl) {
      try {
        const { data: supaData, error: supaErr } = await supabaseAdmin.storage
          .from("media")
          .upload(key, arrayBuffer, {
            contentType: file.type || "application/octet-stream",
            upsert: true,
          });

        if (supaErr) {
          throw new Error(`Supabase Storage upload error: ${supaErr.message}`);
        }

        const { data: urlData } = supabaseAdmin.storage
          .from("media")
          .getPublicUrl(key);

        publicUrl = urlData.publicUrl;
        storageProvider = "supabase-storage";
      } catch (fallbackErr: any) {
        throw new Error(
          fallbackErr?.message || "Gagal mengunggah berkas ke R2 maupun Supabase Storage."
        );
      }
    }

    // 6. Simpan Metadata ke Supabase DB 'media' table
    let mediaRecord = null;
    try {
      const isValidUuid = (val?: string) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val || "");

      const { data, error: dbError } = await supabaseAdmin
        .from("media")
        .insert({
          filename: file.name,
          url: publicUrl,
          mime_type: file.type,
          size_kb: Math.round(file.size / 1024),
          uploaded_by: isValidUuid(uploadedBy) ? uploadedBy : null,
        })
        .select()
        .single();

      if (!dbError && data) {
        mediaRecord = data;
      } else if (dbError) {
        // Pencatatan metadata gagal: berkasnya sendiri sudah terunggah,
        // jadi kegagalan ini terlihat di log server, bukan ditelan.
        console.warn("Notice: DB logging media gagal:", dbError.message);
      }
    } catch (dbErr) {
      console.warn("Notice: DB logging exception:", dbErr);
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      key: key,
      filename: file.name,
      size_kb: Math.round(file.size / 1024),
      mime_type: file.type,
      storageProvider,
      mediaRecord,
    });
  } catch (err: any) {
    console.error("Upload Error:", err);
    return NextResponse.json(
      { error: err?.message || "Gagal mengunggah file." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // 0. Autentikasi Pengguna: Hanya editor dan super_admin yang berwenang menghapus file
    const auth = await requireRole(req, ["super_admin", "editor"]);
    if (!auth.ok) {
      return auth.response;
    }

    const { url, id, key: directKey } = await req.json();

    let key = directKey;
    if (!key && url) {
      const cleanBaseUrl = (r2PublicUrl || "").replace(/\/+$/, "");
      if (cleanBaseUrl && url.startsWith(cleanBaseUrl)) {
        key = url.slice(cleanBaseUrl.length).replace(/^\/+/, "");
      } else {
        try {
          const parsed = new URL(url);
          key = parsed.pathname.replace(/^\/+/, "");
          if (key.includes("object/public/media/")) {
            key = key.split("object/public/media/")[1];
          }
        } catch {
          key = url.replace(/^\/+/, "");
        }
      }
    }

    // Validasi key yang akan dihapus: wajib diawali folder yang diizinkan dan tidak boleh traversal
    if (key) {
      const topFolder = key.split("/")[0];
      if (
        !ALLOWED_FOLDERS.includes(topFolder) ||
        key.includes("..") ||
        key.startsWith("/")
      ) {
        return NextResponse.json(
          { error: "Akses penghapusan kunci file di luar folder terdaftar ditolak." },
          { status: 403 }
        );
      }
    }

    // Tanpa penunjuk berkas apa pun tidak ada yang dapat dihapus: jawab
    // 400, bukan sukses kosong (perilaku lama menyesatkan admin).
    if (!id && !url && !key) {
      return NextResponse.json(
        { error: "Parameter 'id', 'url', atau 'key' wajib disertakan untuk menghapus berkas." },
        { status: 400 }
      );
    }

    // 1. Hapus dari Cloudflare R2. Status HTTP penghapusan diperiksa dan
    // kegagalannya dilaporkan jujur dengan menghentikan proses, kecuali
    // 404: objek memang tidak ada di R2 (berkas jalur fallback hanya
    // tersimpan di Supabase Storage dan dihapus pada langkah 2).
    if (key && isR2Configured && r2Client && r2Endpoint) {
      try {
        const cleanEndpoint = r2Endpoint.replace(/\/+$/, "");
        const deleteUrl = `${cleanEndpoint}/${r2BucketName}/${key}`;
        const r2DelRes = await r2Client.fetch(deleteUrl, { method: "DELETE" });
        if (!r2DelRes.ok && r2DelRes.status !== 404) {
          console.error("R2 delete gagal dengan status:", r2DelRes.status);
          return NextResponse.json(
            { error: `Gagal menghapus berkas dari penyimpanan R2 (status ${r2DelRes.status}).` },
            { status: 500 }
          );
        }
      } catch (r2Err) {
        console.error("R2 delete error:", r2Err);
        return NextResponse.json(
          { error: "Gagal menghapus berkas dari penyimpanan R2." },
          { status: 500 }
        );
      }
    }

    // 2. Hapus dari Supabase Storage
    if (key) {
      try {
        const { error: removeErr } = await supabaseAdmin.storage.from("media").remove([key]);
        if (removeErr) {
          console.warn("Supabase Storage remove gagal:", removeErr.message);
        }
      } catch (supaErr) {
        console.warn("Supabase Storage remove notice:", supaErr);
      }
    }

    // 3. Hapus catatan database. Error WAJIB dibaca: tanpa ini route
    // menjawab sukses padahal baris media masih ada di basis data.
    let dbDeleteError: { message: string } | null = null;
    if (id) {
      const { error } = await supabaseAdmin.from("media").delete().eq("id", id);
      dbDeleteError = error;
    } else if (url) {
      const { error } = await supabaseAdmin.from("media").delete().eq("url", url);
      dbDeleteError = error;
    }
    if (dbDeleteError) {
      console.error("Gagal menghapus catatan media:", dbDeleteError);
      return NextResponse.json(
        { error: `Gagal menghapus catatan media dari database: ${dbDeleteError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Berkas berhasil dihapus.",
    });
  } catch (err: any) {
    console.error("Delete Error:", err);
    return NextResponse.json(
      { error: err?.message || "Gagal menghapus file." },
      { status: 500 }
    );
  }
}

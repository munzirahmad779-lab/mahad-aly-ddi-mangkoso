import { NextRequest, NextResponse } from "next/server";
import { r2Client, r2BucketName, r2PublicUrl, r2Endpoint, isR2Configured } from "@/lib/r2/client";
import { supabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/gif",
  "application/pdf",
];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "umum";
    const uploadedBy = (formData.get("uploadedBy") as string) || "admin";

    if (!file) {
      return NextResponse.json(
        { error: "Tidak ada file yang diunggah." },
        { status: 400 }
      );
    }

    // 1. Validasi Tipe File
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Format file "${file.type || "tidak dikenal"}" tidak didukung.` },
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

    // 1. Hapus dari Cloudflare R2
    if (key && isR2Configured && r2Client && r2Endpoint) {
      try {
        const cleanEndpoint = r2Endpoint.replace(/\/+$/, "");
        const deleteUrl = `${cleanEndpoint}/${r2BucketName}/${key}`;
        await r2Client.fetch(deleteUrl, { method: "DELETE" });
      } catch (r2Err) {
        console.warn("R2 delete notice:", r2Err);
      }
    }

    // 2. Hapus dari Supabase Storage
    if (key) {
      try {
        await supabaseAdmin.storage.from("media").remove([key]);
      } catch (supaErr) {
        console.warn("Supabase Storage remove notice:", supaErr);
      }
    }

    // 3. Hapus catatan database
    if (id) {
      await supabaseAdmin.from("media").delete().eq("id", id);
    } else if (url) {
      await supabaseAdmin.from("media").delete().eq("url", url);
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

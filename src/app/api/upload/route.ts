import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, r2BucketName, r2PublicUrl } from "@/lib/r2/client";
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

    // 4. Convert File to Buffer & Upload to Cloudflare R2
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await r2Client.send(
      new PutObjectCommand({
        Bucket: r2BucketName,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      })
    );

    // 5. Construct Public URL
    const cleanBaseUrl = (r2PublicUrl || "").replace(/\/+$/, "");
    const publicUrl = cleanBaseUrl ? `${cleanBaseUrl}/${key}` : `/${key}`;

    // 6. Save Metadata to Supabase DB via Service Role (Bypassing RLS)
    let mediaRecord = null;
    try {
      const { data, error: dbError } = await supabaseAdmin
        .from("media")
        .insert({
          filename: file.name,
          url: publicUrl,
          mime_type: file.type,
          size_kb: Math.round(file.size / 1024),
          uploaded_by: uploadedBy,
        })
        .select()
        .single();

      if (!dbError) {
        mediaRecord = data;
      } else {
        console.warn("Notice: Gagal mencatat media ke database log:", dbError.message);
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
      mediaRecord: mediaRecord,
    });
  } catch (err: any) {
    console.error("R2 Upload Error:", err);
    return NextResponse.json(
      { error: err?.message || "Gagal mengunggah file ke Cloudflare R2." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { url, id, key: directKey } = await req.json();

    let key = directKey;
    if (!key && url) {
      // Extract key from full public URL
      const cleanBaseUrl = (r2PublicUrl || "").replace(/\/+$/, "");
      if (cleanBaseUrl && url.startsWith(cleanBaseUrl)) {
        key = url.slice(cleanBaseUrl.length).replace(/^\/+/, "");
      } else {
        // Fallback: take pathname after domain
        try {
          const parsed = new URL(url);
          key = parsed.pathname.replace(/^\/+/, "");
        } catch {
          key = url.replace(/^\/+/, "");
        }
      }
    }

    // 1. Delete from Cloudflare R2
    if (key) {
      try {
        await r2Client.send(
          new DeleteObjectCommand({
            Bucket: r2BucketName,
            Key: key,
          })
        );
      } catch (r2Err) {
        console.warn("R2 Delete notice:", r2Err);
      }
    }

    // 2. Delete from Supabase Database via Service Role
    if (id) {
      await supabaseAdmin.from("media").delete().eq("id", id);
    } else if (url) {
      await supabaseAdmin.from("media").delete().eq("url", url);
    }

    return NextResponse.json({
      success: true,
      message: "Berkas berhasil dihapus dari Cloudflare R2 dan database.",
    });
  } catch (err: any) {
    console.error("R2 Delete Error:", err);
    return NextResponse.json(
      { error: err?.message || "Gagal menghapus file." },
      { status: 500 }
    );
  }
}

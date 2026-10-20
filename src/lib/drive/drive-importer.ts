import { r2Client, r2BucketName, r2PublicUrl, r2Endpoint, isR2Configured } from "@/lib/r2/client";
import { supabaseAdmin } from "@/lib/supabase/server";

/**
 * Ekstraksi Google Drive File ID dari berbagai format tautan Google Drive
 */
export function extractGoogleDriveId(url: string): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();

  // Pola 1: https://drive.google.com/file/d/1A2B3C.../view
  const matchFile = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]{15,})/);
  if (matchFile) return matchFile[1];

  // Pola 2: https://drive.google.com/open?id=1A2B3C... atau uc?id=1A2B3C...
  const matchIdParam = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{15,})/);
  if (matchIdParam) return matchIdParam[1];

  // Pola 3: https://lh3.googleusercontent.com/d/1A2B3C...
  const matchLh3 = trimmed.match(/\/d\/([a-zA-Z0-9_-]{15,})/);
  if (matchLh3) return matchLh3[1];

  // Pola 4: ID mentah (jika user hanya memasukkan ID sepanjang 25+ karakter alphanumeric)
  if (/^[a-zA-Z0-9_-]{25,50}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Unduh gambar publik dari Google Drive dan simpan ke Cloudflare R2
 */
export async function transferGoogleDriveImageToR2(
  driveUrlOrId: string,
  targetFolder: string = "masyayikh",
  customBaseName?: string
): Promise<{ success: boolean; url: string; fileId: string; provider: string; error?: string }> {
  const fileId = extractGoogleDriveId(driveUrlOrId);
  if (!fileId) {
    return {
      success: false,
      url: "",
      fileId: "",
      provider: "none",
      error: "Tautan Google Drive tidak valid atau ID file tidak ditemukan."
    };
  }

  // Sumber URL unduh Google Drive
  const downloadSources = [
    `https://lh3.googleusercontent.com/d/${fileId}`,
    `https://drive.google.com/uc?export=download&id=${fileId}`
  ];

  let imageBuffer: ArrayBuffer | null = null;
  let mimeType = "image/jpeg";

  for (const src of downloadSources) {
    try {
      const res = await fetch(src, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
      });

      if (res.ok) {
        const cType = res.headers.get("content-type") || "";
        if (!cType.includes("html") && !cType.includes("text/plain")) {
          const buf = await res.arrayBuffer();
          if (buf.byteLength > 200) {
            imageBuffer = buf;
            mimeType = cType || "image/jpeg";
            break;
          }
        }
      }
    } catch (err) {
      console.warn("Gagal mengunduh gambar dari sumber Drive:", src, err);
    }
  }

  // Jika unduhan direct stream belum berhasil (misal butuh izin sharing), fallback ke Google CDN URL langsung
  if (!imageBuffer) {
    return {
      success: true,
      url: `https://lh3.googleusercontent.com/d/${fileId}`,
      fileId,
      provider: "google-direct-cdn",
      error: "Gambar langsung dihubungkan via Google CDN (Pastikan link sharing diset 'Siapa saja yang memiliki link')."
    };
  }

  // Ekstensi file
  const ext = mimeType.includes("png")
    ? "png"
    : mimeType.includes("webp")
    ? "webp"
    : mimeType.includes("gif")
    ? "gif"
    : "jpg";

  const sanitizedBase = (customBaseName || "drive")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .slice(0, 30);
  const key = `${targetFolder}/${sanitizedBase}-${Date.now().toString(36)}.${ext}`;

  // 1. Upload ke Cloudflare R2
  if (isR2Configured && r2Client && r2Endpoint) {
    try {
      const cleanEndpoint = r2Endpoint.replace(/\/+$/, "");
      const uploadUrl = `${cleanEndpoint}/${r2BucketName}/${key}`;

      const r2Res = await r2Client.fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": mimeType
        },
        body: imageBuffer
      });

      if (r2Res.ok) {
        const cleanBaseUrl = (r2PublicUrl || "").replace(/\/+$/, "");
        const publicUrl = cleanBaseUrl ? `${cleanBaseUrl}/${key}` : `/${key}`;
        return {
          success: true,
          url: publicUrl,
          fileId,
          provider: "cloudflare-r2"
        };
      }
    } catch (r2Err) {
      console.warn("Upload R2 gagal, mencoba fallback Supabase:", r2Err);
    }
  }

  // 2. Fallback ke Supabase Storage
  try {
    const { error: supaErr } = await supabaseAdmin.storage
      .from("media")
      .upload(key, imageBuffer, {
        contentType: mimeType,
        upsert: true
      });

    if (!supaErr) {
      const { data: pubData } = supabaseAdmin.storage.from("media").getPublicUrl(key);
      if (pubData?.publicUrl) {
        return {
          success: true,
          url: pubData.publicUrl,
          fileId,
          provider: "supabase-storage"
        };
      }
    }
  } catch (supaErr) {
    console.warn("Upload Supabase storage gagal:", supaErr);
  }

  // 3. Fallback terakhir: Google Direct Image CDN
  return {
    success: true,
    url: `https://lh3.googleusercontent.com/d/${fileId}`,
    fileId,
    provider: "google-direct-cdn"
  };
}

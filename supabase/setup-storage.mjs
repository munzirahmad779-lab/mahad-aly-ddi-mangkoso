import fs from "fs";
import { createClient } from "@supabase/supabase-js";

// Read env variables
const env = {};
if (fs.existsSync(".env.local")) {
  const lines = fs.readFileSync(".env.local", "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, "");
      }
    }
  }
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing SUPABASE credentials in .env.local");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function setupStorage() {
  console.log("=== SETUP SUPABASE STORAGE BUCKET 'media' ===");

  // 1. List existing buckets
  const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
  if (listError) {
    console.error("Gagal list buckets:", listError.message);
    return;
  }

  const mediaBucket = buckets.find((b) => b.name === "media");

  if (!mediaBucket) {
    console.log("Membuat bucket public 'media'...");
    const { data, error } = await supabaseAdmin.storage.createBucket("media", {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/gif", "application/pdf"]
    });

    if (error) {
      console.error("Gagal membuat bucket:", error.message);
    } else {
      console.log("✅ Bucket public 'media' berhasil dibuat!");
    }
  } else {
    console.log("✅ Bucket 'media' sudah ada. Memperbarui konfigurasi public...");
    await supabaseAdmin.storage.updateBucket("media", {
      public: true,
      fileSizeLimit: 10485760,
      allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/gif", "application/pdf"]
    });
    console.log("✅ Bucket 'media' siap digunakan.");
  }
}

setupStorage();

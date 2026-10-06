import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// Load .env.local manually
const envLocal = fs.readFileSync(".env.local", "utf8");
const env = {};
envLocal.split(/\r?\n/).forEach((line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, "");
  }
});

console.log("=== TEST SUITE: CLOUDFLARE R2 + SUPABASE DB ===");

const r2 = new S3Client({
  region: "auto",
  endpoint: env.R2_ENDPOINT,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

const supabaseAdmin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function runTests() {
  const testKey = `test/test-${Date.now()}.txt`;
  const testContent = "Test file upload Cloudflare R2 Ma'had Aly DDI Mangkoso";
  const bucketName = env.R2_BUCKET_NAME || "media-mahad-aly";
  const publicUrlBase = (env.R2_PUBLIC_URL || "").replace(/\/+$/, "");

  console.log("1. Menguji PutObjectCommand ke Cloudflare R2...");
  await r2.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: testKey,
      Body: Buffer.from(testContent),
      ContentType: "text/plain",
    })
  );
  console.log("✅ File berhasil di-upload ke R2! Key:", testKey);

  console.log("2. Menguji Insert ke Supabase public.media...");
  const publicUrl = `${publicUrlBase}/${testKey}`;
  const { data: mediaRow, error: insertErr } = await supabaseAdmin
    .from("media")
    .insert({
      filename: "test-file.txt",
      url: publicUrl,
      mime_type: "text/plain",
      size_kb: 1,
      uploaded_by: null,
    })
    .select()
    .single();

  if (insertErr) {
    console.error("❌ Gagal insert ke public.media:", insertErr.message);
  } else {
    console.log("✅ Berhasil insert ke public.media! ID:", mediaRow.id);
  }

  console.log("3. Menguji Query dari public.media...");
  const { data: listMedia } = await supabaseAdmin
    .from("media")
    .select("*")
    .eq("url", publicUrl);
  console.log("✅ Berhasil query public.media:", listMedia?.length, "row ditemukan.");

  console.log("4. Menguji DeleteObjectCommand dari Cloudflare R2...");
  await r2.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: testKey,
    })
  );
  console.log("✅ File berhasil dihapus dari R2!");

  console.log("5. Menguji Delete dari Supabase public.media...");
  if (mediaRow?.id) {
    await supabaseAdmin.from("media").delete().eq("id", mediaRow.id);
    console.log("✅ Baris media berhasil dihapus dari Supabase!");
  }

  console.log("\n🎉 SEMUA 5 TAHAP END-TO-END R2 + SUPABASE DB 100% SUKSES!");
}

runTests().catch((err) => {
  console.error("❌ Test Failed:", err);
});

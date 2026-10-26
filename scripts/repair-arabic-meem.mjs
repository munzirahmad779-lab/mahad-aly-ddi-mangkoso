// Kit perbaikan data: huruf Arab م (U+0645) yang rusak tersimpan di
// site_content sebagai pasangan karakter U+FFFD + U+0085 (sisa dekode
// UTF-8 yang keliru di masa lalu). Pola itu TIDAK pernah muncul pada
// teks yang sehat, jadi penggantian berikut aman dan bedahnya sempit:
// hanya baris yang mengandung pola itu yang disentuh, dan hanya pola
// itu yang diganti — tidak ada isi lain yang berubah.
//
// CARA PAKAI (jalankan dari laptop/repo user, BUKAN otomatis):
//   1) Dry-run (default, hanya membaca & melaporkan):
//        SUPABASE_SERVICE_ROLE_KEY=... node scripts/repair-arabic-meem.mjs
//      (dry-run juga bisa dengan anon/publishable key untuk sekadar cek)
//   2) Terapkan perbaikan:
//        SUPABASE_SERVICE_ROLE_KEY=... node scripts/repair-arabic-meem.mjs --apply
//   Script menolak --apply tanpa service role key (RLS akan menolak
//   penulisan anon, dan itu memang disengaja).
//
// Sesudah --apply, script mencetak hash sebelum/sesudah per kunci agar
// bisa diverifikasi bahwa hanya pola rusak yang berubah.

import { createHash } from "node:crypto";

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ymxijorgoucpsxgcvtgu.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const READ_KEY = SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_8Y6NE0t_5z4Jo2u3G50bbQ_e1qTTOB-";
const APPLY = process.argv.includes("--apply");
const BROKEN = "\uFFFD\u0085";
const FIXED = "م";

const hash = (o) => createHash("sha256").update(JSON.stringify(o)).digest("hex").slice(0, 16);
const countBroken = (v) => (JSON.stringify(v).match(/\uFFFD\u0085/g) || []).length;

async function readAll() {
  const res = await fetch(`${URL_BASE}/rest/v1/site_content?select=key,value&order=key`, {
    headers: { apikey: READ_KEY, Authorization: `Bearer ${READ_KEY}` }
  });
  if (!res.ok) throw new Error(`Gagal membaca site_content: HTTP ${res.status}`);
  return res.json();
}

const rows = await readAll();
const affected = rows.filter((r) => countBroken(r.value) > 0);
console.log(`Total baris site_content: ${rows.length}`);
console.log(`Baris mengandung pola rusak: ${affected.length}`);
for (const r of affected) {
  console.log(`  - ${r.key}: ${countBroken(r.value)} kemunculan | hash sebelum ${hash(r.value)}`);
}
if (affected.length === 0) {
  console.log("Tidak ada yang perlu diperbaiki.");
  process.exit(0);
}
if (!APPLY) {
  console.log("\nDRY-RUN: tidak ada data yang diubah. Tambahkan --apply (dengan SUPABASE_SERVICE_ROLE_KEY) untuk menerapkan.");
  process.exit(0);
}
if (!SERVICE_KEY) {
  console.error("\nDITOLAK: --apply wajib SUPABASE_SERVICE_ROLE_KEY (penulisan anon ditolak RLS).");
  process.exit(1);
}

for (const r of affected) {
  const fixedValue = JSON.parse(JSON.stringify(r.value).split(BROKEN).join(FIXED));
  if (countBroken(fixedValue) !== 0) throw new Error(`Verifikasi lokal gagal untuk ${r.key}`);
  const res = await fetch(`${URL_BASE}/rest/v1/site_content?key=eq.${encodeURIComponent(r.key)}`, {
    method: "PATCH",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation"
    },
    body: JSON.stringify({ value: fixedValue })
  });
  if (!res.ok) throw new Error(`PATCH ${r.key} gagal: HTTP ${res.status} ${await res.text()}`);
  console.log(`  ✓ ${r.key}: hash sesudah ${hash(fixedValue)}`);
}
const after = await readAll();
const still = after.filter((r) => countBroken(r.value) > 0);
console.log(`\nSelesai. Sisa baris rusak: ${still.length}. Total baris tetap ${after.length}.`);

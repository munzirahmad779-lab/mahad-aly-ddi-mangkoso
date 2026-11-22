/**
 * Uji jalur pengguna jurnal Tahap 2 (OJS versi kita) lewat peramban asli:
 * daftar akun penulis -> masuk -> wizard kirim 6 langkah dengan berkas
 * uji kecil -> kode lacak terbit -> naskah tampil di panel staf ->
 * halaman Naskah Saya memuatnya. Berjalan melawan server hasil build
 * (bawaan http://localhost:3100) pada mode data lokal.
 *
 * Chromium Playwright lokal + SwiftShader (sesuai catatan VM).
 */
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

const require = createRequire("/tmp/pw2/package.json");
const { chromium } = require("playwright-core");

const BASE = process.env.TEST_BASE || "http://localhost:3100";
const SHOT_DIR = path.resolve(process.cwd(), "scratch/screenshots");
fs.mkdirSync(SHOT_DIR, { recursive: true });

let pass = 0;
let fail = 0;
function check(name, ok, detail = "") {
  if (ok) {
    pass += 1;
    console.log(`  ok   ${name}`);
  } else {
    fail += 1;
    console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

const STAMP = Date.now().toString().slice(-6);
const EMAIL = `penulis.uji.tahap2.${STAMP}@contoh.ac.id`;
const PASSWORD = "UjiTahap2-2026";
// Akun staf uji panel (Tahap Keamanan). Server uji harus dijalankan
// dengan JURNAL_LOCAL_STAFF_EMAILS berisi email ini.
const STAFF_EMAIL = process.env.TEST_STAFF_EMAIL || "staf.uji@contoh.ac.id";
const STAFF_PASSWORD = "StafUji2026x";
const NAMA = "Penulis Uji Tahap Dua";
const JUDUL =
  "Uji Peramban Tahap 2: Kedudukan Maslahah dalam Penetapan Hukum Muamalah";

// Berkas uji kecil: PDF minimal yang sah secara awalan.
const PDF_PATH = path.resolve(process.cwd(), "scratch/berkas-uji-tahap2.pdf");
fs.writeFileSync(
  PDF_PATH,
  Buffer.from(
    "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n",
    "utf8"
  )
);

const browser = await chromium.launch({
  executablePath:
    process.env.HOME +
    "/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome",
  args: [
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--no-sandbox"
  ]
});

async function buka(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page
    .waitForLoadState("networkidle", { timeout: 12000 })
    .catch(() => {});
}

try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 }
  });

  // 1. Daftar akun penulis dengan persetujuan eksplisit.
  await buka(page, `${BASE}/jurnal/daftar`);
  await page.fill("#nama", NAMA);
  await page.fill("#email", EMAIL);
  await page.fill("#password", PASSWORD);
  await page.fill("#afiliasi", "Tim Uji Peramban Tahap Dua");
  await page.check("#persetujuan");
  await page.screenshot({ path: path.join(SHOT_DIR, "tahap2-daftar.png") });
  await page.locator('section button[type="submit"]').first().click();
  await page.waitForSelector("text=Pendaftaran berhasil", { timeout: 30000 });
  check("pendaftaran akun penulis berhasil", true);

  // 2. Masuk penulis -> diarahkan ke Naskah Saya.
  await buka(page, `${BASE}/jurnal/masuk`);
  await page.fill("#email", EMAIL);
  await page.fill("#password", PASSWORD);
  await page.locator('section button[type="submit"]').first().click();
  await page.waitForURL("**/jurnal/naskah-saya", { timeout: 30000 });
  await page.waitForSelector("text=Naskah Saya", { timeout: 30000 });
  // Tunggu daftar selesai dimuat (bukan sekadar judul halaman tampil).
  await page.waitForSelector("text=belum memiliki naskah", {
    timeout: 30000
  });
  const teksAwal = await page.locator("section").first().innerText();
  check(
    "masuk penulis sampai di Naskah Saya (masih kosong)",
    teksAwal.includes(EMAIL) && teksAwal.includes("belum memiliki naskah"),
    teksAwal.slice(0, 200)
  );
  await page.screenshot({
    path: path.join(SHOT_DIR, "tahap2-naskah-saya-kosong.png")
  });

  // 3. Wizard langkah 1: pilih bagian kedua + centang 6 butir.
  await buka(page, `${BASE}/jurnal/kirim`);
  await page.check("#bagian-kajian-pustaka-turats");
  for (const kunci of [
    "orisinalitas",
    "belum_terbit",
    "abstrak_dua_bahasa",
    "gaya_chicago",
    "pernyataan_ai",
    "pustaka_terverifikasi"
  ]) {
    await page.check(`#periksa-${kunci}`);
  }
  await page.screenshot({
    path: path.join(SHOT_DIR, "tahap2-wizard-langkah1.png")
  });
  await page.getByRole("button", { name: "Lanjut" }).click();

  // 4. Langkah 2: metadata.
  await page.fill("#judul", JUDUL);
  await page.fill(
    "#abstrak-id",
    "Abstrak uji peramban tahap dua untuk memastikan wizard kirim bertahap, unggah berkas uji lokal, dan pernyataan AI bekerja dari ujung ke ujung."
  );
  await page.fill(
    "#abstrak-en",
    "Stage two browser test abstract to verify the staged submission wizard end to end."
  );
  await page.fill("#kata-kunci", "maslahah, ushul fiqh, muamalah");
  await page.getByRole("button", { name: "Lanjut" }).click();

  // 5. Langkah 3: penulis utama + satu pendamping.
  await page.fill("#utama-nama", NAMA);
  await page.fill("#utama-afiliasi", "Tim Uji Peramban Tahap Dua");
  await page
    .getByRole("button", { name: "Tambah Penulis Pendamping" })
    .click();
  await page.fill("#pendamping-0-nama", "Pendamping Uji Tahap Dua");
  await page.fill("#pendamping-0-email", "pendamping.uji@contoh.ac.id");
  await page.fill("#pendamping-0-afiliasi", "Lembaga Pendamping Uji");
  await page.getByRole("button", { name: "Lanjut" }).click();

  // 6. Langkah 4: unggah berkas utama PDF kecil.
  await page.setInputFiles("#berkas-utama", PDF_PATH);
  await page.waitForSelector("text=Terunggah (uji lokal)", {
    timeout: 30000
  });
  check("berkas utama terunggah lewat jalur uji lokal", true);
  await page.screenshot({
    path: path.join(SHOT_DIR, "tahap2-wizard-unggah.png")
  });
  await page.getByRole("button", { name: "Lanjut" }).click();

  // 7. Langkah 5: pernyataan AI "memakai" dengan penjelasan.
  await page.check("#ai-memakai");
  await page.fill(
    "#ai-teks",
    "Memakai ChatGPT untuk memeriksa ejaan abstrak; argumen dan referensi disusun penulis."
  );
  await page.getByRole("button", { name: "Lanjut" }).click();

  // 8. Langkah 6: tinjau lalu kirim.
  const teksTinjau = await page.locator("section").first().innerText();
  check(
    "tinjauan memuat judul, bagian, dan pernyataan AI",
    teksTinjau.includes(JUDUL) &&
      teksTinjau.includes("Kajian Pustaka dan Turats") &&
      teksTinjau.includes("memakai AI"),
    teksTinjau.slice(0, 200)
  );
  await page.screenshot({
    path: path.join(SHOT_DIR, "tahap2-wizard-tinjau.png")
  });
  await page.getByRole("button", { name: "Kirim Naskah" }).click();
  await page.waitForSelector("text=Naskah berhasil dikirim", {
    timeout: 30000
  });
  const teksHasil = await page.locator("section").first().innerText();
  const cocok = teksHasil.match(/JRN-\d{4}-\d{4}/);
  check("wizard menghasilkan kode lacak", !!cocok, teksHasil.slice(0, 160));
  const kode = cocok?.[0];
  check(
    "status awal Terkirim (Submission)",
    teksHasil.includes("Terkirim (Submission)")
  );

  // 9. Naskah Saya kini memuat naskah dengan linimasa (sesi penulis
  // masih aktif; langkah panel sesudah ini mengganti sesi ke staf).
  await buka(page, `${BASE}/jurnal/naskah-saya`);
  await page.waitForSelector(`text=${kode}`, { timeout: 30000 });
  const teksSaya = await page.locator("section").first().innerText();
  check(
    "Naskah Saya memuat naskah penulis sendiri",
    teksSaya.includes(JUDUL) && teksSaya.includes("Terkirim (Submission)"),
    teksSaya.slice(0, 200)
  );
  await page.screenshot({
    path: path.join(SHOT_DIR, "tahap2-naskah-saya.png")
  });

  // 10. Panel staf (Tahap Keamanan: panel mewajibkan masuk akun staf
  // uji; email staf dari env TEST_STAFF_EMAIL dan server dijalankan
  // dengan JURNAL_LOCAL_STAFF_EMAILS berisi email yang sama). Daftar
  // akun staf, lalu masuk lewat formulir panel.
  await buka(page, `${BASE}/jurnal/daftar`);
  await page.fill("#nama", "Staf Uji Panel");
  await page.fill("#email", STAFF_EMAIL);
  await page.fill("#password", STAFF_PASSWORD);
  await page.fill("#afiliasi", "Tim Uji Staf");
  await page.check("#persetujuan");
  await page.locator('section button[type="submit"]').first().click();
  // Pada jalan ulang, akun staf mungkin sudah terdaftar dari jalan
  // sebelumnya; kedua keadaan diterima, bukti akhirnya adalah masuk
  // panel di langkah berikut.
  await page
    .waitForSelector("text=Pendaftaran berhasil", { timeout: 15000 })
    .catch(() => {});
  const teksDaftarStaf = await page.locator("section").first().innerText();
  check(
    "pendaftaran akun staf uji berhasil atau sudah terdaftar",
    teksDaftarStaf.includes("Pendaftaran berhasil") ||
      teksDaftarStaf.includes("sudah terdaftar"),
    teksDaftarStaf.slice(0, 200)
  );

  await buka(page, `${BASE}/jurnal/panel`);
  await page.fill("#email-panel", STAFF_EMAIL);
  await page.fill("#password-panel", STAFF_PASSWORD);
  await page.locator('section button[type="submit"]').first().click();
  await page.waitForSelector(`text=${kode}`, { timeout: 30000 });
  const teksPanel = await page.locator("section").first().innerText();
  check(
    "panel staf menampilkan naskah wizard",
    teksPanel.includes(JUDUL) && teksPanel.includes("Kajian Pustaka dan Turats"),
    teksPanel.slice(0, 200)
  );
  await page.screenshot({ path: path.join(SHOT_DIR, "tahap2-panel.png") });

  console.log(`\nHASIL: ${pass} lulus, ${fail} gagal. Kode uji: ${kode}`);
  process.exitCode = fail > 0 ? 1 : 0;
} finally {
  await browser.close();
}

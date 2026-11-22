/**
 * Uji jalur pengguna jurnal Tahap 1 (OJS versi kita) lewat peramban asli:
 * kirim naskah -> lacak status awal -> panel mengubah tahap ->
 * lacak menunjukkan tahap baru. Berjalan melawan server hasil build
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

const JUDUL =
  "Uji Peramban Tahap 1: Kedudukan Wakaf dalam Fiqh Muamalah Kontemporer";

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

// Halaman situs utama tidak pernah benar-benar diam (analitik), jadi
// networkidle ditunggu lunak: cukup domcontentloaded + jeda diam pendek
// supaya hidrasi React selesai sebelum formulir disentuh.
async function buka(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page
    .waitForLoadState("networkidle", { timeout: 12000 })
    .catch(() => {});
}

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // 1. Kirim naskah lewat formulir asli.
  await buka(page, `${BASE}/jurnal/kirim`);
  await page.fill("#judul", JUDUL);
  await page.fill("#penulis", "Penguji Peramban Tahap Satu");
  await page.fill("#email", "penguji.peramban@contoh.ac.id");
  await page.fill("#afiliasi", "Tim Uji Peramban");
  await page.fill(
    "#abstrak",
    "Abstrak uji peramban tahap satu untuk memastikan formulir kirim, panel redaksi, dan halaman lacak bekerja dengan kosakata status OJS."
  );
  await page.locator('section button[type="submit"]').first().click();
  await page.waitForSelector("text=Kode lacak Anda:", { timeout: 30000 });
  const teksHasil = await page.locator("section").first().innerText();
  const cocok = teksHasil.match(/JRN-\d{4}-\d{4}/);
  check("kirim naskah menghasilkan kode lacak", !!cocok, teksHasil.slice(0, 120));
  const kode = cocok?.[0];
  check(
    "status awal tampil berlabel OJS",
    teksHasil.includes("Terkirim (Submission)"),
    teksHasil.slice(0, 200)
  );
  await page.screenshot({
    path: path.join(SHOT_DIR, "tahap1-kirim-berhasil.png")
  });

  // 2. Lacak status awal.
  await buka(page, `${BASE}/jurnal/lacak`);
  await page.fill('input[aria-label="Kode lacak naskah"]', kode);
  await page.locator('section button[type="submit"]').first().click();
  await page.waitForSelector("text=Status Terkini", { timeout: 30000 });
  let teksLacak = await page.locator("section").first().innerText();
  check(
    "lacak menunjukkan Terkirim (Submission)",
    teksLacak.includes("Terkirim (Submission)")
  );

  // 3. Panel: spanduk mode lokal tampil, ubah tahap ke production.
  await buka(page, `${BASE}/jurnal/panel`);
  await page.waitForSelector("text=Mode data lokal (uji)", { timeout: 30000 });
  check("panel menampilkan spanduk mode data lokal", true);
  const kartu = page.locator("article", { hasText: kode });
  await kartu.waitFor({ timeout: 30000 });
  const pilihan = await kartu.locator("select option").allInnerTexts();
  check(
    "pilihan tahap panel memakai kosakata OJS",
    pilihan.some((t) => t.includes("Copyediting")) &&
      pilihan.some((t) => t.includes("Production")) &&
      pilihan.some((t) => t.includes("Published")),
    pilihan.join(" | ")
  );
  await kartu.locator("select").selectOption("production");
  await page.waitForSelector(`text=Status naskah ${kode} diubah`, {
    timeout: 15000
  });
  check("panel mengubah tahap ke production", true);
  await page.screenshot({
    path: path.join(SHOT_DIR, "tahap1-panel-mode-lokal.png")
  });

  // 4. Lacak lagi: tahap baru dan linimasa terbaca.
  await buka(page, `${BASE}/jurnal/lacak`);
  await page.fill('input[aria-label="Kode lacak naskah"]', kode);
  await page.locator('section button[type="submit"]').first().click();
  await page.waitForSelector("text=Status Terkini", { timeout: 30000 });
  teksLacak = await page.locator("section").first().innerText();
  check(
    "lacak menunjukkan Produksi (Production)",
    teksLacak.includes("Produksi (Production)")
  );
  check(
    "linimasa memuat tahap awal dan tahap baru",
    teksLacak.includes("Terkirim (Submission)") &&
      teksLacak.includes("Produksi (Production)")
  );
  await page.screenshot({
    path: path.join(SHOT_DIR, "tahap1-lacak-produksi.png")
  });

  console.log(`\nHASIL: ${pass} lulus, ${fail} gagal. Kode uji: ${kode}`);
  process.exitCode = fail > 0 ? 1 : 0;
} finally {
  await browser.close();
}

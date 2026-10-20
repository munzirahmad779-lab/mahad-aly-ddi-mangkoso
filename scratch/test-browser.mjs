/**
 * Verifikasi tingkat browser: memastikan data hasil sinkronisasi BENAR-BENAR
 * tampil di halaman publik, dan tidak pernah muncul kedipan data contoh (mock).
 *
 * Memakai Microsoft Edge yang sudah terpasang (tanpa mengunduh Chromium).
 */
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

const require = createRequire("C:/Users/munzi/OneDrive/Dokumen/deepseek-harness/default-workspace/.pw-tools/package.json");
const { chromium } = require("playwright");

const BASE = process.env.TEST_BASE || "http://127.0.0.1:3101";
const SHOT_DIR = path.resolve(process.cwd(), "scratch/screenshots");

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

// Teks yang HANYA ada pada data contoh (mock) — tidak boleh pernah muncul.
const FORBIDDEN = [
  "Ismail Hannanong", // dosen mock
  "Ust. H. Syahrul", // dosen mock
  "pemetaan mazhab-mazhab fiqh" // deskripsi matkul mock
];

const INIT_SCRIPT = `
  window.__flashHits = [];
  const forbidden = ${JSON.stringify(FORBIDDEN)};
  const scan = () => {
    const text = document.body ? document.body.innerText : "";
    for (const needle of forbidden) {
      if (text.includes(needle) && !window.__flashHits.includes(needle)) {
        window.__flashHits.push(needle);
      }
    }
  };
  const start = () => {
    scan();
    const observer = new MutationObserver(scan);
    observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
    setInterval(scan, 25);
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
`;

async function waitForText(page, needle, timeout = 15000) {
  try {
    await page.waitForFunction(
      (value) => document.body && document.body.innerText.includes(value),
      needle,
      { timeout }
    );
    return true;
  } catch {
    return false;
  }
}

async function checkInitialHtml() {
  console.log("\n=== 0. HTML awal (sebelum hidrasi) — skeleton, bukan data contoh ===");
  for (const [route, mockOnly] of [
    ["/profil", ["Ismail Hannanong", "Ust. H. Syahrul"]],
    ["/akademik", ["pemetaan mazhab-mazhab fiqh"]]
  ]) {
    const res = await fetch(`${BASE}${route}`);
    const html = await res.text();
    check(`${route} merespons 200`, res.status === 200, String(res.status));
    check(`${route} memuat skeleton anti-flicker`, html.includes("animate-pulse"));
    for (const needle of mockOnly) {
      check(`${route} tidak memuat "${needle}"`, !html.includes(needle));
    }
  }
}

async function main() {
  fs.mkdirSync(SHOT_DIR, { recursive: true });
  await checkInitialHtml();

  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await context.addInitScript(INIT_SCRIPT);
  const page = await context.newPage();

  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(`pageerror: ${err.message}`));

  // ══ 1. /profil#masyayikh ═══════════════════════════════════════════════
  console.log("\n=== 1. /profil#masyayikh menampilkan data hasil sinkronisasi ===");
  await page.goto(`${BASE}/profil#masyayikh`, { waitUntil: "domcontentloaded" });
  check("nama dosen tersinkron muncul", await waitForText(page, "AGH. Prof. Dr. M. Faried Wadjedy, MA"));
  check("jabatan ikut tampil", await waitForText(page, "Guru Besar Fiqh"));
  check("keahlian tampil", await waitForText(page, "Tafsir Ahkam"));
  check("pendidikan talaqqi tampil", await waitForText(page, "Al-Azhar"));
  check("publikasi tampil", await waitForText(page, "Fiqh Muqaran"));

  const lecturerPhotos = await page.$$eval("img", (nodes) =>
    nodes.map((node) => node.getAttribute("src") || "").filter((src) => src.includes("lh3.googleusercontent.com"))
  );
  check("foto memakai CDN lh3.googleusercontent.com", lecturerPhotos.length > 0, JSON.stringify(lecturerPhotos));
  await page.screenshot({ path: path.join(SHOT_DIR, "profil-masyayikh.png"), fullPage: false });

  // ══ 2. /profil#sarana ══════════════════════════════════════════════════
  console.log("\n=== 2. /profil#sarana menampilkan sarana tersinkron ===");
  await page.goto(`${BASE}/profil#sarana`, { waitUntil: "domcontentloaded" });
  check("nama fasilitas muncul", await waitForText(page, "Masjid"));
  check("kapasitas dari spreadsheet tampil", await waitForText(page, "Kapasitas: 500 Mahasantri"));
  await page.screenshot({ path: path.join(SHOT_DIR, "profil-sarana.png"), fullPage: false });

  // ══ 3. /profil#sejarah (narasi Mona utuh) ══════════════════════════════
  console.log("\n=== 3. /profil#sejarah — narasi asli Mona tetap utuh ===");
  await page.goto(`${BASE}/profil#sejarah`, { waitUntil: "domcontentloaded" });
  check("tanggal pendirian resmi", await waitForText(page, "10 Ramadhani 1439 H / 25 Mei 2018 M"));
  check("teks Arab sejarah", await waitForText(page, "تأسس المعهد العالي"));
  check("uraian sejarah Indonesia", await waitForText(page, "keprihatinan atas merosotnya bekal keulamaan"));

  // ══ 4. /akademik ═══════════════════════════════════════════════════════
  console.log("\n=== 4. /akademik — kurikulum tersinkron per semester ===");
  await page.goto(`${BASE}/akademik`, { waitUntil: "domcontentloaded" });
  check("kode matkul semester 1 tampil", await waitForText(page, "MK-101"));
  check("nama matkul tampil", await waitForText(page, "Mabadi' Ushul Fiqh"));
  check("maraji' kitab tampil", await waitForText(page, "Maraji' Kitab"));
  check("kitab rujukan benar", await waitForText(page, "Al-Waraqat"));

  // Pindah ke Semester 5 → matkul pilihan MK-302
  await page.getByRole("button", { name: /Smtr 5/i }).click();
  check("filter semester 5 menampilkan MK-302", await waitForText(page, "MK-302"));
  check("sifat Pilihan tampil", await waitForText(page, "Pilihan"));
  await page.getByRole("button", { name: /Smtr 1/i }).click();
  await page.screenshot({ path: path.join(SHOT_DIR, "akademik-kurikulum.png"), fullPage: false });

  // ══ 5. /dema — 24 pengurus asli ════════════════════════════════════════
  console.log("\n=== 5. /dema — 24 pengurus asli tetap utuh ===");
  await page.goto(`${BASE}/dema`, { waitUntil: "domcontentloaded" });
  check("IMRAN tampil", await waitForText(page, "IMRAN"));
  check("Dirga Wahyu Fani tampil", await waitForText(page, "Dirga Wahyu Fani"));
  check("jumlah anggota 24", await waitForText(page, "24"));
  const demaPhotos = await page.$$eval("img", (nodes) =>
    nodes.map((node) => node.getAttribute("src") || "").filter((src) => src.includes("lh3.googleusercontent.com"))
  );
  check("foto DeMa dari CDN Google", demaPhotos.length > 0, JSON.stringify(demaPhotos.slice(0, 3)));
  await page.screenshot({ path: path.join(SHOT_DIR, "dema.png"), fullPage: false });

  // ══ 6. Anti-flicker ════════════════════════════════════════════════════
  console.log("\n=== 6. Anti-flicker: data contoh tidak pernah muncul ===");
  const flashHits = await page.evaluate(() => window.__flashHits || []);
  check(
    "tidak ada kedipan data mock selama navigasi",
    flashHits.length === 0,
    `terdeteksi: ${JSON.stringify(flashHits)}`
  );

  const relevantErrors = consoleErrors.filter(
    (message) =>
      !message.includes("favicon") &&
      !message.includes("Download the React DevTools") &&
      !message.includes("hydration") &&
      // 406 muncul wajar dari maybeSingle() saat sebuah key site_content belum ada
      !message.includes("406")
  );
  check(
    "tidak ada error konsol berarti",
    relevantErrors.length === 0,
    JSON.stringify(relevantErrors.slice(0, 3))
  );

  const hydrationErrors = consoleErrors.filter((message) => message.toLowerCase().includes("hydration"));
  check("tidak ada hydration mismatch", hydrationErrors.length === 0, JSON.stringify(hydrationErrors.slice(0, 2)));

  await browser.close();

  console.log(`\n──────────────────────────────\n  LULUS: ${pass}   GAGAL: ${fail}\n──────────────────────────────\n`);
  if (fail > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error("Kesalahan:", error);
  process.exitCode = 1;
});

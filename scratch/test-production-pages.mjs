/**
 * Uji asap terhadap database PRODUKSI asli (tanpa env mock):
 * memastikan halaman publik tetap normal walau katalog baru belum pernah
 * disinkronkan — data lama (collections) tetap tampil, skeleton tidak
 * menggantung selamanya.
 */
import { createRequire } from "node:module";
const require = createRequire("C:/Users/munzi/OneDrive/Dokumen/deepseek-harness/default-workspace/.pw-tools/package.json");
const { chromium } = require("playwright");

const BASE = "http://127.0.0.1:3102";
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

async function waitText(page, needle, timeout = 20000) {
  try {
    await page.waitForFunction((v) => document.body.innerText.includes(v), needle, { timeout });
    return true;
  } catch {
    return false;
  }
}

const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));

console.log("=== /profil (data produksi) ===");
await page.goto(`${BASE}/profil#masyayikh`, { waitUntil: "load" });
check("dosen dari tabel collections tetap tampil", await waitText(page, "AGH. Prof. Dr. M. Faried Wadjedy, MA"));
check("jabatan tampil", await waitText(page, "Guru Besar"));
const skeletonGone = await page.waitForFunction(
  () => document.querySelectorAll(".animate-pulse.rounded-2xl, .animate-pulse.rounded-xl").length === 0,
  null,
  { timeout: 20000 }
).then(() => true).catch(() => false);
check("skeleton tidak menggantung", skeletonGone);

await page.goto(`${BASE}/profil#sejarah`, { waitUntil: "load" });
check("tarikh pendirian tampil permanen", await waitText(page, "10 Ramadhani 1439 H / 25 Mei 2018 M"));
check("teks Arab sejarah utuh", await waitText(page, "تأسس المعهد العالي"));

console.log("\n=== /akademik (data produksi) ===");
await page.goto(`${BASE}/akademik`, { waitUntil: "load" });
check("kurikulum bawaan tampil", await waitText(page, "Mabadi' Ushul Fiqh"));
check("SKS tampil", await waitText(page, "SKS"));

console.log("\n=== /dema (24 pengurus asli) ===");
await page.goto(`${BASE}/dema`, { waitUntil: "load" });
check("IMRAN tampil", await waitText(page, "IMRAN"));
check("Wakil tampil", await waitText(page, "Dirga Wahyu Fani"));
check("Bendahara tampil", await waitText(page, "Wiladah Mazkiyah"));
const demaCount = await page.evaluate(() => document.body.innerText.match(/24/g)?.length || 0);
check("angka 24 tertera", demaCount > 0, String(demaCount));

check("tidak ada error halaman", errors.length === 0, JSON.stringify(errors.slice(0, 3)));

await browser.close();
console.log(`\n──────────────────────────────\n  LULUS: ${pass}   GAGAL: ${fail}\n──────────────────────────────\n`);
if (fail > 0) process.exitCode = 1;

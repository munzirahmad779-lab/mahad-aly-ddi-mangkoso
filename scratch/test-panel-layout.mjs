/**
 * Ukur kenyamanan baca panel Sinkronisasi Spreadsheet tanpa melihat gambar:
 * jarak antar kartu, ukuran teks, tinggi target sentuh, dan luapan horizontal.
 * Mengambil tangkapan layar desktop + HP.
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
    console.log(`  ok   ${name}${detail ? ` (${detail})` : ""}`);
  } else {
    fail += 1;
    console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

async function openPanel(page) {
  await page.goto(`${BASE}/admin?guest=true`, { waitUntil: "load" });
  await page.getByRole("button", { name: /Sinkronisasi Spreadsheet/i }).first().click();
  await page.waitForFunction(
    () => document.body.innerText.includes("Pilih modul yang akan disinkronkan"),
    null,
    { timeout: 20000 }
  );
}

async function measure(page, label) {
  const result = await page.evaluate(() => {
    // Kartu seksi utama panel
    const cards = [...document.querySelectorAll("section")].filter((el) =>
      el.className.includes("rounded-3xl")
    );
    const rects = cards.map((el) => {
      const r = el.getBoundingClientRect();
      return { top: Math.round(r.top + window.scrollY), height: Math.round(r.height) };
    });
    rects.sort((a, b) => a.top - b.top);

    const gaps = [];
    for (let i = 1; i < rects.length; i += 1) {
      const gap = rects[i].top - (rects[i - 1].top + rects[i - 1].height);
      if (gap > -1) gaps.push(gap);
    }

    // Ukuran font teks isi panel
    const fontSizes = [];
    for (const el of document.querySelectorAll("section p, section span, section li")) {
      if (!el.textContent || !el.textContent.trim()) continue;
      const size = parseFloat(getComputedStyle(el).fontSize);
      if (size > 0) fontSizes.push(size);
    }
    fontSizes.sort((a, b) => a - b);

    // Target sentuh
    const buttonBoxes = [...document.querySelectorAll("section button")].map((el) => {
      const r = el.getBoundingClientRect();
      return { h: Math.round(r.height), w: Math.round(r.width), text: (el.innerText || "").trim().slice(0, 30) };
    });

    const inputs = [...document.querySelectorAll("section input:not([type=file])")].map((el) =>
      Math.round(el.getBoundingClientRect().height)
    );

    return {
      cardCount: cards.length,
      gaps,
      minFont: fontSizes[0] ?? 0,
      medianFont: fontSizes[Math.floor(fontSizes.length / 2)] ?? 0,
      smallButtons: buttonBoxes.filter((b) => b.h < 40 && b.w > 0).map((b) => `${b.h}px "${b.text}"`),
      minInputHeight: inputs.length ? Math.min(...inputs) : 0,
      docScrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      bodyScrollWidth: document.body.scrollWidth
    };
  });

  console.log(`\n── ${label} ──`);
  console.log(`   kartu seksi : ${result.cardCount}`);
  console.log(`   jarak antar : ${result.gaps.join(", ")} px`);
  console.log(`   font        : min ${result.minFont}px · median ${result.medianFont}px`);
  console.log(`   input       : tinggi min ${result.minInputHeight}px`);
  console.log(`   lebar dok   : ${result.docScrollWidth} / layar ${result.innerWidth}`);

  check(`${label}: tidak ada luapan horizontal`, result.docScrollWidth <= result.innerWidth + 1,
    `${result.docScrollWidth} vs ${result.innerWidth}`);
  check(`${label}: jarak antar kartu ≥ 20px`, result.gaps.every((g) => g >= 20), result.gaps.join(","));
  check(`${label}: teks terkecil ≥ 11px`, result.minFont >= 11, `${result.minFont}px`);
  check(`${label}: teks isi median ≥ 13px`, result.medianFont >= 13, `${result.medianFont}px`);
  check(`${label}: semua tombol tinggi ≥ 40px`, result.smallButtons.length === 0, result.smallButtons.join(" | "));
  check(`${label}: tinggi input ≥ 44px`, result.minInputHeight >= 44, `${result.minInputHeight}px`);

  return result;
}

async function main() {
  fs.mkdirSync(SHOT_DIR, { recursive: true });
  const browser = await chromium.launch({ channel: "msedge", headless: true });

  // ── Desktop ──
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await desktop.newPage();
  await openPanel(page);
  await measure(page, "Desktop 1440px");
  await page.screenshot({ path: path.join(SHOT_DIR, "panel-desktop.png"), fullPage: false });
  await page.screenshot({ path: path.join(SHOT_DIR, "panel-desktop-full.png"), fullPage: true });

  // mode B + pratinjau, ambil tangkapan layar kondisi terisi
  await page.getByRole("button", { name: /Mode B/i }).first().click();
  const csv = [
    '"Nama Lengkap","Gelar & Jabatan","Bidang Keahlian","Nomor Urut","Status Aktif"',
    '"AGH. Prof. Dr. M. Faried Wadjedy, MA","Guru Besar Fiqh & Tafsir","Ushul Fikih, Tafsir Ahkam","1","Aktif"'
  ].join("\r\n");
  await page.locator('input[type="file"]').setInputFiles({
    name: "masyayikh.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(csv, "utf8")
  });
  await page.getByRole("button", { name: /Pratinjau Data/i }).click();
  await page.waitForFunction(() => document.body.innerText.includes("Pratinjau"), null, { timeout: 20000 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(SHOT_DIR, "panel-preview.png"), fullPage: false });
  await desktop.close();

  // ── HP ──
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2
  });
  const mpage = await mobile.newPage();
  await openPanel(mpage);
  await measure(mpage, "HP 390px");
  await mpage.screenshot({ path: path.join(SHOT_DIR, "panel-hp.png"), fullPage: false });
  await mpage.screenshot({ path: path.join(SHOT_DIR, "panel-hp-full.png"), fullPage: true });
  await mobile.close();

  await browser.close();
  console.log(`\n──────────────────────────────\n  LULUS: ${pass}   GAGAL: ${fail}\n──────────────────────────────\n`);
  if (fail > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error("Kesalahan:", error);
  process.exitCode = 1;
});

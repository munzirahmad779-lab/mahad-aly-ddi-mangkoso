/**
 * Uji UI Panel Admin → "Sinkronisasi Spreadsheet" memakai Microsoft Edge.
 * Mencakup: buka panel, unggah CSV dari HP (Mode B), pratinjau, simpan,
 * unduh template, dan rollback.
 */
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

const require = createRequire("C:/Users/munzi/OneDrive/Dokumen/deepseek-harness/default-workspace/.pw-tools/package.json");
const { chromium } = require("playwright");

const BASE = process.env.TEST_BASE || "http://127.0.0.1:3101";
const MOCK = process.env.TEST_MOCK || "http://127.0.0.1:54321";
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

async function waitText(page, needle, timeout = 20000) {
  try {
    await page.waitForFunction((v) => document.body.innerText.includes(v), needle, { timeout });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  fs.mkdirSync(SHOT_DIR, { recursive: true });

  const state = await (await fetch(`${MOCK}/__state`)).json();
  const lecturers = state.siteContent.masyayikh_list.items;

  const quote = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csvContent = [
    ["Nama Lengkap", "Gelar & Jabatan", "Peran/Tugas Mengajar", "Link Foto Google Drive", "Bidang Keahlian", "Riwayat Pendidikan", "Karya/Publikasi", "Nomor Urut", "Status Aktif"]
      .map(quote)
      .join(","),
    ...lecturers.map((item) =>
      [
        item.name,
        item.title,
        item.role,
        item.rawPhotoUrl || item.photoUrl,
        item.expertise,
        (item.education || []).join(" • "),
        (item.publications || []).join(" • "),
        item.order,
        "Aktif"
      ]
        .map(quote)
        .join(",")
    )
  ].join("\r\n");

  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (msg) => {
    if (msg.type() === "error" && !msg.text().includes("406") && !msg.text().includes("favicon")) errors.push(msg.text());
  });

  console.log("\n=== 1. Buka Panel Admin (mode tamu localhost) ===");
  await page.goto(`${BASE}/admin?guest=true`, { waitUntil: "load" });
  check("panel admin termuat", (await page.evaluate(() => document.body.innerText.length)) > 1000);

  console.log("\n=== 2. Menu Sinkronisasi Spreadsheet ===");
  await page.getByRole("button", { name: /Sinkronisasi Spreadsheet/i }).first().click();
  check("judul panel muncul", await waitText(page, "Sinkronisasi Spreadsheet"));
  check("empat modul tersedia", (await page.getByRole("button", { name: /Masyayikh & Dewan Dosen/i }).count()) > 0);
  check("tab Kurikulum ada", (await page.getByRole("button", { name: /Kurikulum/i }).count()) > 0);
  check("tab Sarana ada", (await page.getByRole("button", { name: /Sarana/i }).count()) > 0);
  check("tab DeMa ada", (await page.getByRole("button", { name: /DeMa/i }).count()) > 0);
  check("tombol unduh template ada", (await page.getByRole("button", { name: /Unduh Template/i }).count()) > 0);
  check("info RLS tercantum", await waitText(page, "Service Role"));

  console.log("\n=== 3. Unduh Template CSV ===");
  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout: 15000 }),
    page.getByRole("button", { name: /Unduh Template/i }).first().click()
  ]);
  check("berkas template terunduh", Boolean(download.suggestedFilename()), download.suggestedFilename());
  check("nama berkas .csv", /\.csv$/i.test(download.suggestedFilename()), download.suggestedFilename());

  console.log("\n=== 4. Mode B — unggah CSV dari HP ===");
  await page.getByRole("button", { name: /Mode B/i }).first().click();
  await page.locator('input[type="file"]').setInputFiles({
    name: "masyayikh-dari-hp.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(csvContent, "utf8")
  });
  check("unggahan tercatat", await waitText(page, "masyayikh-dari-hp.csv"));

  console.log("\n=== 5. Pratinjau ===");
  await page.getByRole("button", { name: /Pratinjau Data/i }).click();
  check("pratinjau muncul", await waitText(page, "Pratinjau"));
  check("memuat nama dosen asli", await waitText(page, lecturers[0].name));
  check("memuat kolom hasil normalisasi", await waitText(page, "Keahlian"));

  console.log("\n=== 6. Simpan & publikasikan ===");
  await page.getByRole("button", { name: /Simpan & Publikasikan/i }).click();
  check(
    "pesan sukses tampil",
    await waitText(page, "Berhasil"),
    ""
  );
  await page.screenshot({ path: path.join(SHOT_DIR, "admin-sync-panel.png"), fullPage: false });

  const after = await (await fetch(`${MOCK}/__state`)).json();
  check("database terisi setelah simpan", after.siteContent.masyayikh_list.items.length, lecturers.length);
  check("meta.syncedBy terisi", Boolean(after.siteContent.masyayikh_list.meta.syncedBy));

  console.log("\n=== 7. Rollback ===");
  await page.getByRole("button", { name: /Rollback/i }).first().click();
  check("pesan rollback tampil", await waitText(page, "Rollback"));
  const afterRollback = await (await fetch(`${MOCK}/__state`)).json();
  check("data tetap ada setelah rollback", afterRollback.siteContent.masyayikh_list.items.length, lecturers.length);

  check("tidak ada error konsol", errors.length === 0, JSON.stringify(errors.slice(0, 3)));

  await browser.close();
  console.log(`\n──────────────────────────────\n  LULUS: ${pass}   GAGAL: ${fail}\n──────────────────────────────\n`);
  if (fail > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error("Kesalahan:", error);
  process.exitCode = 1;
});

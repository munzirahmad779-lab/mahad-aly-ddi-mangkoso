/**
 * Unduh kedua varian template dari panel admin lalu periksa isinya:
 * - Excel  : BOM + baris "sep=;" + kolom dipisah titik koma
 * - Sheets : BOM + kolom dipisah koma, tanpa baris sep=
 */
import { createRequire } from "node:module";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const require = createRequire("C:/Users/munzi/OneDrive/Dokumen/deepseek-harness/default-workspace/.pw-tools/package.json");
const { chromium } = require("playwright");

const BASE = process.env.TEST_BASE || "http://127.0.0.1:3101";
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

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "tmpl-"));

async function grab(page, label) {
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: new RegExp(label, "i") }).first().click()
  ]);
  const target = path.join(tmp, download.suggestedFilename());
  await download.saveAs(target);
  const buffer = fs.readFileSync(target);
  return { name: download.suggestedFilename(), text: buffer.toString("utf8"), buffer };
}

async function main() {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await (await browser.newContext({ acceptDownloads: true })).newPage();

  await page.goto(`${BASE}/admin?guest=true`, { waitUntil: "load" });
  await page.getByRole("button", { name: /Sinkronisasi Spreadsheet/i }).first().click();
  await page.waitForFunction(() => document.body.innerText.includes("Pilih modul yang akan disinkronkan"), null, {
    timeout: 20000
  });

  console.log("\n=== Template Excel ===");
  const excel = await grab(page, "Template Excel");
  check("nama berkas mengandung 'excel'", /excel/.test(excel.name), excel.name);
  check("berakhiran .csv", excel.name.endsWith(".csv"));
  check("byte pertama = BOM UTF-8", excel.buffer[0] === 0xef && excel.buffer[1] === 0xbb && excel.buffer[2] === 0xbf);
  check("baris 1 = sep=;", excel.text.replace(/^\uFEFF/, "").startsWith("sep=;"));
  const excelLines = excel.text.replace(/^\uFEFF/, "").split("\r\n");
  check("pemisah titik koma dipakai", (excelLines[1] ?? "").split(";").length === 9,
    `${(excelLines[1] ?? "").split(";").length} kolom`);
  check("tidak ada koma liar di luar kutip", !/Nama Lengkap,/.test(excelLines[1] ?? ""));

  console.log("\n=== Template Google Sheets ===");
  const sheets = await grab(page, "Template Google Sheets");
  check("nama berkas mengandung 'google-sheets'", /google-sheets/.test(sheets.name), sheets.name);
  check("byte pertama = BOM UTF-8", sheets.buffer[0] === 0xef);
  check("tanpa baris sep=", !sheets.text.replace(/^\uFEFF/, "").startsWith("sep="));
  const sheetLines = sheets.text.replace(/^\uFEFF/, "").split("\r\n");
  check("pemisah koma dipakai", (sheetLines[0] ?? "").split(",").length === 9,
    `${(sheetLines[0] ?? "").split(",").length} kolom`);

  await browser.close();
  console.log(`\n──────────────────────────────\n  LULUS: ${pass}   GAGAL: ${fail}\n──────────────────────────────\n`);
  if (fail > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error("Kesalahan:", error);
  process.exitCode = 1;
});

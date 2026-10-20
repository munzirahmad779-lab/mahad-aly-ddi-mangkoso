/**
 * Uji format template CSV yang diunduh dari panel:
 * - Varian Excel: BOM + baris "sep=;" + pemisah titik koma → Excel Indonesia
 *   langsung memecah kolom (bukan menumpuk semuanya di kolom A).
 * - Varian Google Sheets: BOM + pemisah koma.
 * - Keduanya bisa diunggah balik dan terbaca sempurna oleh parser.
 */
import {
  buildCsvTemplate,
  buildCsvTemplateFileName,
  parseCsv,
  parseSheetCsv,
  SHEET_MODULES
} from "../src/lib/sheets/spreadsheet.js";

let pass = 0;
let fail = 0;
function check(name: string, ok: boolean, detail = "") {
  if (ok) {
    pass += 1;
    console.log(`  ok   ${name}${detail ? ` (${detail})` : ""}`);
  } else {
    fail += 1;
    console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

for (const module of SHEET_MODULES) {
  console.log(`\n── ${module.label} ──`);

  // ── Varian Excel ──
  const excel = buildCsvTemplate(module, "excel");
  check("diawali BOM UTF-8", excel.charCodeAt(0) === 0xfeff);
  check("baris petunjuk sep=;", excel.slice(1).startsWith("sep=;\r\n"));

  const excelLines = excel.slice(1).split("\r\n");
  check("baris 1 = sep=;", excelLines[0] === "sep=;");
  check(
    `header punya ${module.columns.length} kolom (titik koma)`,
    (excelLines[1] ?? "").split(";").length === module.columns.length,
    `${(excelLines[1] ?? "").split(";").length} kolom`
  );
  check(
    `contoh punya ${module.columns.length} kolom`,
    (excelLines[2] ?? "").split(";").length === module.columns.length
  );
  check("tidak ada kutip berlebih pada sel biasa", !/"Supabase"|"nama"/.test(excel));

  const excelGrid = parseCsv(excel);
  check("parser membuang baris sep=", excelGrid.length === 2, `${excelGrid.length} baris`);
  check(
    "judul kolom kembali utuh di parser",
    excelGrid[0]?.length === module.columns.length &&
      excelGrid[0].every((cell, index) => cell === module.columns[index].label)
  );
  check(
    "baris contoh kembali utuh di parser",
    excelGrid[1]?.every((cell, index) => cell === module.columns[index].example)
  );

  const excelParsed = parseSheetCsv(excel, module);
  check("template Excel bisa diunggah balik", excelParsed.records.length === 1);
  check("tidak ada kolom wajib yang hilang", excelParsed.missingRequired.length === 0);
  check("tanpa peringatan geser kolom", excelParsed.warnings.length === 0, excelParsed.warnings.join(" | "));

  // ── Varian Google Sheets ──
  const sheets = buildCsvTemplate(module, "sheets");
  check("varian Sheets diawali BOM", sheets.charCodeAt(0) === 0xfeff);
  check("varian Sheets tanpa baris sep=", !sheets.slice(1).startsWith("sep="));
  const sheetsGrid = parseCsv(sheets);
  check("varian Sheets terbaca 2 baris", sheetsGrid.length === 2);
  check(
    "varian Sheets: kolom utuh",
    sheetsGrid[0]?.every((cell, index) => cell === module.columns[index].label)
  );
  check("template Sheets bisa diunggah balik", parseSheetCsv(sheets, module).records.length === 1);

  // ── Nama berkas ──
  check(
    "nama berkas Excel",
    buildCsvTemplateFileName(module, "excel") === `template-${module.id}-excel.csv`,
    buildCsvTemplateFileName(module, "excel")
  );
  check(
    "nama berkas Sheets",
    buildCsvTemplateFileName(module, "sheets") === `template-${module.id}-google-sheets.csv`
  );
}

// ══ Regresi: data persis seperti yang ditempel pengguna ══
console.log("\n── Data pengguna (koma di nama tanpa tanda kutip) ──");
const headerLine =
  'Nama Lengkap,"Gelar & Jabatan","Peran/Tugas Mengajar","Link Foto Google Drive","Bidang Keahlian","Riwayat Pendidikan","Karya/Publikasi","Nomor Urut","Status Aktif"';
const rowUnquoted =
  'AGH. Prof. Dr. M. Faried Wadjedy, MA,"Mudir Ma\'had Aly / Dosen Senior","Pengampu Fiqh Turats & Ushul Fiqh","https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWxYz012345/view?usp=sharing","Kutubut Turats, Ushul Fikih, Fatwa Kontemporer","S1 Al-Azhar Kairo • S2 UIN Alauddin • S3 UIN Jakarta","Fiqh Muqaran • Risalah Wasathiyyah","1","Aktif"';
const rowQuoted =
  '"AGH. Prof. Dr. M. Faried Wadjedy, MA","Mudir Ma\'had Aly / Dosen Senior","Pengampu Fiqh Turats & Ushul Fiqh","https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWxYz012345/view?usp=sharing","Kutubut Turats, Ushul Fikih, Fatwa Kontemporer","S1 Al-Azhar Kairo • S2 UIN Alauddin • S3 UIN Jakarta","Fiqh Muqaran • Risalah Wasathiyyah","1","Aktif"';

const masyayikh = SHEET_MODULES.find((m) => m.id === "masyayikh")!;

const quoted = parseSheetCsv([headerLine, rowQuoted].join("\r\n"), masyayikh);
check("versi ber-kutip: 1 baris", quoted.records.length === 1);
check("versi ber-kutip: nama utuh", quoted.records[0]?.nama === "AGH. Prof. Dr. M. Faried Wadjedy, MA");
check("versi ber-kutip: jabatan utuh", quoted.records[0]?.jabatan === "Mudir Ma'had Aly / Dosen Senior");
check("versi ber-kutip: peran utuh", quoted.records[0]?.peran === "Pengampu Fiqh Turats & Ushul Fiqh");
check("versi ber-kutip: tanpa peringatan", quoted.warnings.length === 0);

const unquoted = parseSheetCsv([headerLine, rowUnquoted].join("\r\n"), masyayikh);
check(
  "versi tanpa kutip: peringatan geser kolom muncul",
  unquoted.warnings.some((w) => w.includes("10 kolom (header 9)")),
  unquoted.warnings[0] ?? "(tidak ada)"
);
check(
  "peringatan menyebut cara memperbaiki",
  unquoted.warnings.some((w) => w.includes("bungkus dengan"))
);

console.log(`\n──────────────────────────────\n  LULUS: ${pass}   GAGAL: ${fail}\n──────────────────────────────\n`);
if (fail > 0) process.exitCode = 1;

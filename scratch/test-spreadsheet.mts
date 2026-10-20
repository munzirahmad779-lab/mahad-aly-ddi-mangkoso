import {
  buildCsvTemplate,
  convertGoogleDriveToCDN,
  extractGoogleDriveFileId,
  getSheetModule,
  normalizeDemaRows,
  normalizeKurikulumRows,
  normalizeMasyayikhRows,
  normalizePhotoUrl,
  normalizeSaranaRows,
  parseCsv,
  parseSheetCsv,
  resolveSheetSource
} from "../src/lib/sheets/spreadsheet";

let pass = 0;
let fail = 0;

function check(name: string, actual: unknown, expected: unknown) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    pass += 1;
    console.log(`  ok   ${name}`);
  } else {
    fail += 1;
    console.log(`  FAIL ${name}\n       expected: ${e}\n       actual:   ${a}`);
  }
}

console.log("\n=== 1. Konversi Google Drive → CDN ===");
const fileId = "1AbCdEfGhIjKlMnOpQrStUvWxYz012345";
check("open?id=", convertGoogleDriveToCDN(`https://drive.google.com/open?id=${fileId}`), `https://lh3.googleusercontent.com/d/${fileId}`);
check("file/d/.../view", convertGoogleDriveToCDN(`https://drive.google.com/file/d/${fileId}/view?usp=sharing`), `https://lh3.googleusercontent.com/d/${fileId}`);
check("uc?id=&export", convertGoogleDriveToCDN(`https://drive.google.com/uc?id=${fileId}&export=download`), `https://lh3.googleusercontent.com/d/${fileId}`);
check("uc?export=download&id=", convertGoogleDriveToCDN(`https://drive.google.com/uc?export=download&id=${fileId}`), `https://lh3.googleusercontent.com/d/${fileId}`);
check("no trailing path", convertGoogleDriveToCDN(`https://drive.google.com/file/d/${fileId}`), `https://lh3.googleusercontent.com/d/${fileId}`);
check("thumbnail", convertGoogleDriveToCDN(`https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`), `https://lh3.googleusercontent.com/d/${fileId}`);
check("usercontent", convertGoogleDriveToCDN(`https://drive.usercontent.google.com/download?id=${fileId}&export=download`), `https://lh3.googleusercontent.com/d/${fileId}`);
check("raw id via normalizePhotoUrl", normalizePhotoUrl(fileId), `https://lh3.googleusercontent.com/d/${fileId}`);
check("raw id di convert (sesuai spesifikasi) tetap apa adanya", convertGoogleDriveToCDN(fileId), fileId);
check("supabase untouched", convertGoogleDriveToCDN("https://x.supabase.co/storage/v1/object/public/media/a.jpg"), "https://x.supabase.co/storage/v1/object/public/media/a.jpg");
check("lh3 stays", convertGoogleDriveToCDN(`https://lh3.googleusercontent.com/d/${fileId}`), `https://lh3.googleusercontent.com/d/${fileId}`);
check("lh3 strip size", convertGoogleDriveToCDN(`https://lh3.googleusercontent.com/d/${fileId}=w1000`), `https://lh3.googleusercontent.com/d/${fileId}`);
check("empty", convertGoogleDriveToCDN(undefined), "");
check("blank", convertGoogleDriveToCDN("   "), "");
check("text not url", convertGoogleDriveToCDN("foto depan masjid"), "foto depan masjid");
check("extract id from open", extractGoogleDriveFileId(`https://drive.google.com/open?id=${fileId}`), fileId);

console.log("\n=== 2. Parser CSV ===");
const csv1 = `\uFEFFNama Lengkap,Gelar & Jabatan,Link Foto Google Drive\r\n"Dr. KH. Lukman, Lc., M.A.",Mudir,"https://drive.google.com/open?id=${fileId}"\r\n\r\nUst. Ahmad,Sekretaris,\r\n`;
const grid = parseCsv(csv1);
check("baris (baris kosong dibuang)", grid.length, 3);
check("kutip + koma dalam sel", grid[1][0], "Dr. KH. Lukman, Lc., M.A.");
check("kutip dibersihkan", grid[1][2], `https://drive.google.com/open?id=${fileId}`);

const csvQuotes = `a,b\n"kata ""kutipan"" di dalam",x\n`;
check("escaped quote", parseCsv(csvQuotes)[1][0], 'kata "kutipan" di dalam');

const csvNewline = `a,b\n"baris1\nbaris2",y\n`;
check("newline dalam sel", parseCsv(csvNewline)[1][0], "baris1\nbaris2");

const csvSemicolon = `Nama;Kategori;Kapasitas\nMasjid;Ibadah;500\n`;
const semiGrid = parseCsv(csvSemicolon);
check("delimiter ; terdeteksi", semiGrid[1], ["Masjid", "Ibadah", "500"]);

console.log("\n=== 3. Pemetaan header & normalisasi Masyayikh ===");
const masyayikhModule = getSheetModule("masyayikh")!;
const masyayikhCsv = [
  "Nama Lengkap,Gelar & Jabatan,Peran/Tugas Mengajar,Link Foto Google Drive,Bidang Keahlian,Riwayat Pendidikan,Karya/Publikasi,Nomor Urut,Status Aktif,Instagram",
  `"AGH. Prof. Dr. M. Faried Wadjedy, MA",Mudir Ma'had Aly,Pengampu Fiqh Turats,https://drive.google.com/file/d/${fileId}/view?usp=sharing,"Kutubut Turats, Ushul Fikih","S1 Al-Azhar Kairo • S2 UIN Alauddin","Fiqh Muqaran • Risalah Wasathiyyah",1,Aktif,@faried`,
  `"Ust. H. Syahrul, M.Pd.I.",Dosen Qawa'id,Kaidah Fikih,,Kaidah Fikih,"S1 STAI DDI","",2,Non-Aktif,`
].join("\r\n");

const parsedMasyayikh = parseSheetCsv(masyayikhCsv, masyayikhModule);
check("header wajib lengkap", parsedMasyayikh.missingRequired, []);
check("2 baris terbaca", parsedMasyayikh.records.length, 2);
check("kolom tak dikenal diabaikan", parsedMasyayikh.unknownHeaders, ["Instagram"]);

const lec = normalizeMasyayikhRows(parsedMasyayikh.records);
check("jumlah lecturer", lec.items.length, 2);
check("nama dengan koma utuh", lec.items[0].name, "AGH. Prof. Dr. M. Faried Wadjedy, MA");
check("foto → CDN", lec.items[0].photoUrl, `https://lh3.googleusercontent.com/d/${fileId}`);
check("rawPhotoUrl disimpan", lec.items[0].rawPhotoUrl, `https://drive.google.com/file/d/${fileId}/view?usp=sharing`);
check("pendidikan dipisah bullet", lec.items[0].education, ["S1 Al-Azhar Kairo", "S2 UIN Alauddin"]);
check("publikasi dipisah bullet", lec.items[0].publications, ["Fiqh Muqaran", "Risalah Wasathiyyah"]);
check("status non-aktif", lec.items[1].isActive, false);
check("status aktif default", lec.items[0].isActive, true);
check("judul kosong → default", lec.items[1].title, "Dosen Qawa'id");
check("order naik", lec.items.map((i) => i.order), [1, 2]);

console.log("\n=== 4. Normalisasi Kurikulum ===");
const kurikulumModule = getSheetModule("kurikulum")!;
const kurikulumCsv = [
  "Kode Matkul,Nama Mata Kuliah,Bobot SKS,Semester (1 s/d 8),Dosen Pengampu,Kitab Rujukan,Deskripsi Singkat,Sifat",
  `FIQ-101,"Qawa'id Fiqhiyyah Kontemporer",3,1,Ust. Ahmad,"Al-Asybah wan Nazha'ir karya Imam As-Suyuthi","Kaidah fikih asasiyah",Wajib`,
  `FIQ-205,"Fiqh Muamalah Digital",4,3,AGH. Faried,"Fathul Mu'in","Transaksi fintech",Pilihan`,
  `FIQ-999,"Semester di luar rentang",3,12,Dosen X,"Kitab X","Uji clamp",Wajib`
].join("\r\n");
const parsedKur = parseSheetCsv(kurikulumCsv, kurikulumModule);
check("3 matkul terbaca", parsedKur.records.length, 3);
const kur = normalizeKurikulumRows(parsedKur.records);
check("kode tersimpan", kur.items.map((i) => i.code).includes("FIQ-101"), true);
check("sks numerik", kur.items[0].credits, 3);
check("semester clamp 12→8", kur.items.find((i) => i.code === "FIQ-999")!.semester, 8);
check("sifat pilihan", kur.items.find((i) => i.code === "FIQ-205")!.type, "Pilihan");
check("kitab rujukan → mainBook", kur.items[0].mainBook, "Al-Asybah wan Nazha'ir karya Imam As-Suyuthi");
check("urut semester", kur.items.map((i) => i.semester), [1, 3, 8]);

console.log("\n=== 5. Normalisasi Sarana ===");
const saranaModule = getSheetModule("sarana")!;
const saranaCsv = [
  "Nama Fasilitas,Kategori (Masjid/Maktabah/Asrama/Lab),Link Foto Google Drive,Deskripsi Ringkas",
  `"Masjid & Halaqah Utama",Masjid,https://drive.google.com/open?id=${fileId},"Pusat pengajian wetonan"`,
  `"Lab Komputer Turats",Lab,,`
].join("\r\n");
const parsedSar = parseSheetCsv(saranaCsv, saranaModule);
check("2 sarana terbaca", parsedSar.records.length, 2);
const sar = normalizeSaranaRows(parsedSar.records);
check("kategori Masjid", sar.items[0].category, "Masjid");
check("kategori Lab→Laboratorium", sar.items[1].category, "Laboratorium");
check("foto CDN sarana", sar.items[0].photoUrl, `https://lh3.googleusercontent.com/d/${fileId}`);

console.log("\n=== 6. Normalisasi DeMa (divisi dari teks amanah) ===");
const demaModule = getSheetModule("dema")!;
const demaCsv = [
  "Timestamp,Nama Lengkap,NIM,Semester / Marhalah,Divisi / Amanah,Link Foto Google Drive,Nomor WhatsApp,Akun Instagram,Biografi Singkat,Motto Hidup / Kutipan",
  `2026-10-20 08:00,IMRAN,144629,Sanah Tsalis,Ketua Dema,https://drive.google.com/open?id=${fileId},082196923170,@imranmuhjafar,"Ushul fiqih & Tafsir","Ikhlas, Lillah"`,
  `2026-10-20 08:05,"Siti Hajar Al Fatih",144622,Semester 5,Sek-bend Div. Pendidikan,https://drive.google.com/open?id=1-VsB3RKMGsVLnnD7uqhMyFxoy4oCAdIj,0821,"","Alamat: Pinrang","Habiskan masa mudamu"`
].join("\r\n");
const parsedDema = parseSheetCsv(demaCsv, demaModule);
check("2 pengurus terbaca", parsedDema.records.length, 2);
const dema = normalizeDemaRows(parsedDema.records, {
  divisions: [
    { id: "div-bph", name: "Badan Pengurus Harian (BPH)", code: "bph", description: "", responsibilities: [], order: 1, isActive: true },
    { id: "div-pendidikan", name: "Divisi Pendidikan", code: "pendidikan", description: "", responsibilities: [], order: 2, isActive: true }
  ],
  existingMembers: []
});
check("ketua → div-bph", dema.items[0].divisionId, "div-bph");
check("div pendidikan terdeteksi", dema.items[1].divisionId, "div-pendidikan");
check("nim tersimpan", dema.items[0].nim, "144629");
check("foto CDN dema", dema.items[0].photoUrl, `https://lh3.googleusercontent.com/d/${fileId}`);
check("role = teks amanah", dema.items[0].role, "Ketua Dema");
check("quote dengan koma utuh", dema.items[0].quote, "Ikhlas, Lillah");

console.log("\n=== 7. Resolusi URL Google Sheets ===");
const src1 = resolveSheetSource("https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=0", "Masyayikh");
check("sheetId", src1?.sheetId, "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms");
check("csvUrl gviz", src1?.csvUrl, "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/gviz/tq?tqx=out%3Acsv&sheet=Masyayikh&headers=1");
const src2 = resolveSheetSource("https://docs.google.com/spreadsheets/d/e/2PACX-1vABC/pub?output=csv");
check("published csv dipakai apa adanya", src2?.csvUrl, "https://docs.google.com/spreadsheets/d/e/2PACX-1vABC/pub?output=csv");
check("url tidak valid", resolveSheetSource("ftp://contoh"), null);
check("url bukan sheets", resolveSheetSource("https://example.com/abc"), null);

console.log("\n=== 8. Template CSV ===");
for (const id of ["masyayikh", "kurikulum", "sarana", "dema"] as const) {
  const mod = getSheetModule(id)!;
  const template = buildCsvTemplate(mod);
  const rows = parseCsv(template);
  check(`template ${id}: 2 baris`, rows.length, 2);
  check(`template ${id}: jumlah kolom`, rows[0].length, mod.columns.length);
  const roundTrip = parseSheetCsv(template, mod);
  check(`template ${id}: header dikenali semua`, roundTrip.unknownHeaders, []);
  check(`template ${id}: contoh baris valid`, roundTrip.records.length, 1);
}

console.log("\n=== 9. Ketahanan: data kosong / rusak ===");
check("csv kosong", parseCsv(""), []);
check("csv hanya header", parseSheetCsv("Nama Lengkap,Gelar & Jabatan", getSheetModule("masyayikh")!).records.length, 0);
check("normalize kosong", normalizeMasyayikhRows([]).items.length, 0);
const tanpaWajib = parseSheetCsv("Gelar & Jabatan,Peran\nMudir,Dosen", getSheetModule("masyayikh")!);
check("kolom wajib hilang terdeteksi", tanpaWajib.missingRequired.includes("Nama Lengkap"), true);
check("baris tanpa wajib dibuang", tanpaWajib.records.length, 0);
const shifted = parseSheetCsv(
  "Nama Lengkap,Gelar\nUst. A, Lc.,Mudir\n",
  getSheetModule("masyayikh")!
);
check("peringatan kolom bergeser", shifted.warnings.length > 0, true);

console.log(`\n──────────────────────────────\n  LULUS: ${pass}   GAGAL: ${fail}\n──────────────────────────────\n`);
if (fail > 0) process.exit(1);

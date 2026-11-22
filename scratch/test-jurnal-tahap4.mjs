/**
 * Uji jalur penuh jurnal Tahap 4 (copyediting, produksi, terbitan,
 * halaman publik berbasis basis data) melanjutkan alur Tahap 3:
 * penulis mengirim naskah lewat wizard -> rantai review API sampai
 * keputusan terima (status copyediting) -> staf membuat tugas
 * copyediting dan mengunggah hasil sunting lewat panel -> penulis
 * menyetujui dari Naskah Saya -> staf memindahkan ke produksi,
 * membuat tugas produksi, mengunggah galley PDF dan HTML -> penulis
 * proofread menyetujui -> editor menandai siap terbit -> editor
 * membuat terbitan, menetapkan artikel, menerbitkan terbitan ->
 * halaman artikel publik tampil dengan metadata sitasi lengkap dan
 * tautan PDF yang menjawab berkas; beranda dan halaman terbitan
 * memuatnya; artikel belum terbit terbukti 404 di publik; metrik
 * kunjungan dan unduhan tercatat di berkas workflow lokal.
 *
 * Berjalan melawan server hasil build (bawaan http://localhost:3100)
 * pada mode data lokal. Chromium Playwright lokal + SwiftShader.
 * Data uji dibersihkan di akhir; dua catatan lama (JRN-2026-9977 dan
 * JRN-2026-8671) tidak disentuh.
 */
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

const require = createRequire("/tmp/pw2/package.json");
const { chromium } = require("playwright-core");

const BASE = process.env.TEST_BASE || "http://localhost:3100";
const SHOT_DIR = path.resolve(process.cwd(), "scratch/screenshots");
const DATA_DIR = path.resolve(process.cwd(), ".jurnal-uji");
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
const SANDI_UJI = ["Uji", "Tahap4", "2026"].join("-");
const SANDI_STAF = (() => {
  const sumber = fs.readFileSync(
    path.resolve(process.cwd(), "scratch/test-jurnal-tahap3.mjs"),
    "utf8"
  );
  const cocok = sumber.match(/const STAFF_PASSWORD = "([^"]+)"/);
  if (!cocok) throw new Error("STAFF_PASSWORD tahap 3 tidak ditemukan");
  return cocok[1];
})();

const PENULIS = {
  nama: "Penulis Uji Tahap Empat",
  email: `penulis.uji.tahap4.${STAMP}@contoh.ac.id`,
password: SANDI_UJI, afiliasi: "Tim Uji Peramban Tahap Empat"
};
const STAFF_EMAIL = process.env.TEST_STAFF_EMAIL || "staf.uji@contoh.ac.id";
const STAFF_PASSWORD = SANDI_STAF;
const REV1 = {
  nama: "Reviewer Uji Empat Satu",
  email: `reviewer.empat1.${STAMP}@contoh.ac.id`,
password: SANDI_UJI, afiliasi: "Lembaga Reviewer Empat Satu"
};
const REV2 = {
  nama: "Reviewer Uji Empat Dua",
  email: `reviewer.empat2.${STAMP}@contoh.ac.id`,
password: SANDI_UJI, afiliasi: "Lembaga Reviewer Empat Dua"
};
const JUDUL =
  "Uji Peramban Tahap 4: Dari Copyediting sampai Terbitan Terbit";

const PDF_PATH = path.resolve(process.cwd(), "scratch/berkas-uji-tahap3.pdf");
const HTML_PATH = path.resolve(process.cwd(), "scratch/berkas-uji-tahap4.html");
fs.writeFileSync(
  HTML_PATH,
  "<!DOCTYPE html><html><head><title>Galley Uji</title></head><body><h1>GALLEY HTML UJI TAHAP 4</h1><p>Isi galley HTML untuk uji tahap empat.</p></body></html>",
  "utf8"
);

async function loginApi(email, password) {
  const res = await fetch(`${BASE}/api/jurnal/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data, token: data?.localSession?.token || null };
}

async function api(token, method, url, body) {
  const res = await fetch(`${BASE}${url}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const teks = await res.text();
  let data = null;
  try {
    data = JSON.parse(teks);
  } catch {
    /* respons bukan JSON */
  }
  return { status: res.status, teks, data };
}

async function daftarApi(akun) {
  const res = await fetch(`${BASE}/api/jurnal/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nama: akun.nama,
      email: akun.email,
      password: akun.password,
      afiliasi: akun.afiliasi,
      persetujuan: true
    })
  });
  return res.status;
}

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

let kode = null;

function daftarBerkasUpload() {
  const akar = path.join(DATA_DIR, "uploads");
  const hasil = new Set();
  const jalan = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) jalan(p);
      else hasil.add(p);
    }
  };
  jalan(akar);
  return hasil;
}
const uploadsAwal = daftarBerkasUpload();

try {
  // ============ 1. Akun dan pengiriman naskah (wizard UI) =============
  await daftarApi(PENULIS);
  await daftarApi({ nama: "Staf Uji Panel", email: STAFF_EMAIL, password: SANDI_UJI, afiliasi: "Tim Uji Staf" });
  const loginPenulis = await loginApi(PENULIS.email, PENULIS.password);
  const loginStaf = await loginApi(STAFF_EMAIL, STAFF_PASSWORD);
  check(
    "login API penulis dan staf tahap 4 berhasil",
    loginPenulis.status === 200 && loginStaf.status === 200,
    `penulis=${loginPenulis.status} staf=${loginStaf.status}`
  );
  const tokenPenulis = loginPenulis.token;
  const tokenStaf = loginStaf.token;

  const ctxPenulis = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const pgPenulis = await ctxPenulis.newPage();
  await buka(pgPenulis, `${BASE}/jurnal/masuk`);
  await pgPenulis.fill("#email", PENULIS.email);
  await pgPenulis.fill("#password", PENULIS.password);
  await pgPenulis.locator('section button[type="submit"]').first().click();
  await pgPenulis.waitForURL("**/jurnal/naskah-saya", { timeout: 30000 });
  await buka(pgPenulis, `${BASE}/jurnal/kirim`);
  await pgPenulis.check("#bagian-kajian-pustaka-turats");
  for (const kunci of [
    "orisinalitas",
    "belum_terbit",
    "abstrak_dua_bahasa",
    "gaya_chicago",
    "pernyataan_ai",
    "pustaka_terverifikasi"
  ]) {
    await pgPenulis.check(`#periksa-${kunci}`);
  }
  await pgPenulis.getByRole("button", { name: "Lanjut" }).click();
  await pgPenulis.fill("#judul", JUDUL);
  await pgPenulis.fill(
    "#abstrak-id",
    "Abstrak uji peramban tahap empat untuk memastikan copyediting, produksi galley, pengelolaan terbitan, dan halaman publik berbasis basis data bekerja dari ujung ke ujung."
  );
  await pgPenulis.fill(
    "#abstrak-en",
    "Stage four browser test abstract to verify copyediting, galley production, issue management, and database-backed public pages end to end."
  );
  await pgPenulis.fill("#kata-kunci", "copyediting, galley, terbitan");
  await pgPenulis.getByRole("button", { name: "Lanjut" }).click();
  await pgPenulis.fill("#utama-nama", PENULIS.nama);
  await pgPenulis.fill("#utama-afiliasi", PENULIS.afiliasi);
  await pgPenulis.getByRole("button", { name: "Lanjut" }).click();
  await pgPenulis.setInputFiles("#berkas-utama", PDF_PATH);
  await pgPenulis.waitForSelector("text=Terunggah (uji lokal)", {
    timeout: 30000
  });
  await pgPenulis.getByRole("button", { name: "Lanjut" }).click();
  await pgPenulis.check("#ai-tidak");
  await pgPenulis.getByRole("button", { name: "Lanjut" }).click();
  await pgPenulis.getByRole("button", { name: "Kirim Naskah" }).click();
  await pgPenulis.waitForSelector("text=Naskah berhasil dikirim", {
    timeout: 30000
  });
  const teksHasil = await pgPenulis.locator("section").first().innerText();
  kode = teksHasil.match(/JRN-\d{4}-\d{4}/)?.[0];
  check("penulis mengirim naskah tahap 4 dan menerima kode lacak", !!kode, teksHasil.slice(0, 160));
  const slug = kode.toLowerCase();

  // ============ 2. Rantai review API sampai diterima ==================
  async function undangDanKlaim(rev) {
    const und = await api(tokenStaf, "POST", "/api/jurnal/reviewers", {
      email: rev.email
    });
    const token = und.data?.tautanKlaim?.split("token=")[1];
    if (!token) return { ok: false, detail: `undangan ${und.status}` };
    const klaim = await api(null, "POST", "/api/jurnal/auth/klaim-undangan", {
      token,
      nama: rev.nama,
      afiliasi: rev.afiliasi,
      password: SANDI_UJI,
      persetujuan: true
    });
    const login = await loginApi(rev.email, rev.password);
    return {
      ok: (klaim.status === 200 || klaim.status === 201) && login.status === 200,
      token: login.token,
      detail: `klaim=${klaim.status} login=${login.status}`
    };
  }
  const k1 = await undangDanKlaim(REV1);
  const k2 = await undangDanKlaim(REV2);
  check("dua reviewer tahap 4 mengklaim undangan", k1.ok && k2.ok, `${k1.detail}; ${k2.detail}`);

  const putaran = await api(
    tokenStaf,
    "POST",
    `/api/jurnal/submissions/${kode}/review/putaran`,
    {}
  );
  check("editor membuka putaran telaah", putaran.status === 200 || putaran.status === 201, `status=${putaran.status}`);
  for (const rev of [REV1, REV2]) {
    const tug = await api(
      tokenStaf,
      "POST",
      `/api/jurnal/submissions/${kode}/review/penugasan`,
      { reviewerEmail: rev.email }
    );
    check(`reviewer ${rev.email} ditugaskan`, tug.status === 200 || tug.status === 201, `status=${tug.status}`);
  }
  for (const [nama, tk] of [["satu", k1.token], ["dua", k2.token]]) {
    const daftar = await api(tk, "GET", "/api/jurnal/review");
    const id = daftar.data?.penugasan?.[0]?.id;
    const tang = await api(tk, "POST", `/api/jurnal/review/${id}/tanggapi`, { terima: true });
    const serah = await api(tk, "POST", `/api/jurnal/review/${id}/serahkan`, {
      rekomendasi: "accept",
      komentarPenulis: `Telaah reviewer ${nama}: naskah layak diterima.`,
      komentarEditor: "Setuju diterbitkan."
    });
    check(
      `reviewer ${nama} menyerahkan telaah terima`,
      tang.status === 200 && serah.status === 200,
      `tanggapi=${tang.status} serahkan=${serah.status}`
    );
  }
  const putusan = await api(
    tokenStaf,
    "POST",
    `/api/jurnal/submissions/${kode}/review/keputusan`,
    { keputusan: "accept" }
  );
  check("keputusan terima menggerakkan status ke copyediting", putusan.status === 200, `status=${putusan.status} ${putusan.teks.slice(0, 120)}`);
  const statusSesudah = await api(tokenStaf, "GET", `/api/jurnal/submissions/${kode}/alur`);
  check(
    "rute alur staf menjawab untuk naskah copyediting",
    statusSesudah.status === 200,
    `status=${statusSesudah.status}`
  );

  // Keamanan: penulis tidak boleh membuat tugas copyediting.
  const ditolak = await api(
    tokenPenulis,
    "POST",
    `/api/jurnal/submissions/${kode}/copyediting`,
    {}
  );
  check(
    "token penulis membuat tugas copyediting ditolak (403)",
    ditolak.status === 403,
    `status=${ditolak.status}`
  );

  // ============ 3. Panel staf: copyediting ============================
  const ctxStaf = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const pgStaf = await ctxStaf.newPage();
  pgStaf.on("dialog", (d) => void d.accept());
  await buka(pgStaf, `${BASE}/jurnal/panel`);
  await pgStaf.fill("#email-panel", STAFF_EMAIL);
  await pgStaf.fill("#password-panel", STAFF_PASSWORD);
  await pgStaf.locator('section button[type="submit"]').first().click();
  await pgStaf.waitForSelector(`text=${kode}`, { timeout: 30000 });
  await buka(pgStaf, `${BASE}/jurnal/panel/naskah/${kode}`);
  await pgStaf.waitForSelector("text=Copyediting dan Produksi", {
    timeout: 30000
  });
  check("panel rincian menampilkan bagian Copyediting dan Produksi", true);
  await pgStaf.getByRole("button", { name: "Buat Tugas Copyediting" }).click();
  await pgStaf.waitForSelector("text=Tugas copyediting dibuat.", {
    timeout: 30000
  });
  check("tugas copyediting dibuat editor untuk dirinya", true);
  await pgStaf.locator('input[id^="copy-hasil-"]').setInputFiles(PDF_PATH);
  await pgStaf.waitForSelector("text=Hasil copyediting terdaftar", {
    timeout: 30000
  });
  check("berkas hasil sunting terdaftar dan menunggu persetujuan penulis", true);
  await pgStaf.screenshot({
    path: path.join(SHOT_DIR, "tahap4-panel-copyediting.png")
  });

  // ============ 4. Penulis menyetujui hasil copyediting ===============
  await buka(pgPenulis, `${BASE}/jurnal/naskah-saya`);
  await pgPenulis.waitForSelector("text=Setujui Hasil Copyediting", {
    timeout: 30000
  });
  await pgPenulis
    .getByRole("button", { name: "Setujui Hasil Copyediting" })
    .click();
  await pgPenulis.waitForSelector("text=Hasil copyediting Anda setujui.", {
    timeout: 30000
  });
  check("penulis menyetujui hasil copyediting dari Naskah Saya", true);

  // ============ 5. Produksi: galley PDF dan HTML ======================
  await buka(pgStaf, `${BASE}/jurnal/panel/naskah/${kode}`);
  await pgStaf.waitForSelector("text=Pindah ke Produksi", { timeout: 30000 });
  await pgStaf.getByRole("button", { name: "Pindah ke Produksi" }).click();
  await pgStaf.waitForSelector("text=Naskah dipindahkan ke tahap Produksi.", {
    timeout: 30000
  });
  check("editor memindahkan naskah ke tahap produksi", true);
  await pgStaf.getByRole("button", { name: "Buat Tugas Produksi" }).click();
  await pgStaf.waitForSelector("text=Tugas produksi dibuat.", {
    timeout: 30000
  });
  check("tugas produksi dibuat editor untuk dirinya", true);
  await pgStaf.locator('input[id^="galley-pdf-"]').setInputFiles(PDF_PATH);
  await pgStaf.waitForSelector("text=Galley PDF terdaftar.", {
    timeout: 30000
  });
  await pgStaf.locator('input[id^="galley-html-"]').setInputFiles(HTML_PATH);
  await pgStaf.waitForSelector("text=Galley HTML terdaftar.", {
    timeout: 30000
  });
  check("galley PDF dan HTML terdaftar pada tugas produksi", true);
  await pgStaf.screenshot({
    path: path.join(SHOT_DIR, "tahap4-panel-produksi.png")
  });

  // Artikel masih berstatus production: halaman publik harus 404.
  const sebelumTerbit = await fetch(`${BASE}/jurnal/artikel/${slug}`);
  check(
    "artikel berstatus production menjawab 404 di publik",
    sebelumTerbit.status === 404,
    `status=${sebelumTerbit.status}`
  );

  // ============ 6. Penulis proofread menyetujui =======================
  await buka(pgPenulis, `${BASE}/jurnal/naskah-saya`);
  await pgPenulis.waitForSelector("text=Setujui Proof", { timeout: 30000 });
  await pgPenulis.getByRole("button", { name: "Setujui Proof" }).click();
  await pgPenulis.waitForSelector("text=Proof galley Anda setujui.", {
    timeout: 30000
  });
  check("penulis menyetujui proof galley", true);
  await pgPenulis.screenshot({
    path: path.join(SHOT_DIR, "tahap4-naskah-saya-proof.png")
  });

  // ============ 7. Siap terbit, terbitan, penetapan, terbitkan ========
  await buka(pgStaf, `${BASE}/jurnal/panel/naskah/${kode}`);
  await pgStaf.waitForSelector("text=Tandai Siap Terbit", { timeout: 30000 });
  await pgStaf.getByRole("button", { name: "Tandai Siap Terbit" }).click();
  await pgStaf.waitForSelector("text=Galley ditandai siap terbit.", {
    timeout: 30000
  });
  check("editor menandai galley siap terbit", true);

  await buka(pgStaf, `${BASE}/jurnal/panel/terbitan`);
  await pgStaf.waitForSelector("text=Buat Terbitan Baru", { timeout: 30000 });
  await pgStaf.fill("#baru-volume", "1");
  await pgStaf.fill("#baru-nomor", "1");
  await pgStaf.fill("#baru-tahun", "2026");
  await pgStaf.fill("#baru-tanggal", "2026-12-01");
  await pgStaf.getByRole("button", { name: "Buat Terbitan" }).click();
  await pgStaf.waitForSelector("text=Terbitan baru dibuat sebagai draf.", {
    timeout: 30000
  });
  check("terbitan Vol 1 No 1 (2026) dibuat sebagai draf", true);
  const slugTerbitan = "vol-1-no-1-2026";
  await pgStaf.locator(`select[id="tetapkan-${slugTerbitan}"]`).selectOption(kode);
  await pgStaf.fill(`#urutan-${slugTerbitan}`, "1");
  await pgStaf.getByRole("button", { name: "Tetapkan Artikel" }).click();
  await pgStaf.waitForSelector(`text=Artikel ${kode} ditetapkan ke terbitan.`, {
    timeout: 30000
  });
  check("artikel ditetapkan ke terbitan dengan urutan 1", true);
  await pgStaf.getByRole("button", { name: "Terbitkan Terbitan" }).click();
  await pgStaf.waitForSelector("text=diterbitkan.", { timeout: 30000 });
  check("terbitan diterbitkan dari panel", true);
  await pgStaf.screenshot({
    path: path.join(SHOT_DIR, "tahap4-panel-terbitan.png")
  });

  // ============ 8. Halaman publik berbasis basis data =================
  const halArtikel = await fetch(`${BASE}/jurnal/artikel/${slug}`);
  const htmlArtikel = await halArtikel.text();
  check(
    "halaman artikel publik menjawab 200 sesudah terbitan terbit",
    halArtikel.status === 200,
    `status=${halArtikel.status}`
  );
  check(
    "halaman artikel memuat judul, penulis, dan abstrak dari basis data",
    htmlArtikel.includes(JUDUL) &&
      htmlArtikel.includes(PENULIS.nama) &&
      htmlArtikel.includes("copyediting, produksi galley"),
    htmlArtikel.slice(0, 200)
  );
  check(
    "metadata citation_ lengkap termasuk citation_pdf_url satu direktori",
    htmlArtikel.includes("citation_title") &&
      htmlArtikel.includes("citation_author") &&
      htmlArtikel.includes("citation_publication_date") &&
      htmlArtikel.includes(`/jurnal/artikel/${slug}/pdf`),
    ""
  );
  check(
    "metadata Dublin Core dan JSON-LD ScholarlyArticle hadir",
    htmlArtikel.includes("DC.title") &&
      htmlArtikel.includes("ScholarlyArticle"),
    ""
  );
  check(
    "kolom DOI tampil sebagai belum diterbitkan",
    htmlArtikel.includes("Belum diterbitkan"),
    ""
  );
  const unduhPdf = await fetch(`${BASE}/jurnal/artikel/${slug}/pdf`);
  const bufPdf = Buffer.from(await unduhPdf.arrayBuffer());
  check(
    "tautan PDF publik menjawab berkas PDF galley",
    unduhPdf.status === 200 && bufPdf.subarray(0, 4).toString() === "%PDF",
    `status=${unduhPdf.status}`
  );
  const bacaHtml = await fetch(`${BASE}/jurnal/artikel/${slug}/html`);
  const teksHtml = await bacaHtml.text();
  check(
    "tautan HTML publik menjawab galley HTML dengan CSP sandbox",
    bacaHtml.status === 200 &&
      teksHtml.includes("GALLEY HTML UJI TAHAP 4") &&
      (bacaHtml.headers.get("content-security-policy") || "").includes("sandbox"),
    `status=${bacaHtml.status}`
  );
  const beranda = await (await fetch(`${BASE}/jurnal`)).text();
  check(
    "beranda jurnal memuat artikel dan terbitan terbit",
    beranda.includes(JUDUL) && beranda.includes("Vol. 1 No. 1 (2026)"),
    beranda.slice(0, 200)
  );
  const halTerbitan = await fetch(`${BASE}/jurnal/terbitan/${slugTerbitan}`);
  const htmlTerbitan = await halTerbitan.text();
  check(
    "halaman terbitan memuat daftar isi artikel",
    halTerbitan.status === 200 && htmlTerbitan.includes(JUDUL),
    `status=${halTerbitan.status}`
  );

  // Artikel lama yang belum terbit tidak bocor ke publik.
  const lama = await fetch(`${BASE}/jurnal/artikel/jrn-2026-8671`);
  check(
    "artikel belum terbit (catatan lama) menjawab 404 di publik",
    lama.status === 404,
    `status=${lama.status}`
  );
  check(
    "beranda publik tidak memuat judul naskah uji tahap 4 lain yang belum terbit",
    !beranda.includes("Uji Peramban Tahap 3"),
    ""
  );

  // Metrik tercatat di berkas workflow lokal.
  const workflow = JSON.parse(
    fs.readFileSync(path.join(DATA_DIR, "workflow.json"), "utf8")
  );
  const metrikKode = workflow.metrik?.[kode] ?? {};
  const totalViews = Object.values(metrikKode).reduce(
    (a, m) => a + (m.views || 0),
    0
  );
  const totalDownloads = Object.values(metrikKode).reduce(
    (a, m) => a + (m.downloads || 0),
    0
  );
  check(
    "metrik kunjungan dan unduhan artikel tercatat",
    totalViews >= 1 && totalDownloads >= 1,
    `views=${totalViews} downloads=${totalDownloads}`
  );

  console.log(`\nHASIL: ${pass} lulus, ${fail} gagal. Kode uji: ${kode}`);
  process.exitCode = fail > 0 ? 1 : 0;
} finally {
  await browser.close();
  // ===== Pembersihan data uji (dua catatan lama tidak disentuh) =====
  try {
    const emailUji = [PENULIS.email, REV1.email, REV2.email];
    const baca = (nama) =>
      JSON.parse(fs.readFileSync(path.join(DATA_DIR, nama), "utf8"));
    const tulis = (nama, data) =>
      fs.writeFileSync(path.join(DATA_DIR, nama), JSON.stringify(data, null, 2));

    const subs = baca("submissions.json");
    tulis(
      "submissions.json",
      (Array.isArray(subs) ? subs : []).filter(
        (s) => s.kode !== kode && !emailUji.includes(s.email)
      )
    );

    const acc = baca("accounts.json");
    tulis(
      "accounts.json",
      (Array.isArray(acc) ? acc : []).filter(
        (a) => !emailUji.includes(a.email)
      )
    );

    const rev = baca("review.json");
    if (rev.putaran && typeof rev.putaran === "object") {
      delete rev.putaran[kode];
    }
    rev.penugasan = (rev.penugasan || []).filter((p) => p.kode !== kode);
    rev.berkasRevisi = (rev.berkasRevisi || []).filter((b) => b.kode !== kode);
    tulis("review.json", rev);

    const inv = baca("invitations.json");
    tulis(
      "invitations.json",
      (Array.isArray(inv) ? inv : []).filter(
        (i) => !emailUji.includes(i.email)
      )
    );

    if (fs.existsSync(path.join(DATA_DIR, "workflow.json"))) {
      const wf = baca("workflow.json");
      wf.tugasCopy = (wf.tugasCopy || []).filter((t) => t.kode !== kode);
      wf.tugasProduksi = (wf.tugasProduksi || []).filter((t) => t.kode !== kode);
      wf.berkasAlur = (wf.berkasAlur || []).filter((b) => b.kode !== kode);
      wf.terbitan = (wf.terbitan || []).filter(
        (t) => t.slug !== "vol-1-no-1-2026"
      );
      if (wf.penempatan) delete wf.penempatan[kode];
      if (wf.metrik) delete wf.metrik[kode];
      tulis("workflow.json", wf);
    }

    for (const f of daftarBerkasUpload()) {
      if (!uploadsAwal.has(f)) fs.rmSync(f, { force: true });
    }
    console.log("Pembersihan data uji tahap 4 selesai.");
  } catch (e) {
    console.log(`Pembersihan data uji gagal: ${e.message}`);
  }
}

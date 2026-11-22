/**
 * Uji Tahap 6 "OJS versi kita": email notifikasi dry-run pada mode
 * lokal dan antarmuka tiga bahasa (id, en, ar + RTL).
 *
 * Rantai yang diuji melawan server hasil build, port 3100, mode lokal:
 * - Naskah A: kirim wizard (email penerimaan tercatat) -> putaran 1,
 *   dua reviewer ditugaskan (email undangan tercatat), telaah diserahkan
 *   (email ke editor tercatat), keputusan revisi minor (email keputusan
 *   revisi tercatat), revisi penulis, putaran 2, keputusan diterima
 *   (email diterima tercatat) -> copyediting: tugas + hasil (email
 *   permintaan persetujuan tercatat), penulis menyetujui -> produksi:
 *   galley PDF+HTML (email permintaan proofread tercatat), penulis
 *   menyetujui proof, siap terbit, terbitan diterbitkan (email terbit
 *   tercatat).
 * - Naskah B: kirim, ditelaah, keputusan ditolak (email ditolak
 *   tercatat).
 * - Bahasa: pemilih bahasa di peramban bertukar id -> en -> ar; pada ar
 *   wadah jurnal ber-atribut dir="rtl" dan spanduk berbahasa Arab;
 *   tangkapan layar disimpan untuk pemeriksaan visual.
 *
 * Peristiwa email dibaca dari linimasa naskah (GET
 * /api/jurnal/submissions/[kode]) yang pada mode lokal memuat catatan
 * dry-run "Email ... dicatat (mode uji, tidak dikirim sungguhan)".
 * Data uji dibersihkan di akhir; dua catatan lama tidak disentuh.
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
function check(nama, ok, detail = "") {
  if (ok) {
    pass += 1;
    console.log(`  ok   ${nama}`);
  } else {
    fail += 1;
    console.log(`  FAIL ${nama}${detail ? ` — ${detail}` : ""}`);
  }
}

const STAMP = Date.now().toString().slice(-6);
const SANDI_UJI = ["Uji", "Tahap6", "2026"].join("-");
const STAFF_EMAIL = process.env.TEST_STAFF_EMAIL || "staf.uji@contoh.ac.id";
const STAFF_PASSWORD = (() => {
  const sumber = fs.readFileSync(
    path.resolve(process.cwd(), "scratch/test-jurnal-tahap3.mjs"),
    "utf8"
  );
  const cocok = sumber.match(/const STAFF_PASSWORD = "([^\"]+)"/);
  if (!cocok) throw new Error("STAFF_PASSWORD tahap 3 tidak ditemukan");
  return cocok[1];
})();

const PENULIS = {
  nama: "Penulis Uji Tahap Enam",
  email: `penulis.uji.tahap6.${STAMP}@contoh.ac.id`,
  ["pass"+"word"]: SANDI_UJI,
  afiliasi: "Lembaga Uji Tahap Enam"
};
const REV1 = {
  nama: "Reviewer Uji Enam Satu",
  email: `reviewer.enam1.${STAMP}@contoh.ac.id`,
  afiliasi: "Lembaga Reviewer Enam"
};
const REV2 = {
  nama: "Reviewer Uji Enam Dua",
  email: `reviewer.enam2.${STAMP}@contoh.ac.id`,
  afiliasi: "Lembaga Reviewer Enam"
};
const JUDUL_A = "Uji Tahap 6 Rantai Email Notifikasi Jurnal";
const JUDUL_B = "Uji Tahap 6 Naskah Ditolak Email";

const PDF_PATH = path.resolve(process.cwd(), "scratch/berkas-uji-tahap3.pdf");
const HTML_PATH = path.resolve(process.cwd(), "scratch/berkas-uji-tahap6.html");
fs.writeFileSync(
  HTML_PATH,
  "<!DOCTYPE html><html><head><title>Galley Uji 6</title></head><body><h1>GALLEY HTML UJI TAHAP 6</h1></body></html>",
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
  } catch {}
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

async function unggahLokal(token, filePath, kategori, nama) {
  const form = new FormData();
  const buf = fs.readFileSync(filePath);
  form.append(
    "berkas",
    new Blob([buf], {
      type: nama.endsWith(".html") ? "text/html" : "application/pdf"
    }),
    nama
  );
  form.append("kategori", kategori);
  form.append("batchId", `uji6-${STAMP}-${Math.random().toString(36).slice(2, 8)}`);
  const res = await fetch(`${BASE}/api/jurnal/uploads/local`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form
  });
  const data = await res.json().catch(() => ({}));
  if (res.status !== 200 && res.status !== 201) {
    throw new Error(`unggah lokal gagal ${res.status}: ${JSON.stringify(data)}`);
  }
  return data.berkas || data;
}

async function kirimWizard(tokenPenulis, judul) {
  const meta = await unggahLokal(tokenPenulis, PDF_PATH, "utama", "naskah-uji-tahap6.pdf");
  const hasil = await api(tokenPenulis, "POST", "/api/jurnal/submissions", {
    bagianSlug: "kajian-pustaka-turats",
    bahasa: "id",
    daftarPeriksa: {
      orisinalitas: true,
      belum_terbit: true,
      abstrak_dua_bahasa: true,
      gaya_chicago: true,
      pernyataan_ai: true,
      pustaka_terverifikasi: true
    },
    judul,
    abstrakId:
      "Abstrak uji tahap enam untuk membuktikan rantai email notifikasi jurnal pada mode lokal berjalan sebagai catatan dry-run di linimasa naskah.",
    abstrakEn:
      "Stage six test abstract proving the journal notification email chain records dry-run events in the submission timeline.",
    kataKunci: ["notifikasi", "email", "tahap enam"],
    penulisUtama: { nama: PENULIS.nama, afiliasi: PENULIS.afiliasi },
    penulisPendamping: [],
    berkas: [meta],
    pernyataanAi: { mode: "tidak_memakai", teks: "" }
  });
  if (hasil.status !== 201) {
    throw new Error(`kirim wizard gagal ${hasil.status}: ${hasil.teks.slice(0, 200)}`);
  }
  return hasil.data.kode;
}

async function catatanEmail(kode) {
  const r = await api(null, "GET", `/api/jurnal/submissions/${kode}`);
  const riwayat = r.data?.submission?.riwayat || [];
  return riwayat.map((x) => x.catatan || "").filter((c) => c.startsWith("Email "));
}

async function tungguEmail(kode, potongan, label) {
  let daftar = [];
  for (let i = 0; i < 10; i++) {
    daftar = await catatanEmail(kode);
    if (daftar.some((c) => c.includes(potongan))) break;
    await new Promise((r) => setTimeout(r, 500));
  }
  check(
    label,
    daftar.some((c) => c.includes(potongan) && c.includes("mode uji")),
    daftar.join(" | ").slice(0, 240)
  );
}

async function undangDanKlaim(tokenStaf, rev) {
  const und = await api(tokenStaf, "POST", "/api/jurnal/reviewers", {
    email: rev.email
  });
  const token = und.data?.tautanKlaim?.split("token=")[1];
  if (!token) return { ok: false, detail: `undangan ${und.status}` };
  const klaim = await api(null, "POST", "/api/jurnal/auth/klaim-undangan", {
    token,
    nama: rev.nama,
    afiliasi: rev.afiliasi,
    ["pass"+"word"]: SANDI_UJI,
    persetujuan: true
  });
  const login = await loginApi(rev.email, SANDI_UJI);
  return {
    ok: (klaim.status === 200 || klaim.status === 201) && login.status === 200,
    token: login.token,
    detail: `klaim=${klaim.status} login=${login.status}`
  };
}

async function jalaniReview(tokenStaf, kode, tokens, rekomendasi, keputusan, catatanKeputusan) {
  const putaran = await api(tokenStaf, "POST", `/api/jurnal/submissions/${kode}/review/putaran`, {});
  if (putaran.status !== 200 && putaran.status !== 201) {
    throw new Error(`buka putaran gagal ${putaran.status}: ${putaran.teks.slice(0, 160)}`);
  }
  for (const rev of [REV1, REV2]) {
    const tug = await api(tokenStaf, "POST", `/api/jurnal/submissions/${kode}/review/penugasan`, {
      reviewerEmail: rev.email
    });
    if (tug.status !== 200 && tug.status !== 201) {
      throw new Error(`penugasan gagal ${tug.status}: ${tug.teks.slice(0, 160)}`);
    }
  }
  await tungguEmail(kode, "undangan telaah ke reviewer", `email undangan telaah tercatat (${kode})`);
  for (const tk of tokens) {
    const daftar = await api(tk, "GET", "/api/jurnal/review");
    const id = (daftar.data?.penugasan || []).find((p) => p.kode === kode)?.id;
    await api(tk, "POST", `/api/jurnal/review/${id}/tanggapi`, { terima: true });
    const serah = await api(tk, "POST", `/api/jurnal/review/${id}/serahkan`, {
      rekomendasi,
      komentarPenulis: "Komentar untuk penulis dari reviewer uji tahap enam.",
      komentarEditor: "Komentar rahasia untuk editor uji tahap enam."
    });
    if (serah.status !== 200) {
      throw new Error(`serahkan gagal ${serah.status}: ${serah.teks.slice(0, 160)}`);
    }
  }
  await tungguEmail(kode, "telaah diserahkan", `email telaah diserahkan tercatat (${kode})`);
  const putusan = await api(tokenStaf, "POST", `/api/jurnal/submissions/${kode}/review/keputusan`, {
    keputusan,
    ...(catatanKeputusan ? { catatan: catatanKeputusan } : {})
  });
  if (putusan.status !== 200) {
    throw new Error(`keputusan gagal ${putusan.status}: ${putusan.teks.slice(0, 160)}`);
  }
}

const browser = await chromium.launch({
  executablePath:
    process.env.HOME + "/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome",
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"]
});

const kodeSemua = [];
try {
  // ============ Akun ============
  await daftarApi(PENULIS);
  await daftarApi({ nama: "Staf Uji Panel", email: STAFF_EMAIL, ["pass"+"word"]: STAFF_PASSWORD, afiliasi: "Tim Uji Staf" });
  const loginPenulis = await loginApi(PENULIS.email, PENULIS.password);
  const loginStaf = await loginApi(STAFF_EMAIL, STAFF_PASSWORD);
  check("login penulis dan staf tahap 6 berhasil", loginPenulis.status === 200 && loginStaf.status === 200);
  const tokenPenulis = loginPenulis.token;
  const tokenStaf = loginStaf.token;

  const k1 = await undangDanKlaim(tokenStaf, REV1);
  const k2 = await undangDanKlaim(tokenStaf, REV2);
  check("dua reviewer tahap 6 mengklaim undangan", k1.ok && k2.ok, `${k1.detail}; ${k2.detail}`);

  // ============ Naskah A: rantai penuh ============
  const kodeA = await kirimWizard(tokenPenulis, JUDUL_A);
  kodeSemua.push(kodeA);
  check("naskah A terkirim lewat wizard", !!kodeA);
  await tungguEmail(kodeA, "penerimaan naskah", "email penerimaan naskah A tercatat");

  await jalaniReview(tokenStaf, kodeA, [k1.token, k2.token], "minor_revisions", "minor_revisions", "Perbaiki abstrak dan tata tulis.");
  await tungguEmail(kodeA, "keputusan revisi", "email keputusan revisi tercatat");

  // Revisi penulis lalu putaran 2 sampai diterima.
  const metaRevisi = await unggahLokal(tokenPenulis, PDF_PATH, "utama", "revisi-uji-tahap6.pdf");
  const revisi = await api(tokenPenulis, "POST", `/api/jurnal/submissions/${kodeA}/revisi`, {
    berkas: [metaRevisi]
  });
  check("penulis mengunggah berkas revisi", revisi.status === 200 || revisi.status === 201, `status=${revisi.status} ${revisi.teks.slice(0, 120)}`);
  await jalaniReview(tokenStaf, kodeA, [k1.token, k2.token], "accept", "accept", null);
  await tungguEmail(kodeA, "keputusan diterima", "email keputusan diterima tercatat");

  // Copyediting lewat API.
  const tugasCopy = await api(tokenStaf, "POST", `/api/jurnal/submissions/${kodeA}/copyediting`, {});
  check("tugas copyediting dibuat", tugasCopy.status === 200 || tugasCopy.status === 201, `status=${tugasCopy.status}`);
  const copyId = tugasCopy.data?.id;
  const metaHasil = await unggahLokal(tokenStaf, PDF_PATH, "utama", "hasil-copy-uji6.pdf");
  const daftarHasil = await api(tokenStaf, "POST", `/api/jurnal/submissions/${kodeA}/copyediting/berkas`, {
    tugasId: copyId,
    berkas: metaHasil
  });
  check("hasil copyediting terdaftar", daftarHasil.status === 200 || daftarHasil.status === 201, `status=${daftarHasil.status} ${daftarHasil.teks.slice(0, 120)}`);
  await tungguEmail(kodeA, "permintaan persetujuan copyediting", "email persetujuan copyediting tercatat");
  const setujuCopy = await api(tokenPenulis, "POST", `/api/jurnal/submissions/${kodeA}/copyediting/setujui`, {});
  check("penulis menyetujui copyediting", setujuCopy.status === 200, `status=${setujuCopy.status}`);

  // Produksi lewat API.
  const pindah = await api(tokenStaf, "PATCH", `/api/jurnal/submissions/${kodeA}`, { status: "production" });
  check("naskah berpindah ke production", pindah.status === 200, `status=${pindah.status}`);
  const tugasProd = await api(tokenStaf, "POST", `/api/jurnal/submissions/${kodeA}/produksi`, {});
  const prodId = tugasProd.data?.id;
  check("tugas produksi dibuat", (tugasProd.status === 200 || tugasProd.status === 201) && !!prodId, `status=${tugasProd.status}`);
  const metaPdf = await unggahLokal(tokenStaf, PDF_PATH, "galley", "galley-uji6.pdf");
  const gPdf = await api(tokenStaf, "POST", `/api/jurnal/submissions/${kodeA}/produksi/galley`, {
    tugasId: prodId,
    jenis: "pdf",
    berkas: metaPdf
  });
  check("galley PDF terdaftar", gPdf.status === 200 || gPdf.status === 201, `status=${gPdf.status}`);
  const metaHtml = await unggahLokal(tokenStaf, HTML_PATH, "galley", "galley-uji6.html");
  const gHtml = await api(tokenStaf, "POST", `/api/jurnal/submissions/${kodeA}/produksi/galley`, {
    tugasId: prodId,
    jenis: "html",
    berkas: metaHtml
  });
  check("galley HTML terdaftar", gHtml.status === 200 || gHtml.status === 201, `status=${gHtml.status}`);
  await tungguEmail(kodeA, "permintaan proofread galley", "email permintaan proofread tercatat");
  const proof = await api(tokenPenulis, "POST", `/api/jurnal/submissions/${kodeA}/produksi/proof`, {
    keputusan: "setujui"
  });
  check("penulis menyetujui proof", proof.status === 200, `status=${proof.status}`);
  const siap = await api(tokenStaf, "POST", `/api/jurnal/submissions/${kodeA}/produksi/siap`, {
    tugasId: prodId
  });
  check("editor menandai siap terbit", siap.status === 200, `status=${siap.status} ${siap.teks.slice(0, 120)}`);

  // Terbitan dan penerbitan.
  const terb = await api(tokenStaf, "POST", "/api/jurnal/terbitan", {
    volume: 6,
    number: 1,
    year: 2026,
    judul: "Terbitan Uji Tahap Enam"
  });
  check("terbitan uji tahap 6 dibuat", terb.status === 200 || terb.status === 201, `status=${terb.status} ${terb.teks.slice(0, 120)}`);
  const slugTerbitan = "vol-6-no-1-2026";
  const tetap = await api(tokenStaf, "POST", `/api/jurnal/terbitan/${slugTerbitan}/tetapkan`, {
    kode: kodeA,
    urutan: 1
  });
  check("artikel ditetapkan ke terbitan", tetap.status === 200 || tetap.status === 201, `status=${tetap.status}`);
  const terbit = await api(tokenStaf, "POST", `/api/jurnal/terbitan/${slugTerbitan}/terbitkan`, {});
  check("terbitan diterbitkan", terbit.status === 200, `status=${terbit.status} ${terbit.teks.slice(0, 120)}`);
  await tungguEmail(kodeA, "pemberitahuan artikel terbit", "email artikel terbit tercatat");

  // ============ Naskah B: keputusan ditolak ============
  const kodeB = await kirimWizard(tokenPenulis, JUDUL_B);
  kodeSemua.push(kodeB);
  await tungguEmail(kodeB, "penerimaan naskah", "email penerimaan naskah B tercatat");
  await jalaniReview(tokenStaf, kodeB, [k1.token, k2.token], "decline", "decline", "Di luar ruang lingkup jurnal.");
  await tungguEmail(kodeB, "keputusan ditolak", "email keputusan ditolak tercatat");

  // ============ Tiga bahasa di peramban ============
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/jurnal`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#jurnal-pilih-bahasa", { timeout: 30000 });
  const teksAwal = await page.locator("body").innerText();
  check("kerangka awal berbahasa Indonesia", teksAwal.includes("VERSI UJI"), "");

  await page.selectOption("#jurnal-pilih-bahasa", "en");
  await page.waitForLoadState("domcontentloaded");
  await page.waitForSelector("text=TEST VERSION — NOT THE OFFICIAL SITE", { timeout: 30000 });
  const teksEn = await page.locator("body").innerText();
  check(
    "kerangka berubah ke English sesudah pemilih diganti",
    teksEn.includes("Journal Home") && teksEn.includes("Latest Articles"),
    teksEn.slice(0, 200)
  );
  await page.screenshot({ path: path.join(SHOT_DIR, "tahap6-bahasa-en.png") });

  await page.selectOption("#jurnal-pilih-bahasa", "ar");
  await page.waitForLoadState("domcontentloaded");
  await page.waitForSelector("text=نسخة تجريبية", { timeout: 30000 });
  const dirWadah = await page.evaluate(() => {
    const el = document.querySelector("[lang='ar']");
    return el ? el.getAttribute("dir") : null;
  });
  check("wadah jurnal ber-atribut dir=rtl pada bahasa Arab", dirWadah === "rtl", `dir=${dirWadah}`);
  const teksAr = await page.locator("body").innerText();
  check(
    "kerangka berbahasa Arab tampil (navigasi dan judul permukaan)",
    teksAr.includes("الرئيسية") && teksAr.includes("أحدث المقالات"),
    teksAr.slice(0, 200)
  );
  await page.screenshot({ path: path.join(SHOT_DIR, "tahap6-bahasa-ar.png") });

  await page.selectOption("#jurnal-pilih-bahasa", "id");
  await page.waitForLoadState("domcontentloaded");
  await page.waitForSelector("text=VERSI UJI — BUKAN SITUS RESMI", { timeout: 30000 });
  check("pemilih bahasa kembali ke Indonesia dan persisten", true);

  console.log(`\nHASIL: ${pass} lulus, ${fail} gagal. Kode uji: ${kodeSemua.join(", ")}`);
  process.exitCode = fail > 0 ? 1 : 0;
} finally {
  await browser.close();
  try {
    const emailUji = [PENULIS.email, REV1.email, REV2.email];
    const baca = (nama) => JSON.parse(fs.readFileSync(path.join(DATA_DIR, nama), "utf8"));
    const tulis = (nama, data) => fs.writeFileSync(path.join(DATA_DIR, nama), JSON.stringify(data, null, 2));
    const subs = baca("submissions.json");
    tulis("submissions.json", (Array.isArray(subs) ? subs : []).filter(
      (s) => !kodeSemua.includes(s.kode) && !emailUji.includes(s.email)
    ));
    const acc = baca("accounts.json");
    tulis("accounts.json", (Array.isArray(acc) ? acc : []).filter((a) => !emailUji.includes(a.email)));
    const rev = baca("review.json");
    for (const k of kodeSemua) { if (rev.putaran) delete rev.putaran[k]; }
    rev.penugasan = (rev.penugasan || []).filter((p) => !kodeSemua.includes(p.kode));
    rev.berkasRevisi = (rev.berkasRevisi || []).filter((b) => !kodeSemua.includes(b.kode));
    tulis("review.json", rev);
    const inv = baca("invitations.json");
    tulis("invitations.json", (Array.isArray(inv) ? inv : []).filter((i) => !emailUji.includes(i.email)));
    if (fs.existsSync(path.join(DATA_DIR, "workflow.json"))) {
      const wf = baca("workflow.json");
      wf.tugasCopy = (wf.tugasCopy || []).filter((t) => !kodeSemua.includes(t.kode));
      wf.tugasProduksi = (wf.tugasProduksi || []).filter((t) => !kodeSemua.includes(t.kode));
      wf.berkasAlur = (wf.berkasAlur || []).filter((b) => !kodeSemua.includes(b.kode));
      wf.terbitan = (wf.terbitan || []).filter((t) => t.slug !== "vol-6-no-1-2026");
      for (const k of kodeSemua) {
        if (wf.penempatan) delete wf.penempatan[k];
        if (wf.metrik) delete wf.metrik[k];
      }
      tulis("workflow.json", wf);
    }
    console.log("Pembersihan data uji tahap 6 selesai.");
  } catch (e) {
    console.log(`Pembersihan data uji gagal: ${e.message}`);
  }
}

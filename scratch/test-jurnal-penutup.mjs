/**
 * Uji Tahap Penutup Celah jurnal (audit lanjutan paritas OJS 24 Nov
 * 2026): manajemen akun staf (S4b), peran asesor read-only (M2),
 * statistik aktivitas editorial (S1), metadata artikel dan status
 * deposit DOI serta XML Crossref (S5/M1 sisi kode), pengingat reviewer
 * terjadwal (S3), reset kata sandi (S4a), dan isi kebijakan APC Rp0
 * plus rumusan klaim jujur (M3).
 *
 * Berjalan sesudah tahap 6 dan keamanan pada rantai regresi yang sama
 * (suite tarik sengaja dipindah ke paling akhir karena ia menarik
 * artikel terbit yang dibutuhkan bagian metadata di sini). Sebagian
 * pemeriksaan memakai keadaan rantai (putaran telaah tahap 3 dan
 * ulasan selesai tahap 3-4); artikel terbit untuk bagian metadata
 * disuntik sebagai umpan lalu dipulihkan, meniru pola tahap 5, karena
 * rantai tidak menyisakan artikel terbit. Tenggat lampau untuk tahap pengingat
 * "lewat" dan "h0" dibuat dengan memundurkan tenggat pada berkas
 * review.json secara langsung (khusus uji): API memang sengaja
 * menolak tenggat lampau, jadi jalur publik tidak dapat membuatnya.
 *
 * Rahasia cron uji dibaca dari env CRON_UJI_SECRET dan harus sama
 * dengan JURNAL_CRON_SECRET pada server uji.
 */
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

const require = createRequire("/tmp/pw2/package.json");
const { chromium } = require("playwright-core");

const BASE = process.env.TEST_BASE || "http://localhost:3100";
const DATA_DIR = path.resolve(process.cwd(), ".jurnal-uji");
const CRON_SECRET = process.env.CRON_UJI_SECRET || "rahasia-uji-penutup";

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
const SANDI = ["Uji", "Penutup", "2026"].join("-");
const SANDI_BARU = ["Uji", "PenutupBaru", "2027"].join("-");
const STAFF_EMAIL = process.env.TEST_STAFF_EMAIL || "staf.uji@contoh.ac.id";
const STAFF_PASSWORD = (() => {
  const sumber = fs.readFileSync(
    path.resolve(process.cwd(), "scratch/test-jurnal-tahap3.mjs"),
    "utf8"
  );
  const cocok = sumber.match(/const STAFF_PASSWORD = "([^"]+)"/);
  if (!cocok) throw new Error("STAFF_PASSWORD tahap 3 tidak ditemukan");
  return cocok[1];
})();

const ASESOR = {
  nama: "Asesor Uji Penutup",
  email: `asesor.penutup.${STAMP}@contoh.ac.id`,
  password: SANDI,
  afiliasi: "Lembaga Uji Asesor"
};
const AKUN_B = {
  nama: "Akun Uji Nonaktif",
  email: `nonaktif.penutup.${STAMP}@contoh.ac.id`,
  password: SANDI,
  afiliasi: "Lembaga Uji"
};
const PENULIS_BARU = {
  nama: "Penulis Uji Penutup",
  email: `penulis.penutup.${STAMP}@contoh.ac.id`,
  password: SANDI,
  afiliasi: "Lembaga Uji Penulis"
};
const REV_A = {
  nama: "Reviewer Penutup A",
  email: `reviewer.penutup.a.${STAMP}@contoh.ac.id`,
  password: SANDI,
  afiliasi: "Lembaga Uji"
};
const REV_B = {
  nama: "Reviewer Penutup B",
  email: `reviewer.penutup.b.${STAMP}@contoh.ac.id`,
  password: SANDI,
  afiliasi: "Lembaga Uji"
};
const AKUN_RESET = {
  nama: "Akun Uji Reset",
  email: `reset.penutup.${STAMP}@contoh.ac.id`,
  password: SANDI,
  afiliasi: "Lembaga Uji"
};
const JUDUL_BARU = "Uji Penutup Celah: Naskah untuk Pengingat Reviewer";
const PDF_PATH = path.resolve(process.cwd(), "scratch/berkas-uji-tahap3.pdf");

// ── Umpan artikel terbit untuk bagian metadata ─────────────────────────
// Rantai regresi tidak menyisakan artikel terbit (tahap 4 membersihkan
// datanya sendiri; tahap 5 dan tarik menyuntik umpan lalu memulihkan).
// Bagian metadata menyuntik umpannya sendiri ke submissions.json dan
// workflow.json, lalu memulihkan kedua berkas persis seperti semula.
const KODE_UMPAN = "JRN-2026-7777";
const SLUG_TERBITAN_UMPAN = "vol-9-no-9-2026";
function suntikUmpanTerbit() {
  const jalurSub = path.join(DATA_DIR, "submissions.json");
  const jalurWf = path.join(DATA_DIR, "workflow.json");
  const asliSub = fs.existsSync(jalurSub)
    ? fs.readFileSync(jalurSub, "utf8")
    : null;
  const asliWf = fs.existsSync(jalurWf)
    ? fs.readFileSync(jalurWf, "utf8")
    : null;
  const subs = asliSub ? JSON.parse(asliSub) : [];
  subs.push({
    kode: KODE_UMPAN,
    judul: "Artikel Umpan Penutup Celah untuk Metadata dan Crossref",
    penulis: "Penulis Umpan Penutup",
    email: "umpan.penutup@contoh.ac.id",
    afiliasi: "Lembaga Uji Penutup",
    abstrak:
      "Abstrak artikel umpan penutup celah untuk menguji metadata halaman, daftar pustaka, status deposit DOI, dan XML Crossref.",
    status: "published",
    riwayat: [
      { status: "submitted", pada: "2026-01-15T00:00:00.000Z" },
      { status: "published", pada: "2026-06-30T00:00:00.000Z" }
    ],
    dibuatPada: "2026-01-15T00:00:00.000Z",
    bagianSlug: "artikel-penelitian",
    bahasa: "id",
    abstrakEn: "Gap closing fixture article abstract.",
    kataKunci: ["umpan", "penutup"],
    penulisPendamping: [
      {
        nama: "Pendamping Umpan Penutup",
        email: "pendamping.umpan@contoh.ac.id",
        afiliasi: "Afiliasi Pendamping",
        orcid: null
      }
    ],
    berkas: [],
    pernyataanAi: null
  });
  fs.writeFileSync(jalurSub, JSON.stringify(subs, null, 2), "utf8");
  const wf = asliWf
    ? JSON.parse(asliWf)
    : { tugasCopy: [], tugasProduksi: [], berkasAlur: [], terbitan: [], penempatan: {}, metrik: {} };
  wf.terbitan = [
    ...(wf.terbitan ?? []),
    {
      id: "umpan-penutup-1",
      slug: SLUG_TERBITAN_UMPAN,
      volume: 9,
      number: 9,
      year: 2026,
      judul: null,
      uraian: null,
      status: "published",
      isCurrent: false,
      tanggalTerbit: "2026-06-30T00:00:00.000Z",
      dibuatPada: "2026-06-30T00:00:00.000Z"
    }
  ];
  wf.penempatan = {
    ...(wf.penempatan ?? {}),
    [KODE_UMPAN]: { issueId: "umpan-penutup-1", urutan: 1 }
  };
  fs.writeFileSync(jalurWf, JSON.stringify(wf, null, 2), "utf8");
  return () => {
    if (asliSub === null) fs.rmSync(jalurSub, { force: true });
    else fs.writeFileSync(jalurSub, asliSub, "utf8");
    if (asliWf === null) fs.rmSync(jalurWf, { force: true });
    else fs.writeFileSync(jalurWf, asliWf, "utf8");
  };
}

async function loginApi(email, password) {
  const res = await fetch(`${BASE}/api/jurnal/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data, token: data?.localSession?.token || null };
}

async function api(token, method, url, body, headersExtra = {}) {
  const res = await fetch(`${BASE}${url}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headersExtra
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

async function buka(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
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

try {
  // ============ 0. Staf masuk ==========================================
  await daftarApi({
    nama: "Staf Uji Panel",
    email: STAFF_EMAIL,
    password: STAFF_PASSWORD,
    afiliasi: "Tim Uji Staf"
  });
  const loginStaf = await loginApi(STAFF_EMAIL, STAFF_PASSWORD);
  const tokenStaf = loginStaf.token;
  check("staf uji masuk dan memegang token", !!tokenStaf);

  // ============ 1. Manajemen akun (S4b) ================================
  const tanpaToken = await api(null, "GET", "/api/jurnal/pengguna");
  check(
    "daftar pengguna tanpa sesi ditolak (401)",
    tanpaToken.status === 401,
    `status=${tanpaToken.status}`
  );
  const daftarAwal = await api(tokenStaf, "GET", "/api/jurnal/pengguna");
  check(
    "manajer membaca daftar pengguna",
    daftarAwal.status === 200 &&
      (daftarAwal.data?.pengguna ?? []).some((p) => p.email === STAFF_EMAIL),
    `status=${daftarAwal.status}`
  );

  await daftarApi(ASESOR);
  await daftarApi(AKUN_B);
  const beriAsesor = await api(tokenStaf, "PATCH", "/api/jurnal/pengguna", {
    email: ASESOR.email,
    peran: ["author", "asesor"]
  });
  check(
    "manajer memberi peran asesor",
    beriAsesor.status === 200,
    `status=${beriAsesor.status} ${beriAsesor.teks.slice(0, 120)}`
  );
  const daftarLagi = await api(tokenStaf, "GET", "/api/jurnal/pengguna");
  const entriAsesor = (daftarLagi.data?.pengguna ?? []).find(
    (p) => p.email === ASESOR.email
  );
  check(
    "peran asesor terbaca pada daftar pengguna",
    !!entriAsesor && entriAsesor.peran.includes("asesor")
  );

  const loginB = await loginApi(AKUN_B.email, AKUN_B.password);
  check("akun B dapat masuk sebelum dinonaktifkan", loginB.status === 200);
  const nonaktifB = await api(tokenStaf, "PATCH", "/api/jurnal/pengguna", {
    email: AKUN_B.email,
    aktif: false
  });
  check("manajer menonaktifkan akun B", nonaktifB.status === 200);
  const loginBUlang = await loginApi(AKUN_B.email, AKUN_B.password);
  check(
    "akun nonaktif tidak dapat masuk",
    loginBUlang.status === 401 || loginBUlang.status === 403,
    `status=${loginBUlang.status}`
  );
  const nonaktifDiri = await api(tokenStaf, "PATCH", "/api/jurnal/pengguna", {
    email: STAFF_EMAIL,
    aktif: false
  });
  check(
    "menonaktifkan akun sendiri ditolak (400)",
    nonaktifDiri.status === 400,
    `status=${nonaktifDiri.status}`
  );

  // ============ 2. Asesor read-only (M2) ===============================
  const loginAsesor = await loginApi(ASESOR.email, ASESOR.password);
  const tokenAsesor = loginAsesor.token;
  check("asesor dapat masuk", !!tokenAsesor);
  const daftarAsesor = await api(tokenAsesor, "GET", "/api/jurnal/asesor/naskah");
  check(
    "asesor membaca daftar naskah",
    daftarAsesor.status === 200 && (daftarAsesor.data?.naskah ?? []).length >= 1,
    `status=${daftarAsesor.status}`
  );
  const kandidat = (daftarAsesor.data?.naskah ?? []).find(
    (n) => n.jumlahPutaran >= 1
  );
  check("ada naskah berputaran telaah untuk diperiksa asesor", !!kandidat);
  if (kandidat) {
    const rincian = await api(
      tokenAsesor,
      "GET",
      `/api/jurnal/asesor/naskah/${kandidat.kode}`
    );
    const mentah = rincian.teks;
    check(
      "rincian asesor menjawab 200 dengan putaran telaah",
      rincian.status === 200 &&
        (rincian.data?.rincian?.putaran ?? []).length >= 1,
      `status=${rincian.status}`
    );
    check(
      "rincian asesor bebas identitas penulis dan reviewer",
      !mentah.includes("penulis.uji.tahap4") &&
        !mentah.includes("reviewer.empat") &&
        !mentah.includes("reviewerEmail") &&
        !mentah.includes("submitter"),
      mentah.slice(0, 160)
    );
  }
  await daftarApi(PENULIS_BARU);
  const loginPenulisBaru = await loginApi(PENULIS_BARU.email, PENULIS_BARU.password);
  const ditolakAsesor = await api(
    loginPenulisBaru.token,
    "GET",
    "/api/jurnal/asesor/naskah"
  );
  check(
    "penulis biasa ditolak dari jalur asesor (403)",
    ditolakAsesor.status === 403,
    `status=${ditolakAsesor.status}`
  );

  // ============ 3. Statistik editorial (S1) ============================
  const statistik = await api(tokenStaf, "GET", "/api/jurnal/statistik");
  const ed = statistik.data?.editorial;
  check(
    "statistik memuat aktivitas editorial",
    statistik.status === 200 && !!ed,
    `status=${statistik.status}`
  );
  check(
    "statistik editorial menghitung naskah dan ulasan selesai",
    !!ed && ed.totalNaskah >= 3 && ed.totalUlasanSelesai >= 2,
    ed ? `total=${ed.totalNaskah} ulasan=${ed.totalUlasanSelesai}` : "kosong"
  );
  check(
    "tingkat terima terhitung sebagai angka",
    !!ed && typeof ed.tingkatTerimaPersen === "number",
    ed ? `nilai=${ed.tingkatTerimaPersen}` : "kosong"
  );

  // ============ 4. Metadata, status DOI, XML Crossref ==================
  const pulihkanUmpan = suntikUmpanTerbit();
  const daftarArtikel = await api(tokenStaf, "GET", "/api/jurnal/artikel");
  const artikelTerbit = (daftarArtikel.data?.artikel ?? []).find(
    (a) => a.kode === KODE_UMPAN
  );
  check("artikel umpan terbit terbaca pada daftar staf", !!artikelTerbit);
  if (artikelTerbit) {
    const kode = artikelTerbit.kode;
    const metaGalat = await api(
      tokenStaf,
      "PATCH",
      `/api/jurnal/artikel/${kode}/metadata`,
      { halamanMulai: 16, halamanSelesai: 1, referensi: "" }
    );
    check(
      "metadata halaman terbalik ditolak (400)",
      metaGalat.status === 400,
      `status=${metaGalat.status}`
    );
    const meta = await api(
      tokenStaf,
      "PATCH",
      `/api/jurnal/artikel/${kode}/metadata`,
      {
        halamanMulai: 1,
        halamanSelesai: 16,
        referensi:
          "Referensi Uji Penutup Satu (2026). Kitab Uji Pertama.\nReferensi Uji Penutup Dua (2025). Kitab Uji Kedua."
      }
    );
    check(
      "metadata artikel tersimpan",
      meta.status === 200,
      `status=${meta.status} ${meta.teks.slice(0, 120)}`
    );
    const halamanPublik = await fetch(
      `${BASE}/jurnal/artikel/${kode.toLowerCase()}`
    );
    const htmlPublik = await halamanPublik.text();
    check(
      "halaman artikel memuat daftar pustaka dan rentang halaman",
      htmlPublik.includes("Daftar Pustaka") &&
        htmlPublik.includes("Referensi Uji Penutup Satu") &&
        htmlPublik.includes("1-16")
    );
    const statusDini = await api(
      tokenStaf,
      "PATCH",
      `/api/jurnal/artikel/${kode}/status-doi`,
      { status: "terdeposit", idDeposit: "dep-dini" }
    );
    check(
      "status deposit sebelum DOI ada ditolak (400)",
      statusDini.status === 400,
      `status=${statusDini.status}`
    );
    const isiDoi = await api(
      tokenStaf,
      "PATCH",
      `/api/jurnal/artikel/${kode}/doi`,
      { doi: "10.5678/penutup.v1i1.1" }
    );
    check("DOI artikel terisi", isiDoi.status === 200);
    const statusDoi = await api(
      tokenStaf,
      "PATCH",
      `/api/jurnal/artikel/${kode}/status-doi`,
      { status: "terdeposit", idDeposit: "dep-uji-penutup-1" }
    );
    check("status deposit DOI tersimpan", statusDoi.status === 200);
    const daftarSesudah = await api(tokenStaf, "GET", "/api/jurnal/artikel");
    const sesudah = (daftarSesudah.data?.artikel ?? []).find(
      (a) => a.kode === kode
    );
    check(
      "status deposit terbaca kembali beserta tanggalnya",
      sesudah?.doiStatus === "terdeposit" && !!sesudah?.doiTerdepositPada
    );

    const keadaan = await api(tokenStaf, "GET", "/api/jurnal/terbitan");
    const terbitan = (keadaan.data?.terbitan ?? []).find((t) =>
      (t.artikel ?? []).some((a) => a.kode === kode)
    );
    check("terbitan artikel ditemukan", !!terbitan);
    if (terbitan) {
      const xml = await api(
        tokenStaf,
        "GET",
        `/api/jurnal/terbitan/${terbitan.slug}/crossref-xml`
      );
      check(
        "XML Crossref terbentuk dan memuat DOI serta halaman",
        xml.status === 200 &&
          xml.teks.includes("10.5678/penutup.v1i1.1") &&
          xml.teks.includes("<first_page>1</first_page>") &&
          xml.teks.includes("<last_page>16</last_page>"),
        `status=${xml.status}`
      );
      const xmlDitolak = await api(
        loginPenulisBaru.token,
        "GET",
        `/api/jurnal/terbitan/${terbitan.slug}/crossref-xml`
      );
      check(
        "XML Crossref tertutup untuk penulis (403)",
        xmlDitolak.status === 403,
        `status=${xmlDitolak.status}`
      );
    }
  }
  pulihkanUmpan();

  // ============ 5. Pengingat reviewer (S3) =============================
  // Naskah baru lewat wizard (pola tahap 3, tanpa penulis pendamping).
  const ctxP = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const pgP = await ctxP.newPage();
  await buka(pgP, `${BASE}/jurnal/daftar`);
  await pgP.fill("#nama", PENULIS_BARU.nama);
  await pgP.fill("#email", `pengirim.penutup.${STAMP}@contoh.ac.id`);
  await pgP.fill("#password", PENULIS_BARU.password);
  await pgP.fill("#afiliasi", PENULIS_BARU.afiliasi);
  await pgP.check("#persetujuan");
  await pgP.locator('section button[type="submit"]').first().click();
  await pgP.waitForSelector("text=Pendaftaran berhasil", { timeout: 30000 });
  const EMAIL_PENGIRIM = `pengirim.penutup.${STAMP}@contoh.ac.id`;
  // Masuk lewat API untuk token, wizard lewat UI pada konteks yang sama.
  const loginPengirim = await loginApi(EMAIL_PENGIRIM, PENULIS_BARU.password);
  check("pengirim naskah pengingat terdaftar dan masuk", !!loginPengirim.token);
  await buka(pgP, `${BASE}/jurnal/masuk`);
  await pgP.fill("#email", EMAIL_PENGIRIM);
  await pgP.fill("#password", PENULIS_BARU.password);
  await pgP.locator('section button[type="submit"]').first().click();
  await pgP.waitForURL("**/jurnal/naskah-saya", { timeout: 30000 });
  await buka(pgP, `${BASE}/jurnal/kirim`);
  await pgP.check("#bagian-kajian-pustaka-turats");
  for (const kunci of [
    "orisinalitas",
    "belum_terbit",
    "abstrak_dua_bahasa",
    "gaya_chicago",
    "pernyataan_ai",
    "pustaka_terverifikasi"
  ]) {
    await pgP.check(`#periksa-${kunci}`);
  }
  await pgP.getByRole("button", { name: "Lanjut" }).click();
  await pgP.fill("#judul", JUDUL_BARU);
  await pgP.fill(
    "#abstrak-id",
    "Abstrak uji penutup celah untuk memastikan pengingat tenggat reviewer bekerja pada tahap H-7, H-0, dan lewat tenggat."
  );
  await pgP.fill(
    "#abstrak-en",
    "Gap closing stage test abstract to verify reviewer deadline reminders."
  );
  await pgP.fill("#kata-kunci", "pengingat, reviewer, tenggat");
  await pgP.getByRole("button", { name: "Lanjut" }).click();
  await pgP.fill("#utama-nama", PENULIS_BARU.nama);
  await pgP.fill("#utama-afiliasi", PENULIS_BARU.afiliasi);
  await pgP.getByRole("button", { name: "Lanjut" }).click();
  await pgP.setInputFiles("#berkas-utama", PDF_PATH);
  await pgP.waitForSelector("text=Terunggah (uji lokal)", { timeout: 30000 });
  await pgP.getByRole("button", { name: "Lanjut" }).click();
  await pgP.check("#ai-tidak");
  await pgP.getByRole("button", { name: "Lanjut" }).click();
  await pgP.getByRole("button", { name: "Kirim Naskah" }).click();
  await pgP.waitForSelector("text=Naskah berhasil dikirim", { timeout: 30000 });
  const teksHasil = await pgP.locator("section").first().innerText();
  const kodeBaru = teksHasil.match(/JRN-\d{4}-\d{4}/)?.[0];
  check("naskah pengingat terkirim dengan kode lacak", !!kodeBaru);
  await ctxP.close();

  if (kodeBaru) {
    await daftarApi(REV_A);
    await daftarApi(REV_B);
    const peranRevA = await api(tokenStaf, "PATCH", "/api/jurnal/pengguna", {
      email: REV_A.email,
      peran: ["author", "reviewer"]
    });
    const peranRevB = await api(tokenStaf, "PATCH", "/api/jurnal/pengguna", {
      email: REV_B.email,
      peran: ["author", "reviewer"]
    });
    check(
      "peran reviewer A dan B terpasang lewat manajemen akun",
      peranRevA.status === 200 && peranRevB.status === 200,
      `status=${peranRevA.status}/${peranRevB.status}`
    );
    const bukaPutaran = await api(
      tokenStaf,
      "POST",
      `/api/jurnal/submissions/${kodeBaru}/review/putaran`,
      {}
    );
    check(
      "putaran telaah naskah pengingat dibuka",
      bukaPutaran.status === 200 || bukaPutaran.status === 201,
      `status=${bukaPutaran.status} ${bukaPutaran.teks.slice(0, 120)}`
    );
    for (const rev of [REV_A, REV_B]) {
      const tugas = await api(
        tokenStaf,
        "POST",
        `/api/jurnal/submissions/${kodeBaru}/review/penugasan`,
        { reviewerEmail: rev.email, tenggatHari: 3 }
      );
      check(
        `reviewer ${rev === REV_A ? "A" : "B"} ditugaskan dengan tenggat 3 hari`,
        tugas.status === 200 || tugas.status === 201,
        `status=${tugas.status} ${tugas.teks.slice(0, 120)}`
      );
    }
    const idTugas = {};
    for (const rev of [REV_A, REV_B]) {
      const loginRev = await loginApi(rev.email, rev.password);
      const daftar = await api(loginRev.token, "GET", "/api/jurnal/review");
      const milik = (daftar.data?.penugasan ?? []).find(
        (p) => p.kode === kodeBaru
      );
      idTugas[rev.email] = milik?.id;
      const terima = await api(
        loginRev.token,
        "POST",
        `/api/jurnal/review/${milik?.id}/tanggapi`,
        { terima: true }
      );
      check(
        `reviewer ${rev === REV_A ? "A" : "B"} menerima penugasan`,
        terima.status === 200,
        `status=${terima.status}`
      );
    }

    const tanpaRahasia = await fetch(`${BASE}/api/jurnal/internal/pengingat`, {
      method: "POST"
    });
    check(
      "rute pengingat tanpa rahasia ditolak (401)",
      tanpaRahasia.status === 401,
      `status=${tanpaRahasia.status}`
    );
    const rahasiaSalah = await fetch(`${BASE}/api/jurnal/internal/pengingat`, {
      method: "POST",
      headers: { Authorization: "Bearer rahasia-yang-salah" }
    });
    check(
      "rute pengingat dengan rahasia salah ditolak (401)",
      rahasiaSalah.status === 401,
      `status=${rahasiaSalah.status}`
    );
    async function jalankanPengingat() {
      const res = await fetch(`${BASE}/api/jurnal/internal/pengingat`, {
        method: "POST",
        headers: { Authorization: `Bearer ${CRON_SECRET}` }
      });
      const data = await res.json().catch(() => ({}));
      return { status: res.status, data };
    }
    const lari1 = await jalankanPengingat();
    const h7 = (lari1.data?.terkirim ?? []).filter(
      (t) => t.kode === kodeBaru && t.tahap === "h7"
    );
    check(
      "pengingat H-7 terkirim untuk dua penugasan",
      lari1.status === 200 && h7.length === 2,
      `status=${lari1.status} terkirim=${JSON.stringify(lari1.data?.terkirim ?? [])}`
    );
    const lari2 = await jalankanPengingat();
    const ulang = (lari2.data?.terkirim ?? []).filter(
      (t) => t.kode === kodeBaru
    );
    check(
      "larian kedua tidak mengulang pengingat (idempoten)",
      lari2.status === 200 && ulang.length === 0,
      `terkirim=${JSON.stringify(lari2.data?.terkirim ?? [])}`
    );

    // Mundurkan tenggat pada berkas uji: A menjadi lewat 10 hari,
    // B menjadi lewat 1 jam (tahap H-0).
    const berkasReview = path.join(DATA_DIR, "review.json");
    const dataReview = JSON.parse(fs.readFileSync(berkasReview, "utf8"));
    const kini = Date.now();
    for (const p of dataReview.penugasan ?? []) {
      if (p.kode !== kodeBaru) continue;
      if (p.reviewerEmail === REV_A.email) {
        p.tenggat = new Date(kini - 10 * 86400000).toISOString();
      } else if (p.reviewerEmail === REV_B.email) {
        p.tenggat = new Date(kini - 3600000).toISOString();
      }
    }
    fs.writeFileSync(berkasReview, JSON.stringify(dataReview, null, 2));
    const lari3 = await jalankanPengingat();
    const terkirim3 = lari3.data?.terkirim ?? [];
    check(
      "pengingat lewat tenggat dan H-0 terkirim pada tahapnya",
      terkirim3.filter((t) => t.kode === kodeBaru && t.tahap === "lewat")
        .length === 1 &&
        terkirim3.filter((t) => t.kode === kodeBaru && t.tahap === "h0")
          .length === 1,
      `terkirim=${JSON.stringify(terkirim3)}`
    );
  }

  // ============ 6. Reset kata sandi (S4a) ==============================
  await daftarApi(AKUN_RESET);
  const minta = await api(null, "POST", "/api/jurnal/auth/lupa-sandi", {
    email: AKUN_RESET.email
  });
  check(
    "permintaan reset menjawab generik dan memberi token uji lokal",
    minta.status === 200 && !!minta.data?.tokenUji,
    `status=${minta.status}`
  );
  const tokenReset = minta.data?.tokenUji;
  const sandiLemah = await api(null, "POST", "/api/jurnal/auth/sandi-baru", {
    token: tokenReset,
    kataSandiBaru: "lemah"
  });
  check(
    "kata sandi lemah ditolak pada penyelesaian reset (400)",
    sandiLemah.status === 400,
    `status=${sandiLemah.status}`
  );
  const selesaiReset = await api(null, "POST", "/api/jurnal/auth/sandi-baru", {
    token: tokenReset,
    kataSandiBaru: SANDI_BARU
  });
  check(
    "reset kata sandi selesai",
    selesaiReset.status === 200,
    `status=${selesaiReset.status} ${selesaiReset.teks.slice(0, 120)}`
  );
  const loginBaru = await loginApi(AKUN_RESET.email, SANDI_BARU);
  check("masuk dengan kata sandi baru berhasil", loginBaru.status === 200);
  const loginLama = await loginApi(AKUN_RESET.email, SANDI);
  check(
    "kata sandi lama tidak lagi berlaku",
    loginLama.status === 401,
    `status=${loginLama.status}`
  );
  const pakaiUlang = await api(null, "POST", "/api/jurnal/auth/sandi-baru", {
    token: tokenReset,
    kataSandiBaru: SANDI_BARU
  });
  check(
    "token reset tidak dapat dipakai dua kali (400)",
    pakaiUlang.status === 400,
    `status=${pakaiUlang.status}`
  );
  const mintaAsing = await api(null, "POST", "/api/jurnal/auth/lupa-sandi", {
    email: `tidak-ada.${STAMP}@contoh.ac.id`
  });
  check(
    "permintaan reset email asing tetap generik tanpa token",
    mintaAsing.status === 200 && !mintaAsing.data?.tokenUji
  );

  // ============ 7. Isi kebijakan (M3) ==================================
  const biaya = await fetch(`${BASE}/jurnal/halaman/biaya-lisensi`);
  const htmlBiaya = await biaya.text();
  check(
    "halaman biaya menyatakan APC Rp0 secara eksplisit",
    htmlBiaya.includes("APC Rp0")
  );
  const tentang = await fetch(`${BASE}/jurnal/halaman/tentang`);
  const htmlTentang = await tentang.text();
  check(
    "halaman tentang memakai rumusan klaim jujur (bukan OJS)",
    htmlTentang.includes("bukan OJS")
  );
} finally {
  await browser.close();
}

console.log(`\nPENUTUP: ${pass} lulus, ${fail} gagal`);
process.exit(fail > 0 ? 1 : 0);

/**
 * Uji Tahap 5 "OJS versi kita" (pencarian, pengumuman, halaman
 * kebijakan, sitasi dan DOI, statistik, sitemap) melawan server hasil
 * build pada MODE LOKAL, port 3100.
 *
 * Data umpan disuntikkan ke .jurnal-uji (1 artikel published berkode
 * JRN-2026-2040 dengan kata kunci unik, 1 artikel masih review, 1
 * terbitan published) dan dipulihkan sesudah jalan. Pengumuman dibuat
 * dan dihapus lewat API dengan token staf uji. Kata sandi staf dibaca
 * dari skrip Tahap 3 seperti pola Tahap 4.
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

const KODE_TERBIT = "JRN-2026-2040";
const JUDUL_TERBIT = "Zebra Fiqh Panen Tahap Lima";
const JUDUL_PROSES = "Zebra Belum Terbit Tahap Lima";

async function panggil(metode, jalur, { token, body } = {}) {
  const res = await fetch(`${BASE}${jalur}`, {
    method: metode,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
  const teks = await res.text();
  let json = null;
  try {
    json = JSON.parse(teks);
  } catch {}
  return { status: res.status, json, teks };
}

// ── Suntik data umpan ────────────────────────────────────────────────────
const berkasCadangan = ["submissions.json", "workflow.json", "tahap5.json"];
const cadangan = new Map();
for (const nama of berkasCadangan) {
  const jalur = path.join(DATA_DIR, nama);
  cadangan.set(nama, fs.existsSync(jalur) ? fs.readFileSync(jalur, "utf8") : null);
}

const naskahUmpan = [
  {
    kode: KODE_TERBIT,
    judul: JUDUL_TERBIT,
    penulis: "Penulis Tahap Lima",
    email: "penulis.tahap5@contoh.ac.id",
    afiliasi: "Ma'had Aly Uji",
    abstrak:
      "Abstrak artikel tahap lima tentang zebraunik dan panen metadata jurnal untuk uji pencarian publik.",
    status: "published",
    riwayat: [
      { status: "submitted", pada: "2026-01-20T00:00:00.000Z" },
      { status: "published", pada: "2026-06-30T00:00:00.000Z" }
    ],
    dibuatPada: "2026-01-20T00:00:00.000Z",
    bagianSlug: "artikel-penelitian",
    bahasa: "id",
    abstrakEn: "Abstract of the stage five article.",
    kataKunci: ["zebraunik", "tahap lima"],
    penulisPendamping: [
      {
        nama: "Pendamping Tahap Lima",
        email: "pendamping.tahap5@contoh.ac.id",
        afiliasi: "Afiliasi Pendamping",
        orcid: null
      }
    ],
    berkas: [],
    pernyataanAi: null
  },
  {
    kode: "JRN-2026-2041",
    judul: JUDUL_PROSES,
    penulis: "Penulis Proses Lima",
    email: "proses.tahap5@contoh.ac.id",
    afiliasi: "Ma'had Aly Uji",
    abstrak: "Abstrak artikel zebraunik yang masih dalam telaah.",
    status: "review",
    riwayat: [{ status: "submitted", pada: "2026-02-01T00:00:00.000Z" }],
    dibuatPada: "2026-02-01T00:00:00.000Z",
    bagianSlug: "artikel-penelitian",
    bahasa: "id",
    abstrakEn: "",
    kataKunci: ["zebraunik"],
    penulisPendamping: [],
    berkas: [],
    pernyataanAi: null
  }
];
const workflowUmpan = {
  tugasCopy: [],
  tugasProduksi: [],
  berkasAlur: [],
  terbitan: [
    {
      id: "umpan-tahap5-1",
      slug: "vol-1-no-1-2026",
      volume: 1,
      number: 1,
      year: 2026,
      judul: null,
      uraian: null,
      status: "published",
      isCurrent: true,
      tanggalTerbit: "2026-06-30T00:00:00.000Z",
      dibuatPada: "2026-06-30T00:00:00.000Z"
    }
  ],
  penempatan: { [KODE_TERBIT]: { issueId: "umpan-tahap5-1", urutan: 1 } },
  metrik: {}
};
fs.mkdirSync(DATA_DIR, { recursive: true });
fs.writeFileSync(
  path.join(DATA_DIR, "submissions.json"),
  JSON.stringify(naskahUmpan, null, 2),
  "utf8"
);
fs.writeFileSync(
  path.join(DATA_DIR, "workflow.json"),
  JSON.stringify(workflowUmpan, null, 2),
  "utf8"
);
fs.rmSync(path.join(DATA_DIR, "tahap5.json"), { force: true });

const idPengumuman = [];
let browser = null;
try {
  // ── Persiapan akun staf ─────────────────────────────────────────────
  await panggil("POST", "/api/jurnal/auth/register", {
    body: {
      nama: "Staf Uji Panel",
      email: STAFF_EMAIL,
      password: STAFF_PASSWORD,
      afiliasi: "Tim Uji Staf",
      persetujuan: true
    }
  });
  const login = await panggil("POST", "/api/jurnal/auth/login", {
    body: { email: STAFF_EMAIL, password: STAFF_PASSWORD }
  });
  const tokenStaf = login.json?.localSession?.token ?? null;
  check("persiapan: staf uji bisa masuk", !!tokenStaf, `status ${login.status}`);

  // ── Pengumuman lewat API ────────────────────────────────────────────
  const pTayang = await panggil("POST", "/api/jurnal/pengumuman", {
    token: tokenStaf,
    body: {
      judul: "Pengumuman Tayang Tahap Lima",
      isi: "Isi pengumuman yang memang ditayangkan untuk umum.",
      tayang: true,
      kedaluwarsaPada: null
    }
  });
  check("API buat pengumuman tayang 201", pTayang.status === 201, `status ${pTayang.status}`);
  if (pTayang.json?.pengumuman?.id) idPengumuman.push(pTayang.json.pengumuman.id);
  const pDraf = await panggil("POST", "/api/jurnal/pengumuman", {
    token: tokenStaf,
    body: {
      judul: "Pengumuman Draf Tahap Lima",
      isi: "Isi draf yang tidak boleh tampil publik.",
      tayang: false,
      kedaluwarsaPada: null
    }
  });
  check("API buat pengumuman draf 201", pDraf.status === 201, `status ${pDraf.status}`);
  if (pDraf.json?.pengumuman?.id) idPengumuman.push(pDraf.json.pengumuman.id);
  const pAnon = await panggil("POST", "/api/jurnal/pengumuman", {
    body: { judul: "Tanpa Sesi", isi: "Harus ditolak.", tayang: true }
  });
  check("API buat pengumuman tanpa sesi ditolak 401", pAnon.status === 401, `status ${pAnon.status}`);
  const daftarPublik = await panggil("GET", "/api/jurnal/pengumuman");
  const judulPublik = (daftarPublik.json?.pengumuman ?? []).map((p) => p.judul);
  check(
    "API publik hanya memuat pengumuman tayang",
    judulPublik.includes("Pengumuman Tayang Tahap Lima") &&
      !judulPublik.includes("Pengumuman Draf Tahap Lima")
  );

  // ── DOI lewat API ───────────────────────────────────────────────────
  const doiSah = await panggil("PATCH", `/api/jurnal/artikel/${KODE_TERBIT}/doi`, {
    token: tokenStaf,
    body: { doi: "10.5678/turatsuna.v1i1.2040" }
  });
  check("API tetapkan DOI sah diterima", doiSah.status === 200, `status ${doiSah.status} ${doiSah.teks.slice(0, 120)}`);
  const doiRusak = await panggil("PATCH", `/api/jurnal/artikel/${KODE_TERBIT}/doi`, {
    token: tokenStaf,
    body: { doi: "bukan-doi-sama-sekali" }
  });
  check("API DOI rusak ditolak 400", doiRusak.status === 400, `status ${doiRusak.status}`);

  // ── Unduhan sitasi ──────────────────────────────────────────────────
  const bib = await panggil("GET", `/api/jurnal/artikel/${KODE_TERBIT}/sitasi?format=bibtex`);
  check(
    "BibTeX berisi metadata yang benar",
    bib.status === 200 &&
      bib.teks.includes("@article{") &&
      bib.teks.includes(JUDUL_TERBIT) &&
      bib.teks.includes("doi = {10.5678/turatsuna.v1i1.2040}") &&
      bib.teks.includes("Penulis Tahap Lima") &&
      bib.teks.includes("year = {2026}"),
    bib.teks.slice(0, 200)
  );
  const ris = await panggil("GET", `/api/jurnal/artikel/${KODE_TERBIT}/sitasi?format=ris`);
  check(
    "RIS berisi metadata yang benar",
    ris.status === 200 &&
      ris.teks.includes("TY  - JOUR") &&
      ris.teks.includes(`TI  - ${JUDUL_TERBIT}`) &&
      ris.teks.includes("DO  - 10.5678/turatsuna.v1i1.2040") &&
      ris.teks.includes("ER  -"),
    ris.teks.slice(0, 200)
  );
  const sitasiProses = await panggil("GET", "/api/jurnal/artikel/JRN-2026-2041/sitasi?format=bibtex");
  check("Sitasi artikel belum terbit 404", sitasiProses.status === 404, `status ${sitasiProses.status}`);

  // ── Sitemap ─────────────────────────────────────────────────────────
  const sitemap = await panggil("GET", "/jurnal/sitemap.xml");
  check(
    "Sitemap memuat artikel dan terbitan published",
    sitemap.status === 200 &&
      sitemap.teks.includes(`/jurnal/artikel/${KODE_TERBIT.toLowerCase()}`) &&
      sitemap.teks.includes("/jurnal/terbitan/vol-1-no-1-2026") &&
      sitemap.teks.includes("/jurnal/halaman/dewan-redaksi") &&
      !sitemap.teks.includes("JRN-2026-2041"),
    sitemap.teks.slice(0, 200)
  );

  // ── Peramban ────────────────────────────────────────────────────────
  browser = await chromium.launch({
    executablePath:
      process.env.HOME + "/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome",
    args: [
      "--use-gl=angle",
      "--use-angle=swiftshader",
      "--enable-unsafe-swiftshader",
      "--no-sandbox"
    ]
  });
  const page = await browser.newPage();
  async function buka(url) {
    await page.goto(`${BASE}${url}`, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle", { timeout: 12000 }).catch(() => {});
  }
  async function teksHalaman() {
    return page.evaluate(() => document.body.innerText);
  }

  await buka("/jurnal/cari?q=zebraunik");
  let teks = await teksHalaman();
  check("Pencarian menemukan artikel terbit", teks.includes(JUDUL_TERBIT));
  check(
    "Pencarian tidak menemukan artikel belum terbit",
    !teks.includes(JUDUL_PROSES)
  );
  await page.screenshot({ path: path.join(SHOT_DIR, "tahap5-cari.png") });

  await buka("/jurnal/cari?q=Zebra");
  teks = await teksHalaman();
  check(
    "Pencarian kata umum tetap menyaring yang belum terbit",
    teks.includes(JUDUL_TERBIT) && !teks.includes(JUDUL_PROSES)
  );

  await buka("/jurnal/bagian/artikel-penelitian");
  teks = await teksHalaman();
  check(
    "Jelajah bagian memuat artikel terbit saja",
    teks.includes(JUDUL_TERBIT) && !teks.includes(JUDUL_PROSES)
  );

  await buka("/jurnal/pengumuman");
  teks = await teksHalaman();
  check(
    "Halaman pengumuman: tayang tampil, draf tidak",
    teks.includes("Pengumuman Tayang Tahap Lima") &&
      !teks.includes("Pengumuman Draf Tahap Lima")
  );

  await buka("/jurnal");
  teks = await teksHalaman();
  check("Beranda memuat pengumuman tayang", teks.includes("Pengumuman Tayang Tahap Lima"));

  const halamanKebijakan = [
    ["tentang", "Tentang Jurnal"],
    ["fokus-ruang-lingkup", "Fokus dan Ruang Lingkup"],
    ["dewan-redaksi", "Dewan Redaksi"],
    ["pedoman-penulis", "Pedoman Penulis"],
    ["etika-publikasi", "Etika Publikasi"],
    ["biaya-lisensi", "Biaya dan Lisensi"]
  ];
  for (const [slug, judul] of halamanKebijakan) {
    await buka(`/jurnal/halaman/${slug}`);
    teks = await teksHalaman();
    check(`Halaman kebijakan ${slug} terbuka`, teks.includes(judul));
  }
  await buka("/jurnal/halaman/dewan-redaksi");
  teks = await teksHalaman();
  check(
    "Dewan redaksi kerangka peran tanpa nama (menunggu SK)",
    teks.includes("menunggu SK") && teks.includes("Mitra Bestari")
  );
  await page.screenshot({ path: path.join(SHOT_DIR, "tahap5-dewan-redaksi.png") });

  await buka(`/jurnal/artikel/${KODE_TERBIT.toLowerCase()}`);
  teks = await teksHalaman();
  check("Halaman artikel memuat blok Cara Mengutip", teks.includes("Cara Mengutip"));
  check(
    "Blok kutip dan DOI tampil sebagai tautan doi.org penuh",
    teks.includes("https://doi.org/10.5678/turatsuna.v1i1.2040")
  );
  check(
    "Unduhan BibTeX dan RIS tertaut di halaman artikel",
    teks.includes("Unduh BibTeX") && teks.includes("Unduh RIS")
  );
  await page.screenshot({ path: path.join(SHOT_DIR, "tahap5-artikel-sitasi.png") });

  // Kunjungan artikel di atas mencatat metrik; statistik staf membacanya.
  const statistik = await panggil("GET", "/api/jurnal/statistik", { token: tokenStaf });
  const perArtikel = statistik.json?.statistik?.perArtikel ?? [];
  const barisArtikel = perArtikel.find((a) => a.kode === KODE_TERBIT);
  check(
    "Statistik staf memuat kunjungan artikel",
    statistik.status === 200 && !!barisArtikel && barisArtikel.views >= 1,
    JSON.stringify(statistik.json?.statistik ?? {}).slice(0, 200)
  );
  const statistikAnon = await panggil("GET", "/api/jurnal/statistik");
  check("Statistik tanpa sesi ditolak 401", statistikAnon.status === 401, `status ${statistikAnon.status}`);
} finally {
  if (browser) await browser.close().catch(() => {});
  // Hapus pengumuman uji lewat API tidak dilakukan: berkas tahap5.json
  // dipulihkan dari cadangan, yang membuang pengumuman uji sekaligus.
  for (const nama of berkasCadangan) {
    const jalur = path.join(DATA_DIR, nama);
    const isi = cadangan.get(nama);
    if (isi === null || isi === undefined) {
      fs.rmSync(jalur, { force: true });
    } else {
      fs.writeFileSync(jalur, isi, "utf8");
    }
  }
}

console.log(`\nTahap 5 Playwright: ${pass} lulus, ${fail} gagal`);
process.exit(fail > 0 ? 1 : 0);

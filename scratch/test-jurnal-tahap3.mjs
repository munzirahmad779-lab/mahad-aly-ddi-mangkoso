/**
 * Uji jalur banyak pelaku jurnal Tahap 3 (mesin review penuh, OJS versi
 * kita) lewat peramban asli + pemeriksaan API:
 * penulis mengirim naskah -> editor mengundang 2 reviewer lewat email
 * (klaim undangan membuat akun reviewer berpersetujuan) -> editor
 * membuka putaran 1 dan menugaskan keduanya -> reviewer 1 membuktikan
 * identitas penulis tidak ada di halaman maupun respons API ->
 * kedua reviewer menyerahkan telaah -> editor memutuskan revisi besar
 * -> penulis melihat hasil tanpa identitas reviewer dan tanpa komentar
 * rahasia editor, lalu mengunggah revisi -> editor membuka putaran 2,
 * menugaskan lagi, reviewer menyerahkan telaah kedua -> editor
 * memutuskan terima dan status bergerak ke Penyuntingan (Copyediting).
 * Uji keamanan: token reviewer mengakses penugasan orang lain (404),
 * token reviewer memanggil rute keputusan staf (403), keputusan dengan
 * kurang dari 2 reviewer aktif ditolak (400), token penulis tidak
 * menemukan identitas reviewer maupun komentar rahasia di API.
 *
 * Berjalan melawan server hasil build (bawaan http://localhost:3100)
 * pada mode data lokal. Chromium Playwright lokal + SwiftShader.
 */
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

const require = createRequire("/tmp/pw2/package.json");
const { chromium } = require("playwright-core");

const BASE = process.env.TEST_BASE || "http://localhost:3100";
const SHOT_DIR = path.resolve(process.cwd(), "scratch/screenshots");
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
const PENULIS = {
  nama: "Penulis Uji Tahap Tiga",
  email: `penulis.uji.tahap3.${STAMP}@contoh.ac.id`,
  password: "UjiTahap3-2026",
  afiliasi: "Tim Uji Peramban Tahap Tiga"
};
const PENDAMPING = {
  nama: "Pendamping Uji Tahap Tiga",
  email: `pendamping.tahap3.${STAMP}@contoh.ac.id`,
  afiliasi: "Lembaga Pendamping Tahap Tiga"
};
const STAFF_EMAIL = process.env.TEST_STAFF_EMAIL || "staf.uji@contoh.ac.id";
const STAFF_PASSWORD = "StafUji2026x";
const REV1 = {
  nama: "Reviewer Uji Satu",
  email: `reviewer.satu.${STAMP}@contoh.ac.id`,
  password: "ReviewerSatu2026",
  afiliasi: "Lembaga Reviewer Satu"
};
const REV2 = {
  nama: "Reviewer Uji Dua",
  email: `reviewer.dua.${STAMP}@contoh.ac.id`,
  password: "ReviewerDua2026x",
  afiliasi: "Lembaga Reviewer Dua"
};
const JUDUL =
  "Uji Peramban Tahap 3: Metode Istinbath dalam Bahtsul Masail Kontemporer";
const KOMENTAR_PENULIS_1 =
  "Komentar untuk penulis dari reviewer satu: bab metode perlu ditulis ulang secara besar.";
const KOMENTAR_RAHASIA_1 =
  "Komentar rahasia untuk editor dari reviewer satu: jangan diteruskan ke penulis.";
const KOMENTAR_PENULIS_2 =
  "Komentar untuk penulis dari reviewer dua: sitasi turats perlu dilengkapi.";

const PDF_PATH = path.resolve(process.cwd(), "scratch/berkas-uji-tahap3.pdf");
fs.writeFileSync(
  PDF_PATH,
  Buffer.from(
    "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n",
    "utf8"
  )
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
    /* respons bukan JSON (mis. unduhan berkas) */
  }
  return { status: res.status, teks, data };
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

async function masukUi(page, email, password) {
  await buka(page, `${BASE}/jurnal/masuk`);
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.locator('section button[type="submit"]').first().click();
  await page.waitForURL("**/jurnal/naskah-saya", { timeout: 30000 });
}

try {
  // ============ 1. Penulis daftar, masuk, kirim naskah lewat wizard ====
  const ctxPenulis = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const pgPenulis = await ctxPenulis.newPage();
  await buka(pgPenulis, `${BASE}/jurnal/daftar`);
  await pgPenulis.fill("#nama", PENULIS.nama);
  await pgPenulis.fill("#email", PENULIS.email);
  await pgPenulis.fill("#password", PENULIS.password);
  await pgPenulis.fill("#afiliasi", PENULIS.afiliasi);
  await pgPenulis.check("#persetujuan");
  await pgPenulis.locator('section button[type="submit"]').first().click();
  await pgPenulis.waitForSelector("text=Pendaftaran berhasil", {
    timeout: 30000
  });
  check("pendaftaran penulis tahap 3 berhasil", true);

  await masukUi(pgPenulis, PENULIS.email, PENULIS.password);
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
    "Abstrak uji peramban tahap tiga untuk memastikan mesin review penuh, penugasan reviewer, dan double-blind bekerja dari ujung ke ujung."
  );
  await pgPenulis.fill(
    "#abstrak-en",
    "Stage three browser test abstract to verify the full review engine end to end."
  );
  await pgPenulis.fill("#kata-kunci", "istinbath, bahtsul masail, turats");
  await pgPenulis.getByRole("button", { name: "Lanjut" }).click();
  await pgPenulis.fill("#utama-nama", PENULIS.nama);
  await pgPenulis.fill("#utama-afiliasi", PENULIS.afiliasi);
  await pgPenulis
    .getByRole("button", { name: "Tambah Penulis Pendamping" })
    .click();
  await pgPenulis.fill("#pendamping-0-nama", PENDAMPING.nama);
  await pgPenulis.fill("#pendamping-0-email", PENDAMPING.email);
  await pgPenulis.fill("#pendamping-0-afiliasi", PENDAMPING.afiliasi);
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
  const kode = teksHasil.match(/JRN-\d{4}-\d{4}/)?.[0];
  check("penulis mengirim naskah dan menerima kode lacak", !!kode, teksHasil.slice(0, 160));

  // ============ 2. Staf masuk panel dan membuka rincian naskah ========
  const ctxStaf = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const pgStaf = await ctxStaf.newPage();
  // Akun staf uji: daftar bila belum ada (pola uji Tahap 2).
  await buka(pgStaf, `${BASE}/jurnal/daftar`);
  await pgStaf.fill("#nama", "Staf Uji Panel");
  await pgStaf.fill("#email", STAFF_EMAIL);
  await pgStaf.fill("#password", STAFF_PASSWORD);
  await pgStaf.fill("#afiliasi", "Tim Uji Staf");
  await pgStaf.check("#persetujuan");
  await pgStaf.locator('section button[type="submit"]').first().click();
  await pgStaf
    .waitForSelector("text=Pendaftaran berhasil", { timeout: 15000 })
    .catch(() => {});
  await buka(pgStaf, `${BASE}/jurnal/panel`);
  await pgStaf.fill("#email-panel", STAFF_EMAIL);
  await pgStaf.fill("#password-panel", STAFF_PASSWORD);
  await pgStaf.locator('section button[type="submit"]').first().click();
  await pgStaf.waitForSelector(`text=${kode}`, { timeout: 30000 });
  check("panel staf menampilkan naskah tahap 3", true);
  await pgStaf
    .locator(`a[href="/jurnal/panel/naskah/${kode}"]`)
    .first()
    .click();
  await pgStaf.waitForURL(`**/jurnal/panel/naskah/${kode}`, {
    timeout: 30000
  });
  await pgStaf.waitForSelector("text=Buka Putaran Telaah", {
    timeout: 30000
  });
  check("halaman rincian naskah staf terbuka", true);

  // ============ 3. Staf mengundang 2 reviewer lewat email =============
  let tokenUndanganSebelumnya = "";
  async function buatUndangan(rev) {
    await pgStaf.fill("#email-undangan", rev.email);
    await pgStaf.getByRole("button", { name: "Buat Undangan" }).click();
    // Kotak tautan bersifat menggantikan: tunggu token BARU yang beda
    // dari undangan sebelumnya supaya tidak terbaca tautan lama.
    await pgStaf.waitForFunction(
      (prev) => {
        const m = document.body.innerText.match(
          /\/jurnal\/terima-undangan\?token=([A-Za-z0-9_-]+)/
        );
        return !!m && m[1] !== prev;
      },
      tokenUndanganSebelumnya,
      { timeout: 30000 }
    );
    const teks = await pgStaf.locator("section").first().innerText();
    const cocok = teks.match(
      /\/jurnal\/terima-undangan\?token=([A-Za-z0-9_-]+)/
    );
    tokenUndanganSebelumnya = cocok?.[1] || tokenUndanganSebelumnya;
    return cocok?.[0] || null;
  }
  const tautan1 = await buatUndangan(REV1);
  check("undangan reviewer 1 terbit dengan tautan klaim", !!tautan1);
  const tautan2 = await buatUndangan(REV2);
  check(
    "undangan reviewer 2 terbit dengan tautan klaim berbeda",
    !!tautan2 && tautan2 !== tautan1
  );

  // ============ 4. Reviewer mengklaim undangan (akun berpersetujuan) ==
  async function klaimUndangan(rev, tautan) {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 }
    });
    const pg = await ctx.newPage();
    await buka(pg, `${BASE}${tautan}`);
    await pg.waitForSelector("#klaim-nama", { timeout: 30000 });
    await pg.fill("#klaim-nama", rev.nama);
    await pg.fill("#klaim-afiliasi", rev.afiliasi);
    await pg.fill("#klaim-password", rev.password);
    await pg.check("#klaim-persetujuan");
    const tungguKlaim = pg.waitForResponse(
      (r) =>
        r.url().includes("/api/jurnal/auth/klaim-undangan") &&
        r.request().method() === "POST",
      { timeout: 30000 }
    );
    await pg.getByRole("button", { name: "Buat Akun Reviewer" }).click();
    // Tunggu jawaban POST klaim itu sendiri sebelum login. JANGAN
    // menunggu teks "Berhasil": kerangka situs memuat kutipan
    // "Keberhasilan itu harus diperjuangkan..." di semua halaman,
    // sehingga penantian teks itu selesai seketika dan login balapan
    // dengan klaim yang belum tuntas. Itulah akar kegagalan
    // klaim-login yang lama dicari di store lokal (terbukti dari log
    // server 23 Nov 2026 malam: login tiba 19 ms sebelum klaim
    // selesai; elemen penandingnya adalah SPAN kutipan itu).
    const respKlaim = await tungguKlaim.catch(() => null);
    if (respKlaim && respKlaim.status() !== 201) {
      console.log(
        `  KLAIM ${rev.email} menjawab HTTP ${respKlaim.status()}`
      );
    }
    await pg
      .waitForSelector("text=Undangan berhasil diklaim.", { timeout: 30000 })
      .catch(() => {});
    const login = await loginApi(rev.email, rev.password);
    const peran = login.data?.user?.roles || [];
    return { ctx, pg, login, peran };
  }
  const k1 = await klaimUndangan(REV1, tautan1);
  check(
    "klaim undangan reviewer 1 menghasilkan akun berperan reviewer",
    k1.login.status === 200 && k1.peran.includes("reviewer"),
    `status=${k1.login.status} peran=${JSON.stringify(k1.peran)}`
  );
  const k2 = await klaimUndangan(REV2, tautan2);
  check(
    "klaim undangan reviewer 2 menghasilkan akun berperan reviewer",
    k2.login.status === 200 && k2.peran.includes("reviewer"),
    `status=${k2.login.status} peran=${JSON.stringify(k2.peran)}`
  );
  const tokenRev1 = k1.login.token;
  const tokenRev2 = k2.login.token;
  const loginPenulis = await loginApi(PENULIS.email, PENULIS.password);
  const tokenPenulis = loginPenulis.token;
  const loginStaf = await loginApi(STAFF_EMAIL, STAFF_PASSWORD);
  const tokenStaf = loginStaf.token;
  check(
    "token API keempat pelaku tersedia",
    !!(tokenRev1 && tokenRev2 && tokenPenulis && tokenStaf)
  );

  // ============ 5. Editor membuka putaran 1 ===========================
  await pgStaf.getByRole("button", { name: "Buka Putaran Telaah" }).click();
  await pgStaf.waitForSelector("text=Tugaskan Reviewer (Putaran 1)", {
    timeout: 30000
  });
  check("putaran telaah 1 dibuka editor", true);

  // Keputusan sebelum ada 2 reviewer aktif harus ditolak server (400).
  const putusanDini = await api(
    tokenStaf,
    "POST",
    `/api/jurnal/submissions/${kode}/review/keputusan`,
    { keputusan: "major_revisions" }
  );
  check(
    "keputusan dengan kurang dari 2 reviewer aktif ditolak (400)",
    putusanDini.status === 400,
    `status=${putusanDini.status}`
  );

  // ============ 6. Editor menugaskan 2 reviewer =======================
  async function tugaskan(email) {
    await pgStaf.selectOption("#pilih-reviewer", email);
    await pgStaf.getByRole("button", { name: "Tugaskan", exact: true }).click();
    await pgStaf.waitForSelector(`text=${email}`, { timeout: 30000 });
  }
  await tugaskan(REV1.email);
  check("reviewer 1 ditugaskan pada putaran 1", true);
  await tugaskan(REV2.email);
  check("reviewer 2 ditugaskan pada putaran 1", true);
  await pgStaf.screenshot({
    path: path.join(SHOT_DIR, "tahap3-panel-rincian.png")
  });

  // ============ 7. Reviewer 1: dasbor, anonimitas, unduh, serahkan ====
  const pgRev1 = k1.pg;
  await masukUi(pgRev1, REV1.email, REV1.password);
  await buka(pgRev1, `${BASE}/jurnal/review`);
  await pgRev1.waitForSelector("text=Buka Penugasan", { timeout: 30000 });
  check("dasbor reviewer 1 memuat penugasannya", true);

  // Anonimitas di tingkat API: daftar dan rincian penugasan.
  const daftarRev1 = await api(tokenRev1, "GET", "/api/jurnal/review");
  const idTugas1 = daftarRev1.data?.penugasan?.[0]?.id;
  check("API daftar penugasan reviewer 1 menjawab 200", daftarRev1.status === 200 && !!idTugas1);
  const identitasPenulis = [
    PENULIS.nama,
    PENULIS.email,
    PENULIS.afiliasi,
    PENDAMPING.nama,
    PENDAMPING.email,
    PENDAMPING.afiliasi
  ];
  check(
    "API daftar penugasan bebas identitas penulis",
    !identitasPenulis.some((s) => daftarRev1.teks.includes(s)),
    daftarRev1.teks.slice(0, 200)
  );
  const rincianRev1 = await api(tokenRev1, "GET", `/api/jurnal/review/${idTugas1}`);
  check(
    "API rincian penugasan bebas identitas penulis",
    rincianRev1.status === 200 &&
      !identitasPenulis.some((s) => rincianRev1.teks.includes(s)),
    `status=${rincianRev1.status}`
  );

  await pgRev1.getByRole("link", { name: "Buka Penugasan" }).first().click();
  await pgRev1.waitForURL(`**/jurnal/review/${idTugas1}`, { timeout: 30000 });
  await pgRev1.waitForSelector(`text=${JUDUL}`, { timeout: 30000 });
  const teksTugas1 = await pgRev1.locator("section").first().innerText();
  check(
    "halaman penugasan memuat judul tanpa identitas penulis",
    teksTugas1.includes(JUDUL) &&
      !identitasPenulis.some((s) => teksTugas1.includes(s)),
    teksTugas1.slice(0, 200)
  );
  await pgRev1.screenshot({
    path: path.join(SHOT_DIR, "tahap3-penugasan-reviewer.png")
  });

  // Unduh berkas lewat rute berumur pendek (mode lokal: aliran berkas).
  const berkasId = rincianRev1.data?.penugasan?.berkas?.[0]?.id;
  const unduh = await fetch(
    `${BASE}/api/jurnal/review/${idTugas1}/berkas/${berkasId}`,
    { headers: { Authorization: `Bearer ${tokenRev1}` } }
  );
  const bufUnduh = Buffer.from(await unduh.arrayBuffer());
  check(
    "reviewer 1 mengunduh berkas naskah anonim (PDF)",
    unduh.status === 200 && bufUnduh.subarray(0, 4).toString() === "%PDF",
    `status=${unduh.status}`
  );

  // Terima undangan lalu serahkan telaah revisi besar.
  await pgRev1.getByRole("button", { name: "Terima Undangan" }).click();
  await pgRev1.waitForSelector("#rek-major_revisions", { timeout: 30000 });
  await pgRev1.check("#rek-major_revisions");
  await pgRev1.fill("#komentar-penulis", KOMENTAR_PENULIS_1);
  await pgRev1.fill("#komentar-editor", KOMENTAR_RAHASIA_1);
  await pgRev1.getByRole("button", { name: "Serahkan Telaah" }).click();
  await pgRev1.waitForSelector("text=Telaah Anda sudah diserahkan", {
    timeout: 30000
  }).catch(() => {});
  const sesudahSerah1 = await api(tokenRev1, "GET", `/api/jurnal/review/${idTugas1}`);
  check(
    "telaah reviewer 1 tercatat selesai dengan rekomendasi revisi besar",
    sesudahSerah1.data?.penugasan?.status === "completed" &&
      sesudahSerah1.data?.penugasan?.rekomendasi === "major_revisions",
    JSON.stringify(sesudahSerah1.data?.penugasan?.status)
  );

  // ============ 8. Reviewer 2 menyerahkan telaah ======================
  const pgRev2 = k2.pg;
  await masukUi(pgRev2, REV2.email, REV2.password);
  const daftarRev2 = await api(tokenRev2, "GET", "/api/jurnal/review");
  const idTugas2 = daftarRev2.data?.penugasan?.[0]?.id;
  check("API daftar penugasan reviewer 2 menjawab 200", daftarRev2.status === 200 && !!idTugas2);
  await buka(pgRev2, `${BASE}/jurnal/review/${idTugas2}`);
  await pgRev2.waitForSelector(`text=${JUDUL}`, { timeout: 30000 });
  await pgRev2.getByRole("button", { name: "Terima Undangan" }).click();
  await pgRev2.waitForSelector("#rek-minor_revisions", { timeout: 30000 });
  await pgRev2.check("#rek-minor_revisions");
  await pgRev2.fill("#komentar-penulis", KOMENTAR_PENULIS_2);
  await pgRev2.fill("#komentar-editor", "Catatan editor dari reviewer dua.");
  await pgRev2.getByRole("button", { name: "Serahkan Telaah" }).click();
  await pgRev2.waitForTimeout(1500);
  const sesudahSerah2 = await api(tokenRev2, "GET", `/api/jurnal/review/${idTugas2}`);
  check(
    "telaah reviewer 2 tercatat selesai",
    sesudahSerah2.data?.penugasan?.status === "completed",
    JSON.stringify(sesudahSerah2.data?.penugasan?.status)
  );

  // ============ 9. Uji keamanan silang ================================
  const silang = await api(tokenRev2, "GET", `/api/jurnal/review/${idTugas1}`);
  check(
    "token reviewer 2 mengakses penugasan reviewer 1 ditolak (404)",
    silang.status === 404,
    `status=${silang.status}`
  );
  const stafPalsu = await api(
    tokenRev1,
    "POST",
    `/api/jurnal/submissions/${kode}/review/keputusan`,
    { keputusan: "accept" }
  );
  check(
    "token reviewer memanggil rute keputusan staf ditolak (403)",
    stafPalsu.status === 403,
    `status=${stafPalsu.status}`
  );
  const identitasReviewer = [REV1.nama, REV1.email, REV2.nama, REV2.email];
  const sayaSebelum = await api(tokenPenulis, "GET", "/api/jurnal/naskah-saya");
  check(
    "API penulis sebelum keputusan: tanpa identitas reviewer dan tanpa isi telaah",
    sayaSebelum.status === 200 &&
      !identitasReviewer.some((s) => sayaSebelum.teks.includes(s)) &&
      !sayaSebelum.teks.includes(KOMENTAR_PENULIS_1) &&
      !sayaSebelum.teks.includes(KOMENTAR_RAHASIA_1),
    sayaSebelum.teks.slice(0, 200)
  );

  // ============ 10. Editor memutuskan revisi besar ====================
  await buka(pgStaf, `${BASE}/jurnal/panel/naskah/${kode}`);
  await pgStaf.waitForSelector("#keputusan", { timeout: 30000 });
  await pgStaf.selectOption("#keputusan", "major_revisions");
  await pgStaf
    .getByRole("button", { name: "Ambil Keputusan dan Tutup Putaran" })
    .click();
  await pgStaf.waitForSelector("text=Revisi Besar", { timeout: 30000 });
  check("editor memutuskan revisi besar dan putaran 1 tertutup", true);

  // ============ 11. Penulis melihat hasil dan mengunggah revisi =======
  await buka(pgPenulis, `${BASE}/jurnal/naskah-saya`);
  await pgPenulis.waitForSelector("text=Hasil Telaah Putaran 1", {
    timeout: 30000
  });
  const teksSaya = await pgPenulis.locator("section").first().innerText();
  check(
    "penulis melihat hasil telaah berlabel Reviewer 1/2 dan komentar untuk penulis",
    teksSaya.includes("Reviewer 1") &&
      teksSaya.includes(KOMENTAR_PENULIS_1) &&
      teksSaya.includes(KOMENTAR_PENULIS_2),
    teksSaya.slice(0, 300)
  );
  check(
    "halaman penulis bebas identitas reviewer dan komentar rahasia editor",
    !identitasReviewer.some((s) => teksSaya.includes(s)) &&
      !teksSaya.includes(KOMENTAR_RAHASIA_1)
  );
  const sayaSesudah = await api(tokenPenulis, "GET", "/api/jurnal/naskah-saya");
  check(
    "API penulis sesudah keputusan: hasil tampil tanpa identitas reviewer dan tanpa komentar rahasia",
    !identitasReviewer.some((s) => sayaSesudah.teks.includes(s)) &&
      !sayaSesudah.teks.includes(KOMENTAR_RAHASIA_1) &&
      sayaSesudah.teks.includes(KOMENTAR_PENULIS_1)
  );
  await pgPenulis.screenshot({
    path: path.join(SHOT_DIR, "tahap3-naskah-saya-hasil.png")
  });

  await pgPenulis.setInputFiles(`#revisi-utama-${kode}`, PDF_PATH);
  await pgPenulis.waitForSelector("text=Terunggah (utama)", {
    timeout: 30000
  });
  await pgPenulis
    .getByRole("button", { name: "Daftarkan Berkas Revisi" })
    .click();
  await pgPenulis.waitForSelector("text=Berkas revisi terdaftar", {
    timeout: 30000
  });
  check("penulis mengunggah berkas revisi terikat putaran 1", true);

  // ============ 12. Putaran 2: tugas, telaah, terima ==================
  await buka(pgStaf, `${BASE}/jurnal/panel/naskah/${kode}`);
  await pgStaf.waitForSelector("text=Buka Putaran Telaah", {
    timeout: 30000
  });
  await pgStaf.getByRole("button", { name: "Buka Putaran Telaah" }).click();
  await pgStaf.waitForSelector("text=Tugaskan Reviewer (Putaran 2)", {
    timeout: 30000
  });
  check("editor membuka putaran 2 sesudah revisi terdaftar", true);
  await tugaskan(REV1.email);
  await tugaskan(REV2.email);
  check("kedua reviewer ditugaskan lagi pada putaran 2", true);

  const daftarRev1b = await api(tokenRev1, "GET", "/api/jurnal/review");
  const tugasPutaran2 = (daftarRev1b.data?.penugasan || []).find(
    (p) => p.id !== idTugas1
  );
  check("penugasan putaran 2 tampil di API reviewer 1", !!tugasPutaran2);
  await buka(pgRev1, `${BASE}/jurnal/review/${tugasPutaran2.id}`);
  await pgRev1.waitForSelector(`text=${JUDUL}`, { timeout: 30000 });
  await pgRev1.getByRole("button", { name: "Terima Undangan" }).click();
  await pgRev1.waitForSelector("#rek-accept", { timeout: 30000 });
  await pgRev1.check("#rek-accept");
  await pgRev1.fill(
    "#komentar-penulis",
    "Revisi sudah memperbaiki bab metode. Naskah layak diterima."
  );
  await pgRev1.fill("#komentar-editor", "Setuju diterbitkan.");
  await pgRev1.getByRole("button", { name: "Serahkan Telaah" }).click();
  await pgRev1.waitForTimeout(1500);
  const serahPutaran2 = await api(
    tokenRev1,
    "GET",
    `/api/jurnal/review/${tugasPutaran2.id}`
  );
  check(
    "telaah putaran 2 reviewer 1 selesai dengan rekomendasi diterima",
    serahPutaran2.data?.penugasan?.status === "completed" &&
      serahPutaran2.data?.penugasan?.rekomendasi === "accept",
    JSON.stringify(serahPutaran2.data?.penugasan?.status)
  );

  // ============ 13. Editor memutuskan terima -> copyediting ===========
  await buka(pgStaf, `${BASE}/jurnal/panel/naskah/${kode}`);
  await pgStaf.waitForSelector("#keputusan", { timeout: 30000 });
  await pgStaf.selectOption("#keputusan", "accept");
  await pgStaf
    .getByRole("button", { name: "Ambil Keputusan dan Tutup Putaran" })
    .click();
  await pgStaf.waitForSelector("text=Penyuntingan (Copyediting)", {
    timeout: 30000
  });
  check("keputusan terima menggerakkan status ke Penyuntingan (Copyediting)", true);
  await pgStaf.screenshot({
    path: path.join(SHOT_DIR, "tahap3-panel-copyediting.png")
  });

  // Linimasa naskah di halaman staf memuat rantai peristiwa review.
  const teksRincian = await pgStaf.locator("section").first().innerText();
  check(
    "linimasa rincian staf memuat peristiwa putaran dan keputusan",
    teksRincian.includes("Putaran") && teksRincian.includes("Diterima"),
    teksRincian.slice(0, 300)
  );

  console.log(`\nHASIL: ${pass} lulus, ${fail} gagal. Kode uji: ${kode}`);
  process.exitCode = fail > 0 ? 1 : 0;
} finally {
  await browser.close();
}

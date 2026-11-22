/**
 * Uji serangan Tahap Keamanan "OJS versi kita" melawan server hasil
 * build pada MODE LOKAL. Server harus dijalankan dengan:
 *   JURNAL_LOCAL_STAFF_EMAILS=staf.uji@contoh.ac.id
 *   JURNAL_LOCAL_SECRET=<bebas untuk uji>
 * Bawaan BASE http://localhost:3100 (env TEST_BASE).
 *
 * Setiap serangan dicatat hasilnya satu per satu. Data uji yang dibuat
 * skrip ini dibersihkan oleh pemanggil sesudah jalan.
 */
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.TEST_BASE || "http://localhost:3100";
const STAFF_EMAIL = process.env.TEST_STAFF_EMAIL || "staf.uji@contoh.ac.id";
const STAFF_PASSWORD = "StafUji2026x";
const AUTHOR_EMAIL = "penulis.serang@contoh.ac.id";
const AUTHOR_PASSWORD = "PenulisUji2026";

let pass = 0;
let fail = 0;
const hasil = [];
function check(nama, ok, detail = "") {
  if (ok) pass += 1;
  else fail += 1;
  hasil.push(`${ok ? "LULUS" : "GAGAL"}  ${nama}${detail ? ` — ${detail}` : ""}`);
  console.log(`  ${ok ? "ok  " : "FAIL"} ${nama}${detail ? ` — ${detail}` : ""}`);
}

async function panggil(metode, jalur, { token, body, headers = {} } = {}) {
  const res = await fetch(`${BASE}${jalur}`, {
    method: metode,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    },
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
  const teks = await res.text();
  let json = null;
  try {
    json = JSON.parse(teks);
  } catch {}
  return { status: res.status, json, headers: res.headers, teks };
}

async function daftar(email, password) {
  return panggil("POST", "/api/jurnal/auth/register", {
    body: {
      nama: "Akun Uji Serangan",
      email,
      password,
      afiliasi: "Tim Uji Keamanan",
      persetujuan: true
    }
  });
}

async function masuk(email, password) {
  const r = await panggil("POST", "/api/jurnal/auth/login", {
    body: { email, password }
  });
  return r.json?.localSession?.token ?? null;
}

// ── Persiapan akun ───────────────────────────────────────────────────────
// 201 = baru terdaftar; 409 = sudah terdaftar dari jalan uji sebelumnya.
// Keduanya diterima sebagai persiapan; bukti sahnya adalah masuk.
const dStaf = await daftar(STAFF_EMAIL, STAFF_PASSWORD);
check("persiapan: daftar akun staf uji", [201, 409].includes(dStaf.status), `status ${dStaf.status}`);
const dPenulis = await daftar(AUTHOR_EMAIL, AUTHOR_PASSWORD);
check("persiapan: daftar akun penulis uji", [201, 409].includes(dPenulis.status), `status ${dPenulis.status}`);
const tokenStaf = await masuk(STAFF_EMAIL, STAFF_PASSWORD);
const tokenPenulis = await masuk(AUTHOR_EMAIL, AUTHOR_PASSWORD);
check("persiapan: kedua akun bisa masuk", !!tokenStaf && !!tokenPenulis);

// ── 1. Panel tanpa sesi dan dengan token penulis ─────────────────────────
const panelAnon = await panggil("GET", "/api/jurnal/submissions");
check("panel tanpa sesi ditolak 401", panelAnon.status === 401, `status ${panelAnon.status}`);

const panelPenulis = await panggil("GET", "/api/jurnal/submissions", { token: tokenPenulis });
check("daftar panel dengan token penulis ditolak 403", panelPenulis.status === 403, `status ${panelPenulis.status}`);

const panelStaf = await panggil("GET", "/api/jurnal/submissions", { token: tokenStaf });
check("daftar panel dengan token staf diterima 200", panelStaf.status === 200, `status ${panelStaf.status}`);

// ── 2. Naskah sasaran lewat jalur kirim lama ─────────────────────────────
const kirim = await panggil("POST", "/api/jurnal/submissions", {
  body: {
    judul: "Naskah Sasaran Uji Serangan Keamanan",
    penulis: "Penulis Sasaran",
    email: "sasaran@contoh.ac.id",
    afiliasi: "Tim Uji Keamanan",
    abstrak:
      "Abstrak naskah sasaran untuk uji serangan tahap keamanan sistem jurnal versi kita."
  }
});
check("persiapan: naskah sasaran terkirim", kirim.status === 201, `status ${kirim.status}`);
const kode = kirim.json?.kode;

// ── 3. PATCH status: tanpa sesi, penulis, eskalasi peran ────────────────
const patchAnon = await panggil("PATCH", `/api/jurnal/submissions/${kode}`, {
  body: { status: "review" }
});
check("PATCH status tanpa sesi ditolak 401", patchAnon.status === 401, `status ${patchAnon.status}`);

const patchPenulis = await panggil("PATCH", `/api/jurnal/submissions/${kode}`, {
  token: tokenPenulis,
  body: { status: "review" }
});
check("PATCH status dengan token penulis ditolak 403", patchPenulis.status === 403, `status ${patchPenulis.status}`);

const patchEskalasi = await panggil("PATCH", `/api/jurnal/submissions/${kode}`, {
  token: tokenStaf,
  body: {
    status: "review",
    role: "journal_manager",
    roles: ["journal_manager"],
    email: "penyerang@contoh.ac.id",
    statusBaru: "published"
  }
});
check(
  "PATCH staf dengan sisipan peran di badan: status sah diterapkan, sisipan diabaikan",
  patchEskalasi.status === 200 && patchEskalasi.json?.submission?.status === "review",
  `status ${patchEskalasi.status}`
);
const sesudahEskalasi = await panggil("PATCH", `/api/jurnal/submissions/${kode}`, {
  token: tokenPenulis,
  body: { status: "declined" }
});
check(
  "penulis tetap tidak bisa PATCH sesudah percobaan eskalasi (peran tidak bocor)",
  sesudahEskalasi.status === 403,
  `status ${sesudahEskalasi.status}`
);

// ── 4. Transisi status tidak sah ─────────────────────────────────────────
const lompat = await panggil("PATCH", `/api/jurnal/submissions/${kode}`, {
  token: tokenStaf,
  body: { status: "published" }
});
check("transisi review -> published ditolak 400", lompat.status === 400, `status ${lompat.status}`);

const keDeclined = await panggil("PATCH", `/api/jurnal/submissions/${kode}`, {
  token: tokenStaf,
  body: { status: "declined" }
});
check("transisi review -> declined diterima 200", keDeclined.status === 200, `status ${keDeclined.status}`);

const declinedKePublished = await panggil("PATCH", `/api/jurnal/submissions/${kode}`, {
  token: tokenStaf,
  body: { status: "published" }
});
check("transisi declined -> published ditolak 400", declinedKePublished.status === 400, `status ${declinedKePublished.status}`);

const hidupLagi = await panggil("PATCH", `/api/jurnal/submissions/${kode}`, {
  token: tokenStaf,
  body: { status: "submitted" }
});
check("transisi declined -> submitted (hidupkan kembali) diterima 200", hidupLagi.status === 200, `status ${hidupLagi.status}`);

// ── 5. Rate limit login terpicu ──────────────────────────────────────────
const emailKorban = "korban.rl@contoh.ac.id";
const statusPercobaan = [];
for (let i = 0; i < 6; i++) {
  const r = await panggil("POST", "/api/jurnal/auth/login", {
    body: { email: emailKorban, password: "SalahTerus2026" }
  });
  statusPercobaan.push(r.status);
}
check(
  "rate limit login: 5 percobaan gagal 401, percobaan ke-6 ditolak 429",
  statusPercobaan.slice(0, 5).every((s) => s === 401) && statusPercobaan[5] === 429,
  `urutan ${statusPercobaan.join(",")}`
);

// ── 6. Pendaftaran: tanpa consent dan kata sandi lemah ───────────────────
const tanpaConsent = await panggil("POST", "/api/jurnal/auth/register", {
  body: {
    nama: "Tanpa Persetujuan",
    email: "tanpa.consent@contoh.ac.id",
    password: "KataSandi2026",
    afiliasi: "Uji",
    persetujuan: false
  }
});
check("daftar tanpa consent ditolak 400", tanpaConsent.status === 400, `status ${tanpaConsent.status}`);

const sandiPendek = await daftar("sandi.pendek@contoh.ac.id", "Ab1");
check("daftar dengan kata sandi di bawah kebijakan ditolak 400", sandiPendek.status === 400, `status ${sandiPendek.status}`);

const sandiTanpaAngka = await daftar("sandi.huruf@contoh.ac.id", "hanyahurufsaja");
check("daftar dengan kata sandi tanpa angka ditolak 400", sandiTanpaAngka.status === 400, `status ${sandiTanpaAngka.status}`);

// ── 7. Unggah: sesi, jenis terlarang, MIME menyamar ──────────────────────
const signAnon = await panggil("POST", "/api/jurnal/uploads/sign", {
  body: { batchId: "uji-abc12345", kategori: "utama", namaAsli: "naskah.pdf", mime: "application/pdf", ukuran: 100 }
});
check("sign unggahan tanpa sesi ditolak 401", signAnon.status === 401, `status ${signAnon.status}`);

const signExe = await panggil("POST", "/api/jurnal/uploads/sign", {
  token: tokenPenulis,
  body: { batchId: "uji-abc12345", kategori: "utama", namaAsli: "jahat.exe", mime: "application/octet-stream", ukuran: 100 }
});
check("sign berkas .exe ditolak 400", signExe.status === 400, `status ${signExe.status}`);

const signMenyamar = await panggil("POST", "/api/jurnal/uploads/sign", {
  token: tokenPenulis,
  body: { batchId: "uji-abc12345", kategori: "utama", namaAsli: "naskah.pdf", mime: "application/msword", ukuran: 100 }
});
check("sign berkas .pdf ber-MIME menyamar ditolak 400", signMenyamar.status === 400, `status ${signMenyamar.status}`);

const signSah = await panggil("POST", "/api/jurnal/uploads/sign", {
  token: tokenPenulis,
  body: { batchId: "uji-abc12345", kategori: "utama", namaAsli: "naskah.pdf", mime: "application/pdf", ukuran: 100 }
});
check("sign berkas sah diterima (mode local)", signSah.status === 200 && signSah.json?.mode === "local", `status ${signSah.status}`);

// Unggah lokal langsung: tanpa sesi, lalu berkas terlarang dengan sesi.
async function unggahLokal(token, nama, mime, isi) {
  const form = new FormData();
  form.append("berkas", new Blob([isi], { type: mime }), nama);
  form.append("kategori", "utama");
  form.append("batchId", "uji-abc12345");
  const res = await fetch(`${BASE}/api/jurnal/uploads/local`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form
  });
  return { status: res.status, json: await res.json().catch(() => null) };
}
const lokalAnon = await unggahLokal(null, "naskah.pdf", "application/pdf", "%PDF-uji");
check("unggah lokal tanpa sesi ditolak 401", lokalAnon.status === 401, `status ${lokalAnon.status}`);
const lokalExe = await unggahLokal(tokenPenulis, "jahat.exe", "application/octet-stream", "MZ");
check("unggah lokal berkas .exe ditolak 400", lokalExe.status === 400, `status ${lokalExe.status}`);

// ── 8. Kode lacak liar ───────────────────────────────────────────────────
for (const [nama, jalur] of [
  ["kode persen", "/api/jurnal/submissions/%25"],
  ["kode garis bawah", "/api/jurnal/submissions/_"],
  ["kode mirip SQL", "/api/jurnal/submissions/JRN-2026-1234'%20OR%20'1'='1"],
  ["kode format bebas", "/api/jurnal/submissions/BUKAN-KODE"]
]) {
  const r = await panggil("GET", jalur);
  check(`lacak ${nama} ditolak 400`, r.status === 400, `status ${r.status}`);
}
const kodeTakDikenal = await panggil("GET", "/api/jurnal/submissions/JRN-1999-0001");
check("kode format sah tetapi tidak dikenal dijawab 404", kodeTakDikenal.status === 404, `status ${kodeTakDikenal.status}`);
const lacakSah = await panggil("GET", `/api/jurnal/submissions/${kode}`);
check("lacak kode sah tetap bekerja 200", lacakSah.status === 200 && lacakSah.json?.submission?.kode === kode, `status ${lacakSah.status}`);

// ── 9. Badan raksasa ─────────────────────────────────────────────────────
const badanBesar = await fetch(`${BASE}/api/jurnal/auth/register`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ nama: "X".repeat(40000), email: "besar@contoh.ac.id" })
});
check("badan JSON melebihi batas ditolak 413", badanBesar.status === 413, `status ${badanBesar.status}`);

// ── 10. Header keamanan ──────────────────────────────────────────────────
const halaman = await fetch(`${BASE}/jurnal`);
const h = halaman.headers;
check(
  "header keamanan hadir pada halaman jurnal",
  (h.get("content-security-policy") || "").includes("default-src") &&
    h.get("x-content-type-options") === "nosniff" &&
    !!h.get("referrer-policy") &&
    (h.get("x-frame-options") === "DENY" || (h.get("content-security-policy") || "").includes("frame-ancestors")),
  `csp=${!!h.get("content-security-policy")} xcto=${h.get("x-content-type-options")} ref=${h.get("referrer-policy")} xfo=${h.get("x-frame-options")}`
);
const halamanPanel = await fetch(`${BASE}/jurnal/panel`);
check(
  "halaman panel membawa Cache-Control no-store",
  (halamanPanel.headers.get("cache-control") || "").includes("no-store"),
  `cache=${halamanPanel.headers.get("cache-control")}`
);
check(
  "route API jurnal membawa Cache-Control no-store",
  (panelAnon.headers.get("cache-control") || "").includes("no-store"),
  `cache=${panelAnon.headers.get("cache-control")}`
);

// ── 11. Peristiwa keamanan tercatat ──────────────────────────────────────
const berkasPeristiwa = path.resolve(process.cwd(), ".jurnal-uji/security-events.json");
let jenisTercatat = [];
try {
  const data = JSON.parse(fs.readFileSync(berkasPeristiwa, "utf8"));
  jenisTercatat = [...new Set(data.map((p) => p.jenis))];
} catch {}
for (const jenis of ["login_gagal", "rate_limit", "peran_ditolak", "transisi_ditolak", "kode_tidak_sah", "register_ditolak", "unggah_ditolak"]) {
  check(`peristiwa ${jenis} tercatat di catatan keamanan lokal`, jenisTercatat.includes(jenis), `tercatat: ${jenisTercatat.join(",")}`);
}

console.log(`\nHASIL UJI SERANGAN: ${pass} lulus, ${fail} gagal. Kode sasaran: ${kode}`);
process.exitCode = fail > 0 ? 1 : 0;

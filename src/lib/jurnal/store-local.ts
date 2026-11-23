// ─────────────────────────────────────────────────────────────────────────────
// Backend data lokal jurnal — SERVER ONLY.
//
// Penyimpanan: berkas JSON lokal di <cwd>/.jurnal-uji/submissions.json
// dengan cadangan memori proses bila berkas tidak bisa ditulis (mis. sistem
// berkas hanya-baca di lingkungan serverless). Backend ini adalah mode uji
// dan mode cadangan: fasad src/lib/jurnal/store.ts memakainya bila tabel
// jurnal di Supabase belum tersedia (migrasi 004 belum dijalankan) atau
// variabel lingkungan service role tidak terpasang, supaya build dan uji
// lokal tidak pernah pecah dan tidak pernah menulis ke basis data
// produksi kampus.
// ─────────────────────────────────────────────────────────────────────────────

import { promises as fs } from "fs";
import path from "path";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import {
  labelStatus,
  type JurnalRiwayatItem,
  type JurnalRole,
  type JurnalStatus,
  type JurnalSubmissionView
} from "./status";
import { emailStafLokal } from "./sesi-lokal";
import {
  labelBagian,
  type JurnalBerkasMeta,
  type JurnalDaftarPeriksa,
  type JurnalPenulisInput,
  type JurnalWizardInput
} from "./wizard";

export interface CatatanLokal {
  kode: string;
  judul: string;
  penulis: string;
  email: string;
  afiliasi: string;
  abstrak: string;
  status: JurnalStatus;
  riwayat: { status: JurnalStatus; pada: string; catatan?: string | null }[];
  dibuatPada: string;
  // Rincian Tahap 2 (wizard). Opsional: catatan lama versi uji dan
  // Tahap 1 tidak memilikinya.
  bagianSlug?: string | null;
  bahasa?: string;
  abstrakEn?: string;
  kataKunci?: string[];
  penulisPendamping?: JurnalPenulisInput[];
  berkas?: JurnalBerkasMeta[];
  pernyataanAi?: string | null;
  daftarPeriksa?: JurnalDaftarPeriksa;
  // Tahap 5: DOI per artikel dan penarikan (tombstone OAI). Catatan
  // tidak pernah dihapus; penarikan hanya menandai.
  doi?: string | null;
  ditarikPada?: string | null;
  alasanTarik?: string | null;
}

// Catatan lama versi uji memakai label Indonesia sebagai status. Petakan
// sekali saat muat supaya berkas data uji lama tetap terbaca.
const PETA_STATUS_LAMA: Record<string, JurnalStatus> = {
  "Diterima Redaksi": "submitted",
  Direview: "review",
  Revisi: "review",
  Diterima: "copyediting",
  Ditolak: "declined"
};

function normalisasiStatus(v: unknown): JurnalStatus {
  if (typeof v !== "string") return "submitted";
  if (v in PETA_STATUS_LAMA) return PETA_STATUS_LAMA[v];
  const sah: JurnalStatus[] = [
    "submitted",
    "review",
    "copyediting",
    "production",
    "published",
    "declined"
  ];
  return sah.includes(v as JurnalStatus) ? (v as JurnalStatus) : "submitted";
}

function keTampilan(n: CatatanLokal): JurnalSubmissionView {
  const riwayat: JurnalRiwayatItem[] = n.riwayat.map((r) => ({
    status: r.status,
    label: labelStatus(r.status),
    pada: r.pada,
    catatan: r.catatan ?? null
  }));
  return {
    kode: n.kode,
    judul: n.judul,
    penulis: n.penulis,
    email: n.email,
    afiliasi: n.afiliasi,
    abstrak: n.abstrak,
    status: n.status,
    statusLabel: labelStatus(n.status),
    riwayat,
    dibuatPada: n.dibuatPada,
    bagianSlug: n.bagianSlug ?? null,
    bagianLabel: labelBagian(n.bagianSlug),
    bahasa: n.bahasa ?? "id",
    abstrakEn: n.abstrakEn ?? "",
    kataKunci: n.kataKunci ?? [],
    penulisPendamping: n.penulisPendamping ?? [],
    berkas: (n.berkas ?? []).map((b) => ({
      kategori: (b.kategori === "pendukung"
        ? "pendukung"
        : "utama") as "utama" | "pendukung",
      namaAsli: b.namaAsli,
      mime: b.mime,
      ukuran: b.ukuran,
      bucket: b.bucket,
      kunci: b.kunci
    })),
    pernyataanAi: n.pernyataanAi ?? null,
    doi: n.doi ?? null,
    ditarikPada: n.ditarikPada ?? null
  };
}

const DIR = path.join(process.cwd(), ".jurnal-uji");
const FILE = path.join(DIR, "submissions.json");

// ── Baca dan tulis JSON mode lokal yang tahan balapan ────────────────────
// Temuan regresi penggabungan 23 Nov 2026: penulisan writeFile yang
// menimpa berkas secara langsung bisa dibaca setengah oleh permintaan
// lain yang datang hampir bersamaan (klaim undangan menulis
// accounts.json, login membaca 153 ms kemudian dan JSON.parse gagal),
// dan para pemuat memperlakukan bacaan robek itu sebagai berkas
// kosong, sehingga akun yang baru dibuat sesaat terbaca tidak ada.
// Perbaikannya dua arah: penulisan selalu atomik (berkas sementara
// lalu rename), dan pembacaan mencoba ulang beberapa kali sebelum
// menyerah; null hanya berarti berkas memang belum ada. Pemuat yang
// sudah memegang data di memori tidak menimpanya dengan keadaan
// kosong hanya karena satu bacaan gagal.
export async function bacaJsonBerkas<T>(file: string): Promise<T | null> {
  for (let percobaan = 0; percobaan < 10; percobaan++) {
    let teks: string;
    try {
      teks = await fs.readFile(file, "utf8");
    } catch (err) {
      // Hanya ENOENT yang berarti berkas memang belum ada. Galat baca
      // sesaat lain (misalnya kehabisan deskriptor berkas di bawah
      // beban berat) wajib dicoba ulang, bukan diperlakukan sebagai
      // berkas kosong: temuan regresi 23 Nov 2026, login reviewer
      // kedua sesudah klaim menjawab 401 karena bacaan sesaatnya
      // gagal dan pemuat jatuh ke salinan memori yang belum memuat
      // akun yang baru dibuat.
      if ((err as NodeJS.ErrnoException)?.code === "ENOENT") return null;
      await new Promise((r) => setTimeout(r, 50));
      continue;
    }
    try {
      return JSON.parse(teks) as T;
    } catch {
      await new Promise((r) => setTimeout(r, 50));
    }
  }
  return null;
}

export async function tulisJsonBerkas(
  file: string,
  data: unknown
): Promise<void> {
  await fs.mkdir(DIR, { recursive: true });
  const tmp = `${file}.tmp-${process.pid}-${Date.now()}-${Math.floor(
    Math.random() * 1e6
  )}`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tmp, file);
}

let memori: CatatanLokal[] | null = null;

// ── Gabung-daftar untuk penyimpanan yang aman dari balapan ─────────────
// Bundel halaman dan bundel route Next.js memegang salinan modul
// terpisah (temuan Tahap 4), jadi dua salinan dapat memuat daftar yang
// sama, mengubahnya, lalu menulisnya kembali secara berurutan: tulisan
// kedua menimpa tulisan pertama dan entri yang baru dibuat salinan
// pertama hilang dari berkas (bukti debug regresi gabungan 23 Nov 2026:
// berkas akun berubah 5 ke 4 ke 5 dalam 33 milidetik dan login sesudah
// klaim undangan menjawab 401). Karena itu setiap simpan WAJIB membaca
// ulang berkas dan menggabungkan: entri salinan ini menang untuk kunci
// yang sama, entri berkas yang tidak dikenal salinan ini dipertahankan.
// Tidak ada penghapusan keras di lapisan lokal, jadi gabung seperti ini
// aman untuk semua daftar di berkas ini.
export function gabungDaftar<T>(
  lama: T[],
  baru: T[],
  kunci: (e: T) => string
): T[] {
  const petaBaru = new Map(baru.map((e) => [kunci(e), e]));
  const hasil: T[] = [];
  const terlihat = new Set<string>();
  for (const e of lama) {
    const k = kunci(e);
    terlihat.add(k);
    hasil.push(petaBaru.get(k) ?? e);
  }
  for (const e of baru) {
    if (!terlihat.has(kunci(e))) hasil.push(e);
  }
  return hasil;
}

// ── Antrean tulis tunggal per berkas (dibagi lewat globalThis) ─────────
// Gabung saja tidak cukup: blok baca-gabung-tulis itu sendiri balapan
// (TOCTOU). Penulis kedua dapat membaca berkas SEBELUM rename penulis
// pertama mendarat, menggabungkan potret basinya, lalu menimpa hasil
// penulis pertama; bacaan berikutnya dari penulis ketiga memulihkan
// isinya. Itu persis bukti debug 5 ke 4 ke 5 dalam 33 ms. Obatnya:
// seluruh blok baca-gabung-tulis untuk satu berkas berjalan di dalam
// satu antrean promise yang DIBAGI semua salinan modul dalam proses,
// disimpan di globalThis karena tiap bundel Next.js memegang salinan
// modulnya sendiri tetapi berbagi globalThis yang sama. Metode ini dari
// telaah Claude luar yang dibawa user 23 Nov 2026 malam.
type TugasAntrian = <T>(tugas: () => Promise<T>) => Promise<T>;

function buatAntrian(): TugasAntrian {
  let ekor: Promise<unknown> = Promise.resolve();
  return function jalankan<T>(tugas: () => Promise<T>): Promise<T> {
    const hasil = ekor.then(tugas);
    ekor = hasil.then(
      () => undefined,
      () => undefined
    );
    return hasil;
  };
}

export function antrianUntuk(pathBerkas: string): TugasAntrian {
  const g = globalThis as unknown as {
    __jurnalAntrianTulis__?: Map<string, TugasAntrian>;
  };
  if (!g.__jurnalAntrianTulis__) g.__jurnalAntrianTulis__ = new Map();
  let antrian = g.__jurnalAntrianTulis__.get(pathBerkas);
  if (!antrian) {
    antrian = buatAntrian();
    g.__jurnalAntrianTulis__.set(pathBerkas, antrian);
  }
  return antrian;
}

async function muat(): Promise<CatatanLokal[]> {
  // Selalu baca ulang dari berkas: bundel halaman dan bundel route
  // Next.js memegang salinan modul terpisah, jadi cache memori murni
  // membuat halaman publik membaca data basi (temuan Tahap 4).
  const dataMentah = await bacaJsonBerkas<unknown>(FILE);
  if (dataMentah === null) {
    if (!memori) memori = [];
    return memori;
  }
  {
    const mentah = Array.isArray(dataMentah) ? dataMentah : [];
    memori = mentah.map((n: Record<string, unknown>) => ({
      kode: String(n.kode ?? ""),
      judul: String(n.judul ?? ""),
      penulis: String(n.penulis ?? ""),
      email: String(n.email ?? ""),
      afiliasi: String(n.afiliasi ?? ""),
      abstrak: String(n.abstrak ?? ""),
      status: normalisasiStatus(n.status),
      riwayat: Array.isArray(n.riwayat)
        ? (n.riwayat as { status: unknown; pada: string; catatan?: string }[]).map(
            (r) => ({
              status: normalisasiStatus(r.status),
              pada: String(r.pada ?? ""),
              catatan: r.catatan ?? null
            })
          )
        : [],
      dibuatPada: String(n.dibuatPada ?? new Date().toISOString()),
      bagianSlug:
        typeof n.bagianSlug === "string" ? (n.bagianSlug as string) : null,
      bahasa: typeof n.bahasa === "string" ? (n.bahasa as string) : "id",
      abstrakEn: typeof n.abstrakEn === "string" ? (n.abstrakEn as string) : "",
      kataKunci: Array.isArray(n.kataKunci)
        ? (n.kataKunci as unknown[]).map((k) => String(k))
        : [],
      penulisPendamping: Array.isArray(n.penulisPendamping)
        ? (n.penulisPendamping as JurnalPenulisInput[])
        : [],
      berkas: Array.isArray(n.berkas)
        ? (n.berkas as JurnalBerkasMeta[])
        : [],
      pernyataanAi:
        typeof n.pernyataanAi === "string" ? (n.pernyataanAi as string) : null,
      doi: typeof n.doi === "string" ? (n.doi as string) : null,
      ditarikPada:
        typeof n.ditarikPada === "string" ? (n.ditarikPada as string) : null,
      alasanTarik:
        typeof n.alasanTarik === "string" ? (n.alasanTarik as string) : null,
      daftarPeriksa:
        n.daftarPeriksa && typeof n.daftarPeriksa === "object"
          ? (n.daftarPeriksa as JurnalDaftarPeriksa)
          : undefined
    }));
  }
  return memori;
}

async function simpan(baru?: CatatanLokal[]): Promise<void> {
  const sumber = baru ?? memori;
  if (!sumber) return;
  await antrianUntuk(FILE)(async () => {
    try {
      const mentah = await bacaJsonBerkas<unknown>(FILE);
      const diBerkas = Array.isArray(mentah)
        ? (mentah as CatatanLokal[])
        : [];
      // Gabung dari POTRET MILIK MUTASI INI (parameter baru), bukan dari
      // variabel memori bersama: muat() milik request lain dapat
      // mengganti isi memori di antara muat dan simpan milik mutasi ini,
      // dan menggabung dari memori membuang hasil mutasi ini diam-diam.
      // Akar balapan klaim-login, terungkap lewat uji 20 pendaftaran
      // serentak: 20 jawaban 201 tetapi hanya 15 akun yang tersimpan.
      const gabungan = gabungDaftar(diBerkas, sumber, (n) => n.kode);
      memori = gabungan;
      await tulisJsonBerkas(FILE, gabungan);
    } catch {
      // Sistem berkas tidak bisa ditulis: data tetap hidup di memori proses.
    }
  });
}

function buatKodeUnik(existing: CatatanLokal[]): string {
  const tahun = new Date().getFullYear();
  for (let i = 0; i < 50; i++) {
    const acak = Math.floor(1000 + Math.random() * 9000);
    const kode = `JRN-${tahun}-${acak}`;
    if (!existing.some((n) => n.kode === kode)) return kode;
  }
  return `JRN-${tahun}-${Date.now() % 10000}`;
}

export async function listLokal(): Promise<JurnalSubmissionView[]> {
  const data = await muat();
  return [...data]
    .sort((a, b) => (a.dibuatPada < b.dibuatPada ? 1 : -1))
    .map(keTampilan);
}

export async function getLokal(kode: string): Promise<JurnalSubmissionView | null> {
  const data = await muat();
  const target = kode.trim().toUpperCase();
  const n = data.find((x) => x.kode === target);
  return n ? keTampilan(n) : null;
}

export async function createLokal(input: {
  judul: string;
  penulis: string;
  email: string;
  afiliasi: string;
  abstrak: string;
}): Promise<JurnalSubmissionView> {
  const data = await muat();
  const sekarang = new Date().toISOString();
  const naskah: CatatanLokal = {
    kode: buatKodeUnik(data),
    judul: input.judul,
    penulis: input.penulis,
    email: input.email,
    afiliasi: input.afiliasi,
    abstrak: input.abstrak,
    status: "submitted",
    riwayat: [{ status: "submitted", pada: sekarang }],
    dibuatPada: sekarang
  };
  data.push(naskah);
  await simpan(data);
  return keTampilan(naskah);
}

export async function updateStatusLokal(
  kode: string,
  status: JurnalStatus,
  catatan?: string | null
): Promise<JurnalSubmissionView | null> {
  const data = await muat();
  const target = kode.trim().toUpperCase();
  const naskah = data.find((n) => n.kode === target);
  if (!naskah) return null;
  naskah.status = status;
  naskah.riwayat.push({
    status,
    pada: new Date().toISOString(),
    catatan: catatan ?? null
  });
  await simpan(data);
  return keTampilan(naskah);
}

// ── Tahap 5: DOI dan penarikan artikel ──────────────────────────────────
// Padanan lokal kolom doi dan withdrawn_at pada jurnal_submissions
// (migrasi 004 dan 008). Penarikan tidak menghapus catatan dan tidak
// mengubah status: ia menandai artikel sebagai ditarik, yang menjadi
// tombstone persisten untuk OAI-PMH (header deleted).

export async function tetapkanDoiLokal(
  kode: string,
  doi: string | null
): Promise<JurnalSubmissionView | null> {
  const data = await muat();
  const target = kode.trim().toUpperCase();
  const naskah = data.find((n) => n.kode === target);
  if (!naskah) return null;
  naskah.doi = doi;
  await simpan(data);
  return keTampilan(naskah);
}

export async function tarikArtikelLokal(
  kode: string,
  alasan: string | null
): Promise<JurnalSubmissionView | null> {
  const data = await muat();
  const target = kode.trim().toUpperCase();
  const naskah = data.find((n) => n.kode === target);
  if (!naskah) return null;
  if (!naskah.ditarikPada) {
    naskah.ditarikPada = new Date().toISOString();
    naskah.alasanTarik = alasan;
    // Linimasa penarikan ditulis pemanggil lewat catatPeristiwaNaskah,
    // sama seperti jalur mode supabase.
    await simpan(data);
  }
  return keTampilan(naskah);
}

export interface ArtikelDitarikLokal {
  kode: string;
  judul: string;
  bagianSlug: string | null;
  ditarikPada: string;
  alasanTarik: string | null;
}

export async function daftarArtikelDitarikLokal(): Promise<
  ArtikelDitarikLokal[]
> {
  const data = await muat();
  return data
    .filter((n) => n.ditarikPada)
    .map((n) => ({
      kode: n.kode,
      judul: n.judul,
      bagianSlug: n.bagianSlug ?? null,
      ditarikPada: n.ditarikPada as string,
      alasanTarik: n.alasanTarik ?? null
    }));
}

// ── Tahap 2: pengiriman lengkap dari wizard ──────────────────────────────

export async function createLokalLengkap(
  input: JurnalWizardInput,
  pernyataanAiTeks: string
): Promise<JurnalSubmissionView> {
  const data = await muat();
  const sekarang = new Date().toISOString();
  const naskah: CatatanLokal = {
    kode: buatKodeUnik(data),
    judul: input.judul,
    penulis: input.penulisUtama.nama,
    email: input.penulisUtama.email,
    afiliasi: input.penulisUtama.afiliasi,
    abstrak: input.abstrakId,
    status: "submitted",
    riwayat: [{ status: "submitted", pada: sekarang }],
    dibuatPada: sekarang,
    bagianSlug: input.bagianSlug,
    bahasa: input.bahasa,
    abstrakEn: input.abstrakEn,
    kataKunci: input.kataKunci,
    penulisPendamping: input.penulisPendamping,
    berkas: input.berkas,
    pernyataanAi: pernyataanAiTeks,
    daftarPeriksa: input.daftarPeriksa
  };
  data.push(naskah);
  await simpan(data);
  return keTampilan(naskah);
}

export async function listLokalByEmail(
  email: string
): Promise<JurnalSubmissionView[]> {
  const data = await muat();
  const target = email.trim().toLowerCase();
  return data
    .filter((n) => n.email.trim().toLowerCase() === target)
    .sort((a, b) => (a.dibuatPada < b.dibuatPada ? 1 : -1))
    .map(keTampilan);
}

// ── Tahap 3: akses catatan mentah dan penambahan linimasa ────────────────
// Dipakai backend review lokal. Catatan mentah hanya beredar di server;
// fungsi yang melayani reviewer tidak pernah meneruskan kolom identitas
// penulis dari catatan ini (lihat review-local.ts).

export async function ambilCatatanLokalByKode(
  kode: string
): Promise<CatatanLokal | null> {
  const data = await muat();
  const target = kode.trim().toUpperCase();
  return data.find((n) => n.kode === target) ?? null;
}

// Menambah peristiwa linimasa tanpa mengubah status (penugasan reviewer,
// telaah diserahkan, putaran dibuka, revisi diunggah, dan sebagainya).
// Catatan peristiwa ini terbaca penulis lewat lacak dan Naskah Saya, jadi
// isinya tidak pernah boleh memuat identitas reviewer.
export async function tambahRiwayatLokal(
  kode: string,
  catatan: string
): Promise<void> {
  const data = await muat();
  const target = kode.trim().toUpperCase();
  const naskah = data.find((n) => n.kode === target);
  if (!naskah) return;
  naskah.riwayat.push({
    status: naskah.status,
    pada: new Date().toISOString(),
    catatan
  });
  await simpan(data);
}

// ── Tahap 2: akun penulis uji lokal ──────────────────────────────────────
// Akun uji untuk mode data lokal, disimpan di .jurnal-uji/accounts.json
// dengan kata sandi ter-hash scrypt (tidak pernah teks terang). Akun ini
// HANYA berlaku pada mode lokal dan berlabel mode uji di antarmuka; pada
// mode supabase akun dibuat di Supabase Auth (lihat src/lib/jurnal/akun.ts).

export interface AkunLokal {
  nama: string;
  email: string;
  afiliasi: string;
  negara: string | null;
  orcid: string | null;
  consentVersi: string;
  dibuatPada: string;
  // Peran jurnal akun uji (Tahap 3). Pendaftaran biasa memberi
  // ["author"]; klaim undangan reviewer memberi "reviewer". Peran staf
  // tidak disimpan di sini: ia diturunkan dari env staf uji di server.
  peran: JurnalRole[];
}

interface AkunLokalTersimpan extends AkunLokal {
  kataSandiHash: string; // format: scrypt:<saltHex>:<hashHex>
}

const FILE_AKUN = path.join(DIR, "accounts.json");
let memoriAkun: AkunLokalTersimpan[] | null = null;

async function muatAkun(): Promise<AkunLokalTersimpan[]> {
  // Baca ulang dari berkas (alasan sama seperti muat di atas).
  const data = await bacaJsonBerkas<unknown>(FILE_AKUN);
  if (data === null) {
    if (!memoriAkun) memoriAkun = [];
    return memoriAkun;
  }
  memoriAkun = Array.isArray(data) ? (data as AkunLokalTersimpan[]) : [];
  return memoriAkun;
}

async function simpanAkun(baru?: AkunLokalTersimpan[]): Promise<void> {
  const sumber = baru ?? memoriAkun;
  if (!sumber) return;
  await antrianUntuk(FILE_AKUN)(async () => {
    try {
      const mentah = await bacaJsonBerkas<unknown>(FILE_AKUN);
      const diBerkas = Array.isArray(mentah)
        ? (mentah as AkunLokalTersimpan[])
        : [];
      // Potret mutasi ini yang digabung, bukan memori bersama (lihat
      // catatan pada simpan di atas).
      const gabungan = gabungDaftar(diBerkas, sumber, (a) => a.email);
      memoriAkun = gabungan;
      await tulisJsonBerkas(FILE_AKUN, gabungan);
    } catch {
      // Sama seperti data naskah lokal: tetap hidup di memori proses.
    }
  });
}

function hashKataSandi(kataSandi: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(kataSandi, salt, 64);
  return `scrypt:${salt.toString("hex")}:${hash.toString("hex")}`;
}

function cocokKataSandi(kataSandi: string, tersimpan: string): boolean {
  const bagian = tersimpan.split(":");
  if (bagian.length !== 3 || bagian[0] !== "scrypt") return false;
  const salt = Buffer.from(bagian[1], "hex");
  const diharapkan = Buffer.from(bagian[2], "hex");
  const aktual = scryptSync(kataSandi, salt, 64);
  return (
    aktual.length === diharapkan.length && timingSafeEqual(aktual, diharapkan)
  );
}

function akunPublik(a: AkunLokalTersimpan): AkunLokal {
  return {
    nama: a.nama,
    email: a.email,
    afiliasi: a.afiliasi,
    negara: a.negara,
    orcid: a.orcid,
    consentVersi: a.consentVersi,
    dibuatPada: a.dibuatPada,
    peran: Array.isArray(a.peran) && a.peran.length > 0 ? a.peran : ["author"]
  };
}

export async function daftarAkunLokal(input: {
  nama: string;
  email: string;
  kataSandi: string;
  afiliasi: string;
  negara?: string;
  orcid?: string;
  consentVersi: string;
  peran?: JurnalRole[];
}): Promise<AkunLokal> {
  const akun = await muatAkun();
  const email = input.email.trim().toLowerCase();
  if (akun.some((a) => a.email === email)) {
    throw new Error("Email ini sudah terdaftar sebagai akun uji lokal.");
  }
  const baru: AkunLokalTersimpan = {
    nama: input.nama.trim(),
    email,
    afiliasi: input.afiliasi.trim(),
    negara: input.negara?.trim() || null,
    orcid: input.orcid?.trim() || null,
    consentVersi: input.consentVersi,
    dibuatPada: new Date().toISOString(),
    peran: input.peran && input.peran.length > 0 ? input.peran : ["author"],
    kataSandiHash: hashKataSandi(input.kataSandi)
  };
  akun.push(baru);
  await simpanAkun(akun);
  return akunPublik(baru);
}

export async function verifikasiAkunLokal(
  email: string,
  kataSandi: string
): Promise<AkunLokal | null> {
  const akun = await muatAkun();
  const target = akun.find((a) => a.email === email.trim().toLowerCase());
  if (!target) return null;
  return cocokKataSandi(kataSandi, target.kataSandiHash)
    ? akunPublik(target)
    : null;
}

export async function cariAkunLokal(email: string): Promise<AkunLokal | null> {
  const akun = await muatAkun();
  const target = akun.find((a) => a.email === email.trim().toLowerCase());
  return target ? akunPublik(target) : null;
}

// Daftar semua akun uji lokal (dipakai daftar pilihan reviewer staf).
export async function daftarSemuaAkunLokal(): Promise<AkunLokal[]> {
  const akun = await muatAkun();
  return akun.map(akunPublik);
}

// Menambah satu peran ke akun uji lokal yang sudah ada (klaim undangan
// reviewer untuk email yang sudah terdaftar). Mengembalikan null bila
// akun tidak ditemukan.
export async function tambahPeranAkunLokal(
  email: string,
  peranBaru: JurnalRole
): Promise<AkunLokal | null> {
  const akun = await muatAkun();
  const target = akun.find((a) => a.email === email.trim().toLowerCase());
  if (!target) return null;
  const peran: JurnalRole[] = Array.isArray(target.peran)
    ? [...target.peran]
    : ["author"];
  if (!peran.includes(peranBaru)) {
    target.peran = [...peran, peranBaru];
    await simpanAkun(akun);
  }
  return akunPublik(target);
}

// Peran lengkap akun uji lokal: gabungan peran tersimpan akun dengan
// peran staf uji dari env (JURNAL_LOCAL_STAFF_EMAILS). Versi asinkron
// dari peranLokalDariEmail di sesi-lokal.ts, dipakai route baru Tahap 3
// dan route login supaya peran reviewer hasil klaim undangan terbaca.
export async function peranLokalLengkap(
  email: string
): Promise<JurnalRole[]> {
  const peran = new Set<JurnalRole>();
  const akun = await cariAkunLokal(email);
  for (const p of akun?.peran ?? ["author"]) peran.add(p);
  if (emailStafLokal(email)) {
    peran.add("journal_manager");
    peran.add("editor");
    peran.add("author");
  }
  return [...peran];
}

// ── Tahap Keamanan: catatan peristiwa keamanan mode lokal ───────────────
// Padanan lokal tabel jurnal_security_events (migrasi 005). Disimpan di
// .jurnal-uji/security-events.json, maksimal 1.000 peristiwa terakhir.
// Pencatatan tidak pernah melempar: kegagalannya hanya masuk log server.

export interface PeristiwaKeamananLokal {
  jenis: string;
  ip: string | null;
  email: string | null;
  kode: string | null;
  rincian: string | null;
  pada: string; // ISO datetime
}

const FILE_KEAMANAN = path.join(DIR, "security-events.json");
let memoriKeamanan: PeristiwaKeamananLokal[] | null = null;

async function muatKeamanan(): Promise<PeristiwaKeamananLokal[]> {
  // Baca ulang dari berkas (alasan sama seperti muat di atas).
  const data = await bacaJsonBerkas<unknown>(FILE_KEAMANAN);
  if (data === null) {
    if (!memoriKeamanan) memoriKeamanan = [];
    return memoriKeamanan;
  }
  memoriKeamanan = Array.isArray(data)
    ? (data as PeristiwaKeamananLokal[])
    : [];
  return memoriKeamanan;
}

export async function catatPeristiwaKeamananLokal(
  peristiwa: Omit<PeristiwaKeamananLokal, "pada">
): Promise<void> {
  try {
    await antrianUntuk(FILE_KEAMANAN)(async () => {
      const daftar = await muatKeamanan();
      daftar.push({ ...peristiwa, pada: new Date().toISOString() });
      const mentah = await bacaJsonBerkas<unknown>(FILE_KEAMANAN);
      const diBerkas = Array.isArray(mentah)
        ? (mentah as PeristiwaKeamananLokal[])
        : [];
      const kunciPeristiwa = (e: PeristiwaKeamananLokal) =>
        `${e.pada}|${e.jenis}|${e.email ?? ""}|${e.kode ?? ""}|${e.rincian ?? ""}`;
      let gabungan = gabungDaftar(diBerkas, daftar, kunciPeristiwa);
      while (gabungan.length > 1000) gabungan.shift();
      memoriKeamanan = gabungan;
      try {
        await tulisJsonBerkas(FILE_KEAMANAN, gabungan);
      } catch {
        // Sistem berkas tidak bisa ditulis: catatan tetap hidup di memori.
      }
    });
  } catch (err) {
    console.warn(
      "[jurnal] Gagal mencatat peristiwa keamanan lokal:",
      err instanceof Error ? err.message : err
    );
  }
}

export async function daftarPeristiwaKeamananLokal(): Promise<
  PeristiwaKeamananLokal[]
> {
  return [...(await muatKeamanan())];
}

// ── Tahap 3: penyimpanan mesin review mode lokal ─────────────────────────
// Padanan lokal tabel jurnal_review_rounds, jurnal_review_assignments,
// dan baris berkas tahap review pada jurnal_submission_files (migrasi
// 004). Disimpan di .jurnal-uji/review.json. Berkas revisi hanya berupa
// metadata; isi berkas tetap di folder unggahan uji atau R2.

export interface PutaranReviewLokal {
  nomor: number;
  status: "open" | "closed";
  keputusan: string | null;
  dibuatPada: string;
  diputuskanPada: string | null;
}

export interface PenugasanReviewLokal {
  id: string;
  kode: string;
  putaran: number;
  reviewerEmail: string;
  reviewerNama: string;
  status: string; // invited | accepted | declined | completed | cancelled
  ditugaskanPada: string;
  tenggat: string | null;
  rekomendasi: string | null;
  komentarPenulis: string | null;
  komentarEditor: string | null;
  diserahkanPada: string | null;
}

export interface BerkasRevisiLokal {
  id: string;
  kode: string;
  putaran: number; // putaran yang keputusannya memicu revisi ini
  kategori: "utama" | "pendukung";
  namaAsli: string;
  mime: string;
  ukuran: number;
  bucket: string;
  kunci: string;
  diunggahPada: string;
}

export interface DataReviewLokal {
  putaran: Record<string, PutaranReviewLokal[]>;
  penugasan: PenugasanReviewLokal[];
  berkasRevisi: BerkasRevisiLokal[];
}

const FILE_REVIEW = path.join(DIR, "review.json");
let memoriReview: DataReviewLokal | null = null;

export async function muatDataReviewLokal(): Promise<DataReviewLokal> {
  // Baca ulang dari berkas (alasan sama seperti muat di atas).
  const data = await bacaJsonBerkas<Partial<DataReviewLokal>>(FILE_REVIEW);
  if (data === null && memoriReview) return memoriReview;
  const d = data ?? {};
  memoriReview = {
    putaran: d.putaran && typeof d.putaran === "object" ? d.putaran : {},
    penugasan: Array.isArray(d.penugasan) ? d.penugasan : [],
    berkasRevisi: Array.isArray(d.berkasRevisi) ? d.berkasRevisi : []
  };
  return memoriReview;
}

export async function simpanDataReviewLokal(
  baru?: DataReviewLokal
): Promise<void> {
  const sumber = baru ?? memoriReview;
  if (!sumber) return;
  await antrianUntuk(FILE_REVIEW)(async () => {
    try {
      const mentah = await bacaJsonBerkas<Partial<DataReviewLokal>>(FILE_REVIEW);
      const diBerkas: DataReviewLokal = {
        putaran:
          mentah?.putaran && typeof mentah.putaran === "object"
            ? mentah.putaran
            : {},
        penugasan: Array.isArray(mentah?.penugasan) ? mentah.penugasan : [],
        berkasRevisi: Array.isArray(mentah?.berkasRevisi)
          ? mentah.berkasRevisi
          : []
      };
      const gabungan: DataReviewLokal = {
        putaran: { ...diBerkas.putaran, ...sumber.putaran },
        penugasan: gabungDaftar(
          diBerkas.penugasan,
          sumber.penugasan,
          (p) => p.id
        ),
        berkasRevisi: gabungDaftar(
          diBerkas.berkasRevisi,
          sumber.berkasRevisi,
          (b) => b.id
        )
      };
      memoriReview = gabungan;
      await tulisJsonBerkas(FILE_REVIEW, gabungan);
    } catch {
      // Sama seperti data lokal lain: tetap hidup di memori proses.
    }
  });
}

// ── Tahap 3: undangan reviewer mode lokal ────────────────────────────────
// Padanan lokal tabel jurnal_invitations (migrasi 006). Token mentah
// tidak pernah disimpan; yang disimpan adalah hash SHA-256 token.

export interface UndanganLokal {
  id: string;
  email: string;
  tokenHash: string;
  dibuatOleh: string | null;
  dibuatPada: string;
  kedaluwarsa: string;
  dipakaiPada: string | null;
}

const FILE_UNDANGAN = path.join(DIR, "invitations.json");
let memoriUndangan: UndanganLokal[] | null = null;

export async function muatUndanganLokal(): Promise<UndanganLokal[]> {
  // Baca ulang dari berkas (alasan sama seperti muat di atas).
  const data = await bacaJsonBerkas<unknown>(FILE_UNDANGAN);
  if (data === null) {
    if (!memoriUndangan) memoriUndangan = [];
    return memoriUndangan;
  }
  memoriUndangan = Array.isArray(data) ? (data as UndanganLokal[]) : [];
  return memoriUndangan;
}

export async function simpanUndanganLokal(
  baru?: UndanganLokal[]
): Promise<void> {
  const sumber = baru ?? memoriUndangan;
  if (!sumber) return;
  await antrianUntuk(FILE_UNDANGAN)(async () => {
    try {
      const mentah = await bacaJsonBerkas<unknown>(FILE_UNDANGAN);
      const diBerkas = Array.isArray(mentah) ? (mentah as UndanganLokal[]) : [];
      const gabungan = gabungDaftar(diBerkas, sumber, (u) => u.tokenHash);
      memoriUndangan = gabungan;
      await tulisJsonBerkas(FILE_UNDANGAN, gabungan);
    } catch {
      // Tetap hidup di memori proses.
    }
  });
}

// ── Tahap 4: penyimpanan alur copyediting, produksi, terbitan, metrik ────
// Padanan lokal tabel jurnal_copyediting_tasks, jurnal_production_tasks,
// jurnal_issues, kolom penempatan pada jurnal_submissions, baris berkas
// tahap copyedit dan galley pada jurnal_submission_files, dan tabel
// jurnal_article_daily_metrics (migrasi 004). Disimpan di
// .jurnal-uji/workflow.json. Isi berkas tidak pernah disimpan di sini;
// hanya metadata dan kunci objeknya, sama seperti tahap sebelumnya.

export interface TugasCopyLokal {
  id: string;
  kode: string;
  copyeditorEmail: string;
  copyeditorNama: string;
  ditugaskanOleh: string | null;
  status: string; // assigned | in_progress | author_review | completed | cancelled
  catatan: string | null;
  berkasHasilId: string | null;
  persetujuanPenulisPada: string | null;
  dibuatPada: string;
  selesaiPada: string | null;
}

export interface TugasProduksiLokal {
  id: string;
  kode: string;
  layoutEmail: string;
  layoutNama: string;
  ditugaskanOleh: string | null;
  status: string; // assigned | galley_ready | proofreading | author_proof | ready | cancelled
  catatan: string | null;
  proofStatus: "menunggu" | "disetujui" | "koreksi";
  proofCatatan: string | null;
  proofPada: string | null;
  siapPada: string | null;
  dibuatPada: string;
}

export interface BerkasAlurLokal {
  id: string;
  kode: string;
  tahap: "copyedit" | "galley";
  jenis: "copyedited" | "galley_pdf" | "galley_html";
  kategori: string;
  namaAsli: string;
  mime: string;
  ukuran: number;
  bucket: string;
  kunci: string;
  diunggahOleh: string | null;
  diunggahPada: string;
}

export interface TerbitanLokal {
  id: string;
  slug: string;
  volume: number | null;
  number: number | null;
  year: number;
  judul: string | null;
  uraian: string | null;
  status: "draft" | "scheduled" | "published";
  isCurrent: boolean;
  tanggalTerbit: string | null;
  dibuatPada: string;
}

export interface PenempatanLokal {
  issueId: string;
  urutan: number;
}

export interface DataAlurLokal {
  tugasCopy: TugasCopyLokal[];
  tugasProduksi: TugasProduksiLokal[];
  berkasAlur: BerkasAlurLokal[];
  terbitan: TerbitanLokal[];
  penempatan: Record<string, PenempatanLokal>;
  metrik: Record<string, Record<string, { views: number; downloads: number }>>;
}

const FILE_ALUR = path.join(DIR, "workflow.json");
let memoriAlur: DataAlurLokal | null = null;

export async function muatDataAlurLokal(): Promise<DataAlurLokal> {
  // Baca ulang dari berkas (alasan sama seperti muat di atas).
  const data = await bacaJsonBerkas<Partial<DataAlurLokal>>(FILE_ALUR);
  if (data === null && memoriAlur) return memoriAlur;
  const d = data ?? {};
  memoriAlur = {
    tugasCopy: Array.isArray(d.tugasCopy) ? d.tugasCopy : [],
    tugasProduksi: Array.isArray(d.tugasProduksi) ? d.tugasProduksi : [],
    berkasAlur: Array.isArray(d.berkasAlur) ? d.berkasAlur : [],
    terbitan: Array.isArray(d.terbitan) ? d.terbitan : [],
    penempatan:
      d.penempatan && typeof d.penempatan === "object" ? d.penempatan : {},
    metrik: d.metrik && typeof d.metrik === "object" ? d.metrik : {}
  };
  return memoriAlur;
}

export async function simpanDataAlurLokal(
  baru?: DataAlurLokal
): Promise<void> {
  const sumber = baru ?? memoriAlur;
  if (!sumber) return;
  await antrianUntuk(FILE_ALUR)(async () => {
    try {
      const mentah = await bacaJsonBerkas<Partial<DataAlurLokal>>(FILE_ALUR);
      const diBerkas: DataAlurLokal = {
        tugasCopy: Array.isArray(mentah?.tugasCopy) ? mentah.tugasCopy : [],
        tugasProduksi: Array.isArray(mentah?.tugasProduksi)
          ? mentah.tugasProduksi
          : [],
        berkasAlur: Array.isArray(mentah?.berkasAlur) ? mentah.berkasAlur : [],
        terbitan: Array.isArray(mentah?.terbitan) ? mentah.terbitan : [],
        penempatan:
          mentah?.penempatan && typeof mentah.penempatan === "object"
            ? mentah.penempatan
            : {},
        metrik:
          mentah?.metrik && typeof mentah.metrik === "object"
            ? mentah.metrik
            : {}
      };
      const metrikGabungan: DataAlurLokal["metrik"] = { ...diBerkas.metrik };
      for (const [kode, perHari] of Object.entries(sumber.metrik)) {
        metrikGabungan[kode] = { ...(metrikGabungan[kode] ?? {}), ...perHari };
      }
      const gabungan: DataAlurLokal = {
        tugasCopy: gabungDaftar(
          diBerkas.tugasCopy,
          sumber.tugasCopy,
          (t) => t.id
        ),
        tugasProduksi: gabungDaftar(
          diBerkas.tugasProduksi,
          sumber.tugasProduksi,
          (t) => t.id
        ),
        berkasAlur: gabungDaftar(
          diBerkas.berkasAlur,
          sumber.berkasAlur,
          (b) => b.id
        ),
        terbitan: gabungDaftar(diBerkas.terbitan, sumber.terbitan, (t) => t.id),
        penempatan: { ...diBerkas.penempatan, ...sumber.penempatan },
        metrik: metrikGabungan
      };
      memoriAlur = gabungan;
      await tulisJsonBerkas(FILE_ALUR, gabungan);
    } catch {
      // Sama seperti data lokal lain: tetap hidup di memori proses.
    }
  });
}

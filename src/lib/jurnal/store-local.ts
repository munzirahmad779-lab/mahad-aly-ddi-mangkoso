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
  type JurnalStatus,
  type JurnalSubmissionView
} from "./status";
import {
  labelBagian,
  type JurnalBerkasMeta,
  type JurnalDaftarPeriksa,
  type JurnalPenulisInput,
  type JurnalWizardInput
} from "./wizard";

interface CatatanLokal {
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
      kategori: b.kategori,
      namaAsli: b.namaAsli,
      mime: b.mime,
      ukuran: b.ukuran,
      bucket: b.bucket,
      kunci: b.kunci
    })),
    pernyataanAi: n.pernyataanAi ?? null
  };
}

const DIR = path.join(process.cwd(), ".jurnal-uji");
const FILE = path.join(DIR, "submissions.json");

let memori: CatatanLokal[] | null = null;

async function muat(): Promise<CatatanLokal[]> {
  if (memori) return memori;
  try {
    const teks = await fs.readFile(FILE, "utf8");
    const data = JSON.parse(teks);
    const mentah = Array.isArray(data) ? data : [];
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
      daftarPeriksa:
        n.daftarPeriksa && typeof n.daftarPeriksa === "object"
          ? (n.daftarPeriksa as JurnalDaftarPeriksa)
          : undefined
    }));
  } catch {
    memori = [];
  }
  return memori;
}

async function simpan(): Promise<void> {
  if (!memori) return;
  try {
    await fs.mkdir(DIR, { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(memori, null, 2), "utf8");
  } catch {
    // Sistem berkas tidak bisa ditulis: data tetap hidup di memori proses.
  }
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
  await simpan();
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
  await simpan();
  return keTampilan(naskah);
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
  await simpan();
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
}

interface AkunLokalTersimpan extends AkunLokal {
  kataSandiHash: string; // format: scrypt:<saltHex>:<hashHex>
}

const FILE_AKUN = path.join(DIR, "accounts.json");
let memoriAkun: AkunLokalTersimpan[] | null = null;

async function muatAkun(): Promise<AkunLokalTersimpan[]> {
  if (memoriAkun) return memoriAkun;
  try {
    const teks = await fs.readFile(FILE_AKUN, "utf8");
    const data = JSON.parse(teks);
    memoriAkun = Array.isArray(data) ? (data as AkunLokalTersimpan[]) : [];
  } catch {
    memoriAkun = [];
  }
  return memoriAkun;
}

async function simpanAkun(): Promise<void> {
  if (!memoriAkun) return;
  try {
    await fs.mkdir(DIR, { recursive: true });
    await fs.writeFile(FILE_AKUN, JSON.stringify(memoriAkun, null, 2), "utf8");
  } catch {
    // Sama seperti data naskah lokal: tetap hidup di memori proses.
  }
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
    dibuatPada: a.dibuatPada
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
    kataSandiHash: hashKataSandi(input.kataSandi)
  };
  akun.push(baru);
  await simpanAkun();
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

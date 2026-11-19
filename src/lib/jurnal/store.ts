// ─────────────────────────────────────────────────────────────────────────────
// Lapisan data uji naskah jurnal — SERVER ONLY.
//
// Penyimpanan: berkas JSON lokal di <cwd>/.jurnal-uji/submissions.json
// dengan cadangan memori proses bila berkas tidak bisa ditulis (mis. sistem
// berkas hanya-baca di lingkungan serverless). Lapisan ini SENGAJA tidak
// memakai Supabase Mahadaly produksi: data uji tidak boleh mencemari kotak
// naskah asli kampus. Di lingkungan serverless berkas bersifat sementara,
// jadi data uji bisa hilang saat instans berganti — diterima untuk versi uji.
// ─────────────────────────────────────────────────────────────────────────────

import { promises as fs } from "fs";
import path from "path";

export const STATUS_NASKAH_UJI = [
  "Diterima Redaksi",
  "Direview",
  "Revisi",
  "Diterima",
  "Ditolak"
] as const;

export type StatusNaskahUji = (typeof STATUS_NASKAH_UJI)[number];

export interface RiwayatStatus {
  status: StatusNaskahUji;
  pada: string; // ISO datetime
}

export interface NaskahUji {
  kode: string; // JRN-YYYY-XXXX
  judul: string;
  penulis: string;
  email: string;
  afiliasi: string;
  abstrak: string;
  status: StatusNaskahUji;
  riwayat: RiwayatStatus[];
  dibuatPada: string; // ISO datetime
}

const DIR = path.join(process.cwd(), ".jurnal-uji");
const FILE = path.join(DIR, "submissions.json");

let memori: NaskahUji[] | null = null;

async function muat(): Promise<NaskahUji[]> {
  if (memori) return memori;
  try {
    const teks = await fs.readFile(FILE, "utf8");
    const data = JSON.parse(teks);
    memori = Array.isArray(data) ? (data as NaskahUji[]) : [];
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

function buatKodeUnik(existing: NaskahUji[]): string {
  const tahun = new Date().getFullYear();
  for (let i = 0; i < 50; i++) {
    const acak = Math.floor(1000 + Math.random() * 9000);
    const kode = `JRN-${tahun}-${acak}`;
    if (!existing.some((n) => n.kode === kode)) return kode;
  }
  // Cadangan bila 50 percobaan bentrok (nyaris mustahil pada skala uji).
  return `JRN-${tahun}-${Date.now() % 10000}`;
}

export async function listNaskahUji(): Promise<NaskahUji[]> {
  const data = await muat();
  return [...data].sort((a, b) => (a.dibuatPada < b.dibuatPada ? 1 : -1));
}

export async function getNaskahUji(kode: string): Promise<NaskahUji | null> {
  const data = await muat();
  const target = kode.trim().toUpperCase();
  return data.find((n) => n.kode === target) ?? null;
}

export async function createNaskahUji(input: {
  judul: string;
  penulis: string;
  email: string;
  afiliasi: string;
  abstrak: string;
}): Promise<NaskahUji> {
  const data = await muat();
  const sekarang = new Date().toISOString();
  const naskah: NaskahUji = {
    kode: buatKodeUnik(data),
    judul: input.judul,
    penulis: input.penulis,
    email: input.email,
    afiliasi: input.afiliasi,
    abstrak: input.abstrak,
    status: "Diterima Redaksi",
    riwayat: [{ status: "Diterima Redaksi", pada: sekarang }],
    dibuatPada: sekarang
  };
  data.push(naskah);
  await simpan();
  return naskah;
}

export async function updateStatusNaskahUji(
  kode: string,
  status: StatusNaskahUji
): Promise<NaskahUji | null> {
  const data = await muat();
  const target = kode.trim().toUpperCase();
  const naskah = data.find((n) => n.kode === target);
  if (!naskah) return null;
  naskah.status = status;
  naskah.riwayat.push({ status, pada: new Date().toISOString() });
  await simpan();
  return naskah;
}

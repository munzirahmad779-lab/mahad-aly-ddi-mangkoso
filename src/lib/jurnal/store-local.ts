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
import {
  labelStatus,
  type JurnalRiwayatItem,
  type JurnalStatus,
  type JurnalSubmissionView
} from "./status";

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
    dibuatPada: n.dibuatPada
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
      dibuatPada: String(n.dibuatPada ?? new Date().toISOString())
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

// ─────────────────────────────────────────────────────────────────────────────
// Backend Tahap 5 MODE LOKAL — SERVER ONLY.
//
// Pengumuman disimpan di .jurnal-uji/tahap5.json (padanan lokal tabel
// jurnal_announcements migrasi 004). DOI dan penarikan menumpang catatan
// naskah di store-local (kolom doi dan ditarikPada), metrik membaca
// workflow.json lewat muatDataAlurLokal. Berkas dibaca ulang dari disk
// setiap kali, mengikuti pelajaran bundel terpisah Tahap 4.
// ─────────────────────────────────────────────────────────────────────────────

import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import {
  daftarArtikelDitarikLokal,
  listLokal,
  muatDataAlurLokal,
  tarikArtikelLokal,
  tetapkanDoiLokal
} from "./store-local";
import type {
  MetrikMentah,
  PengumumanInternal,
  Publik5Backend
} from "./publik5-internal";

const FILE = path.join(process.cwd(), ".jurnal-uji", "tahap5.json");

interface DataTahap5Lokal {
  pengumuman: PengumumanInternal[];
}

async function muat(): Promise<DataTahap5Lokal> {
  try {
    const teks = await fs.readFile(FILE, "utf8");
    const data = JSON.parse(teks) as Partial<DataTahap5Lokal>;
    return {
      pengumuman: Array.isArray(data.pengumuman) ? data.pengumuman : []
    };
  } catch {
    return { pengumuman: [] };
  }
}

async function simpan(data: DataTahap5Lokal): Promise<void> {
  try {
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(data, null, 2), "utf8");
  } catch {
    // Sistem berkas hanya-baca: data tetap hidup selama proses berjalan
    // lewat bacaan berikutnya yang gagal dan mengembalikan kosong;
    // keterbatasan mode uji yang sama dengan lapisan lokal lain.
  }
}

export const publik5BackendLokal: Publik5Backend = {
  async daftarPengumumanSemua() {
    const data = await muat();
    return [...data.pengumuman].sort((a, b) =>
      a.dibuatPada < b.dibuatPada ? 1 : -1
    );
  },

  async buatPengumuman(input) {
    const data = await muat();
    const sekarang = new Date().toISOString();
    const baru: PengumumanInternal = {
      id: randomUUID(),
      judul: input.judul,
      isi: input.isi,
      tayang: input.tayang,
      diterbitkanPada: input.tayang ? sekarang : null,
      kedaluwarsaPada: input.kedaluwarsaPada,
      dibuatPada: sekarang
    };
    data.pengumuman.push(baru);
    await simpan(data);
    return baru;
  },

  async ubahPengumuman(id, patch) {
    const data = await muat();
    const target = data.pengumuman.find((p) => p.id === id);
    if (!target) throw new Error("Pengumuman tidak ditemukan.");
    if (patch.judul !== undefined) target.judul = patch.judul;
    if (patch.isi !== undefined) target.isi = patch.isi;
    if (patch.tayang !== undefined) {
      target.tayang = patch.tayang;
      target.diterbitkanPada = patch.tayang
        ? target.diterbitkanPada ?? new Date().toISOString()
        : null;
    }
    if (patch.kedaluwarsaPada !== undefined) {
      target.kedaluwarsaPada = patch.kedaluwarsaPada;
    }
    await simpan(data);
  },

  async hapusPengumuman(id) {
    const data = await muat();
    data.pengumuman = data.pengumuman.filter((p) => p.id !== id);
    await simpan(data);
  },

  async tetapkanDoi(kode, doi) {
    return (await tetapkanDoiLokal(kode, doi)) !== null;
  },

  async tarikArtikel(kode, alasan) {
    return (await tarikArtikelLokal(kode, alasan)) !== null;
  },

  async daftarTombstone() {
    const ditarik = await daftarArtikelDitarikLokal();
    return ditarik.map((d) => ({
      kode: d.kode,
      judul: d.judul,
      bagianSlug: d.bagianSlug,
      ditarikPada: d.ditarikPada,
      alasanTarik: d.alasanTarik
    }));
  },

  async ambilMetrikMentah(): Promise<MetrikMentah[]> {
    const data = await muatDataAlurLokal();
    return Object.entries(data.metrik).map(([kode, perHari]) => ({
      kode,
      perHari
    }));
  },

  async cariKodeIlike() {
    // Mode lokal: fasad menyaring daftar publik di memori.
    return new Set<string>();
  }
};

// Dipakai fasad untuk memastikan listLokal tetap menjadi sumber judul
// dan status pada statistik mode lokal.
export { listLokal };

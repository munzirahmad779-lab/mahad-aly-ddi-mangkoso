// ─────────────────────────────────────────────────────────────────────────────
// Fasad lapisan Tahap 5 jurnal — SERVER ONLY.
//
// Menggabungkan backend mode ganda (publik5-local / publik5-supabase)
// dengan daftar publik dari lapisan alur (alur-server) untuk:
// - pengumuman (publik hanya yang tayang dan belum kedaluwarsa),
// - DOI per artikel (hanya journal_manager yang menulis, lewat route),
// - penarikan artikel dan tombstone OAI,
// - pencarian artikel published (judul, abstrak, kata kunci, penulis),
// - statistik staf dari metrik harian tanpa data pribadi pengunjung.
// ─────────────────────────────────────────────────────────────────────────────

import { getJurnalDataMode, listSubmissions } from "./store";
import { daftarTerbitanPublik } from "./alur-server";
import type { JurnalArtikelPublik } from "./alur";
import { publik5BackendLokal } from "./publik5-local";
import { publik5BackendSupabase } from "./publik5-supabase";
import type {
  PengumumanInternal,
  Publik5Backend,
  TombstoneInternal
} from "./publik5-internal";
import {
  normalisasiDoi,
  type JurnalArtikelDoiView,
  type JurnalPengumumanView,
  type JurnalStatistikView
} from "./publik5";

async function backend(): Promise<Publik5Backend> {
  return (await getJurnalDataMode()) === "supabase"
    ? publik5BackendSupabase
    : publik5BackendLokal;
}

function pengumumanKeView(p: PengumumanInternal): JurnalPengumumanView {
  return {
    id: p.id,
    judul: p.judul,
    isi: p.isi,
    tayang: p.tayang,
    diterbitkanPada: p.diterbitkanPada,
    kedaluwarsaPada: p.kedaluwarsaPada,
    dibuatPada: p.dibuatPada
  };
}

export async function daftarPengumumanStaf(): Promise<JurnalPengumumanView[]> {
  return (await (await backend()).daftarPengumumanSemua()).map(
    pengumumanKeView
  );
}

export async function daftarPengumumanPublik(): Promise<
  JurnalPengumumanView[]
> {
  const sekarang = new Date().toISOString();
  const semua = await (await backend()).daftarPengumumanSemua();
  return semua
    .filter(
      (p) =>
        p.tayang &&
        (!p.diterbitkanPada || p.diterbitkanPada <= sekarang) &&
        (!p.kedaluwarsaPada || p.kedaluwarsaPada > sekarang)
    )
    .map(pengumumanKeView);
}

export async function buatPengumumanBaru(data: {
  judul: string;
  isi: string;
  tayang: boolean;
  kedaluwarsaPada: string | null;
}): Promise<JurnalPengumumanView> {
  return pengumumanKeView(await (await backend()).buatPengumuman(data));
}

export async function ubahPengumuman(
  id: string,
  patch: Partial<{
    judul: string;
    isi: string;
    tayang: boolean;
    kedaluwarsaPada: string | null;
  }>
): Promise<void> {
  await (await backend()).ubahPengumuman(id, patch);
}

export async function hapusPengumuman(id: string): Promise<void> {
  await (await backend()).hapusPengumuman(id);
}

// ── DOI dan penarikan ────────────────────────────────────────────────────

export async function daftarArtikelDoiStaf(): Promise<JurnalArtikelDoiView[]> {
  const semua = await listSubmissions();
  return semua
    .filter((n) => n.status === "published")
    .map((n) => ({
      kode: n.kode,
      judul: n.judul,
      status: n.status,
      doi: n.doi ?? null,
      ditarikPada: n.ditarikPada ?? null
    }))
    .sort((a, b) => a.kode.localeCompare(b.kode));
}

// Mengembalikan pesan galat atau null bila berhasil. DOI kosong berarti
// menghapus DOI yang tersimpan.
export async function tetapkanDoiArtikel(
  kode: string,
  doiMentah: unknown
): Promise<string | null> {
  const target = await (await listSubmissions()).find(
    (n) => n.kode === kode.trim().toUpperCase()
  );
  if (!target) return "Naskah tidak ditemukan.";
  if (target.status !== "published") {
    return "DOI hanya dapat diisi untuk artikel yang sudah terbit.";
  }
  if (target.ditarikPada) return "Artikel sudah ditarik.";
  let doi: string | null = null;
  if (typeof doiMentah === "string" && doiMentah.trim()) {
    doi = normalisasiDoi(doiMentah);
    if (!doi) {
      return "Format DOI tidak sah. Contoh bentuk yang sah: 10.1234/turatsuna.v1i1.1";
    }
  } else if (doiMentah !== null && doiMentah !== "") {
    return "DOI harus berupa teks atau dikosongkan.";
  }
  const ok = await (await backend()).tetapkanDoi(target.kode, doi);
  return ok ? null : "Gagal menyimpan DOI.";
}

export async function tarikArtikelTerbit(
  kode: string,
  alasan: string | null
): Promise<string | null> {
  const target = (await listSubmissions()).find(
    (n) => n.kode === kode.trim().toUpperCase()
  );
  if (!target) return "Naskah tidak ditemukan.";
  if (target.status !== "published") {
    return "Hanya artikel terbit yang dapat ditarik.";
  }
  if (target.ditarikPada) return "Artikel ini sudah ditarik sebelumnya.";
  const ok = await (await backend()).tarikArtikel(target.kode, alasan);
  return ok ? null : "Gagal menarik artikel.";
}

export async function daftarTombstoneOai(): Promise<TombstoneInternal[]> {
  return (await backend()).daftarTombstone();
}

export async function infoPenarikanDariSlug(
  slug: string
): Promise<TombstoneInternal | null> {
  const kode = slug.trim().toUpperCase();
  const semua = await daftarTombstoneOai();
  return semua.find((t) => t.kode === kode) ?? null;
}

// ── Pencarian dan jelajah publik ─────────────────────────────────────────

export async function semuaArtikelPublik(): Promise<JurnalArtikelPublik[]> {
  const terbitan = await daftarTerbitanPublik();
  return terbitan
    .flatMap((t) => t.artikel)
    .sort((a, b) => (a.tanggalTerbit < b.tanggalTerbit ? 1 : -1));
}

function cocokTeks(a: JurnalArtikelPublik, q: string): boolean {
  const jarum = q.toLowerCase();
  const jerami = [
    a.judul,
    a.abstrak,
    a.abstrakEn,
    ...a.kataKunci,
    ...a.penulis.map((p) => p.nama)
  ]
    .join("\n")
    .toLowerCase();
  return jerami.includes(jarum);
}

export async function cariArtikelPublik(saring: {
  q?: string;
  bagianSlug?: string | null;
  terbitanSlug?: string | null;
}): Promise<JurnalArtikelPublik[]> {
  let hasil = await semuaArtikelPublik();
  const q = (saring.q ?? "").trim();
  if (q) {
    if ((await getJurnalDataMode()) === "supabase") {
      const kodeCocok = await (await backend()).cariKodeIlike(q);
      hasil = hasil.filter(
        (a) => kodeCocok.has(a.kode) || cocokTeks(a, q)
      );
    } else {
      hasil = hasil.filter((a) => cocokTeks(a, q));
    }
  }
  if (saring.bagianSlug) {
    hasil = hasil.filter((a) => a.bagianSlug === saring.bagianSlug);
  }
  if (saring.terbitanSlug) {
    hasil = hasil.filter((a) => a.terbitanSlug === saring.terbitanSlug);
  }
  return hasil;
}

// ── Statistik staf ───────────────────────────────────────────────────────

export async function ringkasanStatistik(): Promise<JurnalStatistikView> {
  const [mentah, semua] = await Promise.all([
    (await backend()).ambilMetrikMentah(),
    listSubmissions()
  ]);
  const info = new Map(
    semua.map((n) => [n.kode, { judul: n.judul, status: n.status }])
  );
  let totalViews = 0;
  let totalDownloads = 0;
  const perHariMap = new Map<string, { views: number; downloads: number }>();
  const perArtikel = mentah
    .map((m) => {
      let views = 0;
      let downloads = 0;
      for (const [tanggal, nilai] of Object.entries(m.perHari)) {
        views += nilai.views;
        downloads += nilai.downloads;
        const gabung = perHariMap.get(tanggal) ?? { views: 0, downloads: 0 };
        gabung.views += nilai.views;
        gabung.downloads += nilai.downloads;
        perHariMap.set(tanggal, gabung);
      }
      totalViews += views;
      totalDownloads += downloads;
      return {
        kode: m.kode,
        judul: info.get(m.kode)?.judul ?? m.kode,
        status: info.get(m.kode)?.status ?? "",
        views,
        downloads
      };
    })
    .sort((a, b) => b.views + b.downloads - (a.views + a.downloads));
  const perHari = [...perHariMap.entries()]
    .map(([tanggal, v]) => ({ tanggal, ...v }))
    .sort((a, b) => (a.tanggal < b.tanggal ? 1 : -1))
    .slice(0, 30);
  return { totalViews, totalDownloads, perArtikel, perHari };
}

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
      ditarikPada: n.ditarikPada ?? null,
      halamanMulai: n.halamanMulai ?? null,
      halamanSelesai: n.halamanSelesai ?? null,
      referensi: n.referensi ?? null,
      doiStatus: n.doiStatus ?? "belum",
      idDepositCrossref: n.idDepositCrossref ?? null,
      doiTerdepositPada: n.doiTerdepositPada ?? null
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

// Tahap Penutup Celah: metadata artikel yang mengunci sebelum deposit
// (halaman integer awal/akhir dan referensi) serta status deposit DOI.
// Keduanya hanya untuk artikel terbit yang belum ditarik, sama seperti
// penetapan DOI.
export async function tetapkanMetadataArtikel(
  kode: string,
  metaMentah: {
    halamanMulai?: unknown;
    halamanSelesai?: unknown;
    referensi?: unknown;
  }
): Promise<string | null> {
  const target = (await listSubmissions()).find(
    (n) => n.kode === kode.trim().toUpperCase()
  );
  if (!target) return "Naskah tidak ditemukan.";
  if (target.status !== "published") {
    return "Metadata hanya dapat diisi untuk artikel yang sudah terbit.";
  }
  if (target.ditarikPada) return "Artikel sudah ditarik.";
  const keHalaman = (v: unknown): number | null | "galat" => {
    if (v === null || v === undefined || v === "") return null;
    const n = typeof v === "number" ? v : Number(v);
    return Number.isInteger(n) && n >= 1 && n <= 100000 ? n : "galat";
  };
  const mulai = keHalaman(metaMentah.halamanMulai);
  const selesai = keHalaman(metaMentah.halamanSelesai);
  if (mulai === "galat" || selesai === "galat") {
    return "Nomor halaman harus bilangan bulat positif.";
  }
  if ((mulai === null) !== (selesai === null)) {
    return "Halaman awal dan halaman akhir harus diisi berpasangan.";
  }
  if (mulai !== null && selesai !== null && selesai < mulai) {
    return "Halaman akhir tidak boleh lebih kecil dari halaman awal.";
  }
  let referensi: string | null = null;
  if (typeof metaMentah.referensi === "string" && metaMentah.referensi.trim()) {
    referensi = metaMentah.referensi.trim();
    if (referensi.length > 20000) return "Daftar referensi terlalu panjang.";
  } else if (
    metaMentah.referensi !== null &&
    metaMentah.referensi !== undefined &&
    metaMentah.referensi !== ""
  ) {
    return "Referensi harus berupa teks atau dikosongkan.";
  }
  const ok = await (await backend()).tetapkanMetadataArtikel(target.kode, {
    halamanMulai: mulai,
    halamanSelesai: selesai,
    referensi
  });
  return ok ? null : "Gagal menyimpan metadata artikel.";
}

export async function tetapkanStatusDoiArtikel(
  kode: string,
  statusMentah: unknown,
  idDepositMentah: unknown
): Promise<string | null> {
  const target = (await listSubmissions()).find(
    (n) => n.kode === kode.trim().toUpperCase()
  );
  if (!target) return "Naskah tidak ditemukan.";
  if (target.status !== "published") {
    return "Status deposit hanya untuk artikel yang sudah terbit.";
  }
  if (target.ditarikPada) return "Artikel sudah ditarik.";
  if (!target.doi) return "Artikel ini belum memiliki DOI.";
  if (
    statusMentah !== "belum" &&
    statusMentah !== "terdeposit" &&
    statusMentah !== "gagal"
  ) {
    return "Status deposit tidak sah.";
  }
  let idDeposit: string | null = null;
  if (typeof idDepositMentah === "string" && idDepositMentah.trim()) {
    idDeposit = idDepositMentah.trim();
    if (idDeposit.length > 120) return "ID deposit terlalu panjang.";
  }
  const ok = await (await backend()).tetapkanStatusDoi(
    target.kode,
    statusMentah,
    idDeposit
  );
  return ok ? null : "Gagal menyimpan status deposit DOI.";
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

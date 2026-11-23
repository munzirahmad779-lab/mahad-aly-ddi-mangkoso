// ─────────────────────────────────────────────────────────────────────────────
// Tipe bersama dan pembangun sitasi Tahap 5 jurnal — modul bersama klien
// dan server (jangan mengimpor modul server di sini).
//
// Isi: tampilan pengumuman, statistik, dan artikel untuk panel DOI,
// pola DOI, serta pembangun teks kutipan, BibTeX, dan RIS per artikel.
// Gaya kutipan mengikuti Chicago 17 sesuai pedoman penulis jurnal.
// ─────────────────────────────────────────────────────────────────────────────

import { JURNAL_NAMA_PLACEHOLDER } from "./konten";

export interface JurnalPengumumanView {
  id: string;
  judul: string;
  isi: string;
  tayang: boolean;
  diterbitkanPada: string | null;
  kedaluwarsaPada: string | null;
  dibuatPada: string;
}

export interface JurnalMetrikArtikel {
  kode: string;
  judul: string;
  status: string;
  views: number;
  downloads: number;
}

export interface JurnalStatistikView {
  totalViews: number;
  totalDownloads: number;
  perArtikel: JurnalMetrikArtikel[];
  perHari: { tanggal: string; views: number; downloads: number }[];
}

export interface JurnalArtikelDoiView {
  kode: string;
  judul: string;
  status: string;
  doi: string | null;
  ditarikPada: string | null;
  // Tahap Penutup Celah: metadata artikel dan status deposit DOI.
  halamanMulai: number | null;
  halamanSelesai: number | null;
  referensi: string | null;
  doiStatus: "belum" | "terdeposit" | "gagal";
  idDepositCrossref: string | null;
  doiTerdepositPada: string | null;
}

// Pola DOI: awalan 10.<registrant>/<suffix> tanpa spasi. Suffix boleh
// memuat huruf, angka, dan tanda baca lazim DOI.
export const POLA_DOI = /^10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+$/;

export function normalisasiDoi(v: unknown): string | null {
  if (typeof v !== "string") return null;
  let s = v.trim();
  if (!s) return null;
  s = s.replace(/^https?:\/\/doi\.org\//i, "").replace(/^doi:/i, "").trim();
  return POLA_DOI.test(s) ? s : null;
}

export interface SitasiSumber {
  judul: string;
  penulis: { nama: string }[];
  tahun: number;
  volume: number | null;
  nomor: number | null;
  halaman: string | null;
  doi: string | null;
  slug: string;
}

export function teksKutipan(a: SitasiSumber): string {
  const penulis = a.penulis.map((p) => p.nama).join(", ");
  const vol =
    a.volume != null
      ? ` ${a.volume}${a.nomor != null ? `, no. ${a.nomor}` : ""}`
      : "";
  const hlm = a.halaman ? `: ${a.halaman}` : "";
  const doi = a.doi ? ` https://doi.org/${a.doi}.` : "";
  return `${penulis}. "${a.judul}." ${JURNAL_NAMA_PLACEHOLDER}${vol} (${a.tahun})${hlm}.${doi}`;
}

function kunciBibtex(a: SitasiSumber): string {
  const namaAwal = (a.penulis[0]?.nama ?? "anon")
    .split(/\s+/)
    .slice(-1)[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const kata = a.judul
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean)[0] ?? "artikel";
  return `${namaAwal}${a.tahun}${kata}`;
}

function lolosBibtex(s: string): string {
  return s.replace(/[{}\\]/g, "").replace(/&/g, "\\&");
}

export function buatBibtex(a: SitasiSumber, urlArtikel: string): string {
  const baris: string[] = [
    `@article{${kunciBibtex(a)},`,
    `  author = {${a.penulis.map((p) => lolosBibtex(p.nama)).join(" and ")}},`,
    `  title = {${lolosBibtex(a.judul)}},`,
    `  journal = {${JURNAL_NAMA_PLACEHOLDER}},`,
    `  year = {${a.tahun}},`
  ];
  if (a.volume != null) baris.push(`  volume = {${a.volume}},`);
  if (a.nomor != null) baris.push(`  number = {${a.nomor}},`);
  if (a.halaman) baris.push(`  pages = {${a.halaman.replace("-", "--")}},`);
  if (a.doi) baris.push(`  doi = {${a.doi}},`);
  baris.push(`  url = {${urlArtikel}}`, `}`);
  return baris.join("\n") + "\n";
}

export function buatRis(a: SitasiSumber, urlArtikel: string): string {
  const baris: string[] = ["TY  - JOUR"];
  for (const p of a.penulis) baris.push(`AU  - ${p.nama}`);
  baris.push(`TI  - ${a.judul}`);
  baris.push(`JO  - ${JURNAL_NAMA_PLACEHOLDER}`);
  baris.push(`Y1  - ${a.tahun}`);
  if (a.volume != null) baris.push(`VL  - ${a.volume}`);
  if (a.nomor != null) baris.push(`IS  - ${a.nomor}`);
  if (a.halaman) {
    const [sp, ep] = a.halaman.split("-").map((s) => s.trim());
    if (sp) baris.push(`SP  - ${sp}`);
    if (ep) baris.push(`EP  - ${ep}`);
  }
  if (a.doi) baris.push(`DO  - ${a.doi}`);
  baris.push(`UR  - ${urlArtikel}`);
  baris.push("ER  - ");
  return baris.join("\n") + "\n";
}

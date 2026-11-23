// ─────────────────────────────────────────────────────────────────────────────
// Tipe internal lapisan data alur Tahap 4 — SERVER ONLY.
//
// Backend lokal (alur-local.ts) dan backend Supabase (alur-supabase.ts)
// menerapkan antarmuka yang sama di belakang fasad alur-server.ts,
// mengikuti pola mesin review Tahap 3. Bentuk internal hanya beredar di
// server; tampilan staf, penulis, dan publik dibangun fasad dari sini.
// ─────────────────────────────────────────────────────────────────────────────

import type { JurnalBerkasMeta } from "./wizard";
import type {
  JurnalCopyTaskStatus,
  JurnalGalleyJenis,
  JurnalIssueStatus,
  JurnalPetugasOption,
  JurnalProductionTaskStatus,
  JurnalProofStatus
} from "./alur";

export interface TugasCopyInternal {
  id: string;
  kode: string;
  copyeditorUserId: string | null;
  copyeditorEmail: string;
  copyeditorNama: string;
  ditugaskanOleh: string | null;
  status: JurnalCopyTaskStatus;
  catatan: string | null;
  berkasHasilId: string | null;
  persetujuanPenulisPada: string | null;
  dibuatPada: string;
  selesaiPada: string | null;
}

export interface TugasProduksiInternal {
  id: string;
  kode: string;
  layoutUserId: string | null;
  layoutEmail: string;
  layoutNama: string;
  ditugaskanOleh: string | null;
  status: JurnalProductionTaskStatus;
  catatan: string | null;
  proofStatus: JurnalProofStatus;
  proofCatatan: string | null;
  proofPada: string | null;
  siapPada: string | null;
  dibuatPada: string;
}

export type JenisBerkasAlur = "copyedited" | "galley_pdf" | "galley_html";

export interface BerkasAlurInternal {
  id: string;
  kode: string;
  tahap: "copyedit" | "galley";
  jenis: JenisBerkasAlur;
  namaAsli: string;
  mime: string;
  ukuran: number;
  bucket: string;
  kunci: string;
  diunggahOleh: string | null;
  diunggahPada: string;
}

export interface TerbitanInternal {
  id: string;
  slug: string;
  volume: number | null;
  number: number | null;
  year: number;
  judul: string | null;
  uraian: string | null;
  status: JurnalIssueStatus;
  isCurrent: boolean;
  tanggalTerbit: string | null;
  dibuatPada: string;
}

export interface PenempatanInternal {
  kode: string;
  issueId: string;
  urutan: number;
}

// Satu artikel published untuk permukaan publik, lengkap dengan galley.
// Dibangun backend dari tabelnya masing-masing; fasad menyaringnya
// menurut terbitan published dan menyusun tampilan publik.
export interface ArtikelPublikInternal {
  kode: string;
  judul: string;
  penulis: { nama: string; afiliasi: string; orcid: string | null }[];
  afiliasiUtama: string;
  bagianSlug: string | null;
  abstrak: string;
  abstrakEn: string;
  kataKunci: string[];
  halaman: string | null;
  halamanMulai: number | null;
  halamanSelesai: number | null;
  referensi: string | null;
  bahasa: string;
  doi: string | null;
  lisensi: string;
  pernyataanAi: string | null;
  issueId: string | null;
  urutan: number;
  galley: {
    jenis: JurnalGalleyJenis;
    bucket: string;
    kunci: string;
    mime: string;
  }[];
}

export interface AlurBackend {
  daftarPetugas(
    peran: "copyeditor" | "layout_editor"
  ): Promise<JurnalPetugasOption[]>;
  ambilTugasCopy(kode: string): Promise<TugasCopyInternal[]>;
  buatTugasCopy(data: {
    kode: string;
    petugas: JurnalPetugasOption;
    ditugaskanOleh: string | null;
    catatan: string | null;
  }): Promise<TugasCopyInternal>;
  ubahTugasCopy(
    id: string,
    patch: Partial<{
      status: JurnalCopyTaskStatus;
      berkasHasilId: string | null;
      persetujuanPenulisPada: string | null;
      selesaiPada: string | null;
    }>
  ): Promise<void>;
  ambilTugasProduksi(kode: string): Promise<TugasProduksiInternal[]>;
  buatTugasProduksi(data: {
    kode: string;
    petugas: JurnalPetugasOption;
    ditugaskanOleh: string | null;
    catatan: string | null;
  }): Promise<TugasProduksiInternal>;
  ubahTugasProduksi(
    id: string,
    patch: Partial<{
      status: JurnalProductionTaskStatus;
      proofStatus: JurnalProofStatus;
      proofCatatan: string | null;
      proofPada: string | null;
      siapPada: string | null;
    }>
  ): Promise<void>;
  simpanBerkasAlur(data: {
    kode: string;
    tahap: "copyedit" | "galley";
    jenis: JenisBerkasAlur;
    berkas: JurnalBerkasMeta;
    diunggahOleh: string | null;
  }): Promise<BerkasAlurInternal>;
  ambilBerkasAlur(kode: string): Promise<BerkasAlurInternal[]>;
  daftarTerbitan(): Promise<TerbitanInternal[]>;
  ambilTerbitanBySlug(slug: string): Promise<TerbitanInternal | null>;
  buatTerbitan(data: {
    slug: string;
    volume: number | null;
    number: number | null;
    year: number;
    judul: string | null;
    uraian: string | null;
  }): Promise<TerbitanInternal>;
  ubahTerbitan(
    id: string,
    patch: Partial<{
      volume: number | null;
      number: number | null;
      year: number;
      judul: string | null;
      uraian: string | null;
      status: JurnalIssueStatus;
      isCurrent: boolean;
      tanggalTerbit: string | null;
    }>
  ): Promise<void>;
  ambilPenempatanSemua(): Promise<PenempatanInternal[]>;
  tetapkanPenempatan(
    kode: string,
    issueId: string,
    urutan: number
  ): Promise<void>;
  hapusPenempatan(kode: string): Promise<void>;
  catatMetrik(
    kode: string,
    jenis: "views" | "downloads"
  ): Promise<void>;
  daftarArtikelPublik(): Promise<ArtikelPublikInternal[]>;
}

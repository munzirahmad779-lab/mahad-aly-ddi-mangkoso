// ─────────────────────────────────────────────────────────────────────────────
// Tipe dan konstanta alur Tahap 4 jurnal — modul bersama klien dan server
// (jangan mengimpor modul server di sini).
//
// Kosakata mengikuti migrasi 004 dan OJS 3: tugas copyediting dengan
// periksa penulis, tugas produksi dengan galley PDF dan HTML serta
// proofreading penulis, dan terbitan (issues) berstatus draft, scheduled,
// published. Berkas pada tahap ini hanya berupa metadata; isinya tetap
// di R2 atau folder unggahan uji lokal (keputusan user 22 Nov 2026).
// ─────────────────────────────────────────────────────────────────────────────

export const JURNAL_COPY_TASK_STATUSES = [
  "assigned",
  "in_progress",
  "author_review",
  "completed",
  "cancelled"
] as const;

export type JurnalCopyTaskStatus =
  (typeof JURNAL_COPY_TASK_STATUSES)[number];

export const JURNAL_COPY_TASK_LABEL_ID: Record<JurnalCopyTaskStatus, string> =
  {
    assigned: "Ditugaskan",
    in_progress: "Sedang disunting",
    author_review: "Menunggu persetujuan penulis",
    completed: "Selesai",
    cancelled: "Dibatalkan"
  };

export const JURNAL_PRODUCTION_TASK_STATUSES = [
  "assigned",
  "galley_ready",
  "proofreading",
  "author_proof",
  "ready",
  "cancelled"
] as const;

export type JurnalProductionTaskStatus =
  (typeof JURNAL_PRODUCTION_TASK_STATUSES)[number];

export const JURNAL_PRODUCTION_TASK_LABEL_ID: Record<
  JurnalProductionTaskStatus,
  string
> = {
  assigned: "Ditugaskan",
  galley_ready: "Galley sebagian siap",
  proofreading: "Proofreading",
  author_proof: "Menunggu proofread penulis",
  ready: "Siap terbit",
  cancelled: "Dibatalkan"
};

export type JurnalProofStatus = "menunggu" | "disetujui" | "koreksi";

export const JURNAL_PROOF_LABEL_ID: Record<JurnalProofStatus, string> = {
  menunggu: "Menunggu proofread penulis",
  disetujui: "Proof disetujui penulis",
  koreksi: "Penulis meminta koreksi"
};

export const JURNAL_ISSUE_STATUSES = [
  "draft",
  "scheduled",
  "published"
] as const;

export type JurnalIssueStatus = (typeof JURNAL_ISSUE_STATUSES)[number];

export const JURNAL_ISSUE_STATUS_LABEL_ID: Record<JurnalIssueStatus, string> =
  {
    draft: "Draf",
    scheduled: "Terjadwal",
    published: "Terbit"
  };

export type JurnalGalleyJenis = "pdf" | "html";

export interface JurnalPetugasOption {
  userId: string | null;
  email: string;
  nama: string;
  afiliasi: string;
}

export interface JurnalBerkasAlurView {
  id: string;
  jenis: "copyedited" | "galley_pdf" | "galley_html";
  namaAsli: string;
  mime: string;
  ukuran: number;
  diunggahPada: string;
}

// ── Tampilan staf ────────────────────────────────────────────────────────

export interface JurnalTugasCopyView {
  id: string;
  kode: string;
  status: JurnalCopyTaskStatus;
  statusLabel: string;
  copyeditorEmail: string;
  copyeditorNama: string;
  catatan: string | null;
  berkasHasil: JurnalBerkasAlurView | null;
  persetujuanPenulisPada: string | null;
  dibuatPada: string;
  selesaiPada: string | null;
}

export interface JurnalTugasProduksiView {
  id: string;
  kode: string;
  status: JurnalProductionTaskStatus;
  statusLabel: string;
  layoutEmail: string;
  layoutNama: string;
  catatan: string | null;
  galleyPdf: JurnalBerkasAlurView | null;
  galleyHtml: JurnalBerkasAlurView | null;
  proofStatus: JurnalProofStatus;
  proofLabel: string;
  proofCatatan: string | null;
  proofPada: string | null;
  siapPada: string | null;
  dibuatPada: string;
}

export interface JurnalPenempatanView {
  kode: string;
  judul: string;
  statusNaskah: string;
  urutan: number;
}

export interface JurnalTerbitanView {
  id: string;
  slug: string;
  volume: number | null;
  number: number | null;
  year: number;
  label: string;
  judul: string | null;
  uraian: string | null;
  status: JurnalIssueStatus;
  statusLabel: string;
  isCurrent: boolean;
  tanggalTerbit: string | null;
  dibuatPada: string;
  artikel: JurnalPenempatanView[];
}

// ── Tampilan penulis (Naskah Saya) ───────────────────────────────────────
// Hanya keadaan yang perlu ditindaklanjuti penulis: persetujuan hasil
// copyediting dan proofread galley. Tidak memuat catatan internal staf.

export interface JurnalAlurPenulisView {
  copyediting: {
    tugasId: string;
    status: JurnalCopyTaskStatus;
    statusLabel: string;
    berkasHasil: { namaAsli: string; diunggahPada: string } | null;
    perluPersetujuan: boolean;
  } | null;
  produksi: {
    tugasId: string;
    status: JurnalProductionTaskStatus;
    statusLabel: string;
    punyaPdf: boolean;
    punyaHtml: boolean;
    proofStatus: JurnalProofStatus;
    proofLabel: string;
    perluProof: boolean;
  } | null;
}

// ── Tampilan publik ──────────────────────────────────────────────────────

export interface JurnalPenulisPublik {
  nama: string;
  afiliasi: string;
  orcid: string | null;
}

export interface JurnalArtikelPublik {
  slug: string; // kode lacak huruf kecil, mis. jrn-2026-7450
  kode: string;
  judul: string;
  penulis: JurnalPenulisPublik[];
  afiliasiUtama: string;
  bagianLabel: string;
  bagianSlug: string;
  abstrak: string;
  abstrakEn: string;
  kataKunci: string[];
  halaman: string | null;
  bahasa: string;
  tanggalTerbit: string; // ISO datetime terbitan
  doi: string | null;
  lisensi: string;
  pernyataanAi: string | null;
  terbitanSlug: string;
  terbitanLabel: string;
  volume: number | null;
  nomor: number | null;
  tahun: number;
  urutan: number;
  punyaPdf: boolean;
  punyaHtml: boolean;
}

export interface JurnalTerbitanPublik {
  slug: string;
  label: string;
  volume: number | null;
  nomor: number | null;
  tahun: number;
  judul: string | null;
  uraian: string | null;
  tanggalTerbit: string | null;
  isCurrent: boolean;
  artikel: JurnalArtikelPublik[];
}

export function labelTerbitan(t: {
  volume: number | null;
  number: number | null;
  year: number;
  judul?: string | null;
}): string {
  const inti =
    t.volume != null && t.number != null
      ? `Vol. ${t.volume} No. ${t.number} (${t.year})`
      : `Terbitan ${t.year}`;
  return t.judul ? `${inti}: ${t.judul}` : inti;
}

export function slugDariKode(kode: string): string {
  return kode.trim().toLowerCase();
}

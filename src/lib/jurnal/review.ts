// ─────────────────────────────────────────────────────────────────────────────
// Tipe dan konstanta mesin review jurnal — modul bersama klien dan server
// (jangan mengimpor modul server di sini).
//
// Kosakata mengikuti OJS 3 dan migrasi 004: putaran (rounds), penugasan
// (assignments) dengan status undangan, rekomendasi reviewer, dan
// keputusan editor per putaran. Keputusan putaran memetakan ke status
// naskah: accept menutup putaran dan menggerakkan naskah ke copyediting,
// decline menjadi declined, sedangkan minor/major revisions menutup
// putaran dan menunggu berkas revisi penulis sebelum putaran berikutnya.
// ─────────────────────────────────────────────────────────────────────────────

export const JURNAL_REVIEW_DECISIONS = [
  "accept",
  "minor_revisions",
  "major_revisions",
  "decline"
] as const;

export type JurnalReviewDecision = (typeof JURNAL_REVIEW_DECISIONS)[number];

export const JURNAL_REVIEW_DECISION_LABEL_ID: Record<
  JurnalReviewDecision,
  string
> = {
  accept: "Diterima (lanjut ke Copyediting)",
  minor_revisions: "Revisi Minor",
  major_revisions: "Revisi Besar",
  decline: "Ditolak (Declined)"
};

export function isJurnalReviewDecision(
  v: unknown
): v is JurnalReviewDecision {
  return (
    typeof v === "string" &&
    (JURNAL_REVIEW_DECISIONS as readonly string[]).includes(v)
  );
}

export const JURNAL_RECOMMENDATIONS = [
  "accept",
  "minor_revisions",
  "major_revisions",
  "decline",
  "see_comments"
] as const;

export type JurnalRecommendation = (typeof JURNAL_RECOMMENDATIONS)[number];

export const JURNAL_RECOMMENDATION_LABEL_ID: Record<
  JurnalRecommendation,
  string
> = {
  accept: "Diterima",
  minor_revisions: "Revisi Minor",
  major_revisions: "Revisi Besar",
  decline: "Ditolak",
  see_comments: "Lihat Komentar"
};

export function isJurnalRecommendation(
  v: unknown
): v is JurnalRecommendation {
  return (
    typeof v === "string" &&
    (JURNAL_RECOMMENDATIONS as readonly string[]).includes(v)
  );
}

export const JURNAL_ASSIGNMENT_STATUSES = [
  "invited",
  "accepted",
  "declined",
  "completed",
  "cancelled"
] as const;

export type JurnalAssignmentStatus =
  (typeof JURNAL_ASSIGNMENT_STATUSES)[number];

export const JURNAL_ASSIGNMENT_STATUS_LABEL_ID: Record<
  JurnalAssignmentStatus,
  string
> = {
  invited: "Diundang",
  accepted: "Diterima reviewer",
  declined: "Ditolak reviewer",
  completed: "Telaah diserahkan",
  cancelled: "Dibatalkan"
};

// Tenggat bawaan penugasan reviewer: 28 hari, sesuai SUSUNAN-ISI-JURNAL.
export const JURNAL_TENGGET_BAKU_HARI = 28;
export const JURNAL_TENGGET_MIN_HARI = 1;
export const JURNAL_TENGGET_MAX_HARI = 90;

// Keputusan editor mensyaratkan minimal 2 penugasan reviewer yang aktif
// (tidak dibatalkan dan tidak ditolak reviewer) pada putaran itu.
export const JURNAL_MIN_REVIEWER_KEPUTUSAN = 2;

// ── Tampilan untuk staf (identitas lengkap; hanya route staf) ────────────

export interface JurnalAssignmentStaffView {
  id: string;
  putaran: number;
  reviewerEmail: string;
  reviewerNama: string;
  status: JurnalAssignmentStatus;
  statusLabel: string;
  ditugaskanPada: string;
  tenggat: string | null;
  rekomendasi: JurnalRecommendation | null;
  rekomendasiLabel: string | null;
  komentarPenulis: string | null;
  komentarEditor: string | null;
  diserahkanPada: string | null;
}

export interface JurnalRoundStaffView {
  nomor: number;
  status: "open" | "closed";
  keputusan: JurnalReviewDecision | null;
  keputusanLabel: string | null;
  dibuatPada: string;
  diputuskanPada: string | null;
  penugasan: JurnalAssignmentStaffView[];
}

export interface JurnalBerkasStaffView {
  id: string;
  tahap: string;
  kategori: "utama" | "pendukung";
  namaAsli: string;
  mime: string;
  ukuran: number;
  putaran: number | null;
  diunggahPada: string;
}

export interface JurnalReviewerOption {
  userId: string | null;
  email: string;
  nama: string;
  afiliasi: string;
}

// ── Tampilan untuk reviewer (ANONIM secara struktural) ───────────────────
// Bentuk ini memang tidak memiliki kolom identitas penulis: tidak ada
// nama, email, atau afiliasi penulis, dan berkas hanya membawa id, tahap,
// jenis, dan ukuran (nama berkas asli yang bisa memuat nama penulis tidak
// ikut). Fungsi backend khusus reviewer hanya menghasilkan bentuk ini.

export interface JurnalBerkasReviewerView {
  id: string;
  tahap: string;
  kategori: "utama" | "pendukung";
  mime: string;
  ukuran: number;
  putaran: number | null;
}

export interface JurnalAssignmentReviewerView {
  id: string;
  kode: string;
  putaran: number;
  status: JurnalAssignmentStatus;
  statusLabel: string;
  ditugaskanPada: string;
  tenggat: string | null;
  // Naskah anonim:
  judul: string;
  abstrak: string;
  abstrakEn: string;
  kataKunci: string[];
  bagianLabel: string;
  bahasa: string;
  naskahDikirimPada: string;
  berkas: JurnalBerkasReviewerView[];
  // Hasil telaah milik reviewer sendiri (sesudah diserahkan):
  rekomendasi: JurnalRecommendation | null;
  rekomendasiLabel: string | null;
  komentarPenulis: string | null;
  komentarEditor: string | null;
  diserahkanPada: string | null;
}

// ── Tampilan hasil review untuk penulis (identitas reviewer disembunyikan)
// Hanya putaran yang SUDAH diputuskan editor yang muncul di sini; sebelum
// keputusan, penulis tidak menerima isi telaah apa pun (kriteria keamanan
// Tahap 3 butir 5). Reviewer tampil sebagai label urutan "Reviewer 1",
// "Reviewer 2", tanpa nama dan tanpa email.

export interface JurnalHasilReviewPenulis {
  putaran: number;
  keputusan: JurnalReviewDecision;
  keputusanLabel: string;
  diputuskanPada: string | null;
  ulasan: {
    label: string; // "Reviewer 1", "Reviewer 2", ...
    rekomendasi: JurnalRecommendation | null;
    rekomendasiLabel: string | null;
    komentar: string | null; // komentar untuk penulis saja
  }[];
}

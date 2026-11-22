// Kosakata status dan peran jurnal — modul bersama klien dan server.
// Mengikuti kosakata alur OJS 3: Submission, Review, Copyediting,
// Production, Published, Declined. Jangan mengimpor apa pun dari server
// di berkas ini supaya aman dipakai komponen klien.

export const JURNAL_STATUSES = [
  "submitted",
  "review",
  "copyediting",
  "production",
  "published",
  "declined"
] as const;

export type JurnalStatus = (typeof JURNAL_STATUSES)[number];

export const JURNAL_STATUS_LABEL_ID: Record<JurnalStatus, string> = {
  submitted: "Terkirim (Submission)",
  review: "Dalam Telaah (Review)",
  copyediting: "Penyuntingan (Copyediting)",
  production: "Produksi (Production)",
  published: "Terbit (Published)",
  declined: "Ditolak (Declined)"
};

export const JURNAL_STATUS_LABEL_EN: Record<JurnalStatus, string> = {
  submitted: "Submitted",
  review: "Under Review",
  copyediting: "Copyediting",
  production: "Production",
  published: "Published",
  declined: "Declined"
};

export function isJurnalStatus(v: unknown): v is JurnalStatus {
  return (
    typeof v === "string" &&
    (JURNAL_STATUSES as readonly string[]).includes(v)
  );
}

// Tabel transisi status yang diizinkan (Tahap Keamanan). Perubahan status
// naskah hanya sah bila bergerak mengikuti alur editorial OJS; melompat
// tahap (mis. declined langsung published) ditolak server. published
// bersifat terminal lewat jalur ubah status: penarikan artikel adalah
// mekanisme terpisah. declined bisa dihidupkan kembali ke submitted oleh
// editor. Perpindahan ke status yang sama diizinkan sebagai pembaruan
// catatan. Rancangan lengkap: KEAMANAN-OJS-VERSI-KITA.md bagian 1.2.
export const JURNAL_TRANSISI_STATUS: Record<JurnalStatus, JurnalStatus[]> = {
  submitted: ["review", "declined"],
  review: ["copyediting", "declined", "submitted"],
  copyediting: ["production", "review", "declined"],
  production: ["published", "copyediting"],
  published: [],
  declined: ["submitted"]
};

export function transisiStatusSah(
  dari: JurnalStatus,
  ke: JurnalStatus
): boolean {
  return dari === ke || JURNAL_TRANSISI_STATUS[dari].includes(ke);
}

export function labelStatus(status: JurnalStatus): string {
  return JURNAL_STATUS_LABEL_ID[status] ?? status;
}

// Peran jurnal (paritas peran OJS 3). Subscription manager tidak dipakai
// karena jurnal gratis.
export const JURNAL_ROLES = [
  "journal_manager",
  "editor",
  "section_editor",
  "reviewer",
  "author",
  "copyeditor",
  "layout_editor",
  "proofreader",
  "reader"
] as const;

export type JurnalRole = (typeof JURNAL_ROLES)[number];

export const JURNAL_ROLE_LABEL_ID: Record<JurnalRole, string> = {
  journal_manager: "Manajer Jurnal",
  editor: "Editor",
  section_editor: "Editor Bagian",
  reviewer: "Reviewer (Mitra Bestari)",
  author: "Penulis",
  copyeditor: "Copyeditor",
  layout_editor: "Layout Editor",
  proofreader: "Proofreader",
  reader: "Pembaca"
};

// Peran yang boleh melihat antrean panel dan mengubah status naskah.
export const JURNAL_STAFF_ROLES: JurnalRole[] = [
  "journal_manager",
  "editor",
  "section_editor"
];

// Bentuk tampilan satu naskah yang dipertukarkan route API dan halaman.
// Sengaja datar (kode + label + linimasa) supaya halaman lacak dan panel
// tidak perlu tahu backend mana yang sedang aktif.
export interface JurnalRiwayatItem {
  status: JurnalStatus;
  label: string;
  pada: string; // ISO datetime
  catatan?: string | null;
}

export interface JurnalSubmissionView {
  kode: string; // JRN-YYYY-XXXX
  judul: string;
  penulis: string;
  email: string;
  afiliasi: string;
  abstrak: string;
  status: JurnalStatus;
  statusLabel: string;
  riwayat: JurnalRiwayatItem[];
  dibuatPada: string; // ISO datetime
  // Rincian Tahap 2 (wizard): opsional supaya tampilan lama tetap sah.
  bagianSlug?: string | null;
  bagianLabel?: string | null;
  bahasa?: string;
  abstrakEn?: string;
  kataKunci?: string[];
  penulisPendamping?: {
    nama: string;
    email: string;
    afiliasi: string;
    orcid?: string | null;
  }[];
  berkas?: {
    kategori: "utama" | "pendukung";
    namaAsli: string;
    mime: string;
    ukuran: number;
    bucket: string;
    kunci: string;
  }[];
  pernyataanAi?: string | null;
  // Tahap 5: DOI yang diisi journal_manager dan penanda penarikan.
  doi?: string | null;
  ditarikPada?: string | null;
}

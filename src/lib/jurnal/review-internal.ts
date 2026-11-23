// ─────────────────────────────────────────────────────────────────────────────
// Tipe internal lapisan data review — SERVER ONLY.
//
// Backend lokal (review-local.ts) dan backend Supabase (review-supabase.ts)
// menerapkan antarmuka yang sama di belakang fasad review-server.ts.
// Bentuk internal memuat identitas lengkap dan hanya beredar di server;
// tampilan untuk reviewer dibangun fasad dari fungsi khusus anonim
// (ambilNaskahAnonim dan daftar berkas yang disaring menurut putaran),
// bukan dengan menyembunyikan kolom dari bentuk internal ini.
// ─────────────────────────────────────────────────────────────────────────────

import type { JurnalBerkasMeta } from "./wizard";
import type {
  JurnalAssignmentStatus,
  JurnalRecommendation,
  JurnalReviewDecision,
  JurnalReviewerOption
} from "./review";

export interface PutaranInternal {
  nomor: number;
  status: "open" | "closed";
  keputusan: JurnalReviewDecision | null;
  dibuatPada: string;
  diputuskanPada: string | null;
}

export interface PenugasanInternal {
  id: string;
  kode: string;
  putaran: number;
  reviewerUserId: string | null;
  reviewerEmail: string;
  reviewerNama: string;
  status: JurnalAssignmentStatus;
  ditugaskanPada: string;
  tenggat: string | null;
  rekomendasi: JurnalRecommendation | null;
  komentarPenulis: string | null;
  komentarEditor: string | null;
  diserahkanPada: string | null;
  // Tahap Penutup Celah: cap waktu pengingat tenggat yang sudah
  // terkirim per tahap (idempotensi jalur terjadwal).
  pengingatH7Pada: string | null;
  pengingatH0Pada: string | null;
  pengingatLewatPada: string | null;
}

export interface BerkasInternal {
  id: string;
  tahap: string; // submission | review | supplementary | ...
  kategori: "utama" | "pendukung";
  namaAsli: string;
  mime: string;
  ukuran: number;
  bucket: string;
  kunci: string;
  putaran: number | null; // hanya berkas tahap review
  diunggahPada: string;
}

// Bentuk naskah yang aman untuk reviewer: dihasilkan kueri khusus yang
// memang tidak memilih kolom identitas penulis (mode supabase) atau
// membangun objek baru tanpa kolom itu (mode lokal).
export interface NaskahAnonimInternal {
  kode: string;
  judul: string;
  abstrak: string;
  abstrakEn: string;
  kataKunci: string[];
  bagianSlug: string | null;
  bahasa: string;
  dibuatPada: string;
}

export interface ReviewBackend {
  daftarReviewer(): Promise<JurnalReviewerOption[]>;
  daftarPenugasanReviewer(reviewer: {
    userId: string | null;
    email: string;
  }): Promise<PenugasanInternal[]>;
  ambilPutaran(kode: string): Promise<PutaranInternal[]>;
  buatPutaran(kode: string, nomor: number): Promise<void>;
  tutupPutaran(
    kode: string,
    nomor: number,
    keputusan: JurnalReviewDecision
  ): Promise<void>;
  ambilPenugasanSemua(kode: string): Promise<PenugasanInternal[]>;
  // Tahap Penutup Celah: daftar penugasan aktif lintas naskah untuk
  // jalur pengingat terjadwal, dan penanda tahap pengingat terkirim.
  daftarPenugasanAktifSemua(): Promise<PenugasanInternal[]>;
  tandaiPengingat(
    id: string,
    tahap: "h7" | "h0" | "lewat",
    pada: string
  ): Promise<void>;
  ambilPenugasanById(id: string): Promise<PenugasanInternal | null>;
  buatPenugasan(data: {
    kode: string;
    putaran: number;
    reviewer: JurnalReviewerOption;
    tenggat: string | null;
    ditugaskanOleh: string | null;
  }): Promise<PenugasanInternal>;
  ubahPenugasan(
    id: string,
    patch: Partial<{
      status: JurnalAssignmentStatus;
      rekomendasi: JurnalRecommendation | null;
      komentarPenulis: string | null;
      komentarEditor: string | null;
      diserahkanPada: string | null;
    }>
  ): Promise<void>;
  ambilNaskahAnonim(kode: string): Promise<NaskahAnonimInternal | null>;
  ambilBerkasInternal(kode: string): Promise<BerkasInternal[]>;
  simpanBerkasRevisi(
    kode: string,
    putaran: number,
    berkas: JurnalBerkasMeta[]
  ): Promise<void>;
}

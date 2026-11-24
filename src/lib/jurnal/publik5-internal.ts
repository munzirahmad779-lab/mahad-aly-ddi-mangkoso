// ─────────────────────────────────────────────────────────────────────────────
// Tipe internal lapisan Tahap 5 jurnal — SERVER ONLY.
//
// Backend lokal (publik5-local.ts) dan backend Supabase
// (publik5-supabase.ts) menerapkan antarmuka yang sama di belakang fasad
// publik5-server.ts, mengikuti pola lapisan review dan alur tahap
// sebelumnya. Cakupan Tahap 5 di lapisan ini: pengumuman, DOI, penarikan
// (tombstone OAI), metrik agregat, dan pencarian ilike basis data.
// ─────────────────────────────────────────────────────────────────────────────

export interface PengumumanInternal {
  id: string;
  judul: string;
  isi: string;
  tayang: boolean;
  diterbitkanPada: string | null;
  kedaluwarsaPada: string | null;
  dibuatPada: string;
}

export interface TombstoneInternal {
  kode: string;
  judul: string;
  bagianSlug: string | null;
  ditarikPada: string;
  alasanTarik: string | null;
}

export interface MetrikMentah {
  kode: string;
  perHari: Record<string, { views: number; downloads: number }>;
}

export interface Publik5Backend {
  daftarPengumumanSemua(): Promise<PengumumanInternal[]>;
  buatPengumuman(data: {
    judul: string;
    isi: string;
    tayang: boolean;
    kedaluwarsaPada: string | null;
  }): Promise<PengumumanInternal>;
  ubahPengumuman(
    id: string,
    patch: Partial<{
      judul: string;
      isi: string;
      tayang: boolean;
      kedaluwarsaPada: string | null;
    }>
  ): Promise<void>;
  hapusPengumuman(id: string): Promise<void>;
  tetapkanDoi(kode: string, doi: string | null): Promise<boolean>;
  // Tahap Penutup Celah (migrasi 009): metadata artikel dan status
  // deposit DOI, padanan kolom first_page/last_page/references_text dan
  // doi_status/crossref_submission_id/doi_deposited_at.
  tetapkanMetadataArtikel(
    kode: string,
    meta: {
      halamanMulai: number | null;
      halamanSelesai: number | null;
      referensi: string | null;
    }
  ): Promise<boolean>;
  tetapkanStatusDoi(
    kode: string,
    status: "belum" | "terdeposit" | "gagal",
    idDeposit: string | null
  ): Promise<boolean>;
  tarikArtikel(kode: string, alasan: string | null): Promise<boolean>;
  daftarTombstone(): Promise<TombstoneInternal[]>;
  ambilMetrikMentah(): Promise<MetrikMentah[]>;
  // Pencarian sisi basis data (mode supabase): mengembalikan kode naskah
  // published yang cocok dengan pola ilike terlarikan. Mode lokal
  // mengembalikan himpunan kosong dan fasad menyaring di memori.
  cariKodeIlike(q: string): Promise<Set<string>>;
}

// Pelarian pola ilike sesuai tahap keamanan: garis miring terbalik,
// persen, dan garis bawah tidak pernah berfungsi sebagai wildcard.
export function larikanPolaIlike(v: string): string {
  return v.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}

// Pelarian nilai yang disisipkan ke string filter or() PostgREST.
// Di dalam or(), koma memisahkan cabang filter dan kurung mengelompokkan
// cabang, jadi koma atau kurung dari masukan pengguna dapat menyusun
// cabang filter baru (injeksi filter, temuan audit Irisan 2). Selain
// pelarian pola ilike di atas, karakter struktur itu diganti spasi dan
// tanda bintang diloloskan sebagai pola (di dalam or(), * berperan
// sebagai wildcard seperti %), sehingga masukan hanya pernah menjadi
// satu nilai ilike utuh.
export function larikanNilaiFilterOr(v: string): string {
  return larikanPolaIlike(v)
    .replace(/\*/g, "\\*")
    .replace(/[,()"]/g, " ");
}

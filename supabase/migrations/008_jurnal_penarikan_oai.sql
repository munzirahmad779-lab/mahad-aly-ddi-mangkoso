-- ─────────────────────────────────────────────────────────────────────────
-- Migrasi 008: Penarikan artikel (tombstone OAI-PMH) untuk jurnal.
--
-- Ditulis sebagai berkas pada Tahap 5; TIDAK dijalankan ke proyek mana
-- pun oleh pembangun tahap ini, sama seperti migrasi 004 sampai 007.
--
-- Latar: OAI-PMH kita menyatakan deletedRecord = persistent. Artinya
-- rekod artikel yang pernah terbit lalu ditarik harus tetap bisa
-- dipanen selamanya sebagai header bertanda deleted. Baris naskah tidak
-- pernah dihapus dari jurnal_submissions, jadi tombstone yang persisten
-- cukup berupa dua kolom penanda pada baris itu sendiri:
--   withdrawn_at       waktu penarikan (NULL = tidak ditarik)
--   withdrawal_reason  alasan penarikan yang tampil di pemberitahuan
-- Bacaan publik (alur-supabase daftarArtikelPublik) menyaring
-- withdrawn_at IS NULL, dan endpoint OAI membaca baris bertanda untuk
-- menyusun header deleted.
--
-- Kolom DOI (jurnal_submissions.doi) dan tabel jurnal_announcements
-- serta jurnal_article_daily_metrics sudah ada sejak migrasi 004, jadi
-- migrasi ini hanya menambah penanda penarikan.
-- ─────────────────────────────────────────────────────────────────────────

ALTER TABLE public.jurnal_submissions
  ADD COLUMN IF NOT EXISTS withdrawn_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS withdrawal_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_jurnal_submissions_withdrawn
  ON public.jurnal_submissions (withdrawn_at)
  WHERE withdrawn_at IS NOT NULL;

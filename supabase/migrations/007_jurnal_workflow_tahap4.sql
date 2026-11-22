-- ─────────────────────────────────────────────────────────────────────────
-- Migrasi 007: kolom alur Tahap 4 (copyediting, produksi, terbitan).
--
-- Migrasi 004 menyiapkan tabel jurnal_copyediting_tasks dan
-- jurnal_production_tasks, tetapi belum memuat kolom untuk dua keadaan
-- yang ditegakkan Tahap 4:
-- - persetujuan penulis atas hasil copyediting (tahap periksa penulis
--   ala OJS), dan
-- - hasil proofreading penulis atas galley (setuju atau minta koreksi
--   beserta catatannya).
-- Berkas tahap (hasil sunting, galley PDF, galley HTML) tidak memerlukan
-- kolom baru: metadata berkasnya tinggal di jurnal_submission_files
-- dengan stage 'copyedit' atau 'galley' dan kind 'copyedited',
-- 'galley_pdf', 'galley_html', sesuai keputusan user bahwa isi berkas
-- tidak pernah masuk basis data.
--
-- Berkas ini DISERAHKAN sebagai migrasi dan TIDAK dijalankan oleh agen
-- ke proyek mana pun, sama seperti migrasi 004, 005, dan 006.
-- ─────────────────────────────────────────────────────────────────────────

ALTER TABLE public.jurnal_copyediting_tasks
  ADD COLUMN IF NOT EXISTS author_approved_at TIMESTAMPTZ;

ALTER TABLE public.jurnal_production_tasks
  ADD COLUMN IF NOT EXISTS proof_status TEXT NOT NULL DEFAULT 'menunggu'
    CHECK (proof_status IN ('menunggu', 'disetujui', 'koreksi')),
  ADD COLUMN IF NOT EXISTS proof_note TEXT,
  ADD COLUMN IF NOT EXISTS proof_at TIMESTAMPTZ;

-- Migrasi 009: Penutup celah hasil audit paritas OJS (24 Nov 2026).
--
-- Isi:
-- 1. Metadata artikel yang mengunci sebelum Terbitan 1: halaman awal/akhir
--    sebagai integer (untuk deposit Crossref dan sitasi), kolom referensi,
--    dan status deposit DOI per artikel.
-- 2. Tahap pengingat reviewer pada penugasan (H-7, H-0, lewat 7 hari),
--    dicatat agar pengiriman terjadwal idempoten.
-- 3. Peran baru 'asesor' (read-only, untuk verifikasi ARJUNA): pelebaran
--    CHECK pada jurnal_user_roles.
-- 4. Tabel token reset kata sandi untuk mode lokal/uji dan cadangan jalur
--    reset terkelola sendiri. Mode Supabase memakai alur reset Supabase
--    Auth; tabel ini hanya ditulis mode lokal.
--
-- Aman dijalankan ulang: ADD COLUMN IF NOT EXISTS, constraint diganti
-- dengan pola DROP IF EXISTS + ADD, CREATE TABLE IF NOT EXISTS.
-- Pola RLS sama dengan migrasi 004: RLS aktif, tanpa policy untuk anon
-- maupun authenticated; semua akses lewat route server service role.

-- 1. Metadata artikel ------------------------------------------------------
ALTER TABLE public.jurnal_submissions
  ADD COLUMN IF NOT EXISTS first_page INTEGER,
  ADD COLUMN IF NOT EXISTS last_page INTEGER,
  ADD COLUMN IF NOT EXISTS references_text TEXT,
  ADD COLUMN IF NOT EXISTS doi_status TEXT NOT NULL DEFAULT 'belum',
  ADD COLUMN IF NOT EXISTS crossref_submission_id TEXT,
  ADD COLUMN IF NOT EXISTS doi_deposited_at TIMESTAMPTZ;

ALTER TABLE public.jurnal_submissions
  DROP CONSTRAINT IF EXISTS jurnal_submissions_doi_status_check;
ALTER TABLE public.jurnal_submissions
  ADD CONSTRAINT jurnal_submissions_doi_status_check
  CHECK (doi_status IN ('belum', 'terdeposit', 'gagal'));

ALTER TABLE public.jurnal_submissions
  DROP CONSTRAINT IF EXISTS jurnal_submissions_pages_check;
ALTER TABLE public.jurnal_submissions
  ADD CONSTRAINT jurnal_submissions_pages_check
  CHECK (
    (first_page IS NULL AND last_page IS NULL)
    OR (first_page IS NOT NULL AND last_page IS NOT NULL
        AND first_page >= 1 AND last_page >= first_page)
  );

-- 2. Tahap pengingat reviewer ---------------------------------------------
ALTER TABLE public.jurnal_review_assignments
  ADD COLUMN IF NOT EXISTS reminder_h7_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reminder_h0_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reminder_overdue_at TIMESTAMPTZ;

-- 3. Peran asesor ----------------------------------------------------------
ALTER TABLE public.jurnal_user_roles
  DROP CONSTRAINT IF EXISTS jurnal_user_roles_role_check;
ALTER TABLE public.jurnal_user_roles
  ADD CONSTRAINT jurnal_user_roles_role_check
  CHECK (role IN (
    'journal_manager', 'editor', 'section_editor', 'reviewer', 'author',
    'copyeditor', 'layout_editor', 'proofreader', 'reader', 'asesor'
  ));

-- 4. Token reset kata sandi (mode lokal) -----------------------------------
CREATE TABLE IF NOT EXISTS public.jurnal_password_resets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.jurnal_users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jurnal_password_resets_email
  ON public.jurnal_password_resets (email, created_at);

ALTER TABLE public.jurnal_password_resets ENABLE ROW LEVEL SECURITY;

-- Migrasi 006: Undangan reviewer jurnal "OJS versi kita" (Tahap 3)
--
-- Editor mengundang reviewer lewat email: satu baris undangan dibuat
-- dengan hash SHA-256 token klaim (token mentah hanya tampil sekali
-- kepada staf yang membuat undangan, sebagai tautan klaim). Penerima
-- membuka tautan, lalu mendaftar berpersetujuan mengikuti pola daftar
-- Tahap 2 atau masuk dengan akun yang sudah ada; klaim yang berhasil
-- memberi peran reviewer dan menandai undangan dipakai.
--
-- Pengiriman email undangan sendiri adalah pekerjaan Tahap 6; pada
-- tahap ini tautan klaim diserahkan staf kepada calon reviewer.
--
-- Seperti migrasi 004 dan 005: RLS aktif tanpa policy untuk anon dan
-- authenticated; semua akses berjalan lewat route server ber-service
-- role sesudah pemeriksaan peran staf.
--
-- PRASYARAT DEPLOY: berkas ini dijalankan manual di SQL Editor proyek
-- Supabase tujuan, sesudah migrasi 004 dan 005. Kode aplikasi memakai
-- penyimpanan lokal setara bila mode data lokal aktif.
--
-- Aman dijalankan ulang: CREATE TABLE/INDEX IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS public.jurnal_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  created_by UUID REFERENCES public.jurnal_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_jurnal_invitations_email
  ON public.jurnal_invitations (email);

ALTER TABLE public.jurnal_invitations ENABLE ROW LEVEL SECURITY;
-- Tanpa policy select/insert/update/delete untuk anon dan authenticated:
-- penulisan dan pembacaan hanya lewat route server ber-service role.

-- Perluasan jenis peristiwa keamanan (migrasi 005): Tahap 3 menambah
-- 'review_ditolak' untuk penolakan peran dan kepemilikan pada route
-- review, dicatat pembantu keamanan yang sama.
ALTER TABLE public.jurnal_security_events
  DROP CONSTRAINT IF EXISTS jurnal_security_events_event_type_check;
ALTER TABLE public.jurnal_security_events
  ADD CONSTRAINT jurnal_security_events_event_type_check
  CHECK (event_type IN (
    'login_gagal',
    'rate_limit',
    'peran_ditolak',
    'transisi_ditolak',
    'unggah_ditolak',
    'register_ditolak',
    'turnstile_gagal',
    'turnstile_dilewati',
    'kode_tidak_sah',
    'review_ditolak'
  ));

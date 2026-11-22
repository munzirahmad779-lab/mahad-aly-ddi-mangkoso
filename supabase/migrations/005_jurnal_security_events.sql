-- Migrasi 005: Tabel peristiwa keamanan jurnal "OJS versi kita"
-- (Tahap Keamanan)
--
-- Tabel ini menampung catatan peristiwa keamanan yang ditulis route
-- server jurnal lewat pembantu src/lib/jurnal/keamanan.ts:
-- login_gagal, rate_limit, peran_ditolak, transisi_ditolak,
-- unggah_ditolak, register_ditolak, turnstile_gagal,
-- turnstile_dilewati, kode_tidak_sah. Rancangan lengkapnya di
-- ~/workspace/jurnal-mahadaly/KEAMANAN-OJS-VERSI-KITA.md bagian 2.
--
-- Kedudukan tabel: jurnal_ terpisah dari tabel situs utama, sama
-- seperti migrasi 004. Penulisan HANYA lewat route server dengan
-- service role sesudah pemeriksaan di aplikasi; migrasi ini TIDAK
-- memberi policy baca atau tulis kepada anon maupun authenticated.
-- Pembacaan untuk peninjauan dilakukan pengelola lewat panel basis
-- data proyek.
--
-- PRASYARAT DEPLOY: berkas ini dijalankan manual di SQL Editor proyek
-- Supabase tujuan (penahapan dulu, produksi hanya atas keputusan
-- pimpinan), sesudah migrasi 004. Kode aplikasi jatuh ke catatan lokal
-- setara (.jurnal-uji/security-events.json) bila tabel ini belum ada
-- pada mode lokal; pada mode supabase kegagalan menulis tabel ini hanya
-- masuk log server dan tidak menggagalkan permintaan.
--
-- Aman dijalankan ulang: CREATE TABLE/INDEX IF NOT EXISTS dan DROP
-- POLICY IF EXISTS sebelum CREATE POLICY.

CREATE TABLE IF NOT EXISTS public.jurnal_security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL
    CHECK (event_type IN (
      'login_gagal',
      'rate_limit',
      'peran_ditolak',
      'transisi_ditolak',
      'unggah_ditolak',
      'register_ditolak',
      'turnstile_gagal',
      'turnstile_dilewati',
      'kode_tidak_sah'
    )),
  ip_address TEXT,
  actor_email TEXT,
  tracking_code TEXT,
  detail JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jurnal_security_events_created
  ON public.jurnal_security_events (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_jurnal_security_events_type
  ON public.jurnal_security_events (event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_jurnal_security_events_email
  ON public.jurnal_security_events (actor_email)
  WHERE actor_email IS NOT NULL;

-- RLS aktif tanpa policy: anon dan authenticated tidak bisa membaca
-- atau menulis langsung. Service role (route server) melewati RLS
-- seperti pola penguncian migrasi 004.
ALTER TABLE public.jurnal_security_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS jurnal_security_events_tanpa_akses ON public.jurnal_security_events;
-- Sengaja tidak ada CREATE POLICY: ketiadaan policy dengan RLS aktif
-- berarti akses langsung selalu ditolak.

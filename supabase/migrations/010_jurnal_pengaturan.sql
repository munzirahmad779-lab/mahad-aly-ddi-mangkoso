-- Migrasi 010: tabel pengaturan jurnal (kunci-nilai) + bendera akses publik.
--
-- Kebutuhan: buka/tutup akses publik jurnal harus bisa dilakukan dari
-- panel admin oleh Manajer Jurnal tanpa ubah kode atau deploy ulang
-- (perintah user 24 Nov 2026). Middleware membaca baris
-- kunci='akses_publik' (nilai 'terbuka' | 'tertutup') dengan cache
-- singkat di sisi Worker; env JURNAL_AKSES tetap menjadi penimpa paksa
-- ('terbuka' membuka, 'tertutup' menutup) untuk keadaan darurat ops.
--
-- RLS aktif tanpa policy publik: seluruh akses lewat service role di
-- route server sesudah pemeriksaan peran journal_manager, mengikuti
-- pola jurnal_password_resets pada migrasi 009.

CREATE TABLE IF NOT EXISTS public.jurnal_pengaturan (
  kunci TEXT PRIMARY KEY,
  nilai TEXT NOT NULL,
  diubah_pada TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  diubah_oleh UUID NULL REFERENCES public.jurnal_users(id) ON DELETE SET NULL
);

ALTER TABLE public.jurnal_pengaturan ENABLE ROW LEVEL SECURITY;

INSERT INTO public.jurnal_pengaturan (kunci, nilai)
VALUES ('akses_publik', 'tertutup')
ON CONFLICT (kunci) DO NOTHING;

-- Peristiwa keamanan baru untuk pencatatan perubahan akses publik:
-- lebarkan CHECK event_type mengikuti gabungan tipe di keamanan.ts
-- ditambah 'akses_publik_diubah'.
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
    'review_ditolak',
    'reset_sandi_diminta',
    'reset_sandi_gagal',
    'reset_sandi_selesai',
    'akses_publik_diubah'
  ));

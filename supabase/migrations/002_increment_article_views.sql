-- Migrasi 002: Penghitung views artikel yang atomik (Gerbang 0 Butir 5a)
--
-- Menggantikan pola baca-ubah-tulis di src/app/api/analytics/track/route.ts
-- (select views, lalu update views + 1 di klien server) yang kehilangan
-- kenaikan saat dua kunjungan bersamaan membaca nilai yang sama.
--
-- Fungsi ini menjalankan SATU pernyataan UPDATE di sisi basis data:
--   UPDATE articles SET views = views + 1 WHERE slug = ...
-- sehingga kenaikan selalu berdasarkan nilai terbaru di baris, bukan
-- potret yang dibaca lebih dulu.
--
-- PRASYARAT DEPLOY: berkas ini WAJIB dijalankan di Supabase proyek
-- Ma'had Aly (SQL Editor, akun pemilik proyek) SEBELUM kode route yang
-- memanggil rpc('increment_article_views') di-deploy. Bila fungsi belum
-- ada, panggilan rpc gagal dan route mencatat peringatan (views tidak
-- naik), sementara pencatatan statistik utama tetap berjalan.
--
-- Aman dijalankan ulang: CREATE OR REPLACE.

CREATE OR REPLACE FUNCTION public.increment_article_views(article_slug text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.articles
  SET views = COALESCE(views, 0) + 1
  WHERE slug = article_slug;
$$;

-- Route analytics berjalan memakai klien service role (supabaseAdmin),
-- yang melewati RLS; SECURITY DEFINER memastikan fungsi tetap berhak
-- menulis walau pemanggilnya bukan pemilik tabel. Izin execute dibuka
-- untuk peran server saja secara eksplisit agar tidak bergantung pada
-- default privilege.
REVOKE ALL ON FUNCTION public.increment_article_views(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_article_views(text) TO service_role;

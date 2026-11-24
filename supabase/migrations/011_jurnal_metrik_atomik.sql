-- Migrasi 011: Penghitung metrik artikel jurnal yang atomik
-- (Perbaikan temuan N1 Mega Audit 2026-11-25)
--
-- Menggantikan pola baca-ubah-tulis di catatMetrik
-- (src/lib/jurnal/alur-supabase.ts) yang membaca nilai views/downloads,
-- menambah satu di klien server, lalu menulis balik tanpa memeriksa
-- galat. Dua kunjungan bersamaan membaca nilai yang sama dan satu
-- kenaikan hilang; kegagalan tulis juga tidak pernah terlihat.
--
-- Fungsi ini menjalankan seluruh pencatatan dalam SATU panggilan basis
-- data: upsert ke jurnal_article_daily_metrics dengan ON CONFLICT
-- (kunci utama submission_id + metric_date) yang menaikkan kolom dari
-- nilai terbaru di baris, lalu kenaikan kumulatif pada
-- jurnal_submissions dengan pola views = views + 1. Keduanya berada
-- dalam satu transaksi fungsi, jadi metrik harian dan kumulatif tidak
-- pernah berbeda langkah.
--
-- PRASYARAT DEPLOY: berkas ini WAJIB dijalankan di Supabase proyek
-- Ma'had Aly (SQL Editor, akun pemilik proyek) SEBELUM kode yang
-- memanggil rpc('jurnal_catat_metrik') di-deploy. Bila fungsi belum
-- ada, panggilan rpc gagal, catatMetrik melempar galat, dan fasad
-- alur-server mencatat peringatan (metrik tidak naik) sementara
-- halaman artikel publik tetap berjalan seperti biasa.
--
-- Aman dijalankan ulang: CREATE OR REPLACE.

CREATE OR REPLACE FUNCTION public.jurnal_catat_metrik(
  p_submission_id uuid,
  p_metric_date date,
  p_jenis text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_jenis = 'views' THEN
    INSERT INTO public.jurnal_article_daily_metrics (
      submission_id, metric_date, views, downloads
    )
    VALUES (p_submission_id, p_metric_date, 1, 0)
    ON CONFLICT (submission_id, metric_date)
    DO UPDATE SET views = public.jurnal_article_daily_metrics.views + 1;

    UPDATE public.jurnal_submissions
    SET views = COALESCE(views, 0) + 1
    WHERE id = p_submission_id;
  ELSIF p_jenis = 'downloads' THEN
    INSERT INTO public.jurnal_article_daily_metrics (
      submission_id, metric_date, views, downloads
    )
    VALUES (p_submission_id, p_metric_date, 0, 1)
    ON CONFLICT (submission_id, metric_date)
    DO UPDATE SET downloads = public.jurnal_article_daily_metrics.downloads + 1;

    UPDATE public.jurnal_submissions
    SET downloads = COALESCE(downloads, 0) + 1
    WHERE id = p_submission_id;
  ELSE
    RAISE EXCEPTION 'Jenis metrik jurnal tidak dikenal: %', p_jenis;
  END IF;
END;
$$;

-- Kode jurnal berjalan memakai klien service role (supabaseAdmin),
-- yang melewati RLS; SECURITY DEFINER memastikan fungsi tetap berhak
-- menulis walau pemanggilnya bukan pemilik tabel. Izin execute dibuka
-- untuk peran server saja secara eksplisit agar tidak bergantung pada
-- default privilege.
REVOKE ALL ON FUNCTION public.jurnal_catat_metrik(uuid, date, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.jurnal_catat_metrik(uuid, date, text) TO service_role;

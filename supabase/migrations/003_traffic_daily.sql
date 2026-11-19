-- Migrasi 003: Statistik trafik harian yang atomik (Gerbang 0 Butir 5b)
--
-- Memindahkan penulisan statistik global dari blob JSON
-- `global_traffic_stats` di site_content (pola baca-ubah-tulis di
-- src/app/api/analytics/track/route.ts yang kehilangan hitungan saat
-- dua kunjungan bersamaan membaca blob yang sama) ke baris harian:
--
--   traffic_daily         satu baris per (tanggal, halaman): views + uniques
--   traffic_visitor_days  satu baris per (tanggal, hash pengunjung):
--                         SUMBER KEBENARAN dedup pengunjung unik harian
--   traffic_recent_visits log kunjungan terbaru (pengganti recentVisits)
--
-- Model gabung di pembaca (src/app/api/analytics/stats/route.ts):
-- blob lama TIDAK ditulis lagi sesudah kode baru deploy (membeku sebagai
-- arsip historis) dan angka tabel DITAMBAHKAN ke angka blob. Tidak ada
-- tumpang tindih: satu kunjungan dicatat kode lama ke blob ATAU kode
-- baru ke tabel, tidak pernah keduanya. Karena itu migrasi ini TIDAK
-- menyalin angka blob ke traffic_daily (perincian per halaman per hari
-- memang tidak ada di blob), dan total global tetap utuh sebagai
-- penjumlahan dua era.
--
-- Dedup hari peralihan dijaga oleh PENYEMAian di bagian 4: hash
-- pengunjung yang masih tersimpan di blob (blob hanya menyimpan 7 hari
-- terakhir) disalin ke traffic_visitor_days, sehingga pengunjung yang
-- datang sebelum deploy lalu datang lagi di hari yang sama sesudah
-- deploy tidak terhitung unik dua kali.
--
-- PRASYARAT DEPLOY: berkas ini WAJIB dijalankan di Supabase proyek
-- Ma'had Aly (SQL Editor, akun pemilik proyek) SEBELUM kode route yang
-- memanggil rpc('record_traffic_visit') di-deploy, mengikuti pola
-- migrasi 002. Bila urutan terbalik, route track menangkap error rpc
-- dan jatuh ke jalur blob lama (perilaku persis sebelum migrasi ini),
-- jadi statistik tidak berhenti dan tidak ganda; jalur tabel mulai
-- terisi begitu migrasi terpasang.
--
-- Aman dijalankan ulang: CREATE TABLE/INDEX IF NOT EXISTS, CREATE OR
-- REPLACE FUNCTION, penyemaian INSERT ... ON CONFLICT DO NOTHING.

-- ---------------------------------------------------------------------
-- 1. Tabel
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.traffic_daily (
  date date NOT NULL,
  pathname text NOT NULL,
  views bigint NOT NULL DEFAULT 0,
  uniques bigint NOT NULL DEFAULT 0,
  PRIMARY KEY (date, pathname)
);

CREATE TABLE IF NOT EXISTS public.traffic_visitor_days (
  date date NOT NULL,
  visitor_hash text NOT NULL,
  PRIMARY KEY (date, visitor_hash)
);

CREATE TABLE IF NOT EXISTS public.traffic_recent_visits (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  path text NOT NULL,
  device text NOT NULL,
  referrer text NOT NULL,
  visited_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS traffic_recent_visits_visited_at_idx
  ON public.traffic_recent_visits (visited_at DESC);

-- RLS aktif tanpa policy untuk anon/authenticated: tabel ini hanya
-- boleh disentuh service_role (yang melewati RLS) dan fungsi SECURITY
-- DEFINER di bawah. Mengikuti pola kunci rls-lockdown.sql.
ALTER TABLE public.traffic_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.traffic_visitor_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.traffic_recent_visits ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.traffic_daily TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.traffic_visitor_days TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.traffic_recent_visits TO service_role;

-- ---------------------------------------------------------------------
-- 2. Pencatat kunjungan atomik
-- ---------------------------------------------------------------------
-- Satu pemanggilan = satu kunjungan, seluruhnya di sisi basis data:
-- dedup pengunjung, kenaikan views/uniques per (tanggal, halaman), dan
-- log kunjungan terbaru berjalan dalam satu transaksi fungsi, jadi dua
-- kunjungan bersamaan tidak bisa saling menimpa seperti pola blob.
--
-- Mengembalikan jsonb:
--   { "isNewUnique": bool,        -- pengunjung ini baru pada hari itu
--     "totalViews": bigint,       -- total views ERA TABEL saja
--     "uniqueVisitors": bigint }  -- total unik ERA TABEL saja
-- Pemanggil menambahkan angka era blob (yang sudah membeku) untuk
-- menampilkan total gabungan.

CREATE OR REPLACE FUNCTION public.record_traffic_visit(
  p_date date,
  p_pathname text,
  p_visitor_hash text,
  p_device text,
  p_referrer text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_inserted integer;
  v_is_new boolean;
  v_total_views bigint;
  v_unique_visitors bigint;
BEGIN
  -- Dedup: baris baru berarti pengunjung unik baru pada hari itu.
  INSERT INTO public.traffic_visitor_days (date, visitor_hash)
  VALUES (p_date, p_visitor_hash)
  ON CONFLICT DO NOTHING;
  GET DIAGNOSTICS v_inserted = ROW_COUNT;
  v_is_new := v_inserted > 0;

  -- Kenaikan atomik per (tanggal, halaman).
  INSERT INTO public.traffic_daily (date, pathname, views, uniques)
  VALUES (p_date, p_pathname, 1, CASE WHEN v_is_new THEN 1 ELSE 0 END)
  ON CONFLICT (date, pathname) DO UPDATE
    SET views = traffic_daily.views + 1,
        uniques = traffic_daily.uniques
                  + CASE WHEN v_is_new THEN 1 ELSE 0 END;

  -- Log kunjungan terbaru; simpan 100 baris terakhir saja.
  INSERT INTO public.traffic_recent_visits (path, device, referrer)
  VALUES (p_pathname, p_device, p_referrer);
  DELETE FROM public.traffic_recent_visits
  WHERE id <= (SELECT COALESCE(MAX(id), 0) - 100 FROM public.traffic_recent_visits);

  -- Pangkas dedup lama: hash sudah memuat tanggal, jadi baris lama
  -- tidak pernah dipakai lagi untuk dedup. Simpan 30 hari terakhir.
  DELETE FROM public.traffic_visitor_days
  WHERE date < p_date - 30;

  SELECT COALESCE(SUM(views), 0), COALESCE(SUM(uniques), 0)
    INTO v_total_views, v_unique_visitors
  FROM public.traffic_daily;

  RETURN jsonb_build_object(
    'isNewUnique', v_is_new,
    'totalViews', v_total_views,
    'uniqueVisitors', v_unique_visitors
  );
END;
$$;

REVOKE ALL ON FUNCTION public.record_traffic_visit(date, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_traffic_visit(date, text, text, text, text) TO service_role;

-- ---------------------------------------------------------------------
-- 3. Agregat untuk pembaca panel
-- ---------------------------------------------------------------------
-- Mengembalikan seluruh angka ERA TABEL dalam satu jsonb dengan bentuk
-- yang sejajar blob lama, supaya route stats tinggal menjumlahkan:
--   { "totalViews": bigint, "uniqueVisitors": bigint,
--     "pages": { pathname: views }, "daily": { tanggal: {views, unique} },
--     "recentVisits": [ {path, device, referrer, timestamp} ],
--     "lastVisit": timestamptz atau null }

CREATE OR REPLACE FUNCTION public.get_traffic_aggregates()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'totalViews',
      COALESCE((SELECT SUM(views) FROM public.traffic_daily), 0),
    'uniqueVisitors',
      COALESCE((SELECT SUM(uniques) FROM public.traffic_daily), 0),
    'pages',
      COALESCE((
        SELECT jsonb_object_agg(pathname, total_views)
        FROM (
          SELECT pathname, SUM(views) AS total_views
          FROM public.traffic_daily
          GROUP BY pathname
        ) per_page
      ), '{}'::jsonb),
    'daily',
      COALESCE((
        SELECT jsonb_object_agg(day, stats)
        FROM (
          SELECT date::text AS day,
                 jsonb_build_object(
                   'views', SUM(views),
                   'unique', SUM(uniques)
                 ) AS stats
          FROM public.traffic_daily
          GROUP BY date
        ) per_day
      ), '{}'::jsonb),
    'recentVisits',
      COALESCE((
        SELECT jsonb_agg(visit ORDER BY visit_ts DESC)
        FROM (
          SELECT jsonb_build_object(
                   'path', path,
                   'device', device,
                   'referrer', referrer,
                   'timestamp', visited_at
                 ) AS visit,
                 visited_at AS visit_ts
          FROM public.traffic_recent_visits
          ORDER BY visited_at DESC
          LIMIT 20
        ) newest
      ), '[]'::jsonb),
    'lastVisit',
      (SELECT MAX(visited_at) FROM public.traffic_recent_visits)
  );
$$;

REVOKE ALL ON FUNCTION public.get_traffic_aggregates() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_traffic_aggregates() TO service_role;

-- ---------------------------------------------------------------------
-- 4. Reset
-- ---------------------------------------------------------------------
-- Mengosongkan ketiga tabel dalam satu transaksi fungsi. Blob lama
-- tetap direset oleh route reset lewat upsert seperti sebelumnya;
-- keduanya harus kosong agar angka gabungan kembali 0.

CREATE OR REPLACE FUNCTION public.reset_traffic_stats()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  TRUNCATE public.traffic_daily,
           public.traffic_visitor_days,
           public.traffic_recent_visits
  RESTART IDENTITY;
$$;

REVOKE ALL ON FUNCTION public.reset_traffic_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reset_traffic_stats() TO service_role;

-- ---------------------------------------------------------------------
-- 5. Penyemaian dedup dari blob lama
-- ---------------------------------------------------------------------
-- Salin hash pengunjung per hari yang masih tersimpan di blob
-- (visitorHashes, tersimpan maksimal 7 hari terakhir) ke
-- traffic_visitor_days. Tanpa ini, pengunjung hari peralihan yang
-- datang lagi sesudah deploy terhitung unik dua kali: sekali di blob,
-- sekali di tabel. Angka blob sendiri tidak disalin ke mana pun;
-- pembaca menjumlahkan dua era (lihat catatan di kepala berkas).

INSERT INTO public.traffic_visitor_days (date, visitor_hash)
SELECT day.key::date, (hash.value #>> '{}')
FROM public.site_content sc
CROSS JOIN LATERAL jsonb_each(
  CASE
    WHEN jsonb_typeof(sc.value -> 'visitorHashes') = 'object'
      THEN sc.value -> 'visitorHashes'
    ELSE '{}'::jsonb
  END
) AS day(key, hashes)
CROSS JOIN LATERAL jsonb_array_elements(
  CASE
    WHEN jsonb_typeof(day.hashes) = 'array' THEN day.hashes
    ELSE '[]'::jsonb
  END
) AS hash(value)
WHERE sc.key = 'global_traffic_stats'
  AND day.key ~ '^\d{4}-\d{2}-\d{2}$'
  AND jsonb_typeof(hash.value) = 'string'
ON CONFLICT DO NOTHING;

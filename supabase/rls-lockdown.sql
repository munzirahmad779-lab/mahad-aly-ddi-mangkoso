-- ============================================================================
-- PENGUATAN KEAMANAN SUPABASE (RLS LOCKDOWN) — Mahad Aly DDI Mangkoso
-- ============================================================================
-- LATAR BELAKANG:
--   Sebelumnya aplikasi menulis ke database LANGSUNG dari browser memakai
--   anon key (insert/update/delete pada articles, categories, theses, news,
--   collections, site_content, site_settings, users). Agar itu bisa jalan,
--   RLS harus terbuka untuk tulis — artinya SIAPA PUN yang punya anon key
--   (tertanam di bundle publik!) bisa merusak seluruh konten website.
--
--   Kini SEMUA tulisan sudah berpindah ke API server (service role, wajib
--   login admin): /api/admin/db, /api/admin/content, /api/upload, dsb.
--   Maka akses tulis anon/authenticated di database HARUS dicabut.
--
-- CARA PAKAI: Supabase Dashboard → SQL Editor → jalankan seluruh script ini.
-- Aman dijalankan berulang (idempotent).
-- ============================================================================

-- 1) CABUT HAK TULIS dari anon & authenticated di seluruh tabel publik.
--    Ini mematikan semua policy tulis lama apa pun namanya (GRANT dulu, baru
--    policy). Service role TIDAK terpengaruh (bypass RLS).
revoke insert, update, delete, truncate on all tables in schema public from anon;
revoke insert, update, delete, truncate on all tables in schema public from authenticated;

-- 2) AKTIFKAN RLS di semua tabel publik yang ada (idempotent).
do $$
declare t text;
begin
  for t in
    select table_name from information_schema.tables
    where table_schema = 'public' and table_type = 'BASE TABLE'
  loop
    execute format('alter table public.%I enable row level security;', t);
  end loop;
end $$;

-- 3) FUNGSI PEMBANTU: apakah user yang sedang login adalah admin aktif?
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce((
    select (is_active and role in ('super_admin', 'editor', 'penulis'))
    from public.users
    where id = auth.uid()
  ), false);
$$;

revoke all on function public.is_admin() from anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- 4) POLICY BACA PUBLIK (anon + authenticated) untuk konten yang memang publik.
--    Hanya SELECT — tidak ada tulis.

-- 4a. Artikel: yang terbit untuk publik; admin melihat semuanya
drop policy if exists "public_read_articles" on public.articles;
create policy "public_read_articles"
  on public.articles for select
  using ((status = 'published') or public.is_admin());

-- 4b. Kategori
drop policy if exists "public_read_categories" on public.categories;
create policy "public_read_categories"
  on public.categories for select
  using ((is_published = true) or public.is_admin());

-- 4c. Skripsi
drop policy if exists "public_read_theses" on public.theses;
create policy "public_read_theses"
  on public.theses for select
  using ((status = 'published') or public.is_admin());

-- 4d. Berita/Warta
drop policy if exists "public_read_news" on public.news;
create policy "public_read_news"
  on public.news for select
  using ((status = 'published') or public.is_admin());

-- 4e. Koleksi (masyayikh, sarana) yang dipublikasikan
drop policy if exists "public_read_collections" on public.collections;
create policy "public_read_collections"
  on public.collections for select
  using ((is_published = true) or public.is_admin());

-- 4f. Konten situs (key-value: hero, footer, pmb, dsb.)
drop policy if exists "public_read_site_content" on public.site_content;
create policy "public_read_site_content"
  on public.site_content for select
  using (true);

-- 4g. Media library
drop policy if exists "public_read_media" on public.media;
create policy "public_read_media"
  on public.media for select
  using (true);

-- 4h. Pengaturan situs
drop policy if exists "public_read_site_settings" on public.site_settings;
create policy "public_read_site_settings"
  on public.site_settings for select
  using (true);

-- 5) TABEL SENSITIF — tidak boleh dibaca anon (data pribadi submitter!),
--    tapi boleh untuk SEMUA yang ter-autentikasi (seluruh akun di sistem ini
--    adalah staf lembaga yang dibuat lewat invite admin).

-- 5a. submissions: nama, email, HP para kontributor
drop policy if exists "admin_read_submissions" on public.submissions;
create policy "admin_read_submissions"
  on public.submissions for select
  using (public.is_admin());

-- 5b. users: daftar akun admin (email, peran)
drop policy if exists "admin_read_users" on public.users;
create policy "admin_read_users"
  on public.users for select
  using (public.is_admin());

-- 6) TABEL LAIN yang mungkin ada: kunci baca hanya admin (paling aman).
--    Jika ternyata dipakai halaman publik, pindahkan ke pola 4 di atas.
do $$
declare t text;
begin
  for t in
    select table_name from information_schema.tables
    where table_schema = 'public' and table_type = 'BASE TABLE'
      and table_name not in (
        'articles', 'categories', 'theses', 'news', 'collections',
        'site_content', 'media', 'site_settings', 'submissions', 'users'
      )
  loop
    execute format('drop policy if exists "admin_read_only" on public.%I;', t);
    execute format(
      'create policy "admin_read_only" on public.%I for select using (public.is_admin());', t);
  end loop;
end $$;

-- ============================================================================
-- 7) VERIFIKASI (jalankan terpisah, hasil harus kosong / sesuai):
--    a. Tidak ada hak tulis untuk anon:
--       select * from information_schema.role_table_grants
--       where grantee = 'anon' and privilege_type in ('INSERT','UPDATE','DELETE');
--    b. Semua tabel sudah RLS:
--       select tablename, rowsecurity from pg_tables
--       where schemaname = 'public' and rowsecurity = false;  -- harus 0 baris
-- ============================================================================

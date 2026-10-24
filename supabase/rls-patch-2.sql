-- ============================================================================
-- PATCH KEAMANAN #2 — Perketat akses tabel sensitif (WAJIB DIJALANKAN)
-- ============================================================================
-- LATAR BELAKANG: patch pertama mengizinkan SEMUA user Supabase yang ter-
-- autentikasi membaca tabel users & submissions. Jika pendaftaran akun
-- Supabase terbuka untuk publik, penyusup bisa mendaftar akun biasa lalu
-- membaca data pribadi submitter naskah. Patch ini menguncinya: hanya
-- admin/editor/penulis AKTIF (is_admin) yang boleh membaca.
--
-- CARA: Supabase Dashboard → SQL Editor → jalankan seluruh script.
-- Aman dijalankan berulang. Waktu: < 5 detik.
-- ============================================================================

-- 1. submissions: hanya admin aktif
drop policy if exists "admin_read_submissions" on public.submissions;
create policy "admin_read_submissions"
  on public.submissions for select
  using (public.is_admin());

-- 2. users: hanya admin aktif
drop policy if exists "admin_read_users" on public.users;
create policy "admin_read_users"
  on public.users for select
  using (public.is_admin());

-- 3. PEMBATAS PENDAFTARAN SENDIRI (PENTING, lakukan juga di Dashboard):
--    Supabase Dashboard → Authentication → Providers → Email:
--    matikan "Allow new users to sign up" (kecuali memang perlu).
--    Akun admin tetap dibuat lewat panel (invite), bukan pendaftaran bebas.

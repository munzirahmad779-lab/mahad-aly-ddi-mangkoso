-- =====================================================================
-- MA'HAD ALY DDI MANGKOSO — DATABASE SCHEMA & RLS POLICIES (MIGRATION 001)
-- =====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================================
-- 【A. USERS, ROLES & AUDIT LOG】
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  nama_lengkap TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'editor', 'penulis')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  invited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  old_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================================
-- 【B. KONTEN WEBSITE (GENERIK) & NAVIGASI】
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.site_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  group_name TEXT NOT NULL,
  label TEXT NOT NULL,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_type TEXT NOT NULL, -- 'masyayikh', 'sarana', 'akreditasi', 'kurikulum', 'kalender', 'galeri', 'testimoni', 'prestasi'
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  order_index INTEGER NOT NULL DEFAULT 1,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.nav_menu (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location TEXT NOT NULL CHECK (location IN ('navbar', 'footer_1', 'footer_2', 'footer_focus')),
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  parent_id UUID REFERENCES public.nav_menu(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- =====================================================================
-- 【C. PUBLIKASI (ARTIKEL, KATEGORI, SKRIPSI)】
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  deskripsi TEXT,
  warna TEXT,
  urutan INTEGER NOT NULL DEFAULT 1,
  is_published BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS public.kajian_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  deskripsi TEXT,
  warna TEXT,
  urutan INTEGER NOT NULL DEFAULT 1,
  is_published BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS public.articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL DEFAULT 'Redaksi Ma''had Aly',
  author_role TEXT NOT NULL DEFAULT 'Mahasantri Marhalah Ula',
  thumbnail_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  views INTEGER NOT NULL DEFAULT 0,
  meta_title TEXT,
  meta_description TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.theses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  judul TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  penulis TEXT NOT NULL,
  nim TEXT NOT NULL,
  angkatan TEXT NOT NULL,
  tahun TEXT NOT NULL,
  pembimbing_1 TEXT NOT NULL,
  pembimbing_2 TEXT NOT NULL,
  abstrak_id TEXT,
  abstrak_ar TEXT,
  keyword TEXT[] DEFAULT '{}',
  kategori_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  cover_url TEXT,
  pdf_url TEXT,
  pdf_size_mb TEXT DEFAULT '3.5 MB',
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================================
-- 【D. INFORMASI, PMB & SUBSCRIBER】
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  judul TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  tipe TEXT NOT NULL DEFAULT 'Berita' CHECK (tipe IN ('Berita', 'Pengumuman', 'Agenda')),
  konten TEXT NOT NULL,
  gambar_url TEXT,
  tanggal TEXT NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pmb_waves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  quota TEXT NOT NULL,
  scholarship_info TEXT NOT NULL,
  requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
  procedure JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pmb_faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Umum',
  order_index INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subscriber (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  nama TEXT,
  source TEXT NOT NULL DEFAULT 'pmb',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================================
-- 【E. SUBMISSION (KARYA SANTRI MASUK)】
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama TEXT NOT NULL,
  email TEXT NOT NULL,
  afiliasi TEXT NOT NULL,
  kategori_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  judul TEXT NOT NULL,
  abstrak TEXT NOT NULL,
  keyword TEXT,
  file_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'published')),
  catatan_admin TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================================
-- 【F. MEDIA LIBRARY】
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_kb INTEGER NOT NULL DEFAULT 0,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================================
-- 【G. SITE SETTINGS】
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================================
-- 🔒 2. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

-- Helper function to check role of authenticated user
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nav_menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kajian_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pmb_waves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pmb_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriber ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- POLICIES: users
-- ---------------------------------------------------------------------
CREATE POLICY "Super admin full access on users"
  ON public.users FOR ALL
  TO authenticated
  USING (public.get_user_role() = 'super_admin')
  WITH CHECK (public.get_user_role() = 'super_admin');

CREATE POLICY "Users can read own profile"
  ON public.users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- ---------------------------------------------------------------------
-- POLICIES: site_content, collections, nav_menu, site_settings
-- ---------------------------------------------------------------------
CREATE POLICY "Public can view published site content"
  ON public.site_content FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Editors and Super Admin can manage site content"
  ON public.site_content FOR ALL TO authenticated
  USING (public.get_user_role() IN ('super_admin', 'editor'))
  WITH CHECK (public.get_user_role() IN ('super_admin', 'editor'));

CREATE POLICY "Public can view published collections"
  ON public.collections FOR SELECT TO anon, authenticated
  USING (is_published = true OR public.get_user_role() IN ('super_admin', 'editor'));

CREATE POLICY "Editors and Super Admin can manage collections"
  ON public.collections FOR ALL TO authenticated
  USING (public.get_user_role() IN ('super_admin', 'editor'))
  WITH CHECK (public.get_user_role() IN ('super_admin', 'editor'));

CREATE POLICY "Public can view active nav menu"
  ON public.nav_menu FOR SELECT TO anon, authenticated USING (is_active = true OR public.get_user_role() IN ('super_admin', 'editor'));

CREATE POLICY "Super Admin and Editor can manage nav menu"
  ON public.nav_menu FOR ALL TO authenticated
  USING (public.get_user_role() IN ('super_admin', 'editor'))
  WITH CHECK (public.get_user_role() IN ('super_admin', 'editor'));

CREATE POLICY "Public can view site settings"
  ON public.site_settings FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Super Admin and Editor can manage site settings"
  ON public.site_settings FOR ALL TO authenticated
  USING (public.get_user_role() IN ('super_admin', 'editor'))
  WITH CHECK (public.get_user_role() IN ('super_admin', 'editor'));

-- ---------------------------------------------------------------------
-- POLICIES: categories & kajian_categories
-- ---------------------------------------------------------------------
CREATE POLICY "Public can view published categories"
  ON public.categories FOR SELECT TO anon, authenticated USING (is_published = true OR public.get_user_role() IN ('super_admin', 'editor'));

CREATE POLICY "Editors and Super Admin can manage categories"
  ON public.categories FOR ALL TO authenticated
  USING (public.get_user_role() IN ('super_admin', 'editor'))
  WITH CHECK (public.get_user_role() IN ('super_admin', 'editor'));

CREATE POLICY "Public can view published kajian categories"
  ON public.kajian_categories FOR SELECT TO anon, authenticated USING (is_published = true OR public.get_user_role() IN ('super_admin', 'editor'));

CREATE POLICY "Editors and Super Admin can manage kajian categories"
  ON public.kajian_categories FOR ALL TO authenticated
  USING (public.get_user_role() IN ('super_admin', 'editor'))
  WITH CHECK (public.get_user_role() IN ('super_admin', 'editor'));

-- ---------------------------------------------------------------------
-- POLICIES: articles
-- ---------------------------------------------------------------------
CREATE POLICY "Public can view published articles"
  ON public.articles FOR SELECT TO anon, authenticated
  USING (status = 'published' OR public.get_user_role() IN ('super_admin', 'editor') OR (public.get_user_role() = 'penulis' AND author_id = auth.uid()));

CREATE POLICY "Super Admin and Editor can manage all articles"
  ON public.articles FOR ALL TO authenticated
  USING (public.get_user_role() IN ('super_admin', 'editor'))
  WITH CHECK (public.get_user_role() IN ('super_admin', 'editor'));

CREATE POLICY "Penulis can manage their own articles"
  ON public.articles FOR ALL TO authenticated
  USING (public.get_user_role() = 'penulis' AND author_id = auth.uid())
  WITH CHECK (public.get_user_role() = 'penulis' AND author_id = auth.uid());

-- ---------------------------------------------------------------------
-- POLICIES: theses & news
-- ---------------------------------------------------------------------
CREATE POLICY "Public can view published theses"
  ON public.theses FOR SELECT TO anon, authenticated
  USING (status = 'published' OR public.get_user_role() IN ('super_admin', 'editor'));

CREATE POLICY "Editors and Super Admin can manage theses"
  ON public.theses FOR ALL TO authenticated
  USING (public.get_user_role() IN ('super_admin', 'editor'))
  WITH CHECK (public.get_user_role() IN ('super_admin', 'editor'));

CREATE POLICY "Public can view published news"
  ON public.news FOR SELECT TO anon, authenticated
  USING (status = 'published' OR public.get_user_role() IN ('super_admin', 'editor'));

CREATE POLICY "Editors and Super Admin can manage news"
  ON public.news FOR ALL TO authenticated
  USING (public.get_user_role() IN ('super_admin', 'editor'))
  WITH CHECK (public.get_user_role() IN ('super_admin', 'editor'));

-- ---------------------------------------------------------------------
-- POLICIES: pmb_waves, pmb_faqs, subscriber
-- ---------------------------------------------------------------------
CREATE POLICY "Public can view active PMB waves"
  ON public.pmb_waves FOR SELECT TO anon, authenticated USING (is_active = true OR public.get_user_role() IN ('super_admin', 'editor'));

CREATE POLICY "Admin can manage PMB waves"
  ON public.pmb_waves FOR ALL TO authenticated
  USING (public.get_user_role() IN ('super_admin', 'editor'))
  WITH CHECK (public.get_user_role() IN ('super_admin', 'editor'));

CREATE POLICY "Public can view PMB FAQs"
  ON public.pmb_faqs FOR SELECT TO anon, authenticated USING (is_active = true OR public.get_user_role() IN ('super_admin', 'editor'));

CREATE POLICY "Admin can manage PMB FAQs"
  ON public.pmb_faqs FOR ALL TO authenticated
  USING (public.get_user_role() IN ('super_admin', 'editor'))
  WITH CHECK (public.get_user_role() IN ('super_admin', 'editor'));

CREATE POLICY "Public can insert subscriber"
  ON public.subscriber FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Admin can view and manage subscribers"
  ON public.subscriber FOR ALL TO authenticated
  USING (public.get_user_role() IN ('super_admin', 'editor'))
  WITH CHECK (public.get_user_role() IN ('super_admin', 'editor'));

-- ---------------------------------------------------------------------
-- POLICIES: submissions
-- ---------------------------------------------------------------------
CREATE POLICY "Public can submit manuscripts"
  ON public.submissions FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Admin and Editor can manage submissions"
  ON public.submissions FOR ALL TO authenticated
  USING (public.get_user_role() IN ('super_admin', 'editor'))
  WITH CHECK (public.get_user_role() IN ('super_admin', 'editor'));

-- ---------------------------------------------------------------------
-- POLICIES: media & audit_log
-- ---------------------------------------------------------------------
CREATE POLICY "Public can view media"
  ON public.media FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Authenticated users can upload media"
  ON public.media FOR ALL TO authenticated
  USING (public.get_user_role() IN ('super_admin', 'editor', 'penulis'))
  WITH CHECK (public.get_user_role() IN ('super_admin', 'editor', 'penulis'));

CREATE POLICY "Super admin can view audit logs"
  ON public.audit_log FOR SELECT TO authenticated
  USING (public.get_user_role() = 'super_admin');

CREATE POLICY "System can insert audit logs"
  ON public.audit_log FOR INSERT TO authenticated WITH CHECK (true);

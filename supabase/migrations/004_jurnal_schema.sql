-- Migrasi 004: Skema jurnal kustom "OJS versi kita" (Tahap 1)
--
-- Tabel jurnal berdiri sendiri dengan awalan jurnal_, terpisah dari tabel
-- situs utama (users, articles, submissions situs), supaya pekerjaan
-- jurnal tidak pernah mengubah skema web kampus dan deploy web utama
-- tidak berdampak ke jurnal. Rancangan lengkapnya ada di
-- ~/workspace/jurnal-mahadaly/RANCANGAN-OJS-VERSI-KITA.md.
--
-- Keputusan yang tercermin di skema ini:
-- 1. Berkas naskah TIDAK disimpan di basis data dan tidak disimpan di
--    hosting aplikasi. jurnal_submission_files hanya menyimpan metadata
--    berkas dan kunci objek Cloudflare R2 milik kampus (keputusan user
--    22 Nov 2026 21:28 WITA).
-- 2. Pengguna jurnal memakai auth.users Supabase yang sama dengan web
--    kampus (satu akun untuk kedua sistem), tetapi profil dan peran
--    jurnal tinggal di tabel sendiri: jurnal_users dan
--    jurnal_user_roles. Peran situs utama (public.users) tidak diubah.
-- 3. Semua penulisan berjalan lewat route server dengan service role
--    sesudah pemeriksaan peran (pola penguncian RLS situs utama), jadi
--    migrasi ini TIDAK memberi policy insert, update, atau delete kepada
--    anon maupun authenticated. Policy select di bawah hanya mengatur
--    bacaan langsung bila suatu saat klien membacanya sendiri.
--
-- PRASYARAT DEPLOY: berkas ini dijalankan manual di SQL Editor proyek
-- Supabase tujuan (penahapan dulu, produksi hanya atas keputusan
-- pimpinan), mengikuti pola migrasi 002 dan 003. Kode aplikasi jatuh ke
-- mode data lokal bila tabel ini belum ada, jadi urutan deploy aman.
--
-- Aman dijalankan ulang: CREATE TABLE/INDEX IF NOT EXISTS, CREATE OR
-- REPLACE FUNCTION, DROP POLICY IF EXISTS sebelum CREATE POLICY,
-- penyemaian INSERT ... ON CONFLICT DO NOTHING.

-- ---------------------------------------------------------------------
-- 0. Fungsi bantu umum
-- ---------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.jurnal_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------
-- 1. Pengguna jurnal dan perannya
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.jurnal_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  affiliation TEXT,
  country TEXT,
  orcid TEXT,
  bio TEXT,
  preferred_locale TEXT NOT NULL DEFAULT 'id'
    CHECK (preferred_locale IN ('id', 'en', 'ar')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.jurnal_user_roles (
  user_id UUID NOT NULL REFERENCES public.jurnal_users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN (
    'journal_manager', 'editor', 'section_editor', 'reviewer', 'author',
    'copyeditor', 'layout_editor', 'proofreader', 'reader'
  )),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_jurnal_user_roles_role
  ON public.jurnal_user_roles (role);

-- Fungsi peran dipakai policy di seluruh skema.
CREATE OR REPLACE FUNCTION public.jurnal_has_role(p_user_id UUID, p_role TEXT)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.jurnal_user_roles
    WHERE user_id = p_user_id AND role = p_role
  );
$$;

CREATE OR REPLACE FUNCTION public.jurnal_is_staff(p_user_id UUID)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.jurnal_user_roles
    WHERE user_id = p_user_id
      AND role IN ('journal_manager', 'editor', 'section_editor')
  );
$$;

-- ---------------------------------------------------------------------
-- 2. Bagian (sections) dan terbitan (issues)
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.jurnal_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  title_id TEXT NOT NULL,
  title_en TEXT,
  title_ar TEXT,
  abbreviation TEXT,
  description_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.jurnal_sections (slug, title_id, title_en, abbreviation, sort_order)
VALUES
  ('artikel-penelitian', 'Artikel Penelitian', 'Research Articles', 'AP', 1),
  ('kajian-pustaka-turats', 'Kajian Pustaka dan Turats', 'Literature and Turats Studies', 'KPT', 2),
  ('pemikiran-bahtsul-masail', 'Pemikiran dan Bahtsul Masa''il', 'Thought and Bahtsul Masa''il', 'PBM', 3)
ON CONFLICT (slug) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.jurnal_issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  volume INTEGER,
  number INTEGER,
  year INTEGER NOT NULL,
  title_id TEXT,
  title_en TEXT,
  title_ar TEXT,
  description_id TEXT,
  cover_r2_bucket TEXT,
  cover_r2_key TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'scheduled', 'published')),
  is_current BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.jurnal_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jurnal_issues_status
  ON public.jurnal_issues (status);

-- ---------------------------------------------------------------------
-- 3. Naskah (submissions) dan penulisnya
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.jurnal_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tracking_code TEXT NOT NULL UNIQUE,
  submitter_user_id UUID REFERENCES public.jurnal_users(id) ON DELETE SET NULL,
  submitter_name TEXT NOT NULL,
  submitter_email TEXT NOT NULL,
  section_id UUID REFERENCES public.jurnal_sections(id) ON DELETE SET NULL,
  language TEXT NOT NULL DEFAULT 'id' CHECK (language IN ('id', 'en', 'ar')),
  title_id TEXT NOT NULL,
  title_en TEXT,
  title_ar TEXT,
  abstract_id TEXT,
  abstract_en TEXT,
  abstract_ar TEXT,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN (
    'submitted', 'review', 'copyediting', 'production', 'published', 'declined'
  )),
  current_round INTEGER NOT NULL DEFAULT 0,
  issue_id UUID REFERENCES public.jurnal_issues(id) ON DELETE SET NULL,
  issue_order INTEGER,
  pages TEXT,
  doi TEXT UNIQUE,
  license TEXT NOT NULL DEFAULT 'CC BY 4.0',
  ai_statement TEXT,
  checklist JSONB NOT NULL DEFAULT '{}'::jsonb,
  date_submitted TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  date_published TIMESTAMPTZ,
  views INTEGER NOT NULL DEFAULT 0,
  downloads INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jurnal_submissions_status
  ON public.jurnal_submissions (status);
CREATE INDEX IF NOT EXISTS idx_jurnal_submissions_section
  ON public.jurnal_submissions (section_id);
CREATE INDEX IF NOT EXISTS idx_jurnal_submissions_issue
  ON public.jurnal_submissions (issue_id);
CREATE INDEX IF NOT EXISTS idx_jurnal_submissions_submitter
  ON public.jurnal_submissions (submitter_user_id);

CREATE TABLE IF NOT EXISTS public.jurnal_submission_authors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL REFERENCES public.jurnal_submissions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.jurnal_users(id) ON DELETE SET NULL,
  given_name TEXT NOT NULL,
  family_name TEXT,
  email TEXT,
  affiliation TEXT,
  country TEXT,
  orcid TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  is_corresponding BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jurnal_subm_authors_submission
  ON public.jurnal_submission_authors (submission_id);

-- Metadata berkas saja. Isi berkas selalu di R2 (lihat catatan kepala).
CREATE TABLE IF NOT EXISTS public.jurnal_submission_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL REFERENCES public.jurnal_submissions(id) ON DELETE CASCADE,
  stage TEXT NOT NULL CHECK (stage IN (
    'submission', 'review', 'copyedit', 'production', 'galley', 'supplementary'
  )),
  kind TEXT NOT NULL DEFAULT 'manuscript',
  original_name TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  r2_bucket TEXT NOT NULL,
  r2_key TEXT NOT NULL,
  round INTEGER,
  uploaded_by UUID REFERENCES public.jurnal_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jurnal_subm_files_submission
  ON public.jurnal_submission_files (submission_id, stage);

-- ---------------------------------------------------------------------
-- 4. Review: putaran, penugasan, hasil
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.jurnal_review_rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL REFERENCES public.jurnal_submissions(id) ON DELETE CASCADE,
  round INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  decision TEXT CHECK (decision IN (
    'accept', 'minor_revisions', 'major_revisions', 'decline'
  )),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  decided_at TIMESTAMPTZ,
  UNIQUE (submission_id, round)
);

CREATE TABLE IF NOT EXISTS public.jurnal_review_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL REFERENCES public.jurnal_submissions(id) ON DELETE CASCADE,
  round_id UUID NOT NULL REFERENCES public.jurnal_review_rounds(id) ON DELETE CASCADE,
  reviewer_user_id UUID NOT NULL REFERENCES public.jurnal_users(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES public.jurnal_users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN (
    'invited', 'accepted', 'declined', 'completed', 'cancelled'
  )),
  date_assigned TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  date_due TIMESTAMPTZ,
  date_confirmed TIMESTAMPTZ,
  date_completed TIMESTAMPTZ,
  recommendation TEXT CHECK (recommendation IN (
    'accept', 'minor_revisions', 'major_revisions', 'decline', 'see_comments'
  )),
  comments_for_editor TEXT,
  comments_for_author TEXT,
  score INTEGER CHECK (score IS NULL OR (score >= 1 AND score <= 5)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (round_id, reviewer_user_id)
);

CREATE INDEX IF NOT EXISTS idx_jurnal_review_assign_reviewer
  ON public.jurnal_review_assignments (reviewer_user_id, status);
CREATE INDEX IF NOT EXISTS idx_jurnal_review_assign_submission
  ON public.jurnal_review_assignments (submission_id);

-- ---------------------------------------------------------------------
-- 5. Copyediting dan produksi
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.jurnal_copyediting_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL REFERENCES public.jurnal_submissions(id) ON DELETE CASCADE,
  copyeditor_user_id UUID REFERENCES public.jurnal_users(id) ON DELETE SET NULL,
  assigned_by UUID REFERENCES public.jurnal_users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN (
    'assigned', 'in_progress', 'author_review', 'completed', 'cancelled'
  )),
  notes TEXT,
  date_assigned TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  date_due TIMESTAMPTZ,
  date_completed TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jurnal_copyedit_submission
  ON public.jurnal_copyediting_tasks (submission_id);

CREATE TABLE IF NOT EXISTS public.jurnal_production_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL REFERENCES public.jurnal_submissions(id) ON DELETE CASCADE,
  layout_user_id UUID REFERENCES public.jurnal_users(id) ON DELETE SET NULL,
  proofreader_user_id UUID REFERENCES public.jurnal_users(id) ON DELETE SET NULL,
  assigned_by UUID REFERENCES public.jurnal_users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN (
    'assigned', 'galley_ready', 'proofreading', 'author_proof', 'ready', 'cancelled'
  )),
  notes TEXT,
  date_assigned TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  date_due TIMESTAMPTZ,
  date_completed TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jurnal_production_submission
  ON public.jurnal_production_tasks (submission_id);

-- ---------------------------------------------------------------------
-- 6. Linimasa peristiwa, pengumuman, statistik
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.jurnal_submission_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL REFERENCES public.jurnal_submissions(id) ON DELETE CASCADE,
  actor_user_id UUID REFERENCES public.jurnal_users(id) ON DELETE SET NULL,
  actor_label TEXT,
  event_type TEXT NOT NULL DEFAULT 'status_change',
  from_status TEXT,
  to_status TEXT,
  note TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jurnal_events_submission
  ON public.jurnal_submission_events (submission_id, created_at);

CREATE TABLE IF NOT EXISTS public.jurnal_announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_id TEXT NOT NULL,
  title_en TEXT,
  title_ar TEXT,
  body_id TEXT NOT NULL,
  body_en TEXT,
  body_ar TEXT,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.jurnal_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.jurnal_article_daily_metrics (
  submission_id UUID NOT NULL REFERENCES public.jurnal_submissions(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  views INTEGER NOT NULL DEFAULT 0,
  downloads INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (submission_id, metric_date)
);

-- ---------------------------------------------------------------------
-- 7. Fungsi keikutsertaan (dipakai policy bacaan)
-- ---------------------------------------------------------------------

-- Seseorang "ikut serta" pada satu naskah bila ia pengirimnya, penulis
-- terdaftar dengan akun, reviewer yang ditugaskan, atau petugas tahap
-- yang ditugaskan. Identitas reviewer TIDAK dibuka ke penulis lewat
-- fungsi ini: penulis hanya lolos untuk membaca naskah dan galley-nya,
-- sedangkan baris penugasan review diatur policy tersendiri yang lebih
-- ketat (lihat bagian 8).
CREATE OR REPLACE FUNCTION public.jurnal_is_participant(
  p_user_id UUID, p_submission_id UUID
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    EXISTS (
      SELECT 1 FROM public.jurnal_submissions s
      WHERE s.id = p_submission_id AND s.submitter_user_id = p_user_id
    )
    OR EXISTS (
      SELECT 1 FROM public.jurnal_submission_authors a
      WHERE a.submission_id = p_submission_id AND a.user_id = p_user_id
    )
    OR EXISTS (
      SELECT 1 FROM public.jurnal_review_assignments r
      WHERE r.submission_id = p_submission_id AND r.reviewer_user_id = p_user_id
    )
    OR EXISTS (
      SELECT 1 FROM public.jurnal_copyediting_tasks c
      WHERE c.submission_id = p_submission_id AND c.copyeditor_user_id = p_user_id
    )
    OR EXISTS (
      SELECT 1 FROM public.jurnal_production_tasks p
      WHERE p.submission_id = p_submission_id
        AND (p.layout_user_id = p_user_id OR p.proofreader_user_id = p_user_id)
    );
$$;

-- ---------------------------------------------------------------------
-- 8. Row Level Security
-- ---------------------------------------------------------------------
-- Prinsip: bacaan publik hanya untuk yang sudah terbit; bacaan masuk
-- dibatasi per peran dan per keikutsertaan; penulisan hanya service role
-- (tidak ada policy tulis untuk anon/authenticated, mengikuti pola
-- penguncian RLS situs utama pada Gerbang 0).

ALTER TABLE public.jurnal_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jurnal_user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jurnal_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jurnal_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jurnal_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jurnal_submission_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jurnal_submission_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jurnal_review_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jurnal_review_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jurnal_copyediting_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jurnal_production_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jurnal_submission_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jurnal_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jurnal_article_daily_metrics ENABLE ROW LEVEL SECURITY;

-- Profil pengguna: diri sendiri atau staf jurnal.
DROP POLICY IF EXISTS jurnal_users_select ON public.jurnal_users;
CREATE POLICY jurnal_users_select ON public.jurnal_users
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.jurnal_is_staff(auth.uid()));

-- Peran: diri sendiri; manajer jurnal membaca semua untuk pengelolaan.
DROP POLICY IF EXISTS jurnal_roles_select ON public.jurnal_user_roles;
CREATE POLICY jurnal_roles_select ON public.jurnal_user_roles
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.jurnal_has_role(auth.uid(), 'journal_manager')
  );

-- Bagian: terbaca publik.
DROP POLICY IF EXISTS jurnal_sections_select ON public.jurnal_sections;
CREATE POLICY jurnal_sections_select ON public.jurnal_sections
  FOR SELECT TO anon, authenticated
  USING (TRUE);

-- Terbitan: publik hanya yang published; staf membaca semua.
DROP POLICY IF EXISTS jurnal_issues_select ON public.jurnal_issues;
CREATE POLICY jurnal_issues_select ON public.jurnal_issues
  FOR SELECT TO anon, authenticated
  USING (
    status = 'published'
    OR public.jurnal_is_staff(auth.uid())
  );

-- Naskah: publik hanya published; pengirim dan peserta membaca miliknya;
-- staf membaca semua.
DROP POLICY IF EXISTS jurnal_submissions_select ON public.jurnal_submissions;
CREATE POLICY jurnal_submissions_select ON public.jurnal_submissions
  FOR SELECT TO anon, authenticated
  USING (
    status = 'published'
    OR submitter_user_id = auth.uid()
    OR public.jurnal_is_staff(auth.uid())
    OR public.jurnal_is_participant(auth.uid(), id)
  );

-- Penulis naskah mengikuti keterbacaan naskahnya.
DROP POLICY IF EXISTS jurnal_subm_authors_select ON public.jurnal_submission_authors;
CREATE POLICY jurnal_subm_authors_select ON public.jurnal_submission_authors
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.jurnal_submissions s
      WHERE s.id = submission_id
        AND (
          s.status = 'published'
          OR s.submitter_user_id = auth.uid()
          OR public.jurnal_is_staff(auth.uid())
          OR public.jurnal_is_participant(auth.uid(), s.id)
        )
    )
  );

-- Berkas: galley naskah terbit terbaca publik; berkas tahap lain hanya
-- peserta dan staf. Isi berkas tetap di R2; policy ini mengatur metadata.
DROP POLICY IF EXISTS jurnal_subm_files_select ON public.jurnal_submission_files;
CREATE POLICY jurnal_subm_files_select ON public.jurnal_submission_files
  FOR SELECT TO anon, authenticated
  USING (
    (
      stage = 'galley'
      AND EXISTS (
        SELECT 1 FROM public.jurnal_submissions s
        WHERE s.id = submission_id AND s.status = 'published'
      )
    )
    OR public.jurnal_is_staff(auth.uid())
    OR public.jurnal_is_participant(auth.uid(), submission_id)
  );

-- Putaran review: staf dan reviewer yang ditugaskan pada naskah itu.
DROP POLICY IF EXISTS jurnal_rounds_select ON public.jurnal_review_rounds;
CREATE POLICY jurnal_rounds_select ON public.jurnal_review_rounds
  FOR SELECT TO authenticated
  USING (
    public.jurnal_is_staff(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.jurnal_review_assignments r
      WHERE r.round_id = id AND r.reviewer_user_id = auth.uid()
    )
  );

-- Penugasan review: HANYA staf dan reviewer yang bersangkutan. Penulis
-- sengaja tidak diberi bacaan langsung ke tabel ini demi double-blind;
-- hasil review untuk penulis disajikan route server dalam bentuk yang
-- menyembunyikan identitas reviewer.
DROP POLICY IF EXISTS jurnal_assignments_select ON public.jurnal_review_assignments;
CREATE POLICY jurnal_assignments_select ON public.jurnal_review_assignments
  FOR SELECT TO authenticated
  USING (
    public.jurnal_is_staff(auth.uid())
    OR reviewer_user_id = auth.uid()
  );

-- Tugas copyediting dan produksi: staf dan petugas yang ditugaskan,
-- ditambah pengirim naskah (untuk tahap periksa penulis dan proof).
DROP POLICY IF EXISTS jurnal_copyedit_select ON public.jurnal_copyediting_tasks;
CREATE POLICY jurnal_copyedit_select ON public.jurnal_copyediting_tasks
  FOR SELECT TO authenticated
  USING (
    public.jurnal_is_staff(auth.uid())
    OR copyeditor_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.jurnal_submissions s
      WHERE s.id = submission_id AND s.submitter_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS jurnal_production_select ON public.jurnal_production_tasks;
CREATE POLICY jurnal_production_select ON public.jurnal_production_tasks
  FOR SELECT TO authenticated
  USING (
    public.jurnal_is_staff(auth.uid())
    OR layout_user_id = auth.uid()
    OR proofreader_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.jurnal_submissions s
      WHERE s.id = submission_id AND s.submitter_user_id = auth.uid()
    )
  );

-- Linimasa: staf, pengirim, dan peserta.
DROP POLICY IF EXISTS jurnal_events_select ON public.jurnal_submission_events;
CREATE POLICY jurnal_events_select ON public.jurnal_submission_events
  FOR SELECT TO authenticated
  USING (
    public.jurnal_is_staff(auth.uid())
    OR public.jurnal_is_participant(auth.uid(), submission_id)
    OR EXISTS (
      SELECT 1 FROM public.jurnal_submissions s
      WHERE s.id = submission_id AND s.submitter_user_id = auth.uid()
    )
  );

-- Pengumuman: publik hanya yang terbit dan belum kedaluwarsa; staf semua.
DROP POLICY IF EXISTS jurnal_announcements_select ON public.jurnal_announcements;
CREATE POLICY jurnal_announcements_select ON public.jurnal_announcements
  FOR SELECT TO anon, authenticated
  USING (
    (is_published AND (expires_at IS NULL OR expires_at > NOW()))
    OR public.jurnal_is_staff(auth.uid())
  );

-- Statistik harian: hanya staf.
DROP POLICY IF EXISTS jurnal_metrics_select ON public.jurnal_article_daily_metrics;
CREATE POLICY jurnal_metrics_select ON public.jurnal_article_daily_metrics
  FOR SELECT TO authenticated
  USING (public.jurnal_is_staff(auth.uid()));

-- ---------------------------------------------------------------------
-- 9. Pemicu updated_at
-- ---------------------------------------------------------------------

DROP TRIGGER IF EXISTS trg_jurnal_users_updated ON public.jurnal_users;
CREATE TRIGGER trg_jurnal_users_updated
  BEFORE UPDATE ON public.jurnal_users
  FOR EACH ROW EXECUTE FUNCTION public.jurnal_set_updated_at();

DROP TRIGGER IF EXISTS trg_jurnal_sections_updated ON public.jurnal_sections;
CREATE TRIGGER trg_jurnal_sections_updated
  BEFORE UPDATE ON public.jurnal_sections
  FOR EACH ROW EXECUTE FUNCTION public.jurnal_set_updated_at();

DROP TRIGGER IF EXISTS trg_jurnal_issues_updated ON public.jurnal_issues;
CREATE TRIGGER trg_jurnal_issues_updated
  BEFORE UPDATE ON public.jurnal_issues
  FOR EACH ROW EXECUTE FUNCTION public.jurnal_set_updated_at();

DROP TRIGGER IF EXISTS trg_jurnal_submissions_updated ON public.jurnal_submissions;
CREATE TRIGGER trg_jurnal_submissions_updated
  BEFORE UPDATE ON public.jurnal_submissions
  FOR EACH ROW EXECUTE FUNCTION public.jurnal_set_updated_at();

DROP TRIGGER IF EXISTS trg_jurnal_assignments_updated ON public.jurnal_review_assignments;
CREATE TRIGGER trg_jurnal_assignments_updated
  BEFORE UPDATE ON public.jurnal_review_assignments
  FOR EACH ROW EXECUTE FUNCTION public.jurnal_set_updated_at();

DROP TRIGGER IF EXISTS trg_jurnal_copyedit_updated ON public.jurnal_copyediting_tasks;
CREATE TRIGGER trg_jurnal_copyedit_updated
  BEFORE UPDATE ON public.jurnal_copyediting_tasks
  FOR EACH ROW EXECUTE FUNCTION public.jurnal_set_updated_at();

DROP TRIGGER IF EXISTS trg_jurnal_production_updated ON public.jurnal_production_tasks;
CREATE TRIGGER trg_jurnal_production_updated
  BEFORE UPDATE ON public.jurnal_production_tasks
  FOR EACH ROW EXECUTE FUNCTION public.jurnal_set_updated_at();

DROP TRIGGER IF EXISTS trg_jurnal_announcements_updated ON public.jurnal_announcements;
CREATE TRIGGER trg_jurnal_announcements_updated
  BEFORE UPDATE ON public.jurnal_announcements
  FOR EACH ROW EXECUTE FUNCTION public.jurnal_set_updated_at();

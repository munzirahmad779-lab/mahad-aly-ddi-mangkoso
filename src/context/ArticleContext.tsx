"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  Article,
  CategoryInfo,
  Thesis,
  Submission,
  NewsItem,
  SiteSettings,
  AdminUser,
  ActivityLog,
  MediaItem,
  Lecturer,
  Facility,
  Accreditation,
  Course,
  CalendarEvent,
  BahtsulMasailQA,
  PMBWave,
  PMBFAQ,
  EmailSubscriber,
  EmailLog,
  GalleryAlbum,
  ComingSoonPageSetting,
  PageSeoItem,
  FooterSettings,
  FooterNavLink,
  FooterFocusItem,
  NavbarSettings,
  HeroSectionSettings,
  HomeSectionConfigItem,
  EmailTemplateItem,
  AboutPageContent,
  SubmissionTimelineEvent,
  PageTextsSettings,
  DonationProgram,
  SecurityThreatLog
} from "@/lib/types";
import {
  INITIAL_ARTICLES,
  INITIAL_CATEGORIES,
  INITIAL_THESES,
  INITIAL_NEWS,
  INITIAL_SETTINGS,
  INITIAL_ADMIN_USERS,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_MEDIA,
  INITIAL_LECTURERS,
  INITIAL_FACILITIES,
  INITIAL_ACCREDITATIONS,
  INITIAL_COURSES,
  INITIAL_CALENDAR,
  INITIAL_BAHTSUL_QA,
  INITIAL_PMB_WAVES,
  INITIAL_PMB_FAQS,
  INITIAL_SUBSCRIBERS,
  INITIAL_EMAIL_LOGS,
  INITIAL_GALLERY_ALBUMS,
  INITIAL_COMING_SOON_PAGES,
  INITIAL_PAGE_SEO,
  INITIAL_FOOTER_SETTINGS,
  INITIAL_FOOTER_NAV,
  INITIAL_FOOTER_FOCUS,
  INITIAL_NAVBAR_SETTINGS,
  INITIAL_HERO_SETTINGS,
  INITIAL_HOME_SECTIONS,
  INITIAL_EMAIL_TEMPLATES,
  INITIAL_ABOUT_CONTENT,
  INITIAL_PAGE_TEXTS,
  INITIAL_DONATIONS,
  INITIAL_SECURITY_THREATS
} from "@/lib/mock-data";

interface DataContextType {
  // Articles
  articles: Article[];
  addArticle: (article: Omit<Article, "id" | "slug">) => void;
  updateArticle: (id: string, updatedData: Partial<Article>) => void;
  deleteArticle: (id: string) => void;
  incrementArticleViews: (slug: string) => void;

  // Categories
  categories: CategoryInfo[];
  addCategory: (category: Omit<CategoryInfo, "id" | "slug">) => void;
  updateCategory: (id: string, updatedData: Partial<CategoryInfo>) => void;
  deleteCategory: (id: string) => void;

  // Theses / Skripsi
  theses: Thesis[];
  addThesis: (thesis: Omit<Thesis, "id" | "slug">) => void;
  updateThesis: (id: string, updatedData: Partial<Thesis>) => void;
  deleteThesis: (id: string) => void;

  // Submissions
  submissions: Submission[];
  addSubmission: (submission: Omit<Submission, "id" | "tanggal" | "status">) => void;
  updateSubmissionStatus: (id: string, status: Submission["status"], reviewNote?: string, publishedArticleLink?: string) => Promise<{ success: boolean; emailResult?: any; accessCode?: string }>;
  saveSubmissionFullPaper: (id: string, fullPaper: import("@/lib/types").SubmissionFullPaper) => Promise<{ success: boolean }>;
  deleteSubmission: (id: string) => void;
  publishSubmissionAsArticle: (submissionId: string) => Promise<{ success: boolean; article?: Article; emailResult?: any }>;
  publishSubmissionAsThesis: (submissionId: string) => Promise<{ success: boolean; thesis?: Thesis; emailResult?: any; error?: string }>;

  // News / Berita
  news: NewsItem[];
  addNews: (newsItem: Omit<NewsItem, "id" | "slug">) => void;
  updateNews: (id: string, updatedData: Partial<NewsItem>) => void;
  deleteNews: (id: string) => void;

  // Users & Roles
  users: AdminUser[];
  addUser: (user: Omit<AdminUser, "id">) => void;
  updateUser: (id: string, updatedData: Partial<AdminUser>) => void;
  deleteUser: (id: string) => void;

  // Activity Logs
  logs: ActivityLog[];
  addLog: (action: string, target: string, user?: string) => void;

  // Media Library
  media: MediaItem[];
  addMedia: (item: Omit<MediaItem, "id" | "uploadedAt">) => void;
  deleteMedia: (id: string) => void;

  // Lecturers
  lecturers: Lecturer[];
  addLecturer: (lecturer: Omit<Lecturer, "id">) => void;
  updateLecturer: (id: string, updatedData: Partial<Lecturer>) => void;
  deleteLecturer: (id: string) => void;

  // Facilities
  facilities: Facility[];
  addFacility: (facility: Omit<Facility, "id">) => void;
  updateFacility: (id: string, updatedData: Partial<Facility>) => void;
  deleteFacility: (id: string) => void;

  // Accreditations
  accreditations: Accreditation[];
  addAccreditation: (item: Omit<Accreditation, "id">) => void;
  updateAccreditation: (id: string, updatedData: Partial<Accreditation>) => void;
  deleteAccreditation: (id: string) => void;

  // Courses / Kurikulum
  courses: Course[];
  addCourse: (course: Omit<Course, "id">) => void;
  updateCourse: (id: string, updatedData: Partial<Course>) => void;
  deleteCourse: (id: string) => void;

  // Academic Calendar
  calendarEvents: CalendarEvent[];
  addCalendarEvent: (event: Omit<CalendarEvent, "id">) => void;
  updateCalendarEvent: (id: string, updatedData: Partial<CalendarEvent>) => void;
  deleteCalendarEvent: (id: string) => void;

  // Bahtsul Masail QA
  bahtsulQA: BahtsulMasailQA[];
  addBahtsulQA: (item: Omit<BahtsulMasailQA, "id">) => void;
  updateBahtsulQA: (id: string, updatedData: Partial<BahtsulMasailQA>) => void;
  deleteBahtsulQA: (id: string) => void;

  // PMB Waves & FAQs
  pmbWaves: PMBWave[];
  addPMBWave: (wave: Omit<PMBWave, "id">) => void;
  updatePMBWave: (id: string, updatedData: Partial<PMBWave>) => void;
  deletePMBWave: (id: string) => void;

  pmbFAQs: PMBFAQ[];
  addPMBFAQ: (faq: Omit<PMBFAQ, "id">) => void;
  updatePMBFAQ: (id: string, updatedData: Partial<PMBFAQ>) => void;
  deletePMBFAQ: (id: string) => void;

  // Subscribers
  subscribers: EmailSubscriber[];
  addSubscriber: (subscriber: Omit<EmailSubscriber, "id" | "subscribedAt">) => void;
  deleteSubscriber: (id: string) => void;

  // Email Logs & Real Dispatch
  emailLogs: EmailLog[];
  sendEmailNotification: (to: string, subject: string, htmlContent?: string) => Promise<{ success: boolean; error?: string }>;
  retryEmailSend: (logId: string) => Promise<{ success: boolean; error?: string; id?: string }>;

  // Gallery Albums
  galleryAlbums: GalleryAlbum[];
  addGalleryAlbum: (album: Omit<GalleryAlbum, "id">) => void;
  updateGalleryAlbum: (id: string, updatedData: Partial<GalleryAlbum>) => void;
  deleteGalleryAlbum: (id: string) => void;

  // Coming Soon Pages
  comingSoonPages: ComingSoonPageSetting[];
  toggleComingSoonPage: (id: string, isEnabled: boolean) => void;
  updateComingSoonPage: (id: string, updatedData: Partial<ComingSoonPageSetting>) => void;

  // Page SEO
  pageSeoList: PageSeoItem[];
  updatePageSeo: (pageKey: PageSeoItem["pageKey"], updatedData: Partial<PageSeoItem>) => void;

  // Footer Manager
  footerSettings: FooterSettings;
  updateFooterSettings: (updated: Partial<FooterSettings>) => void;
  footerNav: FooterNavLink[];
  addFooterNav: (link: Omit<FooterNavLink, "id">) => void;
  updateFooterNav: (id: string, updated: Partial<FooterNavLink>) => void;
  deleteFooterNav: (id: string) => void;
  footerFocus: FooterFocusItem[];
  addFooterFocus: (item: Omit<FooterFocusItem, "id">) => void;
  updateFooterFocus: (id: string, updated: Partial<FooterFocusItem>) => void;
  deleteFooterFocus: (id: string) => void;
  resetFooterToDefault: () => void;

  // Header / Navbar Settings
  navbarSettings: NavbarSettings;
  updateNavbarSettings: (updated: Partial<NavbarSettings>) => void;

  // Hero Section Settings
  heroSettings: HeroSectionSettings;
  updateHeroSettings: (updated: Partial<HeroSectionSettings>) => void;

  // Homepage Sections Config
  homeSections: HomeSectionConfigItem[];
  updateHomeSections: (updated: HomeSectionConfigItem[]) => void;

  // Email Templates
  emailTemplates: EmailTemplateItem[];
  updateEmailTemplates: (updated: EmailTemplateItem[]) => void;

  // About Page Content
  aboutPageContent: AboutPageContent;
  updateAboutPageContent: (updated: Partial<AboutPageContent>) => void;

  // Page Texts CMS (Teks Halaman Tanpa Ngoding)
  pageTexts: PageTextsSettings;
  updatePageTexts: (updated: Partial<PageTextsSettings>) => void;

  // Site Settings
  settings: SiteSettings;
  updateSettings: (newSettings: Partial<SiteSettings>) => void;

  // Backup & Modular Reset
  exportBackupJson: () => string;
  importBackupJson: (jsonString: string) => boolean;
  resetAllData: () => void;
  resetNavbarToDefault: (user?: string) => void;
  resetHeroToDefault: (user?: string) => void;
  resetHomeSectionsToDefault: (user?: string) => void;
  resetAboutContentToDefault: (user?: string) => void;
  resetEmailTemplatesToDefault: (user?: string) => void;
  resetProfileToDefault: (user?: string) => void;
  resetAcademicToDefault: (user?: string) => void;
  resetLecturersToDefault: (user?: string) => void;
  resetFacilitiesToDefault: (user?: string) => void;
  resetAccreditationsToDefault: (user?: string) => void;
  resetPublicationsToDefault: (user?: string) => void;
  resetQuoteToDefault: (user?: string) => void;
  resetBahtsulToDefault: (user?: string) => void;
  resetPMBToDefault: (user?: string) => void;
  resetNewsAndGalleryToDefault: (user?: string) => void;
  resetComingSoonToDefault: (user?: string) => void;
  resetSeoToDefault: (user?: string) => void;
  resetPageTextsToDefault: (user?: string) => void;
  resetSettingsToDefault: (user?: string) => void;
  clearActivityLogs: (user?: string) => void;

  // Program Donasi, Wakaf & Infaq
  donations: DonationProgram[];
  addDonation: (item: Omit<DonationProgram, "id" | "createdAt">, user?: string) => void;
  updateDonation: (id: string, updatedData: Partial<DonationProgram>, user?: string) => void;
  deleteDonation: (id: string, user?: string) => void;
  resetDonationsToDefault: (user?: string) => void;

  // Pertahanan Keamanan & Log Ancaman
  securityThreats: SecurityThreatLog[];
  addSecurityThreat: (threat: Omit<SecurityThreatLog, "id" | "timestamp">) => void;
  clearSecurityThreats: (user?: string) => void;

  // Hak Akses Khusus Donasi
  grantDonationPermission: (userId: string, granted: boolean, adminName?: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function ArticleProvider({ children }: { children: React.ReactNode }) {
  const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES);
  const [categories, setCategories] = useState<CategoryInfo[]>(INITIAL_CATEGORIES);
  const [theses, setTheses] = useState<Thesis[]>(INITIAL_THESES);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [news, setNews] = useState<NewsItem[]>(INITIAL_NEWS);
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_ADMIN_USERS);
  const [logs, setLogs] = useState<ActivityLog[]>(INITIAL_ACTIVITY_LOGS);
  const [media, setMedia] = useState<MediaItem[]>(INITIAL_MEDIA);
  const [lecturers, setLecturers] = useState<Lecturer[]>(INITIAL_LECTURERS);
  const [facilities, setFacilities] = useState<Facility[]>(INITIAL_FACILITIES);
  const [accreditations, setAccreditations] = useState<Accreditation[]>(INITIAL_ACCREDITATIONS);
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(INITIAL_CALENDAR);
  const [bahtsulQA, setBahtsulQA] = useState<BahtsulMasailQA[]>(INITIAL_BAHTSUL_QA);
  const [pmbWaves, setPmbWaves] = useState<PMBWave[]>(INITIAL_PMB_WAVES);
  const [pmbFAQs, setPmbFAQs] = useState<PMBFAQ[]>(INITIAL_PMB_FAQS);
  const [subscribers, setSubscribers] = useState<EmailSubscriber[]>(INITIAL_SUBSCRIBERS);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>(INITIAL_EMAIL_LOGS);
  const [galleryAlbums, setGalleryAlbums] = useState<GalleryAlbum[]>(INITIAL_GALLERY_ALBUMS);
  const [comingSoonPages, setComingSoonPages] = useState<ComingSoonPageSetting[]>(INITIAL_COMING_SOON_PAGES);
  const [pageSeoList, setPageSeoList] = useState<PageSeoItem[]>(INITIAL_PAGE_SEO);
  const [footerSettings, setFooterSettings] = useState<FooterSettings>(INITIAL_FOOTER_SETTINGS);
  const [footerNav, setFooterNav] = useState<FooterNavLink[]>(INITIAL_FOOTER_NAV);
  const [footerFocus, setFooterFocus] = useState<FooterFocusItem[]>(INITIAL_FOOTER_FOCUS);
  const [navbarSettings, setNavbarSettings] = useState<NavbarSettings>(INITIAL_NAVBAR_SETTINGS);
  const [heroSettings, setHeroSettings] = useState<HeroSectionSettings>(INITIAL_HERO_SETTINGS);
  const [homeSections, setHomeSections] = useState<HomeSectionConfigItem[]>(INITIAL_HOME_SECTIONS);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplateItem[]>(INITIAL_EMAIL_TEMPLATES);
  const [aboutPageContent, setAboutPageContent] = useState<AboutPageContent>(INITIAL_ABOUT_CONTENT);
  const [pageTexts, setPageTexts] = useState<PageTextsSettings>(INITIAL_PAGE_TEXTS);
  const [donations, setDonations] = useState<DonationProgram[]>(INITIAL_DONATIONS);
  const [securityThreats, setSecurityThreats] = useState<SecurityThreatLog[]>(INITIAL_SECURITY_THREATS);

  // Load from Supabase + LocalStorage fallback
  useEffect(() => {
    // 1. Initial hydration from local cache
    try {
      const savedArticles = localStorage.getItem("mahad_articles");
      if (savedArticles) setArticles(JSON.parse(savedArticles));

      const savedCategories = localStorage.getItem("mahad_categories");
      if (savedCategories) setCategories(JSON.parse(savedCategories));

      const savedTheses = localStorage.getItem("mahad_theses");
      if (savedTheses) setTheses(JSON.parse(savedTheses));

      const savedFooterSettings = localStorage.getItem("mahad_footer_settings");
      if (savedFooterSettings) setFooterSettings(JSON.parse(savedFooterSettings));

      const savedNavbar = localStorage.getItem("mahad_navbar_settings");
      if (savedNavbar) {
        try {
          const parsedNav = JSON.parse(savedNavbar);
          if (parsedNav && Array.isArray(parsedNav.navLinks)) {
            parsedNav.navLinks = parsedNav.navLinks.filter(
              (l: any) => !(l.url === "/kirim-tulisan" && l.label?.toLowerCase().includes("kirim tulisan"))
            );
            if (!parsedNav.navLinks.some((l: any) => l.url === "/donasi")) {
              parsedNav.navLinks.push({
                id: "nav-donasi",
                label: "Infaq & Donasi",
                url: "/donasi",
                order: parsedNav.navLinks.length + 1,
                isActive: true
              });
            }
          }
          setNavbarSettings(parsedNav);
        } catch (e) {
          setNavbarSettings(INITIAL_NAVBAR_SETTINGS);
        }
      }

      const savedHero = localStorage.getItem("mahad_hero_settings");
      if (savedHero) setHeroSettings(JSON.parse(savedHero));

      const savedHomeSections = localStorage.getItem("mahad_home_sections");
      if (savedHomeSections) {
        try {
          const parsedSections = JSON.parse(savedHomeSections);
          if (Array.isArray(parsedSections)) {
            if (!parsedSections.some((s: any) => s.name === "donasi")) {
              parsedSections.push({
                id: "sec-donations",
                name: "donasi",
                label: "Infaq & Program Donasi Pilihan",
                isActive: true,
                order: parsedSections.length + 1,
                maxItems: 3,
                badge: "Amal Jariyah & Infaq",
                title: "Dukung Kaderisasi Ulama Fiqh",
                subtitle: "Salurkan infaq terbaik Anda untuk riset mahasantri, orang tua asuh, dan sarana Ma'had Aly."
              });
            }
            setHomeSections(parsedSections);
          }
        } catch (e) {
          setHomeSections(INITIAL_HOME_SECTIONS);
        }
      }

      const savedEmailTemplates = localStorage.getItem("mahad_email_templates");
      if (savedEmailTemplates) setEmailTemplates(JSON.parse(savedEmailTemplates));

      const savedAboutPage = localStorage.getItem("mahad_about_page_content");
      if (savedAboutPage) setAboutPageContent(JSON.parse(savedAboutPage));

      const savedPageTexts = localStorage.getItem("mahad_page_texts");
      if (savedPageTexts) setPageTexts(JSON.parse(savedPageTexts));

      const savedSubmissions = localStorage.getItem("mahad_submissions");
      if (savedSubmissions) setSubmissions(JSON.parse(savedSubmissions));

      const savedDonations = localStorage.getItem("mahad_donations");
      if (savedDonations) setDonations(JSON.parse(savedDonations));

      const savedThreats = localStorage.getItem("mahad_security_threats");
      if (savedThreats) setSecurityThreats(JSON.parse(savedThreats));
    } catch (e) {
      console.warn("LocalStorage read skipped:", e);
    }

    // 2. Fetch live data from Supabase PostgreSQL
    async function fetchFromSupabase() {
      try {
        // Fetch Articles
        const { data: dbArticles } = await supabase
          .from("articles")
          .select("*")
          .order("created_at", { ascending: false });

        if (dbArticles && dbArticles.length > 0) {
          const mappedArticles: Article[] = dbArticles.map((a: any) => ({
            id: a.id,
            slug: a.slug,
            title: a.title,
            excerpt: a.excerpt || "",
            content: a.content,
            author: a.author_name || "Redaksi",
            authorRole: a.author_role || "Mahasantri Marhalah Ula",
            authorBio: "",
            category: a.category_id || "fiqh-muamalah-kontemporer",
            categoryLabel: "Fiqh Mu'asarah",
            date: new Date(a.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
            hijriDate: "1448 H",
            readTime: "5 menit",
            views: a.views || 0,
            tags: a.tags || []
          }));
          setArticles(mappedArticles);
        }

        // Fetch Theses
        const { data: dbTheses } = await supabase
          .from("theses")
          .select("*")
          .order("created_at", { ascending: false });

        if (dbTheses && dbTheses.length > 0) {
          const mappedTheses: Thesis[] = dbTheses.map((t: any) => ({
            id: t.id,
            slug: t.slug,
            title: t.judul,
            author: t.penulis,
            nim: t.nim,
            angkatan: t.angkatan,
            year: t.tahun,
            advisor1: t.pembimbing_1,
            advisor2: t.pembimbing_2,
            abstractId: t.abstrak_id || "",
            abstractAr: t.abstrak_ar || "",
            keywords: t.keyword || [],
            category: "Fiqh Mu'asarah",
            categoryLabel: "Fiqh Mu'asarah",
            downloadUrl: t.pdf_url || "",
            fileSize: t.pdf_size_mb || "3.5 MB"
          }));
          setTheses(mappedTheses);
        }

        // Fetch Categories
        const { data: dbCategories } = await supabase
          .from("categories")
          .select("*")
          .order("urutan", { ascending: true });

        if (dbCategories && dbCategories.length > 0) {
          setCategories(
            dbCategories.map((c: any) => {
              const isOpini =
                c.type === "opini" ||
                c.slug?.startsWith("opini-") ||
                c.slug?.startsWith("refleksi-") ||
                c.slug?.startsWith("kolom-") ||
                c.slug?.startsWith("sosial-");
              return {
                id: c.id,
                slug: c.slug,
                name: c.nama,
                description: c.deskripsi || "",
                iconName: c.icon || "book",
                type: isOpini ? ("opini" as const) : ("artikel" as const)
              };
            })
          );
        }

        // Fetch Footer from site_content
        const { data: footerData } = await supabase
          .from("site_content")
          .select("value")
          .eq("key", "footer")
          .single();

        if (footerData?.value) {
          setFooterSettings((prev) => ({ ...prev, ...footerData.value }));
        }

        // Fetch Masyayikh & Sarana from collections
        const { data: dbCollections } = await supabase
          .from("collections")
          .select("*")
          .order("order_index", { ascending: true });

        if (dbCollections && dbCollections.length > 0) {
          const dbLecturers = dbCollections
            .filter((c: any) => c.collection_type === "masyayikh")
            .map((c: any, idx: number) => ({
              id: c.id,
              name: c.data?.name || "Nama Dosen",
              title: c.data?.title || "",
              role: c.data?.role || "Dosen Pengampu",
              photoUrl: c.data?.photoUrl || "",
              expertise: c.data?.expertise || "",
              education: Array.isArray(c.data?.education)
                ? c.data.education
                : typeof c.data?.education === "string" && c.data.education.trim().length > 0
                ? c.data.education.split("•").map((s: string) => s.trim()).filter(Boolean)
                : [],
              publications: Array.isArray(c.data?.publications)
                ? c.data.publications
                : typeof c.data?.publications === "string" && c.data.publications.trim().length > 0
                ? c.data.publications.split("•").map((s: string) => s.trim()).filter(Boolean)
                : [],
              order: idx + 1,
              isActive: c.data?.isActive !== false
            }));
          if (dbLecturers.length > 0) setLecturers(dbLecturers);

          const dbFacilities = dbCollections
            .filter((c: any) => c.collection_type === "sarana")
            .map((c: any) => ({
              id: c.id,
              name: c.data?.name || "Nama Fasilitas",
              category: c.data?.category || "Masjid",
              photoUrl: c.data?.photoUrl || "",
              description: c.data?.description || "",
              capacity: c.data?.capacity,
              specs: c.data?.specs
            }));
          if (dbFacilities.length > 0) setFacilities(dbFacilities);
        }

        // Fetch Site Settings from site_content
        const { data: settingsData } = await supabase
          .from("site_content")
          .select("value")
          .eq("key", "site_settings")
          .single();

        if (settingsData?.value) {
          setSettings((prev) => ({ ...prev, ...settingsData.value }));
        }

        // Fetch News / Warta
        const { data: dbNews } = await supabase
          .from("news")
          .select("*")
          .order("created_at", { ascending: false });

        if (dbNews && dbNews.length > 0) {
          setNews(
            dbNews.map((n: any) => ({
              id: n.id,
              slug: n.slug,
              title: n.judul,
              excerpt: n.konten?.slice(0, 120) + "...",
              content: n.konten,
              category: n.tipe || "Berita",
              author: "Humas Ma'had Aly",
              date: n.tanggal || new Date(n.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
              imageUrl: n.gambar_url
            }))
          );
        }

        // Fetch Media Library
        const { data: dbMedia } = await supabase
          .from("media")
          .select("*")
          .order("created_at", { ascending: false });

        if (dbMedia && dbMedia.length > 0) {
          setMedia(
            dbMedia.map((m: any) => ({
              id: m.id,
              name: m.filename,
              url: m.url,
              size: m.size_kb > 1024 ? `${(m.size_kb / 1024).toFixed(1)} MB` : `${m.size_kb} KB`,
              type: m.mime_type?.startsWith("image/") ? "image" : (m.mime_type?.includes("pdf") ? "pdf" : "document"),
              uploadedAt: new Date(m.created_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric"
              })
            }))
          );
        }

        // Fetch Submissions
        const { data: dbSubmissions } = await supabase
          .from("submissions")
          .select("*")
          .order("created_at", { ascending: false });

        if (dbSubmissions && dbSubmissions.length > 0) {
          const mappedSubmissions: Submission[] = dbSubmissions.map((s: any) => {
            let extraMeta: any = {};
            if (s.catatan_admin) {
              try {
                extraMeta = JSON.parse(s.catatan_admin);
              } catch {
                extraMeta = { feedback: s.catatan_admin };
              }
            }
            return {
              id: s.id,
              trackingCode: extraMeta.trackingCode || `MAD-${new Date(s.created_at).getFullYear()}-${s.id.slice(0, 4)}`,
              nama: s.nama,
              email: s.email,
              hp: extraMeta.hp || "",
              afiliasi: s.afiliasi || "",
              tipeNaskah: extraMeta.tipeNaskah || "Artikel Fikih Kontemporer",
              judul: s.judul,
              kategori: s.kategori_id || "Fiqh Mu'asarah",
              abstrak: s.abstrak,
              keyword: s.keyword || [],
              keywords: Array.isArray(s.keyword) ? s.keyword.join(", ") : (s.keyword || ""),
              fileName: extraMeta.fileName || "Naskah.docx",
              fileSize: extraMeta.fileSize || "1.2 MB",
              tanggal: new Date(s.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
              status: (s.status as any) || "review",
              reviewNote: extraMeta.feedback || s.catatan_admin || "",
              feedback: extraMeta.feedback || "",
              timeline: extraMeta.timeline || [
                { status: "submitted", label: "Naskah Dikirim", timestamp: new Date(s.created_at).toISOString(), notes: "Naskah berhasil diterima oleh sistem" }
              ]
            };
          });
          setSubmissions(mappedSubmissions);
        }

        // Fetch Header from site_content
        const { data: headerData } = await supabase
          .from("site_content")
          .select("value")
          .eq("key", "header")
          .single();
        if (headerData?.value) {
          setNavbarSettings((prev) => {
            const next = { ...prev, ...headerData.value };
            if (Array.isArray(next.navLinks)) {
              next.navLinks = next.navLinks.filter(
                (l: any) => !(l.url === "/kirim-tulisan" && l.label?.toLowerCase().includes("kirim tulisan"))
              );
              if (!next.navLinks.some((l: any) => l.url === "/donasi")) {
                next.navLinks.push({
                  id: "nav-donasi",
                  label: "Infaq & Donasi",
                  url: "/donasi",
                  order: next.navLinks.length + 1,
                  isActive: true
                });
              }
            }
            return next;
          });
        }

        // Fetch Hero from site_content
        const { data: heroData } = await supabase
          .from("site_content")
          .select("value")
          .eq("key", "home.hero")
          .single();
        if (heroData?.value) {
          setHeroSettings((prev) => ({ ...prev, ...heroData.value }));
        }

        // Fetch Home Sections from site_content
        const { data: sectionsData } = await supabase
          .from("site_content")
          .select("value")
          .eq("key", "home_sections")
          .single();
        if (sectionsData?.value && Array.isArray(sectionsData.value)) {
          setHomeSections(sectionsData.value);
        }

        // Fetch Email Templates from site_content
        const { data: emailTemplatesData } = await supabase
          .from("site_content")
          .select("value")
          .eq("key", "email_templates")
          .single();
        if (emailTemplatesData?.value && Array.isArray(emailTemplatesData.value)) {
          setEmailTemplates(emailTemplatesData.value);
        }

        // Fetch About Page from site_content
        const { data: aboutData } = await supabase
          .from("site_content")
          .select("value")
          .eq("key", "about_page")
          .single();
        if (aboutData?.value) {
          setAboutPageContent((prev) => ({ ...prev, ...aboutData.value }));
        }

        // Fetch Page Texts CMS from site_content
        const { data: pageTextsData } = await supabase
          .from("site_content")
          .select("value")
          .eq("key", "page_texts")
          .single();
        if (pageTextsData?.value) {
          setPageTexts((prev) => ({ ...prev, ...pageTextsData.value }));
        }
      } catch (err) {
        console.warn("Supabase live fetch notice:", err);
      }
    }

    fetchFromSupabase();
  }, []);

  // Helper savers
  const saveArticles = (data: Article[]) => {
    setArticles(data);
    localStorage.setItem("mahad_articles", JSON.stringify(data));
  };
  const saveCategories = (data: CategoryInfo[]) => {
    setCategories(data);
    localStorage.setItem("mahad_categories", JSON.stringify(data));
  };
  const saveTheses = (data: Thesis[]) => {
    setTheses(data);
    localStorage.setItem("mahad_theses", JSON.stringify(data));
  };
  const saveSubmissions = (data: Submission[]) => {
    setSubmissions(data);
    localStorage.setItem("mahad_submissions", JSON.stringify(data));
  };
  const saveNews = (data: NewsItem[]) => {
    setNews(data);
    localStorage.setItem("mahad_news", JSON.stringify(data));
  };
  const saveSettings = (data: SiteSettings) => {
    setSettings(data);
    localStorage.setItem("mahad_settings", JSON.stringify(data));
  };
  const saveUsers = (data: AdminUser[]) => {
    setUsers(data);
    localStorage.setItem("mahad_users", JSON.stringify(data));
  };
  const saveLogs = (data: ActivityLog[]) => {
    setLogs(data);
    localStorage.setItem("mahad_logs", JSON.stringify(data));
  };
  const saveMedia = (data: MediaItem[]) => {
    setMedia(data);
    localStorage.setItem("mahad_media", JSON.stringify(data));
  };
  const saveLecturers = (data: Lecturer[]) => {
    setLecturers(data);
    localStorage.setItem("mahad_lecturers", JSON.stringify(data));
  };
  const saveFacilities = (data: Facility[]) => {
    setFacilities(data);
    localStorage.setItem("mahad_facilities", JSON.stringify(data));
  };
  const saveAccreditations = (data: Accreditation[]) => {
    setAccreditations(data);
    localStorage.setItem("mahad_accreditations", JSON.stringify(data));
  };
  const saveCourses = (data: Course[]) => {
    setCourses(data);
    localStorage.setItem("mahad_courses", JSON.stringify(data));
  };
  const saveCalendarEvents = (data: CalendarEvent[]) => {
    setCalendarEvents(data);
    localStorage.setItem("mahad_calendar", JSON.stringify(data));
  };
  const saveBahtsulQA = (data: BahtsulMasailQA[]) => {
    setBahtsulQA(data);
    localStorage.setItem("mahad_bahtsul", JSON.stringify(data));
  };
  const savePmbWaves = (data: PMBWave[]) => {
    setPmbWaves(data);
    localStorage.setItem("mahad_pmb_waves", JSON.stringify(data));
  };
  const savePmbFAQs = (data: PMBFAQ[]) => {
    setPmbFAQs(data);
    localStorage.setItem("mahad_pmb_faqs", JSON.stringify(data));
  };
  const saveSubscribers = (data: EmailSubscriber[]) => {
    setSubscribers(data);
    localStorage.setItem("mahad_subscribers", JSON.stringify(data));
  };
  const saveEmailLogs = (data: EmailLog[]) => {
    setEmailLogs(data);
    localStorage.setItem("mahad_email_logs", JSON.stringify(data));
  };
  const saveGalleryAlbums = (data: GalleryAlbum[]) => {
    setGalleryAlbums(data);
    localStorage.setItem("mahad_gallery", JSON.stringify(data));
  };
  const saveComingSoonPages = (data: ComingSoonPageSetting[]) => {
    setComingSoonPages(data);
    localStorage.setItem("mahad_coming_soon", JSON.stringify(data));
  };
  const savePageSeoList = (data: PageSeoItem[]) => {
    setPageSeoList(data);
    localStorage.setItem("mahad_page_seo", JSON.stringify(data));
  };
  const saveFooterSettings = (data: FooterSettings) => {
    setFooterSettings(data);
    localStorage.setItem("mahad_footer_settings", JSON.stringify(data));
  };
  const saveFooterNav = (data: FooterNavLink[]) => {
    setFooterNav(data);
    localStorage.setItem("mahad_footer_nav", JSON.stringify(data));
  };
  const saveFooterFocus = (data: FooterFocusItem[]) => {
    setFooterFocus(data);
    localStorage.setItem("mahad_footer_focus", JSON.stringify(data));
  };
  const saveDonations = (data: DonationProgram[]) => {
    setDonations(data);
    localStorage.setItem("mahad_donations", JSON.stringify(data));
  };
  const saveSecurityThreats = (data: SecurityThreatLog[]) => {
    setSecurityThreats(data);
    localStorage.setItem("mahad_security_threats", JSON.stringify(data));
  };

  const addLog = (action: string, target: string, user: string = "Super Admin") => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
    const formattedTime = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WITA";
    const newLog: ActivityLog = {
      id: "log-" + Date.now().toString(),
      user,
      action,
      target,
      timestamp: `${formattedDate}, ${formattedTime}`
    };
    saveLogs([newLog, ...logs.slice(0, 249)]);
  };

  const clearActivityLogs = (user: string = "Super Admin") => {
    saveLogs([]);
    addLog("Membersihkan Arsip Log Aktivitas", "Audit Trail", user);
  };

  // Article Actions
  const addArticle = (data: Omit<Article, "id" | "slug">) => {
    const slugBase = data.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    const newArticle: Article = {
      ...data,
      id: "art-" + Date.now().toString(),
      slug: `${slugBase}-${Date.now().toString().slice(-4)}`,
      views: 0,
      source: data.source || "admin",
      status: data.status || "published"
    };
    saveArticles([newArticle, ...articles]);
    addLog("Menerbitkan Artikel", data.title);

    // Sync to Supabase Database
    try {
      supabase.from("articles").insert({
        title: data.title,
        slug: newArticle.slug,
        excerpt: data.excerpt,
        content: data.content,
        author_name: data.author,
        author_role: data.authorRole,
        tags: data.tags || [],
        status: newArticle.status,
      }).then(({ error }) => {
        if (error) console.warn("Supabase insert article notice:", error.message);
      });
    } catch (e) {
      console.warn("DB notice:", e);
    }
  };

  const updateArticle = (id: string, updatedData: Partial<Article>) => {
    const target = articles.find((a) => a.id === id);
    const updated = articles.map((a) => (a.id === id ? { ...a, ...updatedData } : a));
    saveArticles(updated);
    addLog("Memperbarui Artikel", updatedData.title || id);

    if (target) {
      try {
        supabase.from("articles").update({
          title: updatedData.title !== undefined ? updatedData.title : target.title,
          excerpt: updatedData.excerpt !== undefined ? updatedData.excerpt : target.excerpt,
          content: updatedData.content !== undefined ? updatedData.content : target.content,
          author_name: updatedData.author !== undefined ? updatedData.author : target.author,
          author_role: updatedData.authorRole !== undefined ? updatedData.authorRole : target.authorRole,
          tags: updatedData.tags !== undefined ? updatedData.tags : target.tags,
        }).eq("slug", target.slug).then(({ error }) => {
          if (error) console.warn("Supabase update article notice:", error.message);
        });
      } catch (e) {
        console.warn("DB notice:", e);
      }
    }
  };

  const deleteArticle = (id: string) => {
    const target = articles.find((a) => a.id === id);
    const filtered = articles.filter((a) => a.id !== id);
    saveArticles(filtered);
    addLog("Menghapus Artikel", target?.title || id);

    if (target) {
      try {
        supabase.from("articles").delete().eq("slug", target.slug).then(({ error }) => {
          if (error) console.warn("Supabase delete article notice:", error.message);
        });
      } catch (e) {
        console.warn("DB notice:", e);
      }
    }
  };

  const incrementArticleViews = (slug: string) => {
    const updated = articles.map((a) =>
      a.slug === slug ? { ...a, views: (a.views || 0) + 1 } : a
    );
    saveArticles(updated);
  };

  // Category Actions
  const addCategory = (data: Omit<CategoryInfo, "id" | "slug">) => {
    let baseSlug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    if (data.type === "opini" && !baseSlug.startsWith("opini-")) {
      baseSlug = `opini-${baseSlug}`;
    }
    const newCat: CategoryInfo = {
      ...data,
      type: data.type || "artikel",
      id: "cat-" + Date.now().toString(),
      slug: `${baseSlug}-${Date.now().toString().slice(-3)}`
    };
    saveCategories([...categories, newCat]);
    addLog("Menambah Kategori", data.name);

    try {
      supabase.from("categories").insert({
        nama: data.name,
        slug: newCat.slug,
        deskripsi: data.description,
        icon: data.iconName || "book",
        urutan: categories.length + 1,
        is_published: true
      }).then(({ error }) => {
        if (error) console.warn("Supabase category insert notice:", error.message);
      });
    } catch (e) {
      console.warn("DB notice:", e);
    }
  };

  const updateCategory = (id: string, updatedData: Partial<CategoryInfo>) => {
    const target = categories.find((c) => c.id === id);
    const updated = categories.map((c) => (c.id === id ? { ...c, ...updatedData } : c));
    saveCategories(updated);
    addLog("Memperbarui Kategori", updatedData.name || id);

    if (target) {
      try {
        supabase.from("categories").update({
          nama: updatedData.name !== undefined ? updatedData.name : target.name,
          deskripsi: updatedData.description !== undefined ? updatedData.description : target.description,
          icon: updatedData.iconName !== undefined ? updatedData.iconName : target.iconName
        }).eq("slug", target.slug).then(({ error }) => {
          if (error) console.warn("Supabase category update notice:", error.message);
        });
      } catch (e) {
        console.warn("DB notice:", e);
      }
    }
  };

  const deleteCategory = (id: string) => {
    const target = categories.find((c) => c.id === id);
    const filtered = categories.filter((c) => c.id !== id);
    saveCategories(filtered);
    addLog("Menghapus Kategori", target?.name || id);

    if (target) {
      try {
        supabase.from("categories").delete().eq("slug", target.slug).then(({ error }) => {
          if (error) console.warn("Supabase category delete notice:", error.message);
        });
      } catch (e) {
        console.warn("DB notice:", e);
      }
    }
  };

  // Thesis Actions
  const addThesis = (data: Omit<Thesis, "id" | "slug">) => {
    const slugBase = data.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    const newThesis: Thesis = {
      ...data,
      id: "th-" + Date.now().toString(),
      slug: `${slugBase}-${Date.now().toString().slice(-4)}`
    };
    saveTheses([newThesis, ...theses]);
    addLog("Menambahkan Skripsi", data.title);

    try {
      supabase.from("theses").insert({
        judul: data.title,
        slug: newThesis.slug,
        penulis: data.author,
        nim: data.nim,
        angkatan: data.angkatan,
        tahun: data.year,
        pembimbing_1: data.advisor1,
        pembimbing_2: data.advisor2,
        abstrak_id: data.abstractId,
        abstrak_ar: data.abstractAr,
        keyword: data.keywords || [],
        pdf_url: data.downloadUrl,
        pdf_size_mb: data.fileSize,
        status: "published"
      }).then(({ error }) => {
        if (error) console.warn("Supabase thesis insert notice:", error.message);
      });
    } catch (e) {
      console.warn("DB notice:", e);
    }
  };

  const updateThesis = (id: string, updatedData: Partial<Thesis>) => {
    const target = theses.find((t) => t.id === id);
    const updated = theses.map((t) => (t.id === id ? { ...t, ...updatedData } : t));
    saveTheses(updated);
    addLog("Memperbarui Skripsi", updatedData.title || id);

    if (target) {
      try {
        supabase.from("theses").update({
          judul: updatedData.title !== undefined ? updatedData.title : target.title,
          penulis: updatedData.author !== undefined ? updatedData.author : target.author,
          nim: updatedData.nim !== undefined ? updatedData.nim : target.nim,
          angkatan: updatedData.angkatan !== undefined ? updatedData.angkatan : target.angkatan,
          tahun: updatedData.year !== undefined ? updatedData.year : target.year,
          pembimbing_1: updatedData.advisor1 !== undefined ? updatedData.advisor1 : target.advisor1,
          pembimbing_2: updatedData.advisor2 !== undefined ? updatedData.advisor2 : target.advisor2,
          abstrak_id: updatedData.abstractId !== undefined ? updatedData.abstractId : target.abstractId,
          abstrak_ar: updatedData.abstractAr !== undefined ? updatedData.abstractAr : target.abstractAr,
          keyword: updatedData.keywords !== undefined ? updatedData.keywords : target.keywords,
          pdf_url: updatedData.downloadUrl !== undefined ? updatedData.downloadUrl : target.downloadUrl,
          pdf_size_mb: updatedData.fileSize !== undefined ? updatedData.fileSize : target.fileSize
        }).eq("slug", target.slug).then(({ error }) => {
          if (error) console.warn("Supabase thesis update notice:", error.message);
        });
      } catch (e) {
        console.warn("DB notice:", e);
      }
    }
  };

  const deleteThesis = (id: string) => {
    const target = theses.find((t) => t.id === id);
    const filtered = theses.filter((t) => t.id !== id);
    saveTheses(filtered);
    addLog("Menghapus Skripsi", target?.title || id);

    if (target) {
      try {
        supabase.from("theses").delete().eq("slug", target.slug).then(({ error }) => {
          if (error) console.warn("Supabase thesis delete notice:", error.message);
        });
      } catch (e) {
        console.warn("DB notice:", e);
      }
    }
  };

  // Submission Actions
  const addSubmission = (data: Omit<Submission, "id" | "tanggal" | "status">) => {
    const newSub: Submission = {
      ...data,
      id: "sub-" + Date.now().toString(),
      tanggal: new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
      }),
      status: "review"
    };
    saveSubmissions([newSub, ...submissions]);
    addLog("Naskah Masuk Baru", data.judul, data.nama);
  };

  const updateSubmissionStatus = async (
    id: string,
    status: Submission["status"],
    reviewNote?: string,
    publishedArticleLink?: string
  ): Promise<{ success: boolean; emailResult?: any; accessCode?: string }> => {
    const target = submissions.find((s) => s.id === id);
    if (!target) return { success: false };

    let stageLabel = "Naskah Sedang Direview";
    if (status === "revision") stageLabel = "Permintaan Revisi dari Redaksi";
    else if (status === "accepted") stageLabel = "Naskah Diterima untuk Diterbitkan";
    else if (status === "rejected") stageLabel = "Naskah Ditolak";

    const accessCode = target.accessCode || (status === "accepted" ? `MAD2-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}` : undefined);

    const newTimelineEvent: SubmissionTimelineEvent = {
      status: status === "revision" ? "revision" : status === "accepted" ? "accepted" : status === "rejected" ? "rejected" : "under_review",
      label: stageLabel,
      timestamp: new Date().toISOString(),
      notes: reviewNote || (status === "accepted" ? `Abstrak disetujui (ACC). Kode Akses Tahap 2: ${accessCode}` : "Status diperbarui oleh admin")
    };

    const updatedTimeline = [...(target.timeline || []), newTimelineEvent];
    const updatedSub: Submission = {
      ...target,
      status,
      accessCode: accessCode || target.accessCode,
      feedback: reviewNote || target.feedback,
      reviewNote: reviewNote || target.reviewNote,
      timeline: updatedTimeline
    };

    const updatedList = submissions.map((s) => (s.id === id ? updatedSub : s));
    saveSubmissions(updatedList);
    addLog(`Ubah Status Naskah (${status})`, target.judul);

    // Sync to Supabase
    try {
      const extraMeta = {
        trackingCode: target.trackingCode,
        accessCode: updatedSub.accessCode,
        hp: target.hp,
        tipeNaskah: target.tipeNaskah,
        fileName: target.fileName,
        fileSize: target.fileSize,
        timeline: updatedTimeline,
        feedback: reviewNote || target.feedback,
        fullPaper: target.fullPaper
      };
      await supabase
        .from("submissions")
        .update({
          status,
          catatan_admin: JSON.stringify(extraMeta),
          updated_at: new Date().toISOString()
        })
        .eq("id", id);
    } catch (e) {
      console.warn("DB notice:", e);
    }

    // Trigger email notification via API route
    let emailResult: any = null;
    try {
      const res = await fetch("/api/submission/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status,
          accessCode: updatedSub.accessCode,
          note: reviewNote,
          publishedArticleLink
        })
      });
      const resJson = await res.json();
      emailResult = resJson?.emailResult || null;
    } catch (e: any) {
      console.warn("Email notify notice:", e);
      emailResult = { success: false, error: e?.message || "Koneksi ke endpoint notifikasi gagal" };
    }

    return { success: true, emailResult, accessCode: updatedSub.accessCode };
  };

  const saveSubmissionFullPaper = async (id: string, fullPaper: import("@/lib/types").SubmissionFullPaper) => {
    const target = submissions.find((s) => s.id === id);
    if (!target) return { success: false };

    const updatedTimeline = [...(target.timeline || [])];
    if (!updatedTimeline.some((t) => t.notes?.includes("Tahap 2 (Full Paper)"))) {
      updatedTimeline.push({
        status: "under_review",
        label: "Naskah Lengkap Dikirim",
        timestamp: new Date().toISOString(),
        notes: "Penulis telah mengirimkan naskah lengkap Tahap 2 (Full Paper) untuk ditelaah redaksi."
      });
    }

    const updatedSub: Submission = {
      ...target,
      status: "under_review",
      fullPaper,
      timeline: updatedTimeline
    };

    const updatedList = submissions.map((s) => (s.id === id ? updatedSub : s));
    saveSubmissions(updatedList);
    addLog("Pengiriman Full Paper Tahap 2", target.judul);

    try {
      const extraMeta = {
        trackingCode: target.trackingCode,
        accessCode: target.accessCode,
        hp: target.hp,
        tipeNaskah: target.tipeNaskah,
        fileName: target.fileName,
        fileSize: target.fileSize,
        timeline: updatedTimeline,
        feedback: target.feedback,
        fullPaper
      };
      await supabase
        .from("submissions")
        .update({
          status: "under_review",
          catatan_admin: JSON.stringify(extraMeta),
          updated_at: new Date().toISOString()
        })
        .eq("id", id);
    } catch (e) {
      console.warn("DB notice:", e);
    }

    return { success: true };
  };

  const publishSubmissionAsArticle = async (submissionId: string): Promise<{ success: boolean; article?: Article; emailResult?: any }> => {
    const sub = submissions.find((s) => s.id === submissionId);
    if (!sub) return { success: false };

    const isOpini = sub.tipeNaskah?.toLowerCase().includes("opini");

    const slugBase = sub.judul
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    const articleSlug = `${slugBase}-${Date.now().toString().slice(-4)}`;

    let articleContent = "";
    if (sub.fullPaper && sub.fullPaper.sections && sub.fullPaper.sections.length > 0) {
      articleContent = sub.fullPaper.sections
        .map((s) => `<section class="mb-6"><h3 class="text-xl font-serif font-bold text-slate-800 mb-2">${s.title}</h3><div class="prose max-w-none text-slate-700 leading-relaxed">${s.content}</div></section>`)
        .join("");
      if (sub.fullPaper.footnotes) {
        articleContent += `<hr class="my-6 border-slate-200"/><div class="text-xs text-slate-500 font-serif"><strong>Catatan Kaki (Footnotes):</strong><p class="whitespace-pre-line mt-1">${sub.fullPaper.footnotes}</p></div>`;
      }
    } else {
      articleContent = `<p>${sub.abstrak}</p><p><em>Naskah lengkap telah ditelaah dan disetujui dewan redaksi Ma'had Aly DDI Mangkoso.</em></p>`;
    }

    const newArt: Article = {
      id: "art-" + Date.now().toString(),
      slug: articleSlug,
      title: sub.judul,
      type: isOpini ? "opini" : "artikel",
      source: "submission",
      submission_id: submissionId,
      status: "published",
      excerpt: sub.abstrak ? sub.abstrak.slice(0, 160) + "..." : (isOpini ? "Opini & refleksi santri Ma'had Aly." : "Artikel ilmiah kajian fikih kontemporer."),
      content: articleContent,
      author: sub.nama,
      authorRole: sub.afiliasi || "Kontributor / Penulis Tamu",
      authorBio: sub.afiliasi ? `Penulis dari ${sub.afiliasi}` : "",
      category: sub.kategori || (isOpini ? "opini-santri" : "fiqh-muamalah-kontemporer"),
      categoryLabel: sub.kategori || (isOpini ? "Opini Santri" : "Fiqh Mu'asarah"),
      date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
      hijriDate: "1448 H",
      readTime: "5 menit",
      views: 0,
      tags: Array.isArray(sub.keyword)
        ? sub.keyword
        : typeof sub.keywords === "string"
        ? sub.keywords.split(",").map((k) => k.trim())
        : [isOpini ? "Opini Santri" : "Fiqh Kontemporer"]
    };

    saveArticles([newArt, ...articles]);
    addLog("Menerbitkan Submission ke Artikel", sub.judul);

    try {
      await supabase.from("articles").insert({
        title: newArt.title,
        slug: newArt.slug,
        excerpt: newArt.excerpt,
        content: newArt.content,
        author_name: newArt.author,
        author_role: newArt.authorRole,
        tags: newArt.tags,
        status: "published"
      });
    } catch (e) {
      console.warn("DB notice:", e);
    }

    const origin = typeof window !== "undefined" ? window.location.origin : "https://mahadalymangkoso.ac.id";
    const pathPrefix = isOpini ? "/opini" : "/artikel";
    const publishedLink = `${origin}${pathPrefix}/${articleSlug}`;
    
    const updateRes = await updateSubmissionStatus(
      submissionId,
      "published",
      `Naskah telah resmi diterbitkan di portal: ${publishedLink}`,
      publishedLink
    );

    return { success: true, article: newArt, emailResult: updateRes.emailResult };
  };

  const publishSubmissionAsThesis = async (submissionId: string) => {
    const sub = submissions.find((s) => s.id === submissionId);
    if (!sub) return { success: false, error: "Submission tidak ditemukan" };

    const thesisSlug = sub.judul
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const newThesis: Thesis = {
      id: "thesis-" + Date.now().toString(),
      title: sub.judul,
      slug: `${thesisSlug}-${Date.now().toString().slice(-4)}`,
      author: sub.nama,
      nim: sub.nim || "Alumni",
      angkatan: sub.angkatan || "Takhassus",
      year: sub.year || new Date().getFullYear().toString(),
      category: sub.kategori || "fiqh-muamalah-kontemporer",
      categoryLabel: sub.kategori || "Fiqh Mu'asarah",
      advisor1: sub.advisor1 || "Dewan Pembina Ilmiah",
      advisor2: sub.advisor2 || "Dewan Asatidzah",
      abstractId: sub.abstrak,
      abstractAr: "",
      keywords: Array.isArray(sub.keyword)
        ? sub.keyword
        : typeof sub.keywords === "string"
        ? sub.keywords.split(",").map((k) => k.trim())
        : ["Fiqh Mu'asarah", "Skripsi"],
      downloadUrl: sub.driveUrl || sub.fileLink || "",
      fileSize: sub.fileSize || "1.5 MB"
    };

    saveTheses([newThesis, ...theses]);
    addLog("Menerbitkan Submission ke Repositori Skripsi", sub.judul);

    try {
      await supabase.from("theses").insert({
        judul: newThesis.title,
        slug: newThesis.slug,
        penulis: newThesis.author,
        nim: newThesis.nim,
        tahun_lulus: parseInt(newThesis.year) || 2024,
        abstrak: newThesis.abstractId,
        pembimbing1: newThesis.advisor1,
        pembimbing2: newThesis.advisor2,
        file_url: newThesis.downloadUrl
      });
    } catch (e) {
      console.warn("DB notice thesis insert:", e);
    }

    const origin = typeof window !== "undefined" ? window.location.origin : "https://mahadalymangkoso.ac.id";
    const publishedLink = `${origin}/skripsi/${newThesis.slug}`;

    const updateRes = await updateSubmissionStatus(
      submissionId,
      "published",
      `Risalah skripsi telah resmi diterbitkan di Repositori Skripsi: ${publishedLink}`,
      publishedLink
    );

    return { success: true, thesis: newThesis, emailResult: updateRes.emailResult };
  };

  const deleteSubmission = (id: string) => {
    const target = submissions.find((s) => s.id === id);
    const filtered = submissions.filter((s) => s.id !== id);
    saveSubmissions(filtered);
    addLog("Menghapus Submission", target?.judul || id);

    try {
      supabase.from("submissions").delete().eq("id", id).then(({ error }) => {
        if (error) console.warn("Supabase delete submission notice:", error.message);
      });
    } catch (e) {
      console.warn("DB notice:", e);
    }
  };

  // News Actions
  const addNews = (data: Omit<NewsItem, "id" | "slug">) => {
    const slugBase = data.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    const newItem: NewsItem = {
      ...data,
      id: "news-" + Date.now().toString(),
      slug: `${slugBase}-${Date.now().toString().slice(-4)}`
    };
    saveNews([newItem, ...news]);
    addLog("Menerbitkan Berita", data.title);

    try {
      supabase.from("news").insert({
        judul: data.title,
        slug: newItem.slug,
        konten: data.content,
        tipe: data.category || "Berita",
        gambar_url: data.imageUrl,
        tanggal: data.date,
        status: "published"
      }).then(({ error }) => {
        if (error) console.warn("Supabase news insert notice:", error.message);
      });
    } catch (e) {
      console.warn("DB notice:", e);
    }
  };

  const updateNews = (id: string, updatedData: Partial<NewsItem>) => {
    const target = news.find((n) => n.id === id);
    const updated = news.map((n) => (n.id === id ? { ...n, ...updatedData } : n));
    saveNews(updated);
    addLog("Memperbarui Berita", updatedData.title || id);

    if (target) {
      try {
        supabase.from("news").update({
          judul: updatedData.title !== undefined ? updatedData.title : target.title,
          konten: updatedData.content !== undefined ? updatedData.content : target.content,
          tipe: updatedData.category !== undefined ? updatedData.category : target.category,
          gambar_url: updatedData.imageUrl !== undefined ? updatedData.imageUrl : target.imageUrl,
          tanggal: updatedData.date !== undefined ? updatedData.date : target.date
        }).eq("slug", target.slug).then(({ error }) => {
          if (error) console.warn("Supabase news update notice:", error.message);
        });
      } catch (e) {
        console.warn("DB notice:", e);
      }
    }
  };

  const deleteNews = (id: string) => {
    const target = news.find((n) => n.id === id);
    const filtered = news.filter((n) => n.id !== id);
    saveNews(filtered);
    addLog("Menghapus Berita", target?.title || id);

    if (target) {
      try {
        supabase.from("news").delete().eq("slug", target.slug).then(({ error }) => {
          if (error) console.warn("Supabase news delete notice:", error.message);
        });
      } catch (e) {
        console.warn("DB notice:", e);
      }
    }
  };

  // User Actions
  const addUser = (data: Omit<AdminUser, "id">) => {
    const newUser: AdminUser = {
      ...data,
      id: "usr-" + Date.now().toString()
    };
    saveUsers([...users, newUser]);
    addLog("Menambah Pengguna Admin", data.name);
  };

  const updateUser = (id: string, updatedData: Partial<AdminUser>) => {
    const updated = users.map((u) => (u.id === id ? { ...u, ...updatedData } : u));
    saveUsers(updated);
    addLog("Memperbarui Pengguna", updatedData.name || id);
  };

  const deleteUser = (id: string) => {
    const target = users.find((u) => u.id === id);
    const filtered = users.filter((u) => u.id !== id);
    saveUsers(filtered);
    addLog("Menghapus Pengguna", target?.name || id);
  };

  // Media Actions
  const addMedia = (item: Omit<MediaItem, "id" | "uploadedAt">) => {
    const newMedia: MediaItem = {
      ...item,
      id: "med-" + Date.now().toString(),
      uploadedAt: new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric"
      })
    };
    saveMedia([newMedia, ...media]);
    addLog("Mengunggah Media", item.name);
  };

  const deleteMedia = async (id: string) => {
    const target = media.find((m) => m.id === id);
    const filtered = media.filter((m) => m.id !== id);
    saveMedia(filtered);
    try {
      await fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, url: target?.url }),
      });
    } catch (e) {
      console.warn("Error deleting media from R2/Supabase:", e);
    }
    addLog("Menghapus Media", target?.name || id);
  };

  // Lecturer Actions
  const addLecturer = (data: Omit<Lecturer, "id">) => {
    const newLec: Lecturer = { ...data, id: "lec-" + Date.now().toString() };
    saveLecturers([...lecturers, newLec]);
    addLog("Menambah Dosen", data.name);

    try {
      supabase.from("collections").insert({
        collection_type: "masyayikh",
        data: newLec,
        order_index: newLec.order || lecturers.length + 1,
        is_published: true
      }).then(({ error }) => {
        if (error) console.warn("Supabase lecturer insert notice:", error.message);
      });
    } catch (e) {
      console.warn("DB notice:", e);
    }
  };

  const updateLecturer = (id: string, updatedData: Partial<Lecturer>) => {
    const target = lecturers.find((l) => l.id === id);
    const updated = lecturers.map((l) => (l.id === id ? { ...l, ...updatedData } : l));
    saveLecturers(updated);
    addLog("Memperbarui Dosen", updatedData.name || id);

    if (target) {
      const merged = { ...target, ...updatedData };
      try {
        supabase.from("collections").upsert({
          collection_type: "masyayikh",
          data: merged,
          order_index: merged.order || 1,
          is_published: merged.isActive !== false
        }).then(({ error }) => {
          if (error) console.warn("Supabase lecturer update notice:", error.message);
        });
      } catch (e) {
        console.warn("DB notice:", e);
      }
    }
  };

  const deleteLecturer = (id: string) => {
    const target = lecturers.find((l) => l.id === id);
    saveLecturers(lecturers.filter((l) => l.id !== id));
    addLog("Menghapus Dosen", target?.name || id);

    try {
      supabase.from("collections").delete().eq("id", id).then(({ error }) => {
        if (error) console.warn("Supabase lecturer delete notice:", error.message);
      });
    } catch (e) {
      console.warn("DB notice:", e);
    }
  };

  // Facility Actions
  const addFacility = (data: Omit<Facility, "id">) => {
    const newFac: Facility = { ...data, id: "fac-" + Date.now().toString() };
    saveFacilities([...facilities, newFac]);
    addLog("Menambah Sarana", data.name);

    try {
      supabase.from("collections").insert({
        collection_type: "sarana",
        data: newFac,
        order_index: facilities.length + 1,
        is_published: true
      }).then(({ error }) => {
        if (error) console.warn("Supabase facility insert notice:", error.message);
      });
    } catch (e) {
      console.warn("DB notice:", e);
    }
  };

  const updateFacility = (id: string, updatedData: Partial<Facility>) => {
    const target = facilities.find((f) => f.id === id);
    const updated = facilities.map((f) => (f.id === id ? { ...f, ...updatedData } : f));
    saveFacilities(updated);
    addLog("Memperbarui Sarana", updatedData.name || id);

    if (target) {
      const merged = { ...target, ...updatedData };
      try {
        supabase.from("collections").upsert({
          collection_type: "sarana",
          data: merged,
          order_index: 1,
          is_published: true
        }).then(({ error }) => {
          if (error) console.warn("Supabase facility update notice:", error.message);
        });
      } catch (e) {
        console.warn("DB notice:", e);
      }
    }
  };

  const deleteFacility = (id: string) => {
    const target = facilities.find((f) => f.id === id);
    saveFacilities(facilities.filter((f) => f.id !== id));
    addLog("Menghapus Sarana", target?.name || id);

    try {
      supabase.from("collections").delete().eq("id", id).then(({ error }) => {
        if (error) console.warn("Supabase facility delete notice:", error.message);
      });
    } catch (e) {
      console.warn("DB notice:", e);
    }
  };

  // Accreditation Actions
  const addAccreditation = (data: Omit<Accreditation, "id">) => {
    const newAcc: Accreditation = { ...data, id: "acc-" + Date.now().toString() };
    saveAccreditations([...accreditations, newAcc]);
    addLog("Menambah Sertifikat Akreditasi", data.name);
  };
  const updateAccreditation = (id: string, updatedData: Partial<Accreditation>) => {
    const updated = accreditations.map((a) => (a.id === id ? { ...a, ...updatedData } : a));
    saveAccreditations(updated);
    addLog("Memperbarui Akreditasi", updatedData.name || id);
  };
  const deleteAccreditation = (id: string) => {
    const target = accreditations.find((a) => a.id === id);
    saveAccreditations(accreditations.filter((a) => a.id !== id));
    addLog("Menghapus Akreditasi", target?.name || id);
  };

  // Course Actions
  const addCourse = (data: Omit<Course, "id">) => {
    const newCrs: Course = { ...data, id: "crs-" + Date.now().toString() };
    saveCourses([...courses, newCrs]);
    addLog("Menambah Mata Kuliah", data.name);
  };
  const updateCourse = (id: string, updatedData: Partial<Course>) => {
    const updated = courses.map((c) => (c.id === id ? { ...c, ...updatedData } : c));
    saveCourses(updated);
    addLog("Memperbarui Mata Kuliah", updatedData.name || id);
  };
  const deleteCourse = (id: string) => {
    const target = courses.find((c) => c.id === id);
    saveCourses(courses.filter((c) => c.id !== id));
    addLog("Menghapus Mata Kuliah", target?.name || id);
  };

  // Calendar Event Actions
  const addCalendarEvent = (data: Omit<CalendarEvent, "id">) => {
    const newEv: CalendarEvent = { ...data, id: "cal-" + Date.now().toString() };
    saveCalendarEvents([...calendarEvents, newEv]);
    addLog("Menambah Kegiatan Kalender", data.name);
  };
  const updateCalendarEvent = (id: string, updatedData: Partial<CalendarEvent>) => {
    const updated = calendarEvents.map((c) => (c.id === id ? { ...c, ...updatedData } : c));
    saveCalendarEvents(updated);
    addLog("Memperbarui Kegiatan Kalender", updatedData.name || id);
  };
  const deleteCalendarEvent = (id: string) => {
    const target = calendarEvents.find((c) => c.id === id);
    saveCalendarEvents(calendarEvents.filter((c) => c.id !== id));
    addLog("Menghapus Kegiatan Kalender", target?.name || id);
  };

  // Bahtsul QA Actions
  const addBahtsulQA = (data: Omit<BahtsulMasailQA, "id">) => {
    const newQA: BahtsulMasailQA = { ...data, id: "bm-" + Date.now().toString() };
    saveBahtsulQA([...bahtsulQA, newQA]);
    addLog("Menambah Tanya Jawab Bahtsul Masail", data.title);
  };
  const updateBahtsulQA = (id: string, updatedData: Partial<BahtsulMasailQA>) => {
    const updated = bahtsulQA.map((b) => (b.id === id ? { ...b, ...updatedData } : b));
    saveBahtsulQA(updated);
    addLog("Memperbarui Bahtsul Masail", updatedData.title || id);
  };
  const deleteBahtsulQA = (id: string) => {
    const target = bahtsulQA.find((b) => b.id === id);
    saveBahtsulQA(bahtsulQA.filter((b) => b.id !== id));
    addLog("Menghapus Bahtsul Masail", target?.title || id);
  };

  // PMB Wave & FAQ Actions
  const addPMBWave = (data: Omit<PMBWave, "id">) => {
    const newWave: PMBWave = { ...data, id: "pmb-" + Date.now().toString() };
    savePmbWaves([...pmbWaves, newWave]);
    addLog("Menambah Gelombang PMB", data.name);
  };
  const updatePMBWave = (id: string, updatedData: Partial<PMBWave>) => {
    const updated = pmbWaves.map((w) => (w.id === id ? { ...w, ...updatedData } : w));
    savePmbWaves(updated);
    addLog("Memperbarui Gelombang PMB", updatedData.name || id);
  };
  const deletePMBWave = (id: string) => {
    const target = pmbWaves.find((w) => w.id === id);
    savePmbWaves(pmbWaves.filter((w) => w.id !== id));
    addLog("Menghapus Gelombang PMB", target?.name || id);
  };

  const addPMBFAQ = (data: Omit<PMBFAQ, "id">) => {
    const newFAQ: PMBFAQ = { ...data, id: "faq-" + Date.now().toString() };
    savePmbFAQs([...pmbFAQs, newFAQ]);
    addLog("Menambah FAQ PMB", data.question);
  };
  const updatePMBFAQ = (id: string, updatedData: Partial<PMBFAQ>) => {
    const updated = pmbFAQs.map((f) => (f.id === id ? { ...f, ...updatedData } : f));
    savePmbFAQs(updated);
    addLog("Memperbarui FAQ PMB", updatedData.question || id);
  };
  const deletePMBFAQ = (id: string) => {
    const target = pmbFAQs.find((f) => f.id === id);
    savePmbFAQs(pmbFAQs.filter((f) => f.id !== id));
    addLog("Menghapus FAQ PMB", target?.question || id);
  };

  // Subscriber Actions
  const addSubscriber = (data: Omit<EmailSubscriber, "id" | "subscribedAt">) => {
    const newSub: EmailSubscriber = {
      ...data,
      id: "sub-" + Date.now().toString(),
      subscribedAt: new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric"
      })
    };
    saveSubscribers([newSub, ...subscribers]);
  };
  const deleteSubscriber = (id: string) => {
    saveSubscribers(subscribers.filter((s) => s.id !== id));
    addLog("Menghapus Subscriber", id);
  };

  // Real Email Notification Sender via Resend API
  const sendEmailNotification = async (to: string, subject: string, htmlContent?: string): Promise<{ success: boolean; error?: string }> => {
    const defaultHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h3 style="color: #064e3b; margin-top: 0;">Ma'had Aly DDI Mangkoso</h3>
        <p><strong>Subjek:</strong> ${subject}</p>
        <p>Pemberitahuan dari sistem administrasi portal Ma'had Aly DDI Mangkoso.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
        <p style="font-size: 12px; color: #64748b;">Pondok Pesantren DDI Mangkoso, Barru, Sulawesi Selatan</p>
      </div>
    `;
    const finalHtml = htmlContent || defaultHtml;

    try {
      const res = await fetch("/api/admin/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to,
          subject,
          html: finalHtml
        })
      });
      const data = await res.json();

      const newLog: EmailLog = {
        id: "elog-" + Date.now().toString(),
        to,
        subject,
        status: data.success ? "Terkirim" : "Gagal",
        errorReason: data.success ? undefined : (data.error || "Gagal mengirim email via Resend API"),
        resendId: data.resendId,
        htmlContent: finalHtml,
        timestamp: new Date().toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit"
        })
      };

      saveEmailLogs([newLog, ...emailLogs]);
      addLog(data.success ? "Kirim Email Berhasil" : "Kirim Email Gagal", `${subject} (${to})`);
      return { success: Boolean(data.success), error: data.error };
    } catch (err: any) {
      const newLog: EmailLog = {
        id: "elog-" + Date.now().toString(),
        to,
        subject,
        status: "Gagal",
        errorReason: err.message || "Gagal menghubungi server",
        htmlContent: finalHtml,
        timestamp: new Date().toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit"
        })
      };
      saveEmailLogs([newLog, ...emailLogs]);
      addLog("Kirim Email Gagal", `${subject} (${to})`);
      return { success: false, error: err.message };
    }
  };

  const retryEmailSend = async (logId: string): Promise<{ success: boolean; error?: string; id?: string }> => {
    const targetLog = emailLogs.find((l) => l.id === logId);
    if (!targetLog) return { success: false, error: "Log email tidak ditemukan." };

    try {
      const res = await fetch("/api/admin/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: targetLog.to,
          subject: targetLog.subject,
          html: targetLog.htmlContent || `<p>${targetLog.subject}</p>`
        })
      });
      const data = await res.json();

      const updatedLogs: EmailLog[] = emailLogs.map((l) => {
        if (l.id === logId) {
          return {
            ...l,
            status: data.success ? ("Terkirim" as const) : ("Gagal" as const),
            errorReason: data.success ? undefined : (data.error || "Gagal saat kirim ulang"),
            resendId: data.resendId || l.resendId,
            timestamp: new Date().toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit"
            })
          };
        }
        return l;
      });

      saveEmailLogs(updatedLogs);
      addLog(data.success ? "Kirim Ulang Email Berhasil" : "Kirim Ulang Email Gagal", `${targetLog.subject} (${targetLog.to})`);
      return { success: Boolean(data.success), error: data.error, id: data.resendId };
    } catch (err: any) {
      return { success: false, error: err.message || "Gagal kirim ulang email" };
    }
  };

  // Gallery Album Actions
  const addGalleryAlbum = (data: Omit<GalleryAlbum, "id">) => {
    const newAlb: GalleryAlbum = { ...data, id: "alb-" + Date.now().toString() };
    saveGalleryAlbums([...galleryAlbums, newAlb]);
    addLog("Menambah Album Galeri", data.title);
  };
  const updateGalleryAlbum = (id: string, updatedData: Partial<GalleryAlbum>) => {
    const updated = galleryAlbums.map((g) => (g.id === id ? { ...g, ...updatedData } : g));
    saveGalleryAlbums(updated);
    addLog("Memperbarui Album Galeri", updatedData.title || id);
  };
  const deleteGalleryAlbum = (id: string) => {
    const target = galleryAlbums.find((g) => g.id === id);
    saveGalleryAlbums(galleryAlbums.filter((g) => g.id !== id));
    addLog("Menghapus Album Galeri", target?.title || id);
  };

  // Coming Soon Actions
  const toggleComingSoonPage = (id: string, isEnabled: boolean) => {
    const updated = comingSoonPages.map((p) => (p.id === id ? { ...p, isEnabled } : p));
    saveComingSoonPages(updated);
    addLog(`Ubah Status Halaman (${isEnabled ? 'Aktif' : 'Placeholder'})`, id);
  };
  const updateComingSoonPage = (id: string, updatedData: Partial<ComingSoonPageSetting>) => {
    const updated = comingSoonPages.map((p) => (p.id === id ? { ...p, ...updatedData } : p));
    saveComingSoonPages(updated);
    addLog("Memperbarui Status Halaman", updatedData.title || id);
  };

  // Page SEO Actions
  const updatePageSeo = (pageKey: PageSeoItem["pageKey"], updatedData: Partial<PageSeoItem>) => {
    const updated = pageSeoList.map((p) => (p.pageKey === pageKey ? { ...p, ...updatedData } : p));
    savePageSeoList(updated);
    addLog("Memperbarui SEO Halaman", pageKey);
  };

  // Footer Manager Actions
  const updateFooterSettings = (updated: Partial<FooterSettings>) => {
    const merged = { ...footerSettings, ...updated };
    saveFooterSettings(merged);
    addLog("Memperbarui Pengaturan Footer", "Footer Manager");

    try {
      supabase.from("site_content").upsert({
        key: "footer",
        group_name: "footer",
        label: "Footer Settings",
        value: merged,
        updated_at: new Date().toISOString()
      }, { onConflict: "key" }).then(({ error }) => {
        if (error) console.warn("Supabase footer save notice:", error.message);
      });
    } catch (e) {
      console.warn("DB notice:", e);
    }
  };

  const addFooterNav = (link: Omit<FooterNavLink, "id">) => {
    const newLink: FooterNavLink = { ...link, id: "fnav-" + Date.now().toString() };
    saveFooterNav([...footerNav, newLink]);
    addLog("Menambah Link Navigasi Footer", link.label);
  };

  const updateFooterNav = (id: string, updated: Partial<FooterNavLink>) => {
    const merged = footerNav.map((n) => (n.id === id ? { ...n, ...updated } : n));
    saveFooterNav(merged);
    addLog("Memperbarui Link Navigasi Footer", id);
  };

  const deleteFooterNav = (id: string) => {
    const target = footerNav.find((n) => n.id === id);
    saveFooterNav(footerNav.filter((n) => n.id !== id));
    addLog("Menghapus Link Navigasi Footer", target?.label || id);
  };

  const addFooterFocus = (item: Omit<FooterFocusItem, "id">) => {
    const newItem: FooterFocusItem = { ...item, id: "ffoc-" + Date.now().toString() };
    saveFooterFocus([...footerFocus, newItem]);
    addLog("Menambah Fokus Keilmuan Footer", item.name);
  };

  const updateFooterFocus = (id: string, updated: Partial<FooterFocusItem>) => {
    const merged = footerFocus.map((f) => (f.id === id ? { ...f, ...updated } : f));
    saveFooterFocus(merged);
    addLog("Memperbarui Fokus Keilmuan Footer", id);
  };

  const deleteFooterFocus = (id: string) => {
    const target = footerFocus.find((f) => f.id === id);
    saveFooterFocus(footerFocus.filter((f) => f.id !== id));
    addLog("Menghapus Fokus Keilmuan Footer", target?.name || id);
  };

  const resetFooterToDefault = () => {
    saveFooterSettings(INITIAL_FOOTER_SETTINGS);
    saveFooterNav(INITIAL_FOOTER_NAV);
    saveFooterFocus(INITIAL_FOOTER_FOCUS);
    addLog("Reset Footer ke Default", "Footer Manager");

    try {
      supabase.from("site_content").upsert({
        key: "footer",
        group_name: "footer",
        label: "Footer Settings",
        value: INITIAL_FOOTER_SETTINGS,
        updated_at: new Date().toISOString()
      }, { onConflict: "key" });
    } catch (e) {
      console.warn("DB notice:", e);
    }
  };

  // Site Settings Action
  const updateSettings = (newSettings: Partial<SiteSettings>) => {
    const updated = { ...settings, ...newSettings };
    saveSettings(updated);
    addLog("Memperbarui Pengaturan Website", "Identitas & Konfigurasi");

    try {
      supabase.from("site_content").upsert({
        key: "site_settings",
        group_name: "settings",
        label: "Site Settings",
        value: updated,
        updated_at: new Date().toISOString()
      }, { onConflict: "key" }).then(({ error }) => {
        if (error) console.warn("Supabase site_settings save notice:", error.message);
      });
    } catch (e) {
      console.warn("DB notice:", e);
    }
  };

  // Export / Import Backup
  const exportBackupJson = () => {
    const fullBackup = {
      articles,
      categories,
      theses,
      submissions,
      news,
      settings,
      users,
      media,
      lecturers,
      facilities,
      accreditations,
      courses,
      calendarEvents,
      bahtsulQA,
      pmbWaves,
      pmbFAQs,
      subscribers,
      emailLogs,
      galleryAlbums,
      comingSoonPages,
      pageSeoList,
      footerSettings,
      footerNav,
      footerFocus,
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(fullBackup, null, 2);
  };

  const importBackupJson = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.articles) saveArticles(data.articles);
      if (data.categories) saveCategories(data.categories);
      if (data.theses) saveTheses(data.theses);
      if (data.submissions) saveSubmissions(data.submissions);
      if (data.news) saveNews(data.news);
      if (data.settings) saveSettings(data.settings);
      if (data.users) saveUsers(data.users);
      if (data.media) saveMedia(data.media);
      if (data.lecturers) saveLecturers(data.lecturers);
      if (data.facilities) saveFacilities(data.facilities);
      if (data.accreditations) saveAccreditations(data.accreditations);
      if (data.courses) saveCourses(data.courses);
      if (data.calendarEvents) saveCalendarEvents(data.calendarEvents);
      if (data.bahtsulQA) saveBahtsulQA(data.bahtsulQA);
      if (data.pmbWaves) savePmbWaves(data.pmbWaves);
      if (data.pmbFAQs) savePmbFAQs(data.pmbFAQs);
      if (data.subscribers) saveSubscribers(data.subscribers);
      if (data.emailLogs) saveEmailLogs(data.emailLogs);
      if (data.galleryAlbums) saveGalleryAlbums(data.galleryAlbums);
      if (data.comingSoonPages) saveComingSoonPages(data.comingSoonPages);
      if (data.pageSeoList) savePageSeoList(data.pageSeoList);
      if (data.footerSettings) saveFooterSettings(data.footerSettings);
      if (data.footerNav) saveFooterNav(data.footerNav);
      if (data.footerFocus) saveFooterFocus(data.footerFocus);
      addLog("Memulihkan Data Backup", "JSON Restore");
      return true;
    } catch (e) {
      console.error("Gagal mengimpor file backup:", e);
      return false;
    }
  };

  // Reset Data
  const resetAllData = () => {
    localStorage.clear();
    setArticles(INITIAL_ARTICLES);
    setCategories(INITIAL_CATEGORIES);
    setTheses(INITIAL_THESES);
    setSubmissions([]);
    setNews(INITIAL_NEWS);
    setSettings(INITIAL_SETTINGS);
    setUsers(INITIAL_ADMIN_USERS);
    setLogs(INITIAL_ACTIVITY_LOGS);
    setMedia(INITIAL_MEDIA);
    setLecturers(INITIAL_LECTURERS);
    setFacilities(INITIAL_FACILITIES);
    setAccreditations(INITIAL_ACCREDITATIONS);
    setCourses(INITIAL_COURSES);
    setCalendarEvents(INITIAL_CALENDAR);
    setBahtsulQA(INITIAL_BAHTSUL_QA);
    setPmbWaves(INITIAL_PMB_WAVES);
    setPmbFAQs(INITIAL_PMB_FAQS);
    setSubscribers(INITIAL_SUBSCRIBERS);
    setEmailLogs(INITIAL_EMAIL_LOGS);
    setGalleryAlbums(INITIAL_GALLERY_ALBUMS);
    setComingSoonPages(INITIAL_COMING_SOON_PAGES);
    setPageSeoList(INITIAL_PAGE_SEO);
    setFooterSettings(INITIAL_FOOTER_SETTINGS);
    setFooterNav(INITIAL_FOOTER_NAV);
    setFooterFocus(INITIAL_FOOTER_FOCUS);
    setNavbarSettings(INITIAL_NAVBAR_SETTINGS);
    setHeroSettings(INITIAL_HERO_SETTINGS);
    setHomeSections(INITIAL_HOME_SECTIONS);
    setEmailTemplates(INITIAL_EMAIL_TEMPLATES);
    setAboutPageContent(INITIAL_ABOUT_CONTENT);
  };

  // ══════════════════════════════════════════════════════════════
  // MODULAR RESET TO DEFAULT PER PANEL (PENCEGAH KETELEDORAN ADMIN)
  // ══════════════════════════════════════════════════════════════
  const resetNavbarToDefault = (user?: string) => {
    setNavbarSettings(INITIAL_NAVBAR_SETTINGS);
    localStorage.setItem("mahad_navbar_settings", JSON.stringify(INITIAL_NAVBAR_SETTINGS));
    addLog("Reset Header & Navbar ke Standar", "Header & Navbar", user);
    syncContentToBackend("header", "layout", "Header & Navbar Settings", INITIAL_NAVBAR_SETTINGS);
  };

  const resetHeroToDefault = (user?: string) => {
    setHeroSettings(INITIAL_HERO_SETTINGS);
    localStorage.setItem("mahad_hero_settings", JSON.stringify(INITIAL_HERO_SETTINGS));
    addLog("Reset Hero & Metrik ke Standar", "Hero Section", user);
    syncContentToBackend("home.hero", "home", "Hero Section Beranda", INITIAL_HERO_SETTINGS);
  };

  const resetHomeSectionsToDefault = (user?: string) => {
    setHomeSections(INITIAL_HOME_SECTIONS);
    localStorage.setItem("mahad_home_sections", JSON.stringify(INITIAL_HOME_SECTIONS));
    addLog("Reset Section Beranda ke Standar", "Layout Homepage", user);
    try { supabase.from("site_content").upsert({ key: "home_sections", value: INITIAL_HOME_SECTIONS }, { onConflict: "key" }).then(); } catch (e) {}
  };

  const resetAboutContentToDefault = (user?: string) => {
    setAboutPageContent(INITIAL_ABOUT_CONTENT);
    localStorage.setItem("mahad_about_content", JSON.stringify(INITIAL_ABOUT_CONTENT));
    addLog("Reset Halaman Tentang ke Standar", "Profil & Sejarah", user);
    try { supabase.from("site_content").upsert({ key: "about", value: INITIAL_ABOUT_CONTENT }, { onConflict: "key" }).then(); } catch (e) {}
  };

  const resetEmailTemplatesToDefault = (user?: string) => {
    setEmailTemplates(INITIAL_EMAIL_TEMPLATES);
    localStorage.setItem("mahad_email_templates", JSON.stringify(INITIAL_EMAIL_TEMPLATES));
    addLog("Reset Template Email ke Standar", "Template Notifikasi", user);
    try { supabase.from("site_content").upsert({ key: "email_templates", value: INITIAL_EMAIL_TEMPLATES }, { onConflict: "key" }).then(); } catch (e) {}
  };

  const resetProfileToDefault = (user?: string) => {
    const nextSettings: SiteSettings = {
      ...settings,
      institutionName: INITIAL_SETTINGS.institutionName,
      takhassus: INITIAL_SETTINGS.takhassus,
      focusField: INITIAL_SETTINGS.focusField,
      mudirName: INITIAL_SETTINGS.mudirName,
      establishedDate: INITIAL_SETTINGS.establishedDate,
      location: INITIAL_SETTINGS.location,
      address: INITIAL_SETTINGS.address,
      phone: INITIAL_SETTINGS.phone,
      visi: INITIAL_SETTINGS.visi,
      misi: INITIAL_SETTINGS.misi,
      historyContent: INITIAL_SETTINGS.historyContent,
      historyArabic: INITIAL_SETTINGS.historyArabic,
      gradingSystemRules: INITIAL_SETTINGS.gradingSystemRules,
      academicGuideBookUrl: INITIAL_SETTINGS.academicGuideBookUrl,
      academicGuideBookSize: INITIAL_SETTINGS.academicGuideBookSize,
      academicGuideBookYear: INITIAL_SETTINGS.academicGuideBookYear,
    };
    setSettings(nextSettings);
    localStorage.setItem("mahad_settings", JSON.stringify(nextSettings));
    addLog("Reset Profil Lembaga ke Standar", "Profil & Visi Misi", user);
    try { supabase.from("site_settings").upsert({ id: "main", ...nextSettings }, { onConflict: "id" }).then(); } catch (e) {}
  };

  const resetAcademicToDefault = (user?: string) => {
    saveCourses(INITIAL_COURSES);
    saveCalendarEvents(INITIAL_CALENDAR);
    addLog("Reset Akademik & Kurikulum ke Standar", "Kurikulum & Kalender", user);
  };

  const resetLecturersToDefault = (user?: string) => {
    saveLecturers(INITIAL_LECTURERS);
    addLog("Reset Daftar Masyayikh/Dosen ke Standar", "Dewan Pengampu", user);
  };

  const resetFacilitiesToDefault = (user?: string) => {
    saveFacilities(INITIAL_FACILITIES);
    addLog("Reset Sarana & Prasarana ke Standar", "Fasilitas Kampus", user);
  };

  const resetAccreditationsToDefault = (user?: string) => {
    saveAccreditations(INITIAL_ACCREDITATIONS);
    addLog("Reset Data Akreditasi ke Standar", "Sertifikasi", user);
  };

  const resetPublicationsToDefault = (user?: string) => {
    saveArticles(INITIAL_ARTICLES);
    saveCategories(INITIAL_CATEGORIES);
    saveTheses(INITIAL_THESES);
    addLog("Reset Publikasi Fiqh & Skripsi ke Standar", "Artikel, Kategori, & Skripsi", user);
  };

  const resetQuoteToDefault = (user?: string) => {
    const next = { ...settings, quote: INITIAL_SETTINGS.quote };
    setSettings(next);
    localStorage.setItem("mahad_settings", JSON.stringify(next));
    addLog("Reset Kalam Hikmah ke Standar", "Kata Mutiara Anregurutta", user);
    try { supabase.from("site_settings").upsert({ id: "main", ...next }, { onConflict: "id" }).then(); } catch (e) {}
  };

  const resetBahtsulToDefault = (user?: string) => {
    saveBahtsulQA(INITIAL_BAHTSUL_QA);
    addLog("Reset Bahtsul Masail ke Standar", "Risalah Fatwa & QA", user);
  };

  const resetPMBToDefault = (user?: string) => {
    savePmbWaves(INITIAL_PMB_WAVES);
    savePmbFAQs(INITIAL_PMB_FAQS);
    addLog("Reset PMB Online ke Standar", "Gelombang & FAQ PMB", user);
  };

  const resetNewsAndGalleryToDefault = (user?: string) => {
    saveNews(INITIAL_NEWS);
    saveGalleryAlbums(INITIAL_GALLERY_ALBUMS);
    addLog("Reset Warta & Galeri ke Standar", "Berita & Dokumentasi", user);
  };

  const resetComingSoonToDefault = (user?: string) => {
    saveComingSoonPages(INITIAL_COMING_SOON_PAGES);
    addLog("Reset Coming Soon ke Standar", "Placeholder Manager", user);
  };

  const resetSeoToDefault = (user?: string) => {
    savePageSeoList(INITIAL_PAGE_SEO);
    const next = { ...settings, seo: INITIAL_SETTINGS.seo };
    setSettings(next);
    localStorage.setItem("mahad_settings", JSON.stringify(next));
    addLog("Reset Pengaturan SEO ke Standar", "SEO & Meta Tags", user);
    try { supabase.from("site_settings").upsert({ id: "main", ...next }, { onConflict: "id" }).then(); } catch (e) {}
  };

  const resetPageTextsToDefault = (user?: string) => {
    setPageTexts(INITIAL_PAGE_TEXTS);
    localStorage.setItem("mahad_page_texts", JSON.stringify(INITIAL_PAGE_TEXTS));
    addLog("Reset Teks Halaman ke Standar", "CMS Teks Publik", user);
    try { supabase.from("site_content").upsert({ key: "page_texts", value: INITIAL_PAGE_TEXTS }, { onConflict: "key" }).then(); } catch (e) {}
  };

  const resetSettingsToDefault = (user?: string) => {
    setSettings(INITIAL_SETTINGS);
    localStorage.setItem("mahad_settings", JSON.stringify(INITIAL_SETTINGS));
    addLog("Reset Seluruh Pengaturan Web ke Standar", "Konfigurasi Global", user);
    try { supabase.from("site_settings").upsert({ id: "main", ...INITIAL_SETTINGS }, { onConflict: "id" }).then(); } catch (e) {}
  };

  const syncContentToBackend = (key: string, group: string, label: string, value: any) => {
    try {
      fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, group_name: group, label, value })
      }).catch((err) => console.warn("Backend sync notice:", err));
    } catch (e) {
      console.warn("DB notice:", e);
    }
  };

  const updateNavbarSettings = (updated: Partial<NavbarSettings>) => {
    const next = { ...navbarSettings, ...updated };
    setNavbarSettings(next);
    localStorage.setItem("mahad_navbar_settings", JSON.stringify(next));
    addLog("Memperbarui Header & Navbar", "Pengaturan Header");
    syncContentToBackend("header", "layout", "Header & Navbar Settings", next);
  };

  const updateHeroSettings = (updated: Partial<HeroSectionSettings>) => {
    const next = { ...heroSettings, ...updated };
    setHeroSettings(next);
    localStorage.setItem("mahad_hero_settings", JSON.stringify(next));
    addLog("Memperbarui Hero Section", "Banner Utama");
    syncContentToBackend("home.hero", "home", "Hero Section Beranda", next);
  };

  const updateHomeSections = (updated: HomeSectionConfigItem[]) => {
    setHomeSections(updated);
    localStorage.setItem("mahad_home_sections", JSON.stringify(updated));
    addLog("Memperbarui Urutan & Visibilitas Beranda", "Section Homepage");
    syncContentToBackend("home_sections", "home", "Pengaturan Urutan Section Beranda", updated);
  };

  const updateEmailTemplates = (updated: EmailTemplateItem[]) => {
    setEmailTemplates(updated);
    localStorage.setItem("mahad_email_templates", JSON.stringify(updated));
    addLog("Memperbarui Template Email", "Notifikasi Resend");
    syncContentToBackend("email_templates", "notifications", "Template Email Resend", updated);
  };

  const updateAboutPageContent = (updated: Partial<AboutPageContent>) => {
    const next = { ...aboutPageContent, ...updated };
    setAboutPageContent(next);
    localStorage.setItem("mahad_about_page_content", JSON.stringify(next));
    addLog("Memperbarui Narasi Halaman Tentang", "Profil & Sejarah");
    syncContentToBackend("about_page", "profile", "Konten Halaman Tentang & Pendidikan", next);
  };

  const updatePageTexts = (updated: Partial<PageTextsSettings>) => {
    const next = { ...pageTexts, ...updated };
    setPageTexts(next);
    localStorage.setItem("mahad_page_texts", JSON.stringify(next));
    addLog("Memperbarui Narasi Teks Halaman Publik", "CMS Halaman");
    syncContentToBackend("page_texts", "content", "Page Texts CMS", next);
  };

  // ── Donasi, Wakaf & Infaq Actions ──
  const addDonation = (item: Omit<DonationProgram, "id" | "createdAt">, user: string = "Super Admin") => {
    const slugBase = item.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    const newDonation: DonationProgram = {
      ...item,
      id: "don-" + Date.now().toString(),
      slug: `${slugBase}-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString().slice(0, 10)
    };
    const updated = [newDonation, ...donations];
    saveDonations(updated);
    addLog("Menambah Program Donasi Baru", item.title, user);
    try {
      supabase.from("site_content").upsert({ key: "donations", value: updated }, { onConflict: "key" }).then();
    } catch (e) {}
  };

  const updateDonation = (id: string, updatedData: Partial<DonationProgram>, user: string = "Super Admin") => {
    const updated = donations.map((d) => (d.id === id ? { ...d, ...updatedData } : d));
    saveDonations(updated);
    const target = updated.find((d) => d.id === id);
    addLog("Memperbarui Program Donasi", target?.title || id, user);
    try {
      supabase.from("site_content").upsert({ key: "donations", value: updated }, { onConflict: "key" }).then();
    } catch (e) {}
  };

  const deleteDonation = (id: string, user: string = "Super Admin") => {
    const target = donations.find((d) => d.id === id);
    const updated = donations.filter((d) => d.id !== id);
    saveDonations(updated);
    addLog("Menghapus Program Donasi", target?.title || id, user);
    try {
      supabase.from("site_content").upsert({ key: "donations", value: updated }, { onConflict: "key" }).then();
    } catch (e) {}
  };

  const resetDonationsToDefault = (user?: string) => {
    saveDonations(INITIAL_DONATIONS);
    addLog("Reset Program Donasi ke Standar", "Modul Donasi & Rekening", user);
    try {
      supabase.from("site_content").upsert({ key: "donations", value: INITIAL_DONATIONS }, { onConflict: "key" }).then();
    } catch (e) {}
  };

  // ── Pertahanan Keamanan & Deteksi Ancaman ──
  const addSecurityThreat = (threat: Omit<SecurityThreatLog, "id" | "timestamp">) => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
    const formattedTime = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WITA";
    const newThreat: SecurityThreatLog = {
      ...threat,
      id: "threat-" + Date.now().toString(),
      timestamp: `${formattedDate}, ${formattedTime}`
    };
    const updated = [newThreat, ...securityThreats.slice(0, 99)];
    saveSecurityThreats(updated);
    addLog(`🚨 Ancaman Keamanan (${threat.threatType})`, `${threat.endpoint} [IP: ${threat.ip}]`, "Sistem Pertahanan Web");
  };

  const clearSecurityThreats = (user?: string) => {
    saveSecurityThreats([]);
    addLog("Membersihkan Log Ancaman Keamanan", "Pusat Keamanan", user);
  };

  // ── Izin Khusus Kelola Donasi ──
  const grantDonationPermission = (userId: string, granted: boolean, adminName: string = "Super Admin") => {
    const updatedUsers = users.map((u) => {
      if (u.id === userId) {
        return {
          ...u,
          permissions: {
            ...u.permissions,
            canManageDonations: granted
          }
        };
      }
      return u;
    });
    saveUsers(updatedUsers);
    const targetUser = users.find((u) => u.id === userId);
    addLog(
      granted ? "Memberikan Izin Akses Donasi" : "Mencabut Izin Akses Donasi",
      targetUser?.name || targetUser?.email || userId,
      adminName
    );
  };

  return (
    <DataContext.Provider
      value={{
        articles,
        addArticle,
        updateArticle,
        deleteArticle,
        incrementArticleViews,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        theses,
        addThesis,
        updateThesis,
        deleteThesis,
        submissions,
        addSubmission,
        updateSubmissionStatus,
        saveSubmissionFullPaper,
        deleteSubmission,
        publishSubmissionAsArticle,
        publishSubmissionAsThesis,
        news,
        addNews,
        updateNews,
        deleteNews,
        users,
        addUser,
        updateUser,
        deleteUser,
        logs,
        addLog,
        media,
        addMedia,
        deleteMedia,
        lecturers,
        addLecturer,
        updateLecturer,
        deleteLecturer,
        facilities,
        addFacility,
        updateFacility,
        deleteFacility,
        accreditations,
        addAccreditation,
        updateAccreditation,
        deleteAccreditation,
        courses,
        addCourse,
        updateCourse,
        deleteCourse,
        calendarEvents,
        addCalendarEvent,
        updateCalendarEvent,
        deleteCalendarEvent,
        bahtsulQA,
        addBahtsulQA,
        updateBahtsulQA,
        deleteBahtsulQA,
        pmbWaves,
        addPMBWave,
        updatePMBWave,
        deletePMBWave,
        pmbFAQs,
        addPMBFAQ,
        updatePMBFAQ,
        deletePMBFAQ,
        subscribers,
        addSubscriber,
        deleteSubscriber,
        emailLogs,
        sendEmailNotification,
        retryEmailSend,
        galleryAlbums,
        addGalleryAlbum,
        updateGalleryAlbum,
        deleteGalleryAlbum,
        comingSoonPages,
        toggleComingSoonPage,
        updateComingSoonPage,
        pageSeoList,
        updatePageSeo,
        footerSettings,
        updateFooterSettings,
        footerNav,
        addFooterNav,
        updateFooterNav,
        deleteFooterNav,
        footerFocus,
        addFooterFocus,
        updateFooterFocus,
        deleteFooterFocus,
        resetFooterToDefault,
        navbarSettings,
        updateNavbarSettings,
        heroSettings,
        updateHeroSettings,
        homeSections,
        updateHomeSections,
        emailTemplates,
        updateEmailTemplates,
        aboutPageContent,
        updateAboutPageContent,
        pageTexts,
        updatePageTexts,
        settings,
        updateSettings,
        exportBackupJson,
        importBackupJson,
        resetAllData,
        resetNavbarToDefault,
        resetHeroToDefault,
        resetHomeSectionsToDefault,
        resetAboutContentToDefault,
        resetEmailTemplatesToDefault,
        resetProfileToDefault,
        resetAcademicToDefault,
        resetLecturersToDefault,
        resetFacilitiesToDefault,
        resetAccreditationsToDefault,
        resetPublicationsToDefault,
        resetQuoteToDefault,
        resetBahtsulToDefault,
        resetPMBToDefault,
        resetNewsAndGalleryToDefault,
        resetComingSoonToDefault,
        resetSeoToDefault,
        resetPageTextsToDefault,
        resetSettingsToDefault,
        clearActivityLogs,
        donations,
        addDonation,
        updateDonation,
        deleteDonation,
        resetDonationsToDefault,
        securityThreats,
        addSecurityThreat,
        clearSecurityThreats,
        grantDonationPermission
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useArticles() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useArticles harus digunakan di dalam ArticleProvider");
  }
  return context;
}
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
  FooterFocusItem
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
  INITIAL_FOOTER_FOCUS
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
  updateSubmissionStatus: (id: string, status: Submission["status"], reviewNote?: string) => void;
  deleteSubmission: (id: string) => void;

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

  // Email Logs & Send Simulation
  emailLogs: EmailLog[];
  sendEmailNotification: (to: string, subject: string) => void;

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

  // Site Settings
  settings: SiteSettings;
  updateSettings: (newSettings: Partial<SiteSettings>) => void;

  // Backup & Reset
  exportBackupJson: () => string;
  importBackupJson: (jsonString: string) => boolean;
  resetAllData: () => void;
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
            dbCategories.map((c: any) => ({
              id: c.id,
              slug: c.slug,
              name: c.nama,
              description: c.deskripsi || "",
              iconName: c.icon || "book"
            }))
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
              education: c.data?.education || "",
              publications: c.data?.publications || "",
              order: idx + 1,
              isActive: c.data?.isActive !== false
            }));
          if (dbLecturers.length > 0) setLecturers(dbLecturers);
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

  const addLog = (action: string, target: string, user: string = "Super Admin") => {
    const newLog: ActivityLog = {
      id: "log-" + Date.now().toString(),
      user,
      action,
      target,
      timestamp: "Baru saja"
    };
    saveLogs([newLog, ...logs.slice(0, 19)]);
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
      views: 0
    };
    saveArticles([newArticle, ...articles]);
    addLog("Menerbitkan Artikel", data.title);
  };

  const updateArticle = (id: string, updatedData: Partial<Article>) => {
    const updated = articles.map((a) => (a.id === id ? { ...a, ...updatedData } : a));
    saveArticles(updated);
    addLog("Memperbarui Artikel", updatedData.title || id);
  };

  const deleteArticle = (id: string) => {
    const target = articles.find((a) => a.id === id);
    const filtered = articles.filter((a) => a.id !== id);
    saveArticles(filtered);
    addLog("Menghapus Artikel", target?.title || id);
  };

  const incrementArticleViews = (slug: string) => {
    const updated = articles.map((a) =>
      a.slug === slug ? { ...a, views: (a.views || 0) + 1 } : a
    );
    saveArticles(updated);
  };

  // Category Actions
  const addCategory = (data: Omit<CategoryInfo, "id" | "slug">) => {
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    const newCat: CategoryInfo = {
      ...data,
      id: "cat-" + Date.now().toString(),
      slug: `${slug}-${Date.now().toString().slice(-3)}`
    };
    saveCategories([...categories, newCat]);
    addLog("Menambah Kategori", data.name);
  };

  const updateCategory = (id: string, updatedData: Partial<CategoryInfo>) => {
    const updated = categories.map((c) => (c.id === id ? { ...c, ...updatedData } : c));
    saveCategories(updated);
    addLog("Memperbarui Kategori", updatedData.name || id);
  };

  const deleteCategory = (id: string) => {
    const target = categories.find((c) => c.id === id);
    const filtered = categories.filter((c) => c.id !== id);
    saveCategories(filtered);
    addLog("Menghapus Kategori", target?.name || id);
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
  };

  const updateThesis = (id: string, updatedData: Partial<Thesis>) => {
    const updated = theses.map((t) => (t.id === id ? { ...t, ...updatedData } : t));
    saveTheses(updated);
    addLog("Memperbarui Skripsi", updatedData.title || id);
  };

  const deleteThesis = (id: string) => {
    const target = theses.find((t) => t.id === id);
    const filtered = theses.filter((t) => t.id !== id);
    saveTheses(filtered);
    addLog("Menghapus Skripsi", target?.title || id);
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

  const updateSubmissionStatus = (id: string, status: Submission["status"], reviewNote?: string) => {
    const updated = submissions.map((s) =>
      s.id === id ? { ...s, status, reviewNote: reviewNote ?? s.reviewNote } : s
    );
    saveSubmissions(updated);
    const target = submissions.find((s) => s.id === id);
    addLog(`Ubah Status Naskah (${status})`, target?.judul || id);
  };

  const deleteSubmission = (id: string) => {
    const target = submissions.find((s) => s.id === id);
    const filtered = submissions.filter((s) => s.id !== id);
    saveSubmissions(filtered);
    addLog("Menghapus Submission", target?.judul || id);
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
  };

  const updateNews = (id: string, updatedData: Partial<NewsItem>) => {
    const updated = news.map((n) => (n.id === id ? { ...n, ...updatedData } : n));
    saveNews(updated);
    addLog("Memperbarui Berita", updatedData.title || id);
  };

  const deleteNews = (id: string) => {
    const target = news.find((n) => n.id === id);
    const filtered = news.filter((n) => n.id !== id);
    saveNews(filtered);
    addLog("Menghapus Berita", target?.title || id);
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
  };
  const updateLecturer = (id: string, updatedData: Partial<Lecturer>) => {
    const updated = lecturers.map((l) => (l.id === id ? { ...l, ...updatedData } : l));
    saveLecturers(updated);
    addLog("Memperbarui Dosen", updatedData.name || id);
  };
  const deleteLecturer = (id: string) => {
    const target = lecturers.find((l) => l.id === id);
    saveLecturers(lecturers.filter((l) => l.id !== id));
    addLog("Menghapus Dosen", target?.name || id);
  };

  // Facility Actions
  const addFacility = (data: Omit<Facility, "id">) => {
    const newFac: Facility = { ...data, id: "fac-" + Date.now().toString() };
    saveFacilities([...facilities, newFac]);
    addLog("Menambah Sarana", data.name);
  };
  const updateFacility = (id: string, updatedData: Partial<Facility>) => {
    const updated = facilities.map((f) => (f.id === id ? { ...f, ...updatedData } : f));
    saveFacilities(updated);
    addLog("Memperbarui Sarana", updatedData.name || id);
  };
  const deleteFacility = (id: string) => {
    const target = facilities.find((f) => f.id === id);
    saveFacilities(facilities.filter((f) => f.id !== id));
    addLog("Menghapus Sarana", target?.name || id);
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

  // Email Notification Simulator
  const sendEmailNotification = (to: string, subject: string) => {
    const newLog: EmailLog = {
      id: "elog-" + Date.now().toString(),
      to,
      subject,
      status: "Terkirim",
      timestamp: new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
      })
    };
    saveEmailLogs([newLog, ...emailLogs]);
    addLog("Kirim Email Notifikasi", subject);
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
  };

  // Site Settings Action
  const updateSettings = (newSettings: Partial<SiteSettings>) => {
    const updated = { ...settings, ...newSettings };
    saveSettings(updated);
    addLog("Memperbarui Pengaturan Website", "Identitas & Konfigurasi");
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
        deleteSubmission,
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
        settings,
        updateSettings,
        exportBackupJson,
        importBackupJson,
        resetAllData
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
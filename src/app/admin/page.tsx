"use client";

import { useState } from "react";
import Link from "next/link";
import { useArticles } from "@/context/ArticleContext";
import {
  Article,
  CategoryInfo,
  Thesis,
  NewsItem,
  AdminUser,
  MediaItem,
  SiteSettings
} from "@/lib/types";

export default function AdminPage() {
  const {
    articles,
    addArticle,
    updateArticle,
    deleteArticle,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    theses,
    addThesis,
    updateThesis,
    deleteThesis,
    submissions,
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
    settings,
    updateSettings,
    exportBackupJson,
    importBackupJson,
    resetAllData
  } = useArticles();

  // Authentication PIN
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  // Navigation State
  const [activeMenu, setActiveMenu] = useState<
    | "dashboard"
    | "content"
    | "publications"
    | "information"
    | "submissions"
    | "users"
    | "media"
    | "seo"
    | "settings"
  >("dashboard");

  const [activeSubMenu, setActiveSubMenu] = useState<string>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Article Form State
  const [isEditingArticle, setIsEditingArticle] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [articleForm, setArticleForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    author: "",
    authorRole: "Mahasantri Marhalah Ula",
    authorBio: "",
    category: categories[0]?.slug || "fiqh-muamalah-kontemporer",
    categoryLabel: categories[0]?.name || "Fiqh Muamalah Kontemporer",
    date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
    hijriDate: "1448 H",
    readTime: "5 menit",
    isSpecial: false,
    tags: "",
    arabicSnippet: ""
  });

  // Category Form State
  const [isEditingCat, setIsEditingCat] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catForm, setCatForm] = useState({
    name: "",
    description: "",
    iconName: "book"
  });

  // Thesis Form State
  const [isEditingThesis, setIsEditingThesis] = useState(false);
  const [editingThesisId, setEditingThesisId] = useState<string | null>(null);
  const [thesisForm, setThesisForm] = useState({
    title: "",
    author: "",
    nim: "",
    angkatan: "Angkatan VIII (2022)",
    year: "2026",
    advisor1: "AGH. Prof. Dr. M. Faried Wadjedy, MA",
    advisor2: "Ust. M. Idrus, M.Ag.",
    abstractId: "",
    abstractAr: "",
    keywords: "",
    category: categories[0]?.name || "Fiqh Muamalah Kontemporer",
    categoryLabel: categories[0]?.name || "Fiqh Muamalah Kontemporer",
    downloadUrl: "",
    fileSize: "3.5 MB"
  });

  // News Form State
  const [isEditingNews, setIsEditingNews] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [newsForm, setNewsForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "Berita" as "Berita" | "Pengumuman" | "Agenda",
    author: "Humas Ma'had Aly",
    date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
  });

  // User Form State
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    role: "Editor" as "Super Admin" | "Editor" | "Penulis",
    status: "Aktif" as "Aktif" | "Nonaktif"
  });

  // Media Upload State
  const [mediaForm, setMediaForm] = useState({
    name: "",
    url: "",
    size: "1.5 MB",
    type: "image" as "image" | "pdf" | "document"
  });

  // Settings State Form
  const [settingsForm, setSettingsForm] = useState<SiteSettings>(settings);

  // Backup Import State
  const [importJsonText, setImportJsonText] = useState("");

  // Submissions count with status 'review'
  const pendingSubmissionsCount = submissions.filter((s) => s.status === "review").length;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === "1234" || pinInput === "admin") {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  // Article Submit
  const handleSaveArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleForm.title || !articleForm.content || !articleForm.author) {
      alert("Mohon isi judul, penulis, dan isi artikel!");
      return;
    }

    const payload = {
      ...articleForm,
      tags: articleForm.tags ? articleForm.tags.split(",").map((t) => t.trim()) : []
    };

    if (isEditingArticle && editingArticleId) {
      updateArticle(editingArticleId, payload);
      alert("Artikel berhasil diperbarui!");
    } else {
      addArticle(payload);
      alert("Artikel baru berhasil diterbitkan!");
    }

    setIsEditingArticle(false);
    setEditingArticleId(null);
    setArticleForm({
      title: "",
      excerpt: "",
      content: "",
      author: "",
      authorRole: "Mahasantri Marhalah Ula",
      authorBio: "",
      category: categories[0]?.slug || "fiqh-muamalah-kontemporer",
      categoryLabel: categories[0]?.name || "Fiqh Muamalah Kontemporer",
      date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
      hijriDate: "1448 H",
      readTime: "5 menit",
      isSpecial: false,
      tags: "",
      arabicSnippet: ""
    });
  };

  // Category Submit
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.name) {
      alert("Nama kategori wajib diisi!");
      return;
    }

    if (isEditingCat && editingCatId) {
      updateCategory(editingCatId, catForm);
      alert("Kategori berhasil diperbarui!");
    } else {
      addCategory(catForm);
      alert("Kategori baru berhasil ditambahkan!");
    }

    setIsEditingCat(false);
    setEditingCatId(null);
    setCatForm({ name: "", description: "", iconName: "book" });
  };

  // Thesis Submit
  const handleSaveThesis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!thesisForm.title || !thesisForm.author || !thesisForm.downloadUrl) {
      alert("Mohon lengkapi judul, penulis, dan tautan Google Drive PDF!");
      return;
    }

    const payload = {
      ...thesisForm,
      keywords: thesisForm.keywords ? thesisForm.keywords.split(",").map((k) => k.trim()) : []
    };

    if (isEditingThesis && editingThesisId) {
      updateThesis(editingThesisId, payload);
      alert("Data skripsi berhasil diperbarui!");
    } else {
      addThesis(payload);
      alert("Skripsi berhasil dimasukkan ke Repositori!");
    }

    setIsEditingThesis(false);
    setEditingThesisId(null);
    setThesisForm({
      title: "",
      author: "",
      nim: "",
      angkatan: "Angkatan VIII (2022)",
      year: "2026",
      advisor1: "AGH. Prof. Dr. M. Faried Wadjedy, MA",
      advisor2: "Ust. M. Idrus, M.Ag.",
      abstractId: "",
      abstractAr: "",
      keywords: "",
      category: categories[0]?.name || "Fiqh Muamalah Kontemporer",
      categoryLabel: categories[0]?.name || "Fiqh Muamalah Kontemporer",
      downloadUrl: "",
      fileSize: "3.5 MB"
    });
  };

  // News Submit
  const handleSaveNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsForm.title || !newsForm.content) {
      alert("Mohon isi judul dan isi warta!");
      return;
    }

    if (isEditingNews && editingNewsId) {
      updateNews(editingNewsId, newsForm);
      alert("Warta berhasil diperbarui!");
    } else {
      addNews(newsForm);
      alert("Warta baru berhasil diterbitkan!");
    }

    setIsEditingNews(false);
    setEditingNewsId(null);
    setNewsForm({
      title: "",
      excerpt: "",
      content: "",
      category: "Berita",
      author: "Humas Ma'had Aly",
      date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    });
  };

  // User Submit
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.name || !userForm.email) {
      alert("Nama dan email admin wajib diisi!");
      return;
    }

    if (isEditingUser && editingUserId) {
      updateUser(editingUserId, userForm);
      alert("Data pengguna diperbarui!");
    } else {
      addUser({ ...userForm, lastLogin: "Belum pernah" });
      alert("Pengguna baru berhasil ditambahkan!");
    }

    setIsEditingUser(false);
    setEditingUserId(null);
    setUserForm({ name: "", email: "", role: "Editor", status: "Aktif" });
  };

  // Media Submit
  const handleSaveMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaForm.name || !mediaForm.url) {
      alert("Nama file dan URL media wajib diisi!");
      return;
    }
    addMedia(mediaForm);
    alert("Media berhasil ditambahkan ke Library!");
    setMediaForm({ name: "", url: "", size: "1.5 MB", type: "image" });
  };

  // Settings Submit
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(settingsForm);
    alert("Pengaturan website berhasil disimpan!");
  };

  // JSON Backup Export / Import
  const handleDownloadBackup = () => {
    const jsonStr = exportBackupJson();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup-mahad-aly-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRestoreBackup = () => {
    if (!importJsonText.trim()) {
      alert("Tempelkan teks JSON backup terlebih dahulu!");
      return;
    }
    const success = importBackupJson(importJsonText);
    if (success) {
      alert("Data berhasil dipulihkan dari backup!");
      setImportJsonText("");
    } else {
      alert("Format JSON tidak valid!");
    }
  };

  // 1. PIN Lock Screen
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen pt-28 pb-16 bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-mahad-gold text-mahad-green-dark rounded-full flex items-center justify-center mx-auto text-2xl font-bold shadow-lg">
            🔒
          </div>
          <div>
            <h1 className="font-serif font-bold text-2xl text-white">Super Admin Panel</h1>
            <p className="text-slate-400 text-xs mt-1">
              Ma&apos;had Aly DDI Mangkoso &bull; Fiqh Mu&apos;asarah
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Masukkan PIN Admin (Default: 1234)"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full text-center tracking-widest text-lg px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-mahad-gold text-white placeholder:text-slate-600"
              />
              {pinError && <p className="text-xs text-red-400 mt-2">PIN salah! Coba ketik: 1234</p>}
            </div>
            <button
              type="submit"
              className="w-full bg-mahad-gold hover:bg-yellow-400 text-mahad-green-dark font-bold py-3 rounded-xl shadow transition"
            >
              Masuk ke Panel Kendali
            </button>
          </form>
          <p className="text-[11px] text-slate-500">
            PIN default awal: <strong className="text-slate-300">1234</strong>
          </p>
        </div>
      </main>
    );
  }

  // 2. Full Admin Dashboard Layout
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row pt-20">
      
      {/* 📐 A. SIDEBAR NAVIGATION */}
      <aside
        className={`${
          sidebarOpen ? "w-full md:w-64" : "hidden md:block md:w-20"
        } bg-slate-900 text-white shrink-0 border-r border-slate-800 transition-all duration-300 flex flex-col justify-between`}
      >
        <div className="p-4 space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-mahad-gold text-mahad-green-dark flex items-center justify-center font-bold font-serif text-lg shrink-0 shadow">
                🕌
              </div>
              {sidebarOpen && (
                <div>
                  <h2 className="font-serif font-bold text-sm text-white leading-tight">
                    Ma&apos;had Aly DDI
                  </h2>
                  <p className="text-[10px] text-mahad-gold uppercase tracking-wider">Panel Admin v1.0</p>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:block p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs"
              title="Toggle Sidebar"
            >
              {sidebarOpen ? "◀" : "▶"}
            </button>
          </div>

          {/* Navigation Menu List */}
          <nav className="space-y-1.5 text-xs font-medium">
            {/* 1. Dashboard */}
            <button
              type="button"
              onClick={() => {
                setActiveMenu("dashboard");
                setActiveSubMenu("overview");
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition ${
                activeMenu === "dashboard"
                  ? "bg-emerald-800 text-white font-bold shadow"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">📊</span>
                {sidebarOpen && <span>Dashboard</span>}
              </div>
            </button>

            {/* 2. Konten Website */}
            <button
              type="button"
              onClick={() => {
                setActiveMenu("content");
                setActiveSubMenu("hero");
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition ${
                activeMenu === "content"
                  ? "bg-emerald-800 text-white font-bold shadow"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">🎨</span>
                {sidebarOpen && <span>Konten Website</span>}
              </div>
            </button>

            {/* 3. Publikasi */}
            <button
              type="button"
              onClick={() => {
                setActiveMenu("publications");
                setActiveSubMenu("articles");
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition ${
                activeMenu === "publications"
                  ? "bg-emerald-800 text-white font-bold shadow"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">📚</span>
                {sidebarOpen && <span>Publikasi</span>}
              </div>
              {sidebarOpen && (
                <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                  {articles.length + theses.length}
                </span>
              )}
            </button>

            {/* 4. Informasi */}
            <button
              type="button"
              onClick={() => {
                setActiveMenu("information");
                setActiveSubMenu("news");
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition ${
                activeMenu === "information"
                  ? "bg-emerald-800 text-white font-bold shadow"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">📰</span>
                {sidebarOpen && <span>Informasi &amp; Berita</span>}
              </div>
            </button>

            {/* 5. Submission */}
            <button
              type="button"
              onClick={() => {
                setActiveMenu("submissions");
                setActiveSubMenu("queue");
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition ${
                activeMenu === "submissions"
                  ? "bg-emerald-800 text-white font-bold shadow"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">📥</span>
                {sidebarOpen && <span>Submission</span>}
              </div>
              {pendingSubmissionsCount > 0 && (
                <span className="bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded-full text-[10px] animate-pulse">
                  {pendingSubmissionsCount}
                </span>
              )}
            </button>

            {/* 6. User & Role */}
            <button
              type="button"
              onClick={() => {
                setActiveMenu("users");
                setActiveSubMenu("list");
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition ${
                activeMenu === "users"
                  ? "bg-emerald-800 text-white font-bold shadow"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">👥</span>
                {sidebarOpen && <span>User &amp; Peran</span>}
              </div>
            </button>

            {/* 7. Media Library */}
            <button
              type="button"
              onClick={() => {
                setActiveMenu("media");
                setActiveSubMenu("library");
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition ${
                activeMenu === "media"
                  ? "bg-emerald-800 text-white font-bold shadow"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">🖼️</span>
                {sidebarOpen && <span>Media Library</span>}
              </div>
            </button>

            {/* 8. SEO & Meta */}
            <button
              type="button"
              onClick={() => {
                setActiveMenu("seo");
                setActiveSubMenu("meta");
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition ${
                activeMenu === "seo"
                  ? "bg-emerald-800 text-white font-bold shadow"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">🔍</span>
                {sidebarOpen && <span>SEO &amp; Meta</span>}
              </div>
            </button>

            {/* 9. Pengaturan */}
            <button
              type="button"
              onClick={() => {
                setActiveMenu("settings");
                setActiveSubMenu("general");
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition ${
                activeMenu === "settings"
                  ? "bg-emerald-800 text-white font-bold shadow"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">⚙️</span>
                {sidebarOpen && <span>Pengaturan</span>}
              </div>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Quick Links */}
        <div className="p-4 border-t border-slate-800 space-y-2 text-xs">
          <Link
            href="/"
            target="_blank"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 transition"
          >
            <span>🌐</span>
            {sidebarOpen && <span>Buka Website Live</span>}
          </Link>
          <button
            type="button"
            onClick={() => setIsAuthenticated(false)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-300 transition"
          >
            <span>🚪</span>
            {sidebarOpen && <span>Kunci &amp; Keluar</span>}
          </button>
        </div>
      </aside>

      {/* 📊 MAIN CONTENT PANEL */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-7xl">
        
        {/* Top Header Breadcrumb Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold uppercase tracking-wider">
              <span>Admin</span>
              <span>&rsaquo;</span>
              <span className="text-emerald-800 font-bold">{activeMenu}</span>
              <span>&rsaquo;</span>
              <span className="text-slate-700">{activeSubMenu}</span>
            </div>
            <h1 className="font-serif font-bold text-xl sm:text-2xl text-slate-900 mt-1 capitalize">
              {activeMenu === "dashboard" && "Pusat Kendali & Statistik"}
              {activeMenu === "content" && "Kustomisasi Tampilan & Konten Website"}
              {activeMenu === "publications" && "Manajemen Publikasi Fiqh & Skripsi"}
              {activeMenu === "information" && "Warta Berita, Agenda & Galeri"}
              {activeMenu === "submissions" && "Verifikasi & Penerbitan Naskah Masuk"}
              {activeMenu === "users" && "Manajemen Pengguna & Hak Akses"}
              {activeMenu === "media" && "Penyimpanan Media & Berkas"}
              {activeMenu === "seo" && "Optimasi Mesin Pencari & Metadata"}
              {activeMenu === "settings" && "Konfigurasi Sistem & Cadangan Data"}
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
              Admin Aktif
            </span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            1. TAB: DASHBOARD
           ══════════════════════════════════════════════════════════════ */}
        {activeMenu === "dashboard" && (
          <div className="space-y-6">
            {/* 4 Kartu Statistik */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-xs text-slate-400 font-bold uppercase">Artikel Terbit</span>
                <p className="font-serif font-bold text-3xl text-emerald-900">{articles.length}</p>
                <p className="text-[11px] text-emerald-700 font-medium">✓ 100% Siap Dibaca</p>
              </div>
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-xs text-slate-400 font-bold uppercase">Kategori Fiqh</span>
                <p className="font-serif font-bold text-3xl text-mahad-gold">{categories.length}</p>
                <p className="text-[11px] text-slate-500 font-medium">Fiqh Mu&apos;asarah &amp; Turats</p>
              </div>
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-xs text-slate-400 font-bold uppercase">Repositori Skripsi</span>
                <p className="font-serif font-bold text-3xl text-emerald-900">{theses.length}</p>
                <p className="text-[11px] text-slate-500 font-medium">Link Google Drive Aktif</p>
              </div>
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-xs text-slate-400 font-bold uppercase">Naskah Butuh Review</span>
                <p className="font-serif font-bold text-3xl text-amber-600">{pendingSubmissionsCount}</p>
                <p className="text-[11px] text-amber-700 font-medium">Dari Form Kirim Tulisan</p>
              </div>
            </div>

            {/* Mock Chart Pengunjung & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-2 border-b">
                  <h3 className="font-serif font-bold text-base text-slate-900">
                    📈 Tren Pembaca Website (30 Hari Terakhir)
                  </h3>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg">
                    Total: 12.480 Tayangan
                  </span>
                </div>
                {/* Bar Chart Visualizer */}
                <div className="h-44 flex items-end justify-between gap-1 sm:gap-2 pt-6 px-2">
                  {[35, 45, 60, 50, 75, 90, 65, 80, 110, 95, 120, 140, 130, 160, 175].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                      <div
                        style={{ height: `${h}px` }}
                        className="w-full bg-emerald-700 group-hover:bg-mahad-gold rounded-t transition-all duration-200"
                        title={`Hari ke-${i + 1}: ${h * 8} Pembaca`}
                      ></div>
                      <span className="text-[9px] text-slate-400">{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Aksi Cepat / Shortcut */}
              <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h3 className="font-serif font-bold text-base text-slate-900 pb-2 border-b">
                  ⚡ Pintasan Aksi
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu("publications");
                    setActiveSubMenu("articles");
                    setIsEditingArticle(false);
                  }}
                  className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-between transition"
                >
                  <span>➕ Tulis Artikel Fiqh Baru</span>
                  <span>&rarr;</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu("publications");
                    setActiveSubMenu("theses");
                    setIsEditingThesis(false);
                  }}
                  className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-between transition"
                >
                  <span>🎓 Tambah Skripsi Mahasantri</span>
                  <span>&rarr;</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu("publications");
                    setActiveSubMenu("categories");
                  }}
                  className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-between transition"
                >
                  <span>🏷️ Tambah Kategori Tanpa Batas</span>
                  <span>&rarr;</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu("submissions");
                    setActiveSubMenu("queue");
                  }}
                  className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-between transition"
                >
                  <span>📥 Cek Naskah Masuk ({pendingSubmissionsCount})</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>

            {/* Top 5 Artikel & Log Aktivitas */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h3 className="font-serif font-bold text-base text-slate-900 pb-2 border-b">
                  🔥 Top 5 Artikel Terpopuler
                </h3>
                <div className="space-y-2.5">
                  {articles.slice(0, 5).map((art, idx) => (
                    <div key={art.id} className="p-3 bg-slate-50 rounded-xl border flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-emerald-900 text-white font-bold flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <div>
                          <h4 className="font-bold text-slate-900 line-clamp-1">{art.title}</h4>
                          <span className="text-slate-500 text-[10px]">{art.categoryLabel} &bull; {art.author}</span>
                        </div>
                      </div>
                      <span className="font-bold text-emerald-800 shrink-0 text-xs">{art.views || 0}x baca</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h3 className="font-serif font-bold text-base text-slate-900 pb-2 border-b">
                  📋 Log Aktivitas Terkini
                </h3>
                <div className="space-y-2.5 max-h-64 overflow-y-auto">
                  {logs.map((lg) => (
                    <div key={lg.id} className="p-3 bg-slate-50 rounded-xl border flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-emerald-900">{lg.user}:</span>{" "}
                        <span className="text-slate-800">{lg.action}</span>
                        <p className="text-slate-500 text-[10px] line-clamp-1">{lg.target}</p>
                      </div>
                      <span className="text-slate-400 text-[10px] shrink-0">{lg.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            2. TAB: KONTEN WEBSITE (LIVE EDITORS)
           ══════════════════════════════════════════════════════════════ */}
        {activeMenu === "content" && (
          <div className="space-y-6">
            {/* Submenu Pills */}
            <div className="flex flex-wrap gap-2 pb-2 border-b">
              {[
                { id: "hero", label: "🌟 Hero Banner & Motto" },
                { id: "quote", label: "💬 Kalam Hikmah (RTL Arab)" },
                { id: "profile", label: "🏛️ Profil & Visi Misi" },
                { id: "features", label: "📌 Menu Navigasi & Footer" }
              ].map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setActiveSubMenu(sub.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    activeSubMenu === sub.id
                      ? "bg-emerald-800 text-white shadow"
                      : "bg-white text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            {/* Sub 1: Hero Banner */}
            {activeSubMenu === "hero" && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
                <h3 className="font-serif font-bold text-lg text-slate-900 pb-2 border-b">
                  Edit Bagian Hero Banner (Halaman Utama)
                </h3>
                <form onSubmit={handleSaveSettings} className="space-y-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Badge Tagline Atas</label>
                    <input
                      type="text"
                      value={settingsForm.hero?.badge || ""}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          hero: { ...(settingsForm.hero as any), badge: e.target.value }
                        })
                      }
                      className="w-full p-2.5 bg-slate-50 border rounded-lg"
                      placeholder="Pusat Kaderisasi Fuqaha Kontemporer"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Judul Utama Hero</label>
                    <input
                      type="text"
                      value={settingsForm.hero?.title || ""}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          hero: { ...(settingsForm.hero as any), title: e.target.value }
                        })
                      }
                      className="w-full p-2.5 bg-slate-50 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Motto Bahasa Arab</label>
                    <input
                      type="text"
                      dir="rtl"
                      value={settingsForm.hero?.arabicMotto || ""}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          hero: { ...(settingsForm.hero as any), arabicMotto: e.target.value }
                        })
                      }
                      className="w-full p-2.5 bg-slate-50 border rounded-lg font-serif text-sm text-right"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Deskripsi Subtitle</label>
                    <textarea
                      rows={3}
                      value={settingsForm.hero?.subtitle || ""}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          hero: { ...(settingsForm.hero as any), subtitle: e.target.value }
                        })
                      }
                      className="w-full p-2.5 bg-slate-50 border rounded-lg leading-relaxed"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow"
                  >
                    Simpan Perubahan Hero
                  </button>
                </form>
              </div>
            )}

            {/* Sub 2: Kalam Hikmah */}
            {activeSubMenu === "quote" && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
                <h3 className="font-serif font-bold text-lg text-slate-900 pb-2 border-b">
                  Edit Kalam Hikmah / Kata Mutiara Anregurutta
                </h3>
                <form onSubmit={handleSaveSettings} className="space-y-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Matan Teks Arab (RTL)</label>
                    <textarea
                      rows={2}
                      dir="rtl"
                      value={settingsForm.quote?.arabicQuote || ""}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          quote: { ...(settingsForm.quote as any), arabicQuote: e.target.value }
                        })
                      }
                      className="w-full p-2.5 bg-slate-50 border rounded-lg font-serif text-base text-right"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Terjemahan &amp; Makna</label>
                    <textarea
                      rows={3}
                      value={settingsForm.quote?.translation || ""}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          quote: { ...(settingsForm.quote as any), translation: e.target.value }
                        })
                      }
                      className="w-full p-2.5 bg-slate-50 border rounded-lg leading-relaxed"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Sumber Riwayat / Rujukan</label>
                      <input
                        type="text"
                        value={settingsForm.quote?.source || ""}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            quote: { ...(settingsForm.quote as any), source: e.target.value }
                          })
                        }
                        className="w-full p-2.5 bg-slate-50 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Konteks / Judul Section</label>
                      <input
                        type="text"
                        value={settingsForm.quote?.context || ""}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            quote: { ...(settingsForm.quote as any), context: e.target.value }
                          })
                        }
                        className="w-full p-2.5 bg-slate-50 border rounded-lg"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow"
                  >
                    Simpan Perubahan Kalam Hikmah
                  </button>
                </form>
              </div>
            )}

            {/* Sub 3: Profil & Visi Misi */}
            {activeSubMenu === "profile" && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
                <h3 className="font-serif font-bold text-lg text-slate-900 pb-2 border-b">
                  Profil Lembaga, Mudir &amp; Visi Misi
                </h3>
                <form onSubmit={handleSaveSettings} className="space-y-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama Mudir Ma&apos;had</label>
                    <input
                      type="text"
                      value={settingsForm.mudirName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, mudirName: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Visi Lembaga</label>
                    <textarea
                      rows={2}
                      value={settingsForm.visi}
                      onChange={(e) => setSettingsForm({ ...settingsForm, visi: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Misi Lembaga (Pisahkan per baris)</label>
                    <textarea
                      rows={4}
                      value={settingsForm.misi.join("\n")}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, misi: e.target.value.split("\n").filter(Boolean) })
                      }
                      className="w-full p-2.5 bg-slate-50 border rounded-lg"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow"
                  >
                    Simpan Profil &amp; Visi Misi
                  </button>
                </form>
              </div>
            )}

            {/* Sub 4: Menu Navigasi & Footer */}
            {activeSubMenu === "features" && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
                <h3 className="font-serif font-bold text-lg text-slate-900 pb-2 border-b">
                  Pengaturan Footer &amp; Kontak Resmi
                </h3>
                <form onSubmit={handleSaveSettings} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nomor Telepon / WA</label>
                      <input
                        type="text"
                        value={settingsForm.phone}
                        onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Email Penerimaan Naskah</label>
                      <input
                        type="email"
                        value={settingsForm.emailSubmission}
                        onChange={(e) => setSettingsForm({ ...settingsForm, emailSubmission: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border rounded-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Alamat Kampus</label>
                    <input
                      type="text"
                      value={settingsForm.address}
                      onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border rounded-lg"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow"
                  >
                    Simpan Pengaturan Footer
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            3. TAB: PUBLIKASI (ARTIKEL, KATEGORI, SKRIPSI)
           ══════════════════════════════════════════════════════════════ */}
        {activeMenu === "publications" && (
          <div className="space-y-6">
            {/* Submenu Pills */}
            <div className="flex flex-wrap gap-2 pb-2 border-b">
              {[
                { id: "articles", label: `📝 Artikel Kajian (${articles.length})` },
                { id: "categories", label: `🏷️ Kategori (${categories.length})` },
                { id: "theses", label: `🎓 Repositori Skripsi (${theses.length})` }
              ].map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setActiveSubMenu(sub.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    activeSubMenu === sub.id
                      ? "bg-emerald-800 text-white shadow"
                      : "bg-white text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            {/* A. Sub: Kelola Artikel */}
            {activeSubMenu === "articles" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-serif font-bold text-lg text-emerald-950 pb-2 border-b">
                    {isEditingArticle ? "✏️ Edit Artikel" : "➕ Tulis Artikel Baru"}
                  </h3>
                  <form onSubmit={handleSaveArticle} className="space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Judul Artikel *</label>
                      <input
                        type="text"
                        required
                        value={articleForm.title}
                        onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                        className="w-full p-2.5 text-sm bg-slate-50 border rounded-lg"
                        placeholder="Judul kajian fiqh..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Kategori *</label>
                        <select
                          value={articleForm.category}
                          onChange={(e) => {
                            const selected = categories.find((c) => c.slug === e.target.value);
                            setArticleForm({
                              ...articleForm,
                              category: e.target.value,
                              categoryLabel: selected?.name || e.target.value,
                              isSpecial: e.target.value === "karya-anregurutta"
                            });
                          }}
                          className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.slug}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Penulis *</label>
                        <input
                          type="text"
                          required
                          value={articleForm.author}
                          onChange={(e) => setArticleForm({ ...articleForm, author: e.target.value })}
                          className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                          placeholder="Nama penulis..."
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Abstrak Singkat *</label>
                      <textarea
                        rows={2}
                        required
                        value={articleForm.excerpt}
                        onChange={(e) => setArticleForm({ ...articleForm, excerpt: e.target.value })}
                        className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Kutipan Arab Singkat (Opsional)</label>
                      <input
                        type="text"
                        dir="rtl"
                        value={articleForm.arabicSnippet}
                        onChange={(e) => setArticleForm({ ...articleForm, arabicSnippet: e.target.value })}
                        className="w-full p-2 text-xs bg-slate-50 border rounded-lg font-serif text-right"
                        placeholder="الأَصْلُ فِي الْمُعَامَلَاتِ الإِبَاحَةُ"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Isi Lengkap Artikel (Support Arab) *</label>
                      <textarea
                        rows={7}
                        required
                        value={articleForm.content}
                        onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })}
                        className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                        placeholder="Isi naskah kajian..."
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Tags (Pisahkan koma)</label>
                      <input
                        type="text"
                        value={articleForm.tags}
                        onChange={(e) => setArticleForm({ ...articleForm, tags: e.target.value })}
                        className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                        placeholder="Fiqh Muamalah, Kripto, AI"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow"
                    >
                      {isEditingArticle ? "Simpan Perubahan" : "Terbitkan Artikel"}
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <h3 className="font-serif font-bold text-lg text-emerald-950 pb-2 border-b">
                    Daftar Artikel ({articles.length})
                  </h3>
                  <div className="space-y-2.5 max-h-175 overflow-y-auto">
                    {articles.map((art) => (
                      <div key={art.id} className="p-3.5 bg-slate-50 rounded-xl border flex items-start justify-between gap-3 text-xs">
                        <div>
                          <span className="font-bold text-emerald-800 uppercase text-[10px]">{art.categoryLabel}</span>
                          <h4 className="font-bold text-slate-900 text-sm mt-0.5">{art.title}</h4>
                          <p className="text-slate-500 text-[11px]">Penulis: {art.author} &bull; {art.views || 0}x dibaca</p>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditingArticle(true);
                              setEditingArticleId(art.id);
                              setArticleForm({
                                title: art.title,
                                excerpt: art.excerpt,
                                content: art.content,
                                author: art.author,
                                authorRole: art.authorRole,
                                authorBio: art.authorBio || "",
                                category: art.category,
                                categoryLabel: art.categoryLabel,
                                date: art.date,
                                hijriDate: art.hijriDate,
                                readTime: art.readTime,
                                isSpecial: art.isSpecial || false,
                                tags: art.tags?.join(", ") || "",
                                arabicSnippet: art.arabicSnippet || ""
                              });
                            }}
                            className="px-2.5 py-1 bg-amber-500 text-white rounded font-bold"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Hapus artikel: "${art.title}"?`)) deleteArticle(art.id);
                            }}
                            className="px-2.5 py-1 bg-red-600 text-white rounded font-bold"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* B. Sub: Kelola Kategori */}
            {activeSubMenu === "categories" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-serif font-bold text-lg text-emerald-950 pb-2 border-b">
                    {isEditingCat ? "✏️ Edit Kategori" : "➕ Tambah Kategori Baru (Tanpa Batas)"}
                  </h3>
                  <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nama Kategori *</label>
                      <input
                        type="text"
                        required
                        value={catForm.name}
                        onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                        className="w-full p-2.5 text-sm bg-slate-50 border rounded-lg"
                        placeholder="Misal: Fiqh Bioetika Digital"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Deskripsi Ringkas</label>
                      <textarea
                        rows={3}
                        value={catForm.description}
                        onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                        className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-emerald-800 text-white font-bold rounded-xl shadow"
                    >
                      {isEditingCat ? "Simpan Kategori" : "Tambah Kategori"}
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <h3 className="font-serif font-bold text-lg text-emerald-950 pb-2 border-b">
                    Daftar Kategori Aktif ({categories.length})
                  </h3>
                  <div className="space-y-2.5 max-h-175 overflow-y-auto">
                    {categories.map((cat) => (
                      <div key={cat.id} className="p-3.5 bg-slate-50 rounded-xl border flex items-center justify-between gap-3 text-xs">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{cat.name}</h4>
                          <p className="text-slate-500 text-[11px] line-clamp-1">{cat.description}</p>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditingCat(true);
                              setEditingCatId(cat.id);
                              setCatForm({ name: cat.name, description: cat.description, iconName: cat.iconName });
                            }}
                            className="px-2.5 py-1 bg-amber-500 text-white rounded font-bold"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Hapus kategori: "${cat.name}"?`)) deleteCategory(cat.id);
                            }}
                            className="px-2.5 py-1 bg-red-600 text-white rounded font-bold"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* C. Sub: Kelola Skripsi + Google Drive */}
            {activeSubMenu === "theses" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-serif font-bold text-lg text-emerald-950 pb-2 border-b">
                    {isEditingThesis ? "✏️ Edit Data Skripsi" : "➕ Tambah Skripsi Mahasantri"}
                  </h3>
                  <form onSubmit={handleSaveThesis} className="space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Judul Skripsi *</label>
                      <input
                        type="text"
                        required
                        value={thesisForm.title}
                        onChange={(e) => setThesisForm({ ...thesisForm, title: e.target.value })}
                        className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Penulis *</label>
                        <input
                          type="text"
                          required
                          value={thesisForm.author}
                          onChange={(e) => setThesisForm({ ...thesisForm, author: e.target.value })}
                          className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">NIM *</label>
                        <input
                          type="text"
                          required
                          value={thesisForm.nim}
                          onChange={(e) => setThesisForm({ ...thesisForm, nim: e.target.value })}
                          className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Tahun Lulus</label>
                        <input
                          type="text"
                          value={thesisForm.year}
                          onChange={(e) => setThesisForm({ ...thesisForm, year: e.target.value })}
                          className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Ukuran File</label>
                        <input
                          type="text"
                          value={thesisForm.fileSize}
                          onChange={(e) => setThesisForm({ ...thesisForm, fileSize: e.target.value })}
                          className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Link Google Drive PDF *</label>
                      <input
                        type="url"
                        required
                        value={thesisForm.downloadUrl}
                        onChange={(e) => setThesisForm({ ...thesisForm, downloadUrl: e.target.value })}
                        className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                        placeholder="https://drive.google.com/file/d/..."
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Abstrak Indonesia *</label>
                      <textarea
                        rows={3}
                        required
                        value={thesisForm.abstractId}
                        onChange={(e) => setThesisForm({ ...thesisForm, abstractId: e.target.value })}
                        className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Abstrak Bahasa Arab</label>
                      <textarea
                        rows={3}
                        dir="rtl"
                        value={thesisForm.abstractAr}
                        onChange={(e) => setThesisForm({ ...thesisForm, abstractAr: e.target.value })}
                        className="w-full p-2 text-xs bg-slate-50 border rounded-lg font-serif text-right"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-emerald-800 text-white font-bold rounded-xl shadow"
                    >
                      {isEditingThesis ? "Simpan Perubahan Skripsi" : "Tambahkan Skripsi"}
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <h3 className="font-serif font-bold text-lg text-emerald-950 pb-2 border-b">
                    Daftar Skripsi Repositori ({theses.length})
                  </h3>
                  <div className="space-y-2.5 max-h-175 overflow-y-auto">
                    {theses.map((th) => (
                      <div key={th.id} className="p-3.5 bg-slate-50 rounded-xl border flex items-start justify-between gap-3 text-xs">
                        <div>
                          <span className="font-bold text-emerald-800 text-[10px]">Tahun {th.year} &bull; {th.categoryLabel}</span>
                          <h4 className="font-bold text-slate-900 text-sm mt-0.5">{th.title}</h4>
                          <p className="text-slate-500 text-[11px]">Penulis: {th.author} (NIM: {th.nim})</p>
                          <a href={th.downloadUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-700 text-[11px] underline font-bold">
                            Buka Link Google Drive &rarr;
                          </a>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditingThesis(true);
                              setEditingThesisId(th.id);
                              setThesisForm({
                                title: th.title,
                                author: th.author,
                                nim: th.nim,
                                angkatan: th.angkatan,
                                year: th.year,
                                advisor1: th.advisor1,
                                advisor2: th.advisor2,
                                abstractId: th.abstractId,
                                abstractAr: th.abstractAr,
                                keywords: th.keywords.join(", "),
                                category: th.category,
                                categoryLabel: th.categoryLabel,
                                downloadUrl: th.downloadUrl,
                                fileSize: th.fileSize
                              });
                            }}
                            className="px-2.5 py-1 bg-amber-500 text-white rounded font-bold"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Hapus skripsi: "${th.title}"?`)) deleteThesis(th.id);
                            }}
                            className="px-2.5 py-1 bg-red-600 text-white rounded font-bold"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            4. TAB: INFORMASI (BERITA, PENGUMUMAN, AGENDA)
           ══════════════════════════════════════════════════════════════ */}
        {activeMenu === "information" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-lg text-emerald-950 pb-2 border-b">
                {isEditingNews ? "✏️ Edit Warta" : "➕ Tulis Berita / Pengumuman Baru"}
              </h3>
              <form onSubmit={handleSaveNews} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Judul Warta *</label>
                  <input
                    type="text"
                    required
                    value={newsForm.title}
                    onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                    className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Kategori *</label>
                    <select
                      value={newsForm.category}
                      onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value as any })}
                      className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                    >
                      <option value="Berita">Berita</option>
                      <option value="Pengumuman">Pengumuman</option>
                      <option value="Agenda">Agenda</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Penulis / Sumber</label>
                    <input
                      type="text"
                      value={newsForm.author}
                      onChange={(e) => setNewsForm({ ...newsForm, author: e.target.value })}
                      className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Isi Lengkap Berita *</label>
                  <textarea
                    rows={6}
                    required
                    value={newsForm.content}
                    onChange={(e) =>
                      setNewsForm({
                        ...newsForm,
                        content: e.target.value,
                        excerpt: e.target.value.slice(0, 120) + "..."
                      })
                    }
                    className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-800 text-white font-bold rounded-xl shadow"
                >
                  {isEditingNews ? "Simpan Perubahan" : "Terbitkan Warta"}
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-serif font-bold text-lg text-emerald-950 pb-2 border-b">
                Daftar Berita &amp; Agenda ({news.length})
              </h3>
              <div className="space-y-2.5 max-h-175 overflow-y-auto">
                {news.map((item) => (
                  <div key={item.id} className="p-3.5 bg-slate-50 rounded-xl border flex items-start justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-emerald-800 text-[10px]">{item.category} &bull; {item.date}</span>
                      <h4 className="font-bold text-slate-900 text-sm mt-0.5">{item.title}</h4>
                      <p className="text-slate-500 text-[11px] line-clamp-1">{item.excerpt}</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingNews(true);
                          setEditingNewsId(item.id);
                          setNewsForm({
                            title: item.title,
                            excerpt: item.excerpt,
                            content: item.content,
                            category: item.category,
                            author: item.author,
                            date: item.date
                          });
                        }}
                        className="px-2.5 py-1 bg-amber-500 text-white rounded font-bold"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Hapus warta: "${item.title}"?`)) deleteNews(item.id);
                        }}
                        className="px-2.5 py-1 bg-red-600 text-white rounded font-bold"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            5. TAB: SUBMISSION (NASKAH MASUK & STEPPER REVIEW)
           ══════════════════════════════════════════════════════════════ */}
        {activeMenu === "submissions" && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <h3 className="font-serif font-bold text-lg text-emerald-950">
                  📥 Kotak Masuk Naskah Mahasantri &amp; Dosen ({submissions.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Target notifikasi email redaksi: <strong>{settings.emailSubmission}</strong>
                </p>
              </div>
            </div>

            {submissions.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-sm">
                Belum ada naskah kiriman baru di kotak masuk.
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((sub) => (
                  <div key={sub.id} className="p-5 bg-slate-50 rounded-xl border space-y-3 text-xs">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded">
                        Kategori: {sub.kategori}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">{sub.tanggal}</span>
                        <span
                          className={`font-bold px-2 py-0.5 rounded uppercase text-[10px] ${
                            sub.status === "publish"
                              ? "bg-emerald-600 text-white"
                              : sub.status === "review"
                              ? "bg-amber-500 text-slate-950"
                              : "bg-slate-300 text-slate-800"
                          }`}
                        >
                          Status: {sub.status}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-serif font-bold text-base text-slate-900">{sub.judul}</h4>
                      <p className="text-slate-600">
                        Penulis: <strong>{sub.nama}</strong> ({sub.email}) &bull; Afiliasi: {sub.afiliasi || "Umum"}
                      </p>
                    </div>

                    <div className="p-3 bg-white border rounded-lg text-slate-700">
                      <strong>Abstrak Naskah:</strong>
                      <p className="mt-1 leading-relaxed">{sub.abstrak}</p>
                    </div>

                    {sub.fileLink && (
                      <p className="text-emerald-800">
                        Link Dokumen:{" "}
                        <a href={sub.fileLink} target="_blank" rel="noopener noreferrer" className="underline font-bold">
                          {sub.fileLink}
                        </a>
                      </p>
                    )}

                    {/* Stepper Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => updateSubmissionStatus(sub.id, "review")}
                          className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded font-bold hover:bg-amber-200"
                        >
                          Set: Review
                        </button>
                        <button
                          type="button"
                          onClick={() => updateSubmissionStatus(sub.id, "revisi")}
                          className="px-2.5 py-1 bg-purple-100 text-purple-900 rounded font-bold hover:bg-purple-200"
                        >
                          Set: Butuh Revisi
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            // 1-Click Publish to Live Articles
                            addArticle({
                              title: sub.judul,
                              excerpt: sub.abstrak.slice(0, 150) + "...",
                              content: sub.abstrak,
                              author: sub.nama,
                              authorRole: sub.afiliasi || "Mahasantri Marhalah Ula",
                              category: categories[0]?.slug || "fiqh-muamalah-kontemporer",
                              categoryLabel: sub.kategori,
                              date: new Date().toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "long",
                                year: "numeric"
                              }),
                              hijriDate: "1448 H",
                              readTime: "5 menit"
                            });
                            updateSubmissionStatus(sub.id, "publish");
                            alert("Naskah berhasil langsung diterbitkan menjadi Artikel Live!");
                          }}
                          className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg shadow"
                        >
                          ✓ Terbitkan Jadi Artikel Live
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Hapus kiriman: "${sub.judul}"?`)) deleteSubmission(sub.id);
                          }}
                          className="px-3 py-1.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            6. TAB: USER & PERAN (ROLE MATRIX)
           ══════════════════════════════════════════════════════════════ */}
        {activeMenu === "users" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-lg text-emerald-950 pb-2 border-b">
                {isEditingUser ? "✏️ Edit Pengguna" : "➕ Tambah Pengguna / Admin Baru"}
              </h3>
              <form onSubmit={handleSaveUser} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    className="w-full p-2.5 text-xs bg-slate-50 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Resmi *</label>
                  <input
                    type="email"
                    required
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="w-full p-2.5 text-xs bg-slate-50 border rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Peran / Role</label>
                    <select
                      value={userForm.role}
                      onChange={(e) => setUserForm({ ...userForm, role: e.target.value as any })}
                      className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                    >
                      <option value="Super Admin">Super Admin (Akses Penuh)</option>
                      <option value="Editor">Editor (Publikasi &amp; Review)</option>
                      <option value="Penulis">Penulis (Draft Saja)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Status</label>
                    <select
                      value={userForm.status}
                      onChange={(e) => setUserForm({ ...userForm, status: e.target.value as any })}
                      className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Nonaktif">Nonaktif</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-800 text-white font-bold rounded-xl shadow"
                >
                  {isEditingUser ? "Simpan Perubahan Pengguna" : "Daftarkan Pengguna"}
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-serif font-bold text-lg text-emerald-950 pb-2 border-b">
                Daftar Admin &amp; Pengelola ({users.length})
              </h3>
              <div className="space-y-2.5">
                {users.map((usr) => (
                  <div key={usr.id} className="p-3.5 bg-slate-50 rounded-xl border flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">{usr.name}</h4>
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                          {usr.role}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px]">{usr.email} &bull; Terakhir login: {usr.lastLogin}</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingUser(true);
                          setEditingUserId(usr.id);
                          setUserForm({
                            name: usr.name,
                            email: usr.email,
                            role: usr.role,
                            status: usr.status
                          });
                        }}
                        className="px-2.5 py-1 bg-amber-500 text-white rounded font-bold"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Hapus pengguna: "${usr.name}"?`)) deleteUser(usr.id);
                        }}
                        className="px-2.5 py-1 bg-red-600 text-white rounded font-bold"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            7. TAB: MEDIA LIBRARY
           ══════════════════════════════════════════════════════════════ */}
        {activeMenu === "media" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
              <h3 className="font-serif font-bold text-lg text-slate-900 pb-2 border-b">
                Unggah Berkas Baru ke Media Library
              </h3>
              <form onSubmit={handleSaveMedia} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-4">
                  <label className="block font-bold text-slate-700 mb-1">Nama Berkas</label>
                  <input
                    type="text"
                    required
                    value={mediaForm.name}
                    onChange={(e) => setMediaForm({ ...mediaForm, name: e.target.value })}
                    className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                    placeholder="foto-kegiatan.jpg"
                  />
                </div>
                <div className="sm:col-span-5">
                  <label className="block font-bold text-slate-700 mb-1">Tautan / URL Berkas (Cloud/Drive)</label>
                  <input
                    type="text"
                    required
                    value={mediaForm.url}
                    onChange={(e) => setMediaForm({ ...mediaForm, url: e.target.value })}
                    className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                    placeholder="https://..."
                  />
                </div>
                <div className="sm:col-span-3 flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg shadow"
                  >
                    Simpan ke Library
                  </button>
                </div>
              </form>
            </div>

            {/* Media Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {media.map((med) => (
                <div key={med.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2 text-xs">
                  <div className="h-28 bg-slate-100 rounded-xl flex items-center justify-center text-3xl overflow-hidden border">
                    {med.type === "image" ? "🖼️" : "📄"}
                  </div>
                  <h4 className="font-bold text-slate-900 truncate" title={med.name}>
                    {med.name}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {med.size} &bull; {med.uploadedAt}
                  </p>
                  <div className="flex gap-2 pt-2 border-t">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(med.url);
                        alert("URL Berkas disalin ke clipboard!");
                      }}
                      className="flex-1 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded text-[11px]"
                    >
                      Salin URL
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Hapus media "${med.name}"?`)) deleteMedia(med.id);
                      }}
                      className="px-2.5 py-1 bg-red-100 text-red-700 font-bold rounded text-[11px]"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            8. TAB: SEO & METADATA
           ══════════════════════════════════════════════════════════════ */}
        {activeMenu === "seo" && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
            <h3 className="font-serif font-bold text-lg text-slate-900 pb-2 border-b">
              Pengaturan SEO &amp; Meta Google
            </h3>
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul Situs (Meta Title)</label>
                <input
                  type="text"
                  value={settingsForm.seo?.siteTitle || ""}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      seo: { ...(settingsForm.seo as any), siteTitle: e.target.value }
                    })
                  }
                  className="w-full p-2.5 bg-slate-50 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Deskripsi Mesin Pencari (Meta Description)</label>
                <textarea
                  rows={3}
                  value={settingsForm.seo?.metaDescription || ""}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      seo: { ...(settingsForm.seo as any), metaDescription: e.target.value }
                    })
                  }
                  className="w-full p-2.5 bg-slate-50 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Keywords / Kata Kunci SEO</label>
                <input
                  type="text"
                  value={settingsForm.seo?.keywords || ""}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      seo: { ...(settingsForm.seo as any), keywords: e.target.value }
                    })
                  }
                  className="w-full p-2.5 bg-slate-50 border rounded-lg"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Google Analytics ID</label>
                  <input
                    type="text"
                    value={settingsForm.seo?.googleAnalyticsId || ""}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        seo: { ...(settingsForm.seo as any), googleAnalyticsId: e.target.value }
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border rounded-lg"
                    placeholder="G-XXXXXXXXXX"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Google Search Console Tag</label>
                  <input
                    type="text"
                    value={settingsForm.seo?.searchConsoleCode || ""}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        seo: { ...(settingsForm.seo as any), searchConsoleCode: e.target.value }
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border rounded-lg"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow"
              >
                Simpan Konfigurasi SEO
              </button>
            </form>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            9. TAB: PENGATURAN & BACKUP
           ══════════════════════════════════════════════════════════════ */}
        {activeMenu === "settings" && (
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs font-medium">
              <h3 className="font-serif font-bold text-lg text-slate-900 pb-2 border-b">
                Identitas Lembaga &amp; Alamat Resmi
              </h3>
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Nama Resmi Lembaga</label>
                  <input
                    type="text"
                    value={settingsForm.institutionName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, institutionName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-lg text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 mb-1 font-bold">Takhassus</label>
                    <input
                      type="text"
                      value={settingsForm.takhassus}
                      onChange={(e) => setSettingsForm({ ...settingsForm, takhassus: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1 font-bold">Fokus Utama Kajian</label>
                    <input
                      type="text"
                      value={settingsForm.focusField}
                      onChange={(e) => setSettingsForm({ ...settingsForm, focusField: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border rounded-lg"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow"
                >
                  Simpan Identitas
                </button>
              </form>
            </div>

            {/* Cadangan & Pemulihan Data JSON */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
              <h3 className="font-serif font-bold text-lg text-slate-900 pb-2 border-b">
                💾 Ekspor / Impor Cadangan Data Website (Backup &amp; Restore)
              </h3>
              <p className="text-slate-600">
                Unduh seluruh data artikel, kategori, skripsi, dan pengaturan dalam 1 file JSON aman. Anda dapat mengimpornya kembali kapan saja.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow"
                >
                  📥 Unduh File Backup JSON
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Yakin ingin mereset seluruh data website ke pengaturan bawaan awal?")) {
                      resetAllData();
                      alert("Data website telah direset ke default!");
                    }
                  }}
                  className="px-4 py-2.5 bg-red-100 text-red-700 font-bold rounded-xl hover:bg-red-200"
                >
                  ⚠️ Reset ke Data Bawaan
                </button>
              </div>

              {/* Restore Box */}
              <div className="pt-4 border-t space-y-2">
                <label className="block font-bold text-slate-700">Pulihkan Data dari Teks JSON Backup:</label>
                <textarea
                  rows={3}
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder="Tempelkan isi file JSON backup di sini..."
                  className="w-full p-2.5 bg-slate-50 border rounded-lg font-mono text-[11px]"
                />
                <button
                  type="button"
                  onClick={handleRestoreBackup}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg"
                >
                  🔄 Pulihkan Data Sekarang
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
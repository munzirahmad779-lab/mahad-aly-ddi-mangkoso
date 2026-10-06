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
  SiteSettings,
  Lecturer,
  Facility,
  Accreditation,
  Course,
  CalendarEvent,
  BahtsulMasailQA,
  PMBWave,
  PMBFAQ,
  GalleryAlbum,
  PageSeoItem
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
    deleteSubscriber,
    emailLogs,
    sendEmailNotification,
    galleryAlbums,
    addGalleryAlbum,
    updateGalleryAlbum,
    deleteGalleryAlbum,
    comingSoonPages,
    toggleComingSoonPage,
    pageSeoList,
    updatePageSeo,
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
    | "profile"
    | "academic"
    | "content"
    | "publications"
    | "bahtsul"
    | "pmb"
    | "information"
    | "submissions"
    | "email"
    | "comingsoon"
    | "users"
    | "media"
    | "seo"
    | "settings"
  >("dashboard");

  const [activeSubMenu, setActiveSubMenu] = useState<string>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // 1. Article Form State
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

  // 2. Category Form State
  const [isEditingCat, setIsEditingCat] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catForm, setCatForm] = useState({
    name: "",
    description: "",
    iconName: "book"
  });

  // 3. Thesis Form State
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

  // 4. Lecturer Form State
  const [isEditingLecturer, setIsEditingLecturer] = useState(false);
  const [editingLecturerId, setEditingLecturerId] = useState<string | null>(null);
  const [lecturerForm, setLecturerForm] = useState({
    name: "",
    title: "",
    role: "Dosen Pengampu",
    photoUrl: "",
    expertise: "Fiqh Mu'asarah & Ushul Fikih",
    education: "S1 Al-Azhar Cairo, S2 UIN",
    publications: "Riset Fiqh Kontemporer",
    order: 1,
    isActive: true
  });

  // 5. Facility Form State
  const [facilityForm, setFacilityForm] = useState({
    name: "",
    category: "Masjid" as Facility["category"],
    photoUrl: "",
    description: ""
  });

  // 6. Accreditation Form State
  const [accreditationForm, setAccreditationForm] = useState({
    name: "",
    issuer: "Kementerian Agama RI",
    validDate: "Berlaku Permanen",
    pdfUrl: "",
    fileSize: "2.5 MB",
    status: "Resmi Kemenag" as Accreditation["status"]
  });

  // 7. Course Form State
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseForm, setCourseForm] = useState({
    name: "",
    semester: 1,
    credits: 3,
    mainBook: "",
    supportBook: "",
    lecturer: "",
    description: ""
  });

  // 8. Calendar Form State
  const [calendarForm, setCalendarForm] = useState({
    name: "",
    startDate: "01 Nov 2026",
    endDate: "05 Nov 2026",
    category: "kuliah" as CalendarEvent["category"],
    description: ""
  });

  // 9. Bahtsul Masail Form State
  const [bahtsulForm, setBahtsulForm] = useState({
    title: "",
    question: "",
    answer: "",
    theme: "Fiqh Muamalah Kontemporer",
    author: "Lembaga Bahtsul Masail",
    date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
    status: "published" as "draft" | "published",
    arabicReferences: ""
  });

  // 10. PMB Wave Form State
  const [pmbWaveForm, setPmbWaveForm] = useState({
    name: "",
    startDate: "01 Jan 2027",
    endDate: "28 Feb 2027",
    quota: "15 Mahasantri",
    scholarshipInfo: "Beasiswa Penuh 100%",
    requirements: "Lulusan MA/Pesantren\nHafalan 5 Juz\nMampu baca kitab kuning",
    procedure: "Daftar Online\nUnggah Berkas\nTes Seleksi Kitab"
  });

  // 11. PMB FAQ Form State
  const [pmbFaqForm, setPmbFaqForm] = useState({
    question: "",
    answer: "",
    category: "Pendaftaran"
  });

  // 12. News Form State
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

  // 13. Gallery Album Form State
  const [galleryForm, setGalleryForm] = useState({
    title: "",
    category: "Kegiatan Akademik",
    date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
    coverUrl: "",
    photoUrlInput: "",
    captionInput: ""
  });

  // 14. User Form State
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    role: "Editor" as "Super Admin" | "Editor" | "Penulis",
    status: "Aktif" as "Aktif" | "Nonaktif"
  });

  // 15. Media Form State
  const [mediaForm, setMediaForm] = useState({
    name: "",
    url: "",
    size: "1.5 MB",
    type: "image" as "image" | "pdf" | "document"
  });

  // 16. Settings Form State
  const [settingsForm, setSettingsForm] = useState<SiteSettings>(settings);

  // 17. Backup Import State
  const [importJsonText, setImportJsonText] = useState("");

  // Helper untuk Validasi File PDF Max 10MB
  const validatePdfSize = (sizeInMbStr: string): boolean => {
    const num = parseFloat(sizeInMbStr.replace(/[^0-9.]/g, ""));
    if (isNaN(num)) return true;
    if (num > 10.0) {
      alert("⚠️ Peringatan: Ukuran berkas PDF melebihi 10 MB! Mohon kompres file terlebih dahulu via ilovepdf.com atau smallpdf.com sebelum diunggah.");
      return false;
    }
    return true;
  };

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

  // Article Save
  const handleSaveArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleForm.title || !articleForm.content || !articleForm.author) {
      alert("Mohon lengkapi judul, penulis, dan isi artikel!");
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

  // Category Save
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

  // Thesis Save
  const handleSaveThesis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!thesisForm.title || !thesisForm.author || !thesisForm.downloadUrl) {
      alert("Mohon lengkapi judul, penulis, dan link Google Drive!");
      return;
    }

    if (!validatePdfSize(thesisForm.fileSize)) return;

    const payload = {
      ...thesisForm,
      keywords: thesisForm.keywords ? thesisForm.keywords.split(",").map((k) => k.trim()) : []
    };

    if (isEditingThesis && editingThesisId) {
      updateThesis(editingThesisId, payload);
      alert("Data skripsi diperbarui!");
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

  // Lecturer Save
  const handleSaveLecturer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lecturerForm.name) {
      alert("Nama dosen wajib diisi!");
      return;
    }

    const payload = {
      ...lecturerForm,
      education: lecturerForm.education.split(",").map((ed) => ed.trim()),
      publications: lecturerForm.publications.split(",").map((pb) => pb.trim())
    };

    if (isEditingLecturer && editingLecturerId) {
      updateLecturer(editingLecturerId, payload);
      alert("Data dosen diperbarui!");
    } else {
      addLecturer(payload);
      alert("Dosen baru berhasil ditambahkan!");
    }

    setIsEditingLecturer(false);
    setEditingLecturerId(null);
    setLecturerForm({
      name: "",
      title: "",
      role: "Dosen Pengampu",
      photoUrl: "",
      expertise: "Fiqh Mu'asarah & Ushul Fikih",
      education: "S1 Al-Azhar Cairo, S2 UIN",
      publications: "Riset Fiqh Kontemporer",
      order: 1,
      isActive: true
    });
  };

  // Course Save
  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.name) {
      alert("Nama mata kuliah wajib diisi!");
      return;
    }

    if (isEditingCourse && editingCourseId) {
      updateCourse(editingCourseId, courseForm);
      alert("Mata kuliah diperbarui!");
    } else {
      addCourse(courseForm);
      alert("Mata kuliah baru berhasil ditambahkan!");
    }

    setIsEditingCourse(false);
    setEditingCourseId(null);
    setCourseForm({
      name: "",
      semester: 1,
      credits: 3,
      mainBook: "",
      supportBook: "",
      lecturer: "",
      description: ""
    });
  };

  // Settings Save
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(settingsForm);
    alert("Pengaturan website berhasil disimpan!");
  };

  // JSON Export / Restore
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
      alert("Seluruh data website berhasil dipulihkan dari backup!");
      setImportJsonText("");
    } else {
      alert("Format JSON tidak valid!");
    }
  };

  // Export Subscribers to CSV
  const handleExportSubscribersCsv = () => {
    if (subscribers.length === 0) {
      alert("Belum ada email subscriber!");
      return;
    }
    const headers = "ID,Email,Nama,No WA,Target Halaman,Tanggal Langganan\n";
    const rows = subscribers
      .map((s) => `"${s.id}","${s.email}","${s.name || "-"}","${s.phone || "-"}","${s.pageTarget}","${s.subscribedAt}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-mahad-aly-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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

  // 2. Full Admin Dashboard
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row pt-20">
      
      {/* 📐 SIDEBAR NAVIGATION */}
      <aside
        className={`${
          sidebarOpen ? "w-full md:w-64" : "hidden md:block md:w-20"
        } bg-slate-900 text-white shrink-0 border-r border-slate-800 transition-all duration-300 flex flex-col justify-between`}
      >
        <div className="p-4 space-y-4">
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-mahad-gold text-mahad-green-dark flex items-center justify-center font-bold font-serif text-lg shrink-0 shadow">
                🕌
              </div>
              {sidebarOpen && (
                <div>
                  <h2 className="font-serif font-bold text-sm text-white leading-tight">
                    Ma&apos;had Aly DDI
                  </h2>
                  <p className="text-[10px] text-mahad-gold uppercase tracking-wider">Panel Admin v2.0</p>
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

          {/* Nav List */}
          <nav className="space-y-1 text-xs font-medium max-h-[75vh] overflow-y-auto pr-1">
            {[
              { id: "dashboard", icon: "📊", label: "Dashboard" },
              { id: "profile", icon: "🏛️", label: "Profil Lembaga" },
              { id: "academic", icon: "📖", label: "Akademik" },
              { id: "content", icon: "🎨", label: "Konten Tampilan" },
              { id: "publications", icon: "📚", label: "Publikasi", badge: articles.length + theses.length },
              { id: "bahtsul", icon: "🕌", label: "Bahtsul Masail" },
              { id: "pmb", icon: "🎓", label: "PMB Online" },
              { id: "information", icon: "📰", label: "Warta & Galeri" },
              { id: "submissions", icon: "📥", label: "Submission", alertBadge: pendingSubmissionsCount },
              { id: "email", icon: "📧", label: "Email & Notif" },
              { id: "comingsoon", icon: "🔧", label: "Coming Soon Mgr" },
              { id: "users", icon: "👥", label: "User & Peran" },
              { id: "media", icon: "🖼️", label: "Media Library" },
              { id: "seo", icon: "🔍", label: "SEO & Meta" },
              { id: "settings", icon: "⚙️", label: "Pengaturan" }
            ].map((menu) => (
              <button
                key={menu.id}
                type="button"
                onClick={() => {
                  setActiveMenu(menu.id as any);
                  setActiveSubMenu("overview");
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition ${
                  activeMenu === menu.id
                    ? "bg-emerald-800 text-white font-bold shadow"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{menu.icon}</span>
                  {sidebarOpen && <span>{menu.label}</span>}
                </div>
                {sidebarOpen && menu.badge && (
                  <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                    {menu.badge}
                  </span>
                )}
                {sidebarOpen && menu.alertBadge !== undefined && menu.alertBadge > 0 && (
                  <span className="bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded-full text-[10px] animate-pulse">
                    {menu.alertBadge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Sidebar Bottom */}
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
        
        {/* Header Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold uppercase tracking-wider">
              <span>Admin</span>
              <span>&rsaquo;</span>
              <span className="text-emerald-800 font-bold">{activeMenu}</span>
            </div>
            <h1 className="font-serif font-bold text-xl sm:text-2xl text-slate-900 mt-1 capitalize">
              {activeMenu === "dashboard" && "Pusat Kendali & Statistik Website"}
              {activeMenu === "profile" && "🏛️ Kelola Halaman Profil (Sejarah, Visi Misi, Dosen, Sarana, Akreditasi)"}
              {activeMenu === "academic" && "📖 Kelola Akademik (Takhassus, Kurikulum 8 Semester, Kalender)"}
              {activeMenu === "content" && "🎨 Kustomisasi Hero Banner & Kalam Hikmah (Arab RTL)"}
              {activeMenu === "publications" && "📚 Publikasi Fiqh (Artikel, Kategori Tanpa Batas, Skripsi + Drive)"}
              {activeMenu === "bahtsul" && "🕌 Bahtsul Masail (Persiapan Fatwa, Soal Jawab & Subscriber)"}
              {activeMenu === "pmb" && "🎓 Penerimaan Mahasantri Baru (PMB Online, Gelombang & FAQ)"}
              {activeMenu === "information" && "📰 Warta Berita, Agenda & Galeri Foto Dokumentasi"}
              {activeMenu === "submissions" && "📥 Verifikasi Naskah Santri Masuk + 1-Click Terbitkan"}
              {activeMenu === "email" && "📧 Konfigurasi Email Redaksi, Template & Log Riwayat"}
              {activeMenu === "comingsoon" && "🔧 Manajemen Halaman Coming Soon / Placeholder"}
              {activeMenu === "users" && "👥 Manajemen Pengguna & Hak Akses"}
              {activeMenu === "media" && "🖼️ Media Library & Penyimpanan Berkas"}
              {activeMenu === "seo" && "🔍 Pengaturan SEO & Meta Per Halaman"}
              {activeMenu === "settings" && "⚙️ Identitas Lembaga, Sosial Media & Backup / Restore JSON"}
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
              Super Admin Aktif
            </span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            1. DASHBOARD
           ══════════════════════════════════════════════════════════════ */}
        {activeMenu === "dashboard" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-xs text-slate-400 font-bold uppercase">Artikel Terbit</span>
                <p className="font-serif font-bold text-3xl text-emerald-900">{articles.length}</p>
                <p className="text-[11px] text-emerald-700 font-medium">✓ 100% Siap Dibaca</p>
              </div>
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-xs text-slate-400 font-bold uppercase">Repositori Skripsi</span>
                <p className="font-serif font-bold text-3xl text-mahad-gold">{theses.length}</p>
                <p className="text-[11px] text-slate-500 font-medium">Link Google Drive Aktif</p>
              </div>
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-xs text-slate-400 font-bold uppercase">Dewan Dosen</span>
                <p className="font-serif font-bold text-3xl text-emerald-900">{lecturers.length}</p>
                <p className="text-[11px] text-slate-500 font-medium">Masyaikh &amp; Peneliti</p>
              </div>
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-xs text-slate-400 font-bold uppercase">Naskah Masuk</span>
                <p className="font-serif font-bold text-3xl text-amber-600">{pendingSubmissionsCount}</p>
                <p className="text-[11px] text-amber-700 font-medium">Butuh Review Redaksi</p>
              </div>
            </div>

            {/* Quick Chart & Pintasan */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-2 border-b">
                  <h3 className="font-serif font-bold text-base text-slate-900">
                    📈 Tren Pengunjung Website (30 Hari)
                  </h3>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg">
                    12.480 Pembaca
                  </span>
                </div>
                <div className="h-44 flex items-end justify-between gap-1 sm:gap-2 pt-6 px-2">
                  {[35, 45, 60, 50, 75, 90, 65, 80, 110, 95, 120, 140, 130, 160, 175].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                      <div
                        style={{ height: `${h}px` }}
                        className="w-full bg-emerald-700 group-hover:bg-mahad-gold rounded-t transition-all duration-200"
                      ></div>
                      <span className="text-[9px] text-slate-400">{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h3 className="font-serif font-bold text-base text-slate-900 pb-2 border-b">
                  ⚡ Pintasan Cepat
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveMenu("publications")}
                  className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-between"
                >
                  <span>➕ Tulis Artikel Fiqh Baru</span>
                  <span>&rarr;</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMenu("profile")}
                  className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-between"
                >
                  <span>🏛️ Kelola Profil &amp; Dosen</span>
                  <span>&rarr;</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMenu("academic")}
                  className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-between"
                >
                  <span>📖 Atur Kurikulum &amp; Kalender</span>
                  <span>&rarr;</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMenu("submissions")}
                  className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-between"
                >
                  <span>📥 Cek Naskah Masuk ({pendingSubmissionsCount})</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            2. PROFIL LEMBAGA
           ══════════════════════════════════════════════════════════════ */}
        {activeMenu === "profile" && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2 pb-2 border-b">
              {[
                { id: "sejarah", label: "📜 Sejarah & Deskripsi" },
                { id: "visimisi", label: "🎯 Visi & Misi" },
                { id: "dosen", label: `👳 Masyayikh & Dosen (${lecturers.length})` },
                { id: "sarana", label: `🏛️ Sarana & Prasarana (${facilities.length})` },
                { id: "akreditasi", label: `📜 Sertifikat Akreditasi (${accreditations.length})` }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSubMenu(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    activeSubMenu === tab.id
                      ? "bg-emerald-800 text-white shadow"
                      : "bg-white text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sub: Sejarah */}
            {(activeSubMenu === "overview" || activeSubMenu === "sejarah") && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
                <h3 className="font-serif font-bold text-lg text-slate-900 pb-2 border-b">
                  Edit Sejarah Pendirian Lembaga (2013)
                </h3>
                <form onSubmit={handleSaveSettings} className="space-y-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tanggal / Tahun Berdiri</label>
                    <input
                      type="text"
                      value={settingsForm.establishedDate}
                      onChange={(e) => setSettingsForm({ ...settingsForm, establishedDate: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Teks Sejarah Singkat Bahasa Arab (RTL)</label>
                    <textarea
                      rows={2}
                      dir="rtl"
                      value={settingsForm.historyArabic || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, historyArabic: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border rounded-lg font-serif text-right text-base"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Uraian Sejarah Lengkap</label>
                    <textarea
                      rows={6}
                      value={settingsForm.historyContent || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, historyContent: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border rounded-lg leading-relaxed"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow"
                  >
                    Simpan Sejarah
                  </button>
                </form>
              </div>
            )}

            {/* Sub: Visi Misi */}
            {activeSubMenu === "visimisi" && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
                <h3 className="font-serif font-bold text-lg text-slate-900 pb-2 border-b">
                  Edit Visi &amp; Misi Kelembagaan
                </h3>
                <form onSubmit={handleSaveSettings} className="space-y-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Visi Lembaga</label>
                    <textarea
                      rows={3}
                      value={settingsForm.visi}
                      onChange={(e) => setSettingsForm({ ...settingsForm, visi: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border rounded-lg leading-relaxed"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Misi Lembaga (Satu baris per poin misi)</label>
                    <textarea
                      rows={5}
                      value={settingsForm.misi.join("\n")}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, misi: e.target.value.split("\n").filter(Boolean) })
                      }
                      className="w-full p-2.5 bg-slate-50 border rounded-lg leading-relaxed"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow"
                  >
                    Simpan Visi &amp; Misi
                  </button>
                </form>
              </div>
            )}

            {/* Sub: Masyayikh & Dosen */}
            {activeSubMenu === "dosen" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
                  <h3 className="font-serif font-bold text-lg text-emerald-950 pb-2 border-b">
                    {isEditingLecturer ? "✏️ Edit Dosen" : "➕ Tambah Dosen Baru"}
                  </h3>
                  <form onSubmit={handleSaveLecturer} className="space-y-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nama Lengkap &amp; Gelar *</label>
                      <input
                        type="text"
                        required
                        value={lecturerForm.name}
                        onChange={(e) => setLecturerForm({ ...lecturerForm, name: e.target.value })}
                        className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Jabatan / Gelar Kehormatan</label>
                      <input
                        type="text"
                        value={lecturerForm.title}
                        onChange={(e) => setLecturerForm({ ...lecturerForm, title: e.target.value })}
                        className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                        placeholder="Guru Besar Fiqh / Dosen Senior"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Bidang Keahlian / Takhassus *</label>
                      <input
                        type="text"
                        required
                        value={lecturerForm.expertise}
                        onChange={(e) => setLecturerForm({ ...lecturerForm, expertise: e.target.value })}
                        className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">URL Foto Dosen</label>
                      <input
                        type="url"
                        value={lecturerForm.photoUrl}
                        onChange={(e) => setLecturerForm({ ...lecturerForm, photoUrl: e.target.value })}
                        className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Riwayat Pendidikan (Pisahkan Koma)</label>
                      <input
                        type="text"
                        value={lecturerForm.education}
                        onChange={(e) => setLecturerForm({ ...lecturerForm, education: e.target.value })}
                        className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-emerald-800 text-white font-bold rounded-xl shadow"
                    >
                      {isEditingLecturer ? "Simpan Perubahan Dosen" : "Tambahkan Dosen"}
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <h3 className="font-serif font-bold text-lg text-emerald-950 pb-2 border-b">
                    Daftar Dosen ({lecturers.length})
                  </h3>
                  <div className="space-y-2.5 max-h-175 overflow-y-auto">
                    {lecturers.map((lec) => (
                      <div key={lec.id} className="p-3 bg-slate-50 rounded-xl border flex items-center justify-between gap-3 text-xs">
                        <div>
                          <h4 className="font-bold text-slate-900">{lec.name}</h4>
                          <p className="text-emerald-800 text-[11px] font-semibold">{lec.title || lec.role}</p>
                          <p className="text-slate-500 text-[10px]">{lec.expertise}</p>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditingLecturer(true);
                              setEditingLecturerId(lec.id);
                              setLecturerForm({
                                name: lec.name,
                                title: lec.title,
                                role: lec.role,
                                photoUrl: lec.photoUrl,
                                expertise: lec.expertise,
                                education: lec.education.join(", "),
                                publications: lec.publications.join(", "),
                                order: lec.order,
                                isActive: lec.isActive
                              });
                            }}
                            className="px-2 py-1 bg-amber-500 text-white rounded font-bold"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Hapus dosen: "${lec.name}"?`)) deleteLecturer(lec.id);
                            }}
                            className="px-2 py-1 bg-red-600 text-white rounded font-bold"
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

            {/* Sub: Sarana */}
            {activeSubMenu === "sarana" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
                  <h3 className="font-serif font-bold text-lg text-emerald-950 pb-2 border-b">
                    ➕ Tambah Sarana / Prasarana
                  </h3>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!facilityForm.name) return;
                      addFacility(facilityForm);
                      alert("Sarana berhasil ditambahkan!");
                      setFacilityForm({ name: "", category: "Masjid", photoUrl: "", description: "" });
                    }}
                    className="space-y-3"
                  >
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nama Sarana *</label>
                      <input
                        type="text"
                        required
                        value={facilityForm.name}
                        onChange={(e) => setFacilityForm({ ...facilityForm, name: e.target.value })}
                        className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Kategori</label>
                      <select
                        value={facilityForm.category}
                        onChange={(e) => setFacilityForm({ ...facilityForm, category: e.target.value as any })}
                        className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                      >
                        <option value="Masjid">Masjid</option>
                        <option value="Asrama">Asrama</option>
                        <option value="Perpustakaan">Perpustakaan</option>
                        <option value="Laboratorium">Laboratorium</option>
                        <option value="Aula">Aula</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">URL Foto Sarana</label>
                      <input
                        type="url"
                        value={facilityForm.photoUrl}
                        onChange={(e) => setFacilityForm({ ...facilityForm, photoUrl: e.target.value })}
                        className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Deskripsi Fasilitas</label>
                      <textarea
                        rows={3}
                        value={facilityForm.description}
                        onChange={(e) => setFacilityForm({ ...facilityForm, description: e.target.value })}
                        className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                      />
                    </div>
                    <button type="submit" className="w-full py-2.5 bg-emerald-800 text-white font-bold rounded-xl shadow">
                      Simpan Sarana
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <h3 className="font-serif font-bold text-lg text-emerald-950 pb-2 border-b">
                    Daftar Sarana ({facilities.length})
                  </h3>
                  <div className="space-y-2.5">
                    {facilities.map((fac) => (
                      <div key={fac.id} className="p-3 bg-slate-50 rounded-xl border flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-emerald-800 text-[10px] bg-emerald-100 px-2 py-0.5 rounded">{fac.category}</span>
                          <h4 className="font-bold text-slate-900 mt-1">{fac.name}</h4>
                          <p className="text-slate-500 text-[11px]">{fac.description}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Hapus sarana: "${fac.name}"?`)) deleteFacility(fac.id);
                          }}
                          className="px-2.5 py-1 bg-red-600 text-white rounded font-bold"
                        >
                          Hapus
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Sub: Akreditasi */}
            {activeSubMenu === "akreditasi" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
                  <h3 className="font-serif font-bold text-lg text-emerald-950 pb-2 border-b">
                    ➕ Tambah Sertifikat Akreditasi
                  </h3>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!accreditationForm.name || !accreditationForm.pdfUrl) {
                        alert("Mohon isi nama sertifikat dan tautan PDF!");
                        return;
                      }
                      if (!validatePdfSize(accreditationForm.fileSize)) return;
                      addAccreditation(accreditationForm);
                      alert("Akreditasi berhasil disimpan!");
                      setAccreditationForm({
                        name: "",
                        issuer: "Kementerian Agama RI",
                        validDate: "Berlaku Permanen",
                        pdfUrl: "",
                        fileSize: "2.5 MB",
                        status: "Resmi Kemenag"
                      });
                    }}
                    className="space-y-3"
                  >
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nama Sertifikat *</label>
                      <input
                        type="text"
                        required
                        value={accreditationForm.name}
                        onChange={(e) => setAccreditationForm({ ...accreditationForm, name: e.target.value })}
                        className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Lembaga Penerbit</label>
                      <input
                        type="text"
                        value={accreditationForm.issuer}
                        onChange={(e) => setAccreditationForm({ ...accreditationForm, issuer: e.target.value })}
                        className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Masa Berlaku</label>
                        <input
                          type="text"
                          value={accreditationForm.validDate}
                          onChange={(e) => setAccreditationForm({ ...accreditationForm, validDate: e.target.value })}
                          className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Ukuran File</label>
                        <input
                          type="text"
                          value={accreditationForm.fileSize}
                          onChange={(e) => setAccreditationForm({ ...accreditationForm, fileSize: e.target.value })}
                          className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Link PDF Sertifikat (Google Drive / Cloud) *</label>
                      <input
                        type="url"
                        required
                        value={accreditationForm.pdfUrl}
                        onChange={(e) => setAccreditationForm({ ...accreditationForm, pdfUrl: e.target.value })}
                        className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                      />
                    </div>
                    <button type="submit" className="w-full py-2.5 bg-emerald-800 text-white font-bold rounded-xl shadow">
                      Simpan Akreditasi
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <h3 className="font-serif font-bold text-lg text-emerald-950 pb-2 border-b">
                    Sertifikat Aktif ({accreditations.length})
                  </h3>
                  <div className="space-y-2.5">
                    {accreditations.map((acc) => (
                      <div key={acc.id} className="p-3.5 bg-slate-50 rounded-xl border flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-emerald-800 text-[10px] bg-emerald-100 px-2 py-0.5 rounded">{acc.status}</span>
                          <h4 className="font-bold text-slate-900 mt-1">{acc.name}</h4>
                          <p className="text-slate-500 text-[11px]">{acc.issuer} &bull; {acc.validDate}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Hapus akreditasi: "${acc.name}"?`)) deleteAccreditation(acc.id);
                          }}
                          className="px-2.5 py-1 bg-red-600 text-white rounded font-bold"
                        >
                          Hapus
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            3. AKADEMIK (KURIKULUM 8 SEMESTER & KALENDER)
           ══════════════════════════════════════════════════════════════ */}
        {activeMenu === "academic" && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2 pb-2 border-b">
              {[
                { id: "kurikulum", label: `📚 Kurikulum 8 Semester (${courses.length} Matkul)` },
                { id: "kalender", label: `📅 Kalender Akademik (${calendarEvents.length} Agenda)` },
                { id: "pedoman", label: "📘 Buku Pedoman & Penilaian" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSubMenu(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    activeSubMenu === tab.id
                      ? "bg-emerald-800 text-white shadow"
                      : "bg-white text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sub: Kurikulum */}
            {(activeSubMenu === "overview" || activeSubMenu === "kurikulum") && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
                  <h3 className="font-serif font-bold text-lg text-emerald-950 pb-2 border-b">
                    {isEditingCourse ? "✏️ Edit Mata Kuliah" : "➕ Tambah Mata Kuliah Baru"}
                  </h3>
                  <form onSubmit={handleSaveCourse} className="space-y-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nama Mata Kuliah *</label>
                      <input
                        type="text"
                        required
                        value={courseForm.name}
                        onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                        className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                        placeholder="Misal: Fiqh Muamalah Kontemporer"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Semester (1-8)</label>
                        <select
                          value={courseForm.semester}
                          onChange={(e) => setCourseForm({ ...courseForm, semester: parseInt(e.target.value) })}
                          className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                            <option key={s} value={s}>Semester {s}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Bobot SKS</label>
                        <input
                          type="number"
                          value={courseForm.credits}
                          onChange={(e) => setCourseForm({ ...courseForm, credits: parseInt(e.target.value) })}
                          className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Kitab Rujukan Utama</label>
                      <input
                        type="text"
                        value={courseForm.mainBook}
                        onChange={(e) => setCourseForm({ ...courseForm, mainBook: e.target.value })}
                        className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                        placeholder="Fathul Mu'in / Jam'ul Jawami'"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Dosen Pengampu</label>
                      <input
                        type="text"
                        value={courseForm.lecturer}
                        onChange={(e) => setCourseForm({ ...courseForm, lecturer: e.target.value })}
                        className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Deskripsi Ringkas</label>
                      <textarea
                        rows={2}
                        value={courseForm.description}
                        onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                        className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                      />
                    </div>
                    <button type="submit" className="w-full py-2.5 bg-emerald-800 text-white font-bold rounded-xl shadow">
                      {isEditingCourse ? "Simpan Perubahan Matkul" : "Tambahkan Matkul"}
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <h3 className="font-serif font-bold text-lg text-emerald-950 pb-2 border-b">
                    Daftar Kurikulum ({courses.length} Mata Kuliah)
                  </h3>
                  <div className="space-y-2.5 max-h-175 overflow-y-auto">
                    {courses.map((crs) => (
                      <div key={crs.id} className="p-3 bg-slate-50 rounded-xl border flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-emerald-800 text-[10px] bg-emerald-100 px-2 py-0.5 rounded">
                            Semester {crs.semester} &bull; {crs.credits} SKS
                          </span>
                          <h4 className="font-bold text-slate-900 mt-1">{crs.name}</h4>
                          <p className="text-slate-500 text-[11px]">Kitab: {crs.mainBook} | Dosen: {crs.lecturer}</p>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditingCourse(true);
                              setEditingCourseId(crs.id);
                              setCourseForm({
                                name: crs.name,
                                semester: crs.semester,
                                credits: crs.credits,
                                mainBook: crs.mainBook,
                                supportBook: crs.supportBook,
                                lecturer: crs.lecturer,
                                description: crs.description
                              });
                            }}
                            className="px-2 py-1 bg-amber-500 text-white rounded font-bold"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Hapus matkul: "${crs.name}"?`)) deleteCourse(crs.id);
                            }}
                            className="px-2 py-1 bg-red-600 text-white rounded font-bold"
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

            {/* Sub: Kalender */}
            {activeSubMenu === "kalender" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
                  <h3 className="font-serif font-bold text-lg text-emerald-950 pb-2 border-b">
                    ➕ Tambah Agenda Kalender
                  </h3>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!calendarForm.name) return;
                      addCalendarEvent(calendarForm);
                      alert("Agenda kalender berhasil ditambahkan!");
                      setCalendarForm({
                        name: "",
                        startDate: "01 Nov 2026",
                        endDate: "05 Nov 2026",
                        category: "kuliah",
                        description: ""
                      });
                    }}
                    className="space-y-3"
                  >
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nama Kegiatan *</label>
                      <input
                        type="text"
                        required
                        value={calendarForm.name}
                        onChange={(e) => setCalendarForm({ ...calendarForm, name: e.target.value })}
                        className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Tanggal Mulai</label>
                        <input
                          type="text"
                          value={calendarForm.startDate}
                          onChange={(e) => setCalendarForm({ ...calendarForm, startDate: e.target.value })}
                          className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Tanggal Selesai</label>
                        <input
                          type="text"
                          value={calendarForm.endDate}
                          onChange={(e) => setCalendarForm({ ...calendarForm, endDate: e.target.value })}
                          className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Kategori</label>
                      <select
                        value={calendarForm.category}
                        onChange={(e) => setCalendarForm({ ...calendarForm, category: e.target.value as any })}
                        className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                      >
                        <option value="kuliah">Perkuliahan</option>
                        <option value="ujian">Ujian (UTS/UAS/Munaqasyah)</option>
                        <option value="libur">Libur Semester</option>
                        <option value="kegiatan">Kegiatan / Simposium</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Deskripsi</label>
                      <textarea
                        rows={2}
                        value={calendarForm.description}
                        onChange={(e) => setCalendarForm({ ...calendarForm, description: e.target.value })}
                        className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                      />
                    </div>
                    <button type="submit" className="w-full py-2.5 bg-emerald-800 text-white font-bold rounded-xl shadow">
                      Simpan Agenda Kalender
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <h3 className="font-serif font-bold text-lg text-emerald-950 pb-2 border-b">
                    Agenda Kalender Akademik ({calendarEvents.length})
                  </h3>
                  <div className="space-y-2.5">
                    {calendarEvents.map((ev) => (
                      <div key={ev.id} className="p-3 bg-slate-50 rounded-xl border flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-emerald-800 text-[10px] bg-emerald-100 px-2 py-0.5 rounded">{ev.category}</span>
                          <h4 className="font-bold text-slate-900 mt-1">{ev.name}</h4>
                          <p className="text-slate-500 text-[11px]">{ev.startDate} s/d {ev.endDate}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Hapus agenda: "${ev.name}"?`)) deleteCalendarEvent(ev.id);
                          }}
                          className="px-2.5 py-1 bg-red-600 text-white rounded font-bold"
                        >
                          Hapus
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Sub: Pedoman & Penilaian */}
            {activeSubMenu === "pedoman" && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
                <h3 className="font-serif font-bold text-lg text-slate-900 pb-2 border-b">
                  Pedoman Akademik &amp; Aturan Penilaian
                </h3>
                <form onSubmit={handleSaveSettings} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Link Download Buku Pedoman PDF (Drive)</label>
                      <input
                        type="url"
                        value={settingsForm.academicGuideBookUrl || ""}
                        onChange={(e) => setSettingsForm({ ...settingsForm, academicGuideBookUrl: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Ukuran File Pedoman</label>
                      <input
                        type="text"
                        value={settingsForm.academicGuideBookSize || "4.5 MB"}
                        onChange={(e) => setSettingsForm({ ...settingsForm, academicGuideBookSize: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border rounded-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Sistem Penilaian &amp; Syarat Kelulusan</label>
                    <textarea
                      rows={4}
                      value={settingsForm.gradingSystemRules || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, gradingSystemRules: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border rounded-lg leading-relaxed"
                    />
                  </div>
                  <button type="submit" className="px-6 py-2.5 bg-emerald-800 text-white font-bold rounded-xl shadow">
                    Simpan Pedoman Akademik
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            4. KONTEN TAMPILAN (HERO & QUOTE)
           ══════════════════════════════════════════════════════════════ */}
        {activeMenu === "content" && (
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
              <h3 className="font-serif font-bold text-lg text-slate-900 pb-2 border-b">
                🌟 Kustomisasi Hero Banner &amp; Motto Arab
              </h3>
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Badge Tagline</label>
                  <input
                    type="text"
                    value={settingsForm.hero?.badge || ""}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, hero: { ...(settingsForm.hero as any), badge: e.target.value } })
                    }
                    className="w-full p-2.5 bg-slate-50 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Judul Hero Banner</label>
                  <input
                    type="text"
                    value={settingsForm.hero?.title || ""}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, hero: { ...(settingsForm.hero as any), title: e.target.value } })
                    }
                    className="w-full p-2.5 bg-slate-50 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Motto Bahasa Arab (RTL)</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={settingsForm.hero?.arabicMotto || ""}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, hero: { ...(settingsForm.hero as any), arabicMotto: e.target.value } })
                    }
                    className="w-full p-2.5 bg-slate-50 border rounded-lg font-serif text-right text-base"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subtitle Hero</label>
                  <textarea
                    rows={3}
                    value={settingsForm.hero?.subtitle || ""}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, hero: { ...(settingsForm.hero as any), subtitle: e.target.value } })
                    }
                    className="w-full p-2.5 bg-slate-50 border rounded-lg leading-relaxed"
                  />
                </div>
                <button type="submit" className="px-6 py-2.5 bg-emerald-800 text-white font-bold rounded-xl shadow">
                  Simpan Hero Banner
                </button>
              </form>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
              <h3 className="font-serif font-bold text-lg text-slate-900 pb-2 border-b">
                💬 Kalam Hikmah / Kata Mutiara Anregurutta
              </h3>
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Matan Teks Arab (RTL)</label>
                  <textarea
                    rows={2}
                    dir="rtl"
                    value={settingsForm.quote?.arabicQuote || ""}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, quote: { ...(settingsForm.quote as any), arabicQuote: e.target.value } })
                    }
                    className="w-full p-2.5 bg-slate-50 border rounded-lg font-serif text-right text-base"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Terjemahan Indonesia</label>
                  <textarea
                    rows={3}
                    value={settingsForm.quote?.translation || ""}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, quote: { ...(settingsForm.quote as any), translation: e.target.value } })
                    }
                    className="w-full p-2.5 bg-slate-50 border rounded-lg leading-relaxed"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Sumber Rujukan</label>
                    <input
                      type="text"
                      value={settingsForm.quote?.source || ""}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, quote: { ...(settingsForm.quote as any), source: e.target.value } })
                      }
                      className="w-full p-2.5 bg-slate-50 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Konteks</label>
                    <input
                      type="text"
                      value={settingsForm.quote?.context || ""}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, quote: { ...(settingsForm.quote as any), context: e.target.value } })
                      }
                      className="w-full p-2.5 bg-slate-50 border rounded-lg"
                    />
                  </div>
                </div>
                <button type="submit" className="px-6 py-2.5 bg-emerald-800 text-white font-bold rounded-xl shadow">
                  Simpan Kalam Hikmah
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            5. PUBLIKASI (ARTIKEL, KATEGORI, SKRIPSI)
           ══════════════════════════════════════════════════════════════ */}
        {activeMenu === "publications" && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2 pb-2 border-b">
              {[
                { id: "articles", label: `📝 Artikel (${articles.length})` },
                { id: "categories", label: `🏷️ Kategori (${categories.length})` },
                { id: "theses", label: `🎓 Skripsi (${theses.length})` }
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

            {/* Sub: Artikel */}
            {(activeSubMenu === "overview" || activeSubMenu === "articles") && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
                  <h3 className="font-serif font-bold text-lg text-emerald-950 pb-2 border-b">
                    {isEditingArticle ? "✏️ Edit Artikel" : "➕ Tulis Artikel Baru"}
                  </h3>
                  <form onSubmit={handleSaveArticle} className="space-y-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Judul Artikel *</label>
                      <input
                        type="text"
                        required
                        value={articleForm.title}
                        onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                        className="w-full p-2.5 text-sm bg-slate-50 border rounded-lg"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Kategori</label>
                        <select
                          value={articleForm.category}
                          onChange={(e) => {
                            const sel = categories.find((c) => c.slug === e.target.value);
                            setArticleForm({
                              ...articleForm,
                              category: e.target.value,
                              categoryLabel: sel?.name || e.target.value,
                              isSpecial: e.target.value === "karya-anregurutta"
                            });
                          }}
                          className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.slug}>{c.name}</option>
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
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Abstrak Singkat</label>
                      <textarea
                        rows={2}
                        value={articleForm.excerpt}
                        onChange={(e) => setArticleForm({ ...articleForm, excerpt: e.target.value })}
                        className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Kutipan Arab (Opsional)</label>
                      <input
                        type="text"
                        dir="rtl"
                        value={articleForm.arabicSnippet}
                        onChange={(e) => setArticleForm({ ...articleForm, arabicSnippet: e.target.value })}
                        className="w-full p-2 text-xs bg-slate-50 border rounded-lg font-serif text-right"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Isi Lengkap Artikel *</label>
                      <textarea
                        rows={7}
                        required
                        value={articleForm.content}
                        onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })}
                        className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Tags (Pisahkan koma)</label>
                      <input
                        type="text"
                        value={articleForm.tags}
                        onChange={(e) => setArticleForm({ ...articleForm, tags: e.target.value })}
                        className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                        placeholder="Fiqh, Fintech, Kripto"
                      />
                    </div>
                    <button type="submit" className="w-full py-2.5 bg-emerald-800 text-white font-bold rounded-xl shadow">
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
                      <div key={art.id} className="p-3 bg-slate-50 rounded-xl border flex items-start justify-between gap-3 text-xs">
                        <div>
                          <span className="font-bold text-emerald-800 uppercase text-[10px]">{art.categoryLabel}</span>
                          <h4 className="font-bold text-slate-900 mt-0.5">{art.title}</h4>
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

            {/* Sub: Kategori */}
            {activeSubMenu === "categories" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
                  <h3 className="font-serif font-bold text-lg text-emerald-950 pb-2 border-b">
                    {isEditingCat ? "✏️ Edit Kategori" : "➕ Tambah Kategori Baru (Tanpa Batas)"}
                  </h3>
                  <form onSubmit={handleSaveCategory} className="space-y-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nama Kategori *</label>
                      <input
                        type="text"
                        required
                        value={catForm.name}
                        onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                        className="w-full p-2.5 text-sm bg-slate-50 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Deskripsi</label>
                      <textarea
                        rows={3}
                        value={catForm.description}
                        onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                        className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                      />
                    </div>
                    <button type="submit" className="w-full py-2.5 bg-emerald-800 text-white font-bold rounded-xl shadow">
                      {isEditingCat ? "Simpan Kategori" : "Tambah Kategori"}
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <h3 className="font-serif font-bold text-lg text-emerald-950 pb-2 border-b">
                    Daftar Kategori ({categories.length})
                  </h3>
                  <div className="space-y-2.5 max-h-175 overflow-y-auto">
                    {categories.map((c) => (
                      <div key={c.id} className="p-3 bg-slate-50 rounded-xl border flex items-center justify-between text-xs">
                        <div>
                          <h4 className="font-bold text-slate-900">{c.name}</h4>
                          <p className="text-slate-500 text-[11px] line-clamp-1">{c.description}</p>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditingCat(true);
                              setEditingCatId(c.id);
                              setCatForm({ name: c.name, description: c.description, iconName: c.iconName });
                            }}
                            className="px-2.5 py-1 bg-amber-500 text-white rounded font-bold"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Hapus kategori: "${c.name}"?`)) deleteCategory(c.id);
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

            {/* Sub: Skripsi */}
            {activeSubMenu === "theses" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
                  <h3 className="font-serif font-bold text-lg text-emerald-950 pb-2 border-b">
                    {isEditingThesis ? "✏️ Edit Skripsi" : "➕ Tambah Skripsi Mahasantri"}
                  </h3>
                  <form onSubmit={handleSaveThesis} className="space-y-3">
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
                        <label className="block font-bold text-slate-700 mb-1">Ukuran File (Max 10 MB)</label>
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
                      <label className="block font-bold text-slate-700 mb-1">Abstrak Indonesia</label>
                      <textarea
                        rows={3}
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
                    <button type="submit" className="w-full py-2.5 bg-emerald-800 text-white font-bold rounded-xl shadow">
                      {isEditingThesis ? "Simpan Perubahan" : "Tambahkan Skripsi"}
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <h3 className="font-serif font-bold text-lg text-emerald-950 pb-2 border-b">
                    Repositori Skripsi ({theses.length})
                  </h3>
                  <div className="space-y-2.5 max-h-175 overflow-y-auto">
                    {theses.map((th) => (
                      <div key={th.id} className="p-3 bg-slate-50 rounded-xl border flex items-start justify-between text-xs">
                        <div>
                          <span className="font-bold text-emerald-800 text-[10px]">Tahun {th.year} &bull; {th.categoryLabel}</span>
                          <h4 className="font-bold text-slate-900 mt-0.5">{th.title}</h4>
                          <p className="text-slate-500 text-[11px]">Penulis: {th.author} (NIM: {th.nim})</p>
                          <a href={th.downloadUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-bold underline text-[11px]">
                            Buka Link Google Drive ({th.fileSize}) &rarr;
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
            6. BAHTSUL MASAIL (STATUS COMING SOON / MANAJEMEN)
           ══════════════════════════════════════════════════════════════ */}
        {activeMenu === "bahtsul" && (
          <div className="space-y-6 text-xs">
            {/* Status Card */}
            <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-200 px-2 py-0.5 rounded">
                  Status: COMING SOON (Desember 2026)
                </span>
                <h3 className="font-serif font-bold text-lg text-amber-950 mt-1">
                  Kanal Bahtsul Masail &amp; Fatwa Kontemporer Online
                </h3>
                <p className="text-slate-600 text-xs mt-0.5">
                  Anda dapat menyiapkan draf tanya jawab fiqh dan fatwa terlebih dahulu sebelum portal ini diaktifkan ke publik.
                </p>
              </div>
              <Link
                href="/bahtsul-masail"
                target="_blank"
                className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white font-bold rounded-xl shadow shrink-0"
              >
                Pratinjau Halaman Publik &rarr;
              </Link>
            </div>

            {/* Form Tambah Draft Bahtsul */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-serif font-bold text-lg text-emerald-950 pb-2 border-b">
                  ➕ Buat Draf Keputusan / Tanya Jawab Fiqh
                </h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!bahtsulForm.title || !bahtsulForm.answer) {
                      alert("Mohon isi judul dan jawaban fatwa!");
                      return;
                    }
                    addBahtsulQA(bahtsulForm);
                    alert("Draf Bahtsul Masail berhasil disimpan!");
                    setBahtsulForm({
                      title: "",
                      question: "",
                      answer: "",
                      theme: "Fiqh Muamalah Kontemporer",
                      author: "Lembaga Bahtsul Masail",
                      date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
                      status: "published",
                      arabicReferences: ""
                    });
                  }}
                  className="space-y-3"
                >
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Judul Masalah / Fatwa *</label>
                    <input
                      type="text"
                      required
                      value={bahtsulForm.title}
                      onChange={(e) => setBahtsulForm({ ...bahtsulForm, title: e.target.value })}
                      className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tema / Kategori Kajian</label>
                    <input
                      type="text"
                      value={bahtsulForm.theme}
                      onChange={(e) => setBahtsulForm({ ...bahtsulForm, theme: e.target.value })}
                      className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Pertanyaan / Pokok Masalah *</label>
                    <textarea
                      rows={2}
                      required
                      value={bahtsulForm.question}
                      onChange={(e) => setBahtsulForm({ ...bahtsulForm, question: e.target.value })}
                      className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Keputusan / Jawaban Hukum *</label>
                    <textarea
                      rows={4}
                      required
                      value={bahtsulForm.answer}
                      onChange={(e) => setBahtsulForm({ ...bahtsulForm, answer: e.target.value })}
                      className="w-full p-2 text-xs bg-slate-50 border rounded-lg leading-relaxed"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Rujukan / Ibarat Kitab Arab (RTL)</label>
                    <textarea
                      rows={2}
                      dir="rtl"
                      value={bahtsulForm.arabicReferences || ""}
                      onChange={(e) => setBahtsulForm({ ...bahtsulForm, arabicReferences: e.target.value })}
                      className="w-full p-2 text-xs bg-slate-50 border rounded-lg font-serif text-right"
                    />
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-emerald-800 text-white font-bold rounded-xl shadow">
                    Simpan Draf Bahtsul
                  </button>
                </form>
              </div>

              <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h3 className="font-serif font-bold text-lg text-emerald-950 pb-2 border-b">
                  Daftar Arsip Bahtsul Masail ({bahtsulQA.length})
                </h3>
                <div className="space-y-2.5">
                  {bahtsulQA.map((bm) => (
                    <div key={bm.id} className="p-3.5 bg-slate-50 rounded-xl border space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-800 text-[10px] bg-emerald-100 px-2 py-0.5 rounded">{bm.theme}</span>
                        <span className="text-slate-400 text-[10px]">{bm.date}</span>
                      </div>
                      <h4 className="font-bold text-slate-900">{bm.title}</h4>
                      <p className="text-slate-600 line-clamp-2">{bm.answer}</p>
                      <div className="flex justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Hapus keputusan: "${bm.title}"?`)) deleteBahtsulQA(bm.id);
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
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            7. PMB ONLINE (STATUS COMING SOON / MANAJEMEN)
           ══════════════════════════════════════════════════════════════ */}
        {activeMenu === "pmb" && (
          <div className="space-y-6 text-xs">
            {/* Status Card */}
            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-200 px-2 py-0.5 rounded">
                  Status: COMING SOON (Januari 2027) &bull; Beasiswa Penuh 100%
                </span>
                <h3 className="font-serif font-bold text-lg text-emerald-950 mt-1">
                  Penerimaan Mahasantri Baru (PMB Online)
                </h3>
                <p className="text-slate-600 text-xs mt-0.5">
                  Kelola gelombang pendaftaran, persyaratan berkas, kuota mahasantri, dan FAQ pendaftaran.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleExportSubscribersCsv}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow"
                >
                  📥 Unduh CSV Subscriber ({subscribers.length})
                </button>
                <Link
                  href="/pmb"
                  target="_blank"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow"
                >
                  Pratinjau &rarr;
                </Link>
              </div>
            </div>

            {/* Gelombang PMB & FAQ Form */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-serif font-bold text-lg text-emerald-950 pb-2 border-b">
                  ➕ Tambah Gelombang Pendaftaran PMB
                </h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!pmbWaveForm.name) return;
                    addPMBWave({
                      name: pmbWaveForm.name,
                      startDate: pmbWaveForm.startDate,
                      endDate: pmbWaveForm.endDate,
                      quota: pmbWaveForm.quota,
                      scholarshipInfo: pmbWaveForm.scholarshipInfo,
                      requirements: pmbWaveForm.requirements.split("\n").filter(Boolean),
                      procedure: pmbWaveForm.procedure.split("\n").filter(Boolean)
                    });
                    alert("Gelombang PMB berhasil ditambahkan!");
                    setPmbWaveForm({
                      name: "",
                      startDate: "01 Jan 2027",
                      endDate: "28 Feb 2027",
                      quota: "15 Mahasantri",
                      scholarshipInfo: "Beasiswa Penuh 100%",
                      requirements: "Lulusan MA/Pesantren\nHafalan 5 Juz\nMampu baca kitab kuning",
                      procedure: "Daftar Online\nUnggah Berkas\nTes Seleksi Kitab"
                    });
                  }}
                  className="space-y-3"
                >
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama Gelombang *</label>
                    <input
                      type="text"
                      required
                      value={pmbWaveForm.name}
                      onChange={(e) => setPmbWaveForm({ ...pmbWaveForm, name: e.target.value })}
                      className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Tanggal Buka</label>
                      <input
                        type="text"
                        value={pmbWaveForm.startDate}
                        onChange={(e) => setPmbWaveForm({ ...pmbWaveForm, startDate: e.target.value })}
                        className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Tanggal Tutup</label>
                      <input
                        type="text"
                        value={pmbWaveForm.endDate}
                        onChange={(e) => setPmbWaveForm({ ...pmbWaveForm, endDate: e.target.value })}
                        className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Kuota Mahasantri</label>
                      <input
                        type="text"
                        value={pmbWaveForm.quota}
                        onChange={(e) => setPmbWaveForm({ ...pmbWaveForm, quota: e.target.value })}
                        className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Info Beasiswa</label>
                      <input
                        type="text"
                        value={pmbWaveForm.scholarshipInfo}
                        onChange={(e) => setPmbWaveForm({ ...pmbWaveForm, scholarshipInfo: e.target.value })}
                        className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Persyaratan (Per Baris)</label>
                    <textarea
                      rows={3}
                      value={pmbWaveForm.requirements}
                      onChange={(e) => setPmbWaveForm({ ...pmbWaveForm, requirements: e.target.value })}
                      className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                    />
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-emerald-800 text-white font-bold rounded-xl shadow">
                    Simpan Gelombang PMB
                  </button>
                </form>
              </div>

              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <h3 className="font-serif font-bold text-lg text-emerald-950 pb-2 border-b">
                    Gelombang Aktif ({pmbWaves.length})
                  </h3>
                  <div className="space-y-2.5">
                    {pmbWaves.map((w) => (
                      <div key={w.id} className="p-3 bg-slate-50 rounded-xl border flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-emerald-800 text-[10px] bg-emerald-100 px-2 py-0.5 rounded">Kuota: {w.quota}</span>
                          <h4 className="font-bold text-slate-900 mt-1">{w.name}</h4>
                          <p className="text-slate-500 text-[11px]">{w.startDate} s/d {w.endDate} &bull; {w.scholarshipInfo}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Hapus gelombang: "${w.name}"?`)) deletePMBWave(w.id);
                          }}
                          className="px-2.5 py-1 bg-red-600 text-white rounded font-bold"
                        >
                          Hapus
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FAQ Management */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <h3 className="font-serif font-bold text-lg text-emerald-950 pb-2 border-b">
                    ➕ Tambah FAQ PMB
                  </h3>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!pmbFaqForm.question || !pmbFaqForm.answer) return;
                      addPMBFAQ(pmbFaqForm);
                      alert("FAQ berhasil ditambahkan!");
                      setPmbFaqForm({ question: "", answer: "", category: "Pendaftaran" });
                    }}
                    className="space-y-2.5"
                  >
                    <input
                      type="text"
                      required
                      placeholder="Pertanyaan FAQ..."
                      value={pmbFaqForm.question}
                      onChange={(e) => setPmbFaqForm({ ...pmbFaqForm, question: e.target.value })}
                      className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                    />
                    <textarea
                      rows={2}
                      required
                      placeholder="Jawaban resmi..."
                      value={pmbFaqForm.answer}
                      onChange={(e) => setPmbFaqForm({ ...pmbFaqForm, answer: e.target.value })}
                      className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                    />
                    <button type="submit" className="px-4 py-2 bg-slate-800 text-white font-bold rounded-lg shadow">
                      Tambah FAQ
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            8. INFORMASI & GALERI FOTO
           ══════════════════════════════════════════════════════════════ */}
        {activeMenu === "information" && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2 pb-2 border-b">
              {[
                { id: "news", label: `📰 Berita & Warta (${news.length})` },
                { id: "gallery", label: `🖼️ Galeri Foto & Album (${galleryAlbums.length})` }
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

            {/* Sub: Berita */}
            {(activeSubMenu === "overview" || activeSubMenu === "news") && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
                  <h3 className="font-serif font-bold text-lg text-emerald-950 pb-2 border-b">
                    {isEditingNews ? "✏️ Edit Berita" : "➕ Tulis Warta / Pengumuman"}
                  </h3>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newsForm.title || !newsForm.content) return;
                      if (isEditingNews && editingNewsId) {
                        updateNews(editingNewsId, newsForm);
                        alert("Berita berhasil diperbarui!");
                      } else {
                        addNews(newsForm);
                        alert("Berita baru diterbitkan!");
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
                    }}
                    className="space-y-3"
                  >
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Judul *</label>
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
                        <label className="block font-bold text-slate-700 mb-1">Kategori</label>
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
                        <label className="block font-bold text-slate-700 mb-1">Penulis</label>
                        <input
                          type="text"
                          value={newsForm.author}
                          onChange={(e) => setNewsForm({ ...newsForm, author: e.target.value })}
                          className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Isi Lengkap *</label>
                      <textarea
                        rows={6}
                        required
                        value={newsForm.content}
                        onChange={(e) =>
                          setNewsForm({ ...newsForm, content: e.target.value, excerpt: e.target.value.slice(0, 120) + "..." })
                        }
                        className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                      />
                    </div>
                    <button type="submit" className="w-full py-2.5 bg-emerald-800 text-white font-bold rounded-xl shadow">
                      {isEditingNews ? "Simpan Perubahan" : "Terbitkan Warta"}
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <h3 className="font-serif font-bold text-lg text-emerald-950 pb-2 border-b">
                    Daftar Warta ({news.length})
                  </h3>
                  <div className="space-y-2.5 max-h-175 overflow-y-auto">
                    {news.map((item) => (
                      <div key={item.id} className="p-3 bg-slate-50 rounded-xl border flex items-start justify-between text-xs">
                        <div>
                          <span className="font-bold text-emerald-800 text-[10px]">{item.category} &bull; {item.date}</span>
                          <h4 className="font-bold text-slate-900 mt-0.5">{item.title}</h4>
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

            {/* Sub: Galeri */}
            {activeSubMenu === "gallery" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
                  <h3 className="font-serif font-bold text-lg text-emerald-950 pb-2 border-b">
                    ➕ Tambah Album Galeri Foto
                  </h3>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!galleryForm.title || !galleryForm.coverUrl) {
                        alert("Mohon isi judul dan URL foto sampul!");
                        return;
                      }
                      addGalleryAlbum({
                        title: galleryForm.title,
                        category: galleryForm.category,
                        date: galleryForm.date,
                        coverUrl: galleryForm.coverUrl,
                        photos: [
                          { id: "ph-" + Date.now().toString(), url: galleryForm.coverUrl, caption: galleryForm.captionInput || galleryForm.title }
                        ]
                      });
                      alert("Album galeri berhasil ditambahkan!");
                      setGalleryForm({
                        title: "",
                        category: "Kegiatan Akademik",
                        date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
                        coverUrl: "",
                        photoUrlInput: "",
                        captionInput: ""
                      });
                    }}
                    className="space-y-3"
                  >
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Judul Album *</label>
                      <input
                        type="text"
                        required
                        value={galleryForm.title}
                        onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                        className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Kategori Album</label>
                      <input
                        type="text"
                        value={galleryForm.category}
                        onChange={(e) => setGalleryForm({ ...galleryForm, category: e.target.value })}
                        className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">URL Foto Sampul *</label>
                      <input
                        type="url"
                        required
                        value={galleryForm.coverUrl}
                        onChange={(e) => setGalleryForm({ ...galleryForm, coverUrl: e.target.value })}
                        className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Keterangan / Caption</label>
                      <input
                        type="text"
                        value={galleryForm.captionInput}
                        onChange={(e) => setGalleryForm({ ...galleryForm, captionInput: e.target.value })}
                        className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                      />
                    </div>
                    <button type="submit" className="w-full py-2.5 bg-emerald-800 text-white font-bold rounded-xl shadow">
                      Simpan Album Galeri
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <h3 className="font-serif font-bold text-lg text-emerald-950 pb-2 border-b">
                    Album Galeri ({galleryAlbums.length})
                  </h3>
                  <div className="space-y-2.5">
                    {galleryAlbums.map((alb) => (
                      <div key={alb.id} className="p-3 bg-slate-50 rounded-xl border flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-emerald-800 text-[10px] bg-emerald-100 px-2 py-0.5 rounded">{alb.category}</span>
                          <h4 className="font-bold text-slate-900 mt-1">{alb.title}</h4>
                          <p className="text-slate-500 text-[11px]">{alb.date} &bull; {alb.photos.length} Foto</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Hapus album: "${alb.title}"?`)) deleteGalleryAlbum(alb.id);
                          }}
                          className="px-2.5 py-1 bg-red-600 text-white rounded font-bold"
                        >
                          Hapus
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            9. SUBMISSION (NASKAH MASUK & 1-CLICK PUBLISH)
           ══════════════════════════════════════════════════════════════ */}
        {activeMenu === "submissions" && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-xs">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <h3 className="font-serif font-bold text-lg text-emerald-950">
                  📥 Kotak Masuk Naskah Mahasantri &amp; Dosen ({submissions.length})
                </h3>
                <p className="text-slate-500 text-xs">
                  Email tujuan notifikasi aktif: <strong>{settings.emailSubmission}</strong>
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
                  <div key={sub.id} className="p-5 bg-slate-50 rounded-xl border space-y-3">
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

                    <div className="p-3 bg-white border rounded-lg text-slate-700 leading-relaxed">
                      <strong>Abstrak Naskah:</strong>
                      <p className="mt-1">{sub.abstrak}</p>
                    </div>

                    {sub.fileLink && (
                      <p className="text-emerald-800">
                        Link Dokumen:{" "}
                        <a href={sub.fileLink} target="_blank" rel="noopener noreferrer" className="underline font-bold">
                          {sub.fileLink}
                        </a>
                      </p>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => updateSubmissionStatus(sub.id, "review")}
                          className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded font-bold"
                        >
                          Set: Review
                        </button>
                        <button
                          type="button"
                          onClick={() => updateSubmissionStatus(sub.id, "revisi")}
                          className="px-2.5 py-1 bg-purple-100 text-purple-900 rounded font-bold"
                        >
                          Set: Butuh Revisi
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            addArticle({
                              title: sub.judul,
                              excerpt: sub.abstrak.slice(0, 150) + "...",
                              content: sub.abstrak,
                              author: sub.nama,
                              authorRole: sub.afiliasi || "Mahasantri Marhalah Ula",
                              category: categories[0]?.slug || "fiqh-muamalah-kontemporer",
                              categoryLabel: sub.kategori,
                              date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
                              hijriDate: "1448 H",
                              readTime: "5 menit"
                            });
                            updateSubmissionStatus(sub.id, "publish");
                            sendEmailNotification(sub.email, `Naskah "${sub.judul}" Diterbitkan di Ma'had Aly`);
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
            10. EMAIL & NOTIFIKASI
           ══════════════════════════════════════════════════════════════ */}
        {activeMenu === "email" && (
          <div className="space-y-6 text-xs font-medium">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-lg text-slate-900 pb-2 border-b">
                📧 Pengaturan Email Tujuan &amp; Notifikasi Redaksi
              </h3>
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Utama Penerima Naskah</label>
                  <input
                    type="email"
                    required
                    value={settingsForm.emailSubmission}
                    onChange={(e) => setSettingsForm({ ...settingsForm, emailSubmission: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-lg"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Default resmi: <strong>munzirahmad779@gmail.com</strong></p>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Template Notifikasi Naskah Diterbitkan</label>
                  <textarea
                    rows={3}
                    defaultValue="Yth. {{nama}}, Alhamdulillah naskah Anda yang berjudul '{{judul}}' telah disetujui dan diterbitkan di Mimbar Kajian Ma'had Aly DDI Mangkoso."
                    className="w-full p-2.5 bg-slate-50 border rounded-lg"
                  />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="px-6 py-2.5 bg-emerald-800 text-white font-bold rounded-xl shadow">
                    Simpan Pengaturan Email
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sendEmailNotification(settingsForm.emailSubmission, "Test Notifikasi Sistem Ma'had Aly");
                      alert(`Test notifikasi berhasil dikirimkan ke: ${settingsForm.emailSubmission}`);
                    }}
                    className="px-4 py-2.5 bg-slate-800 text-white font-bold rounded-xl"
                  >
                    ⚡ Test Kirim Email
                  </button>
                </div>
              </form>
            </div>

            {/* Riwayat Log Email */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-serif font-bold text-lg text-slate-900 pb-2 border-b">
                📋 Log Riwayat Notifikasi Email ({emailLogs.length})
              </h3>
              <div className="space-y-2">
                {emailLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-50 rounded-xl border flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-emerald-800">{log.to}</span>
                      <p className="text-slate-800 font-semibold">{log.subject}</p>
                    </div>
                    <div className="text-right">
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">{log.status}</span>
                      <p className="text-slate-400 text-[10px] mt-0.5">{log.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            11. MANAJEMEN COMING SOON
           ══════════════════════════════════════════════════════════════ */}
        {activeMenu === "comingsoon" && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
            <div className="pb-2 border-b">
              <h3 className="font-serif font-bold text-lg text-slate-900">
                🔧 Manajemen Halaman Placeholder &amp; Jadwal Rilis
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">
                Aktifkan atau jadwalkan rilis halaman fitur khusus berikut ini:
              </p>
            </div>

            <div className="space-y-3">
              {comingSoonPages.map((page) => (
                <div key={page.id} className="p-4 bg-slate-50 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-base">{page.title}</h4>
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                        Target: {page.releaseDate}
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs mt-1">{page.description}</p>
                    <p className="text-emerald-800 font-semibold text-[11px] mt-1">
                      👥 {page.subscriberCount} Calon Pembaca Menunggu Notifikasi
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/${page.slug}`}
                      target="_blank"
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg"
                    >
                      Pratinjau &rarr;
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        toggleComingSoonPage(page.id, !page.isEnabled);
                        alert(`Status halaman ${page.title} diperbarui!`);
                      }}
                      className={`px-3 py-1.5 rounded-lg font-bold text-white shadow ${
                        page.isEnabled ? "bg-emerald-800 hover:bg-emerald-900" : "bg-slate-500"
                      }`}
                    >
                      {page.isEnabled ? "Status: Placeholder Aktif" : "Nonaktifkan"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            12. USER & PERAN
           ══════════════════════════════════════════════════════════════ */}
        {activeMenu === "users" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs">
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-lg text-emerald-950 pb-2 border-b">
                {isEditingUser ? "✏️ Edit Pengguna" : "➕ Tambah Admin Baru"}
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!userForm.name || !userForm.email) return;
                  if (isEditingUser && editingUserId) {
                    updateUser(editingUserId, userForm);
                    alert("Pengguna berhasil diperbarui!");
                  } else {
                    addUser({ ...userForm, lastLogin: "Belum pernah" });
                    alert("Pengguna baru didaftarkan!");
                  }
                  setIsEditingUser(false);
                  setEditingUserId(null);
                  setUserForm({ name: "", email: "", role: "Editor", status: "Aktif" });
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Role</label>
                    <select
                      value={userForm.role}
                      onChange={(e) => setUserForm({ ...userForm, role: e.target.value as any })}
                      className="w-full p-2 bg-slate-50 border rounded-lg"
                    >
                      <option value="Super Admin">Super Admin</option>
                      <option value="Editor">Editor</option>
                      <option value="Penulis">Penulis</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Status</label>
                    <select
                      value={userForm.status}
                      onChange={(e) => setUserForm({ ...userForm, status: e.target.value as any })}
                      className="w-full p-2 bg-slate-50 border rounded-lg"
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Nonaktif">Nonaktif</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full py-2.5 bg-emerald-800 text-white font-bold rounded-xl shadow">
                  {isEditingUser ? "Simpan Perubahan" : "Daftarkan Pengguna"}
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-serif font-bold text-lg text-emerald-950 pb-2 border-b">
                Daftar Admin ({users.length})
              </h3>
              <div className="space-y-2.5">
                {users.map((usr) => (
                  <div key={usr.id} className="p-3 bg-slate-50 rounded-xl border flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900">{usr.name}</h4>
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">{usr.role}</span>
                      </div>
                      <p className="text-slate-500 text-[11px]">{usr.email} &bull; Login: {usr.lastLogin}</p>
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
            13. MEDIA LIBRARY
           ══════════════════════════════════════════════════════════════ */}
        {activeMenu === "media" && (
          <div className="space-y-6 text-xs">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-lg text-slate-900 pb-2 border-b">
                Unggah Berkas ke Media Library
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!mediaForm.name || !mediaForm.url) return;
                  if (!validatePdfSize(mediaForm.size)) return;
                  addMedia(mediaForm);
                  alert("Berkas berhasil disimpan ke Library!");
                  setMediaForm({ name: "", url: "", size: "1.5 MB", type: "image" });
                }}
                className="grid grid-cols-1 sm:grid-cols-12 gap-3"
              >
                <div className="sm:col-span-4">
                  <label className="block font-bold text-slate-700 mb-1">Nama Berkas *</label>
                  <input
                    type="text"
                    required
                    value={mediaForm.name}
                    onChange={(e) => setMediaForm({ ...mediaForm, name: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-lg"
                    placeholder="foto-gedung.jpg"
                  />
                </div>
                <div className="sm:col-span-5">
                  <label className="block font-bold text-slate-700 mb-1">Tautan / URL Berkas *</label>
                  <input
                    type="text"
                    required
                    value={mediaForm.url}
                    onChange={(e) => setMediaForm({ ...mediaForm, url: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-lg"
                    placeholder="https://..."
                  />
                </div>
                <div className="sm:col-span-3 flex items-end">
                  <button type="submit" className="w-full py-2 bg-emerald-800 text-white font-bold rounded-lg shadow">
                    Simpan ke Library
                  </button>
                </div>
              </form>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {media.map((med) => (
                <div key={med.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2 text-xs">
                  <div className="h-28 bg-slate-100 rounded-xl flex items-center justify-center text-3xl border">
                    {med.type === "image" ? "🖼️" : "📄"}
                  </div>
                  <h4 className="font-bold text-slate-900 truncate" title={med.name}>{med.name}</h4>
                  <p className="text-[11px] text-slate-400">{med.size} &bull; {med.uploadedAt}</p>
                  <div className="flex gap-2 pt-2 border-t">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(med.url);
                        alert("URL berhasil disalin ke clipboard!");
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
            14. SEO & META PER HALAMAN
           ══════════════════════════════════════════════════════════════ */}
        {activeMenu === "seo" && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-xs">
            <div className="pb-2 border-b">
              <h3 className="font-serif font-bold text-lg text-slate-900">
                🔍 Pengaturan SEO &amp; Meta Google Per Halaman
              </h3>
              <p className="text-slate-500 text-xs">
                Sesuaikan judul pencarian, deskripsi meta, dan kata kunci untuk setiap rute website:
              </p>
            </div>

            <div className="space-y-4">
              {pageSeoList.map((p) => (
                <div key={p.pageKey} className="p-4 bg-slate-50 rounded-2xl border space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-emerald-950 text-base">{p.pageName} (/{p.pageKey === 'home' ? '' : p.pageKey})</h4>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Meta Title</label>
                    <input
                      type="text"
                      value={p.title}
                      onChange={(e) => updatePageSeo(p.pageKey, { title: e.target.value })}
                      className="w-full p-2 bg-white border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Meta Description</label>
                    <textarea
                      rows={2}
                      value={p.description}
                      onChange={(e) => updatePageSeo(p.pageKey, { description: e.target.value })}
                      className="w-full p-2 bg-white border rounded-lg"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            15. PENGATURAN & SOSMED & BACKUP
           ══════════════════════════════════════════════════════════════ */}
        {activeMenu === "settings" && (
          <div className="space-y-6 text-xs font-medium">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-lg text-slate-900 pb-2 border-b">
                Identitas Lembaga &amp; Kontak Resmi
              </h3>
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Resmi Lembaga</label>
                  <input
                    type="text"
                    value={settingsForm.institutionName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, institutionName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-lg text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Takhassus</label>
                    <input
                      type="text"
                      value={settingsForm.takhassus}
                      onChange={(e) => setSettingsForm({ ...settingsForm, takhassus: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Fokus Spesialisasi</label>
                    <input
                      type="text"
                      value={settingsForm.focusField}
                      onChange={(e) => setSettingsForm({ ...settingsForm, focusField: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border rounded-lg"
                    />
                  </div>
                </div>

                {/* Sosial Media */}
                <h4 className="font-bold text-slate-900 pt-2 border-t text-sm">Akun Media Sosial Resmi</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 mb-1">Facebook URL</label>
                    <input
                      type="text"
                      value={settingsForm.socialMedia?.facebook || ""}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          socialMedia: { ...(settingsForm.socialMedia as any), facebook: e.target.value }
                        })
                      }
                      className="w-full p-2.5 bg-slate-50 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1">Instagram URL</label>
                    <input
                      type="text"
                      value={settingsForm.socialMedia?.instagram || ""}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          socialMedia: { ...(settingsForm.socialMedia as any), instagram: e.target.value }
                        })
                      }
                      className="w-full p-2.5 bg-slate-50 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1">YouTube Channel URL</label>
                    <input
                      type="text"
                      value={settingsForm.socialMedia?.youtube || ""}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          socialMedia: { ...(settingsForm.socialMedia as any), youtube: e.target.value }
                        })
                      }
                      className="w-full p-2.5 bg-slate-50 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1">Nomor WhatsApp Resmi</label>
                    <input
                      type="text"
                      value={settingsForm.socialMedia?.whatsapp || ""}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          socialMedia: { ...(settingsForm.socialMedia as any), whatsapp: e.target.value }
                        })
                      }
                      className="w-full p-2.5 bg-slate-50 border rounded-lg"
                    />
                  </div>
                </div>

                <button type="submit" className="px-6 py-2.5 bg-emerald-800 text-white font-bold rounded-xl shadow">
                  Simpan Seluruh Pengaturan
                </button>
              </form>
            </div>

            {/* Backup & Restore */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-lg text-slate-900 pb-2 border-b">
                💾 Cadangan &amp; Pemulihan Seluruh Database (JSON Backup &amp; Restore)
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Unduh seluruh data profil, kurikulum, dosen, artikel, skripsi, dan konfigurasi sistem dalam 1 file JSON aman.
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
                    if (confirm("Peringatan: Seluruh perubahan akan dikembalikan ke data default. Lanjutkan?")) {
                      resetAllData();
                      alert("Data berhasil direset ke pengaturan awal!");
                    }
                  }}
                  className="px-4 py-2.5 bg-red-100 text-red-700 font-bold rounded-xl hover:bg-red-200"
                >
                  ⚠️ Reset ke Data Bawaan
                </button>
              </div>

              <div className="pt-4 border-t space-y-2">
                <label className="block font-bold text-slate-700">Pulihkan Data dari Teks JSON Backup:</label>
                <textarea
                  rows={3}
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder="Tempelkan teks file JSON backup di sini..."
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
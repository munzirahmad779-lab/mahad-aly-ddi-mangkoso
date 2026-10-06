"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useArticles } from "@/context/ArticleContext";
import ImageUploader from "@/components/common/ImageUploader";
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
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<{ role: string; nama_lengkap: string; email: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Invite user state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"editor" | "penulis">("editor");
  const [inviteName, setInviteName] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [dbUsers, setDbUsers] = useState<any[]>([]);

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
  } = useArticles();

  // Load and verify Supabase Auth session on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          router.push("/admin/login");
          return;
        }

        setCurrentUser(session.user);

        // Fetch user profile from public.users
        const { data: profile } = await supabase
          .from("users")
          .select("role, nama_lengkap, email, is_active")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          setUserProfile(profile);
        } else {
          // Fallback if not in users table yet
          setUserProfile({
            role: session.user.email === "munzirahmad779@gmail.com" ? "super_admin" : "editor",
            nama_lengkap: session.user.email?.split("@")[0] || "Admin",
            email: session.user.email || ""
          });
        }

        // Fetch real database users list
        const { data: userList } = await supabase.from("users").select("*").order("created_at", { ascending: false });
        if (userList) setDbUsers(userList);
      } catch (err) {
        console.error("Auth check error:", err);
      } finally {
        setAuthLoading(false);
      }
    }

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push("/admin/login");
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviteLoading(true);
    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
          nama_lengkap: inviteName
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengundang user.");
      alert(`✅ Undangan berhasil dikirim ke ${inviteEmail}!`);
      setInviteEmail("");
      setInviteName("");
      // Refresh user list
      const { data: userList } = await supabase.from("users").select("*").order("created_at", { ascending: false });
      if (userList) setDbUsers(userList);
    } catch (err: any) {
      alert("❌ Error: " + err.message);
    } finally {
      setInviteLoading(false);
    }
  };

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
    | "footer"
    | "settings"
  >("dashboard");

  const [activeSubMenu, setActiveSubMenu] = useState<string>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Footer Manager Tab State
  const [footerSubTab, setFooterSubTab] = useState<
    "identity" | "nav" | "focus" | "info" | "bottom" | "visual" | "preview"
  >("identity");

  // Footer Form State
  const [footerForm, setFooterForm] = useState(footerSettings);

  // Sync footerForm with context when footerSettings changes
  useState(() => {
    setFooterForm(footerSettings);
  });

  // Footer Nav Form State
  const [isEditingFooterNav, setIsEditingFooterNav] = useState(false);
  const [editingFooterNavId, setEditingFooterNavId] = useState<string | null>(null);
  const [footerNavForm, setFooterNavForm] = useState({
    label: "",
    url: "/",
    position: 1,
    isActive: true
  });

  // Footer Focus Form State
  const [isEditingFooterFocus, setIsEditingFooterFocus] = useState(false);
  const [editingFooterFocusId, setEditingFooterFocusId] = useState<string | null>(null);
  const [footerFocusForm, setFooterFocusForm] = useState({
    name: "",
    icon: "📖",
    position: 1,
    isActive: true
  });

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
  const [mediaSearch, setMediaSearch] = useState("");
  const [mediaTypeFilter, setMediaTypeFilter] = useState<"all" | "image" | "pdf">("all");
  const [mediaFolderFilter, setMediaFolderFilter] = useState<string>("all");
  const [mediaUploadFolder, setMediaUploadFolder] = useState<"logo" | "masyayikh" | "sarana" | "artikel" | "berita" | "galeri" | "skripsi-cover" | "umum">("umum");
  const [uploadedMediaUrl, setUploadedMediaUrl] = useState("");

  // 16. Settings Form State & Auto-sync with Supabase/Context
  const [settingsForm, setSettingsForm] = useState<SiteSettings>(settings);

  useEffect(() => {
    if (settings) {
      setSettingsForm(settings);
    }
  }, [settings]);

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

    if (!thesisForm.downloadUrl.startsWith("http://") && !thesisForm.downloadUrl.startsWith("https://")) {
      alert("Tautan Google Drive harus diawali dengan https:// atau http://");
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

  // Footer Manager Handlers
  const handleSaveFooterSettings = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateFooterSettings(footerForm);
    alert("✅ Seluruh pengaturan Footer berhasil disimpan!");
  };

  const handleResetFooter = () => {
    if (confirm("Kembalikan seluruh konten & tampilan Footer ke data bawaan (default)?")) {
      resetFooterToDefault();
      setFooterForm(footerSettings);
      alert("Footer telah dikembalikan ke pengaturan default!");
    }
  };

  const handleSaveFooterNav = (e: React.FormEvent) => {
    e.preventDefault();
    if (!footerNavForm.label || !footerNavForm.url) {
      alert("Label dan URL link wajib diisi!");
      return;
    }
    if (isEditingFooterNav && editingFooterNavId) {
      updateFooterNav(editingFooterNavId, footerNavForm);
      alert("Tautan navigasi footer diperbarui!");
    } else {
      addFooterNav(footerNavForm);
      alert("Tautan navigasi footer baru ditambahkan!");
    }
    setIsEditingFooterNav(false);
    setEditingFooterNavId(null);
    setFooterNavForm({ label: "", url: "/", position: footerNav.length + 1, isActive: true });
  };

  const handleSaveFooterFocus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!footerFocusForm.name) {
      alert("Nama bidang fokus keilmuan wajib diisi!");
      return;
    }
    if (isEditingFooterFocus && editingFooterFocusId) {
      updateFooterFocus(editingFooterFocusId, footerFocusForm);
      alert("Fokus keilmuan footer diperbarui!");
    } else {
      addFooterFocus(footerFocusForm);
      alert("Fokus keilmuan footer baru ditambahkan!");
    }
    setIsEditingFooterFocus(false);
    setEditingFooterFocusId(null);
    setFooterFocusForm({ name: "", icon: "📖", position: footerFocus.length + 1, isActive: true });
  };

  const handleMoveFooterNav = (index: number, direction: "up" | "down") => {
    const sorted = [...footerNav].sort((a, b) => a.position - b.position);
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const currentItem = sorted[index];
    const targetItem = sorted[targetIndex];

    updateFooterNav(currentItem.id, { position: targetItem.position });
    updateFooterNav(targetItem.id, { position: currentItem.position });
  };

  const handleMoveFooterFocus = (index: number, direction: "up" | "down") => {
    const sorted = [...footerFocus].sort((a, b) => a.position - b.position);
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const currentItem = sorted[index];
    const targetItem = sorted[targetIndex];

    updateFooterFocus(currentItem.id, { position: targetItem.position });
    updateFooterFocus(targetItem.id, { position: currentItem.position });
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

  // 1. Auth Loading Screen
  if (authLoading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-mahad-gold text-mahad-green-dark rounded-full flex items-center justify-center mx-auto text-3xl font-bold animate-pulse shadow-lg">
            🕌
          </div>
          <p className="text-sm font-semibold text-slate-300">Memverifikasi Hak Akses Super Admin...</p>
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
              { id: "footer", icon: "🦶", label: "Footer Manager" },
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
          
          {/* User Session Profile */}
          {sidebarOpen && (
            <div className="px-3 py-2 bg-slate-800/80 rounded-xl border border-slate-700/50">
              <p className="font-bold text-white truncate text-[11px]">
                {userProfile?.nama_lengkap || currentUser?.email || "Super Admin"}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">
                  {userProfile?.role || "super_admin"}
                </span>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-300 transition font-bold"
          >
            <span>🚪</span>
            {sidebarOpen && <span>Keluar / Logout</span>}
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b gap-2">
                  <div>
                    <h3 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
                      <span>📊</span>
                      <span>Statistik &amp; Peringkat Pembaca Artikel</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Dihitung secara riil dari akumulasi data tayangan seluruh artikel di database
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                    👁️ {articles.reduce((acc, a) => acc + (a.views || 0), 0).toLocaleString("id-ID")} Total Pembaca Riil
                  </span>
                </div>

                {/* Top 5 Artikel Terbanyak Dibaca */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Top 5 Artikel Fiqh Paling Banyak Dibaca:
                  </h4>
                  {articles.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {[...articles]
                        .sort((a, b) => (b.views || 0) - (a.views || 0))
                        .slice(0, 5)
                        .map((art, idx) => (
                          <div key={art.id} className="py-2 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/80 px-2 rounded-lg transition">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px] shrink-0">
                                {idx + 1}
                              </span>
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-900 truncate">
                                  {art.title}
                                </p>
                                <p className="text-[10px] text-slate-500">
                                  {art.category} • Penulis: {art.author}
                                </p>
                              </div>
                            </div>
                            <div className="shrink-0 text-right">
                              <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                                {(art.views || 0).toLocaleString("id-ID")}x dibaca
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Belum ada artikel yang diterbitkan.</p>
                  )}
                </div>

                {/* Ringkasan Metrik Riil */}
                <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-500 block">Warta &amp; Berita</span>
                    <span className="font-bold text-slate-800">{news.length} warta</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-500 block">Berkas Media R2</span>
                    <span className="font-bold text-slate-800">{media.length} file</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-500 block">Total Pengunjung PMB</span>
                    <span className="font-bold text-slate-800">{subscribers.length} pendaftar</span>
                  </div>
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
                <h3 className="font-serif font-bold text-lg text-slate-900 pb-2 border-b flex items-center gap-2">
                  <span>🏛️</span>
                  <span>Sejarah Pendirian Lembaga</span>
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
                      <ImageUploader
                        value={lecturerForm.photoUrl}
                        onChange={(url) => setLecturerForm({ ...lecturerForm, photoUrl: url })}
                        folder="masyayikh"
                        label="Foto Masyayikh / Dosen"
                        helperText="Foto formal/portrait ustadz/dosen pengampu (Maks. 5 MB)"
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
                      <ImageUploader
                        value={facilityForm.photoUrl}
                        onChange={(url) => setFacilityForm({ ...facilityForm, photoUrl: url })}
                        folder="sarana"
                        label="Foto Sarana / Prasarana"
                        helperText="Gedung, masjid, asrama, lab atau perpustakaan (Maks. 5 MB)"
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
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block font-bold text-slate-700">Link Google Drive PDF *</label>
                        {thesisForm.downloadUrl && (
                          <button
                            type="button"
                            onClick={() => window.open(thesisForm.downloadUrl, "_blank", "noopener,noreferrer")}
                            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline flex items-center gap-1"
                          >
                            <span>🔗</span>
                            <span>Test Buka Link</span>
                          </button>
                        )}
                      </div>
                      <input
                        type="url"
                        required
                        value={thesisForm.downloadUrl}
                        onChange={(e) => setThesisForm({ ...thesisForm, downloadUrl: e.target.value })}
                        className="w-full p-2 text-xs bg-slate-50 border rounded-lg font-mono"
                        placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                      />
                      <div className="p-2.5 bg-emerald-50/60 border border-emerald-200 rounded-lg text-[11px] text-emerald-900 leading-relaxed">
                        <p className="font-semibold flex items-center gap-1">
                          <span>💡</span>
                          <span>Petunjuk Berkas Google Drive:</span>
                        </p>
                        <ul className="list-disc list-inside mt-1 space-y-0.5 text-emerald-800">
                          <li>Buka file di Google Drive &rarr; Klik <strong>Bagikan (Share)</strong>.</li>
                          <li>Ubah akses menjadi: <strong>"Siapa saja yang memiliki link (Anyone with the link)"</strong> sebagai <strong>Viewer</strong>.</li>
                          <li>Ukuran file disarankan <strong>&lt; 10 MB</strong> agar cepat diunduh mahasantri.</li>
                        </ul>
                      </div>
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
                      <ImageUploader
                        value={galleryForm.coverUrl}
                        onChange={(url) => setGalleryForm({ ...galleryForm, coverUrl: url })}
                        folder="galeri"
                        label="Foto Sampul Album *"
                        helperText="Upload foto resolusi tinggi untuk sampul album galeri"
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs font-medium">
            
            {/* Form Invite User */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="border-b pb-2">
                <span className="inline-block px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px] mb-1">
                  Supabase Auth Invite-Only
                </span>
                <h3 className="font-serif font-bold text-lg text-slate-900">
                  📨 Undang Pengguna Baru
                </h3>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Undang Editor atau Penulis resmi via email. Penerima akan mendapatkan link untuk membuat password mereka.
                </p>
              </div>

              <form onSubmit={handleInviteUser} className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Pengguna</label>
                  <input
                    type="text"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="Ust. Ahmad Fauzi, M.Ag."
                    className="w-full p-2.5 bg-slate-50 border rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Alamat Email Resmi *</label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="editor@ddimangkoso.ac.id"
                    className="w-full p-2.5 bg-slate-50 border rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Peran Akses (Role)</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border rounded-lg text-xs font-semibold"
                  >
                    <option value="editor">Editor (Bisa kelola artikel, skripsi, kategori &amp; media)</option>
                    <option value="penulis">Penulis (Hanya bisa menulis dan mengedit artikel miliknya)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={inviteLoading}
                  className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {inviteLoading ? (
                    <>
                      <span className="animate-spin text-sm">⏳</span>
                      <span>Mengirim Undangan...</span>
                    </>
                  ) : (
                    <>
                      <span>✉️</span>
                      <span>Kirim Undangan Email</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* List User Terdaftar di Database */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <h3 className="font-serif font-bold text-lg text-slate-900">
                    👥 Pengguna Terdaftar ({dbUsers.length || 1})
                  </h3>
                  <p className="text-slate-500 text-[11px]">Data tersinkronisasi langsung dari tabel PostgreSQL `public.users`</p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    const { data } = await supabase.from("users").select("*").order("created_at", { ascending: false });
                    if (data) setDbUsers(data);
                  }}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
                  title="Segarkan data user"
                >
                  🔄 Refresh
                </button>
              </div>

              <div className="space-y-2.5">
                {(dbUsers.length > 0 ? dbUsers : [
                  {
                    id: "usr-admin",
                    email: "munzirahmad779@gmail.com",
                    nama_lengkap: "Ahmad Yusuf Mubarak",
                    role: "super_admin",
                    is_active: true,
                    created_at: new Date().toISOString()
                  }
                ]).map((usr) => (
                  <div key={usr.id} className="p-3.5 bg-slate-50 rounded-xl border flex items-center justify-between gap-3">
                    <div className="space-y-1 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 truncate text-xs">{usr.nama_lengkap || usr.email}</h4>
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[9px] uppercase tracking-wider ${
                            usr.role === "super_admin"
                              ? "bg-amber-100 text-amber-900 border border-amber-300"
                              : usr.role === "editor"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {usr.role}
                        </span>
                        {usr.is_active ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-500" title="Akun Aktif"></span>
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-red-500" title="Akun Nonaktif"></span>
                        )}
                      </div>
                      <p className="text-slate-500 text-[11px] truncate font-mono">{usr.email}</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {usr.role !== "super_admin" && (
                        <button
                          type="button"
                          onClick={async () => {
                            const newStatus = !usr.is_active;
                            const { error } = await supabase.from("users").update({ is_active: newStatus }).eq("id", usr.id);
                            if (!error) {
                              setDbUsers(dbUsers.map((u) => (u.id === usr.id ? { ...u, is_active: newStatus } : u)));
                              alert(`Status pengguna ${usr.email} diubah menjadi ${newStatus ? "Aktif" : "Nonaktif"}!`);
                            }
                          }}
                          className={`px-2 py-1 rounded text-[10px] font-bold ${
                            usr.is_active ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                          }`}
                        >
                          {usr.is_active ? "Nonaktifkan" : "Aktifkan"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            13. MEDIA LIBRARY (CLOUDFLARE R2 & SUPABASE DB)
           ══════════════════════════════════════════════════════════════ */}
        {activeMenu === "media" && (
          <div className="space-y-6 text-xs font-medium">
            {/* Upload Box */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                <div>
                  <h3 className="font-serif font-bold text-lg text-slate-900 flex items-center gap-2">
                    <span>🖼️</span>
                    <span>Media Library &amp; Cloudflare R2 Storage</span>
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Unggah gambar, logo, foto masyayikh, atau dokumen langsung ke Cloudflare R2 Storage (Bucket: <code className="text-emerald-700 font-mono font-bold">media-mahad-aly</code>).
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-[11px]">Folder Target:</span>
                  <select
                    value={mediaUploadFolder}
                    onChange={(e) => {
                      setMediaUploadFolder(e.target.value as any);
                      setUploadedMediaUrl("");
                    }}
                    className="p-1.5 bg-slate-50 border rounded-lg text-xs font-bold text-emerald-800 focus:ring-emerald-500"
                  >
                    <option value="umum">📁 /umum</option>
                    <option value="logo">📁 /logo</option>
                    <option value="masyayikh">📁 /masyayikh</option>
                    <option value="sarana">📁 /sarana</option>
                    <option value="artikel">📁 /artikel</option>
                    <option value="berita">📁 /berita</option>
                    <option value="galeri">📁 /galeri</option>
                    <option value="skripsi-cover">📁 /skripsi-cover</option>
                  </select>
                </div>
              </div>

              <div className="max-w-2xl mx-auto py-2">
                <ImageUploader
                  value={uploadedMediaUrl}
                  onChange={(url) => {
                    setUploadedMediaUrl(url);
                  }}
                  onUploadComplete={(newMedia) => {
                    addMedia({
                      name: newMedia.name,
                      url: newMedia.url,
                      size: newMedia.size,
                      type: newMedia.type,
                    });
                  }}
                  folder={mediaUploadFolder}
                  label={`Unggah File Baru ke /${mediaUploadFolder}`}
                  helperText="Format: JPG, PNG, WebP, SVG (Maks. 5 MB) atau PDF (Maks. 10 MB)"
                  maxSizeMB={10}
                />
                {uploadedMediaUrl && (
                  <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs text-emerald-900 font-semibold flex items-center gap-1.5">
                      <span>✓</span> Berkas berhasil diunggah ke folder <code className="font-mono bg-emerald-100 px-1 py-0.5 rounded text-emerald-800">/{mediaUploadFolder}</code> di Cloudflare R2!
                    </span>
                    <button
                      type="button"
                      onClick={() => setUploadedMediaUrl("")}
                      className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto shrink-0"
                    >
                      <span>➕</span> Unggah Berkas Baru Lagi
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {/* Type Filter Buttons */}
                <div className="flex items-center gap-1.5">
                  {[
                    { id: "all", label: `Semua (${media.length})` },
                    { id: "image", label: `🖼️ Gambar (${media.filter(m => m.type === "image").length})` },
                    { id: "pdf", label: `📄 PDF (${media.filter(m => m.type !== "image").length})` }
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setMediaTypeFilter(f.id as any)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition text-xs ${
                        mediaTypeFilter === f.id
                          ? "bg-emerald-800 text-white shadow"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Folder Filter Selector */}
                <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
                  <span className="text-[11px] text-slate-400 font-bold">Folder:</span>
                  <select
                    value={mediaFolderFilter}
                    onChange={(e) => setMediaFolderFilter(e.target.value)}
                    className="p-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
                  >
                    <option value="all">Semua Folder</option>
                    <option value="umum">/umum</option>
                    <option value="logo">/logo</option>
                    <option value="masyayikh">/masyayikh</option>
                    <option value="sarana">/sarana</option>
                    <option value="artikel">/artikel</option>
                    <option value="berita">/berita</option>
                    <option value="galeri">/galeri</option>
                    <option value="skripsi-cover">/skripsi-cover</option>
                  </select>
                </div>
              </div>

              {/* Search Input */}
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  value={mediaSearch}
                  onChange={(e) => setMediaSearch(e.target.value)}
                  placeholder="Cari nama berkas..."
                  className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="absolute left-2.5 top-2.5 text-slate-400">🔍</span>
              </div>
            </div>

            {/* Media Grid Cards */}
            {(() => {
              const filteredMedia = media.filter((med) => {
                const matchType =
                  mediaTypeFilter === "all" ||
                  (mediaTypeFilter === "image" && med.type === "image") ||
                  (mediaTypeFilter === "pdf" && med.type !== "image");
                const matchFolder =
                  mediaFolderFilter === "all" ||
                  med.url.includes(`/${mediaFolderFilter}/`) ||
                  (med as any).folder === mediaFolderFilter;
                const matchSearch =
                  !mediaSearch ||
                  med.name.toLowerCase().includes(mediaSearch.toLowerCase()) ||
                  med.url.toLowerCase().includes(mediaSearch.toLowerCase());
                return matchType && matchFolder && matchSearch;
              });

              if (filteredMedia.length === 0) {
                return (
                  <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm text-slate-400">
                    <p className="text-3xl mb-2">📁</p>
                    <p className="font-bold text-slate-700">Tidak ada berkas media yang cocok.</p>
                    <p className="text-xs text-slate-400 mt-1">Gunakan form di atas untuk mengunggah file baru.</p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredMedia.map((med) => (
                    <div
                      key={med.id}
                      className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-2.5 flex flex-col justify-between group hover:border-emerald-300 transition-all"
                    >
                      <div>
                        <div className="h-36 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center border relative group-hover:shadow-inner">
                          {med.type === "image" ? (
                            <img
                              src={med.url}
                              alt={med.name}
                              className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="text-4xl text-emerald-700">📄</div>
                          )}
                          <a
                            href={med.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white text-[10px] px-2 py-0.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Buka ↗
                          </a>
                        </div>
                        <h4 className="font-bold text-slate-900 mt-2 truncate text-xs" title={med.name}>
                          {med.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {med.size} &bull; {med.uploadedAt}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 pt-2 border-t">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(med.url);
                            alert(`URL berkas disalin ke clipboard:\n${med.url}`);
                          }}
                          className="flex-1 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 font-bold rounded-lg text-[11px] transition flex items-center justify-center gap-1"
                        >
                          <span>📋</span>
                          <span>Salin URL</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Hapus media "${med.name}" dari Library?`)) deleteMedia(med.id);
                          }}
                          className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg text-[11px] transition"
                          title="Hapus Media"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
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
            15. FOOTER MANAGER (🦶 PENGATURAN FOOTER LENGKAP)
           ══════════════════════════════════════════════════════════════ */}
        {activeMenu === "footer" && (
          <div className="space-y-6 text-xs font-medium">
            
            {/* Header Footer Manager */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[11px] mb-2">
                  <span>🦶 Footer Manager</span>
                  <span>&bull;</span>
                  <span>Kontrol Tata Letak &amp; Konten Kaki Web</span>
                </div>
                <h3 className="font-serif font-bold text-xl text-slate-900">
                  Pengaturan Footer Website Ma&apos;had Aly
                </h3>
                <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                  Kelola identitas kolom 1, daftar link navigasi kolom 2, fokus keilmuan kolom 3, kanal medsos kolom 4, serta warna tema dan bar hak cipta secara visual tanpa coding.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setFooterSubTab("preview")}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow flex items-center gap-2"
                >
                  <span>👁️</span>
                  <span>Lihat Pratinjau</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveFooterSettings}
                  className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow flex items-center gap-2"
                >
                  <span>💾</span>
                  <span>Simpan Perubahan</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetFooter}
                  className="px-3.5 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-xl flex items-center gap-1.5"
                  title="Reset Footer ke data bawaan"
                >
                  <span>🔄</span>
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Sub-tab Navigation */}
            <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
              {[
                { id: "identity", label: "1. Identitas (Kolom 1)", icon: "🏛️" },
                { id: "nav", label: "2. Navigasi Portal (Kolom 2)", icon: "🔗", badge: footerNav.length },
                { id: "focus", label: "3. Fokus Keilmuan (Kolom 3)", icon: "📖", badge: footerFocus.length },
                { id: "info", label: "4. Kanal Informasi (Kolom 4)", icon: "📡" },
                { id: "bottom", label: "5. Bar Bawah & Hak Cipta", icon: "⚖️" },
                { id: "visual", label: "6. Visual & Tata Letak", icon: "🎨" },
                { id: "preview", label: "7. Pratinjau Langsung (Mockup)", icon: "👁️" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFooterSubTab(tab.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                    footerSubTab === tab.id
                      ? "bg-emerald-800 text-white shadow"
                      : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        footerSubTab === tab.id ? "bg-emerald-950 text-white" : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* TAB 1: IDENTITAS LEMBAGA (KOLOM 1) */}
            {footerSubTab === "identity" && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                <div className="border-b pb-3 flex items-center justify-between">
                  <h4 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
                    <span>🏛️</span>
                    <span>Kolom 1: Identitas Lembaga &amp; Alamat</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">Muncul di sisi paling kiri footer</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <ImageUploader
                      value={footerForm.logoUrl}
                      onChange={(url) => setFooterForm({ ...footerForm, logoUrl: url })}
                      folder="logo"
                      label="Logo Lembaga di Footer"
                      helperText="Format PNG transparan atau SVG disarankan (Maks. 5 MB)"
                    />
                    <div className="flex gap-2 mt-1.5 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setFooterForm({ ...footerForm, logoUrl: "/image_067524.png" })}
                        className="text-emerald-700 hover:underline"
                      >
                        Gunakan Logo Resmi DDI Bawaan
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama Utama Lembaga *</label>
                    <input
                      type="text"
                      value={footerForm.orgName}
                      onChange={(e) => setFooterForm({ ...footerForm, orgName: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border rounded-lg text-sm font-semibold"
                      placeholder="Ma'had Aly"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Sub-Nama Lembaga</label>
                    <input
                      type="text"
                      value={footerForm.orgSubname}
                      onChange={(e) => setFooterForm({ ...footerForm, orgSubname: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border rounded-lg text-xs"
                      placeholder="DDI Mangkoso"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Alamat Lembaga (Maks. 200 Karakter)</label>
                    <textarea
                      rows={2}
                      maxLength={200}
                      value={footerForm.address}
                      onChange={(e) => setFooterForm({ ...footerForm, address: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border rounded-lg text-xs"
                      placeholder="Kompleks Ponpes DDI Mangkoso, Barru..."
                    />
                    <p className="text-[11px] text-slate-400 text-right mt-0.5">
                      {footerForm.address.length}/200 karakter
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Deskripsi Singkat Lembaga (Maks. 300 Karakter)</label>
                  <textarea
                    rows={3}
                    maxLength={300}
                    value={footerForm.description}
                    onChange={(e) => setFooterForm({ ...footerForm, description: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-lg text-xs leading-relaxed"
                    placeholder="Pendidikan Tinggi Kader Ulama jenjang Marhalah Ula..."
                  />
                  <p className="text-[11px] text-slate-400 text-right mt-0.5">
                    {footerForm.description.length}/300 karakter
                  </p>
                </div>

                <div className="pt-3 border-t flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      updateFooterSettings(footerForm);
                      alert("Identitas lembaga di footer berhasil disimpan!");
                    }}
                    className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow"
                  >
                    Simpan Identitas Kolom 1
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: NAVIGASI PORTAL (KOLOM 2 - CRUD) */}
            {footerSubTab === "nav" && (
              <div className="space-y-6">
                
                {/* Form Tambah/Edit Navigasi */}
                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h4 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
                    <span>{isEditingFooterNav ? "✏️ Edit Tautan Navigasi" : "➕ Tambah Tautan Navigasi Baru"}</span>
                  </h4>

                  <form onSubmit={handleSaveFooterNav} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-4">
                      <label className="block font-bold text-slate-700 mb-1">Label Tautan *</label>
                      <input
                        type="text"
                        required
                        value={footerNavForm.label}
                        onChange={(e) => setFooterNavForm({ ...footerNavForm, label: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border rounded-lg text-xs"
                        placeholder="Contoh: Profil & Sejarah"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block font-bold text-slate-700 mb-1">URL Tujuan *</label>
                      <input
                        type="text"
                        required
                        value={footerNavForm.url}
                        onChange={(e) => setFooterNavForm({ ...footerNavForm, url: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border rounded-lg text-xs font-mono"
                        placeholder="/profil atau https://..."
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">Urutan</label>
                      <input
                        type="number"
                        value={footerNavForm.position}
                        onChange={(e) => setFooterNavForm({ ...footerNavForm, position: Number(e.target.value) })}
                        className="w-full p-2.5 bg-slate-50 border rounded-lg text-xs"
                      />
                    </div>

                    <div className="sm:col-span-2 flex items-end gap-2">
                      <button
                        type="submit"
                        className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg shadow text-xs"
                      >
                        {isEditingFooterNav ? "Update" : "Tambah Link"}
                      </button>
                      {isEditingFooterNav && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingFooterNav(false);
                            setEditingFooterNavId(null);
                            setFooterNavForm({ label: "", url: "/", position: footerNav.length + 1, isActive: true });
                          }}
                          className="px-3 py-2.5 bg-slate-200 text-slate-700 font-bold rounded-lg text-xs"
                        >
                          Batal
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* List Tautan Navigasi Footer */}
                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h4 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
                      <span>📋 Daftar Tautan Navigasi Kolom 2 ({footerNav.length} item)</span>
                    </h4>
                    <span className="text-[11px] text-slate-400">Gunakan panah 🔼 🔽 untuk mengatur urutan</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b">
                        <tr>
                          <th className="p-3 w-16 text-center">Urutan</th>
                          <th className="p-3">Label Tautan</th>
                          <th className="p-3">URL</th>
                          <th className="p-3 w-28 text-center">Status</th>
                          <th className="p-3 w-48 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {[...footerNav]
                          .sort((a, b) => a.position - b.position)
                          .map((item, index, arr) => (
                            <tr key={item.id} className="hover:bg-slate-50 transition">
                              <td className="p-3 text-center font-mono font-bold text-slate-500">
                                #{item.position}
                              </td>
                              <td className="p-3 font-semibold text-slate-900">
                                {item.label}
                              </td>
                              <td className="p-3 font-mono text-emerald-800 text-[11px]">
                                {item.url}
                              </td>
                              <td className="p-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => updateFooterNav(item.id, { isActive: !item.isActive })}
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition ${
                                    item.isActive
                                      ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                  }`}
                                >
                                  {item.isActive ? "✅ Aktif" : "⏸️ Nonaktif"}
                                </button>
                              </td>
                              <td className="p-3 text-right space-x-1">
                                <button
                                  type="button"
                                  disabled={index === 0}
                                  onClick={() => handleMoveFooterNav(index, "up")}
                                  className="p-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 rounded text-slate-700"
                                  title="Naikkan Urutan"
                                >
                                  🔼
                                </button>
                                <button
                                  type="button"
                                  disabled={index === arr.length - 1}
                                  onClick={() => handleMoveFooterNav(index, "down")}
                                  className="p-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 rounded text-slate-700"
                                  title="Turunkan Urutan"
                                >
                                  🔽
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsEditingFooterNav(true);
                                    setEditingFooterNavId(item.id);
                                    setFooterNavForm({
                                      label: item.label,
                                      url: item.url,
                                      position: item.position,
                                      isActive: item.isActive
                                    });
                                  }}
                                  className="px-2.5 py-1 bg-amber-100 text-amber-800 font-bold rounded hover:bg-amber-200 text-[11px]"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`Hapus link "${item.label}"?`)) deleteFooterNav(item.id);
                                  }}
                                  className="px-2.5 py-1 bg-red-100 text-red-700 font-bold rounded hover:bg-red-200 text-[11px]"
                                >
                                  Hapus
                                </button>
                              </td>
                            </tr>
                          ))}
                        {footerNav.length === 0 && (
                          <tr>
                            <td colSpan={5} className="p-6 text-center text-slate-400 italic">
                              Belum ada tautan navigasi footer. Tambahkan link di atas.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: FOKUS KEILMUAN (KOLOM 3 - CRUD) */}
            {footerSubTab === "focus" && (
              <div className="space-y-6">
                
                {/* Form Tambah/Edit Fokus Keilmuan */}
                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h4 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
                    <span>{isEditingFooterFocus ? "✏️ Edit Fokus Keilmuan" : "➕ Tambah Fokus Keilmuan Baru"}</span>
                  </h4>

                  <form onSubmit={handleSaveFooterFocus} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">Icon (Emoji)</label>
                      <input
                        type="text"
                        value={footerFocusForm.icon}
                        onChange={(e) => setFooterFocusForm({ ...footerFocusForm, icon: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border rounded-lg text-center text-base"
                        placeholder="📖"
                      />
                    </div>

                    <div className="sm:col-span-6">
                      <label className="block font-bold text-slate-700 mb-1">Nama Bidang Fokus Keilmuan *</label>
                      <input
                        type="text"
                        required
                        value={footerFocusForm.name}
                        onChange={(e) => setFooterFocusForm({ ...footerFocusForm, name: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border rounded-lg text-xs font-semibold"
                        placeholder="Usul Fikih & Qawa'id Fiqhiyyah"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">Urutan</label>
                      <input
                        type="number"
                        value={footerFocusForm.position}
                        onChange={(e) => setFooterFocusForm({ ...footerFocusForm, position: Number(e.target.value) })}
                        className="w-full p-2.5 bg-slate-50 border rounded-lg text-xs"
                      />
                    </div>

                    <div className="sm:col-span-2 flex items-end gap-2">
                      <button
                        type="submit"
                        className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg shadow text-xs"
                      >
                        {isEditingFooterFocus ? "Update" : "Tambah Item"}
                      </button>
                      {isEditingFooterFocus && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingFooterFocus(false);
                            setEditingFooterFocusId(null);
                            setFooterFocusForm({ name: "", icon: "📖", position: footerFocus.length + 1, isActive: true });
                          }}
                          className="px-3 py-2.5 bg-slate-200 text-slate-700 font-bold rounded-lg text-xs"
                        >
                          Batal
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* List Fokus Keilmuan */}
                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h4 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
                      <span>📚 Daftar Fokus Keilmuan Kolom 3 ({footerFocus.length} item)</span>
                    </h4>
                    <span className="text-[11px] text-slate-400">Gunakan panah 🔼 🔽 untuk mengatur urutan</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b">
                        <tr>
                          <th className="p-3 w-16 text-center">Urutan</th>
                          <th className="p-3 w-16 text-center">Icon</th>
                          <th className="p-3">Nama Bidang Keilmuan</th>
                          <th className="p-3 w-28 text-center">Status</th>
                          <th className="p-3 w-48 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {[...footerFocus]
                          .sort((a, b) => a.position - b.position)
                          .map((item, index, arr) => (
                            <tr key={item.id} className="hover:bg-slate-50 transition">
                              <td className="p-3 text-center font-mono font-bold text-slate-500">
                                #{item.position}
                              </td>
                              <td className="p-3 text-center text-base">
                                {item.icon || "📖"}
                              </td>
                              <td className="p-3 font-semibold text-slate-900">
                                {item.name}
                              </td>
                              <td className="p-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => updateFooterFocus(item.id, { isActive: !item.isActive })}
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition ${
                                    item.isActive
                                      ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                  }`}
                                >
                                  {item.isActive ? "✅ Aktif" : "⏸️ Nonaktif"}
                                </button>
                              </td>
                              <td className="p-3 text-right space-x-1">
                                <button
                                  type="button"
                                  disabled={index === 0}
                                  onClick={() => handleMoveFooterFocus(index, "up")}
                                  className="p-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 rounded text-slate-700"
                                  title="Naikkan Urutan"
                                >
                                  🔼
                                </button>
                                <button
                                  type="button"
                                  disabled={index === arr.length - 1}
                                  onClick={() => handleMoveFooterFocus(index, "down")}
                                  className="p-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 rounded text-slate-700"
                                  title="Turunkan Urutan"
                                >
                                  🔽
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsEditingFooterFocus(true);
                                    setEditingFooterFocusId(item.id);
                                    setFooterFocusForm({
                                      name: item.name,
                                      icon: item.icon || "📖",
                                      position: item.position,
                                      isActive: item.isActive
                                    });
                                  }}
                                  className="px-2.5 py-1 bg-amber-100 text-amber-800 font-bold rounded hover:bg-amber-200 text-[11px]"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`Hapus fokus keilmuan "${item.name}"?`)) deleteFooterFocus(item.id);
                                  }}
                                  className="px-2.5 py-1 bg-red-100 text-red-700 font-bold rounded hover:bg-red-200 text-[11px]"
                                >
                                  Hapus
                                </button>
                              </td>
                            </tr>
                          ))}
                        {footerFocus.length === 0 && (
                          <tr>
                            <td colSpan={5} className="p-6 text-center text-slate-400 italic">
                              Belum ada fokus keilmuan footer. Tambahkan bidang baru di atas.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: KANAL INFORMASI & MEDSOS (KOLOM 4) */}
            {footerSubTab === "info" && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                <div className="border-b pb-3 flex items-center justify-between">
                  <h4 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
                    <span>📡</span>
                    <span>Kolom 4: Kanal Informasi, Kontak &amp; Media Sosial</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">Muncul di sisi paling kanan footer</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Teks Pengantar Kanal Informasi (Maks. 200 Karakter)</label>
                  <textarea
                    rows={2}
                    maxLength={200}
                    value={footerForm.kanalDescription}
                    onChange={(e) => setFooterForm({ ...footerForm, kanalDescription: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-lg text-xs leading-relaxed"
                    placeholder="Ikuti kabar pengajian, kajian halaqah, dan penerbitan jurnal resmi..."
                  />
                  <p className="text-[11px] text-slate-400 text-right mt-0.5">
                    {footerForm.kanalDescription.length}/200 karakter
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email Resmi</label>
                    <input
                      type="email"
                      value={footerForm.email}
                      onChange={(e) => setFooterForm({ ...footerForm, email: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border rounded-lg text-xs"
                      placeholder="mahadaly@ddimangkoso.ac.id"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">WhatsApp Resmi</label>
                    <input
                      type="text"
                      value={footerForm.whatsapp}
                      onChange={(e) => setFooterForm({ ...footerForm, whatsapp: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border rounded-lg text-xs"
                      placeholder="+62 812-3456-7890"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Facebook URL</label>
                    <input
                      type="text"
                      value={footerForm.facebookUrl}
                      onChange={(e) => setFooterForm({ ...footerForm, facebookUrl: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border rounded-lg text-xs font-mono"
                      placeholder="https://facebook.com/..."
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Instagram URL</label>
                    <input
                      type="text"
                      value={footerForm.instagramUrl}
                      onChange={(e) => setFooterForm({ ...footerForm, instagramUrl: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border rounded-lg text-xs font-mono"
                      placeholder="https://instagram.com/..."
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">YouTube Channel URL</label>
                    <input
                      type="text"
                      value={footerForm.youtubeUrl}
                      onChange={(e) => setFooterForm({ ...footerForm, youtubeUrl: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border rounded-lg text-xs font-mono"
                      placeholder="https://youtube.com/..."
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Telegram Channel / Grup URL</label>
                    <input
                      type="text"
                      value={footerForm.telegramUrl || ""}
                      onChange={(e) => setFooterForm({ ...footerForm, telegramUrl: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border rounded-lg text-xs font-mono"
                      placeholder="https://t.me/..."
                    />
                  </div>
                </div>

                <div className="pt-3 border-t flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      updateFooterSettings(footerForm);
                      alert("Kontak & Media sosial kolom 4 berhasil disimpan!");
                    }}
                    className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow"
                  >
                    Simpan Kontak Kolom 4
                  </button>
                </div>
              </div>
            )}

            {/* TAB 5: BAR BAWAH (BOTTOM BAR & HAK CIPTA) */}
            {footerSubTab === "bottom" && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                <div className="border-b pb-3 flex items-center justify-between">
                  <h4 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
                    <span>⚖️</span>
                    <span>Bar Bawah (Bottom Bar), Hak Cipta &amp; Tautan Admin</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">Bagian paling dasar website</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Teks Hak Cipta (Copyright)</label>
                    <input
                      type="text"
                      value={footerForm.copyrightText}
                      onChange={(e) => setFooterForm({ ...footerForm, copyrightText: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border rounded-lg text-xs"
                      placeholder="© 2026 Ma'had Aly DDI Mangkoso. Hak Cipta Dilindungi."
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tagline / Motto Bar Bawah</label>
                    <input
                      type="text"
                      value={footerForm.tagline}
                      onChange={(e) => setFooterForm({ ...footerForm, tagline: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border rounded-lg text-xs text-amber-900 font-semibold"
                      placeholder="Mewarisi Khazanah Turats • Menjaga Sanad Ulama Nusantara"
                    />
                  </div>
                </div>

                {/* Pengaturan Tautan Admin di Footer */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900 text-xs">Tampilkan Tautan Masuk Admin di Footer</p>
                      <p className="text-[11px] text-slate-500">
                        Memudahkan redaksi/dosen untuk login langsung dari footer publik.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={footerForm.showAdminLink}
                        onChange={(e) => setFooterForm({ ...footerForm, showAdminLink: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  {footerForm.showAdminLink && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                      <div>
                        <label className="block font-bold text-slate-700 text-[11px] mb-1">Label Tautan Admin</label>
                        <input
                          type="text"
                          value={footerForm.adminLinkLabel}
                          onChange={(e) => setFooterForm({ ...footerForm, adminLinkLabel: e.target.value })}
                          className="w-full p-2 bg-white border rounded-lg text-xs"
                          placeholder="🔒 Masuk Panel Redaksi (Admin)"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 text-[11px] mb-1">URL Tujuan Login</label>
                        <input
                          type="text"
                          value={footerForm.adminLinkUrl}
                          onChange={(e) => setFooterForm({ ...footerForm, adminLinkUrl: e.target.value })}
                          className="w-full p-2 bg-white border rounded-lg text-xs font-mono"
                          placeholder="/admin"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      updateFooterSettings(footerForm);
                      alert("Pengaturan Bar Bawah & Hak Cipta berhasil disimpan!");
                    }}
                    className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow"
                  >
                    Simpan Pengaturan Bar Bawah
                  </button>
                </div>
              </div>
            )}

            {/* TAB 6: PENGATURAN VISUAL & TATA LETAK */}
            {footerSubTab === "visual" && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <div className="border-b pb-3 flex items-center justify-between">
                  <h4 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
                    <span>🎨</span>
                    <span>Pengaturan Visual, Warna Tema &amp; Tata Letak Kolom</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">Kostumisasi tampilan estetis footer</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Background Color Picker */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <label className="block font-bold text-slate-900">Warna Latar Belakang Footer (Background)</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={footerForm.footerBgColor}
                        onChange={(e) => setFooterForm({ ...footerForm, footerBgColor: e.target.value })}
                        className="w-12 h-12 rounded-lg cursor-pointer border p-0.5"
                      />
                      <input
                        type="text"
                        value={footerForm.footerBgColor}
                        onChange={(e) => setFooterForm({ ...footerForm, footerBgColor: e.target.value })}
                        className="w-36 p-2 bg-white border rounded-lg font-mono text-xs uppercase"
                      />
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500 mb-1.5 font-bold">Preset Warna Populer:</p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { name: "Hijau Ma'had", hex: "#0b4a25" },
                          { name: "Hijau Hutan Gelap", hex: "#062614" },
                          { name: "Biru Slate Gelap", hex: "#0f172a" },
                          { name: "Hitam Pekat", hex: "#18181b" },
                          { name: "Teal Pekat", hex: "#134e4a" }
                        ].map((preset) => (
                          <button
                            key={preset.hex}
                            type="button"
                            onClick={() => setFooterForm({ ...footerForm, footerBgColor: preset.hex })}
                            className="px-2.5 py-1 bg-white border rounded-lg text-[10px] font-medium flex items-center gap-1.5 hover:border-slate-400"
                          >
                            <span className="w-3 h-3 rounded-full shrink-0 border" style={{ backgroundColor: preset.hex }}></span>
                            <span>{preset.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Text Color Picker */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <label className="block font-bold text-slate-900">Warna Teks Utama Footer</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={footerForm.footerTextColor}
                        onChange={(e) => setFooterForm({ ...footerForm, footerTextColor: e.target.value })}
                        className="w-12 h-12 rounded-lg cursor-pointer border p-0.5"
                      />
                      <input
                        type="text"
                        value={footerForm.footerTextColor}
                        onChange={(e) => setFooterForm({ ...footerForm, footerTextColor: e.target.value })}
                        className="w-36 p-2 bg-white border rounded-lg font-mono text-xs uppercase"
                      />
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500 mb-1.5 font-bold">Preset Warna Teks:</p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { name: "Krem Emas", hex: "#f4e8c1" },
                          { name: "Emerald Soft", hex: "#ecfdf5" },
                          { name: "Putih Bersih", hex: "#ffffff" },
                          { name: "Abu Slate Terang", hex: "#cbd5e1" },
                          { name: "Kuning Lembut", hex: "#fef08a" }
                        ].map((preset) => (
                          <button
                            key={preset.hex}
                            type="button"
                            onClick={() => setFooterForm({ ...footerForm, footerTextColor: preset.hex })}
                            className="px-2.5 py-1 bg-white border rounded-lg text-[10px] font-medium flex items-center gap-1.5 hover:border-slate-400"
                          >
                            <span className="w-3 h-3 rounded-full shrink-0 border" style={{ backgroundColor: preset.hex }}></span>
                            <span>{preset.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column Layout Selector */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <label className="block font-bold text-slate-900">Jumlah Kolom Footer (Desktop View)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { cols: 2, label: "2 Kolom", desc: "Identitas & Kontak" },
                      { cols: 3, label: "3 Kolom", desc: "Identitas, Navigasi & Kontak" },
                      { cols: 4, label: "4 Kolom (Default)", desc: "Identitas, Navigasi, Fokus Keilmuan & Kanal Informasi" }
                    ].map((layout) => (
                      <button
                        key={layout.cols}
                        type="button"
                        onClick={() => setFooterForm({ ...footerForm, columnLayout: layout.cols })}
                        className={`p-3 rounded-xl text-left border transition ${
                          footerForm.columnLayout === layout.cols
                            ? "bg-emerald-50 border-emerald-600 ring-2 ring-emerald-600/20"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <p className="font-bold text-slate-900">{layout.label}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{layout.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      updateFooterSettings(footerForm);
                      alert("Pengaturan Visual & Warna Tema Footer berhasil disimpan!");
                    }}
                    className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow"
                  >
                    Simpan Pengaturan Visual
                  </button>
                </div>
              </div>
            )}

            {/* TAB 7: PRATINJAU LANGSUNG (MOCKUP LIVE PREVIEW) */}
            {footerSubTab === "preview" && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
                      <span>👁️</span>
                      <span>Pratinjau Langsung Tampilan Footer (Live Mockup)</span>
                    </h4>
                    <p className="text-slate-500 text-xs mt-0.5">
                      Di bawah ini adalah simulasi tampilan kaki website publik berdasarkan konfigurasi aktif.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSaveFooterSettings}
                      className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow"
                    >
                      💾 Terapkan Perubahan ke Website
                    </button>
                  </div>
                </div>

                {/* Interactive Rendered Footer Card */}
                <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-300">
                  <footer
                    style={{ backgroundColor: footerForm.footerBgColor, color: footerForm.footerTextColor }}
                    className="pt-12 pb-6 px-6 sm:px-12 border-t-4 border-amber-400 transition-colors duration-300"
                  >
                    <div className="max-w-7xl mx-auto space-y-8">
                      <div
                        className={`grid gap-8 pb-8 border-b border-white/10 ${
                          footerForm.columnLayout === 2
                            ? "grid-cols-1 md:grid-cols-2"
                            : footerForm.columnLayout === 3
                            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
                        }`}
                      >
                        {/* Kolom 1 */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-lg bg-emerald-950/40 p-1 flex items-center justify-center border border-amber-400/40 shrink-0">
                              <span className="text-xl">🕌</span>
                            </div>
                            <div>
                              <p className="font-serif font-bold text-base text-white">{footerForm.orgName}</p>
                              {footerForm.orgSubname && (
                                <p className="text-[10px] text-amber-300 font-semibold uppercase tracking-wider">{footerForm.orgSubname}</p>
                              )}
                            </div>
                          </div>
                          <p className="text-xs opacity-90 leading-relaxed">
                            {footerForm.description}
                          </p>
                          {footerForm.address && (
                            <p className="text-[11px] opacity-75 flex items-start gap-1.5">
                              <span>📍</span>
                              <span>{footerForm.address}</span>
                            </p>
                          )}
                        </div>

                        {/* Kolom 2 */}
                        <div>
                          <p className="font-serif font-bold text-sm text-white mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                            <span>Navigasi Portal</span>
                          </p>
                          <ul className="space-y-2 text-xs">
                            {footerNav
                              .filter((item) => item.isActive)
                              .sort((a, b) => a.position - b.position)
                              .map((item) => (
                                <li key={item.id}>
                                  <span className="hover:underline cursor-pointer opacity-90">{item.label}</span>
                                </li>
                              ))}
                          </ul>
                        </div>

                        {/* Kolom 3 */}
                        {footerForm.columnLayout >= 3 && (
                          <div>
                            <p className="font-serif font-bold text-sm text-white mb-3 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                              <span>Fokus Keilmuan</span>
                            </p>
                            <ul className="space-y-2 text-xs">
                              {footerFocus
                                .filter((item) => item.isActive)
                                .sort((a, b) => a.position - b.position)
                                .map((item) => (
                                  <li key={item.id} className="flex items-center gap-1.5">
                                    <span>{item.icon || "📖"}</span>
                                    <span className="opacity-90">{item.name}</span>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        )}

                        {/* Kolom 4 */}
                        <div>
                          <p className="font-serif font-bold text-sm text-white mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                            <span>Kanal Informasi</span>
                          </p>
                          <p className="text-xs opacity-90 mb-3 leading-relaxed">
                            {footerForm.kanalDescription}
                          </p>
                          <div className="space-y-1.5 text-xs opacity-95">
                            {footerForm.email && <p>Email: <span className="font-bold text-white">{footerForm.email}</span></p>}
                            {footerForm.whatsapp && <p>WA: <span className="font-bold text-white">{footerForm.whatsapp}</span></p>}
                          </div>
                          {footerForm.showAdminLink && (
                            <div className="pt-3 mt-3 border-t border-white/10">
                              <span className="text-[11px] text-amber-300 hover:underline cursor-pointer flex items-center gap-1">
                                <span>{footerForm.adminLinkLabel}</span>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bar Bawah */}
                      <div className="flex flex-col sm:flex-row items-center justify-between text-xs opacity-75 gap-3 pt-2 text-center sm:text-left">
                        <p>{footerForm.copyrightText}</p>
                        <p className="text-amber-300 font-medium">{footerForm.tagline}</p>
                      </div>
                    </div>
                  </footer>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            16. PENGATURAN & SOSMED & BACKUP
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
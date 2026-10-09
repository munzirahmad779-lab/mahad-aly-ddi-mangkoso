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
  PageSeoItem,
  PageTextsSettings,
  CustomPageElement,
  DonationProgram,
  DonationCategoryKey,
  BankAccount,
  SecurityThreatLog,
  HomeSectionConfigItem
} from "@/lib/types";
import { INITIAL_PAGE_TEXTS } from "@/lib/mock-data";

const SYSTEM_NAV_PAGES = [
  { label: "🏠 Beranda", url: "/" },
  { label: "📚 Mimbar Kajian (Artikel Fiqh)", url: "/artikel" },
  { label: "✍️ Opini & Refleksi Santri", url: "/opini" },
  { label: "🎓 Repositori Skripsi", url: "/skripsi" },
  { label: "🕌 Bahtsul Masail", url: "/bahtsul-masail" },
  { label: "🏛️ Tentang Lembaga", url: "/tentang" },
  { label: "📜 Profil: Sejarah", url: "/tentang#sejarah" },
  { label: "🎯 Profil: Visi & Misi", url: "/tentang#visi-misi" },
  { label: "👳 Profil: Dewan Masyayikh / Dosen", url: "/tentang#dosen" },
  { label: "🏢 Profil: Sarana & Prasarana", url: "/tentang#sarana" },
  { label: "📜 Profil: Sertifikat Akreditasi", url: "/tentang#akreditasi" },
  { label: "👥 Profil: Struktur Organisasi", url: "/tentang#struktur" },
  { label: "📖 Akademik: Takhassus", url: "/akademik#takhassus" },
  { label: "📑 Akademik: Kurikulum", url: "/akademik#kurikulum" },
  { label: "📅 Akademik: Kalender Pendidikan", url: "/akademik#kalender" },
  { label: "📰 Warta Berita & Agenda", url: "/berita" },
  { label: "🤲 Infaq & Donasi Program", url: "/donasi" },
  { label: "📝 Kirim Naskah", url: "/kirim-tulisan" },
  { label: "🔍 Lacak Status Naskah", url: "/submission/track" },
  { label: "✍️ Dashboard Penulis", url: "/penulis" },
  { label: "🔗 URL Kustom Lainnya...", url: "custom" }
];

export default function AdminPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<{
    role: string;
    nama_lengkap: string;
    email: string;
    permissions?: { canManageDonations?: boolean; canPublishDirect?: boolean };
  } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const isSuperAdmin = userProfile?.role === "super_admin" || currentUser?.email === "munzirahmad779@gmail.com";

  // User Management State (Username, Email, Kata Sandi & Role)
  const [userTab, setUserTab] = useState<"list" | "create" | "mypassword" | "locked">("list");
  const [createAccountMode, setCreateAccountMode] = useState<"direct" | "invite">("direct");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"super_admin" | "admin" | "penulis">("admin");
  const [inviteName, setInviteName] = useState("");
  const [directPassword, setDirectPassword] = useState("");
  const [userActionLoading, setUserActionLoading] = useState(false);
  const [dbUsers, setDbUsers] = useState<any[]>([]);

  // Password Reset Modal (Admin Resets Other User)
  const [resetTargetUser, setResetTargetUser] = useState<any | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState("");

  // Edit User Profile Modal (Username & Role)
  const [editTargetUser, setEditTargetUser] = useState<any | null>(null);
  const [editNameInput, setEditNameInput] = useState("");
  const [editRoleInput, setEditRoleInput] = useState<string>("admin");

  // Change Super Admin's Own Password
  const [myNewPassword, setMyNewPassword] = useState("");
  const [myConfirmPassword, setMyConfirmPassword] = useState("");

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
    retryEmailSend,
    saveSubmissionFullPaper,
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
    publishSubmissionAsArticle,
    publishSubmissionAsThesis,
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
    addLog,
    donations,
    addDonation,
    updateDonation,
    deleteDonation,
    resetDonationsToDefault,
    securityThreats,
    addSecurityThreat,
    clearSecurityThreats,
    grantDonationPermission
  } = useArticles();

  // Audit Logs & Super Admin Tracking State
  const [auditSearch, setAuditSearch] = useState("");
  const [auditActionFilter, setAuditActionFilter] = useState("all");

  const currentUserName =
    userProfile?.nama_lengkap ||
    currentUser?.email ||
    (isSuperAdmin ? "Super Admin (Ahmad Yusuf Mubarak)" : "Admin");

  const confirmAndReset = (moduleName: string, resetFn: (user?: string) => void) => {
    const confirmed = window.confirm(
      `⚠️ PERINGATAN RESET PENGATURAN STANDAR:\n\nApakah Anda yakin ingin mengembalikan modul "${moduleName}" ke data/pengaturan standar (default awal)?\n\nPerubahan yang belum dicadangkan akan dikembalikan ke data awal. Riwayat tindakan ini akan dicatat ke Log Audit Super Admin.`
    );
    if (confirmed) {
      resetFn(currentUserName);
      alert(`✓ Modul "${moduleName}" berhasil dikembalikan ke standar awal!`);
    }
  };

  const handleExportAuditLogsCsv = () => {
    if (!logs || logs.length === 0) {
      alert("Belum ada riwayat aktivitas yang tercatat.");
      return;
    }
    const headers = "ID,Tanggal & Waktu,Pelaku / Admin,Tindakan,Target Objek\n";
    const rows = logs
      .map((l) => `"${l.id}","${l.timestamp}","${l.user}","${l.action}","${(l.target || "").replace(/"/g, '""')}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-mahad-aly-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Donation Access & Form State ──
  const hasDonationAccess =
    isSuperAdmin ||
    Boolean(userProfile?.permissions?.canManageDonations) ||
    Boolean(users.find((u) => u.email === currentUser?.email)?.permissions?.canManageDonations);

  const [donationTab, setDonationTab] = useState<"list" | "form" | "permissions">("list");
  const [editingDonationId, setEditingDonationId] = useState<string | null>(null);
  const [donationFilterCategory, setDonationFilterCategory] = useState<"all" | DonationCategoryKey>("all");

  const [donationForm, setDonationForm] = useState<{
    title: string;
    category: DonationCategoryKey;
    categoryLabel: string;
    shortDesc: string;
    story: string;
    targetAmount: number;
    collectedAmount: number;
    donorCount: number;
    deadline: string;
    imageUrl: string;
    proposalUrl: string;
    proposalName: string;
    proposalSize: string;
    bankAccounts: BankAccount[];
    contactPersonName: string;
    contactPersonPhone: string;
    isActive: boolean;
    isFeatured: boolean;
  }>({
    title: "",
    category: "short_course_mesir",
    categoryLabel: "Short Course & Risalah Mesir",
    shortDesc: "",
    story: "",
    targetAmount: 0,
    collectedAmount: 0,
    donorCount: 0,
    deadline: "Terbuka Berkelanjutan",
    imageUrl: "",
    proposalUrl: "",
    proposalName: "",
    proposalSize: "",
    bankAccounts: [
      { id: "b1", bankName: "Bank Syariah Indonesia (BSI)", accountNumber: "", accountHolder: "Ma'had Aly DDI Mangkoso" }
    ],
    contactPersonName: "Bendahara / Admin Donasi",
    contactPersonPhone: "6281234567890",
    isActive: true,
    isFeatured: false
  });

  const handleEditDonationClick = (item: DonationProgram) => {
    setEditingDonationId(item.id);
    setDonationForm({
      title: item.title,
      category: item.category,
      categoryLabel: item.categoryLabel,
      shortDesc: item.shortDesc,
      story: item.story || "",
      targetAmount: item.targetAmount || 0,
      collectedAmount: item.collectedAmount || 0,
      donorCount: item.donorCount || 0,
      deadline: item.deadline || "Terbuka Berkelanjutan",
      imageUrl: item.imageUrl || "",
      proposalUrl: item.proposalUrl || "",
      proposalName: item.proposalName || "",
      proposalSize: item.proposalSize || "",
      bankAccounts: item.bankAccounts && item.bankAccounts.length > 0 ? item.bankAccounts : [
        { id: "b1", bankName: "Bank Syariah Indonesia (BSI)", accountNumber: "", accountHolder: "Ma'had Aly DDI Mangkoso" }
      ],
      contactPersonName: item.contactPerson?.name || "Admin Donasi",
      contactPersonPhone: item.contactPerson?.phone || "6281234567890",
      isActive: item.isActive,
      isFeatured: Boolean(item.isFeatured)
    });
    setDonationTab("form");
  };

  const handleSaveDonation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donationForm.title.trim()) {
      alert("Judul program donasi wajib diisi!");
      return;
    }

    const payload = {
      title: donationForm.title.trim(),
      slug: donationForm.title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-"),
      category: donationForm.category,
      categoryLabel:
        donationForm.category === "short_course_mesir"
          ? "Short Course & Risalah Mesir"
          : donationForm.category === "web_dev"
          ? "Pengembangan Web & IT"
          : donationForm.category === "orang_tua_asuh"
          ? "Orang Tua Angkat"
          : donationForm.category === "operasional_umum"
          ? "Infaq & Sarana Ma'had"
          : "Program Donasi",
      shortDesc: donationForm.shortDesc.trim(),
      story: donationForm.story.trim(),
      targetAmount: Number(donationForm.targetAmount) || 0,
      collectedAmount: Number(donationForm.collectedAmount) || 0,
      donorCount: Number(donationForm.donorCount) || 0,
      deadline: donationForm.deadline.trim() || "Terbuka Berkelanjutan",
      imageUrl: donationForm.imageUrl.trim() || undefined,
      proposalUrl: donationForm.proposalUrl.trim() || undefined,
      proposalName: donationForm.proposalName.trim() || undefined,
      proposalSize: donationForm.proposalSize.trim() || undefined,
      bankAccounts: donationForm.bankAccounts,
      contactPerson: {
        name: donationForm.contactPersonName.trim(),
        phone: donationForm.contactPersonPhone.trim()
      },
      isActive: donationForm.isActive,
      isFeatured: donationForm.isFeatured
    };

    if (editingDonationId) {
      updateDonation(editingDonationId, payload, currentUserName);
      alert(`✓ Program donasi "${payload.title}" berhasil diperbarui!`);
    } else {
      addDonation(payload, currentUserName);
      alert(`✓ Program donasi "${payload.title}" berhasil diterbitkan!`);
    }

    setEditingDonationId(null);
    setDonationTab("list");
  };

  // ── Security Defense Center States & Test Action ──
  const [securityAlertTesting, setSecurityAlertTesting] = useState(false);
  const [securityAlertStatus, setSecurityAlertStatus] = useState<string | null>(null);

  const handleTestSecurityAlert = async () => {
    if (!confirm("Kirim simulasi peringatan darurat keamanan ke seluruh email administrator aktif?")) return;
    setSecurityAlertTesting(true);
    setSecurityAlertStatus(null);
    try {
      const activeAdminEmails = dbUsers.filter((u) => u.email).map((u) => u.email);
      const res = await fetch("/api/security/alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threatType: "brute_force",
          severity: "high",
          ip: "103.145.22.4",
          endpoint: "/admin/login",
          details: "Simulasi Uji Pertahanan: Percobaan akses liar berulang kali diblokir oleh sistem rate-limit.",
          adminEmails: activeAdminEmails.length > 0 ? activeAdminEmails : ["munzirahmad779@gmail.com"]
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addSecurityThreat({
          threatType: "brute_force",
          severity: "high",
          ip: "103.145.22.4",
          endpoint: "/admin/login",
          details: "Uji simulasi notifikasi intrusi berhasil dikirim ke seluruh admin.",
          status: "blocked",
          alertSent: true
        });
        setSecurityAlertStatus("✅ Berhasil: Email notifikasi darurat telah dikirimkan ke seluruh admin!");
      } else {
        setSecurityAlertStatus(`⚠️ Respon API: ${data.error || "Gagal mengirim notifikasi"}`);
      }
    } catch (err: any) {
      setSecurityAlertStatus(`❌ Error: ${err.message}`);
    } finally {
      setSecurityAlertTesting(false);
    }
  };

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

  const handleCreateOrInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setUserActionLoading(true);

    try {
      if (createAccountMode === "direct") {
        if (!directPassword || directPassword.length < 6) {
          throw new Error("Kata sandi akun baru minimal 6 karakter.");
        }
        const res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "create_user",
            email: inviteEmail,
            password: directPassword,
            nama_lengkap: inviteName,
            role: inviteRole
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal membuat pengguna.");
        alert(`✅ Akun pengguna ${inviteEmail} berhasil dibuat langsung dengan kata sandi!`);
        setInviteEmail("");
        setInviteName("");
        setDirectPassword("");
        setUserTab("list");
      } else {
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
        alert(`✅ Undangan email berhasil dikirim ke ${inviteEmail}!`);
        setInviteEmail("");
        setInviteName("");
        setUserTab("list");
      }

      // Refresh data pengguna
      const { data: userList } = await supabase.from("users").select("*").order("created_at", { ascending: false });
      if (userList) setDbUsers(userList);
    } catch (err: any) {
      alert("❌ Error: " + err.message);
    } finally {
      setUserActionLoading(false);
    }
  };

  const handleResetUserPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetUser || !newPasswordInput) return;
    if (newPasswordInput.length < 6) {
      alert("Kata sandi minimal 6 karakter.");
      return;
    }
    setUserActionLoading(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset_password",
          userId: resetTargetUser.id,
          password: newPasswordInput
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mereset kata sandi.");
      alert(`✅ Kata sandi untuk ${resetTargetUser.email} (${resetTargetUser.nama_lengkap || "User"}) berhasil diubah!`);
      setResetTargetUser(null);
      setNewPasswordInput("");
    } catch (err: any) {
      alert("❌ Error: " + err.message);
    } finally {
      setUserActionLoading(false);
    }
  };

  const handleUpdateUserProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTargetUser) return;
    setUserActionLoading(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_profile",
          userId: editTargetUser.id,
          nama_lengkap: editNameInput,
          role: editRoleInput
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memperbarui profil pengguna.");
      alert(`✅ Profil ${editTargetUser.email} berhasil diperbarui!`);
      setEditTargetUser(null);
      const { data: userList } = await supabase.from("users").select("*").order("created_at", { ascending: false });
      if (userList) setDbUsers(userList);
    } catch (err: any) {
      alert("❌ Error: " + err.message);
    } finally {
      setUserActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`Hapus pengguna ${email} secara permanen dari sistem login dan database?`)) return;
    setUserActionLoading(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_user",
          userId
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus pengguna.");
      alert(`✅ Pengguna ${email} berhasil dihapus.`);
      setDbUsers(dbUsers.filter((u) => u.id !== userId));
    } catch (err: any) {
      alert("❌ Error: " + err.message);
    } finally {
      setUserActionLoading(false);
    }
  };

  const handleChangeMyOwnPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myNewPassword || myNewPassword.length < 6) {
      alert("Kata sandi minimal 6 karakter.");
      return;
    }
    if (myNewPassword !== myConfirmPassword) {
      alert("Konfirmasi kata sandi baru tidak cocok.");
      return;
    }
    setUserActionLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password: myNewPassword });
      if (error) throw error;
      alert("✅ Kata sandi akun Anda berhasil diperbarui! Gunakan sandi baru saat login berikutnya.");
      setMyNewPassword("");
      setMyConfirmPassword("");
    } catch (err: any) {
      alert("❌ Error: " + err.message);
    } finally {
      setUserActionLoading(false);
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
    | "header"
    | "hero"
    | "homesections"
    | "aboutpage"
    | "emailtemplates"
    | "pagetexts"
    | "auditlogs"
    | "donations"
    | "security"
  >("dashboard");

  // Page Texts CMS State
  const [localPageTexts, setLocalPageTexts] = useState<PageTextsSettings>(pageTexts || INITIAL_PAGE_TEXTS);
  const [pageTextsSaved, setPageTextsSaved] = useState(false);
  const [activePageTextTab, setActivePageTextTab] = useState<
    "artikel" | "opini" | "profil" | "akademik" | "skripsi" | "berita" | "kirim" | "kontak"
  >("artikel");

  useEffect(() => {
    if (pageTexts) {
      setLocalPageTexts(pageTexts);
    }
  }, [pageTexts]);

  const handleSavePageTexts = (e: React.FormEvent) => {
    e.preventDefault();
    updatePageTexts(localPageTexts);
    setPageTextsSaved(true);
    setTimeout(() => setPageTextsSaved(false), 3500);
  };

  const handleResetPageTexts = () => {
    if (!confirm("Reset semua teks halaman publik ke pengaturan bawaan awal?")) return;
    setLocalPageTexts(INITIAL_PAGE_TEXTS);
    updatePageTexts(INITIAL_PAGE_TEXTS);
    setPageTextsSaved(true);
    setTimeout(() => setPageTextsSaved(false), 3500);
  };

  // Custom Page Elements State & Handlers
  const [newElementForm, setNewElementForm] = useState({
    title: "",
    desc: "",
    badge: "",
    icon: "📌",
    link: ""
  });
  const [showAddElementModal, setShowAddElementModal] = useState(false);

  const handleAddCustomElement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newElementForm.title.trim() || !newElementForm.desc.trim()) {
      alert("Judul dan Deskripsi elemen wajib diisi!");
      return;
    }

    const newEl: CustomPageElement = {
      id: "el-" + Date.now().toString(),
      page: activePageTextTab,
      title: newElementForm.title.trim(),
      desc: newElementForm.desc.trim(),
      badge: newElementForm.badge.trim() || undefined,
      icon: newElementForm.icon.trim() || "📌",
      link: newElementForm.link.trim() || undefined,
      order: ((localPageTexts.customElements || []).filter((el) => el.page === activePageTextTab).length) + 1
    };

    const updatedElements = [...(localPageTexts.customElements || []), newEl];
    const updatedTexts = { ...localPageTexts, customElements: updatedElements };
    setLocalPageTexts(updatedTexts);
    updatePageTexts(updatedTexts);
    setNewElementForm({ title: "", desc: "", badge: "", icon: "📌", link: "" });
    setShowAddElementModal(false);
    alert(`✓ Elemen "${newEl.title}" berhasil ditambahkan ke halaman ${activePageTextTab}!`);
  };

  const handleDeleteCustomElement = (id: string) => {
    if (!confirm("Hapus elemen ini dari halaman?")) return;
    const updatedElements = (localPageTexts.customElements || []).filter((el) => el.id !== id);
    const updatedTexts = { ...localPageTexts, customElements: updatedElements };
    setLocalPageTexts(updatedTexts);
    updatePageTexts(updatedTexts);
  };

  // Submissions Management States
  const [submissionFilter, setSubmissionFilter] = useState<"all" | "review" | "revision" | "accepted" | "rejected">("all");
  const [subTypeFilter, setSubTypeFilter] = useState<"all" | "artikel" | "opini">("all");
  const [revisionModalSub, setRevisionModalSub] = useState<any | null>(null);
  const [revisionNote, setRevisionNote] = useState("");
  const [rejectModalSub, setRejectModalSub] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [publishingSubId, setPublishingSubId] = useState<string | null>(null);
  const [previewFullPaperModalSub, setPreviewFullPaperModalSub] = useState<any | null>(null);

  // Email Management States (Super Admin)
  const [emailSubTab, setEmailSubTab] = useState<"settings" | "templates" | "logs" | "subscribers">("settings");
  const [testEmailTo, setTestEmailTo] = useState("munzirahmad779@gmail.com");
  const [testEmailSubject, setTestEmailSubject] = useState("");
  const [testEmailMessage, setTestEmailMessage] = useState("");
  const [testEmailLoading, setTestEmailLoading] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{ success: boolean; message: string; resendId?: string } | null>(null);
  const [retryingLogId, setRetryingLogId] = useState<string | null>(null);

  // Header & Navbar Form State
  const [headerForm, setHeaderForm] = useState(navbarSettings);
  const [newHeaderLink, setNewHeaderLink] = useState({ label: "", url: "/", order: 1, isActive: true });
  useEffect(() => {
    setHeaderForm(navbarSettings);
  }, [navbarSettings]);

  // Hero Section Form State
  const [heroForm, setHeroForm] = useState(heroSettings);
  useEffect(() => {
    setHeroForm(heroSettings);
  }, [heroSettings]);

  // Home Sections Form State & New Section Builder
  const [homeSectionsForm, setHomeSectionsForm] = useState(homeSections);
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [newSectionForm, setNewSectionForm] = useState<Partial<HomeSectionConfigItem>>({
    name: "donasi",
    label: "Program Infaq & Donasi Pilihan",
    title: "Dukung Kaderisasi Ulama Fiqh",
    subtitle: "Salurkan infaq terbaik Anda untuk pendidikan mahasantri dan riset Turats",
    badge: "Amal Jariyah",
    maxItems: 3,
    isActive: true,
    imageUrl: "",
    ctaText: "Infaq Sekarang",
    ctaUrl: "/donasi",
    content: ""
  });
  useEffect(() => {
    setHomeSectionsForm(homeSections);
  }, [homeSections]);

  // Locked Accounts (Salah Sandi 3x) State for Super Admin
  const [lockedAccountsList, setLockedAccountsList] = useState<Array<{
    email: string;
    failedCount: number;
    lockedAt: string;
    reason: string;
  }>>([]);

  const loadLockedAccounts = () => {
    if (typeof window !== "undefined") {
      try {
        const stored = JSON.parse(localStorage.getItem("mahad_locked_accounts") || "{}");
        setLockedAccountsList(Object.values(stored) as any[]);
      } catch (e) {
        setLockedAccountsList([]);
      }
    }
  };

  useEffect(() => {
    loadLockedAccounts();
  }, []);

  const handleUnlockAccount = (emailToUnlock: string) => {
    if (!confirm(`Buka blokir akun ${emailToUnlock}? Pengguna akan diizinkan kembali masuk dan mereset kata sandi.`)) return;
    try {
      const stored = JSON.parse(localStorage.getItem("mahad_locked_accounts") || "{}");
      delete stored[emailToUnlock.toLowerCase()];
      localStorage.setItem("mahad_locked_accounts", JSON.stringify(stored));

      const failedAttempts = JSON.parse(localStorage.getItem("mahad_failed_attempts") || "{}");
      delete failedAttempts[emailToUnlock.toLowerCase()];
      localStorage.setItem("mahad_failed_attempts", JSON.stringify(failedAttempts));

      loadLockedAccounts();
      addLog(`Super Admin membuka kunci akun ${emailToUnlock}`, "Keamanan Akun");
      alert(`✓ Kunci akun ${emailToUnlock} berhasil dibuka! Pengguna kini dapat login kembali atau menggunakan fitur Lupa Password.`);
    } catch (e) {
      alert("Gagal membuka kunci akun.");
    }
  };

  // About Page Form State
  const [aboutForm, setAboutForm] = useState(aboutPageContent);
  useEffect(() => {
    setAboutForm(aboutPageContent);
  }, [aboutPageContent]);

  // Email Templates Form State
  const [emailTemplatesForm, setEmailTemplatesForm] = useState(emailTemplates);
  const [activeTemplateId, setActiveTemplateId] = useState<string>("submission_admin");
  useEffect(() => {
    setEmailTemplatesForm(emailTemplates);
  }, [emailTemplates]);

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
  const [articleFilter, setArticleFilter] = useState<"all" | "artikel" | "opini" | "admin" | "submission">("all");
  const [articleForm, setArticleForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    author: "",
    authorRole: "Mahasantri Marhalah Ula",
    authorBio: "",
    category: categories[0]?.slug || "fiqh-muamalah-kontemporer",
    categoryLabel: categories[0]?.name || "Fiqh Muamalah Kontemporer",
    type: "artikel" as "artikel" | "opini",
    source: "admin" as "admin" | "submission",
    status: "published" as "published" | "draft",
    featuredImage: "",
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
  const [catFilter, setCatFilter] = useState<"all" | "artikel" | "opini">("all");
  const [catForm, setCatForm] = useState({
    name: "",
    description: "",
    iconName: "book",
    type: "artikel" as "artikel" | "opini"
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
    arabicReferences: "",
    imageUrl: "",
    attachmentUrl: "",
    attachmentName: ""
  });

  // 10. PMB Wave Form State
  const [pmbWaveForm, setPmbWaveForm] = useState({
    name: "",
    startDate: "01 Jan 2027",
    endDate: "28 Feb 2027",
    quota: "15 Mahasantri",
    scholarshipInfo: "Beasiswa Penuh 100%",
    requirements: "Lulusan MA/Pesantren\nHafalan 5 Juz\nMampu baca kitab kuning",
    procedure: "Daftar Online\nUnggah Berkas\nTes Seleksi Kitab",
    imageUrl: "",
    registrationLink: "",
    brochureUrl: ""
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
    date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
    imageUrl: "",
    attachmentUrl: "",
    attachmentName: "",
    attachmentSize: ""
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

  // Traffic Stats & GA Guide State
  const [showGaGuide, setShowGaGuide] = useState(false);
  const [trafficStats, setTrafficStats] = useState<{ totalViews: number; pages: Record<string, number>; lastVisit?: string }>({
    totalViews: 0,
    pages: {}
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("mahad_traffic_stats");
        if (raw) setTrafficStats(JSON.parse(raw));
      } catch (e) {}
    }
  }, []);

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
      type: "artikel",
      source: "admin",
      status: "published",
      featuredImage: "",
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
    setCatForm({ name: "", description: "", iconName: "book", type: "artikel" });
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

          {/* Categorized Nav List */}
          <nav className="space-y-3.5 text-xs font-medium max-h-[75vh] overflow-y-auto pr-1">
            {[
              {
                title: "📊 PANTAUAN & AUDIT",
                items: [
                  { id: "dashboard", icon: "📊", label: "Dashboard Utama" },
                  ...(isSuperAdmin
                    ? [
                        { id: "auditlogs", icon: "🔒", label: "Riwayat Perubahan", badge: "Super" },
                        { id: "security", icon: "🛡️", label: "Pusat Pertahanan", badge: "Shield" }
                      ]
                    : [])
                ]
              },
              {
                title: "🎨 TATA LETAK & TAMPILAN",
                items: [
                  { id: "header", icon: "🧭", label: "Header & Navbar", badge: "Live" },
                  { id: "homesections", icon: "📑", label: "Section Beranda", badge: "Builder" },
                  { id: "hero", icon: "🌟", label: "Hero Banner & Metrik" },
                  { id: "pagetexts", icon: "✍️", label: "Teks Halaman (CMS)" },
                  { id: "footer", icon: "🦶", label: "Footer Manager" }
                ]
              },
              {
                title: "✍️ KONTEN & PUBLIKASI",
                items: [
                  { id: "submissions", icon: "📥", label: "Submission Masuk", alertBadge: pendingSubmissionsCount },
                  { id: "publications", icon: "📚", label: "Publikasi Fiqh & Skripsi", badge: articles.length + theses.length },
                  { id: "content", icon: "🎨", label: "Kalam Hikmah" },
                  { id: "information", icon: "📰", label: "Warta & Galeri" },
                  { id: "media", icon: "🖼️", label: "Media Library" }
                ]
              },
              {
                title: "🏛️ LEMBAGA & AKADEMIK",
                items: [
                  { id: "bahtsul", icon: "🕌", label: "Bahtsul Masail" },
                  { id: "pmb", icon: "🎓", label: "PMB Online" },
                  { id: "profile", icon: "📜", label: "Profil Lembaga" },
                  { id: "academic", icon: "📖", label: "Akademik & Kurikulum" },
                  { id: "aboutpage", icon: "🏛️", label: "Halaman Tentang" },
                  { id: "comingsoon", icon: "🔧", label: "Coming Soon Mgr" }
                ]
              },
              {
                title: "🤲 PROGRAM & DONASI",
                items: [
                  {
                    id: "donations",
                    icon: "💰",
                    label: "Kelola Donasi",
                    badge: isSuperAdmin ? "Super" : hasDonationAccess ? "Akses" : "Terkunci"
                  }
                ]
              },
              {
                title: "⚙️ SISTEM & KEAMANAN",
                items: [
                  { id: "seo", icon: "🔍", label: "SEO & Meta Tag" },
                  ...(isSuperAdmin
                    ? [
                        { id: "users", icon: "👥", label: "User & Buka Blokir", badge: "Super" },
                        { id: "email", icon: "📧", label: "Konfigurasi Email", badge: "Super" },
                        { id: "settings", icon: "⚙️", label: "Pengaturan Web", badge: "Super" }
                      ]
                    : [])
                ]
              }
            ].map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                {sidebarOpen && (
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400/80 bg-slate-900/60 rounded-md">
                    {group.title}
                  </div>
                )}
                <div className="space-y-0.5">
                  {group.items.map((menu: any) => (
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
                </div>
              </div>
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
                {userProfile?.nama_lengkap || currentUser?.email || "Admin"}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${isSuperAdmin ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`}></span>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isSuperAdmin ? "text-amber-300" : "text-emerald-300"}`}>
                  {isSuperAdmin ? "👑 Super Admin" : "🟢 Admin / Redaksi"}
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
              {activeMenu === "submissions" && "📥 Manajemen Naskah (Tracking, Review & 1-Click Terbit)"}
              {activeMenu === "header" && "🧭 Kelola Header, Logo & Menu Navigasi"}
              {activeMenu === "hero" && "🌟 Kelola Hero Section & Metrik Beranda"}
              {activeMenu === "homesections" && "📑 Pengaturan Urutan & Visibilitas Section Beranda"}
              {activeMenu === "aboutpage" && "🏛️ Kelola Konten Halaman Tentang & Sejarah"}
              {activeMenu === "emailtemplates" && "✉️ Kelola Template Email Notifikasi (Resend)"}
              {activeMenu === "profile" && "📜 Kelola Halaman Profil (Sejarah, Visi Misi, Dosen, Sarana, Akreditasi)"}
              {activeMenu === "academic" && "📖 Kelola Akademik (Takhassus, Kurikulum 8 Semester, Kalender)"}
              {activeMenu === "content" && "🎨 Kustomisasi Kalam Hikmah Anregurutta (Arab RTL)"}
              {activeMenu === "publications" && "📚 Publikasi Fiqh (Artikel, Kategori Tanpa Batas, Skripsi + Drive)"}
              {activeMenu === "pagetexts" && "✍️ Edit Teks & Narasi Halaman Publik (CMS Tanpa Ngoding)"}
              {activeMenu === "bahtsul" && "🕌 Bahtsul Masail (Persiapan Fatwa, Soal Jawab & Subscriber)"}
              {activeMenu === "pmb" && "🎓 Penerimaan Mahasantri Baru (PMB Online, Gelombang & FAQ)"}
              {activeMenu === "information" && "📰 Warta Berita, Agenda & Galeri Foto Dokumentasi"}
              {activeMenu === "email" && "📧 Konfigurasi Email Redaksi, Log & Subscriber"}
              {activeMenu === "comingsoon" && "🔧 Manajemen Halaman Coming Soon / Placeholder"}
              {activeMenu === "donations" && "💰 Kelola Program Donasi, Wakaf & Rekening Resmi Lembaga"}
              {activeMenu === "auditlogs" && "🔒 Riwayat Perubahan & Audit Trail Aktivitas Admin (Khusus Super Admin)"}
              {activeMenu === "security" && "🛡️ Pusat Pertahanan Siber & Deteksi Ancaman (Anti-Hack)"}
              {activeMenu === "users" && "👥 Manajemen Pengguna & Hak Akses"}
              {activeMenu === "media" && "🖼️ Media Library & Penyimpanan Berkas"}
              {activeMenu === "seo" && "🔍 Pengaturan SEO & Meta Per Halaman"}
              {activeMenu === "footer" && "🦶 Footer Manager"}
              {activeMenu === "settings" && "⚙️ Identitas Lembaga, Sosial Media & Backup / Restore JSON"}
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Tombol Reset Modul ke Standar Bawaan */}
            {activeMenu !== "dashboard" && activeMenu !== "media" && activeMenu !== "users" && (
              <button
                type="button"
                onClick={() => {
                  switch (activeMenu) {
                    case "header":
                      confirmAndReset("Navbar / Header", resetNavbarToDefault);
                      break;
                    case "hero":
                      confirmAndReset("Hero Banner & Slogan", resetHeroToDefault);
                      break;
                    case "homesections":
                      confirmAndReset("Section Beranda", resetHomeSectionsToDefault);
                      break;
                    case "aboutpage":
                      confirmAndReset("Halaman Tentang", resetAboutContentToDefault);
                      break;
                    case "profile":
                      confirmAndReset("Profil Lembaga", resetProfileToDefault);
                      break;
                    case "academic":
                      confirmAndReset("Data Akademik", resetAcademicToDefault);
                      break;
                    case "content":
                      confirmAndReset("Kalam Hikmah & Quote", resetQuoteToDefault);
                      break;
                    case "publications":
                      confirmAndReset("Publikasi & Kategori", resetPublicationsToDefault);
                      break;
                    case "pagetexts":
                      confirmAndReset("Teks Halaman CMS", resetPageTextsToDefault);
                      break;
                    case "bahtsul":
                      confirmAndReset("Bahtsul Masail", resetBahtsulToDefault);
                      break;
                    case "pmb":
                      confirmAndReset("PMB Online", resetPMBToDefault);
                      break;
                    case "information":
                      confirmAndReset("Warta & Galeri", resetNewsAndGalleryToDefault);
                      break;
                    case "comingsoon":
                      confirmAndReset("Coming Soon Manager", resetComingSoonToDefault);
                      break;
                    case "seo":
                      confirmAndReset("SEO & Meta Tags", resetSeoToDefault);
                      break;
                    case "footer":
                      confirmAndReset("Footer Manager", resetSettingsToDefault);
                      break;
                    case "email":
                    case "emailtemplates":
                      confirmAndReset("Template & Pengaturan Email", resetEmailTemplatesToDefault);
                      break;
                    case "settings":
                      confirmAndReset("Pengaturan Web & Identitas", resetSettingsToDefault);
                      break;
                    case "auditlogs":
                      confirmAndReset("Arsip Log Aktivitas", clearActivityLogs);
                      break;
                    case "donations":
                      confirmAndReset("Program Donasi & Rekening", resetDonationsToDefault);
                      break;
                    case "security":
                      confirmAndReset("Log Ancaman Keamanan", clearSecurityThreats);
                      break;
                    default:
                      break;
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition shadow-sm"
                title={`Kembalikan konfigurasi pada panel ${activeMenu} ke kondisi standar bawaan`}
              >
                <span>🔄</span>
                <span className="hidden sm:inline">Reset Panel ke Standar</span>
              </button>
            )}

            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
              isSuperAdmin ? "bg-amber-100 text-amber-950 border border-amber-300" : "bg-emerald-100 text-emerald-900 border border-emerald-300"
            }`}>
              <span className={`w-2 h-2 rounded-full ${isSuperAdmin ? "bg-amber-600 animate-ping" : "bg-emerald-600 animate-ping"}`}></span>
              {isSuperAdmin ? "👑 Super Admin Aktif" : "🟢 Admin / Redaksi Aktif"}
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

            {/* Metrik Database Riil & Status Analitik Trafik */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b gap-2">
                  <div>
                    <h3 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
                      <span>🗄️</span>
                      <span>Ringkasan Data Riil Database Sistem</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Akumulasi entitas aktif yang tersimpan di PostgreSQL Supabase &amp; Cloudflare R2
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                    ✓ 100% Data Riil Terverifikasi
                  </span>
                </div>

                {/* Grid Metrik Database Riil */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Kajian Fikih</span>
                    <p className="font-serif font-bold text-2xl text-emerald-900">
                      {articles.filter((a) => a.type !== "opini").length}
                    </p>
                    <span className="text-[10px] text-emerald-700">Artikel Ilmiah</span>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Opini &amp; Refleksi</span>
                    <p className="font-serif font-bold text-2xl text-amber-600">
                      {articles.filter((a) => a.type === "opini").length}
                    </p>
                    <span className="text-[10px] text-amber-700">Gagasan Santri</span>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Berkas R2</span>
                    <p className="font-serif font-bold text-2xl text-slate-900">
                      {media.length}
                    </p>
                    <span className="text-[10px] text-slate-500">Foto &amp; PDF</span>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Pendaftar PMB</span>
                    <p className="font-serif font-bold text-2xl text-emerald-800">
                      {subscribers.length}
                    </p>
                    <span className="text-[10px] text-emerald-600">Form Masuk</span>
                  </div>
                </div>

                {/* Pelacak Trafik Pengunjung Web & Google Analytics */}
                {(() => {
                  const currentGaId = settings?.seo?.googleAnalyticsId || settings?.googleAnalyticsId || "";
                  const isGaActive = Boolean(currentGaId && currentGaId !== "G-MAHADALY2026");

                  return (
                    <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <span>📈</span>
                            <span>Pelacak Trafik Pengunjung Web (Traffic Analytics)</span>
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Statistik pembaca riil dari peramban pengunjung &amp; integrasi Google Analytics 4
                          </p>
                        </div>
                        <div>
                          {isGaActive ? (
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                              <span>GA4 Aktif: {currentGaId}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                              ⚠️ ID GA Belum Diisi (Default)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Metrik Trafik Riil dari Sisi Browser Pengunjung */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-xl">
                          <span className="text-[10px] font-bold text-emerald-900 block uppercase">Total Kunjungan Riil</span>
                          <p className="font-serif font-bold text-xl text-emerald-950 mt-0.5">
                            {trafficStats.totalViews || 0}
                          </p>
                          <span className="text-[9px] text-emerald-700">Tayangan Halaman</span>
                        </div>

                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                          <span className="text-[10px] font-bold text-slate-600 block uppercase">Halaman Beranda</span>
                          <p className="font-serif font-bold text-xl text-slate-900 mt-0.5">
                            {trafficStats.pages?.["/"] || 0}
                          </p>
                          <span className="text-[9px] text-slate-500">Kunjungan</span>
                        </div>

                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                          <span className="text-[10px] font-bold text-slate-600 block uppercase">Artikel &amp; Risalah</span>
                          <p className="font-serif font-bold text-xl text-slate-900 mt-0.5">
                            {(trafficStats.pages?.["/artikel"] || 0) + (trafficStats.pages?.["/skripsi"] || 0)}
                          </p>
                          <span className="text-[9px] text-slate-500">Pembaca</span>
                        </div>

                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                          <span className="text-[10px] font-bold text-slate-600 block uppercase">Portal PMB</span>
                          <p className="font-serif font-bold text-xl text-slate-900 mt-0.5">
                            {trafficStats.pages?.["/pmb"] || 0}
                          </p>
                          <span className="text-[9px] text-slate-500">Peminat</span>
                        </div>
                      </div>

                      {/* Tombol Aksi & Panduan */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setShowGaGuide(!showGaGuide)}
                            className="px-3.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-lg transition flex items-center gap-1.5 text-[11px]"
                          >
                            <span>📖</span>
                            <span>{showGaGuide ? "Tutup Panduan Pemula" : "Panduan Pemula: Cara Aktifkan Google Analytics dari Nol"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveMenu("settings")}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition text-[11px]"
                          >
                            ⚙️ Masukkan ID di Pengaturan
                          </button>
                        </div>

                        <a
                          href="https://analytics.google.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-emerald-800 hover:text-emerald-950 underline flex items-center gap-1 text-[11px]"
                        >
                          <span>Buka Konsol Google Analytics Riil &rarr;</span>
                        </a>
                      </div>

                      {/* Panduan Pemula Interaktif */}
                      {showGaGuide && (
                        <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl space-y-3 text-xs text-amber-950">
                          <h5 className="font-bold text-sm text-amber-900 flex items-center gap-1.5">
                            <span>🎯</span>
                            <span>Langkah Demi Langkah Mengaktifkan Google Analytics (Untuk Pemula):</span>
                          </h5>
                          <ol className="list-decimal list-inside space-y-2 text-[11px] leading-relaxed">
                            <li>
                              <strong>Buka Google Analytics:</strong> Kunjungi <a href="https://analytics.google.com" target="_blank" rel="noreferrer" className="underline font-bold text-emerald-800">analytics.google.com</a> dan masuk menggunakan akun Google Anda (gratis).
                            </li>
                            <li>
                              <strong>Masuk ke Menu Admin:</strong> Klik tombol ikon roda gigi <strong>⚙️ Admin</strong> di pojok kiri paling bawah layar.
                            </li>
                            <li>
                              <strong>Buat Properti Baru:</strong> Klik tombol <strong>+ Buat Properti</strong>. Isi nama properti dengan <em>Ma&apos;had Aly DDI Mangkoso</em>, pilih Negara: <em>Indonesia</em>, Zona Waktu: <em>GMT+8 (WITA)</em> atau <em>GMT+7 (WIB)</em>, dan Mata Uang: <em>IDR (Rupiah)</em>. Lalu klik Berikutnya.
                            </li>
                            <li>
                              <strong>Pilih Platform Web:</strong> Pada pilihan platform pengumpulan data, pilih <strong>Web</strong>.
                            </li>
                            <li>
                              <strong>Masukkan Alamat Website:</strong> Masukkan URL website Anda (contoh: <code>mahad-aly-ddi-mangkoso.munzirahmad779.workers.dev</code> atau nama domain Anda). Isi Nama Aliran: <em>Website Ma&apos;had Aly</em>, lalu klik <strong>Buat Aliran Data</strong>.
                            </li>
                            <li>
                              <strong>Salin ID Pengukuran:</strong> Anda akan melihat kode <strong>ID Pengukuran (Measurement ID)</strong> yang berawalan huruf <strong>G-</strong> (contoh: <code>G-ABC123XYZ</code>). Salin kode tersebut.
                            </li>
                            <li>
                              <strong>Tempel di Website Ini:</strong> Buka menu <strong>Pengaturan</strong> di Panel Admin ini, tempelkan kode tersebut pada kolom <em>ID Pengukuran Google Analytics</em>, lalu klik <strong>Simpan</strong>. Selesai 100%! Sistem langsung aktif merekam pengunjung.
                            </li>
                          </ol>
                        </div>
                      )}
                    </div>
                  );
                })()}
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

                {/* Pengaturan Gambar Tokoh / Kaligrafi (Bisa Ada / Tiadakan) */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-bold text-slate-800 text-xs flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(settingsForm.quote?.showImage)}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              quote: { ...(settingsForm.quote as any), showImage: e.target.checked }
                            })
                          }
                          className="rounded text-emerald-800 focus:ring-emerald-700 w-4 h-4"
                        />
                        <span>Tampilkan Gambar Tokoh / Kaligrafi di Web Depan</span>
                      </label>
                      <p className="text-[11px] text-slate-500 mt-0.5 ml-6">
                        Jika dicentang, foto tokoh / kaligrafi akan tampil bersanding dengan kata mutiara. Jika tidak dicentang, tampilan kata mutiara murni teks tipografi elegan.
                      </p>
                    </div>
                  </div>

                  {Boolean(settingsForm.quote?.showImage) && (
                    <div className="pt-2 border-t border-slate-200">
                      <ImageUploader
                        label="Unggah Foto Tokoh / Kaligrafi (Langsung dari Perangkat)"
                        folder="masyayikh"
                        value={settingsForm.quote?.imageUrl || ""}
                        onChange={(url) =>
                          setSettingsForm({
                            ...settingsForm,
                            quote: { ...(settingsForm.quote as any), imageUrl: url }
                          })
                        }
                        helperText="Pilih foto Anregurutta atau kaligrafi dari galeri (PNG, JPG, WebP). Foto akan tampil bersanding dengan kata mutiara di beranda."
                      />
                    </div>
                  )}
                </div>

                <button type="submit" className="px-6 py-2.5 bg-emerald-800 text-white font-bold rounded-xl shadow">
                  Simpan Kalam Hikmah
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            4.B TEKS HALAMAN PUBLIK (CMS TANPA NGODING)
           ══════════════════════════════════════════════════════════════ */}
        {activeMenu === "pagetexts" && (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="p-6 bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="inline-block px-3 py-1 bg-emerald-700/60 text-emerald-200 text-xs font-bold rounded-full mb-2">
                  ✨ CMS Dinamis Tanpa Ngoding
                </span>
                <h2 className="text-xl md:text-2xl font-serif font-bold text-white">
                  Kelola Teks &amp; Narasi Halaman Publik
                </h2>
                <p className="text-emerald-100/80 text-sm mt-1 max-w-2xl leading-relaxed">
                  Ubah judul, badge kategori, subjudul, dan deskripsi narasi pembuka di seluruh halaman publik tanpa perlu menyentuh kode. Perubahan otomatis tersimpan ke database &amp; tampil live.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetPageTexts}
                  className="px-4 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-xl transition border border-white/20"
                >
                  🔄 Reset Standar
                </button>
              </div>
            </div>

            {/* Notification Toast */}
            {pageTextsSaved && (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 flex items-center justify-between animate-fadeIn shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="text-xl">✅</span>
                  <div>
                    <p className="font-bold text-sm">Perubahan Teks Halaman Berhasil Disimpan!</p>
                    <p className="text-xs text-emerald-700">Tersinkronisasi ke Cloud Database dan langsung tampil di website publik tanpa perlu deploy ulang.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPageTextsSaved(false)}
                  className="text-emerald-700 hover:text-emerald-900 text-xs font-bold px-2 py-1"
                >
                  ✕ Tutup
                </button>
              </div>
            )}

            {/* Nav Tabs Per Halaman */}
            <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-1.5">
              {[
                { id: "artikel", label: "📝 Artikel Fiqh", path: "/artikel" },
                { id: "opini", label: "✍️ Opini Santri", path: "/opini" },
                { id: "profil", label: "🏛️ Profil & Masyayikh", path: "/profil" },
                { id: "akademik", label: "📖 Akademik", path: "/akademik" },
                { id: "skripsi", label: "🎓 Skripsi", path: "/skripsi" },
                { id: "berita", label: "📰 Berita & Warta", path: "/berita" },
                { id: "kirim", label: "📤 Kirim Tulisan", path: "/kirim-tulisan" },
                { id: "kontak", label: "📞 Kontak Sekretariat", path: "/kontak" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActivePageTextTab(tab.id as any)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    activePageTextTab === tab.id
                      ? "bg-emerald-800 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Form Editor & Live Preview Grid */}
            {(() => {
              const PAGE_TEXT_CONFIG: Record<
                "artikel" | "opini" | "profil" | "akademik" | "skripsi" | "berita" | "kirim" | "kontak",
                {
                  name: string;
                  path: string;
                  badgeKey: keyof PageTextsSettings;
                  titleKey: keyof PageTextsSettings;
                  descKey: keyof PageTextsSettings;
                }
              > = {
                artikel: {
                  name: "Artikel Fiqh",
                  path: "/artikel",
                  badgeKey: "artikelBadge",
                  titleKey: "artikelTitle",
                  descKey: "artikelDesc"
                },
                opini: {
                  name: "Opini Santri",
                  path: "/opini",
                  badgeKey: "opiniBadge",
                  titleKey: "opiniTitle",
                  descKey: "opiniDesc"
                },
                profil: {
                  name: "Profil Lembaga",
                  path: "/profil",
                  badgeKey: "profilBadge",
                  titleKey: "profilTitle",
                  descKey: "profilDesc"
                },
                akademik: {
                  name: "Akademik",
                  path: "/akademik",
                  badgeKey: "akademikBadge",
                  titleKey: "akademikTitle",
                  descKey: "akademikDesc"
                },
                skripsi: {
                  name: "Skripsi & Risalah",
                  path: "/skripsi",
                  badgeKey: "skripsiBadge",
                  titleKey: "skripsiTitle",
                  descKey: "skripsiDesc"
                },
                berita: {
                  name: "Berita & Warta",
                  path: "/berita",
                  badgeKey: "beritaBadge",
                  titleKey: "beritaTitle",
                  descKey: "beritaDesc"
                },
                kirim: {
                  name: "Kirim Tulisan",
                  path: "/kirim-tulisan",
                  badgeKey: "kirimBadge",
                  titleKey: "kirimTitle",
                  descKey: "kirimDesc"
                },
                kontak: {
                  name: "Kontak & Sekretariat",
                  path: "/kontak",
                  badgeKey: "kontakBadge",
                  titleKey: "kontakTitle",
                  descKey: "kontakDesc"
                }
              };

              const activeConf = PAGE_TEXT_CONFIG[activePageTextTab];
              const currentBadge = (localPageTexts[activeConf.badgeKey] as string) || "";
              const currentTitle = (localPageTexts[activeConf.titleKey] as string) || "";
              const currentDesc = (localPageTexts[activeConf.descKey] as string) || "";

              return (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Form Editor Kolom Kiri */}
                  <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <h3 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
                        <span>✏️</span>
                        <span>Formulir Teks: Halaman {activeConf.name}</span>
                      </h3>
                      <a
                        href={activeConf.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 hover:underline"
                      >
                        <span>Lihat Halaman Publik</span>
                        <span>↗</span>
                      </a>
                    </div>

                    <form onSubmit={handleSavePageTexts} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Badge / Label Kategori Atas (Kecil di Atas Judul)
                        </label>
                        <input
                          type="text"
                          value={currentBadge}
                          onChange={(e) =>
                            setLocalPageTexts((prev) => ({
                              ...prev,
                              [activeConf.badgeKey]: e.target.value
                            }))
                          }
                          placeholder="Contoh: Publikasi Ilmiah Takhassus"
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                        />
                        <p className="text-[11px] text-slate-500 mt-1">
                          Tampil sebagai badge kapsul hijau kecil di atas judul utama.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Judul Utama Halaman (Heading H1 Besar)
                        </label>
                        <input
                          type="text"
                          value={currentTitle}
                          onChange={(e) =>
                            setLocalPageTexts((prev) => ({
                              ...prev,
                              [activeConf.titleKey]: e.target.value
                            }))
                          }
                          placeholder="Contoh: Mimbar Kajian Fiqh Mu'asarah"
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                          required
                        />
                        <p className="text-[11px] text-slate-500 mt-1">
                          Judul paling mencolok di bagian banner atas halaman.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Deskripsi Narasi Lengkap (Paragraf Pengantar)
                        </label>
                        <textarea
                          rows={4}
                          value={currentDesc}
                          onChange={(e) =>
                            setLocalPageTexts((prev) => ({
                              ...prev,
                              [activeConf.descKey]: e.target.value
                            }))
                          }
                          placeholder="Tuliskan deskripsi atau narasi pengantar halaman ini..."
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm leading-relaxed focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                          required
                        />
                        <p className="text-[11px] text-slate-500 mt-1">
                          Paragraf pembuka yang menjelaskan isi dan tujuan halaman kepada pengunjung.
                        </p>
                      </div>

                      {/* Granular Section Fields per Halaman */}
                      {activePageTextTab === "profil" && (
                        <div className="pt-4 border-t border-slate-200 space-y-4 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                          <div className="flex items-center gap-2">
                            <span className="text-base">👳‍♂️</span>
                            <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                              Sub-Elemen: Tab &amp; Bagian Khusus Profil
                            </h4>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">
                                Judul Bagian Dewan Masyayikh
                              </label>
                              <input
                                type="text"
                                value={localPageTexts?.profilMasyaikhTitle || ""}
                                onChange={(e) =>
                                  setLocalPageTexts((prev) => ({
                                    ...prev,
                                    profilMasyaikhTitle: e.target.value
                                  }))
                                }
                                placeholder="Masyayikh & Dewan Dosen Pengampu"
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">
                                Subjudul Dewan Masyayikh
                              </label>
                              <input
                                type="text"
                                value={localPageTexts?.profilMasyaikhDesc || ""}
                                onChange={(e) =>
                                  setLocalPageTexts((prev) => ({
                                    ...prev,
                                    profilMasyaikhDesc: e.target.value
                                  }))
                                }
                                placeholder="Pendidik & Ulama Otoritatif Turats & Fiqh Mu'asarah"
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">
                                Judul Tab Sejarah Lembaga
                              </label>
                              <input
                                type="text"
                                value={localPageTexts?.profilSejarahTitle || ""}
                                onChange={(e) =>
                                  setLocalPageTexts((prev) => ({
                                    ...prev,
                                    profilSejarahTitle: e.target.value
                                  }))
                                }
                                placeholder="Sejarah Pendirian Ma'had Aly DDI Mangkoso"
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">
                                Judul Tab Visi Kelembagaan
                              </label>
                              <input
                                type="text"
                                value={localPageTexts?.profilVisiTitle || ""}
                                onChange={(e) =>
                                  setLocalPageTexts((prev) => ({
                                    ...prev,
                                    profilVisiTitle: e.target.value
                                  }))
                                }
                                placeholder="Visi Kelembagaan"
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">
                                Judul Tab Sarana &amp; Prasarana
                              </label>
                              <input
                                type="text"
                                value={localPageTexts?.profilSaranaTitle || ""}
                                onChange={(e) =>
                                  setLocalPageTexts((prev) => ({
                                    ...prev,
                                    profilSaranaTitle: e.target.value
                                  }))
                                }
                                placeholder="Sarana & Prasarana Pembelajaran"
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">
                                Judul Tab Status Akreditasi
                              </label>
                              <input
                                type="text"
                                value={localPageTexts?.profilAkreditasiTitle || ""}
                                onChange={(e) =>
                                  setLocalPageTexts((prev) => ({
                                    ...prev,
                                    profilAkreditasiTitle: e.target.value
                                  }))
                                }
                                placeholder="Status & Sertifikat Akreditasi"
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {activePageTextTab === "akademik" && (
                        <div className="pt-4 border-t border-slate-200 space-y-4 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                          <div className="flex items-center gap-2">
                            <span className="text-base">🎓</span>
                            <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                              Sub-Elemen: Seluruh Kartu &amp; Section Akademik
                            </h4>
                          </div>

                          <div className="space-y-4">
                            {/* Card 1: Takhassus */}
                            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                              <span className="text-[11px] font-bold text-emerald-800 uppercase block">1. Kartu Takhassus:</span>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  value={localPageTexts?.akademikTakhassusBadge || ""}
                                  onChange={(e) => setLocalPageTexts((prev) => ({ ...prev, akademikTakhassusBadge: e.target.value }))}
                                  placeholder="Badge: Takhassus Ma'had Aly"
                                  className="w-full px-3 py-1.5 border rounded-lg text-xs"
                                />
                                <input
                                  type="text"
                                  value={localPageTexts?.akademikTakhassusTitle || ""}
                                  onChange={(e) => setLocalPageTexts((prev) => ({ ...prev, akademikTakhassusTitle: e.target.value }))}
                                  placeholder="Judul: Fiqh wa Usuluhu"
                                  className="w-full px-3 py-1.5 border rounded-lg text-xs font-semibold"
                                />
                              </div>
                              <textarea
                                rows={2}
                                value={localPageTexts?.akademikTakhassusDesc || ""}
                                onChange={(e) => setLocalPageTexts((prev) => ({ ...prev, akademikTakhassusDesc: e.target.value }))}
                                placeholder="Deskripsi kartu Takhassus..."
                                className="w-full px-3 py-1.5 border rounded-lg text-xs"
                              />
                            </div>

                            {/* Card 2: Fokus Keilmuan */}
                            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                              <span className="text-[11px] font-bold text-emerald-800 uppercase block">2. Kartu Fokus Kajian:</span>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  value={localPageTexts?.akademikFokusBadge || ""}
                                  onChange={(e) => setLocalPageTexts((prev) => ({ ...prev, akademikFokusBadge: e.target.value }))}
                                  placeholder="Badge: Fokus Kajian Utama"
                                  className="w-full px-3 py-1.5 border rounded-lg text-xs"
                                />
                                <input
                                  type="text"
                                  value={localPageTexts?.akademikFokusTitle || ""}
                                  onChange={(e) => setLocalPageTexts((prev) => ({ ...prev, akademikFokusTitle: e.target.value }))}
                                  placeholder="Judul: Fiqh Mu'asarah"
                                  className="w-full px-3 py-1.5 border rounded-lg text-xs font-semibold"
                                />
                              </div>
                              <textarea
                                rows={2}
                                value={localPageTexts?.akademikFokusDesc || ""}
                                onChange={(e) => setLocalPageTexts((prev) => ({ ...prev, akademikFokusDesc: e.target.value }))}
                                placeholder="Deskripsi kartu Fokus Keilmuan..."
                                className="w-full px-3 py-1.5 border rounded-lg text-xs"
                              />
                            </div>

                            {/* Kurikulum & Kalender */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5">
                                <span className="text-[11px] font-bold text-slate-800 block">Judul Section Kurikulum:</span>
                                <input
                                  type="text"
                                  value={localPageTexts?.akademikKurikulumTitle || ""}
                                  onChange={(e) => setLocalPageTexts((prev) => ({ ...prev, akademikKurikulumTitle: e.target.value }))}
                                  placeholder="Struktur Kurikulum Pendidikan Mahad Aly"
                                  className="w-full px-3 py-1.5 border rounded-lg text-xs"
                                />
                              </div>
                              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5">
                                <span className="text-[11px] font-bold text-slate-800 block">Judul Section Kalender:</span>
                                <input
                                  type="text"
                                  value={localPageTexts?.akademikKalenderTitle || ""}
                                  onChange={(e) => setLocalPageTexts((prev) => ({ ...prev, akademikKalenderTitle: e.target.value }))}
                                  placeholder="Kalender Pendidikan & Siklus Perkuliahan"
                                  className="w-full px-3 py-1.5 border rounded-lg text-xs"
                                />
                              </div>
                            </div>

                            {/* Buku Pedoman & Penilaian */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5">
                                <span className="text-[11px] font-bold text-slate-800 block">Buku Pedoman Akademik:</span>
                                <input
                                  type="text"
                                  value={localPageTexts?.akademikPedomanTitle || ""}
                                  onChange={(e) => setLocalPageTexts((prev) => ({ ...prev, akademikPedomanTitle: e.target.value }))}
                                  placeholder="Buku Pedoman Akademik & Disiplin Santri"
                                  className="w-full px-3 py-1.5 border rounded-lg text-xs font-semibold"
                                />
                                <input
                                  type="text"
                                  value={localPageTexts?.akademikPedomanDesc || ""}
                                  onChange={(e) => setLocalPageTexts((prev) => ({ ...prev, akademikPedomanDesc: e.target.value }))}
                                  placeholder="Deskripsi buku pedoman..."
                                  className="w-full px-3 py-1.5 border rounded-lg text-xs"
                                />
                              </div>
                              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5">
                                <span className="text-[11px] font-bold text-slate-800 block">Sistem Evaluasi &amp; Penilaian:</span>
                                <input
                                  type="text"
                                  value={localPageTexts?.akademikPenilaianTitle || ""}
                                  onChange={(e) => setLocalPageTexts((prev) => ({ ...prev, akademikPenilaianTitle: e.target.value }))}
                                  placeholder="Sistem Evaluasi & Penilaian Komprehensif"
                                  className="w-full px-3 py-1.5 border rounded-lg text-xs font-semibold"
                                />
                                <input
                                  type="text"
                                  value={localPageTexts?.akademikPenilaianDesc || ""}
                                  onChange={(e) => setLocalPageTexts((prev) => ({ ...prev, akademikPenilaianDesc: e.target.value }))}
                                  placeholder="Deskripsi sistem penilaian..."
                                  className="w-full px-3 py-1.5 border rounded-lg text-xs"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {activePageTextTab === "skripsi" && (
                        <div className="pt-4 border-t border-slate-200 space-y-3 bg-blue-50/60 p-4 rounded-xl border border-blue-200">
                          <div className="flex items-center gap-2">
                            <span className="text-base">🎓</span>
                            <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wider">
                              Sub-Elemen: Banner Callout Setor Skripsi Alumni
                            </h4>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Judul Banner Setor Skripsi
                            </label>
                            <input
                              type="text"
                              value={localPageTexts?.skripsiSubmitTitle || ""}
                              onChange={(e) =>
                                setLocalPageTexts((prev) => ({
                                  ...prev,
                                  skripsiSubmitTitle: e.target.value
                                }))
                              }
                              placeholder="Setor Skripsi Alumni & Mahasantri"
                              className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Deskripsi Banner Setor Skripsi
                            </label>
                            <textarea
                              rows={2}
                              value={localPageTexts?.skripsiSubmitDesc || ""}
                              onChange={(e) =>
                                setLocalPageTexts((prev) => ({
                                  ...prev,
                                  skripsiSubmitDesc: e.target.value
                                }))
                              }
                              placeholder="Khusus alumni dan mahasantri tingkat akhir Ma'had Aly DDI Mangkoso..."
                              className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs leading-relaxed focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                          </div>
                        </div>
                      )}

                      {activePageTextTab === "artikel" && (
                        <div className="pt-4 border-t border-slate-200 space-y-3 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                          <div className="flex items-center gap-2">
                            <span className="text-base">📑</span>
                            <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                              Sub-Elemen: Label Tab Switcher Artikel
                            </h4>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">
                                Label Tab Fiqh Mu&apos;asarah
                              </label>
                              <input
                                type="text"
                                value={localPageTexts?.artikelFiqhTabLabel || ""}
                                onChange={(e) =>
                                  setLocalPageTexts((prev) => ({
                                    ...prev,
                                    artikelFiqhTabLabel: e.target.value
                                  }))
                                }
                                placeholder="Kajian Fiqh Mu'asarah"
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">
                                Label Tab Opini Santri
                              </label>
                              <input
                                type="text"
                                value={localPageTexts?.artikelOpiniTabLabel || ""}
                                onChange={(e) =>
                                  setLocalPageTexts((prev) => ({
                                    ...prev,
                                    artikelOpiniTabLabel: e.target.value
                                  }))
                                }
                                placeholder="Opini & Refleksi Santri"
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {activePageTextTab === "kirim" && (
                        <div className="pt-4 border-t border-slate-200 space-y-3 bg-amber-50/50 p-4 rounded-xl border border-amber-200">
                          <div className="flex items-center gap-2">
                            <span className="text-base">📝</span>
                            <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                              Sub-Elemen: Kotak Panduan Redaksi
                            </h4>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Judul Panduan Penulisan
                            </label>
                            <input
                              type="text"
                              value={localPageTexts?.kirimPanduanTitle || ""}
                              onChange={(e) =>
                                setLocalPageTexts((prev) => ({
                                  ...prev,
                                  kirimPanduanTitle: e.target.value
                                }))
                              }
                              placeholder="Ketentuan & Alur Publikasi Naskah"
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Deskripsi Panduan Penulisan
                            </label>
                            <input
                              type="text"
                              value={localPageTexts?.kirimPanduanDesc || ""}
                              onChange={(e) =>
                                setLocalPageTexts((prev) => ({
                                  ...prev,
                                  kirimPanduanDesc: e.target.value
                                }))
                              }
                              placeholder="Panduan resmi dewan redaksi LP2M Ma'had Aly DDI Mangkoso bagi penulis."
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                            />
                          </div>
                        </div>
                      )}

                      {activePageTextTab === "kontak" && (
                        <div className="pt-4 border-t border-slate-200 space-y-3 bg-slate-100/70 p-4 rounded-xl border border-slate-200">
                          <div className="flex items-center gap-2">
                            <span className="text-base">🏢</span>
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                              Sub-Elemen: Kotak Sekretariat
                            </h4>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Judul Kotak Sekretariat
                            </label>
                            <input
                              type="text"
                              value={localPageTexts?.kontakSekretariatTitle || ""}
                              onChange={(e) =>
                                setLocalPageTexts((prev) => ({
                                  ...prev,
                                  kontakSekretariatTitle: e.target.value
                                }))
                              }
                              placeholder="Sekretariat & Kampus"
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Deskripsi Kotak Sekretariat
                            </label>
                            <input
                              type="text"
                              value={localPageTexts?.kontakSekretariatDesc || ""}
                              onChange={(e) =>
                                setLocalPageTexts((prev) => ({
                                  ...prev,
                                  kontakSekretariatDesc: e.target.value
                                }))
                              }
                              placeholder="Pusat layanan administrasi, kantor akademik, dan kampus..."
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                          </div>
                        </div>
                      )}

                      {/* ══════════════════════════════════════════════════════════════
                          ELEMEN & KARTU KUSTOM TAMBAHAN (BEBAS DITAMBAH DI SEMUA HALAMAN)
                         ══════════════════════════════════════════════════════════════ */}
                      <div className="pt-4 border-t border-slate-200 space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-base">🧩</span>
                            <div>
                              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                Sub-Elemen &amp; Kartu Tambahan (Halaman {activeConf.name})
                              </h4>
                              <p className="text-[11px] text-slate-500">
                                Tambahkan elemen, program, atau kartu kustom baru di halaman ini tanpa ngoding.
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowAddElementModal(!showAddElementModal)}
                            className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm"
                          >
                            <span>{showAddElementModal ? "✕ Batal" : "➕ Tambah Elemen Baru"}</span>
                          </button>
                        </div>

                        {/* Formulir Tambah Elemen Baru */}
                        {showAddElementModal && (
                          <div className="p-4 bg-white rounded-xl border-2 border-emerald-500/40 space-y-3 animate-fadeIn">
                            <strong className="block text-xs font-bold text-emerald-900 uppercase">
                              Formulir Elemen Baru:
                            </strong>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <div className="sm:col-span-1">
                                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Ikon / Emoji</label>
                                <input
                                  type="text"
                                  value={newElementForm.icon}
                                  onChange={(e) => setNewElementForm({ ...newElementForm, icon: e.target.value })}
                                  placeholder="Contoh: 🌟, 📚, 🏛️"
                                  className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                                />
                              </div>
                              <div className="sm:col-span-1">
                                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Badge / Label</label>
                                <input
                                  type="text"
                                  value={newElementForm.badge}
                                  onChange={(e) => setNewElementForm({ ...newElementForm, badge: e.target.value })}
                                  placeholder="Contoh: Unggulan, Baru"
                                  className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                                />
                              </div>
                              <div className="sm:col-span-1">
                                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Link / URL Tombol</label>
                                <input
                                  type="text"
                                  value={newElementForm.link}
                                  onChange={(e) => setNewElementForm({ ...newElementForm, link: e.target.value })}
                                  placeholder="Contoh: /akademik#kurikulum"
                                  className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Judul Elemen *</label>
                              <input
                                type="text"
                                value={newElementForm.title}
                                onChange={(e) => setNewElementForm({ ...newElementForm, title: e.target.value })}
                                placeholder="Contoh: Program Penguatan Bahtsul Masail"
                                className="w-full px-3 py-1.5 border rounded-lg text-xs font-bold"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Deskripsi / Penjelasan *</label>
                              <textarea
                                rows={2}
                                value={newElementForm.desc}
                                onChange={(e) => setNewElementForm({ ...newElementForm, desc: e.target.value })}
                                placeholder="Tuliskan narasi atau isi detail dari elemen ini..."
                                className="w-full px-3 py-1.5 border rounded-lg text-xs"
                              />
                            </div>

                            <div className="flex justify-end gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setShowAddElementModal(false)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-lg font-medium"
                              >
                                Batal
                              </button>
                              <button
                                type="button"
                                onClick={handleAddCustomElement}
                                className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg shadow-sm"
                              >
                                ✓ Simpan Elemen Ini
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Daftar Elemen yang Sudah Ditambahkan di Halaman Ini */}
                        {(() => {
                          const pageEls = (localPageTexts.customElements || []).filter(
                            (el) => el.page === activePageTextTab
                          );
                          if (pageEls.length === 0) {
                            return (
                              <p className="text-[11px] text-slate-400 italic">
                                Belum ada elemen/kartu tambahan di halaman {activeConf.name}. Klik tombol hijau di atas untuk menambahkan.
                              </p>
                            );
                          }

                          return (
                            <div className="space-y-2">
                              {pageEls.map((el) => (
                                <div
                                  key={el.id}
                                  className="p-3 bg-white rounded-xl border border-slate-200 flex items-start justify-between gap-3 shadow-xs"
                                >
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1.5">
                                      {el.icon && <span className="text-base">{el.icon}</span>}
                                      <strong className="text-xs font-serif font-bold text-slate-900">{el.title}</strong>
                                      {el.badge && (
                                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                                          {el.badge}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-line">{el.desc}</p>
                                    {el.link && (
                                      <span className="text-[10px] text-emerald-700 font-mono block">Link: {el.link}</span>
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteCustomElement(el.id)}
                                    className="text-slate-400 hover:text-red-600 p-1 text-xs shrink-0"
                                    title="Hapus Elemen"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>

                      <div className="pt-3 flex items-center justify-between">
                        <p className="text-xs text-slate-400">
                          * Perubahan langsung berlaku seketika setelah disimpan
                        </p>
                        <button
                          type="submit"
                          className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md transition flex items-center gap-2"
                        >
                          <span>💾</span>
                          <span>Simpan Teks Halaman</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Live Preview Card Kolom Kanan */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span className="text-xs font-bold tracking-wide text-slate-200">
                          LIVE PREVIEW REAL-TIME
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {activeConf.path}
                      </span>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-950 text-white p-7 rounded-2xl shadow-lg border border-emerald-900/40 space-y-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/10 rounded-full blur-2xl pointer-events-none"></div>

                      {currentBadge && (
                        <span className="inline-block px-3 py-1 bg-emerald-800/80 text-emerald-300 text-xs font-bold rounded-full border border-emerald-700/50">
                          {currentBadge}
                        </span>
                      )}

                      <h3 className="text-2xl font-serif font-bold text-white tracking-tight">
                        {currentTitle || "Judul Halaman"}
                      </h3>

                      <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-white/10">
                        {currentDesc || "Deskripsi narasi halaman akan tampil di sini..."}
                      </p>

                      {activePageTextTab === "profil" && (
                        <div className="mt-4 pt-4 border-t border-emerald-800/60 bg-emerald-900/30 p-3 rounded-xl space-y-1">
                          <p className="text-[11px] font-bold text-amber-300 uppercase">
                            Preview Header Masyayikh:
                          </p>
                          <p className="font-serif font-bold text-sm text-white">
                            {localPageTexts?.profilMasyaikhTitle || "Masyayikh & Dewan Dosen Pengampu"}
                          </p>
                          <p className="text-xs text-slate-300">
                            {localPageTexts?.profilMasyaikhDesc || "Pendidik & Ulama Otoritatif Turats & Fiqh Mu'asarah"}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2 text-xs text-amber-900">
                      <div className="font-bold flex items-center gap-1.5 text-amber-950">
                        <span>💡</span>
                        <span>Petunjuk Redaksi:</span>
                      </div>
                      <p className="leading-relaxed text-amber-800">
                        Anda bebas mengubah narasi kata-kata sesuai arahan pimpinan atau kebutuhan redaksi tanpa khawatir merusak layout tampilan website. Seluruh format font, warna, dan responsivitas telah diatur rapi secara otomatis.
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}
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
                { id: "theses", label: `🎓 Skripsi (${theses.length})` },
                { id: "write", label: `➕ Tulis Artikel Baru` },
                { id: "submissions", label: `📥 Naskah Masuk (${pendingSubmissionsCount})` },
                { id: "stats", label: `📊 Statistik Publikasi` }
              ].map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => {
                    if (sub.id === "submissions") {
                      setActiveMenu("submissions");
                    } else {
                      setActiveSubMenu(sub.id);
                      if (sub.id === "write") {
                        setIsEditingArticle(false);
                        setEditingArticleId(null);
                      }
                    }
                  }}
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

            {/* Sub: Artikel & Tulis */}
            {(activeSubMenu === "overview" || activeSubMenu === "articles" || activeSubMenu === "write") && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className={`${activeSubMenu === "write" ? "lg:col-span-12 max-w-4xl mx-auto" : "lg:col-span-5"} bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs`}>
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
                        <label className="block font-bold text-slate-700 mb-1">Kategori &amp; Jalur *</label>
                        <select
                          value={articleForm.category}
                          onChange={(e) => {
                            const sel = categories.find((c) => c.slug === e.target.value);
                            const isOp = sel?.type === "opini" || sel?.slug?.startsWith("opini-") || sel?.slug?.startsWith("refleksi-") || sel?.slug?.startsWith("kolom-") || sel?.slug?.startsWith("sosial-");
                            setArticleForm({
                              ...articleForm,
                              category: e.target.value,
                              categoryLabel: sel?.name || e.target.value,
                              type: isOp ? "opini" : "artikel",
                              isSpecial: e.target.value === "karya-anregurutta"
                            });
                          }}
                          className="w-full p-2 text-xs bg-slate-50 border rounded-lg font-medium"
                        >
                          <optgroup label="📚 Kajian Fiqh (Artikel Ilmiah)">
                            {categories.filter((c) => c.type !== "opini").map((c) => (
                              <option key={c.id} value={c.slug}>{c.name}</option>
                            ))}
                          </optgroup>
                          <optgroup label="✍️ Opini &amp; Refleksi Santri">
                            {categories.filter((c) => c.type === "opini").map((c) => (
                              <option key={c.id} value={c.slug}>{c.name}</option>
                            ))}
                          </optgroup>
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

                    {/* Upload Sampul R2 */}
                    <div>
                      <ImageUploader
                        value={articleForm.featuredImage}
                        onChange={(url) => setArticleForm({ ...articleForm, featuredImage: url })}
                        folder="artikel"
                        label="Gambar Sampul Artikel (Cloudflare R2)"
                        helperText="Opsional. Format JPG, PNG, atau WebP"
                      />
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

                    {/* Arabic Text Block with Amiri Font */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Kutipan Dalil / Teks Bahasa Arab (Font Amiri RTL)
                      </label>
                      <textarea
                        rows={3}
                        dir="rtl"
                        value={articleForm.arabicSnippet}
                        onChange={(e) => setArticleForm({ ...articleForm, arabicSnippet: e.target.value })}
                        className="w-full p-3 text-base bg-amber-50/40 border border-amber-200 rounded-lg font-serif text-right leading-loose font-arabic text-slate-900"
                        placeholder="قال رحمه الله تعالى: ..."
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

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Sumber Artikel</label>
                        <select
                          value={articleForm.source || "admin"}
                          onChange={(e) => setArticleForm({ ...articleForm, source: e.target.value as any })}
                          className="w-full p-2 text-xs bg-slate-50 border rounded-lg font-medium"
                        >
                          <option value="admin">🟢 Admin / Redaksi</option>
                          <option value="submission">🔵 Kiriman Penulis</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Status Publikasi</label>
                        <select
                          value={articleForm.status || "published"}
                          onChange={(e) => setArticleForm({ ...articleForm, status: e.target.value as any })}
                          className="w-full p-2 text-xs bg-slate-50 border rounded-lg font-medium"
                        >
                          <option value="published">Diterbitkan Live</option>
                          <option value="draft">Simpan Draf</option>
                        </select>
                      </div>
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

                {activeSubMenu !== "write" && (
                  <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b">
                      <h3 className="font-serif font-bold text-lg text-emerald-950">
                        Daftar Artikel ({articles.length})
                      </h3>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {[
                          { id: "all", label: `Semua (${articles.length})` },
                          { id: "artikel", label: `📚 Fiqh (${articles.filter((a) => a.type !== "opini").length})` },
                          { id: "opini", label: `✍️ Opini (${articles.filter((a) => a.type === "opini").length})` },
                          { id: "admin", label: `🟢 Admin (${articles.filter((a) => a.source !== "submission").length})` },
                          { id: "submission", label: `🔵 Kiriman (${articles.filter((a) => a.source === "submission").length})` }
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setArticleFilter(tab.id as any)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                              articleFilter === tab.id
                                ? "bg-emerald-800 text-white shadow-sm"
                                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2.5 max-h-175 overflow-y-auto">
                      {articles
                        .filter((art) => {
                          if (articleFilter === "all") return true;
                          if (articleFilter === "opini") return art.type === "opini";
                          if (articleFilter === "artikel") return art.type !== "opini";
                          if (articleFilter === "admin") return art.source !== "submission";
                          if (articleFilter === "submission") return art.source === "submission";
                          return true;
                        })
                        .map((art) => (
                        <div key={art.id} className="p-3 bg-slate-50 rounded-xl border flex items-start justify-between gap-3 text-xs">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-emerald-800 uppercase text-[10px]">{art.categoryLabel}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                art.type === "opini" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                              }`}>
                                {art.type === "opini" ? "✍️ Opini" : "📚 Fiqh"}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                art.source === "submission"
                                  ? "bg-blue-100 text-blue-900 border-blue-200"
                                  : "bg-emerald-50 text-emerald-800 border-emerald-200"
                              }`}>
                                {art.source === "submission" ? "🔵 Kiriman" : "🟢 Admin"}
                              </span>
                            </div>
                            <h4 className="font-bold text-slate-900 mt-1">{art.title}</h4>
                            <p className="text-slate-500 text-[11px]">Penulis: {art.author}</p>
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
                                type: art.type || "artikel",
                                source: (art.source as any) || "admin",
                                status: (art.status as any) || "published",
                                featuredImage: art.featuredImage || "",
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
              )}
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
                      <label className="block font-bold text-slate-700 mb-1">Jenis Kategori / Kanal *</label>
                      <select
                        value={catForm.type}
                        onChange={(e) => setCatForm({ ...catForm, type: e.target.value as "artikel" | "opini" })}
                        className="w-full p-2 text-xs bg-slate-50 border rounded-lg font-medium"
                      >
                        <option value="artikel">📚 Kajian Fiqh (Artikel Ilmiah)</option>
                        <option value="opini">✍️ Opini &amp; Refleksi Santri</option>
                      </select>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Kategori ini akan otomatis disalurkan ke kanal yang sesuai di website publik dan form submit naskah.
                      </p>
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
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b">
                    <h3 className="font-serif font-bold text-lg text-emerald-950">
                      Daftar Kategori ({categories.length})
                    </h3>
                    <div className="flex items-center gap-1.5">
                      {[
                        { id: "all", label: `Semua (${categories.length})` },
                        { id: "artikel", label: `Fiqh (${categories.filter((c) => c.type !== "opini").length})` },
                        { id: "opini", label: `Opini (${categories.filter((c) => c.type === "opini").length})` }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setCatFilter(tab.id as any)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                            catFilter === tab.id
                              ? "bg-emerald-800 text-white shadow-sm"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2.5 max-h-175 overflow-y-auto">
                    {categories
                      .filter((c) => catFilter === "all" || (catFilter === "opini" ? c.type === "opini" : c.type !== "opini"))
                      .map((c) => (
                      <div key={c.id} className="p-3 bg-slate-50 rounded-xl border flex items-center justify-between text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900">{c.name}</h4>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              c.type === "opini" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                            }`}>
                              {c.type === "opini" ? "✍️ Opini" : "📚 Fiqh"}
                            </span>
                          </div>
                          <p className="text-slate-500 text-[11px] line-clamp-1 mt-0.5">{c.description}</p>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditingCat(true);
                              setEditingCatId(c.id);
                              setCatForm({
                                name: c.name,
                                description: c.description,
                                iconName: c.iconName,
                                type: c.type || (c.slug?.startsWith("opini-") ? "opini" : "artikel")
                              });
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
                    <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
                      <ImageUploader
                        label="Unggah File Naskah Skripsi PDF (Langsung dari Perangkat)"
                        folder="skripsi"
                        accept="application/pdf,.pdf"
                        maxSizeMB={25}
                        value={thesisForm.downloadUrl || ""}
                        onChange={(url) => setThesisForm((prev) => ({ ...prev, downloadUrl: url }))}
                        onUploadComplete={(media) => {
                          setThesisForm((prev) => ({
                            ...prev,
                            downloadUrl: media.url,
                            fileSize: media.size,
                          }));
                        }}
                        helperText="Unggah naskah PDF langsung dari perangkat, atau masukkan link Google Drive di bawah."
                      />
                      <div className="space-y-1 pt-1 border-t border-emerald-200/60">
                        <div className="flex items-center justify-between">
                          <label className="block font-bold text-slate-700 text-[11px]">Tautan Berkas PDF (Otomatis Terisi / Bisa Link Google Drive) *</label>
                          {thesisForm.downloadUrl && (
                            <button
                              type="button"
                              onClick={() => window.open(thesisForm.downloadUrl, "_blank", "noopener,noreferrer")}
                              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline flex items-center gap-1"
                            >
                              <span>🔗 Test Buka File</span>
                            </button>
                          )}
                        </div>
                        <input
                          type="url"
                          required
                          value={thesisForm.downloadUrl}
                          onChange={(e) => setThesisForm({ ...thesisForm, downloadUrl: e.target.value })}
                          className="w-full p-2 text-xs bg-white border rounded-lg font-mono"
                          placeholder="https://... atau link Google Drive"
                        />
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
            {/* Sub: Statistik Publikasi */}
            {activeSubMenu === "stats" && (
              <div className="space-y-6 text-xs">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
                    <span className="text-xs text-slate-400 font-bold uppercase">Artikel Fiqh Ilmiah</span>
                    <p className="font-serif font-bold text-3xl text-emerald-900">{articles.filter((a) => a.type !== "opini").length}</p>
                    <p className="text-[11px] text-emerald-700 font-medium">Mimbar Kajian Fiqh Kontemporer</p>
                  </div>
                  <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
                    <span className="text-xs text-slate-400 font-bold uppercase">Opini &amp; Refleksi</span>
                    <p className="font-serif font-bold text-3xl text-amber-700">{articles.filter((a) => a.type === "opini").length}</p>
                    <p className="text-[11px] text-amber-600 font-medium">Gagasan &amp; Renungan Santri</p>
                  </div>
                  <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
                    <span className="text-xs text-slate-400 font-bold uppercase">Kiriman Penulis Luar</span>
                    <p className="font-serif font-bold text-3xl text-blue-700">{articles.filter((a) => a.source === "submission").length}</p>
                    <p className="text-[11px] text-blue-600 font-medium">Terbit via Alur Submission</p>
                  </div>
                  <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
                    <span className="text-xs text-slate-400 font-bold uppercase">Total Repositori Skripsi</span>
                    <p className="font-serif font-bold text-3xl text-emerald-950">{theses.length}</p>
                    <p className="text-[11px] text-slate-500 font-medium">Karya Tulis Ilmiah Mahasantri</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <h4 className="font-serif font-bold text-base text-slate-900">Distribusi Kategori Kajian</h4>
                    <div className="space-y-2">
                      {categories.map((cat) => {
                        const count = articles.filter((a) => a.category === cat.slug || a.categoryLabel === cat.name).length;
                        return (
                          <div key={cat.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border">
                            <span className="font-semibold text-slate-800">{cat.name}</span>
                            <span className="font-bold bg-white px-2.5 py-0.5 rounded-lg border text-emerald-800">{count} Artikel</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <h4 className="font-serif font-bold text-base text-slate-900">Perbandingan Sumber Publikasi</h4>
                    <div className="space-y-3 pt-2">
                      <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                        <div>
                          <strong className="text-emerald-950 block">🟢 Diterbitkan oleh Admin / Redaksi</strong>
                          <span className="text-emerald-700 text-[11px]">Artikel resmi asatidz &amp; redaksi Ma&apos;had Aly</span>
                        </div>
                        <span className="font-serif font-bold text-2xl text-emerald-900">
                          {articles.filter((a) => a.source !== "submission").length}
                        </span>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 flex items-center justify-between">
                        <div>
                          <strong className="text-blue-950 block">🔵 Diterbitkan dari Kiriman Penulis</strong>
                          <span className="text-blue-700 text-[11px]">Hasil seleksi &amp; review naskah mahasantri / akademisi</span>
                        </div>
                        <span className="font-serif font-bold text-2xl text-blue-900">
                          {articles.filter((a) => a.source === "submission").length}
                        </span>
                      </div>
                    </div>
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
                      arabicReferences: "",
                      imageUrl: "",
                      attachmentUrl: "",
                      attachmentName: ""
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

                  {/* Foto Dokumentasi / Kitab Rujukan (Opsional) */}
                  <div>
                    <ImageUploader
                      label="Unggah Foto Dokumentasi / Kitab (Langsung dari Perangkat)"
                      folder="artikel"
                      value={bahtsulForm.imageUrl || ""}
                      onChange={(url) => setBahtsulForm((prev) => ({ ...prev, imageUrl: url }))}
                      helperText="Pilih foto sidang halaqah atau foto naskah kitab (PNG, JPG, WebP). Bisa dikosongkan."
                    />
                  </div>

                  {/* Berkas Risalah Putusan (PDF) */}
                  <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
                    <ImageUploader
                      label="Unggah Berkas Risalah Putusan Fatwa (PDF)"
                      folder="artikel"
                      accept="application/pdf,.pdf"
                      maxSizeMB={20}
                      value={bahtsulForm.attachmentUrl || ""}
                      onChange={(url) => setBahtsulForm((prev) => ({ ...prev, attachmentUrl: url }))}
                      onUploadComplete={(media) => {
                        setBahtsulForm((prev) => ({
                          ...prev,
                          attachmentUrl: media.url,
                          attachmentName: prev.attachmentName || media.name,
                        }));
                      }}
                      helperText="Unggah naskah PDF risalah putusan sidang bahtsul masail untuk diunduh pembaca (Bisa dikosongkan)."
                    />
                    {bahtsulForm.attachmentUrl && (
                      <div className="pt-1 border-t border-emerald-200/60">
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Nama Tampilan File PDF</label>
                        <input
                          type="text"
                          placeholder="Nama File: Risalah_Putusan_Fatwa.pdf"
                          value={bahtsulForm.attachmentName || ""}
                          onChange={(e) => setBahtsulForm({ ...bahtsulForm, attachmentName: e.target.value })}
                          className="w-full p-1.5 text-xs bg-white border rounded-lg"
                        />
                      </div>
                    )}
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
                      procedure: pmbWaveForm.procedure.split("\n").filter(Boolean),
                      imageUrl: pmbWaveForm.imageUrl,
                      registrationLink: pmbWaveForm.registrationLink,
                      brochureUrl: pmbWaveForm.brochureUrl
                    });
                    alert("Gelombang PMB berhasil ditambahkan!");
                    setPmbWaveForm({
                      name: "",
                      startDate: "01 Jan 2027",
                      endDate: "28 Feb 2027",
                      quota: "15 Mahasantri",
                      scholarshipInfo: "Beasiswa Penuh 100%",
                      requirements: "Lulusan MA/Pesantren\nHafalan 5 Juz\nMampu baca kitab kuning",
                      procedure: "Daftar Online\nUnggah Berkas\nTes Seleksi Kitab",
                      imageUrl: "",
                      registrationLink: "",
                      brochureUrl: ""
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

                  {/* Foto Brosur / Poster Alur Seleksi (Opsional) */}
                  {/* Foto Brosur / Poster Alur Seleksi (Opsional) */}
                  <div>
                    <ImageUploader
                      label="Unggah Poster / Brosur Visual PMB (Langsung dari Perangkat)"
                      folder="umum"
                      value={pmbWaveForm.imageUrl || ""}
                      onChange={(url) => setPmbWaveForm((prev) => ({ ...prev, imageUrl: url }))}
                      helperText="Pilih desain poster atau banner alur seleksi PMB (PNG, JPG, WebP). Bisa dikosongkan."
                    />
                  </div>

                  {/* Berkas Brosur PDF Lengkap */}
                  <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
                    <ImageUploader
                      label="Unggah Berkas Brosur PMB Resmi (PDF)"
                      folder="umum"
                      accept="application/pdf,.pdf"
                      maxSizeMB={20}
                      value={pmbWaveForm.brochureUrl || ""}
                      onChange={(url) => setPmbWaveForm((prev) => ({ ...prev, brochureUrl: url }))}
                      helperText="Unggah file PDF brosur lengkap penerimaan santri baru untuk diunduh calon pendaftar (Bisa dikosongkan)."
                    />
                  </div>

                  {/* Tautan Pendaftaran Online */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <label className="block font-bold text-slate-700 text-[11px]">
                      🔗 Tautan Formulir Pendaftaran Online (Google Form / Portal)
                    </label>
                    <input
                      type="text"
                      placeholder="https://bit.ly/pmb-mahadaly atau link formulir eksternal"
                      value={pmbWaveForm.registrationLink || ""}
                      onChange={(e) => setPmbWaveForm({ ...pmbWaveForm, registrationLink: e.target.value })}
                      className="w-full p-2 text-xs bg-white border rounded-lg"
                    />
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
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tahapan / Prosedur (Per Baris)</label>
                    <textarea
                      rows={3}
                      value={pmbWaveForm.procedure}
                      onChange={(e) => setPmbWaveForm({ ...pmbWaveForm, procedure: e.target.value })}
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
                        date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
                        imageUrl: "",
                        attachmentUrl: "",
                        attachmentName: "",
                        attachmentSize: ""
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

                    {/* Foto Sampul / Dokumentasi Berita (Opsional) */}
                    <div>
                      <ImageUploader
                        label="Unggah Foto Sampul Berita (Langsung dari Perangkat)"
                        folder="berita"
                        value={newsForm.imageUrl || ""}
                        onChange={(url) => setNewsForm((prev) => ({ ...prev, imageUrl: url }))}
                        helperText="Pilih gambar sampul atau foto dokumentasi kegiatan (PNG, JPG, WebP). Bisa dikosongkan."
                      />
                    </div>

                    {/* Berkas Lampiran Resmi (PDF/DOCX) untuk Diunduh */}
                    <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
                      <ImageUploader
                        label="Unggah Berkas Lampiran / File Unduhan (PDF / Word)"
                        folder="berita"
                        accept="application/pdf,.pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.doc,.docx"
                        maxSizeMB={20}
                        value={newsForm.attachmentUrl || ""}
                        onChange={(url) => setNewsForm((prev) => ({ ...prev, attachmentUrl: url }))}
                        onUploadComplete={(media) => {
                          setNewsForm((prev) => ({
                            ...prev,
                            attachmentUrl: media.url,
                            attachmentName: prev.attachmentName || media.name,
                            attachmentSize: media.size,
                          }));
                        }}
                        helperText="Unggah dokumen resmi (PDF atau Word) langsung dari komputer/HP untuk diunduh pembaca (Bisa dikosongkan)."
                      />
                      {newsForm.attachmentUrl && (
                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-emerald-200/60">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Nama Tampilan File</label>
                            <input
                              type="text"
                              placeholder="Nama File: Surat_Edaran_PMB.pdf"
                              value={newsForm.attachmentName || ""}
                              onChange={(e) => setNewsForm({ ...newsForm, attachmentName: e.target.value })}
                              className="w-full p-1.5 text-xs bg-white border rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Ukuran File</label>
                            <input
                              type="text"
                              placeholder="Ukuran: misal 2.4 MB"
                              value={newsForm.attachmentSize || ""}
                              onChange={(e) => setNewsForm({ ...newsForm, attachmentSize: e.target.value })}
                              className="w-full p-1.5 text-xs bg-white border rounded-lg"
                            />
                          </div>
                        </div>
                      )}
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
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-emerald-800 text-[10px]">{item.category} &bull; {item.date}</span>
                            {item.imageUrl && (
                              <span className="text-[10px] bg-sky-100 text-sky-800 px-1.5 py-0.2 rounded font-bold">Foto</span>
                            )}
                            {item.attachmentUrl && (
                              <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">Lampiran</span>
                            )}
                          </div>
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
                                date: item.date,
                                imageUrl: item.imageUrl || "",
                                attachmentUrl: item.attachmentUrl || "",
                                attachmentName: item.attachmentName || "",
                                attachmentSize: item.attachmentSize || ""
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
          <div className="space-y-6 text-xs">
            {/* Revision Modal */}
            {revisionModalSub && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between pb-3 border-b">
                    <div>
                      <h4 className="font-serif font-bold text-base text-slate-900">Permintaan Revisi Naskah</h4>
                      <p className="text-slate-500 text-xs">Kode: {revisionModalSub.trackingCode || revisionModalSub.id}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRevisionModalSub(null)}
                      className="text-slate-400 hover:text-slate-600 font-bold text-lg"
                    >
                      ✕
                    </button>
                  </div>
                  <div>
                    <p className="text-slate-700 font-medium mb-1">
                      Kirim catatan perbaikan ke penulis (<strong>{revisionModalSub.nama}</strong> &lt;{revisionModalSub.email}&gt;):
                    </p>
                    <textarea
                      rows={5}
                      value={revisionNote}
                      onChange={(e) => setRevisionNote(e.target.value)}
                      placeholder="Tuliskan poin-poin yang perlu diperbaiki (misal: lengkapi referensi kitab turats pada bab 2, perbaiki format sitasi, dll)..."
                      className="w-full p-3 bg-slate-50 border rounded-xl text-xs leading-relaxed focus:ring-2 focus:ring-purple-600 outline-none"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setRevisionModalSub(null)}
                      className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!revisionNote.trim()) {
                          alert("Mohon isi catatan revisi untuk penulis.");
                          return;
                        }
                        const res = await updateSubmissionStatus(revisionModalSub.id, "revision", revisionNote);
                        if (res?.emailResult?.success) {
                          alert(`✓ Catatan revisi berhasil disimpan & dikirim ke ${revisionModalSub.email}!`);
                        } else {
                          const errInfo = res?.emailResult?.error || "Resend API key belum aktif";
                          alert(`✓ Status revisi tersimpan di database.\n⚠️ Email notifikasi ke penulis belum terkirim: ${errInfo}`);
                        }
                        setRevisionModalSub(null);
                        setRevisionNote("");
                      }}
                      className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold shadow"
                    >
                      Kirim Permintaan Revisi
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Rejection Modal */}
            {rejectModalSub && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between pb-3 border-b">
                    <div>
                      <h4 className="font-serif font-bold text-base text-red-700">Tolak Naskah</h4>
                      <p className="text-slate-500 text-xs">Kode: {rejectModalSub.trackingCode || rejectModalSub.id}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRejectModalSub(null)}
                      className="text-slate-400 hover:text-slate-600 font-bold text-lg"
                    >
                      ✕
                    </button>
                  </div>
                  <div>
                    <p className="text-slate-700 font-medium mb-1">
                      Alasan penolakan untuk penulis (<strong>{rejectModalSub.nama}</strong> &lt;{rejectModalSub.email}&gt;):
                    </p>
                    <textarea
                      rows={4}
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Tuliskan alasan naskah belum dapat diterbitkan..."
                      className="w-full p-3 bg-slate-50 border rounded-xl text-xs leading-relaxed focus:ring-2 focus:ring-red-600 outline-none"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setRejectModalSub(null)}
                      className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        const reason = rejectReason || "Naskah belum memenuhi kriteria publikasi dewan redaksi.";
                        const res = await updateSubmissionStatus(rejectModalSub.id, "rejected", reason);
                        if (res?.emailResult?.success) {
                          alert(`✓ Status penolakan tersimpan & pemberitahuan telah dikirim ke ${rejectModalSub.email}.`);
                        } else {
                          const errInfo = res?.emailResult?.error || "Resend API key belum aktif";
                          alert(`✓ Status penolakan tersimpan di database.\n⚠️ Email penolakan ke penulis belum terkirim: ${errInfo}`);
                        }
                        setRejectModalSub(null);
                        setRejectReason("");
                      }}
                      className="px-5 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold shadow"
                    >
                      Tolak &amp; Simpan Status
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Full Paper Preview Modal */}
            {previewFullPaperModalSub && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between pb-3 border-b sticky top-0 bg-white z-10">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        Naskah Lengkap (Tahap 2)
                      </span>
                      <h4 className="font-serif font-bold text-lg text-slate-900 mt-1">{previewFullPaperModalSub.judul}</h4>
                      <p className="text-slate-500 text-xs">Penulis: {previewFullPaperModalSub.nama} ({previewFullPaperModalSub.email}) • Kode: {previewFullPaperModalSub.accessCode || previewFullPaperModalSub.trackingCode}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPreviewFullPaperModalSub(null)}
                      className="text-slate-400 hover:text-slate-600 font-bold text-lg"
                    >
                      ✕
                    </button>
                  </div>

                  {previewFullPaperModalSub.fullPaper?.sections?.map((sec: any, idx: number) => (
                    <div key={sec.id || idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <h5 className="font-serif font-bold text-sm text-emerald-950 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-800 text-white flex items-center justify-center text-[10px]">{idx + 1}</span>
                        <span>{sec.title}</span>
                      </h5>
                      <p className="text-slate-800 leading-relaxed whitespace-pre-line text-xs font-serif">{sec.content}</p>
                    </div>
                  ))}

                  {previewFullPaperModalSub.fullPaper?.footnotes && (
                    <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 space-y-1">
                      <h5 className="font-bold text-xs text-amber-950">Catatan Kaki &amp; Referensi Tambahan:</h5>
                      <p className="text-slate-700 leading-relaxed whitespace-pre-line text-[11px] font-serif">{previewFullPaperModalSub.fullPaper.footnotes}</p>
                    </div>
                  )}

                  {previewFullPaperModalSub.fullPaper?.externalDriveUrl && (
                    <div className="p-3 bg-slate-50 rounded-xl border flex items-center justify-between text-xs">
                      <span className="text-slate-600">Google Drive / Berkas Pendukung:</span>
                      <a href={previewFullPaperModalSub.fullPaper.externalDriveUrl} target="_blank" rel="noreferrer" className="text-emerald-700 font-bold underline">
                        Buka Tautan Drive &rarr;
                      </a>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t sticky bottom-0 bg-white">
                    <button
                      type="button"
                      onClick={() => setPreviewFullPaperModalSub(null)}
                      className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium"
                    >
                      Tutup
                    </button>
                    <button
                      type="button"
                      disabled={publishingSubId === previewFullPaperModalSub.id}
                      onClick={async () => {
                        const isOp = previewFullPaperModalSub.tipeNaskah?.toLowerCase().includes("opini");
                        const tipeLabel = isOp ? "Opini/Refleksi Santri" : "Artikel Ilmiah";
                        if (confirm(`Terbitkan naskah lengkap "${previewFullPaperModalSub.judul}" langsung ke publik sebagai ${tipeLabel}?`)) {
                          setPublishingSubId(previewFullPaperModalSub.id);
                          const res = await publishSubmissionAsArticle(previewFullPaperModalSub.id);
                          setPublishingSubId(null);
                          if (res.success) {
                            setPreviewFullPaperModalSub(null);
                            alert(`✓ Naskah berhasil diterbitkan secara live! Penulis telah diberi notifikasi.`);
                          }
                        }
                      }}
                      className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow transition"
                    >
                      {publishingSubId === previewFullPaperModalSub.id ? "Menerbitkan..." : "✓ Terbitkan Naskah Ini ke Publik"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Header Box */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b">
                <div>
                  <h3 className="font-serif font-bold text-lg text-emerald-950 flex items-center gap-2">
                    <span>📥 Kotak Masuk Naskah Ilmiah &amp; Opini</span>
                    <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full text-xs">
                      {submissions.length} Total
                    </span>
                  </h3>
                  <p className="text-slate-500 text-xs mt-1">
                    Naskah berformat Word (.doc/.docx max 10MB) dikirimkan via email admin (<strong>munzirahmad779@gmail.com</strong>) dan dicatat rapi di database.
                  </p>
                </div>
              </div>

              {/* Status & Type Filter Tabs */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pt-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: "all", label: `Semua Status (${submissions.length})` },
                    { id: "review", label: `Review (${submissions.filter((s) => s.status === "review").length})` },
                    { id: "revision", label: `Revisi (${submissions.filter((s) => s.status === "revision").length})` },
                    { id: "accepted", label: `Diterima / Terbit (${submissions.filter((s) => s.status === "accepted" || s.status === "publish").length})` },
                    { id: "rejected", label: `Ditolak (${submissions.filter((s) => s.status === "rejected").length})` }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSubmissionFilter(tab.id as any)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition text-xs ${
                        submissionFilter === tab.id
                          ? "bg-emerald-800 text-white shadow-sm"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                  {[
                    { id: "all", label: "Semua Tipe" },
                    { id: "artikel", label: "📚 Artikel Ilmiah" },
                    { id: "opini", label: "✍️ Opini / Refleksi" }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSubTypeFilter(t.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                        subTypeFilter === t.id
                          ? "bg-white text-emerald-900 shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* List Naskah */}
            {submissions
              .filter((s) => submissionFilter === "all" || s.status === submissionFilter || (submissionFilter === "accepted" && s.status === "publish"))
              .filter((s) => {
                if (subTypeFilter === "all") return true;
                const isOp = s.tipeNaskah?.toLowerCase().includes("opini");
                return subTypeFilter === "opini" ? isOp : !isOp;
              }).length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">
                Tidak ada naskah pada kategori filter ini.
              </div>
            ) : (
              <div className="space-y-4">
                {submissions
                  .filter((s) => submissionFilter === "all" || s.status === submissionFilter || (submissionFilter === "accepted" && s.status === "publish"))
                  .filter((s) => {
                    if (subTypeFilter === "all") return true;
                    const isOp = s.tipeNaskah?.toLowerCase().includes("opini");
                    return subTypeFilter === "opini" ? isOp : !isOp;
                  })
                  .map((sub) => {
                    const trackingCode = sub.trackingCode || `MAD-2026-${sub.id.slice(-4)}`;
                    const isOpiniType = sub.tipeNaskah?.toLowerCase().includes("opini");
                    const isSkripsiType = sub.tipeNaskah?.toLowerCase().includes("skripsi") || Boolean(sub.nim);
                    return (
                      <div key={sub.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:border-emerald-700 transition">
                        {/* Top Meta */}
                        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-lg text-xs">
                              {trackingCode}
                            </span>
                            <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-semibold">
                              {sub.kategori}
                            </span>
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                              isSkripsiType
                                ? "bg-blue-100 text-blue-900 border border-blue-200"
                                : isOpiniType
                                ? "bg-amber-100 text-amber-900 border border-amber-200"
                                : "bg-emerald-100 text-emerald-900 border border-emerald-200"
                            }`}>
                              {isSkripsiType ? "🎓 Skripsi / Risalah" : isOpiniType ? "✍️ Opini / Refleksi" : "📚 Artikel Ilmiah"}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-slate-400 text-xs">{sub.tanggal}</span>
                            <span
                              className={`font-bold px-3 py-1 rounded-full uppercase text-[10px] tracking-wider ${
                                sub.status === "accepted" || sub.status === "publish"
                                  ? "bg-emerald-600 text-white"
                                  : sub.status === "revision"
                                  ? "bg-purple-600 text-white"
                                  : sub.status === "rejected"
                                  ? "bg-red-600 text-white"
                                  : "bg-amber-500 text-slate-950"
                              }`}
                            >
                              {sub.status === "accepted" || sub.status === "publish"
                                ? "✓ Diterima / Terbit"
                                : sub.status === "revision"
                                ? "Perlu Revisi"
                                : sub.status === "rejected"
                                ? "Ditolak"
                                : "Sedang Direview"}
                            </span>
                          </div>
                        </div>

                        {/* Title & Author Info */}
                        <div>
                          <h4 className="font-serif font-bold text-lg text-slate-900 leading-snug">{sub.judul}</h4>
                          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <div>
                              <span className="text-slate-400 block text-[10px] uppercase font-bold">Penulis</span>
                              <strong className="text-slate-900">{sub.nama}</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px] uppercase font-bold">Email</span>
                              <a href={`mailto:${sub.email}`} className="text-emerald-700 underline font-semibold">
                                {sub.email}
                              </a>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px] uppercase font-bold">No. HP / WA</span>
                              <span>{sub.hp || "-"}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px] uppercase font-bold">Afiliasi</span>
                              <span>{sub.afiliasi || "-"}</span>
                            </div>
                          </div>

                          {isSkripsiType && (
                            <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700 bg-blue-50/80 p-3 rounded-xl border border-blue-200 text-xs">
                              <div>
                                <span className="text-blue-900 font-bold block text-[10px] uppercase">NIM Mahasantri</span>
                                <span className="font-mono font-bold">{sub.nim || "-"}</span>
                              </div>
                              <div>
                                <span className="text-blue-900 font-bold block text-[10px] uppercase">Angkatan / Thn Lulus</span>
                                <span>{sub.angkatan || "-"} ({sub.year || "-"})</span>
                              </div>
                              <div>
                                <span className="text-blue-900 font-bold block text-[10px] uppercase">Pembimbing 1</span>
                                <span>{sub.advisor1 || "-"}</span>
                              </div>
                              <div>
                                <span className="text-blue-900 font-bold block text-[10px] uppercase">Pembimbing 2</span>
                                <span>{sub.advisor2 || "-"}</span>
                              </div>
                              {sub.driveUrl && (
                                <div className="col-span-2 sm:col-span-4 pt-1.5 border-t border-blue-200 flex items-center gap-2">
                                  <span className="text-blue-900 font-bold text-[10px] uppercase shrink-0">Link Drive / Naskah:</span>
                                  <a
                                    href={sub.driveUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-700 underline truncate font-semibold hover:text-blue-900"
                                  >
                                    {sub.driveUrl} ↗
                                  </a>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Abstract */}
                        <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-1">
                          <strong className="text-slate-800 text-[11px] uppercase tracking-wider block">Abstrak Naskah:</strong>
                          <p className="text-slate-700 leading-relaxed whitespace-pre-line">{sub.abstrak}</p>
                          {(sub.keyword || sub.keywords) && (
                            <div className="pt-2 flex items-center gap-1.5 flex-wrap">
                              <span className="text-slate-400 text-[10px] font-bold">Kata Kunci:</span>
                              {(Array.isArray(sub.keyword)
                                ? sub.keyword
                                : typeof sub.keywords === "string"
                                ? sub.keywords.split(",")
                                : [String(sub.keyword || "")]
                              ).map((kw: string, i: number) => (
                                <span key={i} className="bg-white border text-slate-600 px-2 py-0.5 rounded text-[10px]">
                                  {kw.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Word File Attachment info */}
                        <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">📎</span>
                            <div>
                              <span className="font-bold">{sub.fileName || "Naskah.docx"}</span>
                              <span className="text-slate-500 text-[11px] ml-2">({sub.fileSize || "Word Document"})</span>
                            </div>
                          </div>
                          {sub.adminEmailSent ? (
                            <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                              ✓ Terkirim ke Email Admin
                            </span>
                          ) : (
                            <span className="text-[11px] text-amber-800 font-semibold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200" title="Resend API key belum diaktifkan di server; berkas tersimpan aman di database">
                              ⚠️ Belum terkirim ke email admin (Key Resend belum diisi)
                            </span>
                          )}
                        </div>

                        {/* Stage 2 Access Code & Full Paper Status */}
                        {sub.accessCode && (
                          <div className="flex items-center justify-between flex-wrap gap-2 p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-sans font-bold text-[10px] text-emerald-800 uppercase tracking-wider">
                                Kode Akses Naskah Lengkap (Tahap 2):
                              </span>
                              <strong className="font-mono text-emerald-950 bg-white px-2.5 py-1 rounded-lg border border-emerald-300 font-bold">
                                {sub.accessCode}
                              </strong>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (sub.accessCode) {
                                  navigator.clipboard.writeText(sub.accessCode);
                                  alert(`✓ Kode akses ${sub.accessCode} disalin!`);
                                }
                              }}
                              className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[11px] font-bold transition"
                            >
                              📋 Salin Kode
                            </button>
                          </div>
                        )}

                        {sub.fullPaper ? (
                          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between flex-wrap gap-3 text-xs">
                            <div className="flex items-center gap-2.5">
                              <span className="text-xl">📄</span>
                              <div>
                                <strong className="text-blue-950 block font-bold">
                                  Naskah Lengkap (Tahap 2) Telah Dikirim oleh Penulis!
                                </strong>
                                <span className="text-blue-700 text-[11px]">
                                  {sub.fullPaper.sections?.length || 0} Bab lengkap dengan catatan kaki &amp; referensi.
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setPreviewFullPaperModalSub(sub)}
                              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
                            >
                              <span>👁️ Pratinjau Naskah Lengkap</span>
                            </button>
                          </div>
                        ) : sub.status === "accepted" ? (
                          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] flex items-center gap-2">
                            <span>⏳</span>
                            <span>
                              Menunggu penulis melengkapi Naskah Lengkap melalui formulir Tahap 2 menggunakan kode akses di atas.
                            </span>
                          </div>
                        ) : null}

                        {/* Feedback / Review Note */}
                        {(sub.feedback || sub.reviewNote) && (
                          <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-purple-950 space-y-1">
                            <strong className="text-purple-900 block text-[11px] uppercase tracking-wider">Catatan Redaksi Terakhir:</strong>
                            <p className="leading-relaxed">{sub.feedback || sub.reviewNote}</p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between flex-wrap gap-2 pt-3 border-t">
                          <div className="flex items-center gap-2 flex-wrap">
                            {sub.status === "review" && (
                              <button
                                type="button"
                                onClick={async () => {
                                  if (confirm(`Setujui abstrak "${sub.judul}" dan kirimkan Kode Akses Tahap 2 ke ${sub.email}?`)) {
                                    const res = await updateSubmissionStatus(
                                      sub.id,
                                      "accepted",
                                      "Alhamdulillah, abstrak naskah Anda telah disetujui dewan redaksi. Silakan lanjutkan pengisian Naskah Lengkap (Tahap 2) melalui portal penulisan."
                                    );
                                    if (res?.emailResult?.success) {
                                      alert(`✓ Abstrak disetujui! Kode akses Tahap 2 telah dikirimkan ke email ${sub.email}.`);
                                    } else {
                                      alert(`✓ Abstrak disetujui! Kode akses Tahap 2 tersimpan di database.\n⚠️ Email: ${res?.emailResult?.error || 'Terkirim via log'}`);
                                    }
                                  }
                                }}
                                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow"
                              >
                                <span>✅ ACC Abstrak (Kirim Kode Tahap 2)</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setRevisionModalSub(sub);
                                setRevisionNote(sub.feedback || "");
                              }}
                              className="px-3.5 py-2 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-xl font-bold transition flex items-center gap-1.5"
                            >
                              <span>✏️ Minta Revisi</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setRejectModalSub(sub);
                                setRejectReason("");
                              }}
                              className="px-3.5 py-2 bg-red-100 hover:bg-red-200 text-red-900 rounded-xl font-bold transition flex items-center gap-1.5"
                            >
                              <span>✕ Tolak Naskah</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            {isSkripsiType ? (
                              <button
                                type="button"
                                disabled={publishingSubId === sub.id}
                                onClick={async () => {
                                  if (confirm(`Setujui & terbitkan skripsi "${sub.judul}" karya ${sub.nama} langsung ke Repositori Skripsi publik?`)) {
                                    setPublishingSubId(sub.id);
                                    const res = await publishSubmissionAsThesis(sub.id);
                                    setPublishingSubId(null);
                                    if (res.success) {
                                      alert(`✓ Skripsi "${sub.judul}" karya ${sub.nama} berhasil diterbitkan langsung ke Repositori Skripsi publik!`);
                                    } else {
                                      alert(`Gagal menerbitkan skripsi: ${res.error || "Terjadi kesalahan"}`);
                                    }
                                  }
                                }}
                                className="px-5 py-2 bg-blue-800 hover:bg-blue-900 text-white font-bold rounded-xl shadow transition flex items-center gap-1.5 disabled:opacity-50"
                              >
                                {publishingSubId === sub.id ? (
                                  <span>Sedang menerbitkan...</span>
                                ) : (
                                  <span>🎓 Terbitkan ke Repositori Skripsi</span>
                                )}
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={publishingSubId === sub.id}
                                onClick={async () => {
                                  const tipeLabel = isOpiniType ? "Opini/Refleksi Santri" : "Artikel Ilmiah";
                                  if (confirm(`Setujui & terbitkan naskah "${sub.judul}" langsung sebagai ${tipeLabel} di portal publik?`)) {
                                    setPublishingSubId(sub.id);
                                    const res = await publishSubmissionAsArticle(sub.id);
                                    setPublishingSubId(null);
                                    if (res.success) {
                                      if (res.emailResult?.success) {
                                        alert(`✓ Naskah berhasil diterbitkan sebagai ${tipeLabel} dan notifikasi email berhasil dikirim ke ${sub.email}!`);
                                      } else {
                                        const errInfo = res.emailResult?.error || "Resend API key belum aktif";
                                        alert(`✓ Naskah berhasil diterbitkan langsung sebagai ${tipeLabel} live!\n⚠️ Email konfirmasi ke penulis belum terkirim: ${errInfo}`);
                                      }
                                    }
                                  }
                                }}
                                className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow transition flex items-center gap-1.5 disabled:opacity-50"
                              >
                                {publishingSubId === sub.id ? (
                                  <span>Sedang menerbitkan...</span>
                                ) : (
                                  <span>✓ Setujui &amp; Terbitkan Live</span>
                                )}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Hapus data naskah "${sub.judul}"?`)) {
                                  deleteSubmission(sub.id);
                                }
                              }}
                              className="px-3 py-2 text-slate-400 hover:text-red-600 font-bold"
                              title="Hapus Submission"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            HEADER & NAVBAR MANAGER
           ══════════════════════════════════════════════════════════════ */}
        {activeMenu === "header" && (
          <div className="space-y-6 text-xs">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b">
                <div>
                  <h3 className="font-serif font-bold text-lg text-emerald-950">
                    🧭 Pengaturan Header &amp; Navigasi Publik
                  </h3>
                  <p className="text-slate-500 text-xs mt-1">
                    Atur logo instansi, branding judul/subjudul, tombol aksi utama, dan susunan menu navigasi navbar.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    updateNavbarSettings(headerForm);
                    alert("✓ Pengaturan Header & Navbar berhasil disimpan!");
                  }}
                  className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow transition"
                >
                  Simpan Perubahan Header
                </button>
              </div>

              {/* Logo & Branding Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <ImageUploader
                    value={headerForm.logoUrl}
                    onChange={(url) => setHeaderForm({ ...headerForm, logoUrl: url })}
                    folder="logo"
                    label="Logo Header / Navbar"
                    helperText="Disarankan file PNG transparan beresolusi tajam"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Judul Instansi (Brand Title)</label>
                    <input
                      type="text"
                      value={headerForm.brandTitle}
                      onChange={(e) => setHeaderForm({ ...headerForm, brandTitle: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border rounded-lg"
                      placeholder="Ma'had Aly"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Subjudul / Slogan Singkat (Brand Subtitle)</label>
                    <input
                      type="text"
                      value={headerForm.brandSubtitle}
                      onChange={(e) => setHeaderForm({ ...headerForm, brandSubtitle: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border rounded-lg"
                      placeholder="DDI Mangkoso"
                    />
                  </div>

                  {/* CTA Button Settings */}
                  <div className="p-4 bg-slate-50 rounded-xl border space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Tombol Aksi Navbar (CTA Kanan)</span>
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(headerForm.ctaButton?.isActive ?? headerForm.ctaButton?.isVisible ?? true)}
                          onChange={(e) =>
                            setHeaderForm({
                              ...headerForm,
                              ctaButton: {
                                ...headerForm.ctaButton,
                                isActive: e.target.checked,
                                isVisible: e.target.checked
                              }
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                        <span className="ml-2 text-xs font-semibold text-slate-700">Tampilkan</span>
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-600 mb-1">Label Tombol</label>
                        <input
                          type="text"
                          value={headerForm.ctaButton?.text || headerForm.ctaButton?.label || "Kirim Tulisan"}
                          onChange={(e) =>
                            setHeaderForm({
                              ...headerForm,
                              ctaButton: {
                                ...headerForm.ctaButton,
                                text: e.target.value,
                                label: e.target.value
                              }
                            })
                          }
                          className="w-full p-2 bg-white border rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-1">URL Tujuan</label>
                        <input
                          type="text"
                          value={headerForm.ctaButton?.url || "/kirim-tulisan"}
                          onChange={(e) =>
                            setHeaderForm({
                              ...headerForm,
                              ctaButton: { ...headerForm.ctaButton, url: e.target.value }
                            })
                          }
                          className="w-full p-2 bg-white border rounded-lg text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Top Utility Bar Settings */}
                  <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">📅 Bilah Atas (Top Utility Bar)</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">Tier 1</span>
                      </div>
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(headerForm.topBar?.isActive ?? true)}
                          onChange={(e) =>
                            setHeaderForm({
                              ...headerForm,
                              topBar: {
                                ...headerForm.topBar,
                                isActive: e.target.checked
                              }
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                        <span className="ml-2 text-xs font-semibold text-slate-700">Tampilkan</span>
                      </label>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-slate-700 font-bold text-xs">Kalender Hijriah Real-Time</label>
                          <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                            <span>🟢</span>
                            <span>Otomatis Sync NU Online / Kemenag MABIMS</span>
                          </span>
                        </div>
                        <input
                          type="text"
                          readOnly
                          disabled
                          value="Otomatis Real-Time (Mengikuti Hisab/Rukyat Lembaga Falakiyah PBNU & Kemenag RI)"
                          className="w-full p-2 bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 cursor-not-allowed"
                        />
                        <p className="text-[11px] text-emerald-700 mt-1 font-medium">
                          ✨ Kalender Hijriah berjalan otomatis secara real-time setiap hari. Jika terjadi penetapan Sidang Isbat Kemenag/PBNU, sistem otomatis menyesuaikan tanpa perlu diedit manual.
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-600 mb-1 text-xs">Nomor Telepon / WhatsApp</label>
                          <input
                            type="text"
                            value={headerForm.topBar?.phone || ""}
                            onChange={(e) =>
                              setHeaderForm({
                                ...headerForm,
                                topBar: { ...headerForm.topBar, phone: e.target.value }
                              })
                            }
                            placeholder="(0421) 510-123 • WA: 0812-4234-xxxx"
                            className="w-full p-2 bg-white border rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-600 mb-1 text-xs">Email Resmi Sekretariat</label>
                          <input
                            type="text"
                            value={headerForm.topBar?.email || ""}
                            onChange={(e) =>
                              setHeaderForm({
                                ...headerForm,
                                topBar: { ...headerForm.topBar, email: e.target.value }
                              })
                            }
                            placeholder="redaksi@mahadaly-ddimangkoso.my.id"
                            className="w-full p-2 bg-white border rounded-lg text-xs font-mono"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-600 mb-1 text-xs">Label Link Cepat</label>
                          <input
                            type="text"
                            value={headerForm.topBar?.quickLinkText || ""}
                            onChange={(e) =>
                              setHeaderForm({
                                ...headerForm,
                                topBar: { ...headerForm.topBar, quickLinkText: e.target.value }
                              })
                            }
                            placeholder="E-Library Turats"
                            className="w-full p-2 bg-white border rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-600 mb-1 text-xs">URL Link Cepat</label>
                          <input
                            type="text"
                            value={headerForm.topBar?.quickLinkUrl || ""}
                            onChange={(e) =>
                              setHeaderForm({
                                ...headerForm,
                                topBar: { ...headerForm.topBar, quickLinkUrl: e.target.value }
                              })
                            }
                            placeholder="/elibrary"
                            className="w-full p-2 bg-white border rounded-lg text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sub-Ticker & Live Search Settings */}
                  <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">⚡ Bilah Ticker &amp; Live Search</span>
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">Tier 3</span>
                      </div>
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(headerForm.tickerBar?.isActive ?? true)}
                          onChange={(e) =>
                            setHeaderForm({
                              ...headerForm,
                              tickerBar: {
                                ...headerForm.tickerBar,
                                isActive: e.target.checked
                              }
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                        <span className="ml-2 text-xs font-semibold text-slate-700">Tampilkan</span>
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-600 mb-1 text-xs">Label Badge Ticker</label>
                        <input
                          type="text"
                          value={headerForm.tickerBar?.badgeLabel || ""}
                          onChange={(e) =>
                            setHeaderForm({
                              ...headerForm,
                              tickerBar: { ...headerForm.tickerBar, badgeLabel: e.target.value }
                            })
                          }
                          placeholder="Kajian Hangat"
                          className="w-full p-2 bg-white border rounded-lg text-xs"
                        />
                      </div>
                      <div className="flex items-center justify-between pt-5">
                        <span className="text-xs text-slate-700 font-semibold">Tampilkan Kolom Pencarian</span>
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(headerForm.tickerBar?.showSearch ?? true)}
                            onChange={(e) =>
                              setHeaderForm({
                                ...headerForm,
                                tickerBar: { ...headerForm.tickerBar, showSearch: e.target.checked }
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-8 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>
                    </div>

                    {/* Repeater Ticker Items Manager */}
                    <div className="pt-3 border-t border-amber-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">
                          ⚡ Daftar Headline Ticker Bergerak ({(headerForm.tickerBar?.tickerItems || []).length})
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const newItem = {
                              id: "t-" + Date.now().toString(),
                              label: "Headline Kajian Baru...",
                              url: "/artikel"
                            };
                            const currentItems = headerForm.tickerBar?.tickerItems || [];
                            setHeaderForm({
                              ...headerForm,
                              tickerBar: {
                                ...headerForm.tickerBar,
                                tickerItems: [...currentItems, newItem]
                              }
                            });
                          }}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] rounded-lg transition"
                        >
                          + Tambah Item Ticker
                        </button>
                      </div>

                      <div className="space-y-2">
                        {(headerForm.tickerBar?.tickerItems || []).map((tItem, tIdx) => (
                          <div key={tItem.id || tIdx} className="p-2 bg-white border rounded-lg flex items-center gap-2 text-xs">
                            <span className="font-mono text-amber-700 font-bold w-5">{tIdx + 1}.</span>
                            <input
                              type="text"
                              value={tItem.label}
                              onChange={(e) => {
                                const current = [...(headerForm.tickerBar?.tickerItems || [])];
                                current[tIdx] = { ...current[tIdx], label: e.target.value };
                                setHeaderForm({
                                  ...headerForm,
                                  tickerBar: { ...headerForm.tickerBar, tickerItems: current }
                                });
                              }}
                              placeholder="Judul Ticker (misal: Tinjauan Fiqh Mu'asarah...)"
                              className="p-1.5 bg-slate-50 border rounded font-medium flex-1 text-slate-900 text-xs"
                            />
                            <input
                              type="text"
                              value={tItem.url}
                              onChange={(e) => {
                                const current = [...(headerForm.tickerBar?.tickerItems || [])];
                                current[tIdx] = { ...current[tIdx], url: e.target.value };
                                setHeaderForm({
                                  ...headerForm,
                                  tickerBar: { ...headerForm.tickerBar, tickerItems: current }
                                });
                              }}
                              placeholder="URL (/kategori/fiqh-muamalah)"
                              className="p-1.5 bg-slate-50 border rounded font-mono text-slate-600 text-xs w-48"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const current = (headerForm.tickerBar?.tickerItems || []).filter((_, i) => i !== tIdx);
                                setHeaderForm({
                                  ...headerForm,
                                  tickerBar: { ...headerForm.tickerBar, tickerItems: current }
                                });
                              }}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Hapus Item"
                            >
                              🗑️
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Menu Links */}
              <div className="pt-4 border-t space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-bold text-base text-slate-900">
                    Daftar Tautan Menu Navbar ({headerForm.navLinks?.length || 0})
                  </h4>
                </div>

                <div className="space-y-2">
                  {(headerForm.navLinks || []).map((link, idx) => (
                    <div
                      key={link.id || idx}
                      className="p-3 bg-slate-50 border rounded-xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 flex-1 flex-wrap">
                        <span className="font-mono text-slate-400 font-bold w-6">{idx + 1}.</span>
                        <input
                          type="text"
                          value={link.label}
                          onChange={(e) => {
                            const updated = [...headerForm.navLinks];
                            updated[idx] = { ...updated[idx], label: e.target.value };
                            setHeaderForm({ ...headerForm, navLinks: updated });
                          }}
                          className="p-2 bg-white border rounded-lg font-bold text-slate-900 w-36"
                          placeholder="Label Menu"
                        />
                        <select
                          value={SYSTEM_NAV_PAGES.some((p) => p.url === link.url) ? link.url : "custom"}
                          onChange={(e) => {
                            const val = e.target.value;
                            const updated = [...headerForm.navLinks];
                            if (val !== "custom") {
                              const page = SYSTEM_NAV_PAGES.find((p) => p.url === val);
                              updated[idx] = {
                                ...updated[idx],
                                url: val,
                                label: updated[idx].label || page?.label.replace(/^[\p{Emoji}\s]+/u, "").trim() || ""
                              };
                            }
                            setHeaderForm({ ...headerForm, navLinks: updated });
                          }}
                          className="p-2 bg-white border rounded-lg text-slate-700 text-xs font-medium"
                        >
                          <optgroup label="🧭 Pilih Halaman Sistem">
                            {SYSTEM_NAV_PAGES.filter((p) => p.url !== "custom").map((p) => (
                              <option key={p.url} value={p.url}>{p.label}</option>
                            ))}
                          </optgroup>
                          <option value="custom">🔗 URL Kustom...</option>
                        </select>
                        <input
                          type="text"
                          value={link.url}
                          onChange={(e) => {
                            const updated = [...headerForm.navLinks];
                            updated[idx] = { ...updated[idx], url: e.target.value };
                            setHeaderForm({ ...headerForm, navLinks: updated });
                          }}
                          className="p-2 bg-white border rounded-lg font-mono text-slate-600 flex-1 min-w-[120px]"
                          placeholder="/url-tujuan"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="inline-flex items-center cursor-pointer mr-2">
                          <input
                            type="checkbox"
                            checked={link.isActive !== false}
                            onChange={(e) => {
                              const updated = [...headerForm.navLinks];
                              updated[idx] = { ...updated[idx], isActive: e.target.checked };
                              setHeaderForm({ ...headerForm, navLinks: updated });
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-8 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => {
                            const updated = [...headerForm.navLinks];
                            const temp = updated[idx - 1];
                            updated[idx - 1] = updated[idx];
                            updated[idx] = temp;
                            setHeaderForm({ ...headerForm, navLinks: updated });
                          }}
                          className="p-1.5 bg-slate-200 hover:bg-slate-300 rounded disabled:opacity-30"
                          title="Geser Naik"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          disabled={idx === headerForm.navLinks.length - 1}
                          onClick={() => {
                            const updated = [...headerForm.navLinks];
                            const temp = updated[idx + 1];
                            updated[idx + 1] = updated[idx];
                            updated[idx] = temp;
                            setHeaderForm({ ...headerForm, navLinks: updated });
                          }}
                          className="p-1.5 bg-slate-200 hover:bg-slate-300 rounded disabled:opacity-30"
                          title="Geser Turun"
                        >
                          ▼
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = headerForm.navLinks.filter((_, i) => i !== idx);
                            setHeaderForm({ ...headerForm, navLinks: updated });
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          title="Hapus Menu"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Form Tambah Menu Baru */}
                <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <strong className="text-emerald-950 text-xs">➕ Tambah Tautan Navigasi Baru</strong>
                    <span className="text-[10px] text-slate-500">Pilih dari halaman sistem atau ketik manual</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Pilih Cepat Halaman</label>
                      <select
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "custom") {
                            setNewHeaderLink({ ...newHeaderLink, url: "/" });
                          } else if (val) {
                            const page = SYSTEM_NAV_PAGES.find((p) => p.url === val);
                            setNewHeaderLink({
                              ...newHeaderLink,
                              url: val,
                              label: page ? page.label.replace(/^[\p{Emoji}\s]+/u, "").trim() : newHeaderLink.label
                            });
                          }
                        }}
                        className="w-full p-2 bg-white border rounded-lg text-xs"
                      >
                        <option value="">-- Pilih Halaman Sistem --</option>
                        {SYSTEM_NAV_PAGES.filter((p) => p.url !== "custom").map((p) => (
                          <option key={p.url} value={p.url}>{p.label}</option>
                        ))}
                        <option value="custom">🔗 URL Kustom...</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Label Menu</label>
                      <input
                        type="text"
                        value={newHeaderLink.label}
                        onChange={(e) => setNewHeaderLink({ ...newHeaderLink, label: e.target.value })}
                        placeholder="Nama Menu"
                        className="w-full p-2 bg-white border rounded-lg text-xs font-semibold"
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">URL Tujuan</label>
                        <input
                          type="text"
                          value={newHeaderLink.url}
                          onChange={(e) => setNewHeaderLink({ ...newHeaderLink, url: e.target.value })}
                          placeholder="/url"
                          className="w-full p-2 bg-white border rounded-lg text-xs font-mono"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (!newHeaderLink.label.trim()) {
                            alert("Label menu wajib diisi!");
                            return;
                          }
                          setHeaderForm({
                            ...headerForm,
                            navLinks: [
                              ...(headerForm.navLinks || []),
                              {
                                id: "nav-" + Date.now().toString(),
                                label: newHeaderLink.label.trim(),
                                url: newHeaderLink.url.trim() || "/",
                                order: (headerForm.navLinks?.length || 0) + 1,
                                isActive: true
                              }
                            ]
                          });
                          setNewHeaderLink({ label: "", url: "/", order: 1, isActive: true });
                        }}
                        className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg text-xs shadow shrink-0"
                      >
                        Tambah Menu
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            HERO SECTION & METRIK MANAGER
           ══════════════════════════════════════════════════════════════ */}
        {activeMenu === "hero" && (
          <div className="space-y-6 text-xs">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b">
                <div>
                  <h3 className="font-serif font-bold text-lg text-emerald-950">
                    🌟 Pengaturan Hero Banner &amp; Metrik Beranda
                  </h3>
                  <p className="text-slate-500 text-xs mt-1">
                    Ubah teks judul, basmalah, deskripsi pengantar, tombol CTA, dan metrik pilar beranda tanpa batasan tahun.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    updateHeroSettings(heroForm);
                    alert("✓ Pengaturan Hero Section berhasil disimpan!");
                  }}
                  className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow transition"
                >
                  Simpan Hero Section
                </button>
              </div>

              {/* Logo & Teks Utama */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <ImageUploader
                    value={heroForm.logoUrl}
                    onChange={(url) => setHeroForm({ ...heroForm, logoUrl: url })}
                    folder="logo"
                    label="Logo Hero Utama"
                    helperText="Logo resolusi tinggi yang tampil di tengah Hero Banner"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Kaligrafi Basmalah (RTL)</label>
                    <input
                      type="text"
                      dir="rtl"
                      value={heroForm.arabicBismillah || ""}
                      onChange={(e) => setHeroForm({ ...heroForm, arabicBismillah: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border rounded-lg font-serif text-right text-base text-emerald-900"
                      placeholder="بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Judul Utama</label>
                      <input
                        type="text"
                        value={heroForm.title || ""}
                        onChange={(e) => setHeroForm({ ...heroForm, title: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border rounded-lg font-bold"
                        placeholder="Pendidikan Tinggi"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Judul Highlight (Gold)</label>
                      <input
                        type="text"
                        value={heroForm.titleHighlight || ""}
                        onChange={(e) => setHeroForm({ ...heroForm, titleHighlight: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border rounded-lg font-bold text-amber-700"
                        placeholder="Kader Ulama"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Deskripsi Singkat / Subtitle</label>
                    <textarea
                      rows={3}
                      value={heroForm.subtitle || ""}
                      onChange={(e) => setHeroForm({ ...heroForm, subtitle: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border rounded-lg leading-relaxed"
                      placeholder="Pusat kaderisasi ulama berwawasan wasathiyyah..."
                    />
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                <div className="p-4 bg-slate-50 rounded-xl border space-y-2">
                  <span className="font-bold text-slate-900 block">Tombol CTA 1 (Utama - Gold)</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={heroForm.cta1Text || ""}
                      onChange={(e) => setHeroForm({ ...heroForm, cta1Text: e.target.value })}
                      placeholder="Teks Tombol (Kenali Ma'had)"
                      className="p-2 bg-white border rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      value={heroForm.cta1Url || ""}
                      onChange={(e) => setHeroForm({ ...heroForm, cta1Url: e.target.value })}
                      placeholder="URL (/tentang)"
                      className="p-2 bg-white border rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border space-y-2">
                  <span className="font-bold text-slate-900 block">Tombol CTA 2 (Sekunder - Outline)</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={heroForm.cta2Text || ""}
                      onChange={(e) => setHeroForm({ ...heroForm, cta2Text: e.target.value })}
                      placeholder="Teks Tombol (Baca Kajian)"
                      className="p-2 bg-white border rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      value={heroForm.cta2Url || ""}
                      onChange={(e) => setHeroForm({ ...heroForm, cta2Url: e.target.value })}
                      placeholder="URL (#mimbar-kajian)"
                      className="p-2 bg-white border rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Repeater Carousel Slide Hero Banner */}
              <div className="pt-6 border-t space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
                      <span>🎠 Kelola Slide Carousel Hero Beranda ({(heroForm.slides || []).length})</span>
                    </h4>
                    <p className="text-slate-500 text-xs mt-0.5">
                      Tambah, edit, hapus, dan atur urutan slide banner bergerak yang tayang otomatis di bagian paling atas beranda.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newSlide = {
                        id: "slide-" + Date.now().toString(),
                        badge: "Badge Slide Baru",
                        title: "Judul Slide Utama",
                        titleHighlight: "",
                        subtitle: "Deskripsi pengantar slide baru...",
                        arabicBismillah: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
                        cta1Text: "Tautan Utama",
                        cta1Url: "/artikel",
                        cta2Text: "Tautan Sekunder",
                        cta2Url: "/skripsi",
                        order: ((heroForm.slides || []).length) + 1,
                        isActive: true
                      };
                      setHeroForm({
                        ...heroForm,
                        slides: [...(heroForm.slides || []), newSlide]
                      });
                    }}
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow transition"
                  >
                    + Tambah Slide Carousel
                  </button>
                </div>

                <div className="space-y-4">
                  {(heroForm.slides || []).map((slide, sIdx) => (
                    <div
                      key={slide.id || sIdx}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 shadow-sm"
                    >
                      <div className="flex items-center justify-between pb-2 border-b">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-emerald-800 text-white font-mono font-bold text-xs flex items-center justify-center">
                            {sIdx + 1}
                          </span>
                          <span className="font-serif font-bold text-slate-900 text-sm">
                            {slide.title || "Slide Tanpa Judul"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="inline-flex items-center cursor-pointer mr-2">
                            <input
                              type="checkbox"
                              checked={slide.isActive !== false}
                              onChange={(e) => {
                                const updated = [...(heroForm.slides || [])];
                                updated[sIdx] = { ...updated[sIdx], isActive: e.target.checked };
                                setHeroForm({ ...heroForm, slides: updated });
                              }}
                              className="sr-only peer"
                            />
                            <div className="w-8 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-600"></div>
                            <span className="ml-1.5 text-[11px] font-semibold text-slate-600">Aktif</span>
                          </label>
                          <button
                            type="button"
                            disabled={sIdx === 0}
                            onClick={() => {
                              const updated = [...(heroForm.slides || [])];
                              const temp = updated[sIdx - 1];
                              updated[sIdx - 1] = updated[sIdx];
                              updated[sIdx] = temp;
                              setHeroForm({ ...heroForm, slides: updated });
                            }}
                            className="p-1.5 bg-slate-200 hover:bg-slate-300 rounded disabled:opacity-30 text-xs"
                            title="Geser Naik"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            disabled={sIdx === (heroForm.slides || []).length - 1}
                            onClick={() => {
                              const updated = [...(heroForm.slides || [])];
                              const temp = updated[sIdx + 1];
                              updated[sIdx + 1] = updated[sIdx];
                              updated[sIdx] = temp;
                              setHeroForm({ ...heroForm, slides: updated });
                            }}
                            className="p-1.5 bg-slate-200 hover:bg-slate-300 rounded disabled:opacity-30 text-xs"
                            title="Geser Turun"
                          >
                            ▼
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (heroForm.slides || []).filter((_, i) => i !== sIdx);
                              setHeroForm({ ...heroForm, slides: updated });
                            }}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded text-xs"
                            title="Hapus Slide"
                          >
                            🗑️ Hapus
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-slate-600 font-bold mb-1">Badge Slide</label>
                          <input
                            type="text"
                            value={slide.badge || ""}
                            onChange={(e) => {
                              const updated = [...(heroForm.slides || [])];
                              updated[sIdx] = { ...updated[sIdx], badge: e.target.value };
                              setHeroForm({ ...heroForm, slides: updated });
                            }}
                            className="w-full p-2 bg-white border rounded-lg"
                            placeholder="Pusat Kaderisasi Fuqaha..."
                          />
                        </div>
                        <div>
                          <label className="block text-slate-600 font-bold mb-1">Basmalah / Motto RTL</label>
                          <input
                            type="text"
                            dir="rtl"
                            value={slide.arabicBismillah || ""}
                            onChange={(e) => {
                              const updated = [...(heroForm.slides || [])];
                              updated[sIdx] = { ...updated[sIdx], arabicBismillah: e.target.value };
                              setHeroForm({ ...heroForm, slides: updated });
                            }}
                            className="w-full p-2 bg-white border rounded-lg font-serif text-right text-emerald-900"
                            placeholder="بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-600 font-bold mb-1 text-xs">Judul Slide Utama</label>
                        <input
                          type="text"
                          value={slide.title || ""}
                          onChange={(e) => {
                            const updated = [...(heroForm.slides || [])];
                            updated[sIdx] = { ...updated[sIdx], title: e.target.value };
                            setHeroForm({ ...heroForm, slides: updated });
                          }}
                          className="w-full p-2 bg-white border rounded-lg font-bold text-slate-900 text-xs"
                          placeholder="Meneguhkan Khazanah Turats..."
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 font-bold mb-1 text-xs">Subtitle / Deskripsi</label>
                        <textarea
                          rows={2}
                          value={slide.subtitle || ""}
                          onChange={(e) => {
                            const updated = [...(heroForm.slides || [])];
                            updated[sIdx] = { ...updated[sIdx], subtitle: e.target.value };
                            setHeroForm({ ...heroForm, slides: updated });
                          }}
                          className="w-full p-2 bg-white border rounded-lg text-xs leading-relaxed"
                          placeholder="Pendidikan Tinggi Kader Ulama Takhassus Fiqh..."
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-2.5 bg-white border rounded-lg space-y-1.5">
                          <span className="font-bold text-slate-700 block text-[11px]">Tombol CTA 1 (Utama)</span>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={slide.cta1Text || ""}
                              onChange={(e) => {
                                const updated = [...(heroForm.slides || [])];
                                updated[sIdx] = { ...updated[sIdx], cta1Text: e.target.value };
                                setHeroForm({ ...heroForm, slides: updated });
                              }}
                              placeholder="Label (Jelajahi)"
                              className="p-1.5 bg-slate-50 border rounded text-xs"
                            />
                            <input
                              type="text"
                              value={slide.cta1Url || ""}
                              onChange={(e) => {
                                const updated = [...(heroForm.slides || [])];
                                updated[sIdx] = { ...updated[sIdx], cta1Url: e.target.value };
                                setHeroForm({ ...heroForm, slides: updated });
                              }}
                              placeholder="URL (/artikel)"
                              className="p-1.5 bg-slate-50 border rounded font-mono text-xs"
                            />
                          </div>
                        </div>

                        <div className="p-2.5 bg-white border rounded-lg space-y-1.5">
                          <span className="font-bold text-slate-700 block text-[11px]">Tombol CTA 2 (Sekunder)</span>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={slide.cta2Text || ""}
                              onChange={(e) => {
                                const updated = [...(heroForm.slides || [])];
                                updated[sIdx] = { ...updated[sIdx], cta2Text: e.target.value };
                                setHeroForm({ ...heroForm, slides: updated });
                              }}
                              placeholder="Label (Skripsi)"
                              className="p-1.5 bg-slate-50 border rounded text-xs"
                            />
                            <input
                              type="text"
                              value={slide.cta2Url || ""}
                              onChange={(e) => {
                                const updated = [...(heroForm.slides || [])];
                                updated[sIdx] = { ...updated[sIdx], cta2Url: e.target.value };
                                setHeroForm({ ...heroForm, slides: updated });
                              }}
                              placeholder="URL (/skripsi)"
                              className="p-1.5 bg-slate-50 border rounded font-mono text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Repeater 4 Pilar / Metrik Hero */}
              <div className="pt-4 border-t space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif font-bold text-base text-slate-900">
                      Repeater Metrik Pilar Hero ({heroForm.metrics?.length || 0})
                    </h4>
                    <p className="text-slate-500 text-xs mt-0.5">
                      Bebas diedit nilai &amp; labelnya. Tidak ada tahun hardcoded!
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newMetric = {
                        id: "m-" + Date.now().toString(),
                        value: "Baru",
                        label: "Keterangan Metrik"
                      };
                      setHeroForm({ ...heroForm, metrics: [...(heroForm.metrics || []), newMetric] });
                    }}
                    className="px-3.5 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold rounded-lg transition"
                  >
                    + Tambah Metrik
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(heroForm.metrics || []).map((m, idx) => (
                    <div key={m.id || idx} className="p-4 bg-slate-50 border rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-800 text-[11px]">Pilar #{idx + 1}</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => {
                              const updated = [...heroForm.metrics];
                              const temp = updated[idx - 1];
                              updated[idx - 1] = updated[idx];
                              updated[idx] = temp;
                              setHeroForm({ ...heroForm, metrics: updated });
                            }}
                            className="p-1 bg-slate-200 hover:bg-slate-300 rounded text-[10px] disabled:opacity-30"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            disabled={idx === heroForm.metrics.length - 1}
                            onClick={() => {
                              const updated = [...heroForm.metrics];
                              const temp = updated[idx + 1];
                              updated[idx + 1] = updated[idx];
                              updated[idx] = temp;
                              setHeroForm({ ...heroForm, metrics: updated });
                            }}
                            className="p-1 bg-slate-200 hover:bg-slate-300 rounded text-[10px] disabled:opacity-30"
                          >
                            ▼
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = heroForm.metrics.filter((_, i) => i !== idx);
                              setHeroForm({ ...heroForm, metrics: updated });
                            }}
                            className="p-1 text-red-600 hover:bg-red-50 rounded text-[10px]"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 uppercase font-bold mb-0.5">Nilai / Angka</label>
                        <input
                          type="text"
                          value={m.value}
                          onChange={(e) => {
                            const updated = [...heroForm.metrics];
                            updated[idx] = { ...updated[idx], value: e.target.value };
                            setHeroForm({ ...heroForm, metrics: updated });
                          }}
                          className="w-full p-2 bg-white border rounded-lg font-bold text-amber-700 text-sm"
                          placeholder="e.g. 4 Tahun / 100%"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 uppercase font-bold mb-0.5">Label Keterangan</label>
                        <input
                          type="text"
                          value={m.label}
                          onChange={(e) => {
                            const updated = [...heroForm.metrics];
                            updated[idx] = { ...updated[idx], label: e.target.value };
                            setHeroForm({ ...heroForm, metrics: updated });
                          }}
                          className="w-full p-2 bg-white border rounded-lg text-slate-700 text-xs"
                          placeholder="e.g. Masa Pengkaderan"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            URUTAN & VISIBILITAS SECTION BERANDA (BUILDER LENGKAP)
           ══════════════════════════════════════════════════════════════ */}
        {activeMenu === "homesections" && (
          <div className="space-y-6 text-xs">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              {/* Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b">
                <div>
                  <h3 className="font-serif font-bold text-lg text-emerald-950 flex items-center gap-2">
                    <span>📑</span>
                    <span>Penyusun &amp; Tata Letak Section Beranda (Homepage Builder)</span>
                  </h3>
                  <p className="text-slate-500 text-xs mt-1">
                    Tambah section baru, atur urutan tampilan atas-bawah, aktifkan/nonaktifkan modul, dan edit teks/banner setiap bagian beranda tanpa batasan.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowAddSectionModal(!showAddSectionModal)}
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow transition flex items-center gap-1.5"
                  >
                    <span>➕</span>
                    <span>Tambah Section Baru</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateHomeSections(homeSectionsForm);
                      alert("✓ Seluruh perubahan urutan dan konten section beranda berhasil disimpan!");
                    }}
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow transition flex items-center gap-1.5"
                  >
                    <span>💾</span>
                    <span>Simpan Perubahan</span>
                  </button>
                  <Link
                    href="/"
                    target="_blank"
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-300 transition flex items-center gap-1"
                  >
                    <span>🌐</span>
                    <span>Cek Beranda Live</span>
                  </Link>
                </div>
              </div>

              {/* Form Tambah Section Baru (Expandable Card) */}
              {showAddSectionModal && (
                <div className="p-6 bg-emerald-50/60 border-2 border-emerald-600/30 rounded-2xl space-y-5 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">✨</span>
                      <h4 className="font-bold text-sm text-emerald-950">
                        Tambah Modul / Section Baru ke Beranda
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddSectionModal(false)}
                      className="text-slate-400 hover:text-slate-600 font-bold text-sm px-2 py-1 rounded"
                    >
                      ✕ Tutup
                    </button>
                  </div>

                  {/* Template Quick Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Pilih Model / Tipe Section:</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        {
                          type: "donasi",
                          icon: "🤲",
                          label: "Infaq & Donasi",
                          title: "Dukung Kaderisasi Ulama Fiqh",
                          subtitle: "Salurkan infaq terbaik Anda untuk riset mahasantri, orang tua asuh, dan sarana Ma'had Aly."
                        },
                        {
                          type: "bahtsul",
                          icon: "🕌",
                          label: "Bahtsul Masail",
                          title: "Bahtsul Masail & Tanya Jawab Fiqh",
                          subtitle: "Hasil musyawarah fatwa mahasantri dan dewan masyaikh berlandaskan kitab turats muktabarah."
                        },
                        {
                          type: "pmb",
                          icon: "🎓",
                          label: "Pendaftaran PMB",
                          title: "Jadilah Generasi Ulama Fiqh Masa Depan",
                          subtitle: "Pendaftaran jenjang Marhalah Ula (M.1) Takhassus Fiqh wa Usuluhu Ma'had Aly DDI Mangkoso."
                        },
                        {
                          type: "masyayikh",
                          icon: "👳",
                          label: "Dewan Masyayikh",
                          title: "Dewan Masyayikh & Dosen Pengajar",
                          subtitle: "Dibimbing langsung oleh para masyaikh dan pakar fiqh yang bersambung sanad keilmuannya."
                        },
                        {
                          type: "submission",
                          icon: "✍️",
                          label: "Kirim Tulisan",
                          title: "Punya Risalah Ilmiah atau Opini Fiqh?",
                          subtitle: "Kirimkan karya tulis Anda untuk ditinjau oleh Dewan Redaksi Ma'had Aly DDI Mangkoso."
                        },
                        {
                          type: "banner",
                          icon: "📢",
                          label: "Banner Promosi",
                          title: "Pengumuman Penting Lembaga",
                          subtitle: "Informasi resmi seputar agenda akbar, daurah ilmiah, dan kegiatan takhassus."
                        },
                        {
                          type: "custom",
                          icon: "📄",
                          label: "Konten Kustom",
                          title: "Sambutan & Selayang Pandang",
                          subtitle: "Pesan khusus pimpinan lembaga untuk seluruh pengunjung dan muhsinin."
                        }
                      ].map((tmpl) => (
                        <button
                          key={tmpl.type}
                          type="button"
                          onClick={() => {
                            setNewSectionForm({
                              ...newSectionForm,
                              name: tmpl.type,
                              label: tmpl.label,
                              title: tmpl.title,
                              subtitle: tmpl.subtitle,
                              badge: tmpl.label
                            });
                          }}
                          className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition ${
                            newSectionForm.name === tmpl.type
                              ? "bg-emerald-800 text-white font-bold border-emerald-900 shadow-sm"
                              : "bg-white text-slate-800 border-slate-200 hover:border-emerald-600"
                          }`}
                        >
                          <span className="text-base">{tmpl.icon}</span>
                          <span className="text-xs truncate">{tmpl.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Form Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Label Menu / Identitas Section</label>
                      <input
                        type="text"
                        value={newSectionForm.label || ""}
                        onChange={(e) => setNewSectionForm({ ...newSectionForm, label: e.target.value })}
                        placeholder="Contoh: Program Infaq & Donasi Pilihan"
                        className="w-full px-3.5 py-2.5 border rounded-xl bg-white font-semibold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Badge Kategori (Pill Atas)</label>
                      <input
                        type="text"
                        value={newSectionForm.badge || ""}
                        onChange={(e) => setNewSectionForm({ ...newSectionForm, badge: e.target.value })}
                        placeholder="Contoh: Amal Jariyah / Fatwa Aktual"
                        className="w-full px-3.5 py-2.5 border rounded-xl bg-white text-slate-900"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-slate-700 block mb-1">Judul Utama (Headline Besar)</label>
                      <input
                        type="text"
                        value={newSectionForm.title || ""}
                        onChange={(e) => setNewSectionForm({ ...newSectionForm, title: e.target.value })}
                        placeholder="Contoh: Dukung Kaderisasi Ulama Ahli Fiqh"
                        className="w-full px-3.5 py-2.5 border rounded-xl bg-white font-bold text-slate-900"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-slate-700 block mb-1">Subjudul / Deskripsi Pendukung</label>
                      <textarea
                        rows={2}
                        value={newSectionForm.subtitle || ""}
                        onChange={(e) => setNewSectionForm({ ...newSectionForm, subtitle: e.target.value })}
                        placeholder="Uraian ringkas yang tampil di bawah judul..."
                        className="w-full px-3.5 py-2 border rounded-xl bg-white text-slate-900 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Teks Tombol Aksi (CTA)</label>
                      <input
                        type="text"
                        value={newSectionForm.ctaText || ""}
                        onChange={(e) => setNewSectionForm({ ...newSectionForm, ctaText: e.target.value })}
                        placeholder="Contoh: Infaq Sekarang / Selengkapnya"
                        className="w-full px-3.5 py-2.5 border rounded-xl bg-white text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Link URL Tombol Aksi</label>
                      <input
                        type="text"
                        value={newSectionForm.ctaUrl || ""}
                        onChange={(e) => setNewSectionForm({ ...newSectionForm, ctaUrl: e.target.value })}
                        placeholder="Contoh: /donasi atau /bahtsul-masail"
                        className="w-full px-3.5 py-2.5 border rounded-xl bg-white text-slate-900 font-mono"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-slate-700 block mb-1">Banner Gambar / Foto (Opsional)</label>
                      <ImageUploader
                        value={newSectionForm.imageUrl || ""}
                        folder="umum"
                        onChange={(url) => setNewSectionForm({ ...newSectionForm, imageUrl: url })}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-emerald-200">
                    <button
                      type="button"
                      onClick={() => setShowAddSectionModal(false)}
                      className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!newSectionForm.label?.trim()) {
                          alert("Label section wajib diisi!");
                          return;
                        }
                        const newSec: HomeSectionConfigItem = {
                          id: "sec-" + Date.now().toString(),
                          name: newSectionForm.name || "custom",
                          label: newSectionForm.label.trim(),
                          isActive: true,
                          order: homeSectionsForm.length + 1,
                          title: newSectionForm.title?.trim() || "",
                          subtitle: newSectionForm.subtitle?.trim() || "",
                          badge: newSectionForm.badge?.trim() || "",
                          maxItems: newSectionForm.maxItems || 3,
                          imageUrl: newSectionForm.imageUrl || "",
                          ctaText: newSectionForm.ctaText || "",
                          ctaUrl: newSectionForm.ctaUrl || "",
                          content: newSectionForm.content || ""
                        };
                        const updated = [...homeSectionsForm, newSec];
                        setHomeSectionsForm(updated);
                        updateHomeSections(updated);
                        setShowAddSectionModal(false);
                        alert(`✓ Section "${newSec.label}" berhasil ditambahkan ke beranda dan disimpan!`);
                      }}
                      className="px-6 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow"
                    >
                      Tambahkan ke Urutan Beranda
                    </button>
                  </div>
                </div>
              )}

              {/* List of Homepage Sections */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-2">
                  <span>Daftar Urutan Section ({homeSectionsForm.length} total, {homeSectionsForm.filter(s => s.isActive !== false).length} aktif)</span>
                  <span>Gunakan ▲ ▼ untuk mengubah urutan tampilan</span>
                </div>

                {homeSectionsForm.map((sec, idx) => {
                  const isExpanded = expandedSectionId === sec.id;
                  const getIcon = (name: string) => {
                    switch (name.toLowerCase()) {
                      case "hero": return "🌟";
                      case "quote": return "💬";
                      case "about": return "🏛️";
                      case "categories": return "📚";
                      case "articles": return "📰";
                      case "theses": return "🎓";
                      case "donasi": return "🤲";
                      case "bahtsul": return "🕌";
                      case "pmb": return "📋";
                      case "masyayikh": return "👳";
                      case "submission": return "✍️";
                      case "banner": return "📢";
                      default: return "📄";
                    }
                  };

                  return (
                    <div
                      key={sec.id || idx}
                      className={`border rounded-2xl transition overflow-hidden ${
                        sec.isActive !== false ? "bg-white border-slate-200 shadow-sm" : "bg-slate-100/70 border-slate-200 opacity-70"
                      }`}
                    >
                      {/* Section Card Header */}
                      <div className="p-4 flex items-center justify-between gap-4 text-xs">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="font-mono text-slate-400 font-bold w-6 shrink-0">{idx + 1}.</span>
                          <span className="text-base shrink-0">{getIcon(sec.name)}</span>
                          <div className="flex-1 min-w-0">
                            <input
                              type="text"
                              value={sec.label}
                              onChange={(e) => {
                                const updated = [...homeSectionsForm];
                                updated[idx] = { ...updated[idx], label: e.target.value };
                                setHomeSectionsForm(updated);
                              }}
                              className="p-1.5 bg-transparent border-b border-dashed border-slate-300 font-bold text-slate-900 w-full sm:w-80 focus:border-emerald-700 outline-none"
                            />
                            <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md font-mono ml-2">
                              type: {sec.name}
                            </span>
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Active Toggle Switch */}
                          <label className="inline-flex items-center cursor-pointer mr-1">
                            <input
                              type="checkbox"
                              checked={sec.isActive !== false}
                              onChange={(e) => {
                                const updated = [...homeSectionsForm];
                                updated[idx] = { ...updated[idx], isActive: e.target.checked };
                                setHomeSectionsForm(updated);
                              }}
                              className="sr-only peer"
                            />
                            <div className="w-8 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-600"></div>
                            <span className="ml-1.5 text-[11px] font-semibold text-slate-700 hidden sm:inline">
                              {sec.isActive !== false ? "Aktif" : "Mati"}
                            </span>
                          </label>

                          {/* Reorder Buttons */}
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => {
                              const updated = [...homeSectionsForm];
                              const temp = updated[idx - 1];
                              updated[idx - 1] = { ...updated[idx], order: idx };
                              updated[idx] = { ...temp, order: idx + 1 };
                              setHomeSectionsForm(updated);
                            }}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold disabled:opacity-30"
                            title="Geser Ke Atas"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            disabled={idx === homeSectionsForm.length - 1}
                            onClick={() => {
                              const updated = [...homeSectionsForm];
                              const temp = updated[idx + 1];
                              updated[idx + 1] = { ...updated[idx], order: idx + 2 };
                              updated[idx] = { ...temp, order: idx + 1 };
                              setHomeSectionsForm(updated);
                            }}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold disabled:opacity-30"
                            title="Geser Ke Bawah"
                          >
                            ▼
                          </button>

                          {/* Toggle Edit Detail Button */}
                          <button
                            type="button"
                            onClick={() => setExpandedSectionId(isExpanded ? null : sec.id)}
                            className={`p-1.5 rounded-lg font-semibold text-xs transition ${
                              isExpanded ? "bg-emerald-800 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                            }`}
                            title="Edit Konten Detail"
                          >
                            ⚙️ Detail
                          </button>

                          {/* Delete Section Button */}
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Hapus section "${sec.label}" dari beranda?`)) {
                                const updated = homeSectionsForm.filter((_, i) => i !== idx);
                                setHomeSectionsForm(updated);
                              }
                            }}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Hapus Section"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      {/* Expanded Section Detail Settings */}
                      {isExpanded && (
                        <div className="p-5 bg-slate-50 border-t border-slate-200 space-y-4 animate-fadeIn">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-[11px] font-bold text-slate-700 block mb-1">Judul Utama Tampilan</label>
                              <input
                                type="text"
                                value={sec.title || ""}
                                onChange={(e) => {
                                  const updated = [...homeSectionsForm];
                                  updated[idx] = { ...updated[idx], title: e.target.value };
                                  setHomeSectionsForm(updated);
                                }}
                                placeholder="Judul besar yang dibaca pengunjung..."
                                className="w-full p-2 bg-white border rounded-xl text-xs font-bold text-slate-900"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-slate-700 block mb-1">Badge Kategori (Pill)</label>
                              <input
                                type="text"
                                value={sec.badge || ""}
                                onChange={(e) => {
                                  const updated = [...homeSectionsForm];
                                  updated[idx] = { ...updated[idx], badge: e.target.value };
                                  setHomeSectionsForm(updated);
                                }}
                                placeholder="e.g. Fiqh Aktual / Amal Jariyah"
                                className="w-full p-2 bg-white border rounded-xl text-xs text-slate-900"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="text-[11px] font-bold text-slate-700 block mb-1">Subjudul / Deskripsi Pendukung</label>
                              <textarea
                                rows={2}
                                value={sec.subtitle || ""}
                                onChange={(e) => {
                                  const updated = [...homeSectionsForm];
                                  updated[idx] = { ...updated[idx], subtitle: e.target.value };
                                  setHomeSectionsForm(updated);
                                }}
                                placeholder="Uraian pendukung..."
                                className="w-full p-2 bg-white border rounded-xl text-xs text-slate-900"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-slate-700 block mb-1">Teks Tombol Aksi (CTA)</label>
                              <input
                                type="text"
                                value={sec.ctaText || ""}
                                onChange={(e) => {
                                  const updated = [...homeSectionsForm];
                                  updated[idx] = { ...updated[idx], ctaText: e.target.value };
                                  setHomeSectionsForm(updated);
                                }}
                                placeholder="e.g. Selengkapnya"
                                className="w-full p-2 bg-white border rounded-xl text-xs text-slate-900"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-slate-700 block mb-1">Link URL Tombol Aksi</label>
                              <input
                                type="text"
                                value={sec.ctaUrl || ""}
                                onChange={(e) => {
                                  const updated = [...homeSectionsForm];
                                  updated[idx] = { ...updated[idx], ctaUrl: e.target.value };
                                  setHomeSectionsForm(updated);
                                }}
                                placeholder="e.g. /donasi atau /artikel"
                                className="w-full p-2 bg-white border rounded-xl text-xs font-mono text-slate-900"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="text-[11px] font-bold text-slate-700 block mb-1">Banner Gambar / Foto Section</label>
                              <ImageUploader
                                value={sec.imageUrl || ""}
                                folder="umum"
                                onChange={(url) => {
                                  const updated = [...homeSectionsForm];
                                  updated[idx] = { ...updated[idx], imageUrl: url };
                                  setHomeSectionsForm(updated);
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            HALAMAN TENTANG & NARASI PROFIL
           ══════════════════════════════════════════════════════════════ */}
        {activeMenu === "aboutpage" && (
          <div className="space-y-6 text-xs">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b">
                <div>
                  <h3 className="font-serif font-bold text-lg text-emerald-950">
                    🏛️ Kelola Konten Halaman Tentang (/tentang)
                  </h3>
                  <p className="text-slate-500 text-xs mt-1">
                    Edit narasi sejarah lengkap, visi misi, dan pilar pendidikan secara dinamis tanpa tahun hardcoded.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    updateAboutPageContent(aboutForm);
                    alert("✓ Konten Halaman Tentang berhasil diperbarui!");
                  }}
                  className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow transition"
                >
                  Simpan Halaman Tentang
                </button>
              </div>

              {/* Header Box */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Badge Atas</label>
                  <input
                    type="text"
                    value={aboutForm.badge || ""}
                    onChange={(e) => setAboutForm({ ...aboutForm, badge: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-lg"
                    placeholder="Tentang Lembaga"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Judul Utama Halaman</label>
                  <input
                    type="text"
                    value={aboutForm.title || ""}
                    onChange={(e) => setAboutForm({ ...aboutForm, title: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-lg font-bold"
                    placeholder="Profil Ma'had Aly DDI Mangkoso"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subjudul Halaman</label>
                  <input
                    type="text"
                    value={aboutForm.subtitle || ""}
                    onChange={(e) => setAboutForm({ ...aboutForm, subtitle: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-lg"
                    placeholder="Mencetak Ulama Pewaris Para Nabi..."
                  />
                </div>
              </div>

              {/* Sejarah Lembaga */}
              <div className="p-5 bg-slate-50 rounded-2xl border space-y-4">
                <h4 className="font-serif font-bold text-base text-slate-900">📜 Sejarah Pendirian Lembaga</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Judul Bagian Sejarah</label>
                    <input
                      type="text"
                      value={aboutForm.historyTitle || ""}
                      onChange={(e) => setAboutForm({ ...aboutForm, historyTitle: e.target.value })}
                      className="w-full p-2.5 bg-white border rounded-lg font-bold"
                      placeholder="Sejarah Lembaga"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Teks Singkat Bahasa Arab (RTL)</label>
                    <input
                      type="text"
                      dir="rtl"
                      value={aboutForm.historyArabic || ""}
                      onChange={(e) => setAboutForm({ ...aboutForm, historyArabic: e.target.value })}
                      className="w-full p-2.5 bg-white border rounded-lg font-serif text-right text-base text-emerald-950"
                      placeholder="تَأْسِيْسُ مَعْهَدِ عَالِي..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Uraian Narasi Sejarah Lengkap (Bebas Diedit, Tanpa Tahun Hardcoded)
                  </label>
                  <textarea
                    rows={6}
                    value={aboutForm.historyNarrative || ""}
                    onChange={(e) => setAboutForm({ ...aboutForm, historyNarrative: e.target.value })}
                    className="w-full p-3 bg-white border rounded-xl leading-relaxed text-slate-800"
                    placeholder="Tuliskan uraian sejarah pendirian Ma'had Aly..."
                  />
                </div>
              </div>

              {/* Visi & Misi */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-slate-50 rounded-2xl border space-y-2">
                  <label className="block font-serif font-bold text-sm text-slate-900">Visi Kelembagaan</label>
                  <textarea
                    rows={5}
                    value={aboutForm.visi || ""}
                    onChange={(e) => setAboutForm({ ...aboutForm, visi: e.target.value })}
                    className="w-full p-2.5 bg-white border rounded-xl leading-relaxed"
                    placeholder="Tuliskan visi..."
                  />
                </div>
                <div className="p-5 bg-slate-50 rounded-2xl border space-y-2">
                  <label className="block font-serif font-bold text-sm text-slate-900">Misi Utama (Satu per baris)</label>
                  <textarea
                    rows={5}
                    value={(aboutForm.misi || []).join("\n")}
                    onChange={(e) =>
                      setAboutForm({
                        ...aboutForm,
                        misi: e.target.value.split("\n").filter((m) => m.trim().length > 0)
                      })
                    }
                    className="w-full p-2.5 bg-white border rounded-xl leading-relaxed font-sans"
                    placeholder="Tuliskan misi 1 per baris..."
                  />
                </div>
              </div>

              {/* 3 Kartu Pendidikan & Beasiswa */}
              <div className="p-5 bg-slate-50 rounded-2xl border space-y-4">
                <h4 className="font-serif font-bold text-base text-slate-900">🎓 Kartu Sistem Pendidikan &amp; Beasiswa</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-white border rounded-xl space-y-2">
                    <label className="block font-bold text-slate-700">Kartu 1: Judul</label>
                    <input
                      type="text"
                      value={aboutForm.halaqahTitle || ""}
                      onChange={(e) => setAboutForm({ ...aboutForm, halaqahTitle: e.target.value })}
                      className="w-full p-2 border rounded-lg text-xs font-bold"
                    />
                    <label className="block font-bold text-slate-700 mt-2">Deskripsi</label>
                    <textarea
                      rows={3}
                      value={aboutForm.halaqahDesc || ""}
                      onChange={(e) => setAboutForm({ ...aboutForm, halaqahDesc: e.target.value })}
                      className="w-full p-2 border rounded-lg text-xs"
                    />
                  </div>

                  <div className="p-3 bg-white border rounded-xl space-y-2">
                    <label className="block font-bold text-slate-700">Kartu 2: Judul</label>
                    <input
                      type="text"
                      value={aboutForm.beasiswaTitle || ""}
                      onChange={(e) => setAboutForm({ ...aboutForm, beasiswaTitle: e.target.value })}
                      className="w-full p-2 border rounded-lg text-xs font-bold"
                    />
                    <label className="block font-bold text-slate-700 mt-2">Deskripsi</label>
                    <textarea
                      rows={3}
                      value={aboutForm.beasiswaDesc || ""}
                      onChange={(e) => setAboutForm({ ...aboutForm, beasiswaDesc: e.target.value })}
                      className="w-full p-2 border rounded-lg text-xs"
                    />
                  </div>

                  <div className="p-3 bg-white border rounded-xl space-y-2">
                    <label className="block font-bold text-slate-700">Kartu 3: Judul</label>
                    <input
                      type="text"
                      value={aboutForm.kurikulumTitle || ""}
                      onChange={(e) => setAboutForm({ ...aboutForm, kurikulumTitle: e.target.value })}
                      className="w-full p-2 border rounded-lg text-xs font-bold"
                    />
                    <label className="block font-bold text-slate-700 mt-2">Deskripsi</label>
                    <textarea
                      rows={3}
                      value={aboutForm.kurikulumDesc || ""}
                      onChange={(e) => setAboutForm({ ...aboutForm, kurikulumDesc: e.target.value })}
                      className="w-full p-2 border rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            TEMPLATE EMAIL NOTIFIKASI (RESEND)
           ══════════════════════════════════════════════════════════════ */}
        {activeMenu === "emailtemplates" && (
          <div className="space-y-6 text-xs">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b">
                <div>
                  <h3 className="font-serif font-bold text-lg text-emerald-950">
                    ✉️ Template Email Notifikasi Otomatis (Resend)
                  </h3>
                  <p className="text-slate-500 text-xs mt-1">
                    Sesuaikan subjek dan pesan email untuk setiap tahapan naskah dan alur komunikasi.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    updateEmailTemplates(emailTemplatesForm);
                    alert("✓ Template email berhasil diperbarui ke database!");
                  }}
                  className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow transition"
                >
                  Simpan Semua Template
                </button>
              </div>

              {/* Template Pills Selector */}
              <div className="flex flex-wrap gap-2">
                {emailTemplatesForm.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => setActiveTemplateId(tmpl.id)}
                    className={`px-3.5 py-2 rounded-xl font-bold transition text-left ${
                      activeTemplateId === tmpl.id
                        ? "bg-emerald-800 text-white shadow-sm"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    <span>{tmpl.name}</span>
                    <span className="text-[10px] block opacity-75 font-normal uppercase">
                      Penerima: {tmpl.recipientRole}
                    </span>
                  </button>
                ))}
              </div>

              {/* Variable Pills Helper */}
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 space-y-2">
                <span className="font-bold text-emerald-900 block text-xs">
                  💡 Variabel yang dapat Anda gunakan di dalam Subjek maupun Isi Pesan:
                </span>
                <div className="flex flex-wrap gap-2 text-xs">
                  {[
                    { tag: "{nama}", desc: "Nama Penulis" },
                    { tag: "{judul}", desc: "Judul Naskah" },
                    { tag: "{kode}", desc: "Kode Pelacakan (MAD-YYYY-XXXX)" },
                    { tag: "{catatan}", desc: "Catatan Redaksi / Revisi" },
                    { tag: "{link}", desc: "Tautan Halaman Lacak / Artikel Terbit" }
                  ].map((v, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 bg-white border border-emerald-200 text-emerald-950 px-2.5 py-1 rounded-lg font-mono text-[11px]"
                    >
                      <strong>{v.tag}</strong>
                      <span className="text-slate-500 font-sans text-[10px]">({v.desc})</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Active Template Editor */}
              {(() => {
                const currentTmpl = emailTemplatesForm.find((t) => t.id === activeTemplateId) || emailTemplatesForm[0];
                if (!currentTmpl) return null;
                const tmplIdx = emailTemplatesForm.findIndex((t) => t.id === currentTmpl.id);

                return (
                  <div className="space-y-4 p-5 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{currentTmpl.name}</span>
                      <span className="bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded text-[11px] font-mono">
                        ID: {currentTmpl.id}
                      </span>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Subjek Email</label>
                      <input
                        type="text"
                        value={currentTmpl.subject}
                        onChange={(e) => {
                          const updated = [...emailTemplatesForm];
                          updated[tmplIdx] = { ...updated[tmplIdx], subject: e.target.value };
                          setEmailTemplatesForm(updated);
                        }}
                        className="w-full p-2.5 bg-white border rounded-xl font-bold text-slate-900"
                        placeholder="Subjek email..."
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Isi Pesan Email (Format HTML / Teks Kaya)
                      </label>
                      <textarea
                        rows={10}
                        value={currentTmpl.body}
                        onChange={(e) => {
                          const updated = [...emailTemplatesForm];
                          updated[tmplIdx] = { ...updated[tmplIdx], body: e.target.value };
                          setEmailTemplatesForm(updated);
                        }}
                        className="w-full p-3 bg-white border rounded-xl font-mono text-xs leading-relaxed text-slate-800"
                        placeholder="<p>Isi template...</p>"
                      />
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            10. EMAIL & NOTIFIKASI
           ══════════════════════════════════════════════════════════════ */}
        {activeMenu === "email" && (
          <div className="space-y-6 text-xs font-medium">
            {!isSuperAdmin ? (
              <div className="bg-red-50 p-8 rounded-2xl border border-red-200 text-center space-y-3">
                <div className="text-3xl">🔒</div>
                <h3 className="font-serif font-bold text-lg text-red-950">Akses Terbatas: Khusus Super Admin</h3>
                <p className="text-red-700 text-xs max-w-md mx-auto">
                  Menu konfigurasi email, log riwayat pengiriman, dan subscriber newsletter hanya dapat diakses oleh Super Admin.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveMenu("dashboard")}
                  className="px-5 py-2 bg-red-800 hover:bg-red-900 text-white font-bold rounded-xl text-xs transition"
                >
                  Kembali ke Dashboard
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Email Subtabs */}
                <div className="flex flex-wrap gap-2 pb-2 border-b">
                  {[
                    { id: "settings", label: "⚙️ Pengaturan & Test Kirim" },
                    { id: "templates", label: `✉️ 6 Template Notifikasi (${emailTemplatesForm.length})` },
                    { id: "logs", label: `📋 Log Riwayat Real (${emailLogs.length})` },
                    { id: "subscribers", label: `👥 Subscriber Newsletter (${subscribers.length})` }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setEmailSubTab(tab.id as any)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                        emailSubTab === tab.id
                          ? "bg-emerald-800 text-white shadow"
                          : "bg-white text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* TAB 1: Pengaturan & Test Kirim */}
                {emailSubTab === "settings" && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Setting Form */}
                    <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                      <h3 className="font-serif font-bold text-lg text-slate-900 pb-2 border-b">
                        📧 Email Utama Penerima Notifikasi Redaksi
                      </h3>
                      <form onSubmit={handleSaveSettings} className="space-y-4">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Alamat Email Utama Penerima Naskah *
                          </label>
                          <input
                            type="email"
                            required
                            value={settingsForm.emailSubmission}
                            onChange={(e) => setSettingsForm({ ...settingsForm, emailSubmission: e.target.value })}
                            className="w-full p-2.5 bg-slate-50 border rounded-lg font-mono text-xs"
                          />
                          <p className="text-[11px] text-slate-500 mt-1">
                            Default resmi: <strong>munzirahmad779@gmail.com</strong>. Seluruh berkas naskah masuk akan dikirimkan ke email ini sebagai lampiran Word.
                          </p>
                        </div>
                        <button
                          type="submit"
                          className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow transition"
                        >
                          Simpan Email Utama
                        </button>
                      </form>
                    </div>

                    {/* Test Kirim Email Nyata (Resend API) */}
                    <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                      <div className="pb-2 border-b">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                          Verifikasi Resend API
                        </span>
                        <h3 className="font-serif font-bold text-lg text-slate-900 mt-1">
                          ⚡ Uji Coba Pengiriman Email Nyata
                        </h3>
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          Kirim email tes nyata langsung ke inbox Anda via Resend API untuk memverifikasi koneksi server.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Email Penerima Uji Coba</label>
                          <input
                            type="email"
                            value={testEmailTo}
                            onChange={(e) => setTestEmailTo(e.target.value)}
                            className="w-full p-2 bg-slate-50 border rounded-lg font-mono text-xs"
                            placeholder="munzirahmad779@gmail.com"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Subjek Pesan (Opsional)</label>
                          <input
                            type="text"
                            value={testEmailSubject}
                            onChange={(e) => setTestEmailSubject(e.target.value)}
                            className="w-full p-2 bg-slate-50 border rounded-lg text-xs"
                            placeholder="[Test Resend] Uji coba notifikasi Ma'had Aly..."
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Isi Pesan Kustom (Opsional)</label>
                          <textarea
                            rows={3}
                            value={testEmailMessage}
                            onChange={(e) => setTestEmailMessage(e.target.value)}
                            className="w-full p-2 bg-slate-50 border rounded-lg text-xs"
                            placeholder="Tulis pesan pengujian kustom jika diinginkan..."
                          />
                        </div>

                        <button
                          type="button"
                          disabled={testEmailLoading}
                          onClick={async () => {
                            if (!testEmailTo) {
                              alert("Harap masukkan email tujuan!");
                              return;
                            }
                            setTestEmailLoading(true);
                            setTestEmailResult(null);
                            try {
                              const res = await fetch("/api/admin/email/test", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  to: testEmailTo,
                                  subject: testEmailSubject || undefined,
                                  message: testEmailMessage || undefined
                                })
                              });
                              const data = await res.json();
                              if (data.success) {
                                setTestEmailResult({
                                  success: true,
                                  message: data.message || "Email berhasil dikirim!",
                                  resendId: data.resendId
                                });
                              } else {
                                setTestEmailResult({
                                  success: false,
                                  message: data.error || "Gagal mengirim email test."
                                });
                              }
                            } catch (err: any) {
                              setTestEmailResult({
                                success: false,
                                message: err.message || "Terjadi kesalahan jaringan."
                              });
                            } finally {
                              setTestEmailLoading(false);
                            }
                          }}
                          className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow transition flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {testEmailLoading ? (
                            <>
                              <span className="animate-spin text-sm">⏳</span>
                              <span>Menghubungi Resend API...</span>
                            </>
                          ) : (
                            <>
                              <span>⚡</span>
                              <span>Kirim Test Email Sekarang</span>
                            </>
                          )}
                        </button>

                        {/* Real Status Feedback */}
                        {testEmailResult && (
                          <div
                            className={`p-4 rounded-xl border animate-in fade-in duration-200 ${
                              testEmailResult.success
                                ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                                : "bg-red-50 border-red-300 text-red-950"
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <span className="text-base">{testEmailResult.success ? "🟢" : "🔴"}</span>
                              <div className="space-y-1">
                                <strong className="block font-bold">
                                  {testEmailResult.success ? "Email Berhasil Terkirim ke Inbox!" : "Pengiriman Gagal"}
                                </strong>
                                <p className="text-xs leading-relaxed">{testEmailResult.message}</p>
                                {testEmailResult.resendId && (
                                  <p className="text-[11px] font-mono text-emerald-800 bg-white p-1 rounded border border-emerald-200 mt-1 inline-block">
                                    Resend Message ID: {testEmailResult.resendId}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: 6 Template Email */}
                {emailSubTab === "templates" && (
                  <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b">
                      <div>
                        <h3 className="font-serif font-bold text-lg text-emerald-950">
                          ✉️ 6 Template Email Notifikasi Otomatis (Resend)
                        </h3>
                        <p className="text-slate-500 text-xs mt-1">
                          Sesuaikan subjek dan pesan email untuk setiap tahapan naskah dan alur komunikasi.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          updateEmailTemplates(emailTemplatesForm);
                          alert("✓ 6 Template email berhasil diperbarui ke database!");
                        }}
                        className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow transition"
                      >
                        Simpan Semua Template
                      </button>
                    </div>

                    {/* Template Pills Selector */}
                    <div className="flex flex-wrap gap-2">
                      {emailTemplatesForm.map((tmpl) => (
                        <button
                          key={tmpl.id}
                          type="button"
                          onClick={() => setActiveTemplateId(tmpl.id)}
                          className={`px-3.5 py-2 rounded-xl font-bold transition text-left ${
                            activeTemplateId === tmpl.id
                              ? "bg-emerald-800 text-white shadow-sm"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                          }`}
                        >
                          <span>{tmpl.name}</span>
                          <span className="text-[10px] block opacity-75 font-normal uppercase">
                            Penerima: {tmpl.recipientRole}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Variable Pills Helper */}
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 space-y-2">
                      <span className="font-bold text-emerald-900 block text-xs">
                        💡 Variabel yang dapat Anda gunakan di dalam Subjek maupun Isi Pesan:
                      </span>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {[
                          { tag: "{nama}", desc: "Nama Penulis" },
                          { tag: "{judul}", desc: "Judul Naskah" },
                          { tag: "{kode}", desc: "Kode Pelacakan / Akses (MAD-YYYY-XXXX / MAD2-...)" },
                          { tag: "{catatan}", desc: "Catatan Redaksi / Revisi" },
                          { tag: "{link}", desc: "Tautan Halaman Lacak / Artikel Terbit" }
                        ].map((v, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1.5 bg-white border border-emerald-200 text-emerald-950 px-2.5 py-1 rounded-lg font-mono text-[11px]"
                          >
                            <strong>{v.tag}</strong>
                            <span className="text-slate-500 font-sans text-[10px]">({v.desc})</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Active Template Editor */}
                    {(() => {
                      const currentTmpl = emailTemplatesForm.find((t) => t.id === activeTemplateId) || emailTemplatesForm[0];
                      if (!currentTmpl) return null;
                      const tmplIdx = emailTemplatesForm.findIndex((t) => t.id === currentTmpl.id);

                      return (
                        <div className="space-y-4 p-5 bg-slate-50 rounded-2xl border border-slate-200">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-sm">{currentTmpl.name}</span>
                            <span className="bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded text-[11px] font-mono">
                              ID: {currentTmpl.id}
                            </span>
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 mb-1">Subjek Email</label>
                            <input
                              type="text"
                              value={currentTmpl.subject}
                              onChange={(e) => {
                                const updated = [...emailTemplatesForm];
                                updated[tmplIdx] = { ...updated[tmplIdx], subject: e.target.value };
                                setEmailTemplatesForm(updated);
                              }}
                              className="w-full p-2.5 bg-white border rounded-xl font-bold text-slate-900"
                              placeholder="Subjek email..."
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 mb-1">
                              Isi Pesan Email (Format HTML / Teks Kaya)
                            </label>
                            <textarea
                              rows={10}
                              value={currentTmpl.body}
                              onChange={(e) => {
                                const updated = [...emailTemplatesForm];
                                updated[tmplIdx] = { ...updated[tmplIdx], body: e.target.value };
                                setEmailTemplatesForm(updated);
                              }}
                              className="w-full p-3 bg-white border rounded-xl font-mono text-xs leading-relaxed text-slate-800"
                              placeholder="<p>Isi template...</p>"
                            />
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* TAB 3: Log Riwayat Real */}
                {emailSubTab === "logs" && (
                  <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b">
                      <div>
                        <h3 className="font-serif font-bold text-lg text-slate-900">
                          📋 Log Riwayat Notifikasi Email Real ({emailLogs.length})
                        </h3>
                        <p className="text-slate-500 text-xs">
                          Mencatat status pengiriman nyata dari Resend API beserta detail error jika gagal.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {emailLogs.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border">
                          Belum ada aktivitas pengiriman email yang tercatat.
                        </div>
                      ) : (
                        emailLogs.map((log) => {
                          const isSuccess = log.status === "Terkirim";
                          return (
                            <div
                              key={log.id}
                              className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs transition ${
                                isSuccess ? "bg-slate-50 border-slate-200" : "bg-red-50/50 border-red-200"
                              }`}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <strong className="text-emerald-950 font-bold font-mono">{log.to}</strong>
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      isSuccess ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {isSuccess ? "🟢 Terkirim" : "🔴 Gagal"}
                                  </span>
                                  {log.resendId && (
                                    <span className="text-[10px] font-mono text-slate-400">ID: {log.resendId}</span>
                                  )}
                                </div>
                                <p className="font-semibold text-slate-800">{log.subject}</p>
                                {log.errorReason && (
                                  <p className="text-[11px] text-red-600 bg-red-100/60 p-1.5 rounded-lg border border-red-200 font-mono mt-1">
                                    Error: {log.errorReason}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                                <span className="text-slate-400 text-[11px]">{log.timestamp}</span>
                                {!isSuccess && (
                                  <button
                                    type="button"
                                    disabled={retryingLogId === log.id}
                                    onClick={async () => {
                                      setRetryingLogId(log.id);
                                      const res = await retryEmailSend(log.id);
                                      setRetryingLogId(null);
                                      if (res.success) {
                                        alert(`✓ Email berhasil dikirim ulang! Resend ID: ${res.id}`);
                                      } else {
                                        alert(`⚠️ Pengiriman ulang gagal: ${res.error}`);
                                      }
                                    }}
                                    className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shadow-sm disabled:opacity-50 flex items-center gap-1"
                                  >
                                    {retryingLogId === log.id ? "Mengirim..." : "🔄 Coba Kirim Ulang"}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 4: Subscriber Newsletter */}
                {emailSubTab === "subscribers" && (
                  <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b flex-wrap gap-2">
                      <div>
                        <h3 className="font-serif font-bold text-lg text-slate-900">
                          👥 Pelanggan Newsletter Ma&apos;had Aly ({subscribers.length})
                        </h3>
                        <p className="text-slate-500 text-xs">
                          Daftar pembaca yang berlangganan warta dan mimbar kajian ilmiah melalui formulir footer.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const csvContent =
                            "data:text/csv;charset=utf-8," +
                            ["Email,Tanggal Berlangganan"]
                              .concat(subscribers.map((s) => `${s.email},${s.subscribedAt || ""}`))
                              .join("\n");
                          const encodedUri = encodeURI(csvContent);
                          const link = document.createElement("a");
                          link.setAttribute("href", encodedUri);
                          link.setAttribute("download", `subscribers_mahad_aly_${new Date().toISOString().slice(0, 10)}.csv`);
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow"
                      >
                        <span>📥</span>
                        <span>Ekspor CSV</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {subscribers.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border">
                          Belum ada pelanggan newsletter.
                        </div>
                      ) : (
                        subscribers.map((sub, idx) => (
                          <div
                            key={sub.id || idx}
                            className="p-3 bg-slate-50 rounded-xl border flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-slate-400 font-bold">{idx + 1}.</span>
                              <strong className="text-slate-900 font-mono">{sub.email}</strong>
                              <span className="text-slate-400 text-[11px]">{sub.subscribedAt || "Terdaftar"}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Hapus subscriber "${sub.email}"?`)) {
                                  deleteSubscriber(sub.id);
                                }
                              }}
                              className="px-2.5 py-1 text-red-600 hover:bg-red-50 rounded text-xs font-bold"
                            >
                              Hapus
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
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
            11.5. RIWAYAT PERUBAHAN & AUDIT TRAIL (KHUSUS SUPER ADMIN)
           ══════════════════════════════════════════════════════════════ */}
        {activeMenu === "auditlogs" && (
          <div className="space-y-6 text-xs">
            {!isSuperAdmin ? (
              <div className="bg-red-50 p-8 rounded-2xl border border-red-200 text-center space-y-3">
                <div className="text-3xl">🔒</div>
                <h3 className="font-serif font-bold text-lg text-red-950">Akses Terbatas: Khusus Super Admin</h3>
                <p className="text-red-700 text-xs max-w-md mx-auto">
                  Laporan riwayat audit perubahan dan aktivitas admin hanya dapat diakses oleh Super Admin demi keamanan &amp; akuntabilitas data.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveMenu("dashboard")}
                  className="px-5 py-2 bg-red-800 hover:bg-red-900 text-white font-bold rounded-xl text-xs transition"
                >
                  Kembali ke Dashboard
                </button>
              </div>
            ) : (
              <>
                {/* Header Card */}
                <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🔒</span>
                      <h2 className="text-lg font-serif font-bold text-slate-900">
                        Riwayat Perubahan &amp; Audit Trail Aktivitas Admin
                      </h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        Khusus Super Admin
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs">
                      Merekam secara kronologis setiap aktivitas penerbitan, pengeditan, penghapusan, dan reset pengaturan oleh seluruh admin dan redaksi.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleExportAuditLogsCsv}
                      className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm"
                      title="Unduh seluruh rekap riwayat perubahan dalam format berkas CSV / Excel"
                    >
                      <span>📥</span>
                      <span>Unduh Laporan CSV</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => confirmAndReset("Arsip Log Aktivitas", clearActivityLogs)}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
                      title="Hapus riwayat log lama dan mulai pencatatan bersih baru"
                    >
                      <span>🗑️</span>
                      <span>Kosongkan Log</span>
                    </button>
                  </div>
                </div>

                {/* Metrics Summary Cards */}
                {(() => {
                  const totalLogs = logs.length;
                  const deleteLogs = logs.filter((l) => /hapus|delete|membersihkan/i.test(l.action)).length;
                  const updateLogs = logs.filter((l) => /update|edit|ubah|perbarui/i.test(l.action)).length;
                  const createLogs = logs.filter((l) => /tambah|terbit|buat|unggah|add/i.test(l.action)).length;
                  const resetLogs = logs.filter((l) => /reset|standar/i.test(l.action)).length;

                  return (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Total Aktivitas</span>
                        <p className="text-2xl font-bold text-slate-800 font-serif">{totalLogs}</p>
                        <p className="text-[10px] text-slate-500">Tercatat di sistem</p>
                      </div>
                      <div className="p-4 bg-white rounded-xl border border-emerald-200 shadow-sm space-y-1">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase">Penambahan / Terbit</span>
                        <p className="text-2xl font-bold text-emerald-700 font-serif">{createLogs}</p>
                        <p className="text-[10px] text-emerald-600">Konten baru</p>
                      </div>
                      <div className="p-4 bg-white rounded-xl border border-amber-200 shadow-sm space-y-1">
                        <span className="text-[10px] font-bold text-amber-600 uppercase">Perubahan / Edit</span>
                        <p className="text-2xl font-bold text-amber-700 font-serif">{updateLogs}</p>
                        <p className="text-[10px] text-amber-600">Modifikasi data</p>
                      </div>
                      <div className="p-4 bg-white rounded-xl border border-rose-200 shadow-sm space-y-1">
                        <span className="text-[10px] font-bold text-rose-600 uppercase">Penghapusan Data</span>
                        <p className="text-2xl font-bold text-rose-700 font-serif">{deleteLogs}</p>
                        <p className="text-[10px] text-rose-600">Objek terhapus</p>
                      </div>
                      <div className="p-4 bg-white rounded-xl border border-blue-200 shadow-sm space-y-1 col-span-2 md:col-span-1">
                        <span className="text-[10px] font-bold text-blue-600 uppercase">Reset ke Standar</span>
                        <p className="text-2xl font-bold text-blue-700 font-serif">{resetLogs}</p>
                        <p className="text-[10px] text-blue-600">Pemulihan default</p>
                      </div>
                    </div>
                  );
                })()}

                {/* Filter and Search Bar */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                    <input
                      type="text"
                      value={auditSearch}
                      onChange={(e) => setAuditSearch(e.target.value)}
                      placeholder="Cari berdasarkan nama admin, aksi, atau target objek..."
                      className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 outline-none"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      { id: "all", label: "Semua Aksi" },
                      { id: "create", label: "➕ Tambah / Terbit" },
                      { id: "update", label: "✏️ Ubah / Edit" },
                      { id: "delete", label: "🗑️ Hapus" },
                      { id: "reset", label: "🔄 Reset Standar" }
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        type="button"
                        onClick={() => setAuditActionFilter(btn.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                          auditActionFilter === btn.id
                            ? "bg-slate-800 text-white shadow-sm"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Logs Table */}
                {(() => {
                  const filteredLogs = logs.filter((log) => {
                    const q = auditSearch.toLowerCase();
                    const matchesSearch =
                      !auditSearch ||
                      log.action.toLowerCase().includes(q) ||
                      log.target.toLowerCase().includes(q) ||
                      log.user.toLowerCase().includes(q) ||
                      log.timestamp.toLowerCase().includes(q);

                    let matchesType = true;
                    if (auditActionFilter === "create") {
                      matchesType = /tambah|terbit|buat|unggah|add/i.test(log.action);
                    } else if (auditActionFilter === "update") {
                      matchesType = /update|edit|ubah|perbarui/i.test(log.action);
                    } else if (auditActionFilter === "delete") {
                      matchesType = /hapus|delete|membersihkan/i.test(log.action);
                    } else if (auditActionFilter === "reset") {
                      matchesType = /reset|standar/i.test(log.action);
                    }

                    return matchesSearch && matchesType;
                  });

                  if (filteredLogs.length === 0) {
                    return (
                      <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-2">
                        <span className="text-3xl">📭</span>
                        <h4 className="font-bold text-slate-700">Tidak ada catatan log ditemukan</h4>
                        <p className="text-slate-400 text-xs">
                          {auditSearch ? "Coba ubah kata kunci pencarian Anda." : "Belum ada aktivitas yang dicatat di sistem."}
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="overflow-x-auto max-h-[700px] overflow-y-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                            <tr>
                              <th className="py-3 px-4 w-12 text-center">No</th>
                              <th className="py-3 px-4 w-44">Waktu &amp; Tanggal</th>
                              <th className="py-3 px-4 w-48">Pelaku / Admin</th>
                              <th className="py-3 px-4 w-48">Tindakan / Aksi</th>
                              <th className="py-3 px-4">Target Objek / Keterangan</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {filteredLogs.map((log, idx) => {
                              const isDelete = /hapus|delete|membersihkan/i.test(log.action);
                              const isUpdate = /update|edit|ubah|perbarui/i.test(log.action);
                              const isCreate = /tambah|terbit|buat|unggah|add/i.test(log.action);
                              const isReset = /reset|standar/i.test(log.action);

                              return (
                                <tr key={log.id || idx} className="hover:bg-slate-50/80 transition">
                                  <td className="py-3 px-4 text-center text-slate-400 font-mono text-[11px]">
                                    {idx + 1}
                                  </td>
                                  <td className="py-3 px-4 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                                    {log.timestamp}
                                  </td>
                                  <td className="py-3 px-4 whitespace-nowrap">
                                    <div className="flex items-center gap-1.5">
                                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                      <span className="font-semibold text-slate-800">{log.user || "Admin"}</span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 whitespace-nowrap">
                                    <span
                                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                        isDelete
                                          ? "bg-rose-100 text-rose-800 border border-rose-200"
                                          : isReset
                                          ? "bg-blue-100 text-blue-800 border border-blue-200"
                                          : isUpdate
                                          ? "bg-amber-100 text-amber-900 border border-amber-200"
                                          : isCreate
                                          ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                                          : "bg-slate-100 text-slate-700 border border-slate-200"
                                      }`}
                                    >
                                      {isDelete && "🗑️ "}
                                      {isReset && "🔄 "}
                                      {isUpdate && "✏️ "}
                                      {isCreate && "➕ "}
                                      {log.action}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-slate-700 font-medium break-words">
                                    {log.target}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      <div className="p-3 bg-slate-50 border-t border-slate-200 text-slate-500 text-[11px] flex items-center justify-between">
                        <span>Menampilkan {filteredLogs.length} dari {logs.length} catatan aktivitas</span>
                        <span className="italic">Data otomatis tersimpan &amp; siap diunduh ke CSV</span>
                      </div>
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            11.6. PROGRAM DONASI, WAKAF & REKENING RESMI
           ══════════════════════════════════════════════════════════════ */}
        {activeMenu === "donations" && (
          <div className="space-y-6 text-xs">
            {!hasDonationAccess ? (
              <div className="bg-amber-50 p-8 rounded-3xl border border-amber-200 text-center space-y-4 max-w-2xl mx-auto my-8 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center text-3xl mx-auto">
                  🔒
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif font-bold text-xl text-amber-950">
                    Akses Dibatasi: Memerlukan Izin Khusus Super Admin
                  </h3>
                  <p className="text-amber-800 text-xs leading-relaxed max-w-lg mx-auto">
                    Pengelolaan rekening perbankan, penambahan program open donasi baru, serta pengubahan data nominal infaq/wakaf merupakan area sensitif keuangan lembaga yang hanya dapat dikelola oleh Super Admin atau admin dengan izin delegasi khusus.
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      addLog("Mengajukan Permintaan Akses Kelola Donasi", "Modul Donasi & Rekening", currentUserName);
                      alert("✓ Permintaan akses telah dicatat ke log sistem dan diajukan ke Super Admin!");
                    }}
                    className="px-5 py-2.5 rounded-xl font-bold bg-amber-700 hover:bg-amber-800 text-white shadow transition flex items-center gap-2"
                  >
                    <span>📨</span>
                    <span>Minta Izin Akses ke Super Admin</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMenu("dashboard")}
                    className="px-5 py-2.5 rounded-xl font-bold bg-white text-slate-700 hover:bg-slate-100 border border-slate-300 transition"
                  >
                    Kembali ke Dashboard
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Header & Subtabs */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">💰</span>
                      <h2 className="text-lg font-serif font-bold text-slate-900">
                        Manajemen Program Donasi, Wakaf &amp; Infaq Lembaga
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                        {isSuperAdmin ? "Super Admin" : "Akses Khusus Diberikan"}
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs">
                      Kelola donasi risalah short course Mesir, pengembangan website, orang tua asuh santri, serta rekening resmi perbankan.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href="/donasi"
                      target="_blank"
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition"
                    >
                      <span>🌐</span>
                      <span>Lihat Halaman Publik (/donasi)</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => confirmAndReset("Program Donasi & Rekening", resetDonationsToDefault)}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
                    >
                      <span>🔄</span>
                      <span>Reset Donasi ke Standar</span>
                    </button>
                  </div>
                </div>

                {/* Subtabs Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setDonationTab("list")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        donationTab === "list"
                          ? "bg-emerald-800 text-white shadow-sm"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      <span>📋</span>
                      <span>Daftar Program ({donations.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingDonationId(null);
                        setDonationForm({
                          title: "",
                          category: "short_course_mesir",
                          categoryLabel: "Short Course & Risalah Mesir",
                          shortDesc: "",
                          story: "",
                          targetAmount: 0,
                          collectedAmount: 0,
                          donorCount: 0,
                          deadline: "Terbuka Berkelanjutan",
                          imageUrl: "",
                          proposalUrl: "",
                          proposalName: "",
                          proposalSize: "",
                          bankAccounts: [
                            { id: "b1", bankName: "Bank Syariah Indonesia (BSI)", accountNumber: "", accountHolder: "Ma'had Aly DDI Mangkoso" }
                          ],
                          contactPersonName: "Bendahara / Admin Donasi",
                          contactPersonPhone: "6281234567890",
                          isActive: true,
                          isFeatured: false
                        });
                        setDonationTab("form");
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        donationTab === "form" && !editingDonationId
                          ? "bg-emerald-800 text-white shadow-sm"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      <span>➕</span>
                      <span>Buat Program Baru</span>
                    </button>
                    {isSuperAdmin && (
                      <button
                        type="button"
                        onClick={() => setDonationTab("permissions")}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          donationTab === "permissions"
                            ? "bg-emerald-800 text-white shadow-sm"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                        }`}
                      >
                        <span>🔑</span>
                        <span>Delegasi Izin Admin Donasi</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Subtab Content: List */}
                {donationTab === "list" && (
                  <div className="space-y-6">
                    {/* Category Filter */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {[
                        { id: "all", label: "Semua Kategori" },
                        { id: "short_course_mesir", label: "✈️ Short Course Mesir" },
                        { id: "web_dev", label: "💻 Pengembangan Web" },
                        { id: "orang_tua_asuh", label: "🤝 Orang Tua Angkat" },
                        { id: "operasional_umum", label: "🏛️ Infaq & Sarana Ma'had" }
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setDonationFilterCategory(cat.id as any)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            donationFilterCategory === cat.id
                              ? "bg-slate-800 text-white shadow-sm"
                              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>

                    {/* Program Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {donations
                        .filter((p) => donationFilterCategory === "all" || p.category === donationFilterCategory)
                        .map((prog) => (
                          <div
                            key={prog.id}
                            className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4 flex flex-col justify-between"
                          >
                            <div className="space-y-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900">
                                      {prog.categoryLabel}
                                    </span>
                                    {prog.isFeatured && (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                                        ⭐ Utama
                                      </span>
                                    )}
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      prog.isActive ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"
                                    }`}>
                                      {prog.isActive ? "Aktif" : "Nonaktif"}
                                    </span>
                                  </div>
                                  <h3 className="font-serif font-bold text-base text-slate-900 leading-snug">
                                    {prog.title}
                                  </h3>
                                </div>
                                {prog.imageUrl && (
                                  <img
                                    src={prog.imageUrl}
                                    alt={prog.title}
                                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200"
                                  />
                                )}
                              </div>

                              <p className="text-slate-600 text-xs line-clamp-2">{prog.shortDesc}</p>

                              {/* Target vs Terkumpul */}
                              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5">
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-500">Terkumpul:</span>
                                  <span className="font-bold text-emerald-800 font-serif">
                                    Rp {(prog.collectedAmount || 0).toLocaleString("id-ID")}
                                  </span>
                                </div>
                                {prog.targetAmount && prog.targetAmount > 0 ? (
                                  <div className="flex justify-between items-center text-[11px] text-slate-500">
                                    <span>Target: Rp {prog.targetAmount.toLocaleString("id-ID")}</span>
                                    <span className="font-bold text-emerald-700">
                                      {Math.round(((prog.collectedAmount || 0) / prog.targetAmount) * 100)}% ({prog.donorCount || 0} donatur)
                                    </span>
                                  </div>
                                ) : (
                                  <p className="text-[11px] text-slate-500 italic">Infaq terbuka berkelanjutan ({prog.donorCount || 0} donatur)</p>
                                )}
                              </div>

                              {/* Bank Accounts */}
                              <div className="space-y-1">
                                <span className="text-[10px] uppercase font-bold text-slate-400">Rekening:</span>
                                <div className="space-y-1">
                                  {prog.bankAccounts.map((b) => (
                                    <div key={b.id} className="text-[11px] flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                                      <span className="font-semibold text-slate-800">{b.bankName}</span>
                                      <span className="font-mono text-emerald-900 font-bold">{b.accountNumber}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Card Actions */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                              <button
                                type="button"
                                onClick={() => handleEditDonationClick(prog)}
                                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-800 text-white hover:bg-slate-900 transition flex items-center gap-1"
                              >
                                <span>✏️</span>
                                <span>Edit Program &amp; Rekening</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Hapus program donasi "${prog.title}"?`)) {
                                    deleteDonation(prog.id, currentUserName);
                                    alert("✓ Program donasi berhasil dihapus.");
                                  }
                                }}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-700 hover:bg-rose-50 border border-rose-200 transition"
                              >
                                🗑️ Hapus
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Subtab Content: Form (Tambah / Edit) */}
                {donationTab === "form" && (
                  <form onSubmit={handleSaveDonation} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div className="space-y-0.5">
                        <h3 className="font-serif font-bold text-lg text-slate-900">
                          {editingDonationId ? "✏️ Edit Program Donasi & Rekening" : "➕ Tambah Program Donasi Baru"}
                        </h3>
                        <p className="text-slate-500 text-xs">
                          Lengkapi detail program, target penggalangan dana, serta nomor rekening perbankan resmi.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDonationTab("list")}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                      >
                        Batal
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2 space-y-1">
                        <label className="text-xs font-bold text-slate-700">Judul Program Donasi *</label>
                        <input
                          type="text"
                          required
                          value={donationForm.title}
                          onChange={(e) => setDonationForm({ ...donationForm, title: e.target.value })}
                          placeholder="contoh: Donasi Risalah Ilmiah & Short Course Mesir"
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Kategori Program *</label>
                        <select
                          value={donationForm.category}
                          onChange={(e) => {
                            const cat = e.target.value as DonationCategoryKey;
                            const label =
                              cat === "short_course_mesir"
                                ? "Short Course & Risalah Mesir"
                                : cat === "web_dev"
                                ? "Pengembangan Web & IT"
                                : cat === "orang_tua_asuh"
                                ? "Orang Tua Angkat"
                                : cat === "operasional_umum"
                                ? "Infaq & Sarana Ma'had"
                                : "Program Donasi";
                            setDonationForm({ ...donationForm, category: cat, categoryLabel: label });
                          }}
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 outline-none"
                        >
                          <option value="short_course_mesir">✈️ Short Course Mesir</option>
                          <option value="web_dev">💻 Pengembangan Web &amp; IT</option>
                          <option value="orang_tua_asuh">🤝 Orang Tua Angkat Mahasantri</option>
                          <option value="operasional_umum">🏛️ Infaq &amp; Sarana Ma&apos;had</option>
                          <option value="lainnya">📦 Program Lainnya</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Batas Waktu (Deadline)</label>
                        <input
                          type="text"
                          value={donationForm.deadline}
                          onChange={(e) => setDonationForm({ ...donationForm, deadline: e.target.value })}
                          placeholder="contoh: 31 Desember 2026 atau Terbuka Berkelanjutan"
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Target Dana (Rp) - 0 jika tanpa target</label>
                        <input
                          type="number"
                          value={donationForm.targetAmount}
                          onChange={(e) => setDonationForm({ ...donationForm, targetAmount: Number(e.target.value) })}
                          placeholder="100000000"
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Realisasi Dana Terkumpul (Rp)</label>
                        <input
                          type="number"
                          value={donationForm.collectedAmount}
                          onChange={(e) => setDonationForm({ ...donationForm, collectedAmount: Number(e.target.value) })}
                          placeholder="45000000"
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Jumlah Donatur / Muhsinin</label>
                        <input
                          type="number"
                          value={donationForm.donorCount}
                          onChange={(e) => setDonationForm({ ...donationForm, donorCount: Number(e.target.value) })}
                          placeholder="25"
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Narahubung WhatsApp (Nama &amp; Nomor)</label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={donationForm.contactPersonName}
                            onChange={(e) => setDonationForm({ ...donationForm, contactPersonName: e.target.value })}
                            placeholder="Nama Panitia/Bendahara"
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 outline-none"
                          />
                          <input
                            type="text"
                            value={donationForm.contactPersonPhone}
                            onChange={(e) => setDonationForm({ ...donationForm, contactPersonPhone: e.target.value })}
                            placeholder="6281234567890"
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 outline-none"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2 space-y-1">
                        <label className="text-xs font-bold text-slate-700">Ringkasan Singkat (Short Description) *</label>
                        <textarea
                          rows={2}
                          required
                          value={donationForm.shortDesc}
                          onChange={(e) => setDonationForm({ ...donationForm, shortDesc: e.target.value })}
                          placeholder="Deskripsi singkat yang tampil pada kartu ringkasan program..."
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 outline-none"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-1">
                        <label className="text-xs font-bold text-slate-700">Cerita / Latar Belakang Lengkap Program</label>
                        <textarea
                          rows={4}
                          value={donationForm.story}
                          onChange={(e) => setDonationForm({ ...donationForm, story: e.target.value })}
                          placeholder="Uraian lengkap peruntukan program, urgensi, dan akad penyaluran..."
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 outline-none"
                        />
                      </div>

                      {/* Image Uploader */}
                      <div className="md:col-span-2 space-y-1">
                        <label className="text-xs font-bold text-slate-700">Banner Foto Program (Upload / URL)</label>
                        <ImageUploader
                          value={donationForm.imageUrl}
                          folder="donasi"
                          onChange={(url) => setDonationForm({ ...donationForm, imageUrl: url })}
                        />
                      </div>

                      {/* Proposal Document Link */}
                      <div className="md:col-span-2 space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                        <span className="text-xs font-bold text-slate-800 block">📄 Lampiran Dokumen / Proposal Program (PDF)</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={donationForm.proposalUrl}
                            onChange={(e) => setDonationForm({ ...donationForm, proposalUrl: e.target.value })}
                            placeholder="URL Berkas / Google Drive Link Proposal..."
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 outline-none"
                          />
                          <input
                            type="text"
                            value={donationForm.proposalName}
                            onChange={(e) => setDonationForm({ ...donationForm, proposalName: e.target.value })}
                            placeholder="Nama File (contoh: Proposal_Mesir_2026.pdf)"
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 outline-none"
                          />
                        </div>
                      </div>

                      {/* Bank Accounts Builder */}
                      <div className="md:col-span-2 space-y-3 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-950">💳 Pengaturan Rekening Bank Resmi Program</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newBank: BankAccount = {
                                id: "b-" + Date.now().toString(),
                                bankName: "Bank Syariah Indonesia (BSI)",
                                accountNumber: "",
                                accountHolder: "Ma'had Aly DDI Mangkoso"
                              };
                              setDonationForm({
                                ...donationForm,
                                bankAccounts: [...donationForm.bankAccounts, newBank]
                              });
                            }}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-800 text-white hover:bg-emerald-900 transition"
                          >
                            + Tambah Rekening
                          </button>
                        </div>

                        <div className="space-y-2.5">
                          {donationForm.bankAccounts.map((bank, bIdx) => (
                            <div key={bank.id || bIdx} className="p-3 bg-white rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                              <div className="sm:col-span-4">
                                <input
                                  type="text"
                                  value={bank.bankName}
                                  onChange={(e) => {
                                    const next = [...donationForm.bankAccounts];
                                    next[bIdx].bankName = e.target.value;
                                    setDonationForm({ ...donationForm, bankAccounts: next });
                                  }}
                                  placeholder="Nama Bank (BSI, BCA, dll)"
                                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                                />
                              </div>
                              <div className="sm:col-span-4">
                                <input
                                  type="text"
                                  value={bank.accountNumber}
                                  onChange={(e) => {
                                    const next = [...donationForm.bankAccounts];
                                    next[bIdx].accountNumber = e.target.value;
                                    setDonationForm({ ...donationForm, bankAccounts: next });
                                  }}
                                  placeholder="Nomor Rekening"
                                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-mono"
                                />
                              </div>
                              <div className="sm:col-span-3">
                                <input
                                  type="text"
                                  value={bank.accountHolder}
                                  onChange={(e) => {
                                    const next = [...donationForm.bankAccounts];
                                    next[bIdx].accountHolder = e.target.value;
                                    setDonationForm({ ...donationForm, bankAccounts: next });
                                  }}
                                  placeholder="Atas Nama (a.n.)"
                                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                                />
                              </div>
                              <div className="sm:col-span-1 text-center">
                                {donationForm.bankAccounts.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const next = donationForm.bankAccounts.filter((_, idx) => idx !== bIdx);
                                      setDonationForm({ ...donationForm, bankAccounts: next });
                                    }}
                                    className="text-rose-600 hover:text-rose-800 text-sm font-bold"
                                    title="Hapus rekening"
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Toggles */}
                      <div className="flex items-center gap-6 pt-2 md:col-span-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={donationForm.isActive}
                            onChange={(e) => setDonationForm({ ...donationForm, isActive: e.target.checked })}
                            className="w-4 h-4 text-emerald-800 rounded focus:ring-emerald-700"
                          />
                          <span className="text-xs font-bold text-slate-800">Aktifkan &amp; Tampilkan di Web</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={donationForm.isFeatured}
                            onChange={(e) => setDonationForm({ ...donationForm, isFeatured: e.target.checked })}
                            className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                          />
                          <span className="text-xs font-bold text-slate-800">Jadikan Program Pilihan (Featured)</span>
                        </label>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setDonationTab("list")}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-800 hover:bg-emerald-900 text-white shadow-sm transition"
                      >
                        {editingDonationId ? "Simpan Perubahan Program" : "Terbitkan Program Donasi"}
                      </button>
                    </div>
                  </form>
                )}

                {/* Subtab Content: Permissions Delegation (Super Admin Only) */}
                {donationTab === "permissions" && isSuperAdmin && (
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <div className="space-y-1">
                      <h3 className="font-serif font-bold text-lg text-slate-900">
                        🔑 Hak Akses Delegasi Donasi untuk Administrator
                      </h3>
                      <p className="text-slate-500 text-xs">
                        Hanya admin yang diberikan izin di bawah ini yang dapat mengubah rekening bank dan menambah program open donasi di portal.
                      </p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                            <th className="py-3 px-4">Nama Administrator</th>
                            <th className="py-3 px-4">Email</th>
                            <th className="py-3 px-4">Peran (Role)</th>
                            <th className="py-3 px-4">Status Izin Donasi</th>
                            <th className="py-3 px-4 text-right">Tindakan Delegasi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {dbUsers.map((u) => {
                            const isSuper = u.role === "super_admin" || u.email === "munzirahmad779@gmail.com";
                            const hasPerm = isSuper || Boolean(u.permissions?.canManageDonations);

                            return (
                              <tr key={u.id} className="hover:bg-slate-50 transition">
                                <td className="py-3 px-4 font-bold text-slate-800">{u.nama_lengkap || u.name || "Admin"}</td>
                                <td className="py-3 px-4 font-mono text-slate-600">{u.email}</td>
                                <td className="py-3 px-4">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    isSuper ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-900"
                                  }`}>
                                    {u.role || "Admin"}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                    hasPerm ? "bg-emerald-100 text-emerald-900" : "bg-slate-100 text-slate-600"
                                  }`}>
                                    {hasPerm ? "✓ Diizinkan Mengelola" : "🔒 Akses Terkunci"}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  {isSuper ? (
                                    <span className="text-[11px] text-slate-400 italic">Super Admin Otomatis Aktif</span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        grantDonationPermission(u.id, !hasPerm, currentUserName);
                                        // Update local state if needed
                                        const updatedUsers = dbUsers.map((item) =>
                                          item.id === u.id
                                            ? { ...item, permissions: { ...item.permissions, canManageDonations: !hasPerm } }
                                            : item
                                        );
                                        setDbUsers(updatedUsers);
                                        alert(`✓ Izin kelola donasi untuk ${u.email} berhasil ${!hasPerm ? "diberikan" : "dicabut"}!`);
                                      }}
                                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                                        hasPerm
                                          ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                                          : "bg-emerald-800 text-white hover:bg-emerald-900"
                                      }`}
                                    >
                                      {hasPerm ? "Cabut Izin" : "Beri Izin Akses"}
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            11.7. PUSAT PERTAHANAN SIBER & DETEKSI ANCAMAN (ANTI-HACK)
           ══════════════════════════════════════════════════════════════ */}
        {activeMenu === "security" && (
          <div className="space-y-6 text-xs">
            {!isSuperAdmin ? (
              <div className="bg-red-50 p-8 rounded-2xl border border-red-200 text-center space-y-3">
                <div className="text-3xl">🛡️</div>
                <h3 className="font-serif font-bold text-lg text-red-950">Akses Terbatas: Khusus Super Admin</h3>
                <p className="text-red-700 text-xs max-w-md mx-auto">
                  Pusat kendali pertahanan keamanan siber dan pemantauan ancaman hanya dapat diakses oleh Super Admin.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveMenu("dashboard")}
                  className="px-5 py-2 bg-red-800 hover:bg-red-900 text-white font-bold rounded-xl text-xs transition"
                >
                  Kembali ke Dashboard
                </button>
              </div>
            ) : (
              <>
                {/* Header Card */}
                <div className="p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🛡️</span>
                      <h2 className="text-lg font-serif font-bold text-white">
                        Pusat Pertahanan Siber &amp; Deteksi Ancaman (Anti-Hack Defense Center)
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        Lapisan Berlapis Aktif
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs">
                      Arsitektur pertahanan *Defense-in-Depth* dengan sensor honeypot jebakan, pemblokir brute-force, dan notifikasi darurat instan ke seluruh admin.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={securityAlertTesting}
                      onClick={handleTestSecurityAlert}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                      title="Menguji pengiriman sinyal peringatan darurat ke email seluruh admin"
                    >
                      <span>{securityAlertTesting ? "⏳" : "🧪"}</span>
                      <span>{securityAlertTesting ? "Mengirimkan Sinyal..." : "Uji Notifikasi Darurat ke Admin"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => confirmAndReset("Log Ancaman Keamanan", clearSecurityThreats)}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
                    >
                      <span>🗑️</span>
                      <span>Bersihkan Log</span>
                    </button>
                  </div>
                </div>

                {/* Locked Accounts Security Alert Banner */}
                {lockedAccountsList.length > 0 && (
                  <div className="p-4 rounded-2xl bg-red-950/90 border border-red-700/80 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🚨</span>
                      <div>
                        <strong className="text-red-200 block text-xs">
                          {lockedAccountsList.length} Akun Administrator Terblokir Otomatis Akibat 3x Salah Kata Sandi
                        </strong>
                        <p className="text-[11px] text-red-300">
                          Sistem pertahanan menghentikan upaya tebak sandi (brute-force). Hanya Super Admin yang berwenang membuka kunci akun.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveMenu("users");
                        setUserTab("locked");
                      }}
                      className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white font-bold rounded-xl text-xs transition self-start sm:self-auto shrink-0 shadow"
                    >
                      Buka Panel Akun Terkunci →
                    </button>
                  </div>
                )}

                {/* Status Notice if test performed */}
                {securityAlertStatus && (
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-sm flex items-center justify-between">
                    <span>{securityAlertStatus}</span>
                    <button
                      type="button"
                      onClick={() => setSecurityAlertStatus(null)}
                      className="text-slate-400 hover:text-slate-600 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Live Defense Status Banner */}
                <div className="p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 rounded-2xl border border-emerald-800/60 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping shrink-0"></span>
                    <div>
                      <p className="font-bold text-sm text-emerald-200">
                        STATUS SISTEM: AKTIF &amp; DILINDUNGI PENUH (0 INSIDEN AKTIF)
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Seluruh sensor honeypot trap, pembatasan rate limit login, dan firewall aplikasi Next.js aktif bekerja.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                    <span className="px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-emerald-300">
                      ✓ WAF &amp; DDoS Edge
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-emerald-300">
                      ✓ Honeypot Trap Sensor
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-emerald-300">
                      ✓ Rate Limit Shield
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-emerald-300">
                      ✓ Alert Broadcast Ready
                    </span>
                  </div>
                </div>

                {/* Security Metrics Cards */}
                {(() => {
                  const totalThreats = securityThreats.length;
                  const bruteForceCount = securityThreats.filter((t) => t.threatType === "brute_force").length;
                  const honeypotCount = securityThreats.filter((t) => t.threatType === "honeypot_trap").length;
                  const scannerCount = securityThreats.filter((t) => t.threatType === "suspicious_scanner").length;

                  return (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Total Serangan Dihadang</span>
                        <p className="text-2xl font-bold text-slate-900 font-serif">{totalThreats}</p>
                        <p className="text-[10px] text-emerald-700 font-medium">✓ 100% Berhasil Diblokir</p>
                      </div>
                      <div className="p-4 bg-white rounded-2xl border border-rose-200 shadow-sm space-y-1">
                        <span className="text-[10px] font-bold text-rose-600 uppercase">Percobaan Brute Force</span>
                        <p className="text-2xl font-bold text-rose-700 font-serif">{bruteForceCount}</p>
                        <p className="text-[10px] text-rose-600">IP diblokir otomatis</p>
                      </div>
                      <div className="p-4 bg-white rounded-2xl border border-amber-200 shadow-sm space-y-1">
                        <span className="text-[10px] font-bold text-amber-600 uppercase">Jebakan Honeypot Terpicu</span>
                        <p className="text-2xl font-bold text-amber-700 font-serif">{honeypotCount}</p>
                        <p className="text-[10px] text-amber-600">Bot scanner terperangkap</p>
                      </div>
                      <div className="p-4 bg-white rounded-2xl border border-blue-200 shadow-sm space-y-1">
                        <span className="text-[10px] font-bold text-blue-600 uppercase">Probe Scanner Liar</span>
                        <p className="text-2xl font-bold text-blue-700 font-serif">{scannerCount}</p>
                        <p className="text-[10px] text-blue-600">Akses berkas dicegah</p>
                      </div>
                    </div>
                  );
                })()}

                {/* Live Threat Incident Logs Table */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h3 className="font-serif font-bold text-sm text-slate-900">
                        Log Percobaan Serangan &amp; Penyerang Terblokir
                      </h3>
                      <p className="text-slate-400 text-xs">
                        Setiap probe liar otomatis dicatat alamat IP, user-agent, dan dikirimkan peringatannya ke email admin.
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      Sensor Siaga
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                        <tr>
                          <th className="py-3 px-4">Waktu &amp; Tanggal</th>
                          <th className="py-3 px-4">Alamat IP Penyerang</th>
                          <th className="py-3 px-4">Jenis Serangan</th>
                          <th className="py-3 px-4">Target Endpoint</th>
                          <th className="py-3 px-4">Status Pertahanan</th>
                          <th className="py-3 px-4">Notifikasi Admin</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {securityThreats.map((threat) => (
                          <tr key={threat.id} className="hover:bg-slate-50 transition">
                            <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                              {threat.timestamp}
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-rose-700 whitespace-nowrap">
                              {threat.ip}
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 uppercase">
                                {threat.threatType}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-700">
                              {threat.endpoint}
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                ✓ DIBLOKIR (403)
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                                📧 Terkirim ke Admin
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 5-Layer Defense Architecture Guide */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
                  <div className="space-y-1">
                    <h3 className="font-serif font-bold text-base text-slate-900">
                      🛡️ Panduan Arsitektur Pertahanan Berlapis (Defense-in-Depth Checklist)
                    </h3>
                    <p className="text-slate-500 text-xs">
                      Bagaimana website Ma&apos;had Aly DDI Mangkoso terlindungi dari segala bentuk serangan peretasan (hacking):
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-emerald-800 text-white font-bold flex items-center justify-center text-xs">1</span>
                        <h4 className="font-bold text-slate-900">Edge Network &amp; Cloudflare WAF</h4>
                      </div>
                      <p className="text-slate-600 leading-relaxed text-[11px]">
                        Lalu lintas web disaring sebelum mencapai server melalui Cloudflare. Dilengkapi proteksi DDoS instan, Bot Fight Mode untuk menghentikan bot otomatis, dan isolasi Edge Workers.
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-emerald-800 text-white font-bold flex items-center justify-center text-xs">2</span>
                        <h4 className="font-bold text-slate-900">HTTP Security Headers</h4>
                      </div>
                      <p className="text-slate-600 leading-relaxed text-[11px]">
                        Perlindungan peramban dengan HSTS (Strict-Transport-Security HTTPS wajib), CSP (Content Security Policy), pencegah klik bajakan (X-Frame-Options: DENY), dan anti-MIME sniffing.
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-emerald-800 text-white font-bold flex items-center justify-center text-xs">3</span>
                        <h4 className="font-bold text-slate-900">Sensor Honeypot &amp; Anti-Brute Force</h4>
                      </div>
                      <p className="text-slate-600 leading-relaxed text-[11px]">
                        Jalur umpan seperti <code>/wp-login.php</code> dan <code>/.env</code> dipasang untuk menjebak bot scanner. Pembatasan upaya login menggagalkan percobaan tebak kata sandi.
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-emerald-800 text-white font-bold flex items-center justify-center text-xs">4</span>
                        <h4 className="font-bold text-slate-900">Supabase RLS &amp; Anti-SQLi</h4>
                      </div>
                      <p className="text-slate-600 leading-relaxed text-[11px]">
                        Seluruh kueri basis data menggunakan parameterisasi ketat yang kebal injeksi SQL (SQL Injection). Row Level Security (RLS) memastikan tidak ada data yang bocor tanpa hak akses.
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-emerald-800 text-white font-bold flex items-center justify-center text-xs">5</span>
                        <h4 className="font-bold text-slate-900">Notifikasi Darurat &amp; Audit Trail</h4>
                      </div>
                      <p className="text-slate-600 leading-relaxed text-[11px]">
                        Ketika terdeteksi anomali berbahaya, sistem secara otomatis mengirimkan email siaga darurat ke seluruh kotak masuk admin aktif dan mencatat kronologi tak terhapuskan di Audit Log.
                      </p>
                    </div>

                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-emerald-900 text-white font-bold flex items-center justify-center text-xs">✓</span>
                        <h4 className="font-bold text-emerald-950">Isolasi Hak Akses (RBAC)</h4>
                      </div>
                      <p className="text-emerald-900 leading-relaxed text-[11px]">
                        Pemisahan tegas peran Super Admin, Editor, dan Penulis. Pengelolaan nomor rekening donasi dilindungi sandi ganda dan hak akses terverifikasi.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            12. USER & PERAN
           ══════════════════════════════════════════════════════════════ */}
        {activeMenu === "users" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs font-medium">
            {!isSuperAdmin ? (
              <div className="lg:col-span-12 bg-red-50 p-8 rounded-2xl border border-red-200 text-center space-y-3">
                <div className="text-3xl">🔒</div>
                <h3 className="font-serif font-bold text-lg text-red-950">Akses Terbatas: Khusus Super Admin</h3>
                <p className="text-red-700 text-xs max-w-md mx-auto">
                  Manajemen pengguna dan pengaturan hak akses hanya dapat dikelola oleh Super Admin.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveMenu("dashboard")}
                  className="px-5 py-2 bg-red-800 hover:bg-red-900 text-white font-bold rounded-xl text-xs transition"
                >
                  Kembali ke Dashboard
                </button>
              </div>
            ) : (
              <div className="lg:col-span-12 space-y-6">
                {/* Subtabs Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setUserTab("list")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        userTab === "list"
                          ? "bg-emerald-800 text-white shadow-sm"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      <span>👥</span>
                      <span>Daftar &amp; Kredensial Pengguna ({dbUsers.length || 1})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserTab("create")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        userTab === "create"
                          ? "bg-emerald-800 text-white shadow-sm"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      <span>➕</span>
                      <span>Buat Akun Baru (Langsung / Invite)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserTab("mypassword")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        userTab === "mypassword"
                          ? "bg-emerald-800 text-white shadow-sm"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      <span>🛡️</span>
                      <span>Ganti Kata Sandi Saya</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        loadLockedAccounts();
                        setUserTab("locked");
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        userTab === "locked"
                          ? "bg-red-800 text-white shadow-sm"
                          : "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
                      }`}
                    >
                      <span>🔒</span>
                      <span>Akun Terkunci (3x Salah Sandi)</span>
                      {lockedAccountsList.length > 0 && (
                        <span className="px-1.5 py-0.5 bg-red-600 text-white text-[10px] rounded-full animate-pulse">
                          {lockedAccountsList.length}
                        </span>
                      )}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      const { data } = await supabase.from("users").select("*").order("created_at", { ascending: false });
                      if (data) setDbUsers(data);
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 transition"
                  >
                    <span>🔄</span>
                    <span>Segarkan Data</span>
                  </button>
                </div>

                {/* ══════════════════════════════════════════════════════════
                    SUBTAB 1: DAFTAR & KREDENSIAL PENGGUNA
                   ══════════════════════════════════════════════════════════ */}
                {userTab === "list" && (
                  <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div className="border-b pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="font-serif font-bold text-lg text-emerald-950">
                          Katalog Akun &amp; Kredensial Pengguna
                        </h3>
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          Kelola Nama Lengkap (Username), Kata Sandi (Password), Peran Akses, dan Status Keaktifan Akun.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUserTab("create")}
                        className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1 self-start sm:self-auto"
                      >
                        <span>➕ Tambah Pengguna</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {(dbUsers.length > 0 ? dbUsers : [
                        {
                          id: "usr-admin",
                          email: currentUser?.email || "munzirahmad779@gmail.com",
                          nama_lengkap: userProfile?.nama_lengkap || "Ahmad Yusuf Mubarak",
                          role: "super_admin",
                          is_active: true,
                          created_at: new Date().toISOString()
                        }
                      ]).map((usr) => (
                        <div
                          key={usr.id}
                          className="p-4 bg-slate-50 hover:bg-slate-100/70 rounded-2xl border border-slate-200 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div className="flex items-start gap-3.5">
                            <div className="w-10 h-10 rounded-full bg-emerald-800 text-mahad-gold flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                              {(usr.nama_lengkap || usr.email || "U").slice(0, 1).toUpperCase()}
                            </div>
                            <div className="space-y-1 overflow-hidden">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-bold text-slate-900 text-sm">
                                  {usr.nama_lengkap || "Belum ada nama"}
                                </h4>
                                <span
                                  className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${
                                    usr.role === "super_admin"
                                      ? "bg-amber-100 text-amber-900 border border-amber-300"
                                      : usr.role === "editor" || usr.role === "admin"
                                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                      : "bg-blue-100 text-blue-800 border border-blue-200"
                                  }`}
                                >
                                  {usr.role === "super_admin" ? "👑 Super Admin" : (usr.role === "editor" || usr.role === "admin") ? "🟢 Admin" : "🔵 Penulis"}
                                </span>
                                {usr.is_active ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    <span>Aktif</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 font-semibold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                    <span>Nonaktif</span>
                                  </span>
                                )}
                              </div>
                              <p className="text-slate-500 text-xs font-mono">{usr.email}</p>
                            </div>
                          </div>

                          {/* Tombol Aksi Kredensial */}
                          <div className="flex items-center gap-2 flex-wrap self-end md:self-auto shrink-0">
                            {/* Tombol Ubah Sandi */}
                            <button
                              type="button"
                              onClick={() => {
                                setResetTargetUser(usr);
                                setNewPasswordInput("");
                              }}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1"
                              title="Reset kata sandi pengguna ini"
                            >
                              <span>🔑</span>
                              <span>Ganti Sandi</span>
                            </button>

                            {/* Tombol Edit Nama / Peran */}
                            <button
                              type="button"
                              onClick={() => {
                                setEditTargetUser(usr);
                                setEditNameInput(usr.nama_lengkap || "");
                                setEditRoleInput(usr.role || "admin");
                              }}
                              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1"
                              title="Edit nama lengkap atau peran"
                            >
                              <span>✏️</span>
                              <span>Edit Profil</span>
                            </button>

                            {/* Toggle Aktif/Nonaktif */}
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
                                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition ${
                                  usr.is_active
                                    ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                                    : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200"
                                }`}
                              >
                                {usr.is_active ? "Nonaktifkan" : "Aktifkan"}
                              </button>
                            )}

                            {/* Tombol Hapus */}
                            {usr.role !== "super_admin" && (
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(usr.id, usr.email)}
                                className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1"
                                title="Hapus pengguna ini secara permanen"
                              >
                                <span>🗑️</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ══════════════════════════════════════════════════════════
                    SUBTAB 2: BUAT AKUN BARU (LANGSUNG / INVITE)
                   ══════════════════════════════════════════════════════════ */}
                {userTab === "create" && (
                  <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                    <div className="border-b pb-4">
                      <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full font-bold text-[10px] mb-2 uppercase tracking-wider">
                        Registrasi Akun Resmi
                      </span>
                      <h3 className="font-serif font-bold text-xl text-emerald-950">
                        Tambah Pengguna Baru &amp; Hak Akses
                      </h3>
                      <p className="text-slate-600 text-xs mt-1">
                        Pilih metode pembuatan akun: buat langsung dengan Kata Sandi atau kirim tautan undangan ke email pengguna.
                      </p>
                    </div>

                    {/* Mode Selector */}
                    <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl">
                      <button
                        type="button"
                        onClick={() => setCreateAccountMode("direct")}
                        className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                          createAccountMode === "direct"
                            ? "bg-white text-emerald-900 shadow-sm border border-slate-200"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        <span>⚡</span>
                        <span>Buat Langsung (Sandi Siap Pakai)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCreateAccountMode("invite")}
                        className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                          createAccountMode === "invite"
                            ? "bg-white text-emerald-900 shadow-sm border border-slate-200"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        <span>✉️</span>
                        <span>Undang via Email (Invite Link)</span>
                      </button>
                    </div>

                    <form onSubmit={handleCreateOrInviteUser} className="space-y-4">
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">
                          Nama Lengkap Pengguna (Username Tampilan) *
                        </label>
                        <input
                          type="text"
                          required
                          value={inviteName}
                          onChange={(e) => setInviteName(e.target.value)}
                          placeholder="Contoh: Ust. Ahmad Fauzi, M.Ag."
                          className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-800 mb-1">
                          Alamat Email Login *
                        </label>
                        <input
                          type="email"
                          required
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          placeholder="contoh: fauzi@ddimangkoso.ac.id"
                          className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                        />
                      </div>

                      {createAccountMode === "direct" && (
                        <div>
                          <label className="block font-bold text-slate-800 mb-1">
                            Kata Sandi Awal (Password) *
                          </label>
                          <input
                            type="text"
                            required
                            value={directPassword}
                            onChange={(e) => setDirectPassword(e.target.value)}
                            placeholder="Minimal 6 karakter (contoh: Santri2026!)"
                            className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                          />
                          <p className="text-[11px] text-slate-500 mt-1">
                            Kata sandi ini langsung aktif. Berikan kredensial (Email &amp; Kata Sandi) ini kepada admin/penulis yang bersangkutan.
                          </p>
                        </div>
                      )}

                      <div>
                        <label className="block font-bold text-slate-800 mb-1">
                          Tingkatan Peran (Role) *
                        </label>
                        <select
                          value={inviteRole}
                          onChange={(e) => setInviteRole(e.target.value as any)}
                          className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                        >
                          <option value="admin">🟢 Admin / Redaksi (Kelola artikel, naskah masuk, kategori, skripsi, media)</option>
                          <option value="penulis">🔵 Penulis (Hanya dashboard penulis &amp; naskah pribadi)</option>
                          <option value="super_admin">👑 Super Admin (Akses penuh termasuk pengaturan email, user &amp; database)</option>
                        </select>
                      </div>

                      <div className="pt-2 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setUserTab("list")}
                          className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          disabled={userActionLoading}
                          className="flex-1 py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {userActionLoading ? (
                            <span>Memproses Akun...</span>
                          ) : createAccountMode === "direct" ? (
                            <span>✓ Buat Akun &amp; Kredensial Sekarang</span>
                          ) : (
                            <span>✉️ Kirim Tautan Undangan Email</span>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* ══════════════════════════════════════════════════════════
                    SUBTAB 3: GANTI KATA SANDI SAYA (SUPER ADMIN)
                   ══════════════════════════════════════════════════════════ */}
                {userTab === "mypassword" && (
                  <div className="max-w-md mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                    <div className="border-b pb-4 text-center">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl mx-auto mb-2">
                        🛡️
                      </div>
                      <h3 className="font-serif font-bold text-xl text-emerald-950">
                        Ubah Kata Sandi Saya
                      </h3>
                      <p className="text-slate-500 text-xs mt-1">
                        Perbarui kata sandi akun Super Admin Anda yang sedang aktif ({currentUser?.email || "Super Admin"}).
                      </p>
                    </div>

                    <form onSubmit={handleChangeMyOwnPassword} className="space-y-4">
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">
                          Kata Sandi Baru *
                        </label>
                        <input
                          type="password"
                          required
                          value={myNewPassword}
                          onChange={(e) => setMyNewPassword(e.target.value)}
                          placeholder="Minimal 6 karakter"
                          className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-800 mb-1">
                          Konfirmasi Kata Sandi Baru *
                        </label>
                        <input
                          type="password"
                          required
                          value={myConfirmPassword}
                          onChange={(e) => setMyConfirmPassword(e.target.value)}
                          placeholder="Ulangi kata sandi baru"
                          className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={userActionLoading}
                        className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {userActionLoading ? "Menyimpan Sandi..." : "🔒 Simpan Kata Sandi Baru"}
                      </button>
                    </form>
                  </div>
                )}

                {/* ══════════════════════════════════════════════════════════
                    SUBTAB 4: AKUN TERKUNCI OTOMATIS (SALAH SANDI 3X)
                   ══════════════════════════════════════════════════════════ */}
                {userTab === "locked" && (
                  <div className="bg-white p-6 sm:p-7 rounded-2xl border border-red-200 shadow-sm space-y-5">
                    <div className="border-b border-red-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🔒</span>
                          <h3 className="font-serif font-bold text-lg text-red-950">
                            Manajemen Akun Terkunci (Proteksi 3x Salah Kata Sandi)
                          </h3>
                        </div>
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          Akun yang terblokir otomatis demi melindungi sistem dari serangan tebak sandi (brute-force). Hanya Super Admin yang berwenang membuka kunci dan mengizinkan reset password.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={loadLockedAccounts}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 transition self-start sm:self-auto"
                      >
                        <span>🔄</span>
                        <span>Segarkan Daftar</span>
                      </button>
                    </div>

                    {lockedAccountsList.length === 0 ? (
                      <div className="py-12 text-center bg-emerald-50/50 border border-emerald-200/60 rounded-2xl space-y-2">
                        <span className="text-3xl block">🛡️</span>
                        <h4 className="font-bold text-emerald-950 text-sm">Tidak Ada Akun yang Terblokir</h4>
                        <p className="text-emerald-700 text-xs max-w-md mx-auto">
                          Alhamdulillah, tidak ada akun administrator atau pengguna yang terblokir saat ini. Seluruh pengguna beroperasi secara normal tanpa anomali sandi.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
                          <span>⚠️</span>
                          <span>
                            Ditemukan <strong>{lockedAccountsList.length}</strong> akun yang terkunci setelah gagal memasukkan kata sandi 3 kali berturut-turut.
                          </span>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                <th className="py-3 px-3">Email Pengguna</th>
                                <th className="py-3 px-3">Waktu Terkunci</th>
                                <th className="py-3 px-3">Percobaan Gagal</th>
                                <th className="py-3 px-3">Status Keamanan</th>
                                <th className="py-3 px-3 text-right">Tindakan Super Admin</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                              {lockedAccountsList.map((acc, idx) => (
                                <tr key={idx} className="hover:bg-red-50/40 transition">
                                  <td className="py-3.5 px-3 font-bold text-slate-900 font-mono">
                                    {acc.email}
                                  </td>
                                  <td className="py-3.5 px-3 text-slate-500">
                                    {new Date(acc.lockedAt).toLocaleString("id-ID")}
                                  </td>
                                  <td className="py-3.5 px-3">
                                    <span className="px-2.5 py-1 bg-red-100 text-red-700 font-bold rounded-full text-[10px]">
                                      {acc.failedCount}x Salah Sandi
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-3">
                                    <span className="inline-flex items-center gap-1 text-red-700 font-bold text-[11px]">
                                      <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                                      TERBLOKIR OTOMATIS
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={() => handleUnlockAccount(acc.email)}
                                        className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs shadow-sm transition flex items-center gap-1"
                                      >
                                        <span>🔓</span>
                                        <span>Buka Blokir Akun</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newPass = prompt(`Masukkan kata sandi baru untuk ${acc.email} (minimal 6 karakter):`);
                                          if (!newPass || newPass.length < 6) {
                                            if (newPass) alert("Kata sandi minimal 6 karakter!");
                                            return;
                                          }
                                          const userObj = dbUsers.find(u => u.email?.toLowerCase() === acc.email?.toLowerCase());
                                          if (userObj?.id) {
                                            fetch("/api/admin/users", {
                                              method: "POST",
                                              headers: { "Content-Type": "application/json" },
                                              body: JSON.stringify({
                                                action: "reset_password",
                                                userId: userObj.id,
                                                password: newPass
                                              })
                                            }).then(r => r.json()).then(res => {
                                              if (res.success) {
                                                handleUnlockAccount(acc.email);
                                                alert(`✓ Kata sandi ${acc.email} berhasil diperbarui dan akun dibuka kuncinya!`);
                                              } else {
                                                alert("Gagal reset kata sandi: " + res.error);
                                              }
                                            });
                                          } else {
                                            handleUnlockAccount(acc.email);
                                            alert(`✓ Akun dibuka kuncinya. Pengguna sekarang dapat menggunakan fitur Lupa Password di layar login.`);
                                          }
                                        }}
                                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                                      >
                                        <span>🔑 Reset Sandi</span>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ══════════════════════════════════════════════════════════
                    MODAL: RESET KATA SANDI PENGGUNA (BY SUPER ADMIN)
                   ══════════════════════════════════════════════════════════ */}
                {resetTargetUser && (
                  <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
                      <div className="border-b pb-3">
                        <div className="flex items-center gap-2">
                          <span className="p-2 bg-amber-100 text-amber-900 rounded-xl text-base">🔑</span>
                          <div>
                            <h3 className="font-serif font-bold text-lg text-slate-900">
                              Ganti Kata Sandi Pengguna
                            </h3>
                            <p className="text-slate-500 text-xs">
                              {resetTargetUser.nama_lengkap || "Pengguna"} &bull; {resetTargetUser.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      <form onSubmit={handleResetUserPassword} className="space-y-4">
                        <div>
                          <label className="block font-bold text-slate-800 mb-1 text-xs">
                            Masukkan Kata Sandi Baru *
                          </label>
                          <input
                            type="text"
                            required
                            value={newPasswordInput}
                            onChange={(e) => setNewPasswordInput(e.target.value)}
                            placeholder="Ketik kata sandi baru (min. 6 karakter)"
                            className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                          />
                          <p className="text-[11px] text-slate-500 mt-1">
                            Kata sandi baru akan langsung berlaku untuk login pengguna tersebut.
                          </p>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t">
                          <button
                            type="button"
                            onClick={() => setResetTargetUser(null)}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            disabled={userActionLoading}
                            className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-sm transition disabled:opacity-50"
                          >
                            {userActionLoading ? "Menyimpan..." : "✓ Terapkan Sandi Baru"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* ══════════════════════════════════════════════════════════
                    MODAL: EDIT PROFIL PENGGUNA (USERNAME & ROLE)
                   ══════════════════════════════════════════════════════════ */}
                {editTargetUser && (
                  <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
                      <div className="border-b pb-3">
                        <div className="flex items-center gap-2">
                          <span className="p-2 bg-emerald-100 text-emerald-900 rounded-xl text-base">✏️</span>
                          <div>
                            <h3 className="font-serif font-bold text-lg text-slate-900">
                              Edit Profil Pengguna
                            </h3>
                            <p className="text-slate-500 text-xs font-mono">
                              {editTargetUser.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      <form onSubmit={handleUpdateUserProfile} className="space-y-4">
                        <div>
                          <label className="block font-bold text-slate-800 mb-1 text-xs">
                            Nama Lengkap (Username Tampilan) *
                          </label>
                          <input
                            type="text"
                            required
                            value={editNameInput}
                            onChange={(e) => setEditNameInput(e.target.value)}
                            className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-800 mb-1 text-xs">
                            Peran Akses (Role) *
                          </label>
                          <select
                            value={editRoleInput}
                            onChange={(e) => setEditRoleInput(e.target.value)}
                            className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                          >
                            <option value="admin">🟢 Admin (Kelola artikel, naskah masuk &amp; publikasi)</option>
                            <option value="penulis">🔵 Penulis (Dashboard karya &amp; naskah pribadi)</option>
                            <option value="super_admin">👑 Super Admin (Akses seluruh sistem)</option>
                          </select>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t">
                          <button
                            type="button"
                            onClick={() => setEditTargetUser(null)}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            disabled={userActionLoading}
                            className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs shadow-sm transition disabled:opacity-50"
                          >
                            {userActionLoading ? "Menyimpan..." : "✓ Simpan Perubahan"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

              </div>
            )}
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

                {/* Google Analytics 4 & Integrasi Trafik */}
                <div className="pt-3 border-t space-y-3">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <span>📈</span>
                    <span>Integrasi Google Analytics 4 (Pelacak Pengunjung Riil)</span>
                  </h4>
                  <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                    <label className="block font-bold text-amber-950 text-xs">
                      ID Pengukuran Google Analytics (Measurement ID)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: G-XXXXXXXXXX"
                      value={settingsForm.seo?.googleAnalyticsId || settingsForm.googleAnalyticsId || ""}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          googleAnalyticsId: e.target.value,
                          seo: { ...(settingsForm.seo as any), googleAnalyticsId: e.target.value }
                        })
                      }
                      className="w-full p-2.5 bg-white border border-amber-300 rounded-lg font-mono text-xs"
                    />
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      Wajib berawalan huruf <strong>G-</strong> (misal <code>G-W3B9XYZ123</code>). Begitu Anda mengisi ID ini dan menekan <em>Simpan Seluruh Pengaturan</em>, sistem akan langsung aktif merekam kunjungan pembaca artikel, warta berita, dan pendaftar PMB secara otomatis tanpa perlu mengubah kodingan lagi.
                    </p>
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
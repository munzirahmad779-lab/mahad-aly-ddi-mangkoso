// Nilai bawaan berbentuk objek pengaturan (navbar, hero, footer,
// pengaturan situs, teks halaman, PMB) yang dipakai sebagai dasar
// gabungan seed server oleh ArticleContext dan komponen publik.
// Koleksi data besar dan benih pengguna admin sudah dipisah ke
// ./mock-seed-data.ts (dimuat malas) dan ./server/admin-users-seed.ts
// (khusus server) agar bundel klien publik ramping dan bersih.
import {
  NewsItem,
  SiteSettings,
  HeroSectionData,
  QuoteSectionData,
  SeoSettings,
  SocialMediaSettings,
  FooterSettings,
  FooterNavLink,
  FooterFocusItem,
  NavbarSettings,
  HeroSectionSettings,
  HomeSectionConfigItem,
  AboutPageContent,
  PageTextsSettings,
  SecurityThreatLog,
  MaintenanceConfig,
  OrganizationMember,
  PMBSettings
} from "./types";

export const INITIAL_HERO: HeroSectionData = {
  badge: "Pusat Kaderisasi Fuqaha Kontemporer",
  title: "Meneguhkan Khazanah Turats, Menjawab Dinamika Fiqh Kontemporer",
  subtitle: "Pendidikan Tinggi Kader Ulama Takhassus Fiqh wa Usuluhu — Berakar kuat pada sanad keilmuan klasik Anregurutta, progresif merespons tantangan zaman.",
  arabicMotto: "تَفَقُّهٌ فِي الدِّيْنِ · بَصِيْرَةٌ فِي الزَّمَانِ · خِدْمَةٌ لِلْأُمَّةِ",
  ctaPrimaryText: "Jelajahi Kajian Fiqh",
  ctaPrimaryLink: "/artikel",
  ctaSecondaryText: "Repositori Skripsi",
  ctaSecondaryLink: "/skripsi"
};

export const INITIAL_QUOTE: QuoteSectionData = {
  arabicQuote: "مَنْ يُرِدِ اللَّهُ بِهِ خَيْرًا يُفَقِّهْهُ فِي الدِّينِ",
  source: "HR. Al-Bukhari no. 71 & Muslim no. 1037",
  translation: "Barangsiapa yang Allah kehendaki kebaikan baginya, niscaya Allah akan pahamkan dia secara mendalam dalam urusan agama.",
  context: "Landasan Visi Pendidikan Kader Ulama Ma'had Aly DDI Mangkoso",
  imageUrl: "",
  showImage: false
};

export const INITIAL_SEO: SeoSettings = {
  siteTitle: "Ma'had Aly DDI Mangkoso — Takhassus Fiqh wa Usuluhu",
  metaDescription: "Portal resmi Ma'had Aly Pendidikan Tinggi Kader Ulama DDI Abdurrahman Ambo Dalle Mangkoso, Barru. Pusat kajian Fiqh Mu'asarah, turats, dan riset hukum Islam.",
  keywords: "mahad aly ddi mangkoso, fiqh muasarah, fiqh kontemporer, ushul fikih, anregurutta ambo dalle, barru sulawesi selatan",
  ogImage: "",
  googleAnalyticsId: "G-EBBP80BZWL",
  searchConsoleCode: "",
  enableSitemap: true
};

export const INITIAL_SOCIAL_MEDIA: SocialMediaSettings = {
  facebook: "https://facebook.com/mahadalyddimangkoso",
  instagram: "https://instagram.com/mahadalyddimangkoso",
  youtube: "https://youtube.com/@mahadalyddimangkoso",
  whatsapp: "+62 857-5479-5186",
  emailOfficial: "mahadaly@ddimangkoso.ac.id",
  fullAddress: "Kompleks Pondok Pesantren DDI Mangkoso, Kel. Mangkoso, Kec. Soppeng Riaja, Kab. Barru, Sulawesi Selatan 90752"
};

export const INITIAL_FOOTER_SETTINGS: FooterSettings = {
  logoUrl: "/image_067524.png",
  orgName: "Ma'had Aly",
  orgSubname: "DDI Mangkoso",
  description: "Pendidikan Tinggi Kader Ulama jenjang Marhalah Ula (M.1). Berkhidmat melahirkan generasi mutafaqqih fiddin berwawasan wasathiyyah dan berakhlak mulia.",
  address: "Kompleks Ponpes DDI Mangkoso, Kec. Soppeng Riaja, Kab. Barru, Sulsel 90752",
  kanalDescription: "Ikuti kabar pengajian, kajian halaqah, dan penerbitan jurnal resmi Ma'had Aly DDI Mangkoso:",
  email: "mahadaly@ddimangkoso.ac.id",
  whatsapp: "+62 857-5479-5186",
  facebookUrl: "https://facebook.com/mahadalyddimangkoso",
  instagramUrl: "https://instagram.com/mahadalyddimangkoso",
  youtubeUrl: "https://youtube.com/@mahadalyddimangkoso",
  telegramUrl: "",
  tiktokUrl: "",
  copyrightText: "© 2026 Ma'had Aly DDI Mangkoso. Hak Cipta Dilindungi.",
  tagline: "Mewarisi Khazanah Turats • Menjaga Sanad Ulama Nusantara",
  showAdminLink: true,
  adminLinkLabel: "🔒 Masuk Panel Redaksi (Admin)",
  adminLinkUrl: "/admin",
  footerBgColor: "#0b4a25",
  footerTextColor: "#f4e8c1",
  columnLayout: 4
};

export const INITIAL_FOOTER_NAV: FooterNavLink[] = [
  { id: "fnav-1", label: "Beranda", url: "/", position: 1, isActive: true },
  { id: "fnav-2", label: "Profil & Sejarah", url: "/profil", position: 2, isActive: true },
  { id: "fnav-3", label: "Mimbar Kajian", url: "/artikel", position: 3, isActive: true },
  { id: "fnav-4", label: "Infaq & Donasi Program", url: "/donasi", position: 4, isActive: true },
  { id: "fnav-5", label: "Karya Anregurutta", url: "/kategori/karya-anregurutta", position: 5, isActive: true },
  { id: "fnav-6", label: "Kirim Karya Tulisan", url: "/kirim-tulisan", position: 6, isActive: true }
];

export const INITIAL_FOOTER_FOCUS: FooterFocusItem[] = [
  { id: "ffoc-1", name: "Ilmu Tauhid/Aqidah dan Akhlaq", icon: "⚖️", position: 1, isActive: true },
  { id: "ffoc-2", name: "Bahasa Arab dengan semua ilmu-ilmu alatnya seperti ilmu Nahwu, Sharaf, Balaghah, dan ilmu-ilmu yang serumpun dengannya", icon: "📖", position: 2, isActive: true },
  { id: "ffoc-3", name: "Ilmu Ushul al-Tafsir", icon: "✨", position: 3, isActive: true },
  { id: "ffoc-4", name: "Ilmu Ushul al-Hadits", icon: "📜", position: 4, isActive: true },
  { id: "ffoc-5", name: "Ilmu Ushul al-Fiqh", icon: "👑", position: 5, isActive: true }
];

export const INITIAL_MAINTENANCE_CONFIG: MaintenanceConfig = {
  badge: "Tahap Finalisasi Data & Khazanah Digital",
  title: "Meneguhkan Khazanah Turats, Menjawab Dinamika Zaman",
  subtitle: "Pendidikan Tinggi Kader Ulama Takhassus Fiqh wa Usuluhu — Berakar kuat pada sanad keilmuan klasik Anregurutta, progresif merespons tantangan kontemporer.",
  arabicHeading: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  noticeTitle: "Maklumat Redaksi & Pengelola Portal",
  noticeGreeting: "Assalamu'alaikum Warahmatullahi Wabarakatuh.",
  noticeContent: "Saat ini dewan masyaikh dan tim redaksi sedang menyempurnakan basis data kurikulum kitab turats klasik, repositori risalah ilmiah mahasantri, direktori fatwa bahtsul masail, dan sistem penerimaan mahasantri baru (PMB).",
  noticeNote: "Insya Allah, portal resmi ini akan segera diluncurkan secara penuh untuk masyarakat luas. Bagi mahasantri, alumni, dan calon pendaftar yang membutuhkan informasi resmi, silakan menghubungi narahubung sekretariat di bawah ini.",
  whatsappNumber: "+62 857-5479-5186",
  whatsappLabel: "Hubungi WhatsApp Sekretariat",
  email: "redaksi@mahadaly-ddimangkoso.ac.id",
  address: "Kompleks Ponpes DDI Mangkoso, Kec. Soppeng Riaja, Kab. Barru, Sulsel 90752",
  pillars: [
    { value: "M.1", label: "Jenjang Marhalah Ula" },
    { value: "4 Tahun", label: "Masa Pengkaderan" },
    { value: "Turats", label: "Sanad Kitab Salaf" },
    { value: "100%", label: "Beasiswa Penuh" }
  ]
};

export const INITIAL_ORGANIZATION_MEMBERS: OrganizationMember[] = [
  {
    id: "org-1",
    role: "Mudir Ma'had Aly",
    name: "AGH. Prof. Dr. M. Faried Wadjedy, MA",
    description: "Pimpinan Tertinggi & Pengasuh Halaqah Turats",
    category: "Pimpinan",
    order: 1
  },
  {
    id: "org-2",
    role: "Wakil Mudir I (Bidang Akademik & Kurikulum)",
    name: "Ust. M. Idrus, M.Ag.",
    description: "Pengarah Kurikulum Turats 8 Semester & Mutaba'ah Ta'lim",
    category: "Wakil Mudir",
    order: 2
  },
  {
    id: "org-3",
    role: "Wakil Mudir II (Keuangan & Beasiswa OTA)",
    name: "Biro Administrasi & Orang Tua Asuh",
    description: "Pengelolaan Operasional, Infaq Lembaga & Beasiswa Mahasantri",
    category: "Wakil Mudir",
    order: 3
  },
  {
    id: "org-4",
    role: "Lembaga Bahtsul Masail (LBM)",
    name: "Dewan Masyaikh & Peneliti Muda Fiqh Mu'asarah",
    description: "Pengkajian Masail Fiqhiyyah Kontemporer & Perumusan Fatwa",
    category: "Lembaga & Unit",
    order: 4
  },
  {
    id: "org-5",
    role: "LP2M (Pusat Riset & Pengabdian)",
    name: "Redaksi Jurnal & Mimbar Kajian Ilmiah",
    description: "Pengembangan Riset Turats, Publikasi Ilmiah & Pengabdian Santri",
    category: "Lembaga & Unit",
    order: 5
  }
];

export const INITIAL_SETTINGS: SiteSettings = {
  institutionName: "Ma'had Aly Pendidikan Tinggi Kader Ulama DDI Abdurrahman Ambo Dalle, Mangkoso",
  takhassus: "Fiqh wa Usuluhu (Fiqh dan Ushul Fikih)",
  focusField: "Fiqh Mu'asarah (الفقه المعاصر) — Fiqh Kontemporer",
  mudirName: "AGH. Prof. Dr. M. Faried Wadjedy, MA",
  establishedDate: "10 Ramadhani 1439 H / 25 Mei 2018 M",
  location: "Kab. Barru, Sulawesi Selatan",
  address: "Kompleks Pondok Pesantren DDI Mangkoso, Kel. Mangkoso, Kec. Soppeng Riaja, Kab. Barru, Sulawesi Selatan 90752",
  phone: "+62 857-5479-5186",
  emailSubmission: "munzirahmad779@gmail.com",
  targetSubmissionEmails: ["munzirahmad779@gmail.com"],
  visi: "Mencetak ulama yang berkarakter, yang mampu mengintegrasikan nilai-nilai khuluqiyyah, ilmiah dan amaliah serta memiliki reputasi keulamaan sebagai ahli waris para nabi.",
  misi: [
  "Menyelenggarakan pendidikan kader ulama yang menerapkan sistem intensifikasi pengkajian, penguatan pada ilmu-ilmu alat (usûl), pendalaman dan pengayaan pada ilmu-ilmu keislaman yang langsung merujuk kepada kitab-kitab sumbernya yang asli."
],
  historyContent: "Berangkat dari keprihatinan atas merosotnya bekal keulamaan di sebagian besar pondok pesantren akibat kurangnya kiyai berkapasitas ulama, akumulasi kurikulum yang menyita porsi ilmu keislaman, serta tantangan zaman dan perkembangan ICT yang berdampak negatif, Pondok Pesantren Pusat Darud Da'wah wal-Irsyad Abdurrahman Ambo Dalle Mangkoso mendirikan Al-Ma'had Al-'Aliy untuk mencetak kader ulama yang berkarakter dan mengintegrasikan ilmu, amal, serta moral.\nPengajian kitab kuning di pondok pesantren ini sudah berjalan sejak berdirinya pada tanggal 21 Desember 1938 dan tidak pernah terhenti sampai sekarang, sehingga budaya membaca kitab kuning bukanlah hal yang baru di pesantren ini.\nPenyelenggaraan ini didukung oleh potensi yang dimiliki pesantren, di antaranya keberadaan ulama dan asatizah yang berkemampuan mengajarkan kitab kuning dan putih, santri dalam jumlah banyak, koleksi kitab mu'tabar yang cukup, serta alumni yang telah menyelesaikan pendidikan tingkat doktor di berbagai disiplin ilmu keislaman baik di dalam maupun luar negeri.",
  historyArabic: "تأسس المعهد العالي لمعهد دار الدعوة والإرشاد عبد الرحمن عبو دالي منغكوسو لمعالجة ندرة العلماء وتحديات العصر، بهدف إعداد كوادر علماء ذوي شخصية متميزة. وتقاليد دراسة الكتب الصفراء في هذا المعهد مستمرة منذ ٢١ ديسمبر ١٩٣٨ حتى الآن.",
  gradingSystemRules: "Sistem penilaian menggabungkan pengujian hafalan matan turats (ikhtibar), penguasaan qawa'id fiqhiyyah, keaktifan halaqah Bahtsul Masail, serta penulisan risalah ilmiah skripsi (munaqasyah) dengan standar kelulusan predikat Mumtaz (Cum Laude).",
  academicGuideBookUrl: "",
  academicGuideBookSize: "4.5 MB",
  academicGuideBookYear: "2026/2027",
  hero: INITIAL_HERO,
  quote: INITIAL_QUOTE,
  seo: INITIAL_SEO,
  googleAnalyticsId: "G-EBBP80BZWL",
  socialMedia: INITIAL_SOCIAL_MEDIA,
  footer: INITIAL_FOOTER_SETTINGS,
  maintenanceMode: false,
  maintenanceConfig: INITIAL_MAINTENANCE_CONFIG,
  customProfileSections: [],
  organizationStructure: INITIAL_ORGANIZATION_MEMBERS
};

export const INITIAL_PMB_SETTINGS: PMBSettings = {
  title: "Brosur Pendaftaran Imtihan Qabul",
  subtitle: "Ma'had Aly Pontren DDI Mangkoso",
  headerArabicText: "المعهد العالي للدعوة والإرشاد منجكوسو",
  heroDescription: "Membina kader ulama mutafaqqih fiddin berwawasan wasathiyyah dan berakhlak mulia dengan sanad keilmuan muttashil.",
  academicYear: "Angkatan XI 'Am Jam'iy 1448 H.",
  programTakhassus: "Fiqh dan Ushul Fiqh",
  scholarshipBadge: "100% Beasiswa - Full Beasiswa",
  accreditationBadge: "Akreditasi A (Mumtaz)",
  quotaTotal: "30 Orang untuk Banin dan Banat",
  quotaScholarship: "25 Orang (Jalur Beasiswa)",
  quotaMandiri: "5 Orang (Jalur Mandiri)",
  cardStudyProgramTitle: "Jenjang Marhalah Ula (M.1)",
  cardStudyProgramSubtitle: "Ijazah Terakreditasi Mumtaz & Sanad Kitab",
  registrationPeriod: "17 Sya'ban 1447 H hingga 16 Ramadhan 1447 H",
  registrationLink: "https://bit.ly/pmb-mahadaly-mangkoso",
  brochurePdfUrl: "",
  brochureImageUrl: "",
  qrCodeUrl: "",
  examSubjects: [
    "Hifzh Al-Qur'an",
    "Baca kitab kuning (Bidayatul-Mujtahid wa Nihayatul-Muqtashid) dengan qawa'idnya",
    "Test Wawancara"
  ],
  requirements: [
    "Beragama Islam berhaluan Ahlu al-Sunnah",
    "Tamat/jelang tamat Madrasah Aliyah atau sederajat",
    "Siap untuk mengikuti imtihan qabul sesuai dengan materi imtihan",
    "Berakhlak mulia dan siap untuk menaati tata tertib dan kode etik Ma'had Aly Pontren DDI Mangkoso",
    "Tidak memiliki riwayat durhaka pada orang tua dan guru",
    "Tidak memiliki riwayat yang cacat di tengah-tengah umat seperti perilaku asusila, narkoba, ekstasi, miras, dan kriminal yang berurusan dengan aparat penegak hukum",
    "Tidak memiliki riwayat pelanggaran berat pada tata tertib dan kode etik santri dari madrasah asalnya",
    "Bukan perokok",
    "Memiliki jiwa/karakter ulama"
  ],
  schedules: [
    {
      id: "sch-1",
      stageName: "Daur al-Ittisalah (Online) - Khusus Alumni",
      date: "17-27 Ramadhan 1447 H",
      description: "Khusus Alumni Pontren DDI Mangkoso via daring"
    },
    {
      id: "sch-2",
      stageName: "Daur al-Ittisalah (Online) - Terbuka untuk Umum",
      date: "07-17 Syawal 1447 H",
      description: "Terbuka bagi calon mahasantri umum seluruh Indonesia via daring"
    },
    {
      id: "sch-3",
      stageName: "Daur al-Muqabalah (Offline / Luring)",
      date: "27 Syawal 1447 H",
      description: "Serentak dilaksanakan di Kampus Ma'had Aly DDI Mangkoso"
    },
    {
      id: "sch-4",
      stageName: "Natijah Imtihan (Pengumuman Hasil Seleksi)",
      date: "07 Dzulqa'dah 1447 H",
      description: "Serentak dipublish via online (website) dan offline"
    }
  ],
  contacts: [
    {
      id: "c-1",
      name: "Syamsu Rijal, S.Pd.I.",
      phone: "+62 852-9992-9870",
      role: "Panitia Seleksi PMB"
    },
    {
      id: "c-2",
      name: "Dr. G. H. Aydi Syam, S.H.I., M.H.I.",
      phone: "+62 822-5109-6936",
      role: "Sekretariat Imtihan Qabul"
    }
  ],
  address: "Jalan Raya AG. H. Abdurrahman Ambo Dalle, Mangkoso, Kec. Soppeng Riaja, Kab. Barru, Sulawesi Selatan",
  notes: "Pendaftaran dibuka 17 Sya'ban 1447 H hingga 16 Ramadhan 1447 H via online dengan cara mengisi formulir online atau scan QR Code resmi.",
  documentationImages: [],
  customSections: []
};

export const INITIAL_NEWS: NewsItem[] = [];

export const INITIAL_NAVBAR_SETTINGS: NavbarSettings = {
  logoUrl: "/image_067524.png",
  brandTitle: "Ma'had Aly",
  brandSubtitle: "DDI Mangkoso",
  bgColor: "#064e3b",
  textColor: "#ffffff",
  isSticky: true,
  isTransparent: false,
  ctaButton: {
    text: "Kirim Tulisan",
    url: "/kirim-tulisan",
    isActive: true
  },
  navLinks: [
    { id: "nav-1", label: "Beranda", url: "/", order: 1, isActive: true },
    {
      id: "nav-2",
      label: "Tentang",
      url: "/profil",
      order: 2,
      isActive: true,
      children: [
        { id: "nav-2-1", label: "Sejarah Lembaga", url: "/profil#sejarah", order: 1, isActive: true },
        { id: "nav-2-2", label: "Visi & Misi", url: "/profil#visi-misi", order: 2, isActive: true },
        { id: "nav-2-3", label: "Masyayikh & Dewan Dosen", url: "/profil#masyayikh", order: 3, isActive: true },
        { id: "nav-2-4", label: "Struktur Organisasi", url: "/profil#struktur", order: 4, isActive: true },
        { id: "nav-2-5", label: "Sarana & Prasarana", url: "/profil#sarana", order: 5, isActive: true },
        { id: "nav-2-6", label: "Sertifikat Akreditasi", url: "/profil#akreditasi", order: 6, isActive: true }
      ]
    },
    {
      id: "nav-3",
      label: "Akademik",
      url: "/akademik",
      order: 3,
      isActive: true,
      children: [
        { id: "nav-3-1", label: "Kurikulum & Kitab Turats", url: "/akademik#kurikulum", order: 1, isActive: true },
        { id: "nav-3-2", label: "Kalender Akademik", url: "/akademik#kalender", order: 2, isActive: true },
        { id: "nav-3-3", label: "Takhassus Fiqh Mu'asarah", url: "/akademik#takhassus", order: 3, isActive: true },
        { id: "nav-3-4", label: "Muhadhir & Dosen", url: "/profil#masyayikh", order: 4, isActive: true },
        { id: "nav-3-5", label: "Pedoman Skripsi & Akademik", url: "/akademik#pedoman", order: 5, isActive: true }
      ]
    },
    { id: "nav-4", label: "Informasi", url: "/berita", order: 4, isActive: true, children: [
        { id: "nav-4-1", label: "Pengumuman", url: "/berita", order: 1, isActive: true },
        { id: "nav-4-2", label: "PMB Beasiswa", url: "/pmb", order: 2, isActive: true },
        { id: "nav-4-3", label: "Asesmen", url: "/asesmen", order: 3, isActive: true },
        { id: "nav-4-4", label: "Pengambilan Ijazah", url: "/pengambilan-ijazah", order: 4, isActive: true },
        { id: "nav-4-5", label: "Testimoni", url: "/testimoni", order: 5, isActive: true }
      ] },
    { id: "nav-5", label: "Kajian / Diskusi", url: "/kategori", order: 5, isActive: true },
    { id: "nav-6", label: "Mimbar Mahad", url: "/artikel", order: 6, isActive: true, children: [
        { id: "nav-6-1", label: "Semua Tulisan", url: "/artikel", order: 1, isActive: true },
        { id: "nav-6-2", label: "Para Penulis", url: "/penulis", order: 2, isActive: true },
        { id: "nav-6-3", label: "Kirim Tulisan", url: "/kirim-tulisan", order: 3, isActive: true }
      ] },
    { id: "nav-7", label: "Tautan", url: "/elibrary", order: 7, isActive: true, children: [
        { id: "nav-7-1", label: "Perpustakaan Digital", url: "/elibrary", order: 1, isActive: true },
        { id: "nav-7-2", label: "Repositori Skripsi", url: "/skripsi", order: 2, isActive: true },
        { id: "nav-7-3", label: "Jurnal", url: "/jurnal", order: 3, isActive: true },
        { id: "nav-7-4", label: "Koleksi Buku", url: "/buku", order: 4, isActive: true }
      ] },
    { id: "nav-8", label: "Infaq & Donasi", url: "/donasi", order: 8, isActive: true },
    { id: "nav-9", label: "DeMa", url: "/dema", order: 9, isActive: true },
    { id: "nav-10", label: "Kontak", url: "/kontak", order: 10, isActive: true }
  ],
  topBar: {
    isActive: true,
    hijriDateText: "Jum'at, 27 Rabi'ul Awwal 1448 H / 9 Oktober 2026",
    phone: "WA: 0857-5479-5186",
    email: "redaksi@mahadaly-ddimangkoso.ac.id",
    announcementText: "Penerimaan Mahasantri Baru (PMB) Marhalah Ula (M.1) Dibuka",
    quickLinkText: "E-Library Turats",
    quickLinkUrl: "/elibrary"
  },
  tickerBar: {
    isActive: true,
    badgeLabel: "Paling Populer",
    showSearch: true,
    tickerItems: [
      { id: "t-1", label: "Sesi Kedua Kuliah Umum Internasional IESCO Berlanjut di Maktabah Ma'had Aly: Di Mana Kalian, Wahai Orang Beriman, untuk Gaza?", url: "/berita/sesi-kedua-kuliah-umum-internasional-iesco-berlanjut-di-maktabah-mahad-aly-di-mana-kalian-wahai-orang-beriman-untuk-gaza-7561" },
      { id: "t-2", label: "Ma'had Aly DDI Mangkoso Gelar Kuliah Umum Internasional Bersama IESCO Malaysia, Ditandai Penandatanganan Kerja Sama", url: "/berita/mahad-aly-ddi-mangkoso-gelar-kuliah-umum-internasional-bersama-iesco-malaysia-ditandai-penandatanganan-kerja-sama-7308" },
      { id: "t-3", label: "Pesan Ulama di Balik Doa yang Belum Terkabul", url: "/artikel/pesan-ulama-di-balik-doa-yang-belum-terkabul-24" },
      { id: "t-4", label: "Pertemanan dalam Pandangan Islam: Membangun Hubungan Sosial Berlandaskan Iman dan Akhlak", url: "/artikel/pertemanan-dalam-pandangan-islam-membangun-hubungan-sosial-berlandaskan-iman-dan-akhlak-65" }
    ]
  }
};

export const INITIAL_HERO_SETTINGS: HeroSectionSettings = {
  logoUrl: "/image_067524.png",
  arabicBismillah: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  title: "Pendidikan Tinggi",
  titleHighlight: "Kader Ulama",
  subtitle: "Pusat kaderisasi ulama berwawasan wasathiyyah, berakar kuat pada tradisi sanad dan khazanah kitab klasik (Turats), serta berakhlakul karimah untuk kemaslahatan umat.",
  cta1Text: "Kenali Ma'had",
  cta1Url: "/tentang",
  cta2Text: "Baca Mimbar Kajian",
  cta2Url: "#mimbar-kajian",
  autoPlayInterval: 6000,
  slides: [
    {
      id: "slide-1",
      badge: "Pusat Kaderisasi Fuqaha Kontemporer",
      title: "Meneguhkan Khazanah Turats, Menjawab Dinamika Fiqh Kontemporer",
      titleHighlight: "",
      subtitle: "Pendidikan Tinggi Kader Ulama Takhassus Fiqh wa Usuluhu — Berakar kuat pada sanad keilmuan klasik Anregurutta, progresif merespons tantangan zaman.",
      arabicBismillah: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      cta1Text: "Jelajahi Kajian Fiqh",
      cta1Url: "/artikel",
      cta2Text: "Repositori Skripsi",
      cta2Url: "/skripsi",
      order: 1,
      isActive: true
    },
    {
      id: "slide-2",
      badge: "Marhalah Ula (M.1) Takhassus Fiqh wa Usuluhu",
      title: "Talaqqi Sanad Keilmuan Gurutta, Melahirkan Fuqaha Wasathiyyah",
      titleHighlight: "",
      subtitle: "Mengkaji kitab-kitab induk turats muktabarah dengan metode halaqah, ikhtibar matan, dan bimbingan langsung masyaikh DDI Mangkoso.",
      arabicBismillah: "تَفَقُّهٌ فِي الدِّيْنِ · بَصِيْرَةٌ فِي الزَّمَانِ · خِدْمَةٌ لِلْأُمَّةِ",
      cta1Text: "Profil & Sejarah",
      cta1Url: "/profil",
      cta2Text: "Pendaftaran PMB",
      cta2Url: "/pmb",
      order: 2,
      isActive: true
    },
    {
      id: "slide-3",
      badge: "Lembaga Bahtsul Masail & Riset Hukum",
      title: "Fatwa Hukum Islam Moderat & Bahtsul Masail Kontemporer",
      titleHighlight: "",
      subtitle: "Merumuskan solusi keagamaan berbasis qawa'id fiqhiyyah untuk problematika sains, ekonomi digital, dan bioetika modern.",
      arabicBismillah: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      cta1Text: "Hasil Bahtsul Masail",
      cta1Url: "/bahtsul-masail",
      cta2Text: "Infaq & Donasi",
      cta2Url: "/donasi",
      order: 3,
      isActive: true
    }
  ],
  metrics: [
    { id: "m-1", value: "M.1", label: "Jenjang Marhalah Ula" },
    { id: "m-2", value: "4 Tahun", label: "Masa Pengkaderan" },
    { id: "m-3", value: "100%", label: "Beasiswa Penuh" },
    { id: "m-4", value: "Turats", label: "Sanad Kitab Salaf" }
  ]
};

export const INITIAL_HOME_SECTIONS: HomeSectionConfigItem[] = [
  { id: "sec-hero", name: "hero", label: "Hero Banner & Metrik", isActive: true, order: 1 },
  { id: "sec-quote", name: "quote", label: "Kalam Hikmah (Quote Salaf)", isActive: false, order: 2 },
  { id: "sec-kalam-anregurutta", name: "kalam_anregurutta", label: "Kalam Anregurutta (Foto dan Putaran Kalam)", isActive: true, order: 3 },
  { id: "sec-about", name: "about", label: "Pilar Pendidikan (Tentang Kami)", isActive: true, order: 4 },
  { id: "sec-categories", name: "categories", label: "Kategori Kajian Fiqh", isActive: true, order: 5 },
  { id: "sec-articles", name: "articles", label: "Artikel Fiqh Terbaru", isActive: true, order: 6, maxItems: 6 },
  { id: "sec-theses", name: "theses", label: "Repositori Skripsi Mahasantri", isActive: true, order: 7, maxItems: 4 },
  { id: "sec-donations", name: "donasi", label: "Infaq & Program Donasi Pilihan", isActive: true, order: 8, maxItems: 3, badge: "Amal Jariyah & Infaq", title: "Dukung Kaderisasi Ulama Fiqh", subtitle: "Salurkan infaq terbaik Anda untuk riset mahasantri, orang tua asuh, dan sarana Ma'had Aly." },
  { id: "sec-bahtsul", name: "bahtsul", label: "Bahtsul Masail Fiqh Mu'asarah", isActive: true, order: 9, maxItems: 3, badge: "Kajian Fatwa Fiqh", title: "Bahtsul Masail & Tanya Jawab Fiqh", subtitle: "Hasil musyawarah fatwa mahasantri dan dewan masyaikh berlandaskan kitab turats muktabarah." },
  { id: "sec-pmb", name: "pmb", label: "Informasi PMB Online (Pendaftaran)", isActive: true, order: 10, badge: "Penerimaan Mahasantri Baru", title: "Jadilah Generasi Ulama Fiqh Masa Depan", subtitle: "Pendaftaran jenjang Marhalah Ula (M.1) Takhassus Fiqh wa Usuluhu Ma'had Aly DDI Mangkoso." },
  { id: "sec-news", name: "news", label: "Warta & Berita Terkini", isActive: true, order: 11, maxItems: 3 },
  { id: "sec-submission", name: "submission", label: "CTA Kirim Tulisan Santri", isActive: true, order: 12, badge: "Mimbar Penulis", title: "Punya Risalah Ilmiah atau Opini Fiqh?", subtitle: "Kirimkan karya tulis Anda untuk ditinjau oleh Dewan Redaksi Ma'had Aly DDI Mangkoso." }
];

export const INITIAL_ABOUT_CONTENT: AboutPageContent = {
  title: "Profil Ma'had Aly DDI Mangkoso",
  subtitle: "Mencetak Ulama Pewaris Para Nabi Berwawasan Wasathiyyah dan Berintegritas Turats.",
  badge: "Tentang Lembaga",
  historyTitle: "Sejarah Lembaga",
  historyNarrative: "Ma'had Aly DDI Mangkoso didirikan di Kompleks Pondok Pesantren DDI Mangkoso, Barru, Sulawesi Selatan. Pendirian lembaga pendidikan tinggi kader ulama ini lahir dari keprihatinan yang mendalam dari AGH. Prof. Dr. M. Faried Wadjedy, MA bersama para masyaikh atas semakin langkanya ulama fukaha di tengah perkembangan zaman.\n\nMelanjutkan estafet cita-cita pendiri utama Darud Da'wah wal Irsyad (DDI), AGH. Abdurrahman Ambo Dalle, Ma'had Aly DDI Mangkoso disiapkan secara khusus untuk menggembleng santri-santri pilihan melalui masa studi 4 tahun (8 semester) pada jenjang Marhalah Ula (M.1).",
  historyArabic: "تَأْسِيْسُ مَعْهَدِ عَالِي لِتَخْرِيْجِ عُلَمَاءِ الْفِقْهِ الْمُعَاصِرِ عَلَى مَنْهَجِ أَهْلِ السُّنَّةِ وَالْجَمَاعَةِ",
  visi: "Menjadi pusat keunggulan pendidikan kader ulama tingkat tinggi di Indonesia timur yang kokoh dalam sanad turats klasik, berakhlak mulia, dan mumpuni dalam merespon persoalan hukum Islam kontemporer.",
  misi: [
    "Menyelenggarakan kajian kutubut turats dengan sanad yang bersambung.",
    "Membina nalar kritis metodologi istinbath hukum Islam (Usul Fikih).",
    "Menerapkan nilai keteladanan akhlak dan keikhlasan santri salaf.",
    "Membekali mahasantri dengan kecakapan Bahtsul Masail kontemporer."
  ],
  halaqahTitle: "Sistem Halaqah Murni",
  halaqahDesc: "Pembelajaran berpusat pada majelis halaqah talaqqi langsung di hadapan para masyaikh dengan sanad keilmuan yang muttashil.",
  beasiswaTitle: "Beasiswa Penuh 100%",
  beasiswaDesc: "Seluruh mahasantri yang lulus seleksi ketat mendapatkan beasiswa pendidikan dan asrama secara penuh melalui program Orang Tua Asuh.",
  kurikulumTitle: "Jenjang Marhalah Ula (M.1)",
  kurikulumDesc: "Pendidikan setara sarjana (S1) dengan konsentrasi Fiqh wa Usuluhu, berfokus pada Fiqh Mu'asarah (Fiqh Kontemporer)."
};

export const INITIAL_PAGE_TEXTS: PageTextsSettings = {
  // Halaman Publikasi Artikel / Fiqh (/artikel)
  artikelBadge: "Publikasi Ilmiah Takhassus",
  artikelTitle: "Mimbar Kajian Fiqh Mu'asarah",
  artikelDesc: "Kumpulan artikel telaah hukum Islam kontemporer, kajian ushul fikih, dan risalah pemikiran ulama DDI Mangkoso.",
  artikelFiqhTabLabel: "Kajian Fiqh Mu'asarah",
  artikelOpiniTabLabel: "Opini & Refleksi Santri",

  // Halaman Opini & Refleksi Santri (/opini)
  opiniBadge: "Ruang Gagasan Santri & Esai",
  opiniTitle: "Mimbar Opini & Refleksi Santri",
  opiniDesc: "Refleksi sosial keagamaan, catatan adab santri, dan esai pemikiran mahasantri serta asatidz Ma'had Aly DDI Mangkoso.",

  // Halaman Profil Lembaga (/profil)
  profilBadge: "Identitas & Sejarah Lembaga",
  profilTitle: "Profil Ma'had Aly DDI Mangkoso",
  profilDesc: "Pusat Pendidikan Tinggi Kader Ulama Takhassus Fiqh wa Usuluhu Berfokus pada Fiqh Mu'asarah.",
  profilMasyaikhTitle: "Masyayikh & Dewan Dosen Pengampu",
  profilMasyaikhDesc: "Pendidik & Ulama Otoritatif Turats & Fiqh Mu'asarah",
  profilSejarahTitle: "Sejarah Berdirinya Lembaga",
  profilSejarahDesc: "Napak tilas perjuangan keilmuan para muassis DDI Mangkoso dalam mendirikan pusat kaderisasi fukaha.",
  profilVisiTitle: "Visi & Misi Lembaga",
  profilSaranaTitle: "Sarana & Prasarana Pembelajaran",
  profilAkreditasiTitle: "Akreditasi & Legalitas Resmi",

  // Halaman Akademik (/akademik)
  akademikBadge: "Struktur Pendidikan & Kurikulum",
  akademikTitle: "Akademik Fiqh wa Usuluhu",
  akademikDesc: "Pendidikan intensif 4 tahun (8 Semester) jenjang Marhalah Ula dengan kurikulum terpadu Turats Salaf dan Riset Fiqh Mu'asarah.",
  akademikTakhassusBadge: "Program Takhassus",
  akademikTakhassusTitle: "Fiqh wa Usuluhu",
  akademikTakhassusDesc: "Program ini membina kemampuan mahasantri dalam membaca naskah klasik tanpa harakat, memahami konteks sosio-historis teks fiqih, dan menguasai kaidah tarjih lintas madzhab.",
  akademikFokusBadge: "Fokus Spesialisasi Utama",
  akademikFokusTitle: "Fiqh Mu'asarah (Fiqih Kontemporer)",
  akademikFokusDesc: "Mahasantri dibekali keterampilan istinbath hukum atas isu-isu mutakhir: transaksi kripto, fintech syariah, bioetika medis, kecerdasan buatan (AI), green economy, dan hukum kewarganegaraan modern.",
  akademikKurikulumTitle: "Struktur Kurikulum 8 Semester",
  akademikKurikulumDesc: "Kurikulum komprehensif mengintegrasikan kajian kitab turats mu'tabarah dengan metodologi riset ilmiah modern.",
  akademikKalenderTitle: "Kalender Akademik",
  akademikPedomanTitle: "Buku Pedoman Akademik",
  akademikPedomanDesc: "Panduan resmi sistem SKS halaqah, tata tertib mahasantri, kurikulum turats, dan pedoman penulisan risalah skripsi.",
  akademikPenilaianTitle: "Sistem Penilaian & Kelulusan",
  akademikPenilaianDesc: "Sistem penilaian menggabungkan pengujian hafalan matan turats (ikhtibar), penguasaan qawa'id fiqhiyyah, keaktifan halaqah Bahtsul Masail, serta penulisan risalah ilmiah skripsi (munaqasyah) dengan predikat Mumtaz.",

  // Halaman Skripsi (/skripsi)
  skripsiBadge: "Repositori Riset Mahasantri (M.1)",
  skripsiTitle: "Skripsi & Risalah Fiqh Mu'asarah",
  skripsiDesc: "Karya ilmiah orisinal mahasantri Marhalah Ula Ma'had Aly DDI Mangkoso dalam merespons dinamika hukum Islam kontemporer.",
  skripsiSubmitTitle: "Setor Skripsi Alumni & Mahasantri",
  skripsiSubmitDesc: "Khusus alumni dan mahasantri tingkat akhir Ma'had Aly DDI Mangkoso yang ingin menyetor risalah skripsi ke dalam repositori digital resmi.",

  // Halaman Berita & Warta (/berita)
  beritaBadge: "Warta & Informasi Terkini",
  beritaTitle: "Warta & Agenda Ma'had Aly",
  beritaDesc: "Kabar aktivitas akademis, halaqah ilmiah, bahtsul masail, dan dinamika kelembagaan Ma'had Aly DDI Mangkoso.",

  // Halaman Kirim Tulisan (/kirim-tulisan)
  kirimBadge: "Pusat Pengajuan Naskah",
  kirimTitle: "Kirim Tulisan & Naskah Ilmiah",
  kirimDesc: "Wadah publikasi karya ilmiah, telaah fiqh mu'asarah, skripsi alumni, dan refleksi santri bagi civitas akademika dan umum.",
  kirimPanduanTitle: "Panduan & Ketentuan Pengiriman Naskah",
  kirimPanduanDesc: "Naskah yang diajukan akan melalui proses penelaahan oleh Dewan Redaksi sebelum diterbitkan resmi.",

  // Halaman Kontak (/kontak)
  kontakBadge: "Pusat Informasi & Layanan",
  kontakTitle: "Hubungi Ma'had Aly",
  kontakDesc: "Silakan hubungi sekretariat atau datang langsung ke kampus Ma'had Aly DDI Mangkoso.",
  kontakSekretariatTitle: "Sekretariat & Layanan Informasi",
  kontakSekretariatDesc: "Pusat bantuan administrasi, akademik, pendaftaran mahasantri baru, dan konsultasi Bahtsul Masail.",

  // Elemen Kustom Tambahan
  customElements: []
};

// ══════════════════════════════════════════════════════════════
// 10. PROGRAM DONASI, INFAQ & WAKAF RESMI MA'HAD ALY
// ══════════════════════════════════════════════════════════════

export const INITIAL_SECURITY_THREATS: SecurityThreatLog[] = [];

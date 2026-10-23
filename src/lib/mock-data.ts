import {
  Article,
  CategoryInfo,
  Thesis,
  NewsItem,
  SiteSettings,
  AdminUser,
  ActivityLog,
  MediaItem,
  HeroSectionData,
  QuoteSectionData,
  SeoSettings,
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
  SocialMediaSettings,
  FooterSettings,
  FooterNavLink,
  FooterFocusItem,
  NavbarSettings,
  NavbarLink,
  HeroMetricItem,
  HeroSectionSettings,
  HomeSectionConfigItem,
  EmailTemplateItem,
  AboutPageContent,
  PageTextsSettings,
  DonationProgram,
  SecurityThreatLog,
  MaintenanceConfig,
  DemaSettings,
  DemaDivision,
  DemaMember,
  OrganizationMember
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
  ogImage: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1200&q=80",
  googleAnalyticsId: "G-EBBP80BZWL",
  searchConsoleCode: "google-site-verification-mangkoso-example",
  enableSitemap: true
};

export const INITIAL_SOCIAL_MEDIA: SocialMediaSettings = {
  facebook: "https://facebook.com/mahadalyddimangkoso",
  instagram: "https://instagram.com/mahadalyddimangkoso",
  youtube: "https://youtube.com/@mahadalyddimangkoso",
  whatsapp: "+62 812-3456-7890",
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
  whatsapp: "+62 812-3456-7890",
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
  { id: "ffoc-1", name: "Usul Fikih & Qawa'id Fiqhiyyah", icon: "⚖️", position: 1, isActive: true },
  { id: "ffoc-2", name: "Fiqh Muqaran (Perbandingan Madzhab)", icon: "📖", position: 2, isActive: true },
  { id: "ffoc-3", name: "'Ulumul Qur'an & Tafsir Turats", icon: "✨", position: 3, isActive: true },
  { id: "ffoc-4", name: "Dirasah Hadits wa Rijaluha", icon: "📜", position: 4, isActive: true },
  { id: "ffoc-5", name: "Manuskrip Gurutta Ambo Dalle", icon: "👑", position: 5, isActive: true }
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
  whatsappNumber: "+62 812-4234-xxxx",
  whatsappLabel: "Hubungi WhatsApp Sekretariat",
  email: "redaksi@mahadaly-ddimangkoso.my.id",
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
  phone: "+62 812-3456-7890",
  emailSubmission: "munzirahmad779@gmail.com",
  targetSubmissionEmails: ["munzirahmad779@gmail.com"],
  visi: "Mencetak ulama yang berkarakter, yang mampu mengintegrasikan nilai-nilai khuluqiyyah, ilmiah dan amaliah serta memiliki reputasi keulamaan sebagai ahli waris para nabi.",
  misi: [
  "Menyelenggarakan pendidikan kader ulama yang menerapkan sistem intensifikasi pengkajian, penguatan pada ilmu-ilmu alat (usûl), pendalaman dan pengayaan pada ilmu-ilmu keislaman yang langsung merujuk kepada kitab-kitab sumbernya yang asli."
],
  historyContent: "Berangkat dari keprihatinan atas merosotnya bekal keulamaan di sebagian besar pondok pesantren akibat kurangnya kiyai berkapasitas ulama, akumulasi kurikulum yang menyita porsi ilmu keislaman, serta tantangan zaman dan perkembangan ICT yang berdampak negatif, Pondok Pesantren Pusat Darud Da'wah wal-Irsyad Abdurrahman Ambo Dalle Mangkoso mendirikan Al-Ma'had Al-'Aliy untuk mencetak kader ulama yang berkarakter dan mengintegrasikan ilmu, amal, serta moral.\nPengajian kitab kuning di pondok pesantren ini sudah berjalan sejak berdirinya pada tanggal 21 Desember 1938 dan tidak pernah terhenti sampai sekarang, sehingga budaya membaca kitab kuning bukanlah hal yang baru di pesantren ini.\nPenyelenggaraan ini didukung oleh potensi yang dimiliki pesantren, di antaranya keberadaan ulama dan asatizah yang berkemampuan mengajarkan kitab kuning dan putih, santri dalam jumlah banyak, koleksi kitab mu'tabar yang cukup, serta alumni yang telah menyelesaikan pendidikan tingkat doktor di berbagai disiplin ilmu keislaman baik di dalam maupun luar negeri.",
  historyArabic: "تأسس المعهد العالي لمعهد دار الدعوة والإرشاد عبد الرحمن عبو دالي منغكوسو لمعالجة ندرة العلماء وتحديات العصر، بهدف إعداد كوادر علماء ذوي شخصية متميزة. وتقاليد دراسة الكتب الصفراء في هذا المعهد مستمرة منذ ٢١ ديسمبر ١٩٣٨ حتى الآن.",
  gradingSystemRules: "Sistem penilaian menggabungkan pengujian hafalan matan turats (ikhtibar), penguasaan qawa'id fiqhiyyah, keaktifan halaqah Bahtsul Masail, serta penulisan risalah ilmiah skripsi (munaqasyah) dengan standar kelulusan predikat Mumtaz (Cum Laude).",
  academicGuideBookUrl: "https://drive.google.com/file/d/pedoman-akademik-mahad-aly-2026/view?usp=sharing",
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

export const INITIAL_LECTURERS: Lecturer[] = [
  {
    id: "lec-1",
    name: "AGH. Prof. Dr. M. Faried Wadjedy, MA",
    title: "Guru Besar Fiqh & Mudir Ma'had Aly",
    role: "Mudir Ma'had Aly / Pengampu Fiqh Turats",
    photoUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80",
    expertise: "Kutubut Turats, Ushul Fikih & Fatwa Wasathiyyah",
    education: [
      "S1 Al-Azhar University, Cairo",
      "S2 UIN Alauddin Makassar",
      "S3 UIN Syarif Hidayatullah Jakarta"
    ],
    publications: [
      "Fiqh Muqaran dalam Perspektif Kemaslahatan",
      "Metodologi Fatwa Wasathiyyah Ulama Nusantara"
    ],
    order: 1,
    isActive: true
  },
  {
    id: "lec-2",
    name: "Ust. M. Idrus, M.Ag.",
    title: "Kepala Bidang Akademik",
    role: "Wakil Mudir I (Bidang Akademik)",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    expertise: "Ushul Fikih, Qawa'id Fiqhiyyah & Fiqh Muamalah Digital",
    education: [
      "S1 Ma'had Aly DDI Mangkoso",
      "S2 UIN Sunan Kalijaga Yogyakarta"
    ],
    publications: [
      "Dialektika Nalar Ushul Fikih dalam Smart Contract",
      "Takhrij Fiqhiyyah Transaksi Fintech Syariah"
    ],
    order: 2,
    isActive: true
  },
  {
    id: "lec-3",
    name: "Ismail Hannanong, Lc., M.H.",
    title: "Dosen Senior Fiqh Medis",
    role: "Pengampu Fiqh Medis & Bioetika",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    expertise: "Fiqh Medis, Bioetika Kedokteran & Bahtsul Masail",
    education: [
      "S1 Fakultas Syariah Wal Qanun Al-Azhar Cairo",
      "S2 Ilmu Hukum UMI Makassar"
    ],
    publications: [
      "Tinjauan Syariat atas Transplantasi Organ Kadaver",
      "Etika Rekayasa Genetika dalam Perspektif Maqashid"
    ],
    order: 3,
    isActive: true
  },
  {
    id: "lec-4",
    name: "Ust. H. Syahrul, M.Pd.I.",
    title: "Dosen Qawa'id Fiqhiyyah",
    role: "Pengampu Kaidah Fikih Asasiyah",
    photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
    expertise: "Al-Qawa'id al-Fiqhiyyah & Metodologi Bahtsul Masail",
    education: [
      "S1 STAI DDI Mangkoso",
      "S2 Magister Pendidikan Islam UIN Alauddin"
    ],
    publications: [
      "Aplikasi Kaidah Ad-Dhararu Yuzal pada Krisis Lingkungan"
    ],
    order: 4,
    isActive: true
  }
];

export const INITIAL_FACILITIES: Facility[] = [
  {
    id: "fac-1",
    name: "Masjid & Halaqah Utama",
    category: "Masjid",
    photoUrl: "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=600&q=80",
    description: "Pusat pengajian wetonan, sorogan subuh, dan mudzakarah kitab kuning salaf bersama Masyaikh."
  },
  {
    id: "fac-2",
    name: "Perpustakaan Turats & Digital",
    category: "Perpustakaan",
    photoUrl: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=600&q=80",
    description: "Koleksi ribuan jilid kitab rujukan primer fiqh madzhab empat, manuskrip ulama Nusantara, dan terminal e-Library."
  },
  {
    id: "fac-3",
    name: "Asrama Mahasantri Marhalah Ula",
    category: "Asrama",
    photoUrl: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80",
    description: "Fasilitas mukim santri 24 jam dengan bimbingan akhlakul karimah dan pembiasaan percakapan bahasa Arab fushah."
  },
  {
    id: "fac-4",
    name: "Aula Sidang Munaqasyah & Simposium",
    category: "Aula",
    photoUrl: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=600&q=80",
    description: "Ruang representatif untuk penyelenggaraan sidang skripsi, seminar nasional, dan forum Bahtsul Masail."
  }
];

export const INITIAL_ACCREDITATIONS: Accreditation[] = [
  {
    id: "acc-1",
    name: "Izin Operasional Penyelenggaraan Marhalah Ula (S-1)",
    issuer: "Direktorat Pendidikan Diniyah dan Pondok Pesantren Kemenag RI",
    validDate: "Berlaku Permanen",
    pdfUrl: "https://drive.google.com/file/d/sk-izin-operasional-mahad-aly/view?usp=sharing",
    fileSize: "2.1 MB",
    status: "Resmi Kemenag"
  },
  {
    id: "acc-2",
    name: "Akreditasi Majelis Masyayikh Pendidikan Pesantren",
    issuer: "Majelis Masyayikh Nasional",
    validDate: "Hingga 2029",
    pdfUrl: "https://drive.google.com/file/d/sertifikat-akreditasi-mahad-aly/view?usp=sharing",
    fileSize: "3.4 MB",
    status: "Terakreditasi Baik Sekali"
  }
];

export const INITIAL_COURSES: Course[] = [
  {
    id: "crs-1",
    name: "Mabadi' Ushul Fiqh & Madkhal Ila al-Fiqh",
    semester: 1,
    credits: 3,
    mainBook: "Al-Waraqat & Syarah Al-Mahalli",
    supportBook: "Tashil at-Turuqat",
    lecturer: "Ust. M. Idrus, M.Ag.",
    description: "Pengantar metodologi istinbath hukum dasar dan pemetaan mazhab-mazhab fiqh."
  },
  {
    id: "crs-2",
    name: "Dirasah Matan Fathul Qarib al-Mujib",
    semester: 1,
    credits: 4,
    mainBook: "Fathul Qarib al-Mujib",
    supportBook: "Hasyiyah al-Bajuri",
    lecturer: "Dewan Masyaikh",
    description: "Kajian mendalam bab ibadah dan thaharah dengan pembacaan teks talaqqi."
  },
  {
    id: "crs-3",
    name: "Ushul Fiqh Lanjutan: Jam'ul Jawami'",
    semester: 3,
    credits: 4,
    mainBook: "Jam'ul Jawami' lil Imam as-Subki",
    supportBook: "Hasyiyah al-Bannani",
    lecturer: "AGH. Prof. Dr. M. Faried Wadjedy, MA",
    description: "Kaidah dalil qath'i-zhanni, ta'arudh al-adillah, dan rekonstruksi ijtihad."
  },
  {
    id: "crs-4",
    name: "Fiqh Muamalah Kontemporer & Fintech",
    semester: 5,
    credits: 3,
    mainBook: "Fiqh al-Mu'amalat al-Maliyyah al-Mu'ashirah",
    supportBook: "Fatwa DSN-MUI & Majma' Fiqh OKI",
    lecturer: "Ust. M. Idrus, M.Ag.",
    description: "Kajian hukum transaksi kripto, smart contract, e-commerce, dan perbankan syariah."
  },
  {
    id: "crs-5",
    name: "Fiqh Medis & Bioetika Kedokteran",
    semester: 6,
    credits: 3,
    mainBook: "Al-Ahkam al-Fiqhiyyah lil A'mal at-Thibbiyyah",
    supportBook: "Qadhaya Fiqhiyyah Mu'ashirah",
    lecturer: "Ismail Hannanong, Lc., M.H.",
    description: "Telaah hukum transplantasi organ, mati batang otak, vaksinasi, dan genetika."
  },
  {
    id: "crs-6",
    name: "Metodologi Riset Skripsi & Bahtsul Masail",
    semester: 7,
    credits: 4,
    mainBook: "Manhaj al-Bahts al-Ilmi & Takhrij al-Furu' 'ala al-Ushul",
    supportBook: "Kaidah Takhrij Fiqhiyyah",
    lecturer: "Tim Dosen Pembimbing Skripsi",
    description: "Praktik penyusunan naskah risalah ilmiah skripsi dan perumusan fatwa kolektif."
  }
];

export const INITIAL_CALENDAR: CalendarEvent[] = [
  {
    id: "cal-1",
    name: "Kuliah Perdana & Halaqah Sanad Turats Semester Ganjil",
    startDate: "01 September 2026",
    endDate: "05 September 2026",
    category: "kuliah",
    description: "Pembukaan perkuliahan dan ijazah sanad kitab-kitab induk fikih madzhab Syafi'i."
  },
  {
    id: "cal-2",
    name: "Ujian Tengah Semester (Ikhtibar Nisfi Syafahi & Tahriri)",
    startDate: "26 Oktober 2026",
    endDate: "02 November 2026",
    category: "ujian",
    description: "Evaluasi penguasaan matan kitab kuning dan pemahaman kaidah ushul fikih."
  },
  {
    id: "cal-3",
    name: "Simposium Nasional Bahtsul Masail Fiqh Mu'asarah",
    startDate: "15 November 2026",
    endDate: "17 November 2026",
    category: "kegiatan",
    description: "Forum musyawarah hukum Islam merespon isu-isu digital dan ekonomi syariah."
  },
  {
    id: "cal-4",
    name: "Sidang Munaqasyah Skripsi Mahasantri Angkatan VIII",
    startDate: "10 Desember 2026",
    endDate: "20 Desember 2026",
    category: "ujian",
    description: "Ujian pertahanan risalah ilmiah skripsi di hadapan dewan penguji masyaikh."
  }
];

export const INITIAL_BAHTSUL_QA: BahtsulMasailQA[] = [
  {
    id: "bm-1",
    title: "Hukum Pemanfaatan AI Generatif untuk Pembuatan Gambar Edukasi Agama",
    question: "Bagaimanakah status hukum kreasi visual berbasis Artificial Intelligence yang menghasilkan figur bernyawa untuk tujuan media dakwah dan edukasi?",
    answer: "Para fukaha Ma'had Aly bersepakat bahwa pemanfaatan AI yang tidak bertujuan menyembah figur visual dan semata-mata sebagai sarana wasilah taklim diperbolehkan (*al-ashlu fi al-asya' al-ibahah*), dengan tetap menjaga adab dan tidak memvisualisasikan para Nabi dan Malaikat.",
    theme: "Fiqh Digital & AI",
    author: "Lembaga Bahtsul Masail DDI Mangkoso",
    date: "02 Oktober 2026",
    status: "published",
    arabicReferences: "الأَصْلُ فِي الْمُعَامَلَاتِ الإِبَاحَةُ حَتَّى يَدُلَّ الدَّلِيْلُ عَلَى التَّحْرِيْمِ",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    attachmentUrl: "/docs/risalah-fatwa-ai-2026.pdf",
    attachmentName: "Risalah_Fatwa_AI_LBM_Mangkoso.pdf"
  },
  {
    id: "bm-2",
    title: "Status Uang Elektronik dan Saldo Paylater Ditinjau dari Akad Qardh & Sarf",
    question: "Apakah denda keterlambatan pada layanan paylater syariah termasuk riba nasi'ah?",
    answer: "Denda keterlambatan yang ditetapkan sebagai keuntungan penyedia adalah riba yang diharamkan. Namun jika denda tersebut dialokasikan 100% untuk dana kebajikan (ta'widh & qardhul hasan) tanpa menguntungkan kreditur, fatwa DSN-MUI memperbolehkannya sebagai ta'zir mali.",
    theme: "Fiqh Muamalah Kontemporer",
    author: "Lembaga Bahtsul Masail DDI Mangkoso",
    date: "28 September 2026",
    status: "published",
    imageUrl: "",
    attachmentUrl: ""
  }
];

export const INITIAL_PMB_WAVES: PMBWave[] = [
  {
    id: "pmb-1",
    name: "Gelombang I (Jalur Prestasi Tahfidz & Kitab Kuning)",
    startDate: "01 Januari 2027",
    endDate: "28 Februari 2027",
    quota: "15 Mahasantri",
    scholarshipInfo: "Beasiswa Penuh 100% (Bebas Biaya Kuliah, Asrama & Konsumsi)",
    requirements: [
      "Lulusan Pondok Pesantren / Madrasah Aliyah sederajat",
      "Memiliki hafalan Al-Qur'an minimal 5 Juz atau mutun ilmiyyah",
      "Mampu membaca dan memahami kitab kuning (Fathul Qarib/Taqrib)",
      "Surat rekomendasi pimpinan pesantren asal",
      "Lolos tes wawancara dan baca kitab"
    ],
    procedure: [
      "Mengisi formulir pendaftaran online di website Ma'had Aly",
      "Mengunggah berkas ijazah, KTP, dan surat rekomendasi",
      "Mengikuti seleksi tes baca kitab kuning dan hafalan",
      "Pengumuman hasil kelulusan dan penandatanganan pakta integritas"
    ],
    imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
    registrationLink: "https://bit.ly/pmb-mahadaly-mangkoso",
    brochureUrl: "/docs/brosur-pmb-2027.pdf"
  },
  {
    id: "pmb-2",
    name: "Gelombang II (Jalur Reguler Nusantara)",
    startDate: "01 Maret 2027",
    endDate: "30 April 2027",
    quota: "15 Mahasantri",
    scholarshipInfo: "Beasiswa 100% via Program Orang Tua Asuh DDI Mangkoso",
    requirements: [
      "Usia maksimal 22 tahun saat mendaftar",
      "Siap mukim di asrama selama 4 tahun penuh",
      "Lulus tes potensi akademik bahasa Arab dan fikih dasar"
    ],
    procedure: [
      "Pendaftaran via portal online",
      "Verifikasi berkas administratif",
      "Tes seleksi luring / daring",
      "Daftar ulang dan orientasi mahasantri baru"
    ],
    imageUrl: "",
    registrationLink: "https://bit.ly/pmb-mahadaly-mangkoso",
    brochureUrl: "/docs/brosur-pmb-2027.pdf"
  }
];

export const INITIAL_PMB_FAQS: PMBFAQ[] = [
  {
    id: "faq-1",
    question: "Apakah ada biaya kuliah di Ma'had Aly DDI Mangkoso?",
    answer: "Tidak ada (GRATIS 100%). Seluruh mahasantri yang lulus seleksi mendapatkan beasiswa penuh mencakup biaya pendidikan, asrama, dan konsumsi harian yang didanai melalui program Orang Tua Asuh Pesantren DDI Mangkoso.",
    category: "Biaya & Beasiswa"
  },
  {
    id: "faq-2",
    question: "Ijazah apa yang diperoleh setelah lulus 4 tahun?",
    answer: "Mahasantri yang menyelesaikan risalah skripsi dan munaqasyah berhak menyandang gelar Sarjana Agama (S.Ag.) yang diakui negara setara Strata Satu (S-1) berdasarkan regulasi Kementerian Agama RI.",
    category: "Akademik & Ijazah"
  },
  {
    id: "faq-3",
    question: "Apakah mahasantri dari luar Sulawesi Selatan boleh mendaftar?",
    answer: "Sangat terbuka! Ma'had Aly DDI Mangkoso menerima kader ulama dari seluruh pelosok Nusantara (Jawa, Sumatera, Kalimantan, Maluku, Papua, dll).",
    category: "Pendaftaran"
  }
];

export const INITIAL_SUBSCRIBERS: EmailSubscriber[] = [
  {
    id: "sub-1",
    email: "calon.santri@gmail.com",
    name: "Fahrurrozi",
    phone: "081234998877",
    pageTarget: "PMB Online 2027",
    subscribedAt: "05 Okt 2026"
  },
  {
    id: "sub-2",
    email: "peneliti.fiqh@gmail.com",
    name: "Ust. Burhanuddin",
    pageTarget: "Bahtsul Masail Live",
    subscribedAt: "04 Okt 2026"
  }
];

export const INITIAL_EMAIL_LOGS: EmailLog[] = [
  {
    id: "elog-1",
    to: "munzirahmad779@gmail.com",
    subject: "Notifikasi Naskah Masuk: Tinjauan Fiqh Mu'asarah atas Smart Contract",
    status: "Terkirim",
    timestamp: "Hari ini, 10:15 WITA"
  },
  {
    id: "elog-2",
    to: "ahmad.yusuf@santri.ac.id",
    subject: "Naskah Anda Telah Diterbitkan di Mimbar Kajian Ma'had Aly",
    status: "Terkirim",
    timestamp: "Hari ini, 10:18 WITA"
  }
];

export const INITIAL_GALLERY_ALBUMS: GalleryAlbum[] = [
  {
    id: "alb-1",
    title: "Simposium Nasional Fiqh Mu'asarah 2026",
    category: "Kegiatan Akademik",
    date: "06 Oktober 2026",
    coverUrl: "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=600&q=80",
    photos: [
      {
        id: "ph-1",
        url: "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=600&q=80",
        caption: "Pembukaan simposium oleh Mudir Ma'had Aly"
      },
      {
        id: "ph-2",
        url: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=600&q=80",
        caption: "Suasana halaqah sidang komisi fatwa digital"
      }
    ]
  },
  {
    id: "alb-2",
    title: "Talaqqi Sorogan Kitab Turats Subuh",
    category: "Halaqah Santri",
    date: "01 Oktober 2026",
    coverUrl: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=600&q=80",
    photos: [
      {
        id: "ph-3",
        url: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=600&q=80",
        caption: "Pembacaan matan Fathul Mu'in di Masjid Utama"
      }
    ]
  }
];

export const INITIAL_COMING_SOON_PAGES: ComingSoonPageSetting[] = [
  {
    id: "cs-1",
    slug: "bahtsul-masail",
    title: "Bahtsul Masail & Fatwa Online",
    isEnabled: true,
    releaseDate: "Desember 2026",
    description: "Pusat tanya jawab hukum Islam dan arsip fatwa Bahtsul Masail Fiqh Mu'asarah.",
    subscriberCount: 38
  },
  {
    id: "cs-2",
    slug: "pmb",
    title: "Penerimaan Mahasantri Baru (PMB Online)",
    isEnabled: true,
    releaseDate: "Januari 2027",
    description: "Sistem pendaftaran daring kader ulama Takhassus Fiqh wa Usuluhu beasiswa penuh 100%.",
    subscriberCount: 84
  },
  {
    id: "cs-3",
    slug: "jurnal",
    title: "Jurnal Ilmiah Fiqh Mu'asarah (OJS)",
    isEnabled: true,
    releaseDate: "Februari 2027",
    description: "Jurnal peer-reviewed terindeks SINTA untuk publikasi riset dosen dan mahasantri.",
    subscriberCount: 19
  },
  {
    id: "cs-4",
    slug: "buku",
    title: "Pustaka Buku & Risalah Anregurutta",
    isEnabled: true,
    releaseDate: "Maret 2027",
    description: "Katalog buku karya masyayikh DDI Mangkoso dalam format cetak dan digital.",
    subscriberCount: 27
  },
  {
    id: "cs-5",
    slug: "elibrary",
    title: "e-Library Turats & Maktabah Syamilah",
    isEnabled: true,
    releaseDate: "Maret 2027",
    description: "Perpustakaan digital kitab kuning, manuskrip kuno, dan tesis fiqh kontemporer.",
    subscriberCount: 42
  },
  {
    id: "cs-6",
    slug: "sekolah-menulis",
    title: "Sekolah Menulis Fuqaha Muda",
    isEnabled: true,
    releaseDate: "April 2027",
    description: "Program pelatihan penulisan opini ilmiah dan artikel populer fikih bagi mahasantri.",
    subscriberCount: 15
  }
];

export const INITIAL_PAGE_SEO: PageSeoItem[] = [
  {
    pageKey: "home",
    pageName: "Beranda Utama",
    title: "Ma'had Aly DDI Mangkoso — Pusat Kaderisasi Ulama Fiqh Mu'asarah",
    description: "Pendidikan Tinggi Keagamaan Islam Kader Ulama Takhassus Fiqh wa Usuluhu di Kompleks Pondok Pesantren DDI Mangkoso, Barru.",
    keywords: "mahad aly, ddi mangkoso, fiqh muasarah, ushul fikih, santri, beasiswa ulama",
    ogImage: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1200&q=80"
  },
  {
    pageKey: "profil",
    pageName: "Profil Lembaga",
    title: "Profil & Sejarah Ma'had Aly DDI Mangkoso — Kaderisasi Ulama",
    description: "Sejarah pendirian, visi misi, profil masyaikh dewan dosen, struktur organisasi, dan sertifikat akreditasi resmi Kemenag RI.",
    keywords: "profil mahad aly, sejarah ddi mangkoso, ambo dalle, faried wadjedy",
    ogImage: "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80"
  },
  {
    pageKey: "akademik",
    pageName: "Akademik & Kurikulum",
    title: "Akademik, Kurikulum 8 Semester & Kalender — Ma'had Aly DDI Mangkoso",
    description: "Struktur kurikulum Takhassus Fiqh wa Usuluhu, daftar kitab rujukan salaf, kalender akademik, dan pedoman studi sarjana (S.Ag.).",
    keywords: "kurikulum mahad aly, fiqh wa usuluhu, kitab kuning, kalender akademik",
    ogImage: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80"
  },
  {
    pageKey: "kajian",
    pageName: "Mimbar Kajian Fiqh",
    title: "Mimbar Kajian Fiqh Mu'asarah — Ma'had Aly DDI Mangkoso",
    description: "Kumpulan artikel ilmiah dan fatwa kontemporer seputar fintech, bioetika medis, AI, lingkungan, dan maqashid syariah.",
    keywords: "artikel fiqh, fiqh kontemporer, fatwa digital, bahtsul masail",
    ogImage: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1200&q=80"
  },
  {
    pageKey: "publikasi",
    pageName: "Repositori Skripsi",
    title: "Repositori Risalah Skripsi Mahasantri — Ma'had Aly DDI Mangkoso",
    description: "Koleksi skripsi mahasantri tingkat sarjana kader ulama lengkap dengan abstrak dwibahasa dan tautan unduh naskah PDF Google Drive.",
    keywords: "skripsi mahad aly, repositori karya ilmiah, download pdf skripsi fiqh",
    ogImage: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80"
  },
  {
    pageKey: "pmb",
    pageName: "PMB Online",
    title: "Penerimaan Mahasantri Baru (PMB) Beasiswa 100% — Ma'had Aly DDI Mangkoso",
    description: "Informasi jadwal pendaftaran, persyaratan berkas, alur seleksi baca kitab kuning, dan fasilitas beasiswa penuh kader ulama.",
    keywords: "pmb mahad aly 2027, beasiswa santri, pendaftaran kader ulama mangkoso",
    ogImage: "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80"
  },
  {
    pageKey: "kontak",
    pageName: "Kontak & Lokasi",
    title: "Hubungi Ma'had Aly DDI Mangkoso — Kompleks Pesantren Barru",
    description: "Alamat resmi kampus, nomor WhatsApp layanan informasi, email redaksi naskah, dan peta lokasi di Barru, Sulawesi Selatan.",
    keywords: "alamat mahad aly mangkoso, nomor whatsapp ddi mangkoso, email redaksi",
    ogImage: "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80"
  }
];

export const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: "usr-1",
    name: "Ahmad Yusuf Mubarak",
    email: "munzirahmad779@gmail.com",
    role: "Super Admin",
    status: "Aktif",
    lastLogin: "Hari ini, 21:40 WITA"
  },
  {
    id: "usr-2",
    name: "Redaksi Bahtsul Masail",
    email: "bahtsulmasail@ddimangkoso.ac.id",
    role: "Editor",
    status: "Aktif",
    lastLogin: "Kemarin, 14:12 WITA"
  },
  {
    id: "usr-3",
    name: "Biro Akademik & Mahasantri",
    email: "akademik@ddimangkoso.ac.id",
    role: "Penulis",
    status: "Aktif",
    lastLogin: "3 hari lalu"
  }
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: "log-init-1",
    user: "Super Admin",
    action: "Inisialisasi Sistem",
    target: "Konfigurasi Portal Resmi Ma'had Aly DDI Mangkoso",
    timestamp: "Baru saja"
  }
];

export const INITIAL_MEDIA: MediaItem[] = [
  {
    id: "med-1",
    name: "logo-mahad-aly-vector.png",
    url: "/image_067524.png",
    size: "245 KB",
    type: "image",
    uploadedAt: "06 Okt 2026"
  },
  {
    id: "med-2",
    name: "gedung-kampus-mangkoso.jpg",
    url: "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=800&q=80",
    size: "1.2 MB",
    type: "image",
    uploadedAt: "04 Okt 2026"
  },
  {
    id: "med-3",
    name: "pedoman-penulisan-skripsi-2026.pdf",
    url: "https://drive.google.com/file/d/pedoman-skripsi-contoh",
    size: "2.8 MB",
    type: "pdf",
    uploadedAt: "01 Okt 2026"
  }
];

export const INITIAL_CATEGORIES: CategoryInfo[] = [
  {
    id: "cat-1",
    slug: "fiqh-muamalah-kontemporer",
    name: "Fiqh Muamalah Kontemporer",
    description: "Kajian hukum transaksi keuangan digital, fintech syariah, kripto, e-commerce, asuransi syariah, dan instrumen pasar modal modern.",
    iconName: "wallet"
  },
  {
    id: "cat-2",
    slug: "fiqh-medis-bioetika",
    name: "Fiqh Medis & Bioetika",
    description: "Telaah hukum kedokteran terkini: transplantasi organ, rekayasa genetika, bayi tabung, vaksinasi, dan fatwa etika medis.",
    iconName: "heart-pulse"
  },
  {
    id: "cat-3",
    slug: "fiqh-digital-teknologi",
    name: "Fiqh Digital & AI",
    description: "Respon syariat atas perkembangan kecerdasan buatan (AI), privasi data, etika media sosial, hak cipta digital, dan aset virtual (NFT).",
    iconName: "cpu"
  },
  {
    id: "cat-4",
    slug: "fiqh-lingkungan",
    name: "Fiqh Lingkungan & Green Economy",
    description: "Prinsip hifzh al-bi'ah, mitigasi perubahan iklim, energi terbarukan, dan konservasi alam dari sudut pandang maqashid syariah.",
    iconName: "leaf"
  },
  {
    id: "cat-5",
    slug: "fiqh-ekonomi-syariah",
    name: "Fiqh Ekonomi & Bisnis Syariah",
    description: "Analisis kontrak bisnis modern, perbankan syariah, sukuk, filantropi Islam (ZISWAF produktif), dan keadilan distribusi kekayaan.",
    iconName: "chart-line"
  },
  {
    id: "cat-6",
    slug: "fiqh-keluarga-kontemporer",
    name: "Fiqh Keluarga Kontemporer",
    description: "Dinamika hukum keluarga Islam, bimbingan pranikah, perlindungan hak anak dan perempuan, serta pencegahan kekerasan domestik.",
    iconName: "users"
  },
  {
    id: "cat-7",
    slug: "maqashid-syariah",
    name: "Maqashid Syari'ah",
    description: "Filsafat hukum Islam, hierarki dharuriyyat-hajiyyat-tahsiniyyat, dan penerapannya dalam formulasi kebijakan publik umat.",
    iconName: "compass"
  },
  {
    id: "cat-8",
    slug: "ushul-fikih",
    name: "Ushul Fikih",
    description: "Metodologi istinbath hukum salaf, kaidah dalil qath'i-zhanni, ta'arudh al-adillah, dan rekonstruksi ijtihad jama'i masa kini.",
    iconName: "scale"
  },
  {
    id: "cat-9",
    slug: "qawaid-fiqhiyyah",
    name: "Qawa'id Fiqhiyyah",
    description: "Kaidah-kaidah asasiyah fikih (Al-Umuru bi Maqashidiha, Ad-Dhararu Yuzal, dll.) sebagai pisau bedah problematika kontemporer.",
    iconName: "shapes"
  },
  {
    id: "cat-10",
    slug: "fiqh-muqaran",
    name: "Fiqh Muqaran (Perbandingan Madzhab)",
    description: "Studi komparatif lintas madzhab empat dalam menentukan pendapat yang paling maslahat dan rajih bagi kemaslahatan masyarakat.",
    iconName: "book-open",
    type: "artikel"
  },
  {
    id: "cat-11",
    slug: "karya-anregurutta",
    name: "Karya Anregurutta",
    description: "Khazanah manuskrip, fatwa, dan risalah pemikiran AGH. Abdurrahman Ambo Dalle serta para masyayikh DDI Mangkoso.",
    iconName: "crown",
    type: "artikel"
  },
  {
    id: "cat-opini-1",
    slug: "opini-santri",
    name: "Opini Santri",
    description: "Gagasan, pandangan kritis, dan sudut pandang mahasantri atas dinamika keagamaan, sosial, dan kebangsaan.",
    iconName: "pen-tool",
    type: "opini"
  },
  {
    id: "cat-opini-2",
    slug: "refleksi-pesantren",
    name: "Refleksi Pesantren & Kehidupan",
    description: "Renungan spiritual, catatan adab thalabul ilmi, dan hikmah keseharian santri di pondok pesantren.",
    iconName: "feather",
    type: "opini"
  },
  {
    id: "cat-opini-3",
    slug: "kolom-pemikiran",
    name: "Kolom Pemikiran & Moderasi",
    description: "Esai pemikiran Islam wasathiyyah, harmoni sosial, dan dialektika tradisi pesantren dengan kemajuan zaman.",
    iconName: "sparkles",
    type: "opini"
  },
  {
    id: "cat-opini-4",
    slug: "sosial-budaya",
    name: "Sosial Budaya Nusantara",
    description: "Sorotan budaya, kearifan lokal, dan transformasi sosial masyarakat dari kacamata santri.",
    iconName: "globe",
    type: "opini"
  }
];

export const INITIAL_ARTICLES: Article[] = [
  {
    id: "art-1",
    slug: "hukum-transaksi-smart-contract-dan-kripto-fiqh-muamalah",
    title: "Tinjauan Fiqh Mu'asarah atas Smart Contract dan Aset Kripto",
    excerpt: "Analisis keabsahan akad otomatis berbasis blockchain ditinjau dari rukun akad, unsur gharar, maysir, dan nilai taqawwum dalam madzhab Syafi'i.",
    content: `Perkembangan teknologi desentralisasi keuangan (*Decentralized Finance*) melalui mekanisme *Smart Contract* memunculkan diskursus mendasar dalam disiplin Fiqh Muamalah Kontemporer.

Dalam kaidah fiqhiyyah disebutkan:
الأَصْلُ فِي الْمُعَامَلَاتِ الإِبَاحَةُ إِلَّا أَنْ يَدُلَّ دَلِيلٌ عَلَى تَحْرِيمِهَا
*"Hukum asal dalam segala bentuk muamalah adalah boleh, kecuali ada dalil yang mengharamkannya."*

Namun demikian, keabsahan akad digital ini harus memenuhi syarat terbebasnya transaksi dari tiga cacat utama: *riba*, *gharar* (ketidakjelasan yang merugikan), dan *qimar/maysir* (spekulasi murni). Pada instrumen aset kripto yang memiliki volatilitas ekstrem tanpa underlying asset riil, para fukaha kontemporer seperti Majma' al-Fiqh al-Islami menegaskan adanya potensi gharar fahisy yang menuntut kehati-hatian (*ihtiyath*).

Mahasantri Ma'had Aly DDI Mangkoso mengkaji persoalan ini dengan memadukan matan *Fathul Mu'in* dan *Nihayatul Muhtaj* bersama fatwa-fatwa terbaru DSN-MUI untuk melahirkan panduan fatwa yang aplikatif bagi masyarakat muslim modern.`,
    author: "Ahmad Yusuf Mubarak, S.Ag.",
    authorRole: "Mahasantri Marhalah Ula",
    authorBio: "Peminat riset Fiqh Muamalah Kontemporer & Takhrij Fiqhiyyah di Ma'had Aly DDI Mangkoso.",
    category: "fiqh-muamalah-kontemporer",
    categoryLabel: "Fiqh Muamalah Kontemporer",
    date: "04 Oktober 2026",
    hijriDate: "22 Rabiul Akhir 1448 H",
    readTime: "6 menit",
    views: 342,
    isSpecial: true,
    tags: ["Fiqh Muamalah", "Smart Contract", "Kripto", "Fintech Syariah"],
    arabicSnippet: "الأَصْلُ فِي الْمُعَامَلَاتِ الإِبَاحَةُ"
  },
  {
    id: "art-2",
    slug: "etika-kecerdasan-buatan-ai-perspektif-maqashid-syariah",
    title: "Etika Pemanfaatan AI dan Hak Cipta Digital dalam Perspektif Maqashid Syari'ah",
    excerpt: "Menelaah tanggung jawab hukum atas konten yang dihasilkan generative AI serta perlindungan hak intelektual digital menurut prinsip Hifzh al-Mal dan Hifzh al-'Aql.",
    content: `Kehadiran Generative Artificial Intelligence (AI) telah mengubah lanskap kreasi intelektual dan interaksi sosial. Dalam pandangan maqashid syari'ah, teknologi merupakan wasilah (sarana) yang status hukumnya mengikuti tujuan penggunaannya (*Lil wasa'il hukm al-maqashid*).

Tiga aspek krusial yang dibahas dalam kajian ini:
1. **Perlindungan Hak Cipta (*Hifzh al-Mal*):** Penggunaan karya manusia tanpa atribusi untuk melatih model kecerdasan buatan.
2. **Integritas Informasi (*Hifzh al-'Aql*):** Bahaya disinformasi dan halusinasi data yang dapat merusak tatanan epistemik keilmuan Islam.
3. **Akuntabilitas Hukum (*Al-Mas'uliyyah al-Qanuniyyah*):** Subjek hukum dalam syariat Islam hanyalah mukallaf (manusia yang berakal dan baligh). Algoritma tidak dapat dijadikan subjek penanggung jawab dosa maupun denda jinayah.`,
    author: "Ust. M. Idrus, M.Ag.",
    authorRole: "Dosen Usul Fikih & Fiqh Digital",
    authorBio: "Peneliti Fiqh Kontemporer dan Dosen Metodologi Istinbath di Ma'had Aly DDI Mangkoso.",
    category: "fiqh-digital-teknologi",
    categoryLabel: "Fiqh Digital & AI",
    date: "02 Oktober 2026",
    hijriDate: "20 Rabiul Akhir 1448 H",
    readTime: "7 menit",
    views: 289,
    tags: ["AI", "Maqashid Syariah", "Hak Cipta", "Etika Digital"]
  },
  {
    id: "art-3",
    slug: "hukum-transplantasi-organ-dan-bioetika-kedokteran",
    title: "Dialektika Fiqh Medis: Transplantasi Organ dan Mati Batang Otak",
    excerpt: "Kajian perbandingan fatwa Majma' Fiqh Islami OKI dan fatwa ulama Syafi'iyyah mengenai batas kematian klinis serta donor organ kadaver.",
    content: `Kemajuan dunia bedah medis modern memungkinkan pemindahan organ vital dari donor yang dinyatakan mati batang otak (*brain death*) kepada resipien yang membutuhkan.

Dalam literatur klasik, kaidah:
الضَّرُورَاتُ تُبِيحُ الْمَحْظُورَاتِ
*"Keadaan darurat membolehkan hal-hal yang semula dilarang"*
menjadi landasan utama diperbolehkannya donor organ demi menyelamatkan nyawa seorang muslim (*Hifzh an-Nafs*), dengan syarat mutlak tidak menimbulkan kemudharatan yang sama bagi pendonor dan tidak adanya unsur komersialisasi organ manusia.`,
    author: "Ismail Hannanong, Lc., M.H.",
    authorRole: "Dosen Fiqh Medis & Bahtsul Masail",
    authorBio: "Alumnus Al-Azhar Kairo, Pengampu Bahtsul Masail di Pesantren DDI Mangkoso.",
    category: "fiqh-medis-bioetika",
    categoryLabel: "Fiqh Medis & Bioetika",
    date: "29 September 2026",
    hijriDate: "17 Rabiul Akhir 1448 H",
    readTime: "8 menit",
    views: 415,
    tags: ["Fiqh Medis", "Transplantasi", "Bioetika", "Kesehatan"]
  },
  {
    id: "art-4",
    slug: "integrasi-ulum-al-quran-dalam-mursyid-ath-thullab",
    title: "Integrasi 'Ulum al-Qur'an dalam Kitab Mursyid ath-Thullab",
    excerpt: "Analisis metodologi AGH. Abdurrahman Ambo Dalle dalam merumuskan kaidah tafsir aplikatif bagi penuntut ilmu di Nusantara.",
    content: `Kitab *Mursyid ath-Thullab* merupakan salah satu karya monumental Anregurutta KH. Abdurrahman Ambo Dalle yang memadukan kaidah-kaidah kunci dalam memahami teks suci Al-Qur'an dengan realitas sosial kemasyarakatan.

Tradisi keilmuan yang dibangun di DDI Mangkoso senantiasa menempatkan kitab ini sebagai rujukan fundamental pada tahapan awal pengkaderan sebelum santri mendalami kitab-kitab tafsir thurats yang lebih tebal seperti *Tafsir al-Baidhawi* dan *Tafsir Ibn Katsir*.`,
    author: "AGH. Prof. Dr. M. Faried Wadjedy, MA",
    authorRole: "Mudir Ma'had Aly DDI Mangkoso",
    authorBio: "Mudir Ma'had Aly DDI Mangkoso, Ulama Kharismatik Sulawesi Selatan.",
    category: "karya-anregurutta",
    categoryLabel: "Karya Anregurutta",
    date: "25 September 2026",
    hijriDate: "13 Rabiul Akhir 1448 H",
    readTime: "9 menit",
    views: 620,
    isSpecial: true,
    tags: ["Anregurutta", "Turats", "Tafsir", "Mursyid ath-Thullab"]
  },
  {
    id: "art-5",
    slug: "green-economy-dan-konservasi-lingkungan-perspektif-fiqh",
    title: "Fiqh al-Bi'ah: Urgensi Green Economy dan Konservasi Hutan Mangrove Pesisir",
    excerpt: "Tinjauan hukum pencegahan krisis iklim dan kewajiban restorasi ekosistem pesisir Barru berbasis prinsip Hifzh al-Bi'ah.",
    content: `Kerusakan ekologis pesisir dan krisis iklim global menuntut respon aktif dari hukum Islam. Konsep *Al-Isti'khlaf* (kekhalifahan manusia atas bumi) menempatkan manusia sebagai pemelihara, bukan perusak alam.

Berdasarkan kaidah *Ad-Dhararu Yuzal* (Kemudharatan harus dihilangkan), segala aktivitas eksploitasi alam yang merusak ekosistem pesisir hukumnya haram, dan program reboisasi mangrove bernilai sedekah jariyah ekologis yang berkelanjutan.`,
    author: "Dewan Masyaikh Ma'had Aly",
    authorRole: "Tim Kajian Fiqh Lingkungan",
    authorBio: "Lembaga Bahtsul Masail dan Pengabdian Masyarakat Ma'had Aly DDI Mangkoso.",
    category: "fiqh-lingkungan",
    categoryLabel: "Fiqh Lingkungan & Green Economy",
    date: "20 September 2026",
    hijriDate: "08 Rabiul Akhir 1448 H",
    readTime: "6 menit",
    views: 210,
    tags: ["Fiqh Lingkungan", "Green Economy", "Konservasi", "Krisis Iklim"],
    type: "artikel"
  },
  {
    id: "art-6",
    slug: "refleksi-adab-menuntut-ilmu-di-era-digital",
    title: "Refleksi Adab Menuntut Ilmu di Tengah Riuhnya Arus Digital",
    excerpt: "Sebuah catatan reflektif mahasantri tentang pentingnya menjaga takzim pada sanad guru dan keheningan batin saat informasi begitu melimpah ruah.",
    content: `Di era ketika jutaan potongan fatwa dan kutipan teks agama dapat diakses hanya dalam hitungan detik melalui layar gawai, ada satu hal yang kerap terlupakan: adab talaqqi dan ketundukan hati di hadapan guru.

Imam Malik rahimahullah berpesan kepada seorang pemuda Quraisy:
تَعَلَّمِ الأَدَبَ قَبْلَ أَنْ تَتَعَلَّمَ العِلْمَ
*"Pelajarilah adab sebelum engkau mempelajari ilmu."*

Kemudahan berselancar di internet tidak boleh mengikis rasa takzim kepada masyayikh. Ilmu agama bukanlah sekadar akumulasi data kognitif, melainkan cahaya nurani (*nurun yaqdzifuhullahu fi al-qalb*) yang dialirkan melalui berkah sanad dan keridhaan para guru. Bagi mahasantri Ma'had Aly, berinteraksi dengan dunia digital menuntut kewaspadaan ganda: memanfaatkan teknologi sebagai jembatan syiar dakwah, tanpa kehilangan kemurnian akhlak dan ketawadukan santri salaf.`,
    author: "Muhammad Raihan",
    authorRole: "Mahasantri Marhalah Ula",
    authorBio: "Mahasantri penggiat literasi dan kajian reflektif Ma'had Aly DDI Mangkoso.",
    category: "refleksi-pesantren",
    categoryLabel: "Refleksi Pesantren & Kehidupan",
    date: "05 Oktober 2026",
    hijriDate: "23 Rabiul Akhir 1448 H",
    readTime: "4 menit",
    views: 185,
    type: "opini",
    tags: ["Refleksi", "Adab Santri", "Era Digital", "Pesantren"],
    arabicSnippet: "تَعَلَّمِ الأَدَبَ قَبْلَ أَنْ تَتَعَلَّمَ العِلْمَ"
  }
];

export const INITIAL_THESES: Thesis[] = [
  {
    id: "th-1",
    slug: "skripsi-ijtihad-jamai-fatwa-fintech-lps",
    title: "Rekonstruksi Ijtihad Jama'i dalam Penetapan Fatwa Fintech Lending pada Dewan Syariah Nasional MUI",
    author: "Ahmad Yusuf Mubarak",
    nim: "13.01.0042",
    angkatan: "Angkatan VIII (2022)",
    year: "2026",
    advisor1: "AGH. Prof. Dr. M. Faried Wadjedy, MA",
    advisor2: "Ust. M. Idrus, M.Ag.",
    abstractId: "Penelitian ini mengkaji metodologi ijtihad jama'i yang diterapkan oleh DSN-MUI dalam merespons instrumen pinjaman peer-to-peer (P2P) lending syariah. Menggunakan pendekatan ushul fikih komparatif, riset ini menelaah keselarasan akad wakalah bil ujrah dan qardh terhadap perlindungan hak peminjam dari jeratan bunga terselubung. Ditemukan bahwa penguatan regulasi fatwa harus berpijak pada prinsip sadd adz-dzari'ah untuk mencegah eksploitasi finansial digital.",
    abstractAr: "تناول هذا البحث دراسة منهجية الاجتهاد الجماعي لدى المجلس الشرعي الوطني الإندونيسي في معالجة القروض الرقمية المعاصرة. واعتمد البحث على المنهج الأصولي المقارن لبيان مدى توافق عقد الوكالة بالأجرة مع حماية المستهلكين من فوائد الربا الخفية، وخلص إلى وجوب إعمال سد الذرائع لحماية العدالة الاقتصادية.",
    keywords: ["Ijtihad Jama'i", "Fintech Syariah", "DSN-MUI", "Sadd adz-Dzari'ah", "Fiqh Mu'asarah"],
    category: "Fiqh Muamalah Kontemporer",
    categoryLabel: "Fiqh Muamalah Kontemporer",
    downloadUrl: "https://drive.google.com/file/d/1_contoh_link_gdrive_skripsi_mahad_aly_mangkoso/view?usp=sharing",
    fileSize: "3.4 MB"
  },
  {
    id: "th-2",
    slug: "skripsi-bioetika-bayi-tabung-surrogate-mother",
    title: "Status Nasab dan Hak Waris Anak Hasil Teknologi Reproduksi Berbantu dalam Madzhab Syafi'i",
    author: "Muhammad Fauzan Al-Mangkosiy",
    nim: "13.01.0038",
    angkatan: "Angkatan VII (2021)",
    year: "2025",
    advisor1: "Ismail Hannanong, Lc., M.H.",
    advisor2: "Ust. H. Syahrul, M.Pd.I.",
    abstractId: "Karya ilmiah ini meneliti implikasi yuridis teknologi fertilisasi in vitro (bayi tabung) dan problematika ibu pengganti (surrogate mother) terhadap penetapan nasab serta hak kewarisan Islam. Dengan merujuk pada kitab Tuhfatul Muhtaj dan fatwa Majma' al-Buhuts al-Islamiyyah Al-Azhar, penelitian menegaskan bahwa keabsahan nasab mutlak mensyaratkan ikatan pernikahan yang sah saat inseminasi dilakukan.",
    abstractAr: "تتناول هذه الرسالة الآثار الفقهية لتقنيات الإخصاب الطبي المساعد وقضية استئجار الأرحام على ثبوت النسب والميراث في الفقه الشافعي، مع التأكيد على اشتراط قيام الزوجية الصحيحة شرعاً.",
    keywords: ["Bayi Tabung", "Nasab", "Hifzh an-Nasl", "Bioetika Medis", "Fiqh Syafi'i"],
    category: "Fiqh Medis & Bioetika",
    categoryLabel: "Fiqh Medis & Bioetika",
    downloadUrl: "https://drive.google.com/file/d/1_contoh_link_gdrive_skripsi_bioetika_mangkoso/view?usp=sharing",
    fileSize: "4.1 MB"
  },
  {
    id: "th-3",
    slug: "skripsi-konservasi-mangrove-barru-maqashid-syariah",
    title: "Valuasi Maqashid al-Bi'ah dalam Perlindungan Kawasan Hutan Bakau di Kabupaten Barru",
    author: "Nurul Izzah Amalia",
    nim: "13.01.0051",
    angkatan: "Angkatan VIII (2022)",
    year: "2026",
    advisor1: "AGH. Prof. Dr. M. Faried Wadjedy, MA",
    advisor2: "Ismail Hannanong, Lc., M.H.",
    abstractId: "Skripsi ini merumuskan kerangka hukum Islam mengenai konservasi pesisir di Kabupaten Barru dengan pendekatan Maqashid al-Bi'ah. Studi ini membuktikan bahwa perlindungan ekosistem bakau berkorelasi langsung dengan pemeliharaan jiwa (hifzh an-nafs) dan harta (hifzh al-mal) masyarakat nelayan dari ancaman abrasi laut.",
    abstractAr: "تهدف هذه الدراسة إلى صياغة الإطار الفقهي لمقاصد حماية البيئة الساحلية وتطبيقها على غابات المانغروف في محافظة بارو، بما يحقق حفظ النفس والمال لسكان السواحل.",
    keywords: ["Maqashid al-Bi'ah", "Konservasi Mangrove", "Fiqh Lingkungan", "Hifzh al-Mal"],
    category: "Fiqh Lingkungan & Green Economy",
    categoryLabel: "Fiqh Lingkungan & Green Economy",
    downloadUrl: "https://drive.google.com/file/d/1_contoh_link_gdrive_skripsi_lingkungan_mangkoso/view?usp=sharing",
    fileSize: "2.8 MB"
  }
];

export const INITIAL_NEWS: NewsItem[] = [
  {
    id: "news-1",
    slug: "seminar-nasional-fiqh-muasarah-ai-2026",
    title: "Ma'had Aly DDI Mangkoso Gelar Simposium Nasional Fiqh Mu'asarah dan Kecerdasan Buatan",
    date: "06 Oktober 2026",
    excerpt: "Menghadirkan pakar hukum Islam Nusantara dan praktisi teknologi untuk merumuskan fatwa etika digital berbasis turats.",
    content: `Ma'had Aly DDI Mangkoso menyelenggarakan Simposium Nasional Fiqh Mu'asarah dengan tajuk "Mendudukkan Nalar Ushul Fikih di Era Disrupsi Artificial Intelligence". 

Acara dibuka langsung oleh Mudir Ma'had Aly, AGH. Prof. Dr. M. Faried Wadjedy, MA, dan dihadiri oleh ratusan mahasantri serta delegasi Ma'had Aly se-Indonesia. Hasil rumusan forum ini akan diterbitkan dalam bentuk buku rekomendasi fatwa digital.`,
    category: "Berita",
    author: "Humas Ma'had Aly",
    imageUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "news-2",
    slug: "jadwal-sidang-munaqasyah-skripsi-marhalah-ula-2026",
    title: "Pengumuman: Jadwal Sidang Munaqasyah Risalah Skripsi Semester Genap 2026",
    date: "01 Oktober 2026",
    excerpt: "Informasi jadwal pendaftaran, verifikasi berkas, dan dewan penguji munaqasyah bagi mahasantri tingkat akhir.",
    content: `Diberitahukan kepada seluruh mahasantri tingkat akhir (Semester VIII) bahwa pendaftaran Sidang Munaqasyah Risalah Skripsi telah dibuka hingga tanggal 25 Oktober 2026. 

Setiap peserta wajib mengunggah naskah lengkap skripsi berformat PDF yang telah disetujui Pembimbing 1 dan 2 ke link repository Google Drive resmi Ma'had Aly.`,
    category: "Pengumuman",
    author: "Biro Akademik",
    imageUrl: "",
    attachmentUrl: "/docs/panduan-munaqasyah-2026.pdf",
    attachmentName: "Panduan_Munaqasyah_Skripsi_2026.pdf",
    attachmentSize: "1.8 MB"
  }
];

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
      label: "Profil",
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
        { id: "nav-3-3", label: "Pedoman Skripsi & Akademik", url: "/akademik#pedoman", order: 3, isActive: true }
      ]
    },
    { id: "nav-4", label: "Mimbar Fiqh", url: "/artikel", order: 4, isActive: true },
    { id: "nav-5", label: "Skripsi", url: "/skripsi", order: 5, isActive: true },
    { id: "nav-6", label: "Warta", url: "/berita", order: 6, isActive: true },
    { id: "nav-7", label: "Infaq & Donasi", url: "/donasi", order: 7, isActive: true },
    { id: "nav-8", label: "DeMa", url: "/dema", order: 8, isActive: true }
  ],
  topBar: {
    isActive: true,
    hijriDateText: "Jum'at, 27 Rabi'ul Awwal 1448 H / 9 Oktober 2026",
    phone: "(0421) 510-123 • WA: 0812-4234-xxxx",
    email: "redaksi@mahadaly-ddimangkoso.my.id",
    announcementText: "Penerimaan Mahasantri Baru (PMB) Marhalah Ula (M.1) Dibuka",
    quickLinkText: "E-Library Turats",
    quickLinkUrl: "/elibrary"
  },
  tickerBar: {
    isActive: true,
    badgeLabel: "Kajian Hangat",
    showSearch: true,
    tickerItems: [
      { id: "t-1", label: "Tinjauan Fiqh Mu'asarah terhadap Transaksi Digital & AI", url: "/kategori/fiqh-muamalah" },
      { id: "t-2", label: "Hukum Wakaf Uang Produktif dalam Mazhab Syafi'i", url: "/kategori/ushul-fiqh" },
      { id: "t-3", label: "Halaqah Bahtsul Masail: Fiqh Lingkungan Hidup", url: "/bahtsul-masail" },
      { id: "t-4", label: "Pendaftaran Beasiswa Penuh Kader Ulama Marhalah Ula", url: "/pmb" }
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
  { id: "sec-quote", name: "quote", label: "Kalam Hikmah (Quote Salaf)", isActive: true, order: 2 },
  { id: "sec-about", name: "about", label: "Pilar Pendidikan (Tentang Kami)", isActive: true, order: 3 },
  { id: "sec-categories", name: "categories", label: "Kategori Kajian Fiqh", isActive: true, order: 4 },
  { id: "sec-articles", name: "articles", label: "Artikel Fiqh Terbaru", isActive: true, order: 5, maxItems: 6 },
  { id: "sec-theses", name: "theses", label: "Repositori Skripsi Mahasantri", isActive: true, order: 6, maxItems: 4 },
  { id: "sec-donations", name: "donasi", label: "Infaq & Program Donasi Pilihan", isActive: true, order: 7, maxItems: 3, badge: "Amal Jariyah & Infaq", title: "Dukung Kaderisasi Ulama Fiqh", subtitle: "Salurkan infaq terbaik Anda untuk riset mahasantri, orang tua asuh, dan sarana Ma'had Aly." },
  { id: "sec-bahtsul", name: "bahtsul", label: "Bahtsul Masail Fiqh Mu'asarah", isActive: true, order: 8, maxItems: 3, badge: "Kajian Fatwa Fiqh", title: "Bahtsul Masail & Tanya Jawab Fiqh", subtitle: "Hasil musyawarah fatwa mahasantri dan dewan masyaikh berlandaskan kitab turats muktabarah." },
  { id: "sec-pmb", name: "pmb", label: "Informasi PMB Online (Pendaftaran)", isActive: true, order: 9, badge: "Penerimaan Mahasantri Baru", title: "Jadilah Generasi Ulama Fiqh Masa Depan", subtitle: "Pendaftaran jenjang Marhalah Ula (M.1) Takhassus Fiqh wa Usuluhu Ma'had Aly DDI Mangkoso." },
  { id: "sec-news", name: "news", label: "Warta & Berita Terkini", isActive: true, order: 10, maxItems: 3 },
  { id: "sec-submission", name: "submission", label: "CTA Kirim Tulisan Santri", isActive: true, order: 11, badge: "Mimbar Penulis", title: "Punya Risalah Ilmiah atau Opini Fiqh?", subtitle: "Kirimkan karya tulis Anda untuk ditinjau oleh Dewan Redaksi Ma'had Aly DDI Mangkoso." }
];

export const INITIAL_EMAIL_TEMPLATES: EmailTemplateItem[] = [
  {
    id: "submission_admin",
    name: "Notifikasi Naskah Baru (ke Admin)",
    recipientRole: "admin",
    subject: "[Submission Baru] {judul} — {nama}",
    body: `<p>Assalamu'alaikum Warahmatullahi Wabarakatuh,</p>
<p>Ada naskah baru yang masuk dari pembaca/mahasantri dengan detail berikut:</p>
<ul>
  <li><strong>Kode Tracking:</strong> {kode}</li>
  <li><strong>Nama Penulis:</strong> {nama}</li>
  <li><strong>Judul Naskah:</strong> {judul}</li>
  <li><strong>Catatan/Ringkasan:</strong> {catatan}</li>
</ul>
<p>Berkas naskah terlampir pada email ini dalam format Word (.doc/.docx).</p>
<p><a href="{link}" style="background:#064e3b;color:#ffffff;padding:10px 18px;border-radius:8px;text-decoration:none;display:inline-block;font-weight:bold;">Buka Panel Review Redaksi &rarr;</a></p>`
  },
  {
    id: "confirmation_author",
    name: "Konfirmasi Penerimaan Naskah (ke Penulis)",
    recipientRole: "author",
    subject: "Naskah Diterima — Kode: {kode}",
    body: `<p>Assalamu'alaikum Warahmatullahi Wabarakatuh,</p>
<p>Yth. <strong>{nama}</strong>,</p>
<p>Terima kasih telah mengirimkan karya ilmiah Anda yang berjudul: <em>"{judul}"</em> ke Redaksi Ma'had Aly DDI Mangkoso.</p>
<p>Naskah Anda telah kami terima dan saat ini sedang dalam antrean penelaahan oleh Dewan Redaksi. Anda dapat memantau status perkembangan naskah Anda kapan saja melalui tautan pelacakan berikut:</p>
<p><a href="{link}" style="background:#064e3b;color:#ffffff;padding:10px 18px;border-radius:8px;text-decoration:none;display:inline-block;font-weight:bold;">Lacak Status Naskah ({kode})</a></p>
<p>Wassalamu'alaikum Warahmatullahi Wabarakatuh,<br/><strong>Dewan Redaksi Ma'had Aly DDI Mangkoso</strong></p>`
  },
  {
    id: "revision_author",
    name: "Permintaan Revisi Naskah (ke Penulis)",
    recipientRole: "author",
    subject: "Catatan Revisi Naskah — Kode: {kode}",
    body: `<p>Assalamu'alaikum Warahmatullahi Wabarakatuh,</p>
<p>Yth. <strong>{nama}</strong>,</p>
<p>Dewan Redaksi telah menelaah naskah Anda yang berjudul: <em>"{judul}"</em> (Kode: {kode}).</p>
<p>Naskah Anda memiliki substansi yang baik, namun memerlukan beberapa perbaikan sebelum dapat diterbitkan:</p>
<div style="background:#fef3c7;padding:14px;border-left:4px solid #f59e0b;margin:15px 0;">
  <strong>Catatan Revisi Redaksi:</strong><br/>
  {catatan}
</div>
<p><a href="{link}" style="background:#064e3b;color:#ffffff;padding:10px 18px;border-radius:8px;text-decoration:none;display:inline-block;font-weight:bold;">Kirim Revisi Naskah &rarr;</a></p>
<p>Wassalamu'alaikum Warahmatullahi Wabarakatuh,<br/><strong>Dewan Redaksi Ma'had Aly DDI Mangkoso</strong></p>`
  },
  {
    id: "accepted_author",
    name: "Naskah Diterima / Approved (ke Penulis)",
    recipientRole: "author",
    subject: "Selamat! Naskah Diterima untuk Publikasi — Kode: {kode}",
    body: `<p>Assalamu'alaikum Warahmatullahi Wabarakatuh,</p>
<p>Yth. <strong>{nama}</strong>,</p>
<p>Kabar gembira! Naskah Anda yang berjudul: <strong>"{judul}"</strong> (Kode: {kode}) telah dinyatakan <strong>DITERIMA</strong> oleh Dewan Redaksi Ma'had Aly DDI Mangkoso.</p>
<p>Naskah akan segera dijadwalkan untuk terbit pada Mimbar Kajian Fiqh Mu'asarah.</p>
<p>Terima kasih atas kontribusi keilmuan yang telah Anda sumbangkan.</p>
<p>Wassalamu'alaikum Warahmatullahi Wabarakatuh,<br/><strong>Dewan Redaksi Ma'had Aly DDI Mangkoso</strong></p>`
  },
  {
    id: "rejected_author",
    name: "Penolakan Naskah (ke Penulis)",
    recipientRole: "author",
    subject: "Pemberitahuan Status Naskah — Kode: {kode}",
    body: `<p>Assalamu'alaikum Warahmatullahi Wabarakatuh,</p>
<p>Yth. <strong>{nama}</strong>,</p>
<p>Terima kasih atas partisipasi Anda mengirimkan naskah berjudul: <em>"{judul}"</em> (Kode: {kode}) ke Ma'had Aly DDI Mangkoso.</p>
<p>Setelah melalui proses telaah redaksi, mohon maaf naskah Anda saat ini <strong>belum dapat kami terbitkan</strong> dengan pertimbangan sebagai berikut:</p>
<div style="background:#fee2e2;padding:14px;border-left:4px solid #ef4444;margin:15px 0;">
  {catatan}
</div>
<p>Tetap semangat menulis dan berkarya dalam khazanah keilmuan Islam.</p>
<p>Wassalamu'alaikum Warahmatullahi Wabarakatuh,<br/><strong>Dewan Redaksi Ma'had Aly DDI Mangkoso</strong></p>`
  },
  {
    id: "published_author",
    name: "Naskah Telah Terbit (ke Penulis)",
    recipientRole: "author",
    subject: "Artikel Anda Telah Terbit di Mimbar Kajian — Kode: {kode}",
    body: `<p>Assalamu'alaikum Warahmatullahi Wabarakatuh,</p>
<p>Yth. <strong>{nama}</strong>,</p>
<p>Naskah Anda berjudul <strong>"{judul}"</strong> telah resmi diterbitkan di portal Ma'had Aly DDI Mangkoso!</p>
<p>Anda dapat membaca dan membagikan artikel tersebut melalui tautan berikut:</p>
<p><a href="{link}" style="background:#064e3b;color:#ffffff;padding:10px 18px;border-radius:8px;text-decoration:none;display:inline-block;font-weight:bold;">Lihat Artikel Terbit</a></p>
<p>Jazakumullah khairan katsiran atas kontribusi dakwah ilmiah Anda.</p>
<p>Wassalamu'alaikum Warahmatullahi Wabarakatuh,<br/><strong>Dewan Redaksi Ma'had Aly DDI Mangkoso</strong></p>`
  }
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
export const INITIAL_DONATIONS: DonationProgram[] = [
  {
    id: "don-1",
    slug: "short-course-risalah-ilmiah-mesir",
    title: "Donasi Risalah Ilmiah & Short Course Dosen / Mahasantri di Al-Azhar Kairo, Mesir",
    category: "short_course_mesir",
    categoryLabel: "Short Course & Risalah Mesir",
    shortDesc: "Dukungan keberangkatan delegasi masyaikh dan mahasantri berprestasi Ma'had Aly DDI Mangkoso dalam program penguatan tahqiq turats dan fatwa kontemporer di Universitas Al-Azhar, Kairo, Mesir.",
    story: "Program pengiriman delegasi peneliti Ma'had Aly DDI Mangkoso ke Universitas Al-Azhar Kairo bertujuan untuk memperdalam metodologi istinbath hukum kontemporer langsung bersama kibar ulama Al-Azhar, memperluas akses naskah manuskrip makhtutat klasik, serta mematangkan risalah ilmiah fikih mu'asarah berstandar internasional. Dana donasi dialokasikan untuk biaya akomodasi halaqah, tiket, visa riset, pengadaan kitab rujukan langka, dan munaqasyah ilmiah di Kairo.",
    targetAmount: 150000000,
    collectedAmount: 64500000,
    donorCount: 42,
    deadline: "31 Desember 2026",
    imageUrl: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80",
    proposalUrl: "https://drive.google.com/file/d/1ShortCourseMesirMahadAly/view?usp=sharing",
    proposalName: "Proposal_Short_Course_AlAzhar_Mesir_2026.pdf",
    proposalSize: "2.4 MB",
    bankAccounts: [
      {
        id: "bank-1-1",
        bankName: "Bank Syariah Indonesia (BSI)",
        accountNumber: "7198889912",
        accountHolder: "Ma'had Aly DDI Mangkoso - Program Mesir",
        branch: "KC Barru / Parepare"
      },
      {
        id: "bank-1-2",
        bankName: "Bank Central Asia (BCA)",
        accountNumber: "7925182901",
        accountHolder: "Ma'had Aly DDI Mangkoso"
      }
    ],
    contactPerson: {
      name: "Ust. Ahmad Yusuf Mubarak, M.H.",
      phone: "6281234567890"
    },
    isActive: true,
    isFeatured: true,
    createdAt: "2026-01-15"
  },
  {
    id: "don-2",
    slug: "pengembangan-ekosistem-web-digital",
    title: "Donasi Pengembangan Website & Ekosistem Digital Portal Ma'had Aly",
    category: "web_dev",
    categoryLabel: "Pengembangan Web & IT",
    shortDesc: "Wakaf teknologi dan infaq operasional server Cloudflare, repositori skripsi digital, sistem jurnal ilmiah OJS, dan kecerdasan buatan penelusuran fatwa turats.",
    story: "Dalam rangka menyebarluaskan fatwa fiqh mu'asarah dan risalah ilmiah mahasantri ke seluruh penjuru dunia Islam, Ma'had Aly DDI Mangkoso membangun ekosistem digital mandiri yang tangguh, aman, dan tanpa iklan. Donasi ini digunakan untuk sewa infrastruktur Cloudflare Workers/R2 storage, pemeliharaan keamanan website anti-serangan siber, digitalisasi ribuan manuskrip kitab kuning, serta pengembangan aplikasi mobile dakwah digital santri.",
    targetAmount: 35000000,
    collectedAmount: 18200000,
    donorCount: 29,
    deadline: "Terbuka Berkelanjutan",
    imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
    proposalUrl: "https://drive.google.com/file/d/1WebDevMahadAlyDDI/view?usp=sharing",
    proposalName: "Roadmap_Digitalisasi_Portal_MahadAly_2026.pdf",
    proposalSize: "1.8 MB",
    bankAccounts: [
      {
        id: "bank-2-1",
        bankName: "Bank Syariah Indonesia (BSI)",
        accountNumber: "7198889920",
        accountHolder: "Ma'had Aly DDI Mangkoso - Digital & IT"
      }
    ],
    contactPerson: {
      name: "Admin IT Portal Ma'had Aly",
      phone: "6281234567890"
    },
    isActive: true,
    isFeatured: true,
    createdAt: "2026-02-01"
  },
  {
    id: "don-3",
    slug: "orang-tua-angkat-mahasantri",
    title: "Program Orang Tua Angkat Mahasantri (Beasiswa Takhassus Fiqh Mu'asarah)",
    category: "orang_tua_asuh",
    categoryLabel: "Orang Tua Angkat",
    shortDesc: "Jadilah orang tua asuh bagi mahasantri pilihan dari pelosok Nusantara untuk membiayai kitab turats, asrama, dan konsumsi selama 4 tahun studi hingga munaqasyah.",
    story: "Banyak mutakharrijin pesantren yang memiliki kecerdasan dan komitmen tinggi untuk menjadi fuqaha kontemporer namun terkendala kemampuan ekonomi keluarga. Melalui Program Orang Tua Angkat, para muhsinin dapat mengasuh satu atau beberapa mahasantri secara langsung. Setiap orang tua angkat akan menerima laporan perkembangan hafalan matan, nilai halaqah semester, dan risalah skripsi anak asuhnya secara berkala.",
    targetAmount: 120000000,
    collectedAmount: 78000000,
    donorCount: 36,
    deadline: "Terbuka Berkelanjutan",
    imageUrl: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80",
    proposalUrl: "https://drive.google.com/file/d/1OrangTuaAngkatMahadAly/view?usp=sharing",
    proposalName: "Buku_Panduan_Orang_Tua_Angkat_Mahasantri.pdf",
    proposalSize: "3.1 MB",
    bankAccounts: [
      {
        id: "bank-3-1",
        bankName: "Bank Syariah Indonesia (BSI)",
        accountNumber: "7198889938",
        accountHolder: "Ma'had Aly DDI Mangkoso - Beasiswa Santri"
      },
      {
        id: "bank-3-2",
        bankName: "Bank Muamalat",
        accountNumber: "8010091822",
        accountHolder: "Ma'had Aly DDI Mangkoso"
      }
    ],
    contactPerson: {
      name: "Lajnah Beasiswa & Kesejahteraan Santri",
      phone: "6281234567890"
    },
    isActive: true,
    isFeatured: true,
    createdAt: "2026-02-10"
  },
  {
    id: "don-4",
    slug: "donasi-operasional-sarana-mahad-aly",
    title: "Infaq & Wakaf Sarana Prasarana Serta Operasional Ma'had Aly DDI Mangkoso",
    category: "operasional_umum",
    categoryLabel: "Infaq & Sarana Ma'had",
    shortDesc: "Dukungan pengadaan kitab turats maktabah, sarana halaqah bahtsul masail, renovasi asrama mahasantri, dan operasional pengajaran masyaikh.",
    story: "Ma'had Aly DDI Mangkoso menyelenggarakan pendidikan kader ulama dengan fasilitas asrama mukim penuh dan perpustakaan ribuan jilid kitab kuning. Partisipasi infaq jariyah kaum muslimin menjadi pondasi kokoh keberlangsungan transmisi keilmuan Islam yang moderat dan berkemajuan.",
    targetAmount: 200000000,
    collectedAmount: 115000000,
    donorCount: 88,
    deadline: "Terbuka Berkelanjutan",
    imageUrl: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1200&q=80",
    proposalUrl: "https://drive.google.com/file/d/1SaranaMahadAlyDDI/view?usp=sharing",
    proposalName: "Profil_Sarana_Wakaf_MahadAly_2026.pdf",
    proposalSize: "4.5 MB",
    bankAccounts: [
      {
        id: "bank-4-1",
        bankName: "Bank Syariah Indonesia (BSI)",
        accountNumber: "7198889904",
        accountHolder: "Ma'had Aly DDI Mangkoso - Infaq Sarana"
      },
      {
        id: "bank-4-2",
        bankName: "Bank Central Asia (BCA)",
        accountNumber: "7925182901",
        accountHolder: "Ma'had Aly DDI Mangkoso"
      }
    ],
    contactPerson: {
      name: "Bendahara Umum Ma'had Aly",
      phone: "6281234567890"
    },
    isActive: true,
    isFeatured: true,
    createdAt: "2026-01-01"
  }
];

// ══════════════════════════════════════════════════════════════
// 11. LOG ANCAMAN KEAMANAN AWAL (SECURITY DEFENSE CENTER)
// ══════════════════════════════════════════════════════════════
export const INITIAL_SECURITY_THREATS: SecurityThreatLog[] = [];

export const INITIAL_DEMA_SETTINGS: DemaSettings = {
  "periodTitle": "Kabinet Khidmah & Intelektual 1447–1448 H / 2026–2027 M",
  "tagline": "Dewan Mahasantri Ma'had Aly DDI Mangkoso",
  "leadQuote": "Menghidupkan Khazanah Turats, Menggerakkan Nalar Kontemporer, Mengabdi untuk Kemaslahatan Ummat.",
  "leadQuoteArabic": "العِلْمُ بِلَا عَمَلٍ كَالشَّجَرِ بِلَا ثَمَرٍ",
  "divisions": [
    {
      "id": "div-bph",
      "name": "Badan Pengurus Harian (BPH)",
      "code": "bph",
      "icon": "👑",
      "order": 1,
      "isActive": true,
      "description": "Pucuk pimpinan eksekutif presidium Dewan Mahasantri yang mengarahkan kebijakan strategis, koordinasi internal, dan tata kelola organisasi.",
      "responsibilities": [
        "Memonitoring setiap kegiatan organisasi",
        "Memimpin rapat koordinasi berkala pengurus DeMa",
        "Mengadakan Bahtsul Masail dan Halal bi Halal (HBH)"
      ]
    },
    {
      "id": "div-pendidikan",
      "name": "Divisi Pendidikan",
      "code": "pendidikan",
      "icon": "📚",
      "order": 2,
      "isActive": true,
      "description": "Mengawal dinamika akademik takhassus fiqh, pendampingan musyawarah kitab kuning, dan kajian ilmiah kontemporer.",
      "responsibilities": [
        "Menyelenggarakan halaqah telaah kitab turats antar-marhalah",
        "Mendampingi penulisan karya ilmiah dan risalah tugas akhir",
        "Mengadakan seminar keilmuan fiqh dan ushul fiqh tematik"
      ]
    },
    {
      "id": "div-jurnalistik",
      "name": "Divisi Jurnalistik",
      "code": "jurnalistik",
      "icon": "✍️",
      "order": 3,
      "isActive": true,
      "description": "Mengelola penerbitan buletin berkala, liputan warta santri, dokumentasi multimedia, dan penulisan karya jurnalistik pesantren.",
      "responsibilities": [
        "Menerbitkan buletin berkala dan warta mingguan Ma'had Aly",
        "Meliput dan mendokumentasikan kegiatan akademik serta kepesantrenan",
        "Mengelola kanal publikasi resmi media sosial dan warta digital santri"
      ]
    },
    {
      "id": "div-maktabah",
      "name": "Divisi Maktabah (Perpustakaan)",
      "code": "maktabah",
      "icon": "📖",
      "order": 4,
      "isActive": true,
      "description": "Mengelola dan memastikan kegiatan operasional maktabah berjalan dengan tertib, meliputi pengaturan sirkulasi maraji' turats klasik dan literasi kepustakaan.",
      "responsibilities": [
        "Menyusun dan mengontrol tata tertib maktabah",
        "Mengontrol fasilitas dan kenyamanan ruang maktabah",
        "Pengamanan dan digitalisasi katalog arsip kitab kuning"
      ]
    },
    {
      "id": "div-ibadah",
      "name": "Divisi Ibadah",
      "code": "ibadah",
      "icon": "🕌",
      "order": 5,
      "isActive": true,
      "description": "Mengawal kedisiplinan shalat berjamaah, wirid, tadarrus, dan amaliah kepesantrenan Ahlussunnah wal Jama'ah.",
      "responsibilities": [
        "Mengawal ketertiban shalat lima waktu berjamaah di masjid",
        "Menyusun jadwal imam, muadzin, dan penceramah kultum subuh",
        "Mengkoordinir pembacaan ratib, tahlil, dan amaliah mingguan"
      ]
    },
    {
      "id": "div-humas",
      "name": "Divisi Humas (Hubungan Masyarakat)",
      "code": "humas",
      "icon": "📢",
      "order": 6,
      "isActive": true,
      "description": "Divisi Humas bertugas menjalin dan menjaga hubungan baik dengan pihak internal maupun eksternal organisasi demi kemaslahatan santri.",
      "responsibilities": [
        "Menjalin komunikasi dan silaturahmi dengan lembaga, instansi, dan ikatan alumni",
        "Melakukan penggalangan aspirasi dan relasi kemasyarakatan",
        "Mengkoordinir pengabdian santri pada masyarakat dan dakwah sosial"
      ]
    },
    {
      "id": "div-sarpras",
      "name": "Divisi Sarpras (Sarana & Prasarana)",
      "code": "sarpras",
      "icon": "🏛️",
      "order": 7,
      "isActive": true,
      "description": "Mengelola, merawat, dan menginventarisasi sarana prasarana serta fasilitas pendukung kegiatan mahasantri.",
      "responsibilities": [
        "Memelihara kebersihan dan kelayakan sarana belajar serta asrama",
        "Menginventarisasi aset dan perlengkapan inventaris organisasi",
        "Menyiapkan sarana dan kebutuhan logistik setiap agenda DeMa"
      ]
    },
    {
      "id": "div-keamanan",
      "name": "Divisi Keamanan",
      "code": "keamanan",
      "icon": "🛡️",
      "order": 8,
      "isActive": true,
      "description": "Menjaga ketertiban, keamanan lingkungan asrama mahasantri, serta penegakan tata tertib kampus.",
      "responsibilities": [
        "Mengawasi jam malam, kedisiplinan, dan perizinan keluar pondok",
        "Menegakkan disiplin tata tertib kehidupan mahasantri di asrama",
        "Melaksanakan jadwal ronda malam dan memastikan asrama kondusif"
      ]
    }
  ],
  "members": [
    {
      "id": "mem-dema-1",
      "name": "IMRAN",
      "role": "Ketua Dema",
      "divisionId": "div-bph",
      "nim": "144629",
      "marhalah": "Sanah Tsalis",
      "photoUrl": "https://lh3.googleusercontent.com/d/1XB1mGiYGxf3Mz_foEzihcZz6bwIEVzaL",
      "rawPhotoUrl": "https://drive.google.com/open?id=1XB1mGiYGxf3Mz_foEzihcZz6bwIEVzaL",
      "instagram": "@imranmuhjafar",
      "bio": "Ushul fiqih dan Tafsir",
      "quote": "Ikhlas, Lillah, Billah, Fillah: Beramal dan belajar semata-mata karena Allah SWT.",
      "order": 1,
      "isActive": true,
      "isHighlighted": true
    },
    {
      "id": "mem-dema-2",
      "name": "Siti Hajar Al Fatih",
      "role": "Sek-bend Div. Pendidikan",
      "divisionId": "div-pendidikan",
      "nim": "144622",
      "marhalah": "Semester 5/Marhalah khomis (Sanah stalist)",
      "photoUrl": "https://lh3.googleusercontent.com/d/1-VsB3RKMGsVLnnD7uqhMyFxoy4oCAdIj",
      "rawPhotoUrl": "https://drive.google.com/open?id=1-VsB3RKMGsVLnnD7uqhMyFxoy4oCAdIj",
      "instagram": "082196923170",
      "bio": "Nama: Siti Hajar Al Fatih\nAlamat: Pinrang\nTTL: Bungi Pinrang 22 Agustus 2005",
      "quote": "Habiskan masa mudamu dengan takut sebanyak - banyaknya",
      "order": 2,
      "isActive": true,
      "isHighlighted": false
    },
    {
      "id": "mem-dema-3",
      "name": "Dirga Wahyu Fani",
      "role": "Wakil ketua DEMA",
      "divisionId": "div-bph",
      "nim": "١٤٤٦٠٣",
      "marhalah": "السنة الثالثة",
      "photoUrl": "https://lh3.googleusercontent.com/d/19kjUBQJMvtnmC1-75tZUJTI8-KrXJyQk",
      "rawPhotoUrl": "https://drive.google.com/open?id=19kjUBQJMvtnmC1-75tZUJTI8-KrXJyQk",
      "instagram": "083136051382",
      "bio": "Lahir di Kab.Bantaeng 19 Januari 2002\nFokus pada jurusan Fiqh wa Ushuluhu, senang berdakwah.",
      "quote": "Hidup hanya sekali, tebar manfaat",
      "order": 3,
      "isActive": true,
      "isHighlighted": true
    },
    {
      "id": "mem-dema-4",
      "name": "Imam Mujahid",
      "role": "sekretaris",
      "divisionId": "div-bph",
      "nim": "144606",
      "marhalah": "Marhalah ula",
      "photoUrl": "https://lh3.googleusercontent.com/d/1kefPeG_bfnhEhviSuayxEJSebYFinVxS",
      "rawPhotoUrl": "https://drive.google.com/open?id=1kefPeG_bfnhEhviSuayxEJSebYFinVxS",
      "instagram": "081250907888",
      "bio": "Fiqh wa ushuluh",
      "quote": "Berusaha lebih baik dari hari kemarin",
      "order": 4,
      "isActive": true,
      "isHighlighted": false
    },
    {
      "id": "mem-dema-5",
      "name": "Aisyah latif",
      "role": "Anggota",
      "divisionId": "div-jurnalistik",
      "nim": "144615",
      "marhalah": "Tingkat 3",
      "photoUrl": "https://lh3.googleusercontent.com/d/1p-5Z0Y2V6rY5LHeynFSTjCbDVptB5uR2",
      "rawPhotoUrl": "https://drive.google.com/open?id=1p-5Z0Y2V6rY5LHeynFSTjCbDVptB5uR2",
      "instagram": "085143625651",
      "bio": "Aisyah latif mahasantri mahad aly DDI Mangkoso Sulawesi Selatan \nFokus keilmuan: fiqh dan ushul fiqh khususnya kajian hukum islam dan penerapannya dalam persoalan kontemporer",
      "quote": "عش كريما أو موت شهيدا",
      "order": 5,
      "isActive": true,
      "isHighlighted": false
    },
    {
      "id": "mem-dema-6",
      "name": "Muhammad Muazzinul Fajri",
      "role": "Anggota",
      "divisionId": "div-maktabah",
      "nim": "144805",
      "marhalah": "Ula",
      "photoUrl": "https://lh3.googleusercontent.com/d/1v3t5ZGUjRCeT6ipIqQ4rhliI_WXK3p26",
      "rawPhotoUrl": "https://drive.google.com/open?id=1v3t5ZGUjRCeT6ipIqQ4rhliI_WXK3p26",
      "instagram": "Muazzinul_f",
      "bio": "Fikih ushul fikih",
      "quote": "Berilmu,beramal dan bermanfaat bagi umat",
      "order": 6,
      "isActive": true,
      "isHighlighted": false
    },
    {
      "id": "mem-dema-7",
      "name": "Jamiah Safitri",
      "role": "Sekbend",
      "divisionId": "div-ibadah",
      "nim": "144611",
      "marhalah": "Sanah Saniah",
      "photoUrl": "https://lh3.googleusercontent.com/d/16EJuNPbaoHv8DkVCkwI36QCLHJAH1g9M",
      "rawPhotoUrl": "https://drive.google.com/open?id=16EJuNPbaoHv8DkVCkwI36QCLHJAH1g9M",
      "instagram": "Ig : jamiahsafitri_",
      "bio": "Alumni MA DDI KABALLANGANG \nAsal : Pinrang",
      "quote": "Hidup dengan tenang, tumbuh dengan riang",
      "order": 7,
      "isActive": true,
      "isHighlighted": false
    },
    {
      "id": "mem-dema-8",
      "name": "Nadia alfareza",
      "role": "Anggota Maktabah",
      "divisionId": "div-maktabah",
      "nim": "144618",
      "marhalah": "Sanah tasalis",
      "photoUrl": "https://lh3.googleusercontent.com/d/1a7OMG578n-3j4CwJy6HC5GHLxaKRXSbx",
      "rawPhotoUrl": "https://drive.google.com/open?id=1a7OMG578n-3j4CwJy6HC5GHLxaKRXSbx",
      "instagram": "@Nadialfrz_",
      "bio": "Nama lengkap Nadia alfareza/Ushul fiqh dan tafsir",
      "quote": "Diam dalam proses, Nyata dalam hasil.",
      "order": 8,
      "isActive": true,
      "isHighlighted": false
    },
    {
      "id": "mem-dema-9",
      "name": "Aidil",
      "role": "Anggota",
      "divisionId": "div-maktabah",
      "nim": "144701",
      "marhalah": "Sanah tsaniah",
      "photoUrl": "https://lh3.googleusercontent.com/d/1AizEN9RxBP2_-B9BvQkTxYnHJkZKc4kU",
      "rawPhotoUrl": "https://drive.google.com/open?id=1AizEN9RxBP2_-B9BvQkTxYnHJkZKc4kU",
      "instagram": "@Dyll_un",
      "bio": "Ushul fiqh",
      "quote": "Setidaknya masih hidup",
      "order": 9,
      "isActive": true,
      "isHighlighted": false
    },
    {
      "id": "mem-dema-10",
      "name": "Baso Ihsan",
      "role": "Kordinator",
      "divisionId": "div-maktabah",
      "nim": "144605",
      "marhalah": "Sanah salis",
      "photoUrl": "https://lh3.googleusercontent.com/d/1hqt6psLgyj3os1XuxqLVXgeMl86jhm6y",
      "rawPhotoUrl": "https://drive.google.com/open?id=1hqt6psLgyj3os1XuxqLVXgeMl86jhm6y",
      "instagram": "Basoihsan_",
      "bio": "Nama : baso Ihsan\nJurusan : fiqih dan Ushul",
      "quote": "Siap mode tempur",
      "order": 10,
      "isActive": true,
      "isHighlighted": true
    },
    {
      "id": "mem-dema-11",
      "name": "IMAM QURTHUBY",
      "role": "Koordinator",
      "divisionId": "div-humas",
      "nim": "١٤٤٦١٢",
      "marhalah": "3",
      "photoUrl": "https://lh3.googleusercontent.com/d/1CpYWZ7WVQNso7p4Exi52QEJqadSZPTZF",
      "rawPhotoUrl": "https://drive.google.com/open?id=1CpYWZ7WVQNso7p4Exi52QEJqadSZPTZF",
      "instagram": "085796880906",
      "bio": "Imam qurthuby \nMakassar, 24-03-2005",
      "quote": "من جدّ وجد",
      "order": 11,
      "isActive": true,
      "isHighlighted": true
    },
    {
      "id": "mem-dema-12",
      "name": "Wiladah Mazkiyah",
      "role": "Bendahara DEMA",
      "divisionId": "div-bph",
      "nim": "144619",
      "marhalah": "Sanah Tsalisah/Semester 5",
      "photoUrl": "https://lh3.googleusercontent.com/d/1ccRFZCoBirUgixdVZFUZ15jZEO2e1nNZ",
      "rawPhotoUrl": "https://drive.google.com/open?id=1ccRFZCoBirUgixdVZFUZ15jZEO2e1nNZ",
      "instagram": "Wh.zyah/082347798914",
      "bio": "Wiladah Mazkiyah,Santri Ma’had Aly yang memiliki ketertarikan dan ingin terus belajar memperdalam ilmu fikih dan usul fikih, serta menambah pemahaman dalam kajian keislaman.",
      "quote": "Tak mungkin Allah mengizinkan melangkah sejauh ini hanya untuk berakhir tanpa makna; ada hikmah dalam perjalanan, dan ada kebaikan dalam setiap ketetapan-Nya.",
      "order": 12,
      "isActive": true,
      "isHighlighted": false
    },
    {
      "id": "mem-dema-13",
      "name": "Wulan Sari",
      "role": "Anggota",
      "divisionId": "div-maktabah",
      "nim": "144819",
      "marhalah": "Sanah Ula",
      "photoUrl": "https://lh3.googleusercontent.com/d/1zuXfHW6gE11Z30YJGyhnHK9yWtc-PfDp",
      "rawPhotoUrl": "https://drive.google.com/open?id=1zuXfHW6gE11Z30YJGyhnHK9yWtc-PfDp",
      "instagram": "wllns_7",
      "bio": "fiqih usul fiqih",
      "quote": "tidak ada kata terlambat untuk memulai sesuatu",
      "order": 13,
      "isActive": true,
      "isHighlighted": false
    },
    {
      "id": "mem-dema-14",
      "name": "Fitriani",
      "role": "Anggota sarpras",
      "divisionId": "div-sarpras",
      "nim": "144822",
      "marhalah": "Semester pertama",
      "photoUrl": "https://lh3.googleusercontent.com/d/16F3j7jk-R9oCVGuA4Ue0hRT4-59Tybcj",
      "rawPhotoUrl": "https://drive.google.com/open?id=16F3j7jk-R9oCVGuA4Ue0hRT4-59Tybcj",
      "instagram": "Ftrianiningsih10_",
      "bio": "Fiqhi dan ushul fiqhi",
      "quote": "Jalanin aja dulu",
      "order": 14,
      "isActive": true,
      "isHighlighted": false
    },
    {
      "id": "mem-dema-15",
      "name": "Mona Az-zaqiyyah",
      "role": "Anggota",
      "divisionId": "div-ibadah",
      "nim": "144815",
      "marhalah": "Semester Pertama / Sanah Ula",
      "photoUrl": "https://lh3.googleusercontent.com/d/1YekEs4H6R6WaH2mwSvyBJOR-oFPDfb_e",
      "rawPhotoUrl": "https://drive.google.com/open?id=1YekEs4H6R6WaH2mwSvyBJOR-oFPDfb_e",
      "instagram": "mona_azzaqiyyah",
      "bio": "Mona Az-zaqiyyah - Mahasantri Ma'had 'Aly DDI Mangkoso. Fokus keilmuan pada bidang Fiqih dan Ushul Fiqih, dengan minat kajian pada turats kitab kuning dan istinbath hukum Islam",
      "quote": "خير الناس انفعهم للناس",
      "order": 15,
      "isActive": true,
      "isHighlighted": false
    },
    {
      "id": "mem-dema-16",
      "name": "M. Faiz",
      "role": "Anggota",
      "divisionId": "div-ibadah",
      "nim": "144802",
      "marhalah": "M 1",
      "photoUrl": "https://lh3.googleusercontent.com/d/1x9szCebiDNe879CE1D-uJsZUfAd5nP9B",
      "rawPhotoUrl": "https://drive.google.com/open?id=1x9szCebiDNe879CE1D-uJsZUfAd5nP9B",
      "instagram": "m_faiz.s.13",
      "bio": "Fikih ushul fikih",
      "quote": "Man jadda wa jada (Siapa yang bersungguh-sungguh, pasti akan berhasil)",
      "order": 16,
      "isActive": true,
      "isHighlighted": false
    },
    {
      "id": "mem-dema-17",
      "name": "Maulidiyyah",
      "role": "Anggota",
      "divisionId": "div-jurnalistik",
      "nim": "144820",
      "marhalah": "Semester 1/sanah ula",
      "photoUrl": "https://lh3.googleusercontent.com/d/12s5U4OH41XD5HGvRvCE-iJV5V6t2l5tW",
      "rawPhotoUrl": "https://drive.google.com/open?id=12s5U4OH41XD5HGvRvCE-iJV5V6t2l5tW",
      "instagram": "Ldya.nn",
      "bio": "Nama:Maulidiyyah sebagai mahasantri ma'had aly ddi mangkoso/jurusan fiqh WA ushul fiqh",
      "quote": "(وَأُفَوِّضُ أَمْرِي إِلَى اللَّهِ ۚ إِنَّ اللَّهَ بَصِيرٌ بِالْعِبَادِ)",
      "order": 17,
      "isActive": true,
      "isHighlighted": false
    },
    {
      "id": "mem-dema-18",
      "name": "M. Alfin Al Mubarok",
      "role": "anggota",
      "divisionId": "div-ibadah",
      "nim": "144810",
      "marhalah": "marhalah ula",
      "photoUrl": "https://lh3.googleusercontent.com/d/1lZrmHk-58yFjs6l9twy3daTbG-gsMp8K",
      "rawPhotoUrl": "https://drive.google.com/open?id=1lZrmHk-58yFjs6l9twy3daTbG-gsMp8K",
      "instagram": "alfin.almubarok",
      "bio": "fikih usul fikih",
      "quote": "إن مع العسر يسرا",
      "order": 18,
      "isActive": true,
      "isHighlighted": false
    },
    {
      "id": "mem-dema-19",
      "name": "Muhammad fadhel alamsyah",
      "role": "Anggota",
      "divisionId": "div-jurnalistik",
      "nim": "١٤٤٧٢٨",
      "marhalah": "M 1",
      "photoUrl": "https://lh3.googleusercontent.com/d/114XjiEQ6qBwVC6QQYaPMqwLvWiuTycHd",
      "rawPhotoUrl": "https://drive.google.com/open?id=114XjiEQ6qBwVC6QQYaPMqwLvWiuTycHd",
      "instagram": "fdellalmsyh_",
      "bio": "Fiqh usul fiqh",
      "quote": "Jadilah diri sendiri",
      "order": 19,
      "isActive": true,
      "isHighlighted": false
    },
    {
      "id": "mem-dema-20",
      "name": "Muhammad Fajrul Amin",
      "role": "Anggota",
      "divisionId": "div-humas",
      "nim": "144812",
      "marhalah": "M1",
      "photoUrl": "https://lh3.googleusercontent.com/d/1_4U65bASm9jH0wX890OIfuaJBokOXKuh",
      "rawPhotoUrl": "https://drive.google.com/open?id=1_4U65bASm9jH0wX890OIfuaJBokOXKuh",
      "instagram": "__fajrull",
      "bio": "Ushul fikih",
      "quote": "Ada\" ji itu🤲",
      "order": 20,
      "isActive": true,
      "isHighlighted": false
    },
    {
      "id": "mem-dema-21",
      "name": "Musfirah",
      "role": "Anggota",
      "divisionId": "div-jurnalistik",
      "nim": "144818",
      "marhalah": "Sanah ula",
      "photoUrl": "https://lh3.googleusercontent.com/d/1GEKPJGaora_cA_YOp_8nuP3HDh3Xod85",
      "rawPhotoUrl": "https://drive.google.com/open?id=1GEKPJGaora_cA_YOp_8nuP3HDh3Xod85",
      "instagram": "firaahhg_",
      "bio": "Al Fiqh wa Ushuluhu",
      "quote": "Trust Allah, do your best",
      "order": 21,
      "isActive": true,
      "isHighlighted": false
    },
    {
      "id": "mem-dema-22",
      "name": "Ahsan abul Khair",
      "role": "Anggota ji",
      "divisionId": "div-jurnalistik",
      "nim": "144504",
      "marhalah": "Semester 5",
      "photoUrl": "https://lh3.googleusercontent.com/d/1vhE4MZnnz7Bkdzwr-tLVnv63Uj1oT_Q0",
      "rawPhotoUrl": "https://drive.google.com/open?id=1vhE4MZnnz7Bkdzwr-tLVnv63Uj1oT_Q0",
      "instagram": "089603032322",
      "bio": "Ushul fiqih",
      "quote": "Hidup jokowi",
      "order": 22,
      "isActive": true,
      "isHighlighted": false
    },
    {
      "id": "mem-dema-23",
      "name": "Nadhifa ramadhani Harum Putri",
      "role": "anggota",
      "divisionId": "div-maktabah",
      "nim": "144631",
      "marhalah": "sana salis",
      "photoUrl": "https://lh3.googleusercontent.com/d/1OfoJEoruXlIzmSDwswO5ogtqbC424ajM",
      "rawPhotoUrl": "https://drive.google.com/open?id=1OfoJEoruXlIzmSDwswO5ogtqbC424ajM",
      "instagram": "nadhifaramadhni",
      "bio": "nama : Nadhifa Ramadhani Harum Putri\nasal : kendari",
      "quote": "لا تحزن ان الله معنا ، ان مع العسر يسرا",
      "order": 23,
      "isActive": true,
      "isHighlighted": false
    },
    {
      "id": "mem-dema-24",
      "name": "M ASHABUL KAHFI",
      "role": "ANGGOTA",
      "divisionId": "div-humas",
      "nim": "144607",
      "marhalah": "Sana stalist",
      "photoUrl": "https://lh3.googleusercontent.com/d/16b0Tki4GrIUq5lJkKaIJrKFU5f8omwn5",
      "rawPhotoUrl": "https://drive.google.com/open?id=16b0Tki4GrIUq5lJkKaIJrKFU5f8omwn5",
      "instagram": "+62 819-3715-1026",
      "bio": "Usul fiqhi",
      "quote": "Rajin tidak suka tidur",
      "order": 24,
      "isActive": true,
      "isHighlighted": false
    }
  ]
};

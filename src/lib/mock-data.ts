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
  FooterFocusItem
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
  context: "Landasan Visi Pendidikan Kader Ulama Ma'had Aly DDI Mangkoso"
};

export const INITIAL_SEO: SeoSettings = {
  siteTitle: "Ma'had Aly DDI Mangkoso — Takhassus Fiqh wa Usuluhu",
  metaDescription: "Portal resmi Ma'had Aly Pendidikan Tinggi Kader Ulama DDI Abdurrahman Ambo Dalle Mangkoso, Barru. Pusat kajian Fiqh Mu'asarah, turats, dan riset hukum Islam.",
  keywords: "mahad aly ddi mangkoso, fiqh muasarah, fiqh kontemporer, ushul fikih, anregurutta ambo dalle, barru sulawesi selatan",
  ogImage: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1200&q=80",
  googleAnalyticsId: "G-MAHADALY2026",
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
  { id: "fnav-4", label: "Karya Anregurutta", url: "/kategori/karya-anregurutta", position: 4, isActive: true },
  { id: "fnav-5", label: "Kirim Karya Tulisan", url: "/kirim-tulisan", position: 5, isActive: true }
];

export const INITIAL_FOOTER_FOCUS: FooterFocusItem[] = [
  { id: "ffoc-1", name: "Usul Fikih & Qawa'id Fiqhiyyah", icon: "⚖️", position: 1, isActive: true },
  { id: "ffoc-2", name: "Fiqh Muqaran (Perbandingan Madzhab)", icon: "📖", position: 2, isActive: true },
  { id: "ffoc-3", name: "'Ulumul Qur'an & Tafsir Turats", icon: "✨", position: 3, isActive: true },
  { id: "ffoc-4", name: "Dirasah Hadits wa Rijaluha", icon: "📜", position: 4, isActive: true },
  { id: "ffoc-5", name: "Manuskrip Gurutta Ambo Dalle", icon: "👑", position: 5, isActive: true }
];

export const INITIAL_SETTINGS: SiteSettings = {
  institutionName: "Ma'had Aly Pendidikan Tinggi Kader Ulama DDI Abdurrahman Ambo Dalle, Mangkoso",
  takhassus: "Fiqh wa Usuluhu (Fiqh dan Ushul Fikih)",
  focusField: "Fiqh Mu'asarah (الفقه المعاصر) — Fiqh Kontemporer",
  mudirName: "AGH. Prof. Dr. M. Faried Wadjedy, MA",
  establishedDate: "5 November 2013 (1 Muharram 1435 H)",
  location: "Kab. Barru, Sulawesi Selatan",
  address: "Kompleks Pondok Pesantren DDI Mangkoso, Kel. Mangkoso, Kec. Soppeng Riaja, Kab. Barru, Sulawesi Selatan 90752",
  phone: "+62 812-3456-7890",
  emailSubmission: "munzirahmad779@gmail.com",
  targetSubmissionEmails: ["munzirahmad779@gmail.com"],
  visi: "Menjadi pusat keunggulan kaderisasi fuqaha mutafaqqih fiddin tingkat tinggi yang otoritatif dalam khazanah turats klasik dan progresif menjawab dinamika Fiqh Mu'asarah.",
  misi: [
    "Menyelenggarakan pendidikan kader ulama berbasis talaqqi sanad kitab turats klasik.",
    "Mengembangkan riset Fiqh Mu'asarah yang responsif terhadap isu teknologi, ekonomi, medis, dan bioetika.",
    "Menanamkan integritas moral, keikhlasan, dan wawasan moderasi beragama (wasathiyyah Islamiyah).",
    "Membekali mahasantri dengan kecakapan metodologi istinbath hukum dan Bahtsul Masail kontemporer."
  ],
  historyContent: "Ma'had Aly DDI Mangkoso didirikan pada tanggal 5 November 2013 (1 Muharram 1435 H) oleh AGH. Prof. Dr. M. Faried Wadjedy, MA bersama dewan masyaikh dalam rangka meregenerasi ulama fuqaha yang mumpuni dalam khazanah turats klasik dan responsif terhadap problematika zaman modern.",
  historyArabic: "تَأْسِيْسُ مَعْهَدِ عَالِي لِتَخْرِيْجِ عُلَمَاءِ الْفِقْهِ الْمُعَاصِرِ عَلَى مَنْهَجِ أَهْلِ السُّنَّةِ وَالْجَمَاعَةِ",
  gradingSystemRules: "Sistem penilaian menggabungkan pengujian hafalan matan turats (ikhtibar), penguasaan qawa'id fiqhiyyah, keaktifan halaqah Bahtsul Masail, serta penulisan risalah ilmiah skripsi (munaqasyah) dengan standar kelulusan predikat Mumtaz (Cum Laude).",
  academicGuideBookUrl: "https://drive.google.com/file/d/pedoman-akademik-mahad-aly-2026/view?usp=sharing",
  academicGuideBookSize: "4.5 MB",
  academicGuideBookYear: "2026/2027",
  hero: INITIAL_HERO,
  quote: INITIAL_QUOTE,
  seo: INITIAL_SEO,
  socialMedia: INITIAL_SOCIAL_MEDIA,
  footer: INITIAL_FOOTER_SETTINGS,
  maintenanceMode: false
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
    arabicReferences: "الأَصْلُ فِي الْمُعَامَلَاتِ الإِبَاحَةُ حَتَّى يَدُلَّ الدَّلِيْلُ عَلَى التَّحْرِيْمِ"
  },
  {
    id: "bm-2",
    title: "Status Uang Elektronik dan Saldo Paylater Ditinjau dari Akad Qardh & Sarf",
    question: "Apakah denda keterlambatan pada layanan paylater syariah termasuk riba nasi'ah?",
    answer: "Denda keterlambatan yang ditetapkan sebagai keuntungan penyedia adalah riba yang diharamkan. Namun jika denda tersebut dialokasikan 100% untuk dana kebajikan (ta'widh & qardhul hasan) tanpa menguntungkan kreditur, fatwa DSN-MUI memperbolehkannya sebagai ta'zir mali.",
    theme: "Fiqh Muamalah Kontemporer",
    author: "Lembaga Bahtsul Masail DDI Mangkoso",
    date: "28 September 2026",
    status: "published"
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
    ]
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
    ]
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
    title: "Profil & Sejarah Ma'had Aly DDI Mangkoso — Sejak 2013",
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
    id: "log-1",
    user: "Super Admin",
    action: "Menerbitkan Artikel",
    target: "Tinjauan Fiqh Mu'asarah atas Smart Contract dan Aset Kripto",
    timestamp: "10 menit lalu"
  },
  {
    id: "log-2",
    user: "Super Admin",
    action: "Menambahkan Skripsi",
    target: "Rekonstruksi Ijtihad Jama'i dalam Fatwa Fintech",
    timestamp: "1 jam lalu"
  },
  {
    id: "log-3",
    user: "Editor",
    action: "Menyetujui Naskah",
    target: "Kajian Fiqh Medis Bayi Tabung",
    timestamp: "5 jam lalu"
  },
  {
    id: "log-4",
    user: "Super Admin",
    action: "Memperbarui Pengaturan",
    target: "Visi Misi & Kontak Lembaga",
    timestamp: "Kemarin"
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
    iconName: "book-open"
  },
  {
    id: "cat-11",
    slug: "karya-anregurutta",
    name: "Karya Anregurutta",
    description: "Khazanah manuskrip, fatwa, dan risalah pemikiran AGH. Abdurrahman Ambo Dalle serta para masyayikh DDI Mangkoso.",
    iconName: "crown"
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
    tags: ["Fiqh Lingkungan", "Green Economy", "Konservasi", "Krisis Iklim"]
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
    author: "Humas Ma'had Aly"
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
    author: "Biro Akademik"
  }
];
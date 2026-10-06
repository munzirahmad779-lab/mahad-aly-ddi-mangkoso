import { Article, CategoryInfo, Thesis, NewsItem, SiteSettings } from "./types";

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
  visi: "Menjadi pusat keunggulan kaderisasi fuqaha mutafaqqih fiddin tingkat tinggi yang otoritatif dalam khazanah turats klasik dan progresif menjawab dinamika Fiqh Mu'asarah.",
  misi: [
    "Menyelenggarakan pendidikan kader ulama berbasis talaqqi sanad kitab turats klasik.",
    "Mengembangkan riset Fiqh Mu'asarah yang responsif terhadap isu teknologi, ekonomi, medis, dan bioetika.",
    "Menanamkan integritas moral, keikhlasan, dan wawasan moderasi beragama (wasathiyyah Islamiyah).",
    "Membekali mahasantri dengan kecakapan metodologi istinbath hukum dan Bahtsul Masail kontemporer."
  ]
};

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
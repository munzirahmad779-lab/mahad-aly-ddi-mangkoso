import { Article, CategoryInfo } from "./types";

export const CATEGORIES: CategoryInfo[] = [
  {
    slug: "karya-anregurutta",
    name: "Karya Anregurutta",
    description: "Kutubut turats, manuskrip, dan fatwa pemikiran AGH. Abdurrahman Ambo Dalle serta para masyayikh DDI Mangkoso.",
    iconName: "crown",
  },
  {
    slug: "usul-fikih",
    name: "Usul Fikih",
    description: "Kaidah istinbath hukum Islam, maqashid asy-syari'ah, dan dialektika fiqh muqaran terhadap problematika kontemporer.",
    iconName: "scale",
  },
  {
    slug: "tafsir-hadis",
    name: "Tafsir & Hadis",
    description: "Kajian 'Ulumul Qur'an, kritik sanad-matan hadis, serta metodologi hermeneutika tafsir salaf.",
    iconName: "book",
  },
];

export const ARTICLES: Article[] = [
  {
    id: "1",
    slug: "integrasi-ulum-al-quran-mursyid-ath-thullab",
    title: "Integrasi 'Ulum al-Qur'an dalam Kitab Mursyid ath-Thullab",
    excerpt: "Analisis metodologi AGH. Abdurrahman Ambo Dalle dalam merumuskan kaidah tafsir aplikatif bagi penuntut ilmu di Nusantara.",
    content: `Kitab *Mursyid ath-Thullab* merupakan salah satu karya monumental Anregurutta KH. Abdurrahman Ambo Dalle yang memadukan kaidah-kaidah kunci dalam memahami teks suci Al-Qur'an dengan realitas sosial kemasyarakatan.

Dalam pembahasannya, Gurutta menekankan bahwa penguasaan bahasa Arab—khususnya Nahwu, Sharaf, dan Balaghah—bukan sekadar formalitas linguistik, melainkan kunci pembuka pintu maqashid (tujuan syariat). Pemahaman terhadap asbabun nuzul dan kaidah 'am-khas menjadi benteng utama agar seorang penuntut ilmu tidak terjebak dalam pemahaman tekstualis yang sempit.

Tradisi keilmuan yang dibangun di DDI Mangkoso senantiasa menempatkan kitab ini sebagai rujukan fundamental pada tahapan awal pengkaderan sebelum santri mendalami kitab-kitab tafsir thurats yang lebih tebal seperti *Tafsir al-Baidhawi* dan *Tafsir Ibn Katsir*.`,
    author: "Ahmad Yusuf Mubarak, S.Ag.",
    authorRole: "Mahasantri Marhalah Ula",
    category: "karya-anregurutta",
    categoryLabel: "Karya Anregurutta",
    date: "03 Oktober 2026",
    hijriDate: "21 Rabiul Akhir 1448 H",
    readTime: "5 menit",
    isSpecial: true,
  },
  {
    id: "2",
    slug: "dinamika-istinbath-hukum-tradisi-pesantren",
    title: "Dinamika Istinbath Hukum dalam Tradisi Pesantren Salaf",
    excerpt: "Mengkaji bagaimana metode penetapan hukum madzhab Syafi'i diajarkan dan diimplementasikan terhadap problematika masyarakat modern.",
    content: `Bahtsul Masail di lingkungan pesantren salaf memiliki metodologi istinbath yang sangat berjenjang dan hati-hati. Dimulai dari *al-qaul* (merujuk langsung pada nash pendapat imam madzhab), *al-wajh* (pendapat murid-murid senior madzhab), hingga *al-ilhaq* (menganalogikan masalah baru dengan kasus yang serupa dalam kutubut turats).

Sistem halaqah di Ma'had Aly DDI Mangkoso membiasakan mahasantri tidak hanya menghafal teks matan fiqih, tetapi menggali 'illat (alasan hukum) yang terkandung di dalamnya. Hal ini menjadikan alumni Ma'had Aly tetap kokoh memegang manhaj madzhab seraya lentur dalam merespon persoalan muamalah kontemporer seperti transaksi perbankan syariah dan bioetika kedokteran.`,
    author: "Ust. M. Idrus, M.Ag.",
    authorRole: "Dosen Usul Fikih",
    category: "usul-fikih",
    categoryLabel: "Usul Fikih",
    date: "05 Oktober 2026",
    hijriDate: "23 Rabiul Akhir 1448 H",
    readTime: "7 menit",
  },
  {
    id: "3",
    slug: "tantangan-digitalisasi-maktabah-syamilah-hadis",
    title: "Tantangan Digitalisasi Maktabah Syamilah dalam Takhrij Hadis",
    excerpt: "Urgensi menjaga verifikasi sanad manual serta kaidah jarh wa ta'dil di era kemudahan aplikasi pencari hadis digital.",
    content: `Kehadiran Maktabah Syamilah dan berbagai aplikasi pencari riwayat hadis telah memberikan kemudahan luar biasa dalam proses takhrij. Namun, kecepatan pencarian algoritma digital tidak boleh menggantikan ketelitian kritik sanad (*naqd as-sanad*) dan kaidah *jarh wa ta'dil*.

Mahasantri Ma'had Aly dilatih untuk selalu memverifikasi ulang naskah cetak (*tahqiq*), meneliti kebersambungan sanad (*ittishal as-sanad*), serta memeriksa kemungkinan adanya illat tersembunyi (*al-'ilal al-khafiyyah*) yang seringkali luput dari pembacaan instan software digital.`,
    author: "Ismail Hannanong, Lc.",
    authorRole: "Dosen 'Ulumul Hadits",
    category: "tafsir-hadis",
    categoryLabel: "Tafsir & Hadis",
    date: "01 Oktober 2026",
    hijriDate: "19 Rabiul Akhir 1448 H",
    readTime: "6 menit",
  },
  {
    id: "4",
    slug: "risalah-moderasi-beragama-anregurutta",
    title: "Risalah Moderasi Beragama dalam Pandangan Anregurutta",
    excerpt: "Penjelasan konsep Wasathiyyah Islamiyah dan ukhuwah wathaniyah yang diwariskan dari pengkaderan ulama DDI Mangkoso.",
    content: `Prinsip *Wasathiyyah* (moderat) bukanlah bentuk kompromi yang mengorbankan prinsip aqidah, melainkan manifestasi dari keadilan (*al-'adalah*) dan pilihan terbaik (*al-khiyarah*). 

Dalam perjalanan dakwah Anregurutta di bumi Nusantara, dakwah senantiasa disampaikan dengan pendekatan bil-hikmah, merangkul kearifan lokal tanpa melanggar batas syar'i. Nilai inilah yang menjadi ruh utama pembinaan karakter kader ulama di Ma'had Aly DDI Mangkoso.`,
    author: "AGH. Prof. Dr. M. Faried Wadjedy, MA",
    authorRole: "Mudir Ma'had Aly",
    category: "karya-anregurutta",
    categoryLabel: "Karya Anregurutta",
    date: "28 September 2026",
    hijriDate: "16 Rabiul Akhir 1448 H",
    readTime: "8 menit",
    isSpecial: true,
  },
  {
    id: "5",
    slug: "kaidah-maqashid-syariah-kemaslahatan-umat",
    title: "Kaidah Maqashid Syari'ah dalam Mengawal Kemaslahatan Ummat",
    excerpt: "Studi komparasi antara kitab Al-Muwafaqat Imam Asy-Syathibi dan penerapan prinsip dharuriyyat al-khams.",
    content: `Kemaslahatan manusia berporos pada pemeliharaan lima prinsip dasar: agama (*hifzh ad-din*), jiwa (*hifzh an-nafs*), akal (*hifzh al-'aql*), keturunan (*hifzh an-nasl*), dan harta (*hifzh al-mal*). 

Memahami hierarki dharuriyyat, hajiyyat, dan tahsiniyyat menjadi keharusan mutlak bagi calon mufti agar mampu membedakan mana perkara pokok yang tidak boleh berubah (*tsawabit*) dan mana wilayah fleksibel yang dapat beradaptasi (*mutaghayyirat*).`,
    author: "Ahmad Yusuf Mubarak, S.Ag.",
    authorRole: "Mahasantri Marhalah Ula",
    category: "usul-fikih",
    categoryLabel: "Usul Fikih",
    date: "24 September 2026",
    hijriDate: "12 Rabiul Akhir 1448 H",
    readTime: "6 menit",
  },
  {
    id: "6",
    slug: "kaidah-ibarah-khusus-sabab-umum-lafzh",
    title: "Aplikasi Kaidah 'Ibarah bi Khusus as-Sabab wa 'Umum al-Lafzh",
    excerpt: "Urgensi pemahaman asbabun nuzul dalam meluruskan kekeliruan penafsiran ayat-ayat sosial kemasyarakatan.",
    content: `Kaidah usuliyah *"Al-'ibrah bi 'umum al-lafzh la bi khusus as-sabab"* (yang menjadi pegangan adalah keumuman lafaz, bukan kekhususan sebab turunnya) seringkali disalahpahami tanpa memperhatikan konteks maqashidi.

Kajian tafsir di Ma'had Aly mendudukkan kembali kaidah ini secara proporsional dengan mengombinasikan telaah sanad riwayat sababun nuzul dan analisis gramatika balaghah Al-Qur'an.`,
    author: "Dewan Masyaikh Ma'had Aly",
    authorRole: "Tim Kajian Turats",
    category: "tafsir-hadis",
    categoryLabel: "Tafsir & Hadis",
    date: "18 September 2026",
    hijriDate: "06 Rabiul Akhir 1448 H",
    readTime: "5 menit",
  },
];
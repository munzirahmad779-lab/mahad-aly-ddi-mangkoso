// ─────────────────────────────────────────────────────────────────────────────
// Tiga bahasa antarmuka jurnal — modul bersama klien dan server (Tahap 6).
//
// Cakupan terjemahan adalah KERANGKA antarmuka: spanduk, navigasi,
// judul permukaan, label, dan tombol. Isi artikel, abstrak, pengumuman,
// dan isi halaman kebijakan TIDAK diterjemahkan di sini (itu isi, bukan
// kerangka). Bahasa persisten lewat cookie "jurnal-bahasa" (dibaca server
// untuk arah RTL yang benar sejak render pertama) dan localStorage
// (cadangan klien). Bahasa bawaan: id. Arab dirender RTL pada wadah
// jurnal (dir="rtl" lang="ar" di layout jurnal).
// ─────────────────────────────────────────────────────────────────────────────

export const JURNAL_LOCALES = ["id", "en", "ar"] as const;
export type JurnalLocale = (typeof JURNAL_LOCALES)[number];

export const JURNAL_LOCALE_COOKIE = "jurnal-bahasa";
export const JURNAL_LOCALE_STORAGE = "jurnal-bahasa";

export function isJurnalLocale(v: unknown): v is JurnalLocale {
  return v === "id" || v === "en" || v === "ar";
}

export function arahLocale(l: JurnalLocale): "rtl" | "ltr" {
  return l === "ar" ? "rtl" : "ltr";
}

export const JURNAL_LOCALE_LABEL: Record<JurnalLocale, string> = {
  id: "Bahasa Indonesia",
  en: "English",
  ar: "العربية"
};

const ID = {
  spandukJudul: "VERSI UJI — BUKAN SITUS RESMI",
  spandukIsi:
    "Ini versi uji cabang jurnal kustom Ma'had Aly DDI Mangkoso. Nama jurnal masih berupa usulan, seluruh artikel adalah contoh bertanda contoh, dan data naskah tersimpan di lapisan data uji terpisah (tidak masuk basis data produksi kampus).",
  navigasiLabel: "Navigasi jurnal versi uji",
  navBeranda: "Beranda Jurnal",
  navCari: "Cari Artikel",
  navPengumuman: "Pengumuman",
  navTentang: "Tentang Jurnal",
  navFokus: "Fokus dan Ruang Lingkup",
  navDewan: "Dewan Redaksi",
  navPedoman: "Pedoman Penulis",
  navEtika: "Etika Publikasi",
  navBiaya: "Biaya dan Lisensi",
  navTerbitan: "Terbitan",
  navKirim: "Kirim Naskah",
  navLacak: "Lacak Naskah",
  navDaftar: "Daftar Penulis",
  navMasuk: "Masuk Penulis",
  navNaskahSaya: "Naskah Saya",
  navReviewer: "Dasbor Reviewer",
  navPanel: "Panel Redaksi",
  pilihBahasa: "Bahasa antarmuka",
  publikasiIlmiah: "Publikasi Ilmiah",
  kirimNaskah: "Kirim Naskah",
  lacakNaskah: "Lacak Naskah",
  fokusDanRuangLingkup: "Fokus dan Ruang Lingkup",
  pengumuman: "Pengumuman",
  semuaPengumuman: "Semua pengumuman",
  daftarTerbitan: "Daftar Terbitan",
  terbitanBerjalan: "Terbitan Berjalan",
  artikelTerbaru: "Artikel Terbaru",
  belumAdaTerbitan:
    "Belum ada terbitan yang diterbitkan. Terbitan pertama akan tampil di sini sesudah redaksi menerbitkannya dari panel.",
  belumAdaArtikel: "Belum ada artikel yang diterbitkan.",
  satuanArtikel: "artikel",
  cariJudul: "Pencarian Artikel",
  cariPlaceholder: "Judul, abstrak, kata kunci, atau nama penulis",
  cariTombol: "Cari",
  saringBagian: "Bagian",
  saringTerbitan: "Terbitan",
  semuaPilihan: "Semua",
  hasilDitemukan: "artikel ditemukan",
  tidakDitemukan: "Tidak ada artikel yang cocok dengan pencarian ini.",
  abstrak: "Abstrak",
  kataKunci: "Kata kunci",
  caraMengutip: "Cara Mengutip",
  unduhSitasiBibtex: "Unduh BibTeX",
  unduhSitasiRis: "Unduh RIS",
  bacaPdf: "Baca PDF",
  bacaHtml: "Baca HTML",
  doiBelum: "DOI belum diterbitkan",
  diterbitkanDalam: "Diterbitkan dalam",
  halamanLabel: "hlm.",
  pengumumanJudul: "Pengumuman Jurnal",
  belumAdaPengumuman: "Belum ada pengumuman yang tayang.",
  artikelPadaBagian: "Artikel pada bagian",
  masukJudul: "Masuk Penulis",
  daftarJudul: "Daftar sebagai Penulis",
  lacakJudul: "Lacak Naskah",
  lacakKodeLabel: "Kode lacak",
  lacakTombol: "Lacak",
  naskahSayaJudul: "Naskah Saya",
  kirimJudul: "Kirim Naskah",
  statusSubmitted: "Terkirim",
  statusReview: "Dalam Telaah",
  statusCopyediting: "Penyuntingan",
  statusProduction: "Produksi",
  statusPublished: "Terbit",
  statusDeclined: "Ditolak"
} as const;

export type JurnalDict = Record<keyof typeof ID, string>;

const EN: JurnalDict = {
  spandukJudul: "TEST VERSION — NOT THE OFFICIAL SITE",
  spandukIsi:
    "This is a test version of the custom journal branch of Ma'had Aly DDI Mangkoso. The journal name is still a proposal, all articles are marked samples, and submission data is stored in a separate test data layer (never in the campus production database).",
  navigasiLabel: "Test journal navigation",
  navBeranda: "Journal Home",
  navCari: "Search Articles",
  navPengumuman: "Announcements",
  navTentang: "About the Journal",
  navFokus: "Focus and Scope",
  navDewan: "Editorial Team",
  navPedoman: "Author Guidelines",
  navEtika: "Publication Ethics",
  navBiaya: "Fees and Licensing",
  navTerbitan: "Issues",
  navKirim: "Submit a Manuscript",
  navLacak: "Track a Manuscript",
  navDaftar: "Author Registration",
  navMasuk: "Author Login",
  navNaskahSaya: "My Submissions",
  navReviewer: "Reviewer Dashboard",
  navPanel: "Editorial Panel",
  pilihBahasa: "Interface language",
  publikasiIlmiah: "Scholarly Publication",
  kirimNaskah: "Submit a Manuscript",
  lacakNaskah: "Track a Manuscript",
  fokusDanRuangLingkup: "Focus and Scope",
  pengumuman: "Announcements",
  semuaPengumuman: "All announcements",
  daftarTerbitan: "Issues",
  terbitanBerjalan: "Current Issue",
  artikelTerbaru: "Latest Articles",
  belumAdaTerbitan:
    "No issue has been published yet. The first issue will appear here once the editors publish it from the panel.",
  belumAdaArtikel: "No article has been published yet.",
  satuanArtikel: "articles",
  cariJudul: "Article Search",
  cariPlaceholder: "Title, abstract, keywords, or author name",
  cariTombol: "Search",
  saringBagian: "Section",
  saringTerbitan: "Issue",
  semuaPilihan: "All",
  hasilDitemukan: "articles found",
  tidakDitemukan: "No article matches this search.",
  abstrak: "Abstract",
  kataKunci: "Keywords",
  caraMengutip: "How to Cite",
  unduhSitasiBibtex: "Download BibTeX citation",
  unduhSitasiRis: "Download RIS citation",
  bacaPdf: "Read PDF",
  bacaHtml: "Read HTML",
  doiBelum: "DOI not yet issued",
  diterbitkanDalam: "Published in",
  halamanLabel: "pp.",
  pengumumanJudul: "Journal Announcements",
  belumAdaPengumuman: "No announcement is currently displayed.",
  artikelPadaBagian: "Articles in the section",
  masukJudul: "Author Login",
  daftarJudul: "Register as an Author",
  lacakJudul: "Track a Manuscript",
  lacakKodeLabel: "Tracking code",
  lacakTombol: "Track",
  naskahSayaJudul: "My Submissions",
  kirimJudul: "Submit a Manuscript",
  statusSubmitted: "Submitted",
  statusReview: "Under Review",
  statusCopyediting: "Copyediting",
  statusProduction: "Production",
  statusPublished: "Published",
  statusDeclined: "Declined"
};

const AR: JurnalDict = {
  spandukJudul: "نسخة تجريبية — ليست الموقع الرسمي",
  spandukIsi:
    "هذه نسخة تجريبية من فرع المجلة المخصص لمعهد علي دي دي آي مانكوسو. اسم المجلة ما يزال مقترحا، وجميع المقالات نماذج موسومة بأنها نماذج، وبيانات البحوث محفوظة في طبقة بيانات تجريبية منفصلة (لا تدخل قاعدة بيانات الإنتاج للجامعة).",
  navigasiLabel: "تنقل المجلة التجريبية",
  navBeranda: "الرئيسية",
  navCari: "بحث المقالات",
  navPengumuman: "الإعلانات",
  navTentang: "عن المجلة",
  navFokus: "المجال ونطاق التركيز",
  navDewan: "هيئة التحرير",
  navPedoman: "إرشادات المؤلفين",
  navEtika: "أخلاقيات النشر",
  navBiaya: "الرسوم والترخيص",
  navTerbitan: "الأعداد",
  navKirim: "إرسال بحث",
  navLacak: "تتبع البحث",
  navDaftar: "تسجيل المؤلفين",
  navMasuk: "دخول المؤلفين",
  navNaskahSaya: "بحوثي",
  navReviewer: "لوحة المحكمين",
  navPanel: "لوحة التحرير",
  pilihBahasa: "لغة الواجهة",
  publikasiIlmiah: "نشر علمي",
  kirimNaskah: "إرسال بحث",
  lacakNaskah: "تتبع البحث",
  fokusDanRuangLingkup: "المجال ونطاق التركيز",
  pengumuman: "الإعلانات",
  semuaPengumuman: "جميع الإعلانات",
  daftarTerbitan: "قائمة الأعداد",
  terbitanBerjalan: "العدد الحالي",
  artikelTerbaru: "أحدث المقالات",
  belumAdaTerbitan:
    "لم يصدر أي عدد بعد. سيظهر العدد الأول هنا بعد أن تنشره هيئة التحرير من اللوحة.",
  belumAdaArtikel: "لم تصدر أي مقالة بعد.",
  satuanArtikel: "مقالة",
  cariJudul: "بحث المقالات",
  cariPlaceholder: "العنوان أو الملخص أو الكلمات المفتاحية أو اسم المؤلف",
  cariTombol: "ابحث",
  saringBagian: "القسم",
  saringTerbitan: "العدد",
  semuaPilihan: "الكل",
  hasilDitemukan: "مقالة وجدت",
  tidakDitemukan: "لا توجد مقالة مطابقة لهذا البحث.",
  abstrak: "الملخص",
  kataKunci: "الكلمات المفتاحية",
  caraMengutip: "كيفية الاقتباس",
  unduhSitasiBibtex: "تنزيل اقتباس BibTeX",
  unduhSitasiRis: "تنزيل اقتباس RIS",
  bacaPdf: "قراءة PDF",
  bacaHtml: "قراءة HTML",
  doiBelum: "لم يصدر DOI بعد",
  diterbitkanDalam: "نشر في",
  halamanLabel: "ص.",
  pengumumanJudul: "إعلانات المجلة",
  belumAdaPengumuman: "لا يوجد إعلان معروض حاليا.",
  artikelPadaBagian: "مقالات في قسم",
  masukJudul: "دخول المؤلفين",
  daftarJudul: "التسجيل كمؤلف",
  lacakJudul: "تتبع البحث",
  lacakKodeLabel: "رمز التتبع",
  lacakTombol: "تتبع",
  naskahSayaJudul: "بحوثي",
  kirimJudul: "إرسال بحث",
  statusSubmitted: "تم الإرسال",
  statusReview: "قيد التحكيم",
  statusCopyediting: "التحرير اللغوي",
  statusProduction: "الإنتاج",
  statusPublished: "منشور",
  statusDeclined: "مرفوض"
};

export const JURNAL_I18N: Record<JurnalLocale, JurnalDict> = {
  id: ID,
  en: EN,
  ar: AR
};

export function tJurnal(l: JurnalLocale): JurnalDict {
  return JURNAL_I18N[l] ?? ID;
}

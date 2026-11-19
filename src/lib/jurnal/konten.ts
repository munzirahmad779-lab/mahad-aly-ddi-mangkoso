// ─────────────────────────────────────────────────────────────────────────────
// Konten statis cabang jurnal VERSI UJI.
//
// Semua isi di berkas ini adalah CONTOH yang ditandai sebagai contoh:
// nama jurnal masih placeholder usulan, penulis artikel adalah nama fiktif
// ("Penulis Contoh ..."), dan abstrak secara eksplisit menyebut dirinya
// teks contoh. Berkas ini TIDAK membaca basis data produksi Supabase
// Mahadaly; konten jurnal uji berdiri sendiri di sini.
// ─────────────────────────────────────────────────────────────────────────────

export const JURNAL_NAMA_PLACEHOLDER = "Turatsuna";
export const JURNAL_NAMA_LABEL_UJI = "Turatsuna (Usulan Nama - Versi Uji)";
export const JURNAL_SUBJUDUL =
  "Jurnal Fiqh, Ushul Fiqh, dan Kajian Turats Ma'had Aly DDI Mangkoso";
export const JURNAL_PENERBIT_UJI =
  "Lembaga Jurnal Ma'had Aly DDI Mangkoso (versi uji, belum resmi)";

export const JURNAL_FOKUS_DAN_RUANG_LINGKUP: string[] = [
  "Fiqh dan Ushul Fiqh (takhasus resmi Ma'had Aly DDI Mangkoso)",
  "Ilmu Al-Qur'an dan Tafsir",
  "Kajian kitab turats dan khazanah pesantren",
  "Bahtsul Masa'il dan fiqh kontemporer",
  "Bahasa dan sastra Arab",
  "Pendidikan pesantren dan Ma'had Aly"
];

export interface TerbitanUji {
  slug: string;
  label: string; // "Vol. 1 No. 1 (Versi Uji)"
  tahun: number;
  tanggalTerbit: string; // ISO date
  catatan: string;
}

export interface ArtikelUji {
  slug: string;
  terbitanSlug: string;
  judul: string;
  penulis: string[]; // nama fiktif contoh
  afiliasi: string;
  seksi: string;
  abstrak: string;
  kataKunci: string[];
  halaman: string;
  bahasa: string;
  tanggalTerbit: string; // ISO date
  // Kolom DOI disiapkan sejak awal (skema kompatibel OJS). Pada versi uji
  // belum ada DOI sungguhan yang diterbitkan, jadi nilainya null dan
  // halaman menampilkan penanda "belum diterbitkan".
  doi: string | null;
}

export const TERBITAN_UJI: TerbitanUji[] = [
  {
    slug: "vol-1-no-1-versi-uji",
    label: "Vol. 1 No. 1 (Versi Uji)",
    tahun: 2026,
    tanggalTerbit: "2026-06-30",
    catatan:
      "Terbitan contoh untuk keperluan uji tampilan dan alur sistem. Bukan terbitan resmi."
  }
];

const CATATAN_ABSTRAK_CONTOH =
  "Abstrak ini adalah teks contoh untuk keperluan uji tampilan sistem jurnal dan bukan abstrak karya ilmiah yang diterbitkan.";

export const ARTIKEL_UJI: ArtikelUji[] = [
  {
    slug: "contoh-maslahah-muamalah-kontemporer",
    terbitanSlug: "vol-1-no-1-versi-uji",
    judul:
      "Konsep Maslahah dalam Penetapan Hukum Muamalah Kontemporer: Telaah Contoh atas Literatur Ushul Fiqh",
    penulis: ["Penulis Contoh A"],
    afiliasi: "Afiliasi Contoh A (fiktif, untuk versi uji)",
    seksi: "Ushul Fiqh",
    abstrak:
      "Tulisan contoh ini membahas kedudukan maslahah sebagai pertimbangan dalam penetapan hukum muamalah kontemporer menurut literatur ushul fiqh klasik dan modern. Pembahasan disusun sebagai bahan uji tampilan halaman artikel, metadata sitasi, dan struktur abstrak pada sistem jurnal versi uji. " +
      CATATAN_ABSTRAK_CONTOH,
    kataKunci: ["maslahah", "ushul fiqh", "muamalah kontemporer", "contoh"],
    halaman: "1-16",
    bahasa: "Bahasa Indonesia",
    tanggalTerbit: "2026-06-30",
    doi: null
  },
  {
    slug: "contoh-qiyas-istinbath-hukum",
    terbitanSlug: "vol-1-no-1-versi-uji",
    judul:
      "Kedudukan Qiyas dalam Istinbath Hukum: Kajian Contoh atas Kitab-Kitab Ushul Klasik",
    penulis: ["Penulis Contoh B"],
    afiliasi: "Afiliasi Contoh B (fiktif, untuk versi uji)",
    seksi: "Ushul Fiqh",
    abstrak:
      "Artikel contoh ini menelusuri kedudukan qiyas sebagai salah satu dalil hukum yang disepakati, meliputi rukun, syarat, dan perdebatan ulama ushul mengenainya. Isi disiapkan semata-mata sebagai bahan uji halaman artikel dan kelengkapan metadata Google Scholar serta Dublin Core. " +
      CATATAN_ABSTRAK_CONTOH,
    kataKunci: ["qiyas", "istinbath", "ushul fiqh", "contoh"],
    halaman: "17-32",
    bahasa: "Bahasa Indonesia",
    tanggalTerbit: "2026-06-30",
    doi: null
  },
  {
    slug: "contoh-tafsir-tematik-keadilan-sosial",
    terbitanSlug: "vol-1-no-1-versi-uji",
    judul:
      "Metode Tafsir Tematik dalam Studi Al-Qur'an: Contoh Penerapan pada Tema Keadilan Sosial",
    penulis: ["Penulis Contoh C"],
    afiliasi: "Afiliasi Contoh C (fiktif, untuk versi uji)",
    seksi: "Ilmu Al-Qur'an dan Tafsir",
    abstrak:
      "Tulisan contoh ini memaparkan langkah-langkah metode tafsir tematik (maudhu'i) dan contoh penerapannya pada tema keadilan sosial dalam Al-Qur'an. Naskah ini adalah bahan uji untuk kategori Ilmu Al-Qur'an dan Tafsir pada beranda jurnal versi uji. " +
      CATATAN_ABSTRAK_CONTOH,
    kataKunci: ["tafsir tematik", "maudhu'i", "keadilan sosial", "contoh"],
    halaman: "33-48",
    bahasa: "Bahasa Indonesia",
    tanggalTerbit: "2026-06-30",
    doi: null
  },
  {
    slug: "contoh-syarah-hasyiyah-turats-pesantren",
    terbitanSlug: "vol-1-no-1-versi-uji",
    judul:
      "Tradisi Syarah dan Hasyiyah dalam Khazanah Turats Pesantren: Sebuah Telaah Contoh",
    penulis: ["Penulis Contoh D"],
    afiliasi: "Afiliasi Contoh D (fiktif, untuk versi uji)",
    seksi: "Kajian Turats",
    abstrak:
      "Artikel contoh ini mengulas tradisi penulisan syarah dan hasyiyah sebagai ciri khazanah turats pesantren, termasuk fungsi pedagogisnya dalam pengajaran kitab kuning. Isi merupakan bahan uji tampilan untuk seksi Kajian Turats. " +
      CATATAN_ABSTRAK_CONTOH,
    kataKunci: ["syarah", "hasyiyah", "turats", "pesantren", "contoh"],
    halaman: "49-64",
    bahasa: "Bahasa Indonesia",
    tanggalTerbit: "2026-06-30",
    doi: null
  },
  {
    slug: "contoh-pembelajaran-nahwu-nazham",
    terbitanSlug: "vol-1-no-1-versi-uji",
    judul:
      "Pembelajaran Nahwu melalui Nazham Klasik: Contoh Analisis Materi Alfiyah",
    penulis: ["Penulis Contoh E"],
    afiliasi: "Afiliasi Contoh E (fiktif, untuk versi uji)",
    seksi: "Bahasa dan Sastra Arab",
    abstrak:
      "Tulisan contoh ini menganalisis susunan materi nahwu dalam nazham klasik dan relevansinya bagi pembelajaran bahasa Arab di pesantren. Naskah disiapkan sebagai bahan uji untuk seksi Bahasa dan Sastra Arab pada sistem jurnal versi uji. " +
      CATATAN_ABSTRAK_CONTOH,
    kataKunci: ["nahwu", "nazham", "bahasa Arab", "pembelajaran", "contoh"],
    halaman: "65-80",
    bahasa: "Bahasa Indonesia",
    tanggalTerbit: "2026-06-30",
    doi: null
  }
];

export function getTerbitan(slug: string): TerbitanUji | undefined {
  return TERBITAN_UJI.find((t) => t.slug === slug);
}

export function getArtikel(slug: string): ArtikelUji | undefined {
  return ARTIKEL_UJI.find((a) => a.slug === slug);
}

export function artikelPadaTerbitan(terbitanSlug: string): ArtikelUji[] {
  return ARTIKEL_UJI.filter((a) => a.terbitanSlug === terbitanSlug);
}

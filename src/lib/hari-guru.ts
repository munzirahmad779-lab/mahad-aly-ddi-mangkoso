// Gabungan tulisan Hari Guru (perintah user 26 Nov 2026: di Warta &
// Berita hanya boleh ada SATU berita gabungan; tiga tulisan aslinya
// hidup di laman /hari-guru, tempat pembaca memilih sendiri tulisan
// yang ingin dibaca; kartu dan halaman satu-satu di daftar berita
// dihapus). Baris berita ketiga tulisan TETAP ada di basis data
// karena laman /hari-guru membaca isinya dari sana; yang berubah
// hanya permukaan tampilnya:
//   1. Daftar /berita dan panel Warta & Berita di beranda menyaring
//      ketiga tulisan itu keluar dan menampilkan satu kartu gabungan
//      ini, tertaut ke /hari-guru.
//   2. URL lama ketiga berita itu mengalihkan ke /hari-guru.
//   3. Sitemap tidak lagi mengiklankan ketiga URL satu-satu itu.

export const TIPE_HARI_GURU = "Hari Guru";

export const SLUG_TULISAN_HARI_GURU: readonly string[] = [
  "guru-yang-menjadi-lentera-kenangan-bersama-para-pembimbingku-di-hari-guru",
  "tentang-mereka-yang-menanamkan-cahaya",
  "menghayati-sebuah-mosi-otokritik-untuk-mahasantri"
];

export const TAUTAN_HARI_GURU = "/hari-guru";

export const KARTU_GABUNGAN_HARI_GURU = {
  id: "gabungan-hari-guru",
  slug: "hari-guru",
  title: "Open Tulisan Hari Guru",
  excerpt:
    "Tiga tulisan refleksi mahasantri memperingati Hari Guru, dari Mona Az-zaqiyyah, Wiladah Mazkiyah, dan Fikran Zahir. Buka lamannya, lalu pilih tulisan yang ingin dibaca.",
  content: "",
  category: TIPE_HARI_GURU,
  author: "Mahasantri Ma'had Aly",
  date: "25 November 2026",
  imageUrl: undefined as string | undefined,
  attachmentUrl: undefined as string | undefined
};

export function adalahTulisanHariGuru(item: {
  category?: unknown;
}): boolean {
  return (item?.category as string) === TIPE_HARI_GURU;
}

export function tautanItemBerita(item: {
  id?: unknown;
  slug?: unknown;
}): string {
  return item?.id === KARTU_GABUNGAN_HARI_GURU.id
    ? TAUTAN_HARI_GURU
    : `/berita/${item?.slug ?? ""}`;
}

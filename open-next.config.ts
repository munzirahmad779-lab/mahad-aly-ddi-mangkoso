import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// Penampung hasil render memakai Workers Static Assets (binding ASSETS
// yang SUDAH terpasang). Sebelumnya open-next.config kosong sehingga
// OpenNext memakai penampung "dummy": TIDAK ADA halaman yang tersimpan,
// setiap kunjungan merender ulang seluruh halaman dari nol, dan itulah
// akar galat 1102 yang berulang pada 8 Nov 2026.
//
// Sifat penampung ini: hanya-baca, isinya potret saat build. Halaman
// yang sudah terbit disajikan dari potret itu (pengunjung tetap melihat
// isi terbaru karena ArticleContext menyegarkan data dari Supabase
// sesudah halaman termuat; halaman detail tulisan memang dinamis dan
// tidak lewat penampung ini). Peningkatan lanjutan yang ideal adalah
// penampung R2 (bisa menulis dan memvalidasi ulang), tetapi itu butuh
// satu kali pembuatan bucket di dashboard Cloudflare.
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache
});

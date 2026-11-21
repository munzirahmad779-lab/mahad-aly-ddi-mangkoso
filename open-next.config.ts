import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue";

// Penampung hasil render (incremental cache) di R2, bucket
// mahad-aly-inc-cache (binding NEXT_INC_CACHE_R2_BUCKET di
// wrangler.jsonc). Riwayat: konfigurasi kosong memakai penampung
// "dummy" sehingga setiap kunjungan merender ulang seluruh halaman
// (akar galat 1102, 8 Nov 2026); perbaikan darurat 9 Nov memakai
// penampung aset statis yang hanya-baca; kini naik ke R2 yang bisa
// menulis dan memvalidasi ulang, jadi HTML server ikut segar.
//
// Antrean validasi ulang WAJIB terpasang (perbaikan 22 Nov 2026):
// tanpa opsi queue, OpenNext memakai antrean "dummy" yang membuang
// semua pekerjaan render ulang di latar, sehingga halaman prarender
// menyajikan data seed basi tanpa batas waktu (terbukti: perubahan
// menu di basis data tidak pernah masuk HTML server; tampilan hanya
// benar sesudah sinkronisasi klien berjalan). doQueue menyalurkan
// pekerjaan itu ke Durable Object NEXT_CACHE_DO_QUEUE (binding dan
// migrasinya di wrangler.jsonc), jadi ISR benar-benar merender ulang.
export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
  queue: doQueue
});

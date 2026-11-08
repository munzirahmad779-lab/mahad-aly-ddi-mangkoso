import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

// Penampung hasil render (incremental cache) di R2, bucket
// mahad-aly-inc-cache (binding NEXT_INC_CACHE_R2_BUCKET di
// wrangler.jsonc). Riwayat: konfigurasi kosong memakai penampung
// "dummy" sehingga setiap kunjungan merender ulang seluruh halaman
// (akar galat 1102, 8 Nov 2026); perbaikan darurat 9 Nov memakai
// penampung aset statis yang hanya-baca; kini naik ke R2 yang bisa
// menulis dan memvalidasi ulang, jadi HTML server ikut segar.
export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache
});

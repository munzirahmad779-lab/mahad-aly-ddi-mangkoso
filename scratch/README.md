# Perkakas uji — Sinkronisasi Spreadsheet

Folder ini **bukan bagian aplikasi**. Isinya skrip uji untuk memverifikasi fitur
sinkronisasi Google Spreadsheet → website tanpa menyentuh data produksi.

## Berkas

| Berkas | Kegunaan |
| --- | --- |
| `test-spreadsheet.mts` | 80 uji unit: parser CSV, konverter Drive→CDN, normalisasi 4 modul, template. |
| `mock-supabase.mjs` | Supabase tiruan (GoTrue + PostgREST) di `127.0.0.1:54321`. Diseed otomatis dari database asli **hanya-baca** (atau dari `scratch/baseline/db-before.json` bila ada). |
| `test-sync-api.mjs` | 70 uji endpoint `/api/admin/sync/sheets`: pratinjau, simpan, backup, rollback, integritas data asli, penanganan galat. |
| `test-browser.mjs` | 31 uji browser (Microsoft Edge): data tersinkron tampil di `/profil`, `/akademik`, `/dema`; anti-flicker; tanpa hydration mismatch. |
| `test-admin-ui.mjs` | 22 uji UI panel admin: buka menu, unduh template, unggah CSV dari HP, pratinjau, simpan, cadangan, rollback. |
| `test-template-csv.mts` | 83 uji format template CSV: varian Excel (`sep=;` + titik koma + BOM) dan Google Sheets (koma), bolak-balik parser, serta peringatan geser kolom bila ada koma tanpa kutip. |
| `test-template-download.mjs` | 10 uji unduhan nyata dari panel: nama berkas, BOM, baris `sep=;`, jumlah kolom kedua varian. |
| `verify-live-bundle.mjs` | 9 uji terhadap situs produksi: bundel JS yang tayang benar-benar memuat kode baru (kartu masyayikh baru, dua tombol template). |
| `test-panel-layout.mjs` | 12 uji kenyamanan baca panel: jarak antar kartu, ukuran teks, tinggi tombol/input, luapan horizontal di desktop 1440px & HP 390px. Menyimpan tangkapan layar ke `scratch/screenshots/`. |
| `test-production-pages.mjs` | 12 uji asap halaman publik terhadap database produksi asli. |
| `verify-production.mjs` | 22 uji bahwa pratinjau berjalan di data produksi dan **tidak ada satu baris pun berubah**. |

## Menjalankan

**1. Uji unit (tanpa server):**

```bash
npx tsx scratch/test-spreadsheet.mts
```

**2. Uji endpoint + browser (memakai Supabase tiruan):**

```bash
# terminal 1 — Supabase tiruan
node scratch/mock-supabase.mjs

# terminal 2 — build & jalankan dengan env tiruan
#   PowerShell:
$env:NEXT_PUBLIC_SUPABASE_URL="http://127.0.0.1:54321"
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY="test-anon-key"
$env:SUPABASE_SERVICE_ROLE_KEY="test-service-role-key"
npm run build
npx next start -p 3101

# terminal 3
node scratch/test-sync-api.mjs      # butuh server di :3100/:3101 — set TEST_BASE
node scratch/test-browser.mjs       # TEST_BASE=http://127.0.0.1:3101
node scratch/test-admin-ui.mjs      # TEST_BASE=http://127.0.0.1:3101
node scratch/test-panel-layout.mjs # tata letak + tangkapan layar
node scratch/test-template-download.mjs # unduh kedua varian template
```

> Uji browser memakai Microsoft Edge yang sudah terpasang (tanpa mengunduh Chromium).
> Paket `playwright` dipasang di luar repo (`../.pw-tools`) agar `package.json` tetap bersih.

**3. Uji terhadap database produksi (hanya baca):**

```bash
# build bersih tanpa env tiruan, lalu:
npx next start -p 3102
node scratch/verify-production.mjs
node scratch/test-production-pages.mjs
```

> Percobaan "Simpan" terhadap database asli **harus ditolak** (503 selama kunci belum ada,
> atau tetap nol penulisan bila kunci sudah terpasang). Yang diuji: penolakan rapi dan data
> asli tidak berubah satu baris pun.


**4. Deploy ke Cloudflare**

```bash
npm run build:worker
$env:NODE_OPTIONS="--dns-result-order=ipv4first"   # perlu bila token OAuth gagal refresh (IPv6)
npx wrangler deploy
```

> Di mesin ini, Node/undici kadang memilih alamat IPv6 yang tidak bisa dijangkau
> (`UND_ERR_CONNECT_TIMEOUT` ke `dash.cloudflare.com/oauth2/token`). Mengutamakan IPv4
> membuat `wrangler` berhasil refresh token tanpa perlu login ulang.

Uji bundel yang benar-benar tayang:

```bash
$env:NODE_OPTIONS="--dns-result-order=ipv4first"
node scratch/verify-live-bundle.mjs
```

## Hasil terakhir

```
test-spreadsheet.mts        80 lulus    0 gagal
test-template-csv.mts       83 lulus    0 gagal
test-sync-api.mjs           70 lulus    0 gagal
test-browser.mjs            31 lulus    0 gagal
test-admin-ui.mjs           22 lulus    0 gagal
test-panel-layout.mjs       12 lulus    0 gagal
test-template-download.mjs  10 lulus    0 gagal
verify-live-bundle.mjs       9 lulus    0 gagal   (terhadap produksi)
-------------------------------------------------
total                      317 lulus    0 gagal
```

Uji terhadap database produksi asli (jalankan manual, hanya baca):

```
verify-production.mjs       22 lulus    0 gagal
test-production-pages.mjs   12 lulus    0 gagal
```

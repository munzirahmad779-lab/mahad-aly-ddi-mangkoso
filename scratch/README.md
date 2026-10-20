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
| `test-admin-ui.mjs` | 20 uji UI panel admin: buka menu, unduh template, unggah CSV dari HP, pratinjau, simpan, rollback. |
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

> Percobaan "Simpan" pada langkah ini memang **ditolak 503** karena
> `SUPABASE_SERVICE_ROLE_KEY` belum diset — itulah yang diuji: penolakan harus
> rapi dan tidak mengubah data.

## Hasil terakhir

```
test-spreadsheet.mts        80 lulus    0 gagal
test-sync-api.mjs           70 lulus    0 gagal
test-browser.mjs            31 lulus    0 gagal
test-admin-ui.mjs           20 lulus    0 gagal
verify-production.mjs       22 lulus    0 gagal
test-production-pages.mjs   12 lulus    0 gagal
```

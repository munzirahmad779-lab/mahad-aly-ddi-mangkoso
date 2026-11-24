# Arsip Berbahaya: Skrip Sekali Jalan

Folder ini berisi skrip-skrip lama yang pernah dipakai satu kali pada masa pembangunan awal situs Ma'had Aly DDI Mangkoso. Berkas-berkas ini **sekali jalan dan BERBAHAYA bila dijalankan ulang**.

## Kenapa berbahaya

- Isi muatannya adalah data templat dan snapshot lama yang sudah basi. Menjalankannya hari ini akan **mengembalikan data fiktif dan basi ke produksi**: nomor kontak contoh yang sudah dibersihkan, foto stok asing sebagai foto masyayikh, angka kunjungan karangan yang menimpa angka asli, dan tautan berkas karangan.
- `inject_dema.js` secara khusus akan **membatalkan perbaikan Dema 23 November 2026**, karena data yang disuntikkannya masih memakai alamat foto lama dan penanda sorotan lama, padahal perbaikan itu sudah terverifikasi live.
- `migrate-full.mjs` menghapus dan mengisi ulang tabel-tabel konten tanpa penjaga lingkungan, jadi salah target berarti kerusakan pada basis data produksi.
- `update_mock_settings.js`, `update_mock_data.js`, dan `optimize_article_context.js` menulis ulang berkas sumber dari snapshot basi tanpa cadangan.

## Aturan pakai

- **Jangan jalankan berkas apa pun di folder ini** tanpa perintah eksplisit user.
- Bila suatu saat memang harus dijalankan, periksa ulang seluruh isi muatannya terhadap data live terlebih dahulu, buat cadangan, dan uji pada salinan basis data, bukan pada produksi.
- Berkas disimpan di sini hanya sebagai catatan sejarah pekerjaan, bukan sebagai alat kerja.

## Daftar berkas

- `migrate-full.mjs` (semula di `supabase/`): migrasi penuh destruktif berisi data templat.
- `seed.mjs` (semula di `supabase/`): pengisi awal dengan muatan templat yang sama.
- `inject_dema.js`: penyuntik data DeMa dari snapshot JSON lama (berkas datanya sudah dihapus dari repo karena berisi data pribadi).
- `update_mock_settings.js`: penulis ulang mock-data dari snapshot pengaturan basi (snapshotnya sudah dihapus dari repo).
- `update_mock_data.js`: pemotong dan penulis ulang mock-data.ts tanpa cadangan.
- `optimize_article_context.js`: penulis ulang ArticleContext.tsx dari snapshot lama tanpa cadangan.

Diarsipkan 25 November 2026 sebagai tindak lanjut Laporan Audit Kode Ulang (Paket C dan D).

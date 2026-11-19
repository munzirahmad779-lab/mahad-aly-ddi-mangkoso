# README — Deploy Versi Uji Cabang Jurnal ke Vercel (satu kali, oleh user)

Dokumen ini menyiapkan repo klon uji ini agar bisa diimpor ke Vercel oleh
user sendiri dalam satu kali langkah, karena konektor Vercel Muse
tertahan izin scope tim (403 "yusuffff1") dan alat pemulihannya
(authorize_team_access) tidak tersedia di konektor. Login Vercel user
sendiri tidak terkena batas itu.

## Isi klon ini

- Klon repo web utama Ma'had Aly DDI Mangkoso pada commit dasar `3a7830f`
  (GitHub main terakhir per 19 Nov 2026), cabang lokal `uji/cabang-jurnal`,
  commit hasil `b662299`.
- Tambahan cabang jurnal di `/jurnal` (beranda, terbitan, artikel
  bermetadata Google Scholar + Dublin Core + JSON-LD, OAI-PMH, kirim,
  lacak, panel) dengan lapisan data uji lokal. Situs utama tidak diubah
  selain satu tautan "Jurnal" di navigasi.
- JANGAN hubungkan klon ini ke repo GitHub kampus dan JANGAN pasang
  domain mahadaly-ddimangkoso.ac.id di proyek Vercel uji ini.

## Pilihan A — Impor lewat GitHub (disarankan)

1. Buat repo GitHub BARU yang terpisah (mis. `uji-jurnal-mahadaly`) di
   akun GitHub user. Jangan pakai repo kampus.
2. Dari folder klon ini, arahkan remote ke repo baru itu dan push cabang
   `uji/cabang-jurnal` (atau jadikan cabang itu cabang utama repo baru).
3. Buka Vercel (akun user) → Add New → Project → Import repo baru itu.
4. Framework akan terbaca otomatis sebagai Next.js. Build Command
   `npm run build`, Install Command bawaan. Klik Deploy.
5. Hasilnya alamat `https://uji-jurnal-mahadaly.vercel.app` (atau nama
   yang tersedia). Buka `/jurnal` untuk mulai menguji.
6. Opsional sesudah deploy pertama: di Settings → Environment Variables
   tambahkan `NEXT_PUBLIC_SITE_URL` = alamat vercel.app proyek ini, lalu
   redeploy, supaya URL kanonis metadata menunjuk alamat uji (untuk uji
   tampilan langkah ini boleh dilewati).

## Pilihan B — Deploy dari komputer user dengan Vercel CLI

1. Pasang Vercel CLI (`npm i -g vercel`), jalankan `vercel login` memakai
   akun Vercel user.
2. Dari folder klon ini jalankan `vercel` (buat proyek baru bernama
   `uji-jurnal-mahadaly` saat ditanya), lalu `vercel --prod`.

## Catatan perilaku versi uji di Vercel

- Lapisan data naskah uji adalah berkas JSON lokal dengan cadangan
  memori proses. Di serverless Vercel data naskah uji bisa hilang saat
  instans fungsi berganti atau saat redeploy. Itu perilaku yang diterima
  untuk versi uji; alur kirim → lacak → panel tetap bisa didemonstrasikan
  selama instans yang sama masih hidup. Bila ingin data uji yang menetap
  selama demo, jalankan lokal: `npm run build` lalu `npm run start`.
- Panel redaksi versi uji memang tanpa login (ditandai jelas di
  halamannya). Jangan beri alamat uji ini akses publik luas sebelum
  diputuskan, dan jangan jadikan alamat uji sebagai alamat resmi.
- Berkas `.env.local` di klon ini berisi nilai untuk uji lokal
  (NEXT_PUBLIC_SITE_URL=http://localhost:3100). Jangan ikut sertakan
  berkas itu sebagai env produksi di Vercel; pakai langkah 6 Pilihan A.

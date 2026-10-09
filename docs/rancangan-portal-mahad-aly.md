# 🏛️ BLUEPRINT & RANCANGAN ARSITEKTUR PORTAL MA'HAD ALY DDI MANGKOSO
### Sintesis Karakteristik Media Modern NU Online & Reputasi Akademik Ma'had Aly Tebuireng

**Versi:** 2.0  
**Tanggal:** 9 Oktober 2026  
**Lembaga:** Ma'had Aly DDI Mangkoso (Takhassus Fiqh wa Usuluhu)  
**Status Dokumen:** Usulan Rancangan & Siap Dieksekusi  

---

## 📌 DAFTAR ISI
1. [Laporan Analisis Masalah Header & Solusi Teknis](#1-laporan-analisis-masalah-header--solusi-teknis)
2. [Bedah Fitur 2 Web Referensi: NU Online & Tebuireng](#2-bedah-fitur-2-web-referensi)
3. [Konsep Desain Header Baru (3-Tier Header Architecture)](#3-konsep-desain-header-baru)
4. [Konsep Desain Homepage Awal (Belajar dari Tebuireng)](#4-konsep-desain-homepage-awal)
5. [Struktur Navigasi & Hirarki Menu Dinamis](#5-struktur-navigasi--hirarki-menu-dinamis)
6. [Roadmap Tahapan Eksekusi](#6-roadmap-tahapan-eksekusi)

---

## 1. Laporan Analisis Masalah Header & Solusi Teknis

### A. Akar Penyebab Gangguan Saat Ini
Berdasarkan audit mendalam pada kode sistem (`src/context/ArticleContext.tsx` dan `src/app/admin/page.tsx`), ditemukan penyebab pasti mengapa pengaturan header di admin tidak tersimpan ke database:

1. **Kendala Database Supabase (`site_content`):**
   * Saat admin menekan tombol *"Simpan Perubahan Header"*, sistem menjalankan perintah `upsert` ke tabel `site_content`.
   * **Masalah:** Tabel `site_content` memiliki aturan ketat (*NOT NULL constraint*) pada kolom `group_name` dan restriksi *Row Level Security (RLS)*. Karena kolom `group_name` tidak disertakan dalam panggilan client, database menolak penyimpanan dengan kode galat `42501` dan `23502`.
   * **Dampaknya:** Data header hanya sempat tersimpan sesaat di memori browser lokal, dan saat halaman disegarkan (*refresh*), data kembali ke pengaturan awal.
2. **Kalkulasi Menu "Lainnya" (*Overflow Logic*):**
   * Di sistem sebelumnya, kuota menu utama dibatasi maksimal 6–7 item.
   * Karena di daftar menu bawaan terdapat 8 tautan (termasuk *Infaq & Donasi* dan *Kirim Tulisan*), dua menu terbawah secara otomatis terlempar ke tombol *"Lainnya +2"*.
   * Karena perubahan penonaktifan *"Kirim Tulisan"* gagal tersimpan di database, angka `+2` tetap bertahan dan menu *Donasi* tidak kunjung naik menjadi tombol mandiri.

### B. Solusi Pasti:
1. Membuat API Endpoint dedicated `/api/admin/content` yang menggunakan `SUPABASE_SERVICE_ROLE_KEY` dengan parameter `group_name: "layout"` dan `label: "Header & Navbar Settings"` sehingga seluruh perubahan menu di panel admin **tersimpan permanen di cloud database**.
2. Memperbaiki logika filter navigasi: Setiap menu yang statusnya `isActive === false` langsung dikeluarkan dari kalkulasi sebelum pembagian kuota primary/overflow, sehingga menu *Infaq & Donasi* langsung tampil mandiri di deretan utama.

---

## 2. Bedah Fitur 2 Web Referensi

### Tabel Komparasi Fitur:
| Komponen | NU Online | Ma'had Aly Tebuireng | Rancangan Ma'had Aly DDI Mangkoso |
| :--- | :--- | :--- | :--- |
| **Header Tingkat 1** | Logo + Dewan Pers & Search | Hotline Telp & Email | **Top Utility Bar:** Kalender Hijriah & Masehi, Hotline Sekretariat, Mode Baca |
| **Header Tingkat 2** | Bilah Hijau Kategori Berita | Menu Horizontal Kampus | **Main Emerald Bar:** Logo Emas-Hijau, Navigasi Utama Fiqh/Turats, Tombol PMB/Kirim Tulisan |
| **Header Tingkat 3** | Sub-Topik Wilayah Daerah | - | **Sub-Ticker Bar:** Bahtsul Masail Terhangat & Kategori Populer |
| **Hero Section** | Slider Berita Utama | "KADERISASI ULAMA Hadis" | **Hero Salafiyah-Modern:** "Pendidikan Tinggi Kader Ulama Fiqh Mu'asarah" + Metrik Sanad |
| **Spesialisasi Keilmuan** | Media Berita Keislaman Umum | Takhassus Hadits wa Ulumuhu | **Takhassus Fiqh wa Usuluhu (Fiqh Mu'asarah)** |
| **Fitur Interaktif** | Kolom Opini, Hikmah | Repositori & Info PMB | **Submission Naskah Digital, Pelacakan Skripsi, Portal Bahtsul Masail, Donasi Online** |

---

## 3. Konsep Desain Header Baru (3-Tier Header Architecture)

Mengadopsi keanggunan tata letak NU Online yang dipadukan dengan wibawa Ma'had Aly DDI Mangkoso:

### 📐 Visual Wireframe Header:
```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 📅 Jum'at, 27 Rabi'ul Awwal 1448 H / 9 Okt 2026   📞 (0421) 510xxx  ✉️ redaksi@...    │  <- TIER 1: Top Bar
├────────────────────────────────────────────────────────────────────────────────────────┤
│ [LOGO DDI] Ma'had Aly      [Beranda] [Profil▾] [Akademik▾] [Kajian Fiqh▾] [Skripsi]    │
│            DDI MANGKOSO    [Warta]   [Infaq/Donasi]   [Lainnya▾]    [ ✍️ Kirim Tulisan ]│  <- TIER 2: Main Emerald Bar
├────────────────────────────────────────────────────────────────────────────────────────┤
│ ⚡ TOPIK HANGAT: Fatwa Fiqh AI  • Hukum Wakaf Uang  • Jadwal Halaqah Santri  [🔍 Cari] │  <- TIER 3: Ticker Bar
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Rincian Tiap Baris:

#### 1. Baris Teratas (Top Utility Bar):
* **Latar Belakang:** Hijau Gelap Khidmat (`bg-emerald-950/90`) dengan teks halus emas/putih.
* **Sisi Kiri:** 
  * Penanda Waktu Ganda: **Kalender Hijriah** (misal: *27 Rabi'ul Awwal 1448 H*) bersanding dengan **Kalender Masehi** (seperti pada screenshot NU Online).
  * Jam Sholat / Tanda Daerah Barru, Sulawesi Selatan.
* **Sisi Kanan:**
  * Alamat Email Resmi: `redaksi@mahadaly-ddimangkoso.my.id`
  * Kontak WhatsApp Sekretariat Ma'had Aly.
  * Tautan Cepat: Jurnal Ilmiah / E-Library.

#### 2. Baris Utama (Main Emerald Navbar):
* **Latar Belakang:** Warna Hijau Emerald Ma'had Aly (`bg-[#064e3b]`) berkombinasi lis emas.
* **Sisi Kiri (Brand Identity):**
  * Logo Resmi Ma'had Aly DDI Mangkoso (bebas dari logo segitiga Vercel).
  * Tipografi berbobot: **"Ma'had Aly"** (Font Serif Elegan) dan Subjudul **"DDI Mangkoso • Fiqh Mu'asarah"**.
* **Bagian Tengah (Menu Navigasi Responsif):**
  * Penataan simetris dan lega.
  * Menu-menu utama: `Beranda`, `Profil ▾`, `Akademik ▾`, `Kajian Fiqh ▾`, `Skripsi`, `Warta`, `Infaq & Donasi`.
  * Menu `Lainnya ▾` hanya akan muncul jika jumlah menu benar-benar melebihi kapasitas layar, sehingga *Infaq & Donasi* tampil gagah sebagai tombol mandiri.
* **Sisi Kanan (High-Contrast Action Button):**
  * Tombol Aksi Kuning Emas DDI (`bg-[#ffc221]` / `bg-mahad-gold` teks hijau tua):
  * Dinamis: Bisa disetel sebagai **"✍️ Kirim Tulisan"** atau **"🎓 PMB Online"** langsung dari panel admin.

#### 3. Baris Ketiga (Sub-Ticker & Live Search):
* **Latar Belakang:** Putih gading / abu-abu terang halus (`bg-slate-100/90 border-b`).
* **Sisi Kiri:** Ticker berita atau topik kajian terhangat (misal: *"Bahtsul Masail: Tinjauan Fiqh Mu'asarah Transaksi Digital"*).
* **Sisi Kanan:** Kolom pencarian instan (*Instant Live Search*) untuk mencari artikel, skripsi, atau fatwa secara cepat.

---

## 4. Konsep Desain Homepage Awal (Belajar dari Tebuireng)

Mengadaptasi kekuatan struktur depan `tebuireng.ac.id` yang sangat kuat dalam membangun citra perguruan tinggi pesantren:

### A. Hero Section (Wajah Utama Lembaga):
1. **Lafaz Bismillah Kaligrafi Khas Pesantren.**
2. **Tajuk Utama:** 
   > *"KADERISASI ULAMA FIQH MU'ASARAH"*  
   > **Mencetak Fuqaha Berakar pada Turats Klasik, Menjawab Problematika Umat Kontemporer.**
3. **Deskripsi Filosofis:** Menegaskan sanad keilmuan bersambung kepada Gurutta K.H. Abd. Rahman Ambo Dalle dan ulama-ulama salaf ash-shalih.
4. **Dua Tombol Aksi Utama:**
   * Tombol Primer: **"Penerimaan Mahasantri Baru (PMB)"** (Akses pendaftaran).
   * Tombol Sekunder: **"Jelajahi Mimbar Turats & Fiqh"** (Masuk ke kajian ilmiah).
5. **Panel Metrik Keunggulan (Statistik Prestisius):**
   * *M.1 (Marhalah Ula)* — Setara Strata Satu (S.Ag/S.Pd/Sarjana Agama).
   * *Takhassus Fiqh wa Usuluhu* — Konsentrasi Hukum Islam & Metodologi Fatwa.
   * *Sanad Keilmuan Muktabar* — Rantai Sanad Kitab Kuning Syafi'iyyah.
   * *Beasiswa Penuh Kader Ulama* — Pembinaan intensif asrama ma'had.

### B. 4 Pilar Pendidikan Khas Ma'had Aly DDI Mangkoso (Model Tebuireng):
1. **Khazanah Kitab Kuning (Turats):** Penguasaan kitab induk mazhab Syafi'i (*Fathul Wahhab, Tuhfah, Mahalli, Jam'ul Jawami'*).
2. **Bahasa Arab Fush-ha & Retorika:** Kemampuan aktif membaca literatur gundul dan menulis karya ilmiah berbahasa Arab.
3. **Bahtsul Masail & Ifta':** Halaqah musyawarah hukum Islam merespons isu-isu kekinian (ekonomi syariah, bioetika medis, sains).
4. **Riset & Karya Tulis Ilmiah:** Penulisan skripsi, jurnal ilmiah, dan publikasi digital santri.

### C. Etalase Konten Dinamis:
1. **Kajian Fiqh Pilihan (Model NU Online):** Tab kategori interaktif (Fiqh Ibadah, Muamalah Kontemporer, Munakahat, Fatwa Aktual).
2. **Repositori Skripsi & Karya Tulis:** Mahasantri dan alumni dapat menampilkan judul dan abstrak penelitian mereka.
3. **Infaq & Dukungan Kaderisasi:** Wadah bagi alumni dan kaum muslimin untuk berpartisipasi dalam program beasiswa santri dan sarana ma'had.

---

## 5. Struktur Navigasi & Hirarki Menu Dinamis

```
├── Beranda (/)
├── Profil (/profil)
│   ├── Sejarah Ma'had Aly & Biografi Gurutta Ambo Dalle
│   ├── Visi, Misi & Tujuan Pendidikan
│   ├── Dewan Masyaikh & Dosen Pengasuh
│   ├── Struktur Organisasi Pengelola
│   └── Sertifikat Akreditasi Kemenag
├── Akademik (/akademik)
│   ├── Kurikulum & Daftar Kitab Turats Wajib
│   ├── Kalender Akademik & Jadwal Halaqah
│   └── Pedoman Penulisan Skripsi & Riset
├── Mimbar Fiqh (/artikel)
│   ├── Fiqh Ibadah & Muamalah
│   ├── Usul Fiqh & Qawa'id Fiqhiyyah
│   └── Opini & Refleksi Keislaman
├── Bahtsul Masail (/bahtsul-masail)
├── Repositori Skripsi (/skripsi)
├── Warta & Informasi (/berita)
│   ├── Pengumuman Resmi
│   └── Kegiatan Mahasantri
├── Infaq & Donasi (/donasi)
└── Layanan Digital (Aksi Kanan / Overflow)
    ├── PMB Online (/pmb)
    └── Kirim Naskah Tulisan (/kirim-tulisan)
```

---

## 6. Roadmap Tahapan Eksekusi

| Tahap | Fokus Kegiatan | Output Utama |
| :---: | :--- | :--- |
| **Fase 1** | **Perbaikan Backend & Penyimpanan Admin** | Endpoint `/api/admin/content` selesai; pengaturan navbar di admin tersimpan permanen di Supabase tanpa galat RLS. |
| **Fase 2** | **Implementasi 3-Tier Header Modern** | Header bertingkat 3 (Top Utility Bar Kalender Hijriah, Emerald Navbar Simetris, Sub-Ticker Live Search) aktif di semua halaman. |
| **Fase 3** | **Homepage Refresh (Nuansa Tebuireng)** | Hero Section Kaderisasi Ulama Fiqh, 4 Pilar Ma'had, PMB Banner, dan metrik sanad tampil elegan di beranda. |
| **Fase 4** | **Pengujian Responsif & Verifikasi Menyeluruh** | Uji coba di laptop, tablet, dan smartphone; memastikan tidak ada tombol macet dan navigasi mengalir mulus. |

---

*Dokumen ini dirancang khusus oleh Antigravity untuk Ma'had Aly DDI Mangkoso.*

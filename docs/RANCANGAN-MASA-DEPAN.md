# RANCANGAN MASA DEPAN — Ma'had Aly DDI Mangkoso

> Dokumen serah-terima untuk siapa pun (manusia atau AI) yang melanjutkan
> pengembangan web ini. Baca sampai selesai sebelum mengubah apa pun.
> Terakhir diperbarui: 2026-10-25.

---

## 0. SNAPSHOT KONDISI SAAT INI (WAJIB DIBACA)

- **Stack**: Next.js 16.4.3 (App Router) + TypeScript + Tailwind + Supabase
  (Postgres/Auth/Storage) + Cloudflare R2 + Resend (email). Deploy: Cloudflare
  Workers via OpenNext (`@opennextjs/cloudflare` 1.20.13, `wrangler deploy`).
- **Semua tulisan database WAJIB lewat API server** (`/api/admin/db`,
  `/api/admin/content`, `/api/upload`) — JANGAN PERNAH menulis DB langsung dari
  browser dengan anon key. Itu penyebab bug "edit tidak tersimpan" dan celah
  keamanan yang sudah diperbaiki (lihat git log commit `3a81b39`).
- **RLS database sudah dikunci** (`supabase/rls-lockdown.sql`): anon hanya-baca
  konten publik. Patch 2 (`supabase/rls-patch-2.sql`) mengunci users &
  submissions hanya untuk admin aktif (`is_admin()`).
- **Login** melewati proxy server `/api/auth/login` (rate limit per-IP &
  per-email). Jangan kembalikan ke `signInWithPassword` langsung dari browser.
- **Seed SSR** di `src/app/layout.tsx` (`fetchInitialContent`): konten identitas
  diambil server-side (cache 30 detik + stale-while-error) agar tidak ada
  kedipan "teks default → teks admin". Jika menambah konten baru dari
  `site_content`, masukkan key-nya ke daftar `KEYS` di sana DAN seed state-nya
  di `ArticleProvider` (`src/context/ArticleContext.tsx`).
- **Prosedur deploy yang aman** (pelajari dari insiden 2026-10-25):
  1. `npm run build:worker`
  2. `npx wrangler versions upload` → dapat URL preview
  3. Uji 5–7 titik di URL preview (beranda, /pmb, /admin/login, login API,
     optimizer logo, guard `/api/admin/db`)
  4. `npx wrangler versions deploy <version-id>@100` (eksplisit by ID —
     jangan interaktif)
  5. Kalau produksi rusak: `npx wrangler rollback <version-id-stabil>`
     (simpan selalu ID versi stabil terakhir)
- **Jangan jalankan `npm run build` saat `next dev` masih hidup** — merusak
  artefak dev. Matikan dev dulu.
- **Matcher middleware dibatasi** (hanya /admin + honeypot). JANGAN diperluas
  dengan regex lookahead luas — pernah mematikan optimizer gambar
  (`/_next/image` → `received null`, logo hilang). Security headers global
  ditangani `next.config.ts` `headers()`.

---

## 1. BOT TELEGRAM ADMIN (RANCANGAN — BELUM DIBANGUN)

### 1.1 Filosofi
**"Bot = formulir terkunci, Server = pemegang kebenaran."** Bot hanyalah
antarmuka pengisian; kebenaran data tetap di Supabase lewat API server yang
sama dengan panel web (RLS + rate limit + activity_logs otomatis berlaku).

### 1.2 Pembagian tiga tingkat
| Tingkat | Isi | Jalur |
|---|---|---|
| Tier 1 — Bot (rutinitas harian) | Masyayikh + foto, warta/pengumuman singkat, kutipan harian, ubah kontak/teks tertentu, update angka donasi | Telegram |
| Tier 2 — Panel (dokumen & struktur) | Artikel panjang, skripsi, kurikulum, urutan section, manajemen user | Panel web |
| Tier 3 — Terkunci (sensitif) | Hapus permanen, rekening bank donasi, kredensial | Panel + PIN/dual-approve |

Artikel panjang (dengan Arab RTL, catatan kaki) TIDAK untuk bot — itu konten
dokumen. Jangan paksa masuk template chat.

### 1.3 Arsitektur
```
Admin (HP) ──chat──▶ Telegram ──webhook──▶ /api/telegram/webhook (aplikasi ini)
                                            ├─ verifikasi header
                                            │   X-Telegram-Bot-Api-Secret-Token
                                            ├─ whitelist user ID Telegram (bukan username)
                                            ├─ wizard membaca SCHEMA per konten
                                            │   (schema disimpan di SERVER, bukan di bot;
                                            │    konten baru = tambah schema, bukan ubah kode)
                                            ├─ foto → normalisasi server (crop persegi,
                                            │   WebP, buang EXIF) → R2 via /api/upload
                                            ├─ pratinjau + tombol konfirmasi
                                            └─ tulis via /api/admin/db + activity_logs
```
- Hosting: webhook sebagai route di aplikasi ini (Cloudflare Workers, biaya nol).
- Tidak perlu server tambahan.

### 1.4 Alur wizard (mencegah salah isi)
1. Perintah (mis. `/masyayikh`) → bot tanya **satu field per pesan** (aman dari
   batas 4096 karakter).
2. Validasi instan per jawaban; perintah `kembali`, `batal`, `lewati`.
3. Foto: deteksi kompresi Telegram — jika dikirim sebagai foto (terkompresi),
   ingatkan dan minta "Kirim sebagai File". Server menormalisasi otomatis.
4. **Pratinjau final** bergaya situs + tautan pratinjau (belum tayang) →
   tombol ✅ Simpan / ✏️ Edit / ❌ Batal.
5. Simpan → tayang realtime → konfirmasi + tautan konten live.

### 1.5 Keamanan (syarat mutlak)
- Token bot hanya di server secret. Bocor = reset via BotFather.
- Whitelist **user ID Telegram** (angka stabil; username bisa berubah).
- Hanya `chat.type === "private"` dari whitelist; abaikan grup & `edited_message`
  (draft tidak boleh berubah di belakang punggung setelah pratinjau).
- `callback_data` TIDAK dipercaya: draft disimpan server-side per user (TTL 15
  menit), tombol hanya merujuk ID draft. Validasi ulang total saat simpan.
- Cek `updated_at` sebelum tulis (anti-tabrakan admin panel vs bot).
- Field teks = plain text murni, di-escape saat render (font terkunci + XSS
  terkunci sekaligus).
- PIN kedua (TTL beberapa menit) untuk aksi berbahaya: hapus, donasi/rekening,
  kontak resmi.
- Rate limit per user. Jangan pernah kirim kredensial/rahasia lewat chat.
- Fallback: panel web TETAP utuh — bot adalah kanal tambahan, bukan pengganti.
  Telegram down ≠ situs terganggu.

### 1.6 Batasan yang diakui jujur
- Template mencegah salah **format**, tidak mencegah salah **isi** (salah ketik
  nama, angka terbalik) → dijawab dengan pratinjau + konfirmasi, bukan dihilangkan.
- Konten dokumen panjang tetap di panel.

### 1.7 Roadmap implementasi
- Fase 1 (±1 hari): masyayikh + foto, wizard + pratinjau + keamanan penuh.
- Fase 2 (±½ hari): warta/pengumuman singkat, ubah teks kontak.
- Fase 3 (opsional): update angka donasi dengan dual-approve.
- Prasyarat: admin membuat bot via @BotFather, dapat token, set webhook secret.

---

## 2. NOTIFIKASI WHATSAPP (RANCANGAN — BELUM DIBANGUN)

### 2.1 Tujuan alur audit
```
Naskah masuk (kirim tulisan) ─┐
Warta diterbitkan ────────────┼──▶ notifikasi WA ke Redaksi (munzirahmad)
Publikasi fiqh/opini ─────────┘         │
                                        ▼
                          Redaksi AUDIT di panel (baca naskah,
                          cek mutu, verifikasi penulis)
                                        │
                                        ▼
                          Terbitkan → tautan konten live dikirim balik
                          ke WA → diteruskan manual ke pengumuman
                          komunitas / channel
```

### 2.2 Opsi penyedia WhatsApp (kondisi akhir 2025/2026)
| Opsi | Plus | Minus | Cocok untuk |
|---|---|---|---|
| **WhatsApp Cloud API resmi (Meta)** | Legitimasi resmi lembaga, stabil, ada free tier pesan service | Perlu Meta Business verification; pesan bisnis ke luar 24 jam butuh template disetujui + biaya per pesan (kecil untuk 1 penerima) | Jangka panjang / identitas resmi |
| **Gateway Indonesia (Fonnte, Wablas, dll.)** | Paling cepat jadi (scan QR), murah, API sederhana | **Melanggar ToS WhatsApp → risiko nomor diblokir** | Notifikasi internal, WAJIB pakai nomor cadangan khusus (BUKAN nomor resmi lembaga) |
| **CallMeBot** | Gratis, 1 endpoint HTTP untuk notif ke nomor sendiri | Tidak resmi, bisa berhenti kapan saja | Prototipe / notif darurat |
| **Bot Telegram (notif saja)** | Gratis, resmi, tanpa template approval, 5 menit jadi | Bukan WhatsApp | Alternatif paling bersih untuk notifikasi |

### 2.3 Rekomendasi
1. **Mulai dari notifikasi → diri sendiri** (bukan broadcast): titik pemicu yang
   sudah ada di kode — `POST /api/submission/submit` (naskah baru),
   penerbitan artikel/warta (sudah lewat `addLog`; tambahkan hook notifikasi).
   Pesan WA berisi: kode tracking, nama, judul, kategori, tautan panel review.
2. **Abstraksi provider** (`src/lib/notify/`): satu antarmuka `kirimPesan(text)`
   dengan implementasi wa-gateway / wa-cloudapi / telegram / email (Resend
   sudah ada). Pemicu memanggil abstraksi — ganti provider tanpa sentuh logic.
3. **Nomor**: gunakan nomor cadangan khusus untuk gateway tidak resmi; nomor
   resmi lembaga (+62 81354229189) jangan dipertaruhkan pada ToS.
4. **Penyebaran ke komunitas/channel**: tetap manual oleh redaksi setelah audit
   (sesuai alur di 2.1) — API WhatsApp resmi untuk channel/grup masih terbatas.
5. Jika ingin 100% resmi tanpa biaya: gunakan **bot Telegram untuk notifikasi**
   (paling bersih), WA dipakai untuk distribusi manual oleh redaksi.

---

## 3. TUGAS TERTUNDA ADMIN (BUKAN KODE)

1. [ ] Jalankan `supabase/rls-patch-2.sql` di SQL Editor (kunci users &
       submissions untuk admin aktif saja).
2. [ ] Supabase Dashboard → Authentication → matikan "Allow new users to
       sign up" (akun admin dibuat lewat invite panel).
3. [ ] Uji login asli di produksi (satunya jalur yang belum diuji kredensial
       nyata) — https://mahadaly-ddimangkoso.my.id/admin/login
4. [ ] (Opsional) Cloudflare Dashboard → Security → WAF rate limiting rule
       untuk `/api/*` (rate limit level edge melengkapi level aplikasi).
5. [ ] (Opsional) Aktifkan backup terjadwal Supabase / rutin export JSON dari
       panel (Pengaturan Web → Backup).
6. [ ] (Opsional) Hapus 2 artikel uji di produksi: "Rekonstruksi" (penulis
       muhamma) dan artikel penulis "Uji coba" — lewat panel Publikasi.

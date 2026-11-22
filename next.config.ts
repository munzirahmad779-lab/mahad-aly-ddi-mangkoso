import type { NextConfig } from "next";

// 'unsafe-eval' hanya untuk dev (React Refresh/Turbopack). Produksi tanpa
// eval: injeksi skrip yang butuh eval otomatis digagalkan browser.
const isDev = process.env.NODE_ENV === "development";
const scriptSrc = [
  "'self'",
  "'unsafe-inline'",
  ...(isDev ? ["'unsafe-eval'"] : []),
  "https://www.googletagmanager.com",
  "https://www.google-analytics.com",
  // Widget Turnstile jurnal (Tahap Keamanan) dimuat dari Cloudflare.
  "https://challenges.cloudflare.com"
];

// Security headers berlaku untuk SEMUA route (sebelumnya hanya /admin via
// middleware matcher — halaman publik tidak terlindungi).
const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload"
  },
  {
    // CSP membatasi sumber skrip/koneksi yang sah; 'unsafe-inline' masih
    // diperlukan Next.js & Google Analytics, tapi host luar tak dikenal tetap diblok.
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      `script-src ${scriptSrc.join(" ")}`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "media-src 'self' https:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://*.googleusercontent.com https://drive.google.com https://*.r2.dev https://*.r2.cloudflarestorage.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-src 'self' https://challenges.cloudflare.com",
      "frame-ancestors 'none'"
    ].join("; ")
  }
];

// Header khusus jurnal (Tahap Keamanan): permukaan berlogin dan semua
// route API jurnal tidak boleh tersimpan di cache bersama dan tidak
// diindeks mesin pencari. Halaman baca publik jurnal (/jurnal, artikel,
// terbitan, lacak, oai) sengaja TIDAK diberi header ini supaya tetap
// bisa dirayapi dan di-cache sebagaimana syarat pengindeks.
const JURNAL_PRIVATE_HEADERS = [
  { key: "Cache-Control", value: "private, no-store" },
  { key: "X-Robots-Tag", value: "noindex, nofollow" }
];

const nextConfig: NextConfig = {
  // KHUSUS KLON UJI di VM lambat ini: generasi halaman statis membaca data
  // lewat proxy egress yang lambat sehingga batas bawaan 60 detik terlampaui
  // pada halaman web utama (bukan halaman jurnal). Nilai ini penyesuaian
  // lingkungan uji semata; konfigurasi produksi kampus tidak diubah.
  staticPageGenerationTimeout: 300,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.r2.dev",
      },
      {
        protocol: "https",
        hostname: "**.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "drive.google.com",
      },
    ],
  },
  // Hasil Bahtsul Masa'il Jilid II pindah menjadi cabang Kajian & Diskusi
  // (15 Nov 2026). Alamat lama dialihkan permanen agar QR yang sudah
  // terlanjur dicetak dan disebar tetap sampai ke laman yang benar.
  async redirects() {
    const lama = "/bahtsul-masail/jilid-ii";
    const baru = "/kategori/bahtsul-masail-jilid-ii";
    const slug = [
      "masalah-1-nisab-zakat-mal",
      "masalah-2-jual-beli-seafood",
      "masalah-3-ittihad-al-baldah",
      "masalah-4-konten-digital-aib"
    ];
    return [
      { source: lama, destination: baru, permanent: true },
      ...slug.map((s) => ({
        source: `${lama}/${s}`,
        destination: `${baru}/${s}`,
        permanent: true
      }))
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS
      },
      {
        source: "/api/jurnal/:path*",
        headers: JURNAL_PRIVATE_HEADERS
      },
      {
        source: "/jurnal/panel",
        headers: JURNAL_PRIVATE_HEADERS
      },
      {
        source: "/jurnal/masuk",
        headers: JURNAL_PRIVATE_HEADERS
      },
      {
        source: "/jurnal/daftar",
        headers: JURNAL_PRIVATE_HEADERS
      },
      {
        source: "/jurnal/kirim",
        headers: JURNAL_PRIVATE_HEADERS
      },
      {
        source: "/jurnal/naskah-saya",
        headers: JURNAL_PRIVATE_HEADERS
      },
      {
        // Galley HTML artikel (Tahap 4) adalah berkas buatan petugas
        // layout yang disajikan dari asal situs. CSP global di atas
        // akan menimpa header route handler, jadi sandbox ditegakkan
        // di lapisan config ini: dokumen galley dirender dalam asal
        // buram tanpa skrip. Entri ini harus sesudah entri global.
        source: "/jurnal/artikel/:slug/html",
        headers: [
          { key: "Content-Security-Policy", value: "sandbox" },
          { key: "X-Content-Type-Options", value: "nosniff" }
        ]
      }
    ];
  }
};

export default nextConfig;

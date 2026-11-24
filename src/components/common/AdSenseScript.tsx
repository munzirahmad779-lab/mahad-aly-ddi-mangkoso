"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

// Pemuat Google AdSense (ca-pub-8103100253301122) khusus halaman publik.
// Skrip iklan TIDAK dimuat di panel admin, cabang jurnal, dan rute API:
// halaman-halaman itu tidak menampilkan iklan, jadi skrip pihak ketiga
// tidak perlu ikut diunduh di sana. Di halaman publik perilakunya sama
// seperti pemasangan semula di <head> layout (8 Nov 2026).
export default function AdSenseScript() {
  const pathname = usePathname() || "";

  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/jurnal") ||
    pathname.startsWith("/api")
  ) {
    return null;
  }

  return (
    <Script
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8103100253301122"
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}

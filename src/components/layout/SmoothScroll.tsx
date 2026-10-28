"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

// Scroll halus (Lenis) khusus halaman publik. Panel admin dikecualikan agar
// pengeditan tetap memakai scroll bawaan, dan pengguna dengan preferensi
// gerak minim (prefers-reduced-motion) tidak dipasang efek ini.
export default function SmoothScroll() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Lenis hanya untuk layar besar (mouse/trackpad). Di HP scroll sentuh
    // dibiarkan murni bawaan peramban — tanpa rAF Lenis & tanpa olah
    // transform tambahan (perbaikan lag HP, audit 28 Okt 2026).
    if (window.innerWidth < 1024) return;
    const lenis = new Lenis({ autoRaf: true, lerp: 0.1 });
    return () => {
      lenis.destroy();
    };
  }, [pathname]);
  return null;
}

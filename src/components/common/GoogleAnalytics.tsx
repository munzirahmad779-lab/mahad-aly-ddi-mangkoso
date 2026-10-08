"use client";

import Script from "next/script";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useArticles } from "@/context/ArticleContext";

export default function GoogleAnalytics() {
  const { settings } = useArticles();
  const pathname = usePathname();

  const rawGaId =
    settings?.seo?.googleAnalyticsId ||
    settings?.googleAnalyticsId ||
    process.env.NEXT_PUBLIC_GA_ID ||
    "G-EBBP80BZWL";

  // Gunakan ID resmi user jika masih kosong atau placeholder
  const gaId =
    !rawGaId || rawGaId === "G-MAHADALY2026"
      ? "G-EBBP80BZWL"
      : rawGaId.trim();

  // Catat trafik riil lokal di browser setiap kali pengunjung membuka halaman
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const statsKey = "mahad_traffic_stats";
      const existing = localStorage.getItem(statsKey);
      let stats = existing
        ? JSON.parse(existing)
        : { totalViews: 0, pages: {}, lastVisit: "" };

      stats.totalViews = (stats.totalViews || 0) + 1;
      stats.pages = stats.pages || {};
      stats.pages[pathname] = (stats.pages[pathname] || 0) + 1;
      stats.lastVisit = new Date().toISOString();

      localStorage.setItem(statsKey, JSON.stringify(stats));

      // Kirim pageview ke GA jika GA gtag tersedia
      if (typeof (window as any).gtag === "function" && gaId) {
        (window as any).gtag("config", gaId, {
          page_path: pathname,
          page_title: typeof document !== "undefined" ? document.title : "",
        });
      }
    } catch (e) {
      // Ignore storage errors
    }
  }, [pathname, gaId]);

  if (!gaId || !gaId.startsWith("G-")) {
    return null;
  }

  return null;
}

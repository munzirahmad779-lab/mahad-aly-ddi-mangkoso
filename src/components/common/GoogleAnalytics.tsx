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

  // Catat trafik riil secara global di server dan lokal di browser
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Abaikan rute admin dan api
    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) return;

    try {
      // 1. Kirim hit ke server Supabase agar terekam secara global lintas pengunjung
      const payload = JSON.stringify({
        pathname,
        referrer: typeof document !== "undefined" ? document.referrer : ""
      });

      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/analytics/track", payload);
      } else {
        fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true
        }).catch(() => {});
      }

      // 2. Simpan juga cache lokal di browser untuk respon instan
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

      // 3. Kirim pageview ke GA jika GA gtag tersedia
      if (typeof (window as any).gtag === "function" && gaId) {
        (window as any).gtag("config", gaId, {
          page_path: pathname,
          page_title: typeof document !== "undefined" ? document.title : ""
        });
      }
    } catch (e) {
      // Ignore tracking errors
    }
  }, [pathname, gaId]);

  if (!gaId || !gaId.startsWith("G-")) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  );
}

import type { Metadata } from "next";
import { Inter, Amiri, Cinzel } from "next/font/google";
import MaintenanceGate from "@/components/common/MaintenanceGate";
import GoogleAnalytics from "@/components/common/GoogleAnalytics";
import { ArticleProvider } from "@/context/ArticleContext";
import { supabaseAnon } from "@/lib/supabase/server";
import {
  mapDbArticles,
  mapDbTheses,
  mapDbCategories,
  mapDbNews,
  mapDbCollections
} from "@/lib/content-mappers";
import "./globals.css";

// Konten identitas (footer, navbar, hero) diambil di SERVER supaya HTML
// pertama sudah memuat nilai dari database — menghilangkan kedipan
// "teks default → teks admin" saat halaman pertama dibuka.
// ISR 30 detik: cepat seperti statis, tapi menyegarkan data dari DB.
export const revalidate = 30;

// Ambil nilai site_content dengan pengaman waktu (maks 2 detik) agar
// lambat/putusnya database tidak pernah menahan render halaman.
// Cache module-level: seed diambil maksimal 1x per 30 detik. Permintaan
// berikutnya instan; kalau kueri gagal/lambat, pakai data terakhir yang
// berhasil (stale-while-error) sehingga seed TIDAK PERNAH kosong mendadak.
let seedCache: { data: Record<string, unknown>; at: number } | null = null;
const SEED_TTL_MS = 30_000;
const SEED_FETCH_TIMEOUT_MS = 6_000;

async function fetchInitialContent(): Promise<Record<string, unknown>> {
  const KEYS = [
    "footer", "footer_nav", "footer_focus", "header", "home.hero", "site_settings",
    "home_sections", "about_page", "page_texts", "dema_settings", "masyayikh_list",
    "courses_list", "sarana_list", "accreditations", "calendar_events",
    "bahtsul_masail", "pmb_settings", "pmb_waves", "pmb_faqs",
    "gallery_albums", "donations", "email_templates"
  ];

  // 1. Cache segar → instan
  if (seedCache && Date.now() - seedCache.at < SEED_TTL_MS) {
    return seedCache.data;
  }

  // 2. Kueri paralel: site_content (1 kueri) + tabel konten publik
  try {
    const query = Promise.all([
      supabaseAnon
        .from("site_content")
        .select("key, value")
        .in("key", KEYS)
        .then(({ data, error }) => {
          if (error || !Array.isArray(data)) throw new Error(error?.message || "query gagal");
          const map: Record<string, unknown> = {};
          for (const row of data) {
            if (row?.key && row.value != null) map[row.key] = row.value;
          }
          return map;
        }),
      supabaseAnon.from("articles").select("*").then(r => mapDbArticles((r.data as any[]) || [])),
      supabaseAnon.from("theses").select("*").then(r => mapDbTheses((r.data as any[]) || [])),
      supabaseAnon.from("categories").select("*").then(r => mapDbCategories((r.data as any[]) || [])),
      supabaseAnon.from("news").select("*").then(r => mapDbNews((r.data as any[]) || [])),
      supabaseAnon.from("collections").select("*").then(r => mapDbCollections((r.data as any[]) || []))
    ]);

    const timeout = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), SEED_FETCH_TIMEOUT_MS)
    );
    const hasil = await Promise.race([
      query.then(([content, articles, theses, categories, news, collections]) => ({
        ...content,
        __articles: articles,
        __theses: theses,
        __categories: categories,
        __news: news,
        __lecturers: collections.lecturers,
        __facilities: collections.facilities
      })),
      timeout
    ]);

    if (hasil && Object.keys(hasil).length > 0) {
      seedCache = { data: hasil, at: Date.now() };
      return hasil;
    }
    // Kueri timeout/kosong → pakai cache lama bila ada
    return seedCache?.data ?? {};
  } catch {
    return seedCache?.data ?? {};
  }
}

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const amiri = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-cinzel",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://mahadaly-ddimangkoso.my.id"),
  title: {
    default: "Ma'had Aly DDI Mangkoso — Pendidikan Tinggi Kader Ulama",
    template: "%s | Ma'had Aly DDI Mangkoso"
  },
  description: "Portal Resmi & Mimbar Kajian Keislaman Ma'had Aly DDI Mangkoso (Mahad Aly Mangkoso). Membina kader ulama berakar pada sanad kitab klasik dan berwawasan wasathiyyah di Barru, Sulawesi Selatan.",
  keywords: [
    "mahad aly mangkoso",
    "Mahad Aly Mangkoso",
    "Ma'had Aly DDI Mangkoso",
    "mahad aly ddi mangkoso",
    "Pendidikan Kader Ulama",
    "Turats",
    "Fiqh Mu'asarah",
    "Usul Fikih",
    "Barru",
    "Sulawesi Selatan"
  ],
  authors: [{ name: "Ma'had Aly DDI Mangkoso" }],
  creator: "Ma'had Aly DDI Mangkoso",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://mahadaly-ddimangkoso.my.id",
    siteName: "Ma'had Aly DDI Mangkoso",
    title: "Ma'had Aly DDI Mangkoso — Pendidikan Tinggi Kader Ulama",
    description: "Portal Resmi & Mimbar Kajian Keislaman Ma'had Aly DDI Mangkoso (Mahad Aly Mangkoso). Membina kader ulama berakar pada sanad kitab klasik dan berwawasan wasathiyyah.",
    images: [
      {
        url: "/image_067524.png",
        width: 800,
        height: 800,
        alt: "Logo Ma'had Aly DDI Mangkoso",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ma'had Aly DDI Mangkoso — Pendidikan Tinggi Kader Ulama",
    description: "Portal Resmi & Mimbar Kajian Keislaman Ma'had Aly DDI Mangkoso.",
    images: ["/image_067524.png"],
  },
  icons: {
    icon: [
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
      { url: "/image_067524.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: ["/icon.png"],
    apple: [
      { url: "/apple-icon.png", sizes: "512x512", type: "image/png" },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    // PENTING: JANGAN set canonical global di sini. Canonical di root layout
    // mewarisi ke SEMUA halaman sehingga setiap artikel/berita/PMb mengklaim
    // "saya duplikat beranda" — Google menolak mengindeksnya (bug yang lama
    // membuat situs tidak naik). Halaman utama & detail menata canonical
    // masing-masing.
    types: {
      "application/rss+xml": "/feed.xml"
    }
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID || "G-EBBP80BZWL";
  const initialContent = await fetchInitialContent();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "EducationalOrganization",
        "@id": "https://mahadaly-ddimangkoso.my.id/#organization",
        "name": "Ma'had Aly DDI Mangkoso",
        "alternateName": [
          "Mahad Aly Mangkoso",
          "Mahad Aly DDI Mangkoso",
          "Ma'had Aly Pendidikan Kader Ulama DDI Mangkoso",
          "Pondok Pesantren DDI Mangkoso Mahad Aly"
        ],
        "url": "https://mahadaly-ddimangkoso.my.id",
        "logo": "https://mahadaly-ddimangkoso.my.id/image_067524.png",
        "sameAs": [
          "https://www.instagram.com/mahadalyddimangkoso"
        ],
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Kompleks Pondok Pesantren DDI Mangkoso, Kel. Mangkoso, Kec. Soppeng Riaja",
          "addressLocality": "Barru",
          "addressRegion": "Sulawesi Selatan",
          "postalCode": "90752",
          "addressCountry": "ID"
        }
      },
      {
        "@type": "WebSite",
        "@id": "https://mahadaly-ddimangkoso.my.id/#website",
        "url": "https://mahadaly-ddimangkoso.my.id",
        "name": "Ma'had Aly DDI Mangkoso",
        "alternateName": "Mahad Aly Mangkoso",
        "publisher": {
          "@id": "https://mahadaly-ddimangkoso.my.id/#organization"
        },
        "inLanguage": "id-ID"
      }
    ]
  };

  return (
    <html lang="id" className={`scroll-smooth ${inter.variable} ${amiri.variable} ${cinzel.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* GA4 dimuat SEKALI lewat komponen <GoogleAnalytics /> (afterInteractive).
            Duplikat di head dihapus — sebelumnya gtag 353 KiB terunduh dua kali
            dan memperlambat LCP seluruh halaman. */}
      </head>
      <body className="bg-slate-50 text-slate-800 font-sans antialiased selection:bg-mahad-gold selection:text-mahad-green-dark flex flex-col min-h-screen">
        <ArticleProvider initialContent={initialContent}>
          <GoogleAnalytics />
          <MaintenanceGate>{children}</MaintenanceGate>
        </ArticleProvider>
      </body>
    </html>
  );
}
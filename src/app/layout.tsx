import type { Metadata } from "next";
import { Inter, Amiri, Cinzel } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ArticleProvider } from "@/context/ArticleContext";
import "./globals.css";

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://mahadalymangkoso.ac.id"),
  title: {
    default: "Ma'had Aly DDI Mangkoso — Pendidikan Tinggi Kader Ulama",
    template: "%s | Ma'had Aly DDI Mangkoso"
  },
  description: "Portal Resmi & Mimbar Kajian Keislaman Ma'had Aly DDI Mangkoso. Membina kader ulama berakar pada sanad kitab klasik dan berwawasan wasathiyyah.",
  keywords: ["Ma'had Aly", "DDI Mangkoso", "Pendidikan Kader Ulama", "Turats", "Fiqh Mu'asarah", "Usul Fikih", "Barru", "Sulawesi Selatan"],
  authors: [{ name: "Ma'had Aly DDI Mangkoso" }],
  creator: "Ma'had Aly DDI Mangkoso",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://mahadalymangkoso.ac.id",
    siteName: "Ma'had Aly DDI Mangkoso",
    title: "Ma'had Aly DDI Mangkoso — Pendidikan Tinggi Kader Ulama",
    description: "Portal Resmi & Mimbar Kajian Keislaman Ma'had Aly DDI Mangkoso. Membina kader ulama berakar pada sanad kitab klasik dan berwawasan wasathiyyah.",
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
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`scroll-smooth ${inter.variable} ${amiri.variable} ${cinzel.variable}`}>
      <body className="bg-slate-50 text-slate-800 font-sans antialiased selection:bg-mahad-gold selection:text-mahad-green-dark flex flex-col min-h-screen">
        <ArticleProvider>
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
        </ArticleProvider>
      </body>
    </html>
  );
}
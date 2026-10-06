import type { Metadata } from "next";
import { Inter, Amiri, Cinzel } from "next/font/google";
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
  title: "Ma'had Aly DDI Mangkoso — Pendidikan Tinggi Kader Ulama",
  description: "Portal Kajian & Publikasi Ilmiah Ma'had Aly DDI Mangkoso. Melahirkan kader ulama berwawasan wasathiyyah dan berakar pada khazanah turats.",
  keywords: ["Ma'had Aly", "DDI Mangkoso", "Pendidikan Ulama", "Turats", "Usul Fikih", "Tafsir Hadis"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`scroll-smooth ${inter.variable} ${amiri.variable} ${cinzel.variable}`}>
      <body className="bg-slate-50 text-slate-800 font-sans antialiased selection:bg-mahad-gold selection:text-mahad-green-dark">
        {children}
      </body>
    </html>
  );
}
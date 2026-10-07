"use client";

import Link from "next/link";
import { useArticles } from "@/context/ArticleContext";

export default function AboutPreview() {
  const { settings, aboutPageContent } = useArticles();

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3.5 py-1 rounded-full">
            Karakteristik &amp; Kurikulum
          </span>
          <h2 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-emerald-950 mt-3">
            Pilar Pendidikan Kader Ulama
          </h2>
          <div className="h-1.5 w-20 bg-mahad-gold mx-auto mt-4 mb-6 rounded-full"></div>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            {settings.historyContent ? (
              settings.historyContent.length > 250
                ? `${settings.historyContent.slice(0, 250)}...`
                : settings.historyContent
            ) : (
              <>
                Diresmikan atas inisiasi {settings.mudirName || "AGH. Prof. Dr. M. Faried Wadjedy, MA"} dan dewan masyaikh demi membina kader ulama fukaha yang berdedikasi tinggi.
              </>
            )}
          </p>
        </div>

        {/* 4 Kartu Bento Grid Dinamis */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(aboutPageContent?.educationCards && aboutPageContent.educationCards.length > 0
            ? aboutPageContent.educationCards
            : [
                {
                  id: "ed-1",
                  title: "Pengkaderan 4 Tahun",
                  description: "Masa studi delapan semester (Marhalah Ula) untuk mendalami metodologi pemikiran hukum Islam dan kepemimpinan moral.",
                  badge: "Jenjang Marhalah Ula"
                },
                {
                  id: "ed-2",
                  title: "Kitab Klasik (Turats)",
                  description: "Membahas kitab-kitab induk mu'tabar dalam Usul Fikih, Fiqh Muqaran, Qawa'id, Tafsir, dan Nahwu-Sharaf.",
                  badge: "Sanad Keilmuan Shahih"
                },
                {
                  id: "ed-3",
                  title: "Sistem Halaqah",
                  description: "Metode pengajian wetonan, sorogan mandiri di hadapan kiai, serta mudzakarah bahtsul masail secara kontinu.",
                  badge: "Wetonan & Sorogan"
                },
                {
                  id: "ed-4",
                  title: "Beasiswa Penuh",
                  description: "Bebas biaya pendidikan 100% melalui dukungan filantropis program Orang Tua Asuh (OTA) dan donatur keumatan.",
                  badge: "Filantropi Umat"
                }
              ]
          ).map((card: any, idx: number) => (
            <div
              key={card.id || idx}
              className={`bg-slate-50 hover:bg-white rounded-2xl p-7 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between ${
                idx % 2 === 0 ? "hover:border-emerald-700" : "hover:border-mahad-gold"
              }`}
            >
              <div>
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-5 font-bold ${
                    idx % 2 === 0
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {String(idx + 1).padStart(2, "0")}
                </div>
                <h3 className="font-serif font-bold text-xl text-slate-900 mb-2">
                  {card.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {card.description}
                </p>
              </div>
              <span
                className={`mt-6 pt-4 border-t border-slate-200 text-xs font-semibold ${
                  idx % 2 === 0 ? "text-emerald-700" : "text-amber-700"
                }`}
              >
                {card.badge}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/tentang"
            className="inline-flex items-center gap-2 text-emerald-800 hover:text-emerald-950 font-bold text-sm bg-emerald-50 hover:bg-emerald-100 px-6 py-3 rounded-full transition"
          >
            <span>Baca Sejarah &amp; Profil Lengkap Ma&apos;had</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>

      </div>
    </section>
  );
}
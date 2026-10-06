"use client";

import Link from "next/link";
import { useArticles } from "@/context/ArticleContext";
import ThesisCard from "@/components/theses/ThesisCard";

export default function LatestTheses() {
  const { theses } = useArticles();

  return (
    <section className="py-24 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
              Karya Ilmiah Mahasantri (M.1)
            </span>
            <h2 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-emerald-950 mt-3">
              Repositori Skripsi &amp; Risalah
            </h2>
            <div className="h-1.5 w-20 bg-mahad-gold mt-4 mb-2 rounded-full"></div>
            <p className="text-slate-600 text-sm sm:text-base">
              Naskah akademik berfokus pada pemecahan isu Fiqh Mu&apos;asarah (Unduh PDF via Google Drive).
            </p>
          </div>

          <Link
            href="/skripsi"
            className="self-start md:self-auto inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow transition"
          >
            <span>Lihat Semua Skripsi</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {theses.slice(0, 3).map((thesis) => (
            <ThesisCard key={thesis.id} thesis={thesis} />
          ))}
        </div>

      </div>
    </section>
  );
}

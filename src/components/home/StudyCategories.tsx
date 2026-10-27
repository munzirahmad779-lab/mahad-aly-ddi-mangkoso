"use client";

import Link from "next/link";
import { useArticles } from "@/context/ArticleContext";
import Reveal from "@/components/common/Reveal";

// Pola bentang bento untuk 6 kartu pertama: lebar–sempit berselang-seling
// (2+1 / 1+2 / 1+2 kolom) agar grid terasa hidup tapi tetap rapi.
const BENTO_SPANS = [
  "lg:col-span-2",
  "",
  "",
  "lg:col-span-2",
  "",
  "lg:col-span-2",
];

export default function StudyCategories() {
  const { categories } = useArticles();
  const shown = categories.slice(0, 6);

  return (
    <section className="py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <Reveal>
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3.5 py-1 rounded-full">
              Fokus Keilmuan &bull; Fiqh Mu&apos;asarah (الفقه المعاصر)
            </span>
            <h2 className="font-serif font-bold text-3xl sm:text-4xl text-slate-900 mt-3">
              Gugus Kajian Fiqh Kontemporer
            </h2>
            <div className="h-1.5 w-16 bg-mahad-gold mx-auto mt-3 rounded-full"></div>
            <p className="text-slate-600 text-sm sm:text-base mt-3">
              Merespons dinamika hukum Islam modern dengan metodologi ushul fikih dan khazanah kitab klasik salaf.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {shown.map((cat, idx) => {
            const wide = BENTO_SPANS[idx]?.includes("col-span-2");
            return (
              <Reveal
                key={cat.id}
                delay={(idx % 3) * 0.08}
                className={`${BENTO_SPANS[idx] || ""} h-full`}
              >
                <Link
                  href={`/kategori/${cat.slug}`}
                  className={`relative overflow-hidden rounded-2xl p-7 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between h-full hover:-translate-y-1 ${
                    wide
                      ? "bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white border border-emerald-700"
                      : "bg-white border border-slate-200 hover:border-emerald-700"
                  }`}
                >
                  {wide && (
                    <span
                      aria-hidden
                      className="absolute -right-3 -bottom-7 font-display font-bold text-[7rem] leading-none text-white/10 select-none pointer-events-none"
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  )}
                  <div className="relative">
                    <span className="text-xs font-bold uppercase tracking-wider text-mahad-gold">
                      Kajian Takhassus
                    </span>
                    <h3
                      className={`font-serif font-bold mt-1 mb-2 transition-colors ${
                        wide
                          ? "text-2xl text-white group-hover:text-mahad-gold-light"
                          : "text-xl text-slate-900 group-hover:text-emerald-800"
                      }`}
                    >
                      {cat.name}
                    </h3>
                    <p
                      className={`text-xs sm:text-sm leading-relaxed ${
                        wide ? "text-emerald-50/90 line-clamp-3" : "text-slate-600 line-clamp-2"
                      }`}
                    >
                      {cat.description}
                    </p>
                  </div>
                  <div
                    className={`relative mt-5 pt-3 text-xs font-bold flex items-center gap-1 ${
                      wide
                        ? "border-t border-white/15 text-mahad-gold-light"
                        : "border-t border-slate-100 text-emerald-700"
                    }`}
                  >
                    <span>Jelajahi Kajian</span>
                    <svg className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>

      </div>
    </section>
  );
}

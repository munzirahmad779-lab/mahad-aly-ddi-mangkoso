"use client";

import Link from "next/link";
import { useArticles } from "@/context/ArticleContext";

export default function StudyCategories() {
  const { categories } = useArticles();

  return (
    <section className="py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.slice(0, 6).map((cat) => (
            <Link
              key={cat.id}
              href={`/kategori/${cat.slug}`}
              className="bg-white rounded-2xl p-7 border border-slate-200 hover:border-emerald-700 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-mahad-gold">
                  Kajian Takhassus
                </span>
                <h3 className="font-serif font-bold text-xl text-slate-900 mt-1 mb-2 group-hover:text-emerald-800 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-2">
                  {cat.description}
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 text-xs font-bold text-emerald-700 flex items-center gap-1">
                <span>Jelajahi Kajian</span>
                <svg className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
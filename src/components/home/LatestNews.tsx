"use client";

import Link from "next/link";
import { useArticles } from "@/context/ArticleContext";

export default function LatestNews() {
  const { news } = useArticles();

  return (
    <section className="py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
              Warta &amp; Pengumuman
            </span>
            <h2 className="font-serif font-bold text-3xl sm:text-4xl text-slate-900 mt-3">
              Kabar Pesantren &amp; Halaqah
            </h2>
            <div className="h-1.5 w-16 bg-mahad-gold mt-3 mb-2 rounded-full"></div>
          </div>

          <Link
            href="/berita"
            className="text-xs sm:text-sm font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
          >
            <span>Lihat Semua Kabar</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {news.slice(0, 2).map((item) => (
            <article
              key={item.id}
              className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 hover:border-emerald-700 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
                    {item.category}
                  </span>
                  <span className="text-slate-400">{item.date}</span>
                </div>
                <h3 className="font-serif font-bold text-xl text-slate-900 leading-snug mb-3 hover:text-emerald-800 transition">
                  <Link href={`/berita/${item.slug}`}>{item.title}</Link>
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">
                  {item.excerpt}
                </p>
              </div>

              <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Oleh: <strong>{item.author}</strong></span>
                <Link
                  href={`/berita/${item.slug}`}
                  className="font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
                >
                  <span>Baca Selengkapnya</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}

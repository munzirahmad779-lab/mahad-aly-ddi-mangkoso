"use client";

import Link from "next/link";
import { useArticles } from "@/context/ArticleContext";

export default function BeritaPage() {
  const { news } = useArticles();

  return (
    <main className="pt-24 pb-20 bg-slate-50 min-h-screen">
      <section className="bg-mahad-green-dark text-white py-14 bg-islamic-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-mahad-gold bg-white/10 px-3.5 py-1 rounded-full">
            Kabar Pesantren &amp; Halaqah
          </span>
          <h1 className="font-serif font-bold text-3xl sm:text-5xl text-white mt-3">
            Berita, Pengumuman &amp; Agenda
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base max-w-2xl mx-auto mt-2">
            Informasi terkini kegiatan akademik, simposium ilmiah, dan agenda resmi Ma&apos;had Aly DDI Mangkoso.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item) => (
            <article
              key={item.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-emerald-700 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
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
                <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                  {item.excerpt}
                </p>
              </div>

              <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Oleh: <strong>{item.author}</strong></span>
                <Link
                  href={`/berita/${item.slug}`}
                  className="font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
                >
                  <span>Baca</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}

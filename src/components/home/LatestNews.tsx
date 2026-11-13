"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useArticles } from "@/context/ArticleContext";
import Reveal from "@/components/common/Reveal";
import { CardViewCount, muatPetaKunjungan } from "@/components/common/ViewCount";

export default function LatestNews() {
  const { news } = useArticles();
  const [pages, setPages] = useState<Record<string, number>>({});

  useEffect(() => {
    let alive = true;
    muatPetaKunjungan().then((p) => {
      if (alive) setPages(p);
    });
    return () => {
      alive = false;
    };
  }, []);

  // Panel Warta & Berita berdiri sendiri, terpisah dari panel Mimbar
  // (perintah user 10 Nov 2026). Sejak 13 Nov 2026 panel ini adalah
  // panel PALING POPULER (perintah user): empat warta dengan pembaca
  // terbanyak menurut peta kunjungan server yang sama dengan lencana
  // jumlah pembaca di kartu; bila views seri, urutan data awal yang
  // dipertahankan (terbaru dulu). Panel ini tampil di beranda SEBELUM
  // panel Mimbar Kajian (urutan home_sections di basis data).
  const tampil = [...news]
    .sort(
      (a, b) =>
        (pages[`/berita/${b.slug}`] || 0) - (pages[`/berita/${a.slug}`] || 0)
    )
    .slice(0, 4);

  return (
    <section className="py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Reveal>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
              Paling Populer
            </span>
            <h2 className="font-serif font-bold text-3xl sm:text-4xl text-slate-900 mt-3">
              Warta &amp; Berita Ma&apos;had Aly
            </h2>
            <div className="h-1.5 w-16 bg-mahad-gold mt-3 mb-2 rounded-full"></div>
          </div>

          <Link
            href="/berita"
            className="text-xs sm:text-sm font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
          >
            <span>Lihat Semua Warta &amp; Berita</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tampil.map((item, idx) => (
            <Reveal key={item.id} delay={idx * 0.1} className="h-full">
            <article
              className="h-full bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-emerald-700 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {item.imageUrl && (
                  <div className="relative w-full h-48 overflow-hidden bg-slate-100">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    {item.attachmentUrl && (
                      <span className="absolute top-3 right-3 bg-amber-500 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                        <span>📎 Dokumen Lampiran</span>
                      </span>
                    )}
                  </div>
                )}
                <div className="p-6 sm:p-8 pb-0">
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
                      {item.category}
                    </span>
                    <span className="text-slate-400">{item.date}</span>
                  </div>
                  <h3 className="font-serif font-bold text-xl text-slate-900 leading-snug mb-3 group-hover:text-emerald-800 transition">
                    <Link href={`/berita/${item.slug}`}>{item.title}</Link>
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">
                    {item.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-6 sm:p-8 pt-0">
                <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500">Oleh: <strong>{item.author}</strong></span>
                    <CardViewCount slug={item.slug} basePath="/berita" />
                  </div>
                  <Link
                    href={`/berita/${item.slug}`}
                    className="font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Baca Selengkapnya</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </article>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
}

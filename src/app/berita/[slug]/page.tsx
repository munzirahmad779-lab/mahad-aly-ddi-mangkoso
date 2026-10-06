"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useArticles } from "@/context/ArticleContext";

interface BeritaDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default function BeritaDetailPage({ params }: BeritaDetailPageProps) {
  const { slug } = use(params);
  const { news } = useArticles();

  const item = news.find((n) => n.slug === slug);

  if (!item) {
    notFound();
  }

  return (
    <main className="pt-24 pb-20 bg-slate-50 min-h-screen">
      <section className="bg-mahad-green-dark text-white py-12 bg-islamic-pattern">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/berita"
            className="inline-flex items-center gap-1.5 text-xs text-mahad-gold-light hover:text-mahad-gold mb-4 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Kembali ke Warta &amp; Berita</span>
          </Link>
          <span className="inline-block bg-mahad-gold text-mahad-green-dark text-xs font-bold px-3 py-0.5 rounded-full mb-3">
            {item.category}
          </span>
          <h1 className="font-serif font-bold text-2xl sm:text-4xl text-white leading-snug">
            {item.title}
          </h1>
          <p className="text-xs text-emerald-200 mt-4">
            Diterbitkan pada: {item.date} &bull; Oleh: {item.author}
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <article className="bg-white rounded-2xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-6 text-slate-800 leading-relaxed text-base sm:text-lg whitespace-pre-line">
          {item.content}
        </article>
      </div>
    </main>
  );
}

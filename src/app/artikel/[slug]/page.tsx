"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useArticles } from "@/context/ArticleContext";
import ArticleCard from "@/components/articles/ArticleCard";

interface ArticleDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const { slug } = use(params);
  const { articles, incrementArticleViews } = useArticles();

  const article = articles.find((a) => a.slug === slug);

  useEffect(() => {
    if (article) {
      incrementArticleViews(slug);
    }
  }, [slug]);

  if (!article) {
    notFound();
  }

  const relatedArticles = articles
    .filter((a) => a.category === article.category && a.id !== article.id)
    .slice(0, 2);

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = encodeURIComponent(article.title);

  return (
    <main className="pt-24 pb-20 bg-slate-50 min-h-screen">
      
      {/* Header Artikel */}
      <section className="bg-mahad-green-dark text-white py-14 bg-islamic-pattern">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/artikel"
            className="inline-flex items-center gap-1.5 text-xs text-mahad-gold-light hover:text-mahad-gold mb-6 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Kembali ke Mimbar Kajian</span>
          </Link>

          <span className="inline-block text-xs font-bold uppercase tracking-wider bg-mahad-gold text-mahad-green-dark px-3 py-1 rounded-full mb-3 shadow">
            {article.categoryLabel}
          </span>

          <h1 className="font-serif font-bold text-2xl sm:text-4xl lg:text-5xl text-white leading-tight">
            {article.title}
          </h1>

          <div className="mt-6 pt-6 border-t border-emerald-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-emerald-200">
            <div>
              <p className="font-bold text-white text-sm">{article.author}</p>
              <p className="text-emerald-300">{article.authorRole}</p>
            </div>
            <div className="text-right">
              <p>{article.date} ({article.hijriDate})</p>
              <p className="text-mahad-gold font-semibold">
                Waktu baca: &plusmn; {article.readTime} &bull; {article.views || 1}x dibaca
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Badan Tulisan & Sidebar */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        
        {/* Konten Utama */}
        <article className="bg-white rounded-2xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-6">
          
          {/* Kotak Abstrak */}
          <div className="bg-emerald-50 border-l-4 border-emerald-700 p-5 rounded-r-xl">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1 font-bold">
              Pokok Pikiran &amp; Abstrak
            </h4>
            <p className="text-slate-700 text-sm italic leading-relaxed">
              {article.excerpt}
            </p>
          </div>

          {/* Isi Teks Lengkap */}
          <div className="text-slate-800 leading-relaxed text-base sm:text-lg space-y-5 whitespace-pre-line font-sans">
            {article.content}
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-slate-500">Kata Kunci:</span>
              {article.tags.map((t, i) => (
                <span key={i} className="bg-slate-100 text-emerald-900 px-2.5 py-1 rounded-md font-medium">
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Social Share Buttons */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Bagikan Tulisan Ini:
            </span>
            <div className="flex items-center gap-2">
              <a
                href={`https://wa.me/?text=${shareTitle}%20${encodeURIComponent(currentUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
              >
                <span>WhatsApp</span>
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
              >
                <span>Facebook</span>
              </a>
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${shareTitle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
              >
                <span>Telegram</span>
              </a>
            </div>
          </div>
        </article>

        {/* Bio Penulis */}
        <div className="bg-emerald-50 rounded-2xl p-6 sm:p-8 border border-emerald-100 flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow">
            {article.author.charAt(0)}
          </div>
          <div className="space-y-1">
            <h4 className="font-serif font-bold text-lg text-emerald-950">{article.author}</h4>
            <p className="text-xs text-emerald-800 font-semibold">{article.authorRole}</p>
            <p className="text-xs text-slate-600 leading-relaxed">
              {article.authorBio || "Sivitas akademika Ma'had Aly DDI Mangkoso yang aktif menulis risalah dan kajian pemikiran hukum Islam."}
            </p>
          </div>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-2xl text-slate-900">
              Kajian Terkait dalam Kategori Serupa
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedArticles.map((rel) => (
                <ArticleCard key={rel.id} article={rel} />
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
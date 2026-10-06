"use client";

import { useState } from "react";
import Link from "next/link";
import { Article } from "@/lib/types";
import ArticleCard from "@/components/articles/ArticleCard";

interface LatestArticlesProps {
  articles: Article[];
}

export default function LatestArticles({ articles }: LatestArticlesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("semua");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filter artikel berdasarkan tombol kategori dan pencarian nama/judul
  const filteredArticles = articles.filter((art) => {
    const matchesCategory =
      selectedCategory === "semua" || art.category === selectedCategory;
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="mimbar-kajian" className="py-24 bg-emerald-50/60 border-t border-emerald-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Bagian Artikel */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-200/80 px-3 py-1 rounded-full">
              Kajian Ilmiah &amp; Riset
            </span>
            <h2 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-emerald-950 mt-3">
              Mimbar Kajian Keislaman
            </h2>
            <div className="h-1.5 w-20 bg-mahad-gold mt-4 mb-2 rounded-full"></div>
            <p className="text-slate-600 text-sm sm:text-base">
              Kumpulan tulisan akademik, telaah usuliyah, dan esai sivitas akademika.
            </p>
          </div>

          <Link
            href="/kirim-tulisan"
            className="self-start md:self-auto inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-6 py-3.5 rounded-xl shadow transition"
          >
            <svg className="w-4 h-4 text-mahad-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span>Kirim Naskah Anda</span>
          </Link>
        </div>

        {/* Filter Tombol & Input Pencarian */}
        <div className="mt-10 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory("semua")}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold border transition ${
                selectedCategory === "semua"
                  ? "bg-emerald-800 text-white border-emerald-800"
                  : "bg-white text-slate-700 border-slate-300 hover:border-emerald-800"
              }`}
            >
              Semua Kajian
            </button>

            {/* Tombol Spesial Karya Anregurutta */}
            <button
              type="button"
              onClick={() => setSelectedCategory("karya-anregurutta")}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold border-2 transition flex items-center gap-1.5 ${
                selectedCategory === "karya-anregurutta"
                  ? "bg-mahad-gold text-mahad-green-dark border-mahad-gold shadow-sm"
                  : "bg-amber-100 text-amber-900 border-mahad-gold hover:bg-mahad-gold hover:text-mahad-green-dark"
              }`}
            >
              <span>★ Karya Anregurutta</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory("usul-fikih")}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold border transition ${
                selectedCategory === "usul-fikih"
                  ? "bg-emerald-800 text-white border-emerald-800"
                  : "bg-white text-slate-700 border-slate-300 hover:border-emerald-800"
              }`}
            >
              Usul Fikih
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory("tafsir-hadis")}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold border transition ${
                selectedCategory === "tafsir-hadis"
                  ? "bg-emerald-800 text-white border-emerald-800"
                  : "bg-white text-slate-700 border-slate-300 hover:border-emerald-800"
              }`}
            >
              Tafsir &amp; Hadis
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              placeholder="Cari judul atau penulis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-full text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-mahad-gold shadow-sm"
            />
          </div>

        </div>

        {/* Grid Artikel */}
        {filteredArticles.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 mt-8 shadow-sm">
            <p className="text-slate-600 font-medium mb-3">
              Tidak ada artikel yang cocok dengan kriteria pencarian Anda.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("semua");
                setSearchQuery("");
              }}
              className="text-sm text-emerald-800 font-bold underline"
            >
              Reset Filter &amp; Tampilkan Semua
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
"use client";

import { useState } from "react";
import Link from "next/link";
import { useArticles } from "@/context/ArticleContext";
import ArticleCard from "@/components/articles/ArticleCard";

export default function OpiniPage() {
  const { articles, categories, pageTexts } = useArticles();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "popular">("newest");

  // Hanya ambil artikel dengan tipe 'opini'
  const opiniArticles = articles.filter((a) => a.type === "opini");
  const opiniCategories = categories.filter((c) => c.type === "opini");

  const filtered = opiniArticles
    .filter((a) => {
      const matchCat = selectedCategory === "all" || a.category === selectedCategory;
      const matchSearch =
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.author.toLowerCase().includes(search.toLowerCase()) ||
        a.excerpt.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === "popular") {
        return (b.views || 0) - (a.views || 0);
      }
      return 0;
    });

  return (
    <main className="pt-24 pb-20 bg-slate-50 min-h-screen">
      {/* Banner Khusus Opini & Refleksi */}
      <section className="bg-mahad-green-dark text-white py-14 bg-islamic-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-mahad-gold bg-white/10 px-3.5 py-1 rounded-full">
            {pageTexts?.opiniBadge || "Ruang Gagasan Santri • Kolom & Esai"}
          </span>
          <h1 className="font-serif font-bold text-3xl sm:text-5xl text-white">
            {pageTexts?.opiniTitle || "Mimbar Opini & Refleksi Santri"}
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base max-w-2xl mx-auto">
            {pageTexts?.opiniDesc ||
              "Wadah ekspresi pemikiran kritis, catatan spiritual adab penuntut ilmu, serta refleksi sosial keagamaan mahasantri dan asatidz Ma'had Aly DDI Mangkoso."}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Navigasi Cepat & Kirim Opini */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <Link
              href="/artikel"
              className="px-4 py-2 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <span>&larr;</span>
              <span>Beralih ke Mimbar Kajian Fikih</span>
            </Link>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
              ✍️ {opiniArticles.length} Tulisan Opini Terbit
            </span>
          </div>

          <Link
            href="/kirim-tulisan"
            className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow"
          >
            <span>✉️</span>
            <span>Kirim Tulisan / Opini Anda</span>
          </Link>
        </div>

        {/* Controls */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-6 relative">
            <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              placeholder="Cari judul opini, nama santri, atau topik..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">Semua Tema Opini</option>
              {opiniCategories.map((c) => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="newest">Urutkan: Terbaru</option>
              <option value="popular">Urutkan: Paling Populer</option>
            </select>
          </div>
        </div>

        {/* Grid Articles Opini */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((art) => (
              <ArticleCard key={art.id} article={art} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center text-xl mx-auto">
              ✍️
            </div>
            <p className="text-slate-600 font-medium max-w-md mx-auto">
              Belum ada tulisan opini yang sesuai dengan filter pencarian Anda.
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("all");
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                Reset Filter
              </button>
              <Link
                href="/kirim-tulisan"
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold"
              >
                Jadilah Penulis Pertama &rarr;
              </Link>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}

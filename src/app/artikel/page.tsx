"use client";

import { useState } from "react";
import Link from "next/link";
import { useArticles } from "@/context/ArticleContext";
import ArticleCard from "@/components/articles/ArticleCard";

export default function AllArticlesPage() {
  const { articles, categories } = useArticles();
  const [activeTab, setActiveTab] = useState<"fiqh" | "opini">("fiqh");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "popular">("newest");

  const fiqhArticles = articles.filter((a) => a.type !== "opini");
  const opiniArticles = articles.filter((a) => a.type === "opini");

  const activeArticles = activeTab === "fiqh" ? fiqhArticles : opiniArticles;
  const activeCategories = categories.filter((c) =>
    activeTab === "opini" ? c.type === "opini" : c.type !== "opini"
  );

  const filtered = activeArticles
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
      return 0; // default order is newest
    });

  return (
    <main className="pt-24 pb-20 bg-slate-50 min-h-screen">
      {/* Header Banner Dinamis */}
      <section className="bg-mahad-green-dark text-white py-14 bg-islamic-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-mahad-gold bg-white/10 px-3.5 py-1 rounded-full">
            {activeTab === "fiqh" ? "Publikasi Ilmiah Takhassus" : "Ruang Gagasan Santri & Esai"}
          </span>
          <h1 className="font-serif font-bold text-3xl sm:text-5xl text-white mt-3">
            {activeTab === "fiqh" ? "Mimbar Kajian Fiqh Mu'asarah" : "Mimbar Opini & Refleksi Santri"}
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base max-w-2xl mx-auto mt-2">
            {activeTab === "fiqh"
              ? "Kumpulan artikel telaah hukum Islam kontemporer, kajian ushul fikih, dan risalah pemikiran ulama DDI Mangkoso."
              : "Refleksi sosial keagamaan, catatan adab santri, dan esai pemikiran mahasantri serta asatidz Ma'had Aly DDI Mangkoso."}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Tab Switcher Fiqh vs Opini */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab("fiqh");
                setSelectedCategory("all");
              }}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                activeTab === "fiqh"
                  ? "bg-emerald-800 text-white shadow"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <span>🏛️</span>
              <span>Kajian Fiqh Mu&apos;asarah</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === "fiqh" ? "bg-emerald-950 text-emerald-200" : "bg-slate-200 text-slate-600"}`}>
                {fiqhArticles.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("opini");
                setSelectedCategory("all");
              }}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                activeTab === "opini"
                  ? "bg-amber-600 text-white shadow"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <span>✍️</span>
              <span>Opini &amp; Refleksi Santri</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === "opini" ? "bg-amber-800 text-amber-200" : "bg-slate-200 text-slate-600"}`}>
                {opiniArticles.length}
              </span>
            </button>
          </div>

          <Link
            href="/kirim-tulisan"
            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 self-center"
          >
            <span>✉️</span>
            <span>Kirim Tulisan / Opini Anda &rarr;</span>
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
              placeholder={activeTab === "fiqh" ? "Cari judul kajian fikih atau penulis..." : "Cari judul opini atau nama santri..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-mahad-gold"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-mahad-gold"
            >
              <option value="all">
                {activeTab === "fiqh" ? "Semua Gugus Fiqh" : "Semua Tema Opini"}
              </option>
              {activeCategories.map((c) => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-mahad-gold"
            >
              <option value="newest">Urutkan: Terbaru</option>
              <option value="popular">Urutkan: Paling Populer</option>
            </select>
          </div>
        </div>

        {/* Grid Articles */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((art) => (
              <ArticleCard key={art.id} article={art} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <p className="text-slate-600 font-medium">
              Tidak ada {activeTab === "fiqh" ? "kajian fikih" : "tulisan opini"} yang cocok dengan pencarian Anda.
            </p>
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
          </div>
        )}

      </div>
    </main>
  );
}

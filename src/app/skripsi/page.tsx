"use client";

import { useState } from "react";
import Link from "next/link";
import { useArticles } from "@/context/ArticleContext";
import ThesisCard from "@/components/theses/ThesisCard";

export default function SkripsiListPage() {
  const { theses } = useArticles();
  const [search, setSearch] = useState("");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const years = Array.from(new Set(theses.map((t) => t.year)));
  const categories = Array.from(new Set(theses.map((t) => t.categoryLabel)));

  const filteredTheses = theses.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.author.toLowerCase().includes(search.toLowerCase()) ||
      t.keywords.some((k) => k.toLowerCase().includes(search.toLowerCase())) ||
      t.advisor1.toLowerCase().includes(search.toLowerCase()) ||
      t.advisor2.toLowerCase().includes(search.toLowerCase());

    const matchesYear = selectedYear === "all" || t.year === selectedYear;
    const matchesCategory = selectedCategory === "all" || t.categoryLabel === selectedCategory;

    return matchesSearch && matchesYear && matchesCategory;
  });

  return (
    <main className="pt-24 pb-20 bg-slate-50 min-h-screen">
      {/* Header Repository */}
      <section className="bg-mahad-green-dark text-white py-14 bg-islamic-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-mahad-gold bg-white/10 px-3.5 py-1 rounded-full">
            Repositori Riset Mahasantri (M.1)
          </span>
          <h1 className="font-serif font-bold text-3xl sm:text-5xl text-white mt-3">
            Skripsi &amp; Risalah Fiqh Mu&apos;asarah
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base max-w-2xl mx-auto mt-2">
            Karya ilmiah orisinal mahasantri Marhalah Ula Ma&apos;had Aly DDI Mangkoso dalam merespons dinamika hukum Islam kontemporer.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Filter & Search Bar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* Search Input */}
            <div className="md:col-span-6 relative">
              <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                placeholder="Cari judul skripsi, nama penulis, pembimbing, atau kata kunci..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-mahad-gold"
              />
            </div>

            {/* Filter Tahun */}
            <div className="md:col-span-3">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-mahad-gold"
              >
                <option value="all">Semua Tahun Kelulusan</option>
                {years.map((y) => (
                  <option key={y} value={y}>Tahun {y}</option>
                ))}
              </select>
            </div>

            {/* Filter Kategori */}
            <div className="md:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-mahad-gold"
              >
                <option value="all">Semua Kategori Fiqh</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Ditemukan <strong>{filteredTheses.length}</strong> judul skripsi</span>
            {(search || selectedYear !== "all" || selectedCategory !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedYear("all");
                  setSelectedCategory("all");
                }}
                className="text-emerald-700 font-bold hover:underline"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {/* Grid Daftar Skripsi */}
        {filteredTheses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTheses.map((thesis) => (
              <ThesisCard key={thesis.id} thesis={thesis} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <svg className="w-12 h-12 text-slate-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-slate-600 font-medium">
              Tidak ada naskah skripsi yang cocok dengan pencarian Anda.
            </p>
          </div>
        )}

      </div>
    </main>
  );
}

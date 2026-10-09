"use client";

import { useState } from "react";
import Link from "next/link";
import { useArticles } from "@/context/ArticleContext";

export default function KategoriIndexPage() {
  const { categories, articles } = useArticles();
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | "fiqh" | "opini">("all");

  const safeCategories = Array.isArray(categories) ? categories : [];

  const filteredCategories = safeCategories.filter((cat) => {
    const matchesSearch =
      cat.name.toLowerCase().includes(search.toLowerCase()) ||
      cat.description.toLowerCase().includes(search.toLowerCase());
    
    if (selectedType === "fiqh") {
      return matchesSearch && cat.type !== "opini";
    }
    if (selectedType === "opini") {
      return matchesSearch && cat.type === "opini";
    }
    return matchesSearch;
  });

  const getArticleCount = (slug: string) => {
    return (articles || []).filter((a) => a.category === slug).length;
  };

  return (
    <main className="pt-24 pb-20 bg-slate-50 min-h-screen">
      {/* Header Banner */}
      <section className="bg-mahad-green-dark text-white py-16 bg-islamic-pattern relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <span className="inline-block bg-mahad-gold text-mahad-green-dark text-xs font-bold px-4 py-1.5 rounded-full mb-3 shadow">
            🏛️ Khazanah Keilmuan Ma&apos;had Aly DDI Mangkoso
          </span>
          <h1 className="font-serif font-bold text-3xl sm:text-5xl text-white tracking-tight">
            Gugus Kajian &amp; Opini Santri
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base max-w-2xl mx-auto mt-4 leading-relaxed">
            Eksplorasi seluruh klasifikasi riset hukum Islam kontemporer, ushul fikih, perbandingan madzhab, serta opini santri kader ulama.
          </p>

          {/* Search Box */}
          <div className="w-full max-w-md mt-8 relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kategori kajian (mis. Muamalah, AI, Medis)..."
              className="w-full px-5 py-3.5 pl-11 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-emerald-200/70 text-sm focus:outline-none focus:ring-2 focus:ring-mahad-gold focus:bg-white/20 transition"
            />
            <svg
              className="w-4 h-4 text-emerald-200 absolute left-4 top-1/2 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 mt-6">
            <button
              type="button"
              onClick={() => setSelectedType("all")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                selectedType === "all"
                  ? "bg-mahad-gold text-mahad-green-dark shadow"
                  : "bg-white/10 text-emerald-100 hover:bg-white/20"
              }`}
            >
              Semua ({safeCategories.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedType("fiqh")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                selectedType === "fiqh"
                  ? "bg-mahad-gold text-mahad-green-dark shadow"
                  : "bg-white/10 text-emerald-100 hover:bg-white/20"
              }`}
            >
              Kajian Fiqh Mu&apos;asarah ({safeCategories.filter((c) => c.type !== "opini").length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedType("opini")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                selectedType === "opini"
                  ? "bg-mahad-gold text-mahad-green-dark shadow"
                  : "bg-white/10 text-emerald-100 hover:bg-white/20"
              }`}
            >
              Opini &amp; Refleksi ({safeCategories.filter((c) => c.type === "opini").length})
            </button>
          </div>
        </div>
      </section>

      {/* Grid Kategori */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="font-serif font-bold text-lg text-slate-800">Kategori Tidak Ditemukan</h3>
            <p className="text-slate-500 text-sm mt-1">Coba gunakan kata kunci pencarian yang lain.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((cat) => {
              const count = getArticleCount(cat.slug);
              const isOpini = cat.type === "opini";

              return (
                <Link
                  key={cat.id}
                  href={`/kategori/${cat.slug}`}
                  className="bg-white rounded-2xl p-7 border border-slate-200 hover:border-emerald-700 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        isOpini
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {isOpini ? "✍️ Opini Santri" : "🏛️ Fiqh Takhassus"}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        {count} Tulisan
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-xl text-slate-900 group-hover:text-emerald-800 transition-colors mb-2">
                      {cat.name}
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-3">
                      {cat.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700 group-hover:text-emerald-900">
                    <span>Lihat Seluruh Artikel</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

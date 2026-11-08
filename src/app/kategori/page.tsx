"use client";

import { useState } from "react";
import Link from "next/link";
import { useArticles } from "@/context/ArticleContext";
import ArticleCard from "@/components/articles/ArticleCard";
import { kolomDariKategori } from "@/lib/content-mappers";
import type { Article, CategoryInfo, KolomArtikel } from "@/lib/types";

export default function KategoriIndexPage() {
  const { categories, articles } = useArticles();
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | KolomArtikel>("all");

  const safeCategories = Array.isArray(categories) ? categories : [];

  // Kolom kategori: pakai field kolom bila ada, selain itu turunkan dari slug.
  const kolomKategori = (cat: CategoryInfo): KolomArtikel =>
    cat.kolom ?? kolomDariKategori(cat.slug, cat.type);
  const hitungKolom = (k: KolomArtikel) =>
    safeCategories.filter((cat) => kolomKategori(cat) === k).length;

  const filteredCategories = safeCategories.filter((cat) => {
    const matchesSearch =
      cat.name.toLowerCase().includes(search.toLowerCase()) ||
      cat.description.toLowerCase().includes(search.toLowerCase());

    if (selectedType === "all") {
      return matchesSearch;
    }
    return matchesSearch && kolomKategori(cat) === selectedType;
  });

  const getArticleCount = (slug: string) => {
    // Hanya artikel terbit yang terhitung; draf tidak tampil ke publik.
    return (articles || []).filter((a) => a.category === slug && a.status !== "draft").length;
  };

  // Kolom artikel diselesaikan lewat kategorinya, sama seperti halaman
  // Mimbar, agar artikel basis data yang category-nya berupa id tetap
  // tergolong benar.
  const kategoriArtikel = (a: Article): CategoryInfo | undefined =>
    safeCategories.find((c) => c.slug === a.category || c.id === a.category);
  const kolomArtikel = (a: Article): KolomArtikel => {
    const cat = kategoriArtikel(a);
    return cat ? kolomKategori(cat) : (a.kolom ?? kolomDariKategori(a.category, a.type));
  };
  // Hasil kajian malam Sabtu (ketetapan user 8 Nov 2026): tulisan terbit
  // terbaru dari kolom Kajian Kitab dan Pengajian tampil di muka bagian
  // Kajian & Diskusi ini.
  const hasilKajianTerbaru = (articles || [])
    .filter((a) => a.status !== "draft" && kolomArtikel(a) === "kitab")
    .slice(0, 3);

  return (
    <main className="pt-32 md:pt-40 lg:pt-60 pb-20 bg-slate-50 min-h-screen">
      {/* Header Banner */}
      <section className="bg-mahad-green-dark text-white py-16 bg-islamic-pattern relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <span className="inline-block bg-mahad-gold text-mahad-green-dark text-xs font-bold px-4 py-1.5 rounded-full mb-3 shadow">
            🏛️ Khazanah Keilmuan Ma&apos;had Aly DDI Mangkoso
          </span>
          <h1 className="font-serif font-bold text-3xl sm:text-5xl text-white tracking-tight">
            Kajian &amp; Diskusi
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base max-w-2xl mx-auto mt-4 leading-relaxed">
            Ruang kajian kitab, pengajian, dan diskusi keilmuan Ma&apos;had Aly DDI Mangkoso. Hasil kajian rutin setiap malam Sabtu diterbitkan di bagian ini.
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
          <div className="flex flex-wrap items-center gap-2 mt-6">
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
            {(
              [
                { key: "fiqh", label: "Kajian Fiqh Mu'asarah" },
                { key: "kitab", label: "Kajian Kitab dan Pengajian" },
                { key: "tematik", label: "Kajian Tematik" },
                { key: "esai", label: "Esai dan Refleksi" },
                { key: "berita", label: "Berita" }
              ] as { key: KolomArtikel; label: string }[]
            ).map((pill) => (
              <button
                key={pill.key}
                type="button"
                onClick={() => setSelectedType(pill.key)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                  selectedType === pill.key
                    ? "bg-mahad-gold text-mahad-green-dark shadow"
                    : "bg-white/10 text-emerald-100 hover:bg-white/20"
                }`}
              >
                {pill.label} ({hitungKolom(pill.key)})
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Hasil Kajian Malam Sabtu */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
          <div>
            <h2 className="font-serif font-bold text-2xl text-slate-900">
              Hasil Kajian Malam Sabtu
            </h2>
            <p className="text-slate-600 text-sm mt-1 max-w-2xl">
              Tulisan terbaru dari kajian kitab dan pengajian rutin. Keputusan
              dan dokumen bahtsul masail tersimpan di ruang tersendiri.
            </p>
          </div>
          <Link
            href="/bahtsul-masail"
            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition"
          >
            Ruang Bahtsul Masail &rarr;
          </Link>
        </div>
        {hasilKajianTerbaru.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hasilKajianTerbaru.map((art) => (
              <ArticleCard key={art.id} article={art} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-600 text-sm">
            Hasil kajian malam Sabtu akan tampil di sini setelah diterbitkan.
          </div>
        )}
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

"use client";

import { use } from "react";
import Link from "next/link";
import { useArticles } from "@/context/ArticleContext";
import ArticleCard from "@/components/articles/ArticleCard";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = use(params);
  const { categories, articles } = useArticles();

  const cleanSlug = decodeURIComponent(slug || "").toLowerCase().trim();
  const categoryInfo = (categories || []).find(
    (c) => c.slug?.toLowerCase() === cleanSlug || c.id === slug
  );

  const categoryArticles = (articles || []).filter(
    (a) =>
      a.category?.toLowerCase() === cleanSlug ||
      a.category === categoryInfo?.id ||
      a.category === categoryInfo?.slug
  );

  if (!categoryInfo) {
    return (
      <main className="pt-28 pb-20 bg-slate-50 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-5xl mb-4">📚</div>
          <h1 className="font-serif font-bold text-2xl text-slate-800">
            Kategori Sedang Diperbarui
          </h1>
          <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
            Kategori &ldquo;{cleanSlug}&rdquo; tidak ditemukan atau sedang dalam proses pembaharuan oleh dewan redaksi.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/kategori"
              className="px-5 py-2.5 bg-mahad-gold text-mahad-green-dark font-bold text-xs rounded-full shadow hover:bg-yellow-400 transition"
            >
              Jelajahi Semua Kategori
            </Link>
            <Link
              href="/"
              className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-full hover:bg-slate-200 transition"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-24 pb-20 bg-slate-50 min-h-screen">
      <section className="bg-mahad-green-dark text-white py-14 bg-islamic-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <div className="mb-4">
            <Link
              href="/kategori"
              className="inline-flex items-center gap-2 text-xs text-emerald-100 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-full transition border border-white/15"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Kembali ke Semua Gugus Kajian</span>
            </Link>
          </div>

          <span className="inline-block bg-mahad-gold text-mahad-green-dark text-xs font-bold px-3.5 py-1 rounded-full mb-3 shadow-xs">
            {categoryInfo.slug.includes("opini") ||
            categoryInfo.slug.includes("sosial-budaya") ||
            categoryInfo.slug.includes("refleksi") ||
            categoryInfo.slug.includes("kolom")
              ? "Kategori Opini & Refleksi"
              : categoryInfo.slug === "karya-anregurutta"
              ? "Koleksi Turats & Pemikiran Anregurutta"
              : "Kategori Kajian Fiqh Mu'asarah"}
          </span>

          <h1 className="font-serif font-bold text-3xl sm:text-5xl text-white tracking-tight">
            {categoryInfo.name}
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base max-w-2xl mx-auto mt-3 leading-relaxed">
            {categoryInfo.description}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
          <p className="text-sm text-slate-500 font-medium">
            Menampilkan <strong className="text-slate-800">{categoryArticles.length}</strong> tulisan dalam kategori ini
          </p>
          <Link
            href="/kirim-tulisan"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
          >
            <span>Kirim Tulisan Anda</span>
            <span>→</span>
          </Link>
        </div>

        {categoryArticles.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 max-w-xl mx-auto p-8 shadow-sm">
            <div className="text-4xl mb-3">📝</div>
            <h3 className="font-serif font-bold text-lg text-slate-800">
              Belum Ada Artikel Diterbitkan
            </h3>
            <p className="text-slate-500 text-sm mt-1">
              Jadilah yang pertama mengirimkan naskah kajian fiqh atau opini ilmiah untuk kategori ini.
            </p>
            <div className="mt-6">
              <Link
                href="/kirim-tulisan"
                className="inline-block bg-mahad-gold text-mahad-green-dark text-xs font-bold px-5 py-2.5 rounded-full shadow hover:bg-yellow-400 transition"
              >
                Kirim Naskah Tulisan
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categoryArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
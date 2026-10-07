"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { useArticles } from "@/context/ArticleContext";
import ArticleCard from "@/components/articles/ArticleCard";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = use(params);
  const { categories, articles } = useArticles();

  const categoryInfo = categories.find((c) => c.slug === slug);

  if (!categoryInfo) {
    notFound();
  }

  const categoryArticles = articles.filter((a) => a.category === slug);

  return (
    <main className="pt-24 pb-20 bg-slate-50 min-h-screen">
      <section className="bg-mahad-green-dark text-white py-14 bg-islamic-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <div className="mb-4">
            <Link
              href="/artikel"
              className="inline-flex items-center gap-2 text-xs text-emerald-100 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-full transition border border-white/15"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Kembali ke Semua Kajian &amp; Opini</span>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold border-b pb-3">
          <span>Menampilkan <strong>{categoryArticles.length}</strong> Tulisan Terbit</span>
          <Link href="/kirim-tulisan" className="text-emerald-800 font-bold hover:underline">
            + Kirim Tulisan dalam Kategori Ini
          </Link>
        </div>

        {categoryArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryArticles.map((art) => (
              <ArticleCard key={art.id} article={art} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <p className="text-slate-600 font-medium">
              Belum ada artikel yang diterbitkan dalam kategori ini.
            </p>
            <Link
              href="/kirim-tulisan"
              className="inline-block px-5 py-2.5 bg-emerald-800 text-white rounded-xl text-xs font-bold"
            >
              Jadilah yang Pertama Menulis
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
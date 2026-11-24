"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { useArticles } from "@/context/ArticleContext";
import ArticleCard from "@/components/articles/ArticleCard";

// Ruang hasil Kajian Fathul Qorib di dalam Kajian & Diskusi
// (struktur ruang per ketetapan user 15 Nov 2026: setiap hasil kajian
// tinggal di ruangnya sendiri di bawah /kategori/<ruang>). Isi ruang
// dibaca dari artikel terbit bertanda seri ini, supaya hasil
// kajian berikutnya yang diterbitkan masuk ke ruang ini dengan
// sendirinya tanpa menumpuk di indeks /kategori.
//
// Ejaan kanonis nama ruang di seluruh situs adalah "Fathul Qorib",
// tetapi artikel yang sudah terbit bertanda ejaan "Fathul Qarib".
// Saringan menerima kedua ejaan (huruf besar/kecil dan spasi tepi
// diabaikan) supaya artikel yang tampil sekarang tidak hilang dan
// artikel bertanda ejaan kanonis ikut masuk ruang ini.
const TAG_RUANG = ["fathul qorib", "fathul qarib"];

export default function KajianFathulQoribPage() {
  const { articles, isCatalogReady } = useArticles();
  const tulisan = articles.filter(
    (a) =>
      a.status !== "draft" &&
      (a.tags || []).some((t) => TAG_RUANG.includes(t.trim().toLowerCase()))
  );

  return (
    <main className="pt-32 md:pt-40 lg:pt-60 pb-20 bg-slate-50 min-h-screen">
      {/* Hero */}
      <section className="bg-mahad-green-dark text-white py-14 bg-islamic-pattern relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="text-xs font-bold uppercase tracking-widest text-mahad-gold bg-white/10 px-3.5 py-1 rounded-full inline-flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Kajian Kitab</span>
          </span>
          <h1 className="font-serif font-bold text-3xl sm:text-5xl text-white mt-3">
            Kajian Fathul Qorib
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base max-w-2xl mx-auto mt-3 leading-relaxed">
            Hasil pembacaan dan pembahasan kitab Fathul Qorib dalam
            kajian rutin Ma&apos;had Aly DDI Mangkoso, meliputi bahasan
            fikih ibadah beserta kajian nahwu dan sharaf yang menyertainya.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Penanda cabang: ruang hasil ini bagian dari Kajian & Diskusi */}
        <nav aria-label="Jejak ruang" className="text-xs sm:text-sm text-slate-500">
          <Link href="/kategori" className="text-emerald-800 font-bold hover:underline rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600">
            Kajian &amp; Diskusi
          </Link>
          <span className="mx-2" aria-hidden="true">/</span>
          <span>Kajian Fathul Qorib</span>
        </nav>

        {/* Daftar hasil kajian yang terbit */}
        <section>
          <h2 className="font-serif font-bold text-2xl leading-snug text-slate-900">
            Hasil Kajian yang Diterbitkan
          </h2>
          {tulisan.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
              {tulisan.map((art) => (
                <ArticleCard key={art.id} article={art} />
              ))}
            </div>
          ) : !isCatalogReady ? (
            <p className="text-sm text-slate-600 leading-relaxed mt-3">
              Memuat hasil kajian, mohon tunggu sebentar.
            </p>
          ) : (
            <p className="text-sm text-slate-600 leading-relaxed mt-3">
              Belum ada hasil kajian yang diterbitkan di ruang ini.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

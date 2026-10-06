"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useArticles } from "@/context/ArticleContext";
import ThesisCard from "@/components/theses/ThesisCard";

interface ThesisDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default function ThesisDetailPage({ params }: ThesisDetailPageProps) {
  const { slug } = use(params);
  const { theses } = useArticles();

  const thesis = theses.find((t) => t.slug === slug);

  if (!thesis) {
    notFound();
  }

  const relatedTheses = theses
    .filter((t) => t.category === thesis.category && t.id !== thesis.id)
    .slice(0, 2);

  return (
    <main className="pt-24 pb-20 bg-slate-50 min-h-screen">
      {/* Header Banner */}
      <section className="bg-mahad-green-dark text-white py-12 bg-islamic-pattern">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/skripsi"
            className="inline-flex items-center gap-1.5 text-xs text-mahad-gold-light hover:text-mahad-gold mb-5 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Kembali ke Repositori Skripsi</span>
          </Link>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="bg-mahad-gold text-mahad-green-dark text-xs font-bold px-3 py-0.5 rounded-full">
              {thesis.categoryLabel}
            </span>
            <span className="bg-white/10 text-emerald-200 text-xs px-3 py-0.5 rounded-full">
              Tahun Kelulusan {thesis.year}
            </span>
          </div>

          <h1 className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-white leading-snug">
            {thesis.title}
          </h1>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Metadata Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs sm:text-sm">
          <div className="space-y-3">
            <div>
              <span className="text-slate-400 block text-[11px] uppercase font-bold tracking-wider">Penulis / Mahasantri</span>
              <p className="font-bold text-slate-900 text-base">{thesis.author}</p>
              <p className="text-slate-500">NIM: {thesis.nim} &bull; {thesis.angkatan}</p>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] uppercase font-bold tracking-wider">Jenjang &amp; Takhassus</span>
              <p className="font-semibold text-slate-800">Marhalah Ula (M.1) &bull; Fiqh wa Usuluhu</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-slate-400 block text-[11px] uppercase font-bold tracking-wider">Dewan Pembimbing</span>
              <p className="font-semibold text-slate-800">1. {thesis.advisor1}</p>
              <p className="font-semibold text-slate-800">2. {thesis.advisor2}</p>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] uppercase font-bold tracking-wider">Berkas Naskah PDF</span>
              <p className="text-slate-700">Tersedia Full Text &bull; Ukuran: <strong>{thesis.fileSize}</strong></p>
            </div>
          </div>
        </div>

        {/* Download Action Banner */}
        <div className="bg-gradient-to-r from-emerald-900 to-emerald-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-mahad-gold/30">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-serif font-bold text-xl text-mahad-gold">Unduh Naskah Lengkap Skripsi</h3>
            <p className="text-xs text-emerald-200">
              Akses publik file PDF melalui penyimpanan resmi Google Drive Ma&apos;had Aly DDI Mangkoso.
            </p>
          </div>
          <a
            href={thesis.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 bg-mahad-gold hover:bg-yellow-400 text-mahad-green-dark font-bold px-6 py-3.5 rounded-xl shadow-lg transition flex items-center gap-2 transform hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>📥 Unduh PDF ({thesis.fileSize})</span>
          </a>
        </div>

        {/* Abstrak Indonesia */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-emerald-900 font-serif font-bold text-lg border-b border-slate-100 pb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-mahad-gold"></span>
            <h2>Abstrak (Bahasa Indonesia)</h2>
          </div>
          <p className="text-slate-700 text-sm sm:text-base leading-relaxed text-justify">
            {thesis.abstractId}
          </p>
          <div className="pt-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-slate-500">Kata Kunci:</span>
            {thesis.keywords.map((kw, i) => (
              <span key={i} className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-medium">
                {kw}
              </span>
            ))}
          </div>
        </div>

        {/* Abstrak Arab */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3" dir="rtl">
          <div className="flex items-center gap-2 text-emerald-900 font-serif font-bold text-xl border-b border-slate-100 pb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-mahad-gold"></span>
            <h2>ملخص البحث (باللغة العربية)</h2>
          </div>
          <p className="font-serif text-slate-800 text-lg leading-loose text-justify">
            {thesis.abstractAr}
          </p>
        </div>

        {/* Related Theses */}
        {relatedTheses.length > 0 && (
          <div className="space-y-4 pt-6">
            <h3 className="font-serif font-bold text-xl text-slate-900">
              Riset Terkait dalam Kategori Serupa
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedTheses.map((rel) => (
                <ThesisCard key={rel.id} thesis={rel} />
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}

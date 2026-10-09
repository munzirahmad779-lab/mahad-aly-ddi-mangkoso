"use client";

import Link from "next/link";
import { useArticles } from "@/context/ArticleContext";

export default function TentangPage() {
  const { aboutPageContent } = useArticles();
  const c = aboutPageContent;

  return (
    <main className="pt-32 md:pt-36 pb-20 bg-slate-50">
      {/* Header Halaman */}
      <section className="bg-mahad-green-dark text-white py-16 bg-islamic-pattern">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-mahad-gold bg-white/10 px-4 py-1 rounded-full">
            {c?.badge || "Tentang Lembaga"}
          </span>
          <h1 className="font-serif font-bold text-3xl sm:text-5xl text-white mt-4 mb-3">
            {c?.title || "Profil Ma'had Aly DDI Mangkoso"}
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base max-w-2xl mx-auto">
            {c?.subtitle || "Mencetak Ulama Pewaris Para Nabi Berwawasan Wasathiyyah dan Berintegritas Turats."}
          </p>
        </div>
      </section>

      {/* Konten Utama */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        {/* Sejarah Berdiri */}
        <section className="bg-white rounded-2xl p-8 sm:p-10 border border-slate-200 shadow-sm space-y-4">
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-emerald-950 flex items-center gap-3">
            <span className="w-2.5 h-8 bg-mahad-gold rounded-full inline-block"></span>
            <span>{c?.historyTitle || "Sejarah Lembaga"}</span>
          </h2>
          {c?.historyArabic && (
            <p
              className="font-serif text-lg text-emerald-900 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 text-right leading-loose"
              dir="rtl"
            >
              {c.historyArabic}
            </p>
          )}
          <div className="text-slate-700 leading-relaxed space-y-3 whitespace-pre-line">
            {c?.historyNarrative}
          </div>
        </section>

        {/* Visi & Misi */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-emerald-900 text-white rounded-2xl p-8 border border-emerald-800 shadow-md">
            <h3 className="font-serif font-bold text-xl text-mahad-gold mb-3">Visi Kelembagaan</h3>
            <p className="text-emerald-100 text-sm leading-relaxed">{c?.visi}</p>
          </div>
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
            <h3 className="font-serif font-bold text-xl text-emerald-950 mb-3">Misi Utama</h3>
            <ul className="space-y-2 text-sm text-slate-700 list-disc list-inside leading-relaxed">
              {c?.misi?.map((m, idx) => (
                <li key={idx}>{m}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* Sistem Halaqah & Beasiswa */}
        <section className="bg-white rounded-2xl p-8 sm:p-10 border border-slate-200 shadow-sm space-y-6">
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-emerald-950 flex items-center gap-3">
            <span className="w-2.5 h-8 bg-mahad-gold rounded-full inline-block"></span>
            <span>Sistem Pendidikan &amp; Beasiswa</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-slate-700">
            <div className="space-y-2 bg-slate-50 p-5 rounded-xl border border-slate-100">
              <h4 className="font-bold text-emerald-900 text-base">{c?.halaqahTitle || "Sistem Halaqah Murni"}</h4>
              <p className="leading-relaxed text-slate-600">{c?.halaqahDesc}</p>
            </div>
            <div className="space-y-2 bg-slate-50 p-5 rounded-xl border border-slate-100">
              <h4 className="font-bold text-emerald-900 text-base">{c?.beasiswaTitle || "Beasiswa Penuh 100%"}</h4>
              <p className="leading-relaxed text-slate-600">{c?.beasiswaDesc}</p>
            </div>
            <div className="space-y-2 bg-slate-50 p-5 rounded-xl border border-slate-100">
              <h4 className="font-bold text-emerald-900 text-base">
                {c?.kurikulumTitle || "Jenjang Marhalah Ula (M.1)"}
              </h4>
              <p className="leading-relaxed text-slate-600">{c?.kurikulumDesc}</p>
            </div>
          </div>
        </section>

        {/* CTA Kembali */}
        <div className="text-center pt-4">
          <Link
            href="/#mimbar-kajian"
            className="inline-flex items-center gap-2 bg-mahad-gold text-mahad-green-dark font-bold px-8 py-3.5 rounded-full shadow hover:bg-yellow-400 transition"
          >
            <span>Jelajahi Karya &amp; Kajian Mahasantri</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </main>
  );
}
"use client";

import { useState } from "react";
import Link from "next/link";
import { useArticles } from "@/context/ArticleContext";
import { 
  BookOpen, 
  Search, 
  Download, 
  Calendar, 
  User, 
  FileText, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Scale, 
  Sparkles,
  ExternalLink
} from "lucide-react";

export default function BahtsulMasailPage() {
  const { bahtsulQA, pageTexts } = useArticles();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("Semua");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter hanya yang berstatus published
  const publishedList = bahtsulQA.filter((item) => item.status === "published");

  // Dapatkan semua daftar tema yang unik
  const themes = ["Semua", ...Array.from(new Set(publishedList.map((item) => item.theme)))];

  // Filter berdasarkan search & tema
  const filteredList = publishedList.filter((item) => {
    const matchTheme = selectedTheme === "Semua" || item.theme === selectedTheme;
    const matchSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.arabicReferences && item.arabicReferences.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchTheme && matchSearch;
  });

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <main className="pt-24 pb-20 bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-mahad-green-dark text-white py-14 bg-islamic-pattern relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="text-xs font-bold uppercase tracking-widest text-mahad-gold bg-white/10 px-3.5 py-1 rounded-full inline-flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5" />
            <span>Lembaga Bahtsul Masail (LBM)</span>
          </span>
          <h1 className="font-serif font-bold text-3xl sm:text-5xl text-white mt-3">
            Keputusan &amp; Risalah Bahtsul Masail
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base max-w-2xl mx-auto mt-3 leading-relaxed">
            Pusat telaah fatwa hukum Islam kontemporer, perumusan istinbath berbasis turats kitab mu&apos;tabarah, dan arsip mudzakarah ilmiah Ma&apos;had Aly DDI Mangkoso.
          </p>

          {/* Kolom Pencarian */}
          <div className="max-w-xl mx-auto mt-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari tema, pertanyaan hukum, atau kata kunci..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white text-slate-800 rounded-xl shadow-lg border-0 text-sm focus:ring-2 focus:ring-mahad-gold placeholder:text-slate-400"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* Konten Utama */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filter Tema / Kategori */}
        <div className="flex flex-wrap items-center gap-2 pb-6 border-b border-slate-200">
          <span className="text-xs font-bold text-slate-500 mr-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tema Fatwa:</span>
          </span>
          {themes.map((theme) => (
            <button
              key={theme}
              type="button"
              onClick={() => setSelectedTheme(theme)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition shadow-2xs ${
                selectedTheme === theme
                  ? "bg-emerald-800 text-white"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {theme}
            </button>
          ))}
        </div>

        {/* Daftar Keputusan Bahtsul Masail */}
        <div className="mt-8 space-y-6">
          {filteredList.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-serif font-bold text-lg text-slate-800">
                Tidak ada risalah fatwa yang cocok
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Silakan ganti kata kunci pencarian atau pilih tema lainnya.
              </p>
            </div>
          ) : (
            filteredList.map((item) => {
              const isExpanded = expandedId === item.id;

              return (
                <article
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition duration-200"
                >
                  {/* Header Kartu */}
                  <div
                    onClick={() => toggleExpand(item.id)}
                    className="p-6 cursor-pointer flex items-start justify-between gap-4 hover:bg-slate-50/70 transition"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                          {item.theme}
                        </span>
                        <span className="text-slate-400 text-xs flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{item.date}</span>
                        </span>
                        {item.attachmentUrl && (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span>📎 Risalah PDF</span>
                          </span>
                        )}
                      </div>

                      <h2 className="font-serif font-bold text-lg sm:text-xl text-slate-900 leading-snug">
                        {item.title}
                      </h2>

                      <p className="text-xs sm:text-sm text-slate-600 line-clamp-2">
                        <strong>Mas&apos;alah:</strong> {item.question}
                      </p>
                    </div>

                    <div className="shrink-0 pt-1">
                      <button
                        type="button"
                        aria-label="Toggle details"
                        className="w-8 h-8 rounded-full bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-800 flex items-center justify-center transition"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Detail Lengkap (Buka / Tutup) */}
                  {isExpanded && (
                    <div className="px-6 pb-6 pt-2 border-t border-slate-100 space-y-6 bg-slate-50/40">
                      {/* Gambar Dokumentasi / Rujukan (Opsional) */}
                      {item.imageUrl && (
                        <div className="rounded-xl overflow-hidden border border-slate-200 max-h-72 bg-white">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      )}

                      {/* Deskripsi Masalah */}
                      <div className="p-4 bg-amber-50/60 border border-amber-200/70 rounded-xl space-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block">
                          ❓ Mas&apos;alah (Deskripsi Masalah / Pertanyaan):
                        </span>
                        <p className="text-xs sm:text-sm text-amber-950 leading-relaxed">
                          {item.question}
                        </p>
                      </div>

                      {/* Jawaban / Keputusan Hukum */}
                      <div className="p-4 bg-emerald-50/60 border border-emerald-200/70 rounded-xl space-y-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 block flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Keputusan Hukum &amp; Istinbath:</span>
                        </span>
                        <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed whitespace-pre-line">
                          {item.answer}
                        </p>
                      </div>

                      {/* Maraji' & Dalil Turats (Arab) jika tersedia */}
                      {item.arabicReferences && (
                        <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                            📖 Maraji&apos; Turats &amp; Nash Rujukan:
                          </span>
                          <p
                            className="font-serif text-lg sm:text-xl text-slate-800 leading-loose text-right"
                            dir="rtl"
                          >
                            {item.arabicReferences}
                          </p>
                        </div>
                      )}

                      {/* Baris Bawah: Pengesah & Unduh Lampiran */}
                      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-emerald-800" />
                          <span>Perumus: <strong>{item.author}</strong></span>
                        </div>

                        {item.attachmentUrl && (
                          <a
                            href={item.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-bold transition shadow-xs w-fit"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>{item.attachmentName || "Unduh Risalah Keputusan (PDF)"}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}

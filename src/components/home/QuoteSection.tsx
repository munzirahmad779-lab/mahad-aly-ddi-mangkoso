"use client";

import Image from "next/image";
import { useArticles } from "@/context/ArticleContext";

export default function QuoteSection() {
  const { settings } = useArticles();
  const quote = settings?.quote;

  const arabic = quote?.arabicQuote || "مَنْ يُرِدِ اللَّهُ بِهِ خَيْرًا يُفَقِّهْهُ فِي الدِّينِ";
  const translation = quote?.translation || "Ilmu itu ibarat pelita. Tuntutlah ia dengan keikhlasan, amalkan dengan kasih sayang, agar cahayanya senantiasa menerangi kemaslahatan ummat.";
  const source = quote?.source || "Kata Mutiara Anregurutta";
  const context = quote?.context || "Pondok Pesantren DDI Mangkoso";
  const hasImage = Boolean(quote?.showImage && quote?.imageUrl?.trim());
  const imageUrl = quote?.imageUrl || "";

  return (
    <section className="relative py-16 sm:py-20 bg-linear-to-r from-mahad-gold via-yellow-400 to-mahad-gold text-mahad-green-dark shadow-inner overflow-hidden">
      {/* Ornamen latar belakang samar */}
      <div className="absolute inset-0 opacity-10 bg-islamic-pattern pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-6">
        {hasImage ? (
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Foto Tokoh / Kaligrafi Berbingkai Elegan */}
            <div className="shrink-0">
              <div className="relative w-36 h-36 sm:w-48 sm:h-48 rounded-2xl md:rounded-3xl overflow-hidden border-4 border-emerald-900/20 shadow-xl bg-white/40">
                <img
                  src={imageUrl}
                  alt={source}
                  className="w-full h-full object-cover object-top"
                  loading="lazy"
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-2xl md:rounded-3xl pointer-events-none" />
              </div>
            </div>

            {/* Konten Kalam Hikmah */}
            <div className="flex-1 text-center md:text-left space-y-4">
              {arabic && (
                <p className="font-serif text-2xl sm:text-3xl text-mahad-green-dark/95 leading-loose" dir="rtl">
                  {arabic}
                </p>
              )}

              <blockquote className="font-serif italic font-bold text-lg sm:text-2xl md:text-3xl leading-snug text-mahad-green-dark">
                &ldquo;{translation}&rdquo;
              </blockquote>

              <div className="pt-2 flex items-center justify-center md:justify-start gap-3">
                <span className="h-0.5 w-8 bg-mahad-green-dark/40 rounded-full"></span>
                <div>
                  <p className="font-bold text-sm tracking-wider uppercase text-mahad-green-dark">
                    {source}
                  </p>
                  {context && (
                    <p className="text-xs text-mahad-green-dark/80 font-medium">
                      {context}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto text-center space-y-4">
            {arabic && (
              <p className="font-serif text-2xl sm:text-3xl text-mahad-green-dark/90 leading-loose" dir="rtl">
                {arabic}
              </p>
            )}

            <blockquote className="font-serif italic font-bold text-xl sm:text-2xl md:text-3xl leading-snug max-w-3xl mx-auto text-mahad-green-dark">
              &ldquo;{translation}&rdquo;
            </blockquote>

            <div className="pt-2 flex items-center justify-center gap-3">
              <span className="h-0.5 w-12 bg-mahad-green-dark/40 rounded-full"></span>
              <div>
                <p className="font-bold text-sm tracking-wider uppercase text-mahad-green-dark">
                  {source}
                </p>
                {context && (
                  <p className="text-xs text-mahad-green-dark/80 font-medium">
                    {context}
                  </p>
                )}
              </div>
              <span className="h-0.5 w-12 bg-mahad-green-dark/40 rounded-full"></span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
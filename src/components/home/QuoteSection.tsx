"use client";

import { useArticles } from "@/context/ArticleContext";

export default function QuoteSection() {
  const { settings } = useArticles();
  const quote = settings?.quote;

  const arabic = quote?.arabicQuote || "مَنْ يُرِدِ اللَّهُ بِهِ خَيْرًا يُفَقِّهْهُ فِي الدِّينِ";
  const translation = quote?.translation || "Ilmu itu ibarat pelita. Tuntutlah ia dengan keikhlasan, amalkan dengan kasih sayang, agar cahayanya senantiasa menerangi kemaslahatan ummat.";
  const source = quote?.source || "Kata Mutiara Anregurutta";
  const context = quote?.context || "Pondok Pesantren DDI Mangkoso";

  return (
    <section className="relative py-20 bg-linear-to-r from-mahad-gold via-yellow-400 to-mahad-gold text-mahad-green-dark shadow-inner">
      <div className="max-w-4xl mx-auto px-6 text-center space-y-4">
        {/* Teks Arab (RTL) jika tersedia */}
        {arabic && (
          <p className="font-serif text-2xl sm:text-3xl text-mahad-green-dark/90 leading-loose" dir="rtl">
            {arabic}
          </p>
        )}

        {/* Teks Kalam Mutiara / Terjemahan */}
        <blockquote className="font-serif italic font-bold text-xl sm:text-2xl md:text-3xl leading-snug max-w-3xl mx-auto text-mahad-green-dark">
          &ldquo;{translation}&rdquo;
        </blockquote>

        {/* Atribusi Sumber */}
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
    </section>
  );
}
import Link from "next/link";
import { Article } from "@/lib/types";

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const isAnregurutta = article.category === "karya-anregurutta";

  return (
    <article
      className={`bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden border ${
        isAnregurutta
          ? "border-2 border-mahad-gold shadow-md"
          : "border-slate-200 hover:border-emerald-700"
      }`}
    >
      <div>
        {/* Banner Emas Khusus Karya Anregurutta */}
        {isAnregurutta && (
          <div className="bg-linear-to-r from-mahad-gold to-yellow-300 py-1.5 px-5 flex items-center justify-between text-mahad-green-dark font-bold text-xs uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>Koleksi Turats Utama</span>
            </span>
            <span className="bg-mahad-green-dark text-mahad-gold px-2 py-0.5 rounded-full text-[10px]">
              Istimewa
            </span>
          </div>
        )}

        <div className="p-6">
          {/* Badge Kategori */}
          <Link
            href={`/kategori/${article.category}`}
            className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-3 transition-colors ${
              isAnregurutta
                ? "bg-amber-100 text-amber-900 hover:bg-amber-200"
                : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
            }`}
          >
            {article.categoryLabel}
          </Link>

          {/* Judul Artikel */}
          <h3 className="font-serif font-bold text-xl sm:text-2xl text-slate-900 leading-snug mb-3 hover:text-emerald-800 transition-colors">
            <Link href={`/artikel/${article.slug}`}>{article.title}</Link>
          </h3>

          {/* Ringkasan Abstrak */}
          <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-3">
            {article.excerpt}
          </p>
        </div>
      </div>

      {/* Footer Penulis & Aksi Baca */}
      <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs text-slate-500">
        <div>
          <p className="font-semibold text-slate-800">{article.author}</p>
          <p className="text-[11px] text-slate-400">{article.date}</p>
        </div>
        <Link
          href={`/artikel/${article.slug}`}
          className="font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 group"
        >
          <span>Baca Kajian</span>
          <svg className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </article>
  );
}
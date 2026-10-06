import { notFound } from "next/navigation";
import Link from "next/link";
import { ARTICLES } from "@/lib/mock-data";

interface ArticleDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const { slug } = await params;
  const article = ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  return (
    <main className="pt-24 pb-20 bg-slate-50 min-h-screen">
      
      {/* Header Artikel */}
      <section className="bg-mahad-green-dark text-white py-14 bg-islamic-pattern">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/#mimbar-kajian"
            className="inline-flex items-center gap-1.5 text-xs text-mahad-gold-light hover:text-mahad-gold mb-6 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Kembali ke Mimbar Kajian</span>
          </Link>

          <span className="inline-block text-xs font-bold uppercase tracking-wider bg-mahad-gold text-mahad-green-dark px-3 py-1 rounded-full mb-3">
            {article.categoryLabel}
          </span>

          <h1 className="font-serif font-bold text-2xl sm:text-4xl lg:text-5xl text-white leading-tight">
            {article.title}
          </h1>

          <div className="mt-6 pt-6 border-t border-emerald-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-emerald-200">
            <div>
              <p className="font-bold text-white text-sm">{article.author}</p>
              <p className="text-emerald-300">{article.authorRole}</p>
            </div>
            <div className="text-right">
              <p>{article.date} ({article.hijriDate})</p>
              <p className="text-mahad-gold">Waktu baca: &plusmn; {article.readTime}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Badan Tulisan */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-6">
          
          {/* Kotak Abstrak */}
          <div className="bg-emerald-50 border-l-4 border-emerald-700 p-5 rounded-r-xl">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1">
              Pokok Pikiran &amp; Abstrak
            </h4>
            <p className="text-slate-700 text-sm italic leading-relaxed">
              {article.excerpt}
            </p>
          </div>

          {/* Isi Teks */}
          <div className="text-slate-800 leading-relaxed text-base sm:text-lg space-y-5 whitespace-pre-line font-sans">
            {article.content}
          </div>

          {/* Disclaimer Redaksi */}
          <div className="mt-10 pt-6 border-t border-slate-200 text-xs text-slate-500 italic">
            * Naskah ini telah melalui proses telaah ilmiah pada Dewan Redaksi Mimbar Kajian Ma&apos;had Aly DDI Mangkoso.
          </div>

        </div>
      </article>

    </main>
  );
}
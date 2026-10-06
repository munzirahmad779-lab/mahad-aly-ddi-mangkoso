import { notFound } from "next/navigation";
import Link from "next/link";
import { ARTICLES, CATEGORIES } from "@/lib/mock-data";
import ArticleCard from "@/components/articles/ArticleCard";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const categoryInfo = CATEGORIES.find((c) => c.slug === slug);

  if (!categoryInfo) {
    notFound();
  }

  const categoryArticles = ARTICLES.filter((a) => a.category === slug);

  return (
    <main className="pt-24 pb-20 bg-slate-50 min-h-screen">
      <section className="bg-mahad-green-dark text-white py-14 bg-islamic-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link
            href="/#mimbar-kajian"
            className="inline-flex items-center gap-1.5 text-xs text-mahad-gold-light hover:text-mahad-gold mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Kembali ke Semua Kajian</span>
          </Link>
          <h1 className="font-serif font-bold text-3xl sm:text-4xl text-white">
            {categoryInfo.name}
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base max-w-2xl mx-auto mt-2">
            {categoryInfo.description}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6 flex items-center justify-between text-xs text-slate-500 font-semibold">
          <span>Menampilkan {categoryArticles.length} Tulisan</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryArticles.map((art) => (
            <ArticleCard key={art.id} article={art} />
          ))}
        </div>
      </div>
    </main>
  );
}
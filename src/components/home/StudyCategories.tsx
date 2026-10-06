import Link from "next/link";
import { CATEGORIES } from "@/lib/mock-data";

export default function StudyCategories() {
  return (
    <section className="py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3.5 py-1 rounded-full">
            Takhassus Keilmuan
          </span>
          <h2 className="font-serif font-bold text-3xl sm:text-4xl text-slate-900 mt-3">
            Disiplin Utama Kajian
          </h2>
          <div className="h-1.5 w-16 bg-mahad-gold mx-auto mt-3 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/kategori/${cat.slug}`}
              className="bg-white rounded-2xl p-8 border border-slate-200 hover:border-emerald-700 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-mahad-gold">
                  Kategori Utama
                </span>
                <h3 className="font-serif font-bold text-2xl text-slate-900 mt-2 mb-3 group-hover:text-emerald-800 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {cat.description}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-bold text-emerald-700 flex items-center gap-1">
                <span>Lihat Semua Artikel</span>
                <svg className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
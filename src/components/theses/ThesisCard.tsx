import Link from "next/link";
import { Thesis } from "@/lib/types";

interface ThesisCardProps {
  thesis: Thesis;
}

export default function ThesisCard({ thesis }: ThesisCardProps) {
  return (
    <article className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-emerald-700 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
      <div>
        {/* Header Metadata */}
        <div className="flex items-center justify-between gap-2 text-xs mb-3">
          <span className="bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1 rounded-md border border-emerald-100">
            {thesis.categoryLabel}
          </span>
          <span className="text-slate-500 font-semibold">Tahun {thesis.year}</span>
        </div>

        {/* Title */}
        <h3 className="font-serif font-bold text-lg sm:text-xl text-slate-900 leading-snug mb-3 group-hover:text-emerald-800 transition-colors">
          <Link href={`/skripsi/${thesis.slug}`}>{thesis.title}</Link>
        </h3>

        {/* Author & NIM */}
        <div className="text-xs text-slate-600 mb-3 space-y-0.5">
          <p className="font-semibold text-slate-800 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-mahad-gold shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>{thesis.author}</span>
          </p>
          <p className="text-slate-400 pl-5">NIM: {thesis.nim} &bull; {thesis.angkatan}</p>
        </div>

        {/* Abstract Preview */}
        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-3 mb-4">
          {thesis.abstractId}
        </p>
      </div>

      {/* Footer & Actions */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
        <span className="text-slate-400 font-medium flex items-center gap-1">
          <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <span>PDF ({thesis.fileSize})</span>
        </span>

        <div className="flex items-center gap-2">
          <Link
            href={`/skripsi/${thesis.slug}`}
            className="font-bold text-emerald-800 hover:text-emerald-950 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition"
          >
            Lihat Abstrak
          </Link>
          <a
            href={thesis.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold bg-mahad-gold hover:bg-yellow-400 text-mahad-green-dark px-3 py-1.5 rounded-lg transition shadow-sm inline-flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Unduh</span>
          </a>
        </div>
      </div>
    </article>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Download,
  FileText,
  HelpCircle,
  Scale
} from "lucide-react";
import { MASAIL, PDF_SK_LENGKAP } from "../data";

const SLUG = "masalah-2-jual-beli-seafood";

const item = MASAIL.find((m) => m.slug === SLUG)!;
const sebelumnya = MASAIL.find((m) => m.slug === "masalah-1-nisab-zakat-mal");
const berikutnya = MASAIL.find((m) => m.slug === "masalah-3-ittihad-al-baldah");

export const metadata: Metadata = {
  title: `${item.judulSingkat} - Hasil Bahtsul Masa'il Jilid II`,
  description: item.spoiler,
  alternates: { canonical: `/kategori/bahtsul-masail-jilid-ii/${SLUG}` }
};

export default function Masalah2SeafoodPage() {
  return (
    <main className="pt-32 md:pt-40 lg:pt-60 pb-20 bg-slate-50 min-h-screen">
      {/* Hero */}
      <section className="bg-mahad-green-dark text-white py-14 bg-islamic-pattern relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="text-xs font-bold uppercase tracking-widest text-mahad-gold bg-white/10 px-3.5 py-1 rounded-full inline-flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5" />
            <span>Mas&apos;alah {item.nomor} - Hasil Bahtsul Masa&apos;il Jilid II</span>
          </span>
          {item.headline && (
            <p className="font-serif italic font-bold text-mahad-gold text-xl sm:text-2xl mt-4">
              &ldquo;{item.headline}&rdquo;
            </p>
          )}
          <h1 className="font-serif font-bold text-3xl sm:text-5xl text-white mt-2 leading-snug">
            {item.judul}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-5 text-xs sm:text-sm">
            <span className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
              <FileText className="w-3.5 h-3.5" />
              SK Ketua Panitia Nomor 276/SK/Pan-BM/III/1448
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
              <Calendar className="w-3.5 h-3.5" />
              Jalsah Pertama s.d. Ketiga, 22-24 Agustus 2026
            </span>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Deskripsi Masalah */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <h2 className="font-serif font-bold text-xl sm:text-2xl text-slate-900 border-b border-slate-100 pb-3">
            Deskripsi Masalah
          </h2>
          <div className="p-4 sm:p-5 bg-amber-50/60 border border-amber-200/70 rounded-xl space-y-3 mt-5">
            {item.deskripsi.map((paragraf, i) => (
              <p key={i} className="text-sm sm:text-base text-amber-950 leading-relaxed">
                {paragraf}
              </p>
            ))}
          </div>
        </section>

        {/* Pertanyaan dan Jawaban */}
        {item.soal.map((soal, i) => (
          <section
            key={i}
            className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5"
          >
            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full w-fit">
              Pertanyaan {i + 1}
            </span>

            <div className="p-4 sm:p-5 bg-amber-50/60 border border-amber-200/70 rounded-xl space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Mas&apos;alah (Pertanyaan):</span>
              </span>
              {soal.tanya.map((paragraf, j) => (
                <p
                  key={j}
                  className="text-sm sm:text-base font-semibold text-amber-950 leading-relaxed"
                >
                  {paragraf}
                </p>
              ))}
            </div>

            <div className="p-4 sm:p-5 bg-emerald-50/60 border border-emerald-200/70 rounded-xl space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Jawaban / Keputusan Hukum:</span>
              </span>
              {soal.jawab.map((paragraf, j) => (
                <p key={j} className="text-sm sm:text-base text-emerald-950 leading-relaxed">
                  {paragraf}
                </p>
              ))}
            </div>

            {soal.referensi.length > 0 && (
              <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Referensi:
                </span>
                {soal.referensi.map((paragraf, k) => {
                  const arab = (paragraf.match(/[؀-ۿ]/g) || []).length;
                  return arab > paragraf.length * 0.35 ? (
                    <p
                      key={k}
                      dir="rtl"
                      lang="ar"
                      className="teks-arab text-right text-base sm:text-lg leading-loose text-slate-900"
                    >
                      {paragraf}
                    </p>
                  ) : (
                    <p key={k} className="text-sm sm:text-base text-slate-800 leading-relaxed">
                      {paragraf}
                    </p>
                  );
                })}
              </div>
            )}
          </section>
        ))}

        {/* Dokumen Resmi */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <h2 className="font-serif font-bold text-xl sm:text-2xl text-slate-900 border-b border-slate-100 pb-3">
            Dokumen Resmi
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed mt-4 max-w-3xl">
            Teks ibarah Arab dari kitab-kitab rujukan ditampilkan pada bagian
            Referensi tiap soal di halaman ini. Dokumen resmi hasil Bahtsul Masa&apos;il
            Jilid II versi PDF tetap menjadi rujukan sah ketetapan mas&apos;alah ini.
          </p>
          <div className="flex flex-wrap gap-2 mt-5">
            <a
              href={item.pdf}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-bold rounded-lg transition"
            >
              <Download className="w-4 h-4" />
              Unduh PDF Mas&apos;alah Ini
            </a>
            <a
              href={PDF_SK_LENGKAP}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-emerald-800 text-emerald-900 text-sm font-bold rounded-lg hover:bg-emerald-50 transition"
            >
              <Download className="w-4 h-4" />
              Unduh Dokumen SK Lengkap
            </a>
          </div>
        </section>

        {/* Navigasi Bawah */}
        <nav className="space-y-4">
          <Link
            href="/kategori/bahtsul-masail-jilid-ii"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-800 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Hasil Bahtsul Masa&apos;il Jilid II
          </Link>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sebelumnya ? (
              <Link
                href={`/kategori/bahtsul-masail-jilid-ii/${sebelumnya.slug}`}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition block"
              >
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Mas&apos;alah Sebelumnya
                </span>
                <span className="block font-serif font-bold text-base text-slate-900 leading-snug mt-2">
                  {sebelumnya.judulSingkat}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {berikutnya && (
              <Link
                href={`/kategori/bahtsul-masail-jilid-ii/${berikutnya.slug}`}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition block text-left sm:text-right"
              >
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Mas&apos;alah Berikutnya
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
                <span className="block font-serif font-bold text-base text-slate-900 leading-snug mt-2">
                  {berikutnya.judulSingkat}
                </span>
              </Link>
            )}
          </div>
        </nav>
      </div>
    </main>
  );
}

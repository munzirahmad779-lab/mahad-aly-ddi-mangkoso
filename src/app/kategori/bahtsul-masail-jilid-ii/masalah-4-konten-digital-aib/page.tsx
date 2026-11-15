import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Download,
  FileText,
  HelpCircle,
  Scale
} from "lucide-react";
import { MASAIL, PDF_SK_LENGKAP, type MasailItem } from "../data";

function ambilItem(): MasailItem {
  const ditemukan = MASAIL.find((m) => m.slug === "masalah-4-konten-digital-aib");
  if (!ditemukan) {
    throw new Error("Data mas'alah 4 (konten digital aib) tidak ditemukan di data.ts");
  }
  return ditemukan;
}

const item = ambilItem();
const prev = MASAIL.find((m) => m.slug === "masalah-3-ittihad-al-baldah");

export const metadata: Metadata = {
  title: `${item.judulSingkat} — Hasil Bahtsul Masa'il Jilid II`,
  description: item.spoiler,
  alternates: {
    canonical: "/kategori/bahtsul-masail-jilid-ii/masalah-4-konten-digital-aib"
  }
};

export default function Masalah4KontenDigitalAibPage() {
  return (
    <main className="pt-32 md:pt-40 lg:pt-60 pb-20 bg-slate-50 min-h-screen">
      {/* Hero */}
      <section className="bg-mahad-green-dark text-white py-14 bg-islamic-pattern relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="text-xs font-bold uppercase tracking-widest text-mahad-gold bg-white/10 px-3.5 py-1 rounded-full inline-flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5" />
            <span>
              Mas&apos;alah {item.nomor} — Hasil Bahtsul Masa&apos;il Jilid II
            </span>
          </span>
          <h1 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-white mt-3 leading-tight max-w-4xl mx-auto">
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Deskripsi Masalah */}
        <section className="p-5 sm:p-6 bg-amber-50/60 border border-amber-200/70 rounded-2xl space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Deskripsi Masalah</span>
          </span>
          {item.deskripsi.map((paragraf, i) => (
            <p key={i} className="text-sm sm:text-base text-amber-950 leading-relaxed">
              {paragraf}
            </p>
          ))}
        </section>

        {/* Pertanyaan dan Jawaban */}
        {item.soal.map((soal, i) => (
          <section key={i} className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
              <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                Pertanyaan {i + 1}
              </span>
              {soal.tanya.map((paragraf, j) => (
                <p
                  key={j}
                  className="font-semibold text-slate-900 text-sm sm:text-base leading-relaxed mt-3"
                >
                  {paragraf}
                </p>
              ))}
            </div>

            <div className="p-5 sm:p-6 bg-emerald-50/60 border border-emerald-200/70 rounded-2xl space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Jawaban / Keputusan Hukum</span>
              </span>
              {soal.jawab.map((paragraf, j) => (
                <p
                  key={j}
                  className="text-sm sm:text-base text-emerald-950 leading-relaxed"
                >
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
        <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
          <h2 className="font-serif font-bold text-xl text-slate-900 border-b border-slate-100 pb-3">
            Dokumen Resmi
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed mt-4 max-w-3xl">
            Ketetapan di halaman ini ditranskripsikan dari dokumen resmi Bahtsul
            Masa&apos;il Jilid II, dan teks ibarah Arab dari kitab-kitab rujukan
            ditampilkan pada bagian Referensi tiap soal. Unduh dokumen resminya
            melalui tombol berikut.
          </p>
          <div className="flex flex-wrap gap-2 mt-5">
            <a
              href={item.pdf}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-mahad-gold text-emerald-950 font-bold text-sm rounded-xl hover:brightness-110 transition shadow"
            >
              <Download className="w-4 h-4" />
              Unduh PDF Mas&apos;alah Ini
            </a>
            <a
              href={PDF_SK_LENGKAP}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-emerald-800 text-emerald-900 font-bold text-sm rounded-xl hover:bg-emerald-50 transition"
            >
              <Download className="w-4 h-4" />
              Unduh Dokumen SK Lengkap
            </a>
          </div>
        </section>

        {/* Navigasi Bawah */}
        <nav className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between pt-2">
          <Link
            href="/kategori/bahtsul-masail-jilid-ii"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-bold rounded-lg transition w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            Semua Hasil Bahtsul Masa&apos;il Jilid II
          </Link>
          {prev && (
            <Link
              href={`/kategori/bahtsul-masail-jilid-ii/${prev.slug}`}
              title={prev.judulSingkat}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-100 transition w-fit text-left"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              Sebelumnya: Mas&apos;alah {prev.nomor}
            </Link>
          )}
        </nav>
      </div>
    </main>
  );
}

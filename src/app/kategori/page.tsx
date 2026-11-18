import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Calendar, Download, FileText, Scale } from "lucide-react";
import { PDF_SK_LENGKAP } from "./bahtsul-masail-jilid-ii/data";

export const metadata: Metadata = {
  title: "Kajian & Diskusi — Ma'had Aly DDI Mangkoso",
  description:
    "Ruang Kajian & Diskusi Ma'had Aly DDI Mangkoso: daftar hasil kajian dan diskusi keilmuan yang diterbitkan, masing-masing dengan ruangnya sendiri. Ruang yang terbit: Hasil Bahtsul Masa'il Jilid II dan Musyawarah Fathul Qorib.",
};

// Struktur ruang (ketetapan user 15 Nov 2026): halaman ini HANYA indeks
// ruang, isinya satu kartu pintu masuk per hasil kajian yang terbit.
// Seluruh isi setiap hasil kajian tinggal di ruangnya sendiri di bawah
// /kategori/<ruang>, supaya penambahan kajian berikutnya tidak menumpuk
// di halaman ini. Ruang pertama: /kategori/bahtsul-masail-jilid-ii.
export default function KajianDiskusiPage() {
  return (
    <main className="pt-32 md:pt-40 lg:pt-60 pb-20 bg-slate-50 min-h-screen">
      {/* Hero */}
      <section className="bg-mahad-green-dark text-white py-16 bg-islamic-pattern relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <span className="inline-block bg-mahad-gold text-mahad-green-dark text-xs font-bold px-4 py-1.5 rounded-full mb-3 shadow">
            Hasil Diskusi Keilmuan
          </span>
          <h1 className="font-serif font-bold text-3xl sm:text-5xl text-white tracking-tight">
            Kajian &amp; Diskusi
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base max-w-2xl mx-auto mt-4 leading-relaxed">
            Ruang penerbitan hasil kajian dan diskusi keilmuan Ma&apos;had Aly
            DDI Mangkoso, termasuk kajian rutin setiap malam Sabtu dan forum
            Bahtsul Masa&apos;il. Setiap hasil kajian memiliki ruangnya
            sendiri di dalam ruang ini.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        {/* Daftar hasil kajian yang terbit */}
        <section>
          <h2 className="font-serif font-bold text-2xl leading-snug text-slate-900">
            Hasil Kajian yang Diterbitkan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
            <article className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full inline-flex items-center gap-1.5 w-fit">
                <Scale className="w-3.5 h-3.5" />
                <span>Forum Bahtsul Masa&apos;il</span>
              </span>
              <h3 className="font-serif font-bold text-xl text-slate-900 leading-snug mt-3">
                Hasil Bahtsul Masa&apos;il Jilid II
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mt-2 flex-1">
                Empat mas&apos;alah fikih kontemporer yang dibahas dan
                ditetapkan oleh DEMA AMALI Wilayah Sultan bersama DEMA
                Ma&apos;had Aly DDI Mangkoso, tingkat Se-Sulselbar.
                Ketetapan lengkapnya, beserta perangkat jalsah dan dokumen
                resminya, berada di ruang hasil ini.
              </p>
              <div className="flex flex-col gap-1.5 mt-4 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5 leading-snug">
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  SK Ketua Panitia Bahtsul Masa&apos;il Nomor 276/SK/Pan-BM/III/1448
                </span>
                <span className="inline-flex items-center gap-1.5 leading-snug">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  Jalsah Pertama s.d. Ketiga, 22-24 Agustus 2026
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mt-5">
                <Link
                  href="/kategori/bahtsul-masail-jilid-ii"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition"
                >
                  Buka Ruang Hasil
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <a
                  href={PDF_SK_LENGKAP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  Unduh SK Lengkap (PDF)
                </a>
              </div>
            </article>

            <article className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full inline-flex items-center gap-1.5 w-fit">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Musyawarah Kitab</span>
              </span>
              <h3 className="font-serif font-bold text-xl text-slate-900 leading-snug mt-3">
                Musyawarah Fathul Qorib
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mt-2 flex-1">
                Pembacaan dan pembahasan kitab Fathul Qorib dalam musyawarah
                rutin Ma&apos;had Aly DDI Mangkoso, meliputi bahasan fikih
                ibadah beserta kajian nahwu dan sharaf yang menyertainya.
                Setiap hasil musyawarah diterbitkan sebagai tulisan
                tersendiri di ruang hasil ini.
              </p>
              <div className="flex flex-col gap-1.5 mt-4 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5 leading-snug">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  Musyawarah Oktober s.d. November 2026
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mt-5">
                <Link
                  href="/kategori/musyawarah-fathul-qorib"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition"
                >
                  Buka Ruang Hasil
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          </div>
        </section>

      </div>
    </main>
  );
}

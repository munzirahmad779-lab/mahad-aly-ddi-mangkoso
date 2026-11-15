import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Calendar, Download, FileText, Scale } from "lucide-react";
import { MASAIL, PDF_SK_LENGKAP } from "./bahtsul-masail-jilid-ii/data";

export const metadata: Metadata = {
  title: "Kajian & Diskusi — Ma'had Aly DDI Mangkoso",
  description:
    "Ruang Kajian & Diskusi Ma'had Aly DDI Mangkoso: hasil kajian dan diskusi keilmuan yang diterbitkan, termasuk Hasil Bahtsul Masa'il Jilid II dengan empat mas'alah yang dapat dibaca lengkap di web.",
};

// Ruang Kajian & Diskusi diaktifkan penuh 15 Nov 2026: hasil diskusi
// pertama yang diterbitkan adalah Hasil Bahtsul Masa'il Jilid II.
// Laman hasil lengkap dan keempat laman mas'alahnya adalah cabang ruang
// ini di /kategori/bahtsul-masail-jilid-ii. Hasil kajian berikutnya,
// termasuk kajian rutin malam Sabtu, diterbitkan di ruang ini juga.
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
            Bahtsul Masa&apos;il.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        {/* Hasil diskusi pertama yang diterbitkan */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5" />
            <span>Dokumen Resmi</span>
          </span>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900 mt-3">
            Hasil Bahtsul Masa&apos;il Jilid II
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed mt-2 max-w-3xl">
            Diselenggarakan oleh DEMA AMALI Wilayah Sultan
            (Sulawesi-Kalimantan-NTB) bersama DEMA Ma&apos;had Aly DDI
            Mangkoso, tingkat Se-Sulselbar. Empat mas&apos;alah fikih
            kontemporer dibahas dan ditetapkan dalam tiga jalsah, dan
            ketetapannya dapat dibaca lengkap di ruang ini.
          </p>
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 mt-4 text-xs sm:text-sm text-slate-600">
            <span className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full leading-snug">
              <FileText className="w-3.5 h-3.5 shrink-0" />
              SK Ketua Panitia Bahtsul Masa&apos;il Nomor 276/SK/Pan-BM/III/1448
            </span>
            <span className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full leading-snug">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              Jalsah Pertama s.d. Ketiga, 22-24 Agustus 2026
            </span>
          </div>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link
              href="/kategori/bahtsul-masail-jilid-ii"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-sm font-bold transition"
            >
              <BookOpen className="w-4 h-4" />
              Lihat Halaman Hasil Lengkap
            </Link>
            <a
              href={PDF_SK_LENGKAP}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-sm font-bold transition"
            >
              <Download className="w-4 h-4" />
              Unduh Dokumen SK Lengkap (PDF)
            </a>
          </div>
        </section>

        {/* Empat Masail */}
        <section>
          <h2 className="font-serif font-bold text-2xl leading-snug text-slate-900">
            Empat Mas&apos;alah yang Ditetapkan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
            {MASAIL.map((item) => (
              <article
                key={item.slug}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col"
              >
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-800">
                  Mas&apos;alah {item.nomor}
                </span>
                <h3 className="font-serif font-bold text-lg text-slate-900 leading-snug mt-2">
                  {item.judul}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mt-2 flex-1">
                  {item.spoiler}
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Link
                    href={`/kategori/bahtsul-masail-jilid-ii/${item.slug}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition"
                  >
                    Baca Ketetapan Lengkap
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <a
                    href={item.pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Unduh PDF
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Catatan ruang */}
        <section className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 sm:p-8">
          <h2 className="font-serif font-bold text-xl text-emerald-950">
            Hasil Kajian Berikutnya Terbit di Sini
          </h2>
          <p className="text-sm sm:text-base text-emerald-900/80 leading-relaxed mt-2 max-w-3xl">
            Setiap hasil kajian dan diskusi keilmuan Ma&apos;had Aly DDI
            Mangkoso yang selesai dilaksanakan dan dicatat akan diterbitkan
            di ruang ini. Adapun tulisan mahasantri dan dosen yang sudah
            terbit dapat dibaca di{" "}
            <Link href="/artikel" className="font-bold underline">
              Mimbar Mahad
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  );
}

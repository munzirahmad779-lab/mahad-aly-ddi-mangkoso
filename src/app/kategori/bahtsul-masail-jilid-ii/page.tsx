import Link from "next/link";
import { BookOpen, Calendar, Download, FileText, Scale, ArrowRight } from "lucide-react";
import { MASAIL, PDF_SK_LENGKAP } from "./data";

const PERANGKAT_JALSAH: Array<[string, string]> = [
  ["Mushohhih", "G. Dr. Yamang Sahibe, Lc., M.Sy."],
  ["Perumus I", "Yanto Wijaya, S.Pd.I."],
  ["Perumus II", "Rusdiansyah Addary, S.H., S.Ag., M.H."],
  ["Perumus III", "Amiruddin Addary, S.Ag., M.H."],
  ["Moderator", "Ust. Muhammad Yusuf"],
  ["Notulis I", "Umar S."],
  ["Notulis II", "Muhammad Luthfi"]
];

export default function HasilBahtsulMasailJilidIIPage() {
  return (
    <main className="pt-32 md:pt-40 lg:pt-60 pb-20 bg-slate-50 min-h-screen">
      {/* Hero */}
      <section className="bg-mahad-green-dark text-white py-14 bg-islamic-pattern relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="text-xs font-bold uppercase tracking-widest text-mahad-gold bg-white/10 px-3.5 py-1 rounded-full inline-flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5" />
            <span>Dokumen Resmi</span>
          </span>
          <h1 className="font-serif font-bold text-3xl sm:text-5xl text-white mt-3">
            Hasil Bahtsul Masa&apos;il Jilid II
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base max-w-2xl mx-auto mt-3 leading-relaxed">
            Diselenggarakan oleh DEMA AMALI Wilayah Sultan (Sulawesi-Kalimantan-NTB)
            bersama DEMA Ma&apos;had Aly DDI Mangkoso, tingkat Se-Sulselbar.
          </p>
          <div className="flex flex-col items-center sm:flex-row sm:flex-wrap sm:justify-center gap-2 mt-5 text-xs sm:text-sm">
            <span className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full max-w-full leading-snug text-left sm:text-center">
              <FileText className="w-3.5 h-3.5 shrink-0" />
              SK Ketua Panitia Bahtsul Masa&apos;il Nomor 276/SK/Pan-BM/III/1448
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full max-w-full leading-snug text-left sm:text-center">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              Jalsah Pertama s.d. Ketiga, 22-24 Agustus 2026
            </span>
          </div>
          <div className="mt-7">
            <a
              href={PDF_SK_LENGKAP}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-mahad-gold text-emerald-950 font-bold text-sm rounded-xl hover:brightness-110 transition shadow-md hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-950"
            >
              <Download className="w-4 h-4" />
              Unduh Dokumen SK Lengkap (PDF)
            </a>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Empat Masail */}
        <section>
          <h2 className="font-serif font-bold text-2xl leading-snug text-slate-900">
            Empat Masail yang Dibahas dan Ditetapkan
          </h2>
          <p className="text-sm text-slate-600 mt-1.5 max-w-3xl leading-relaxed">
            Setiap mas&apos;alah dapat dibaca ketetapan lengkapnya langsung di halaman
            web ini, dan dokumen resmi per mas&apos;alah dapat diunduh dalam format PDF.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
            {MASAIL.map((item) => (
              <article
                key={item.slug}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition duration-200 flex flex-col"
              >
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full w-fit">
                  Mas&apos;alah {item.nomor}
                </span>
                <h3 className="font-serif font-bold text-lg text-slate-900 leading-snug mt-2">
                  {item.judul}
                </h3>
                {item.headline && (
                  <p className="font-serif italic text-base text-amber-800 mt-2 border-l-2 border-mahad-gold pl-3">
                    &ldquo;{item.headline}&rdquo;
                  </p>
                )}
                <p className="text-sm text-slate-600 leading-relaxed mt-2.5 flex-1">
                  <strong className="text-slate-800">Spoiler jawabannya:</strong>{" "}
                  {item.spoiler}
                </p>
                <div className="flex flex-wrap gap-2 mt-auto pt-5">
                  <Link
                    href={`/kategori/bahtsul-masail-jilid-ii/${item.slug}`}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-bold rounded-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    Baca Ketetapan Lengkapnya
                  </Link>
                  <a
                    href={item.pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white border border-emerald-800 text-emerald-900 text-sm font-bold rounded-lg hover:bg-emerald-50 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                  >
                    <Download className="w-4 h-4" />
                    Unduh PDF
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Perangkat Jalsah */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
          <h2 className="font-serif font-bold text-2xl leading-snug text-slate-900 border-b border-slate-100 pb-3">
            Perangkat Jalsah
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 mt-4 text-sm">
            {PERANGKAT_JALSAH.map(([jabatan, nama]) => (
              <div key={jabatan} className="flex gap-3 border-b border-slate-50 pb-2 last:border-0 sm:border-0 sm:pb-0">
                <dt className="font-bold text-emerald-900 w-28 sm:w-32 shrink-0">{jabatan}</dt>
                <dd className="text-slate-700">{nama}</dd>
              </div>
            ))}
          </dl>
          <p className="text-xs text-slate-500 mt-5 leading-relaxed">
            Arsip keputusan Bahtsul Masa&apos;il lainnya dapat dilihat di{" "}
            <Link href="/bahtsul-masail" className="text-emerald-800 font-bold hover:underline rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600">
              halaman Keputusan &amp; Risalah Bahtsul Masail
              <ArrowRight className="w-3.5 h-3.5 inline-block align-[-2px] shrink-0 ml-1" />
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}

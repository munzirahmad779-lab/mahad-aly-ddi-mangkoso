import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kajian & Diskusi — Ma'had Aly DDI Mangkoso",
  description:
    "Ruang Kajian & Diskusi Ma'had Aly DDI Mangkoso: hasil kajian dan diskusi keilmuan akan diterbitkan di halaman ini.",
};

// Halaman ini berstatus Segera Hadir atas ketetapan user 8 Nov 2026:
// hasil kajian dan diskusi (termasuk kajian rutin malam Sabtu) belum
// ada yang diterbitkan, jadi ruang ini tidak diisi daftar tulisan yang
// sama dengan Mimbar Mahad. Tulisan yang sudah terbit tetap dibaca di
// Mimbar; halaman ini diaktifkan penuh begitu hasil kajian pertama
// diterbitkan.
export default function KajianDiskusiPage() {
  return (
    <main className="pt-32 md:pt-40 lg:pt-60 pb-20 bg-slate-50 min-h-screen">
      <section className="bg-mahad-green-dark text-white py-16 bg-islamic-pattern relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <span className="inline-block bg-mahad-gold text-mahad-green-dark text-xs font-bold px-4 py-1.5 rounded-full mb-3 shadow">
            Segera Hadir
          </span>
          <h1 className="font-serif font-bold text-3xl sm:text-5xl text-white tracking-tight">
            Kajian &amp; Diskusi
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base max-w-2xl mx-auto mt-4 leading-relaxed">
            Ruang penerbitan hasil kajian dan diskusi keilmuan Ma&apos;had Aly
            DDI Mangkoso, termasuk kajian rutin setiap malam Sabtu.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm text-center space-y-5">
          <div className="text-5xl" aria-hidden="true">
            🕌
          </div>
          <h2 className="font-serif font-bold text-2xl text-slate-900">
            Ruang Ini Sedang Disiapkan
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Hasil kajian dan diskusi Ma&apos;had Aly DDI Mangkoso akan
            diterbitkan di halaman ini begitu kajian pertama selesai
            dilaksanakan dan dicatat. Saat ini belum ada hasil kajian yang
            diterbitkan, jadi halaman ini belum menampilkan daftar tulisan.
          </p>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Selama menunggu, tulisan mahasantri dan dosen yang sudah terbit
            dapat dibaca di Mimbar Mahad.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/artikel"
              className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-sm font-bold transition"
            >
              Buka Mimbar Mahad &rarr;
            </Link>
            <a
              href="https://wa.me/6285754795186"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-sm font-bold transition"
            >
              Tanya via WhatsApp
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

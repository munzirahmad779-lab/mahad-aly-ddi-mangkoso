import Link from "next/link";
import type { Metadata } from "next";
import {
  JURNAL_NAMA_LABEL_UJI,
  JURNAL_SUBJUDUL,
  JURNAL_PENERBIT_UJI,
  JURNAL_FOKUS_DAN_RUANG_LINGKUP,
  TERBITAN_UJI,
  ARTIKEL_UJI,
  artikelPadaTerbitan
} from "@/lib/jurnal/konten";

// Beranda cabang jurnal VERSI UJI. Menggantikan halaman "Coming Soon"
// khusus di klon uji ini; situs produksi tidak berubah.

export const metadata: Metadata = {
  title: "Turatsuna (Usulan Nama - Versi Uji) | Jurnal Ma'had Aly DDI Mangkoso",
  description:
    "Versi uji cabang jurnal kustom Ma'had Aly DDI Mangkoso: jurnal fiqh, ushul fiqh, dan kajian turats. Nama masih usulan dan konten adalah contoh.",
  alternates: { canonical: "/jurnal" },
  robots: { index: false, follow: false }
};

export default function JurnalBerandaPage() {
  const terbitan = TERBITAN_UJI[0];
  const artikelTerbitan = artikelPadaTerbitan(terbitan.slug);
  const artikelTerbaru = [...ARTIKEL_UJI].slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-12">
      {/* Kepala jurnal */}
      <section className="bg-mahad-green-dark text-white rounded-2xl py-12 px-6 sm:px-10 text-center shadow-md">
        <span className="text-[11px] font-bold uppercase tracking-widest text-mahad-gold bg-white/10 px-4 py-1 rounded-full">
          Publikasi Ilmiah &bull; Versi Uji
        </span>
        <h1 className="font-serif font-bold text-3xl sm:text-5xl mt-5">
          {JURNAL_NAMA_LABEL_UJI}
        </h1>
        <p className="text-emerald-100 text-sm sm:text-base max-w-2xl mx-auto mt-3">
          {JURNAL_SUBJUDUL}
        </p>
        <p className="text-emerald-300/80 text-xs sm:text-sm mt-2">
          Diterbitkan oleh {JURNAL_PENERBIT_UJI}. Rencana terbit 2 kali
          setahun, minimal 5 artikel per terbitan, dengan telaah sejawat
          (peer review) terdokumentasi.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/jurnal/kirim"
            className="bg-mahad-gold hover:bg-yellow-400 text-mahad-green-dark font-bold text-sm px-5 py-2.5 rounded-full shadow transition"
          >
            Kirim Naskah (Uji)
          </Link>
          <Link
            href="/jurnal/lacak"
            className="bg-white/10 hover:bg-white/20 text-white font-semibold text-sm px-5 py-2.5 rounded-full border border-emerald-700 transition"
          >
            Lacak Naskah
          </Link>
        </div>
      </section>

      {/* Fokus dan ruang lingkup */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <h2 className="font-serif font-bold text-xl sm:text-2xl text-mahad-green-dark">
          Fokus dan Ruang Lingkup
        </h2>
        <p className="text-sm text-slate-600 mt-2 max-w-3xl">
          Jurnal ini (versi uji) menampung kajian sesuai takhasus Ma&apos;had
          Aly DDI Mangkoso dan bidang pendukungnya. Bahasa naskah yang
          direncanakan: Bahasa Indonesia, Bahasa Arab, dan Bahasa Inggris.
        </p>
        <ul className="mt-4 grid sm:grid-cols-2 gap-2.5">
          {JURNAL_FOKUS_DAN_RUANG_LINGKUP.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5"
            >
              <span className="text-mahad-gold font-bold">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Daftar terbitan */}
      <section>
        <h2 className="font-serif font-bold text-xl sm:text-2xl text-mahad-green-dark mb-4">
          Daftar Terbitan
        </h2>
        <div className="grid gap-4">
          {TERBITAN_UJI.map((t) => (
            <Link
              key={t.slug}
              href={`/jurnal/terbitan/${t.slug}`}
              className="block bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:border-mahad-gold hover:shadow transition"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif font-bold text-lg text-slate-800">
                    {t.label}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">{t.catatan}</p>
                </div>
                <span className="text-xs font-bold bg-emerald-50 text-mahad-green-dark border border-emerald-200 rounded-full px-3 py-1">
                  {artikelPadaTerbitan(t.slug).length} artikel contoh
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Artikel terbaru */}
      <section>
        <h2 className="font-serif font-bold text-xl sm:text-2xl text-mahad-green-dark mb-4">
          Artikel Terbaru (Contoh)
        </h2>
        <div className="grid gap-4">
          {artikelTerbaru.map((a) => (
            <article
              key={a.slug}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
            >
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
                <span className="bg-mahad-gold-light text-mahad-green-dark px-2.5 py-0.5 rounded-full">
                  {a.seksi}
                </span>
                <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-0.5 rounded-full">
                  Artikel Contoh
                </span>
                <span className="text-slate-400 normal-case tracking-normal font-medium">
                  {terbitan.label} &bull; hlm. {a.halaman}
                </span>
              </div>
              <h3 className="font-serif font-bold text-lg text-slate-800 mt-3 leading-snug">
                <Link
                  href={`/jurnal/artikel/${a.slug}`}
                  className="hover:text-mahad-green transition"
                >
                  {a.judul}
                </Link>
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                {a.penulis.join(", ")} — {a.afiliasi}
              </p>
              <p className="text-sm text-slate-600 mt-3 line-clamp-3">
                {a.abstrak}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

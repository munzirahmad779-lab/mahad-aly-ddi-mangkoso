import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  HALAMAN_KEBIJAKAN,
  halamanKebijakan
} from "@/lib/jurnal/kebijakan";

// Halaman kebijakan jurnal (Tahap 5): Tentang, Fokus dan Ruang
// Lingkup, Dewan Redaksi, Pedoman Penulis, Etika Publikasi, Biaya dan
// Lisensi. Isi dari SUSUNAN-ISI-JURNAL.md dan seluruhnya berstatus
// usulan menunggu keputusan pimpinan; nama dewan redaksi dikosongkan
// menunggu SK.

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const halaman = halamanKebijakan(slug);
  return {
    title: halaman
      ? `${halaman.judul} | Turatsuna (Usulan Nama - Versi Uji)`
      : "Halaman tidak ditemukan",
    description: halaman?.ringkasan,
    robots: { index: false, follow: false }
  };
}

export default async function HalamanKebijakanPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const halaman = halamanKebijakan(slug);
  if (!halaman) notFound();

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8">
      <article className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-10">
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-mahad-green-dark">
          {halaman.judul}
        </h1>
        <p className="text-sm text-slate-500 mt-2">{halaman.ringkasan}</p>
        <p className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs sm:text-sm text-amber-900">
          Status isi halaman ini adalah usulan yang menunggu keputusan
          pimpinan Ma&apos;had Aly DDI Mangkoso. Nama pengisi jabatan
          dewan redaksi diisi lewat SK dan masih kosong pada versi uji
          ini.
        </p>

        {halaman.bagian.map((b, i) => (
          <section key={i} className="mt-8">
            {b.subjudul && (
              <h2 className="font-serif font-bold text-lg text-mahad-green-dark">
                {b.subjudul}
              </h2>
            )}
            {b.paragraf?.map((p, j) => (
              <p
                key={j}
                className="text-sm sm:text-base text-slate-700 leading-relaxed mt-3 text-justify"
              >
                {p}
              </p>
            ))}
            {b.butir && (
              <ul className="mt-3 space-y-2">
                {b.butir.map((item, j) => (
                  <li
                    key={j}
                    className="flex items-start gap-2 text-sm sm:text-base text-slate-700"
                  >
                    <span className="text-mahad-gold font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </article>

      <nav
        className="mt-8 flex flex-wrap gap-2"
        aria-label="Halaman kebijakan lain"
      >
        {HALAMAN_KEBIJAKAN.filter((h) => h.slug !== slug).map((h) => (
          <Link
            key={h.slug}
            href={`/jurnal/halaman/${h.slug}`}
            className="px-3.5 py-2 rounded-full bg-white border border-slate-300 text-xs sm:text-sm font-semibold hover:border-mahad-gold transition"
          >
            {h.judul}
          </Link>
        ))}
      </nav>
    </div>
  );
}

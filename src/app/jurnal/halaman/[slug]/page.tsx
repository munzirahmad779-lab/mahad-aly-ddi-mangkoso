import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  HALAMAN_KEBIJAKAN,
  halamanKebijakan
} from "@/lib/jurnal/kebijakan";
import { KerangkaPublik } from "../../kerangka-publik";

// Halaman kebijakan jurnal: Tentang, Fokus dan Ruang Lingkup, Dewan
// Redaksi, Pedoman Penulis, Etika Publikasi, Biaya dan Lisensi. Isi
// dari SUSUNAN-ISI-JURNAL.md dan seluruhnya berstatus usulan menunggu
// keputusan pimpinan; nama dewan redaksi dikosongkan menunggu SK.

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
    <KerangkaPublik>
      <article>
        <h1 className="border-b-2 border-jurnal-hijau-gelap pb-2 font-serif text-2xl font-bold text-jurnal-hijau-gelap sm:text-3xl">
          {halaman.judul}
        </h1>
        <p className="mt-2 text-sm text-slate-500">{halaman.ringkasan}</p>
        <p className="mt-4 border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-900 sm:text-sm">
          Status isi halaman ini adalah usulan yang menunggu keputusan
          pimpinan Ma&apos;had Aly DDI Mangkoso. Nama pengisi jabatan
          dewan redaksi diisi lewat SK dan masih kosong pada versi uji
          ini.
        </p>

        {halaman.bagian.map((b, i) => (
          <section key={i} className="mt-8">
            {b.subjudul && (
              <h2 className="font-serif text-lg font-bold text-jurnal-hijau-gelap">
                {b.subjudul}
              </h2>
            )}
            {b.paragraf?.map((p, j) => (
              <p
                key={j}
                className="mt-3 text-justify text-sm leading-relaxed text-slate-700 sm:text-base"
              >
                {p}
              </p>
            ))}
            {b.butir && (
              <ul className="mt-3 space-y-2">
                {b.butir.map((item, j) => (
                  <li
                    key={j}
                    className="flex items-start gap-2 text-sm text-slate-700 sm:text-base"
                  >
                    <span className="font-bold text-jurnal-emas">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </article>

      <nav
        className="mt-10 border-t border-slate-200 pt-5"
        aria-label="Halaman kebijakan lain"
      >
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
          {HALAMAN_KEBIJAKAN.filter((h) => h.slug !== slug).map((h) => (
            <li key={h.slug}>
              <Link
                href={`/jurnal/halaman/${h.slug}`}
                className="text-jurnal-hijau hover:underline"
              >
                {h.judul}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </KerangkaPublik>
  );
}

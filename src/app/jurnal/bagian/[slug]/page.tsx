import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JURNAL_BAGIAN } from "@/lib/jurnal/wizard";
import { cariArtikelPublik } from "@/lib/jurnal/publik5-server";
import { DaftarArtikelPublik } from "../../daftar-artikel";
import { tJurnal } from "@/lib/jurnal/i18n";
import { localeJurnalServer } from "@/lib/jurnal/i18n-server";

// Jelajah artikel per bagian jurnal (Tahap 5). Bagian adalah set yang
// sama dengan set OAI-PMH. Hanya artikel published yang tampil.

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const bagian = JURNAL_BAGIAN.find((b) => b.slug === slug);
  return {
    title: bagian
      ? `${bagian.judulId} | Turatsuna (Usulan Nama - Versi Uji)`
      : "Bagian tidak ditemukan",
    robots: { index: false, follow: false }
  };
}

export default async function BagianJurnalPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const bagian = JURNAL_BAGIAN.find((b) => b.slug === slug);
  if (!bagian) notFound();
  const artikel = await cariArtikelPublik({ bagianSlug: slug });
  const teks = tJurnal(await localeJurnalServer());

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8">
      <h1 className="font-serif font-bold text-2xl sm:text-3xl text-mahad-green-dark">
        {teks.artikelPadaBagian}: {bagian.judulId}
      </h1>
      <p className="text-sm text-slate-500 mt-2">
        {bagian.judulEn} • Singkatan {bagian.singkatan}
      </p>
      <nav className="mt-5 flex flex-wrap gap-2" aria-label="Bagian lain">
        {JURNAL_BAGIAN.filter((b) => b.slug !== slug).map((b) => (
          <Link
            key={b.slug}
            href={`/jurnal/bagian/${b.slug}`}
            className="px-3.5 py-2 rounded-full bg-white border border-slate-300 text-xs sm:text-sm font-semibold hover:border-mahad-gold transition"
          >
            {b.judulId}
          </Link>
        ))}
      </nav>
      <div className="mt-8">
        <DaftarArtikelPublik
          artikel={artikel}
          kosong="Belum ada artikel terbit pada bagian ini."
        />
      </div>
    </div>
  );
}

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JURNAL_NAMA_LABEL_UJI } from "@/lib/jurnal/konten";
import { daftarTerbitanPublik } from "@/lib/jurnal/alur-server";
import { tJurnal } from "@/lib/jurnal/i18n";
import { localeJurnalServer } from "@/lib/jurnal/i18n-server";
import { KerangkaPublik } from "../../kerangka-publik";
import { DaftarArtikelPublik } from "../../daftar-artikel";
import { SampulTerbitan } from "../../sampul-terbitan";

// Halaman satu terbitan jurnal. Membaca basis data lewat lapisan
// store: hanya terbitan berstatus published yang punya halaman
// publik; slug terbitan draf atau tidak dikenal menjawab 404. Tampilan
// mengikuti pola halaman terbitan situs jurnal pada umumnya: sampul,
// keterangan terbitan, lalu daftar isi dengan tombol galley.

export const dynamic = "force-dynamic";

async function cariTerbitan(slug: string) {
  const semua = await daftarTerbitanPublik();
  return semua.find((t) => t.slug === slug) ?? null;
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const terbitan = await cariTerbitan(slug);
  if (!terbitan) return { title: "Terbitan tidak ditemukan" };
  return {
    title: `${terbitan.label} | ${JURNAL_NAMA_LABEL_UJI}`,
    description: `Daftar isi ${terbitan.label} jurnal ${JURNAL_NAMA_LABEL_UJI} Ma'had Aly DDI Mangkoso (versi uji).`,
    alternates: { canonical: `/jurnal/terbitan/${slug}` },
    robots: { index: false, follow: false }
  };
}

export default async function TerbitanPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const terbitan = await cariTerbitan(slug);
  if (!terbitan) notFound();
  const teks = tJurnal(await localeJurnalServer());
  const tanggal = terbitan.tanggalTerbit
    ? new Date(terbitan.tanggalTerbit).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
      })
    : String(terbitan.tahun);

  return (
    <KerangkaPublik>
      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="w-36 shrink-0 sm:w-44">
          <SampulTerbitan label={terbitan.label} />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-widest text-jurnal-hijau">
            {terbitan.isCurrent ? teks.terbitanBerjalan : teks.daftarTerbitan}
          </p>
          <h1 className="mt-1 font-serif text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
            {terbitan.label}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {JURNAL_NAMA_LABEL_UJI}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {teks.labelTanggal}: {tanggal}
          </p>
          {terbitan.uraian && (
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {terbitan.uraian}
            </p>
          )}
        </div>
      </div>

      <h2 className="mb-2 mt-10 border-b-2 border-jurnal-hijau-gelap pb-2 font-serif text-xl font-bold text-jurnal-hijau-gelap sm:text-2xl">
        {teks.daftarIsi} ({terbitan.artikel.length} {teks.satuanArtikel})
      </h2>
      <DaftarArtikelPublik
        artikel={terbitan.artikel}
        kosong={teks.belumAdaArtikel}
        ringkas
      />
    </KerangkaPublik>
  );
}

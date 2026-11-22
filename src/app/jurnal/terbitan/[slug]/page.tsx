import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JURNAL_NAMA_LABEL_UJI } from "@/lib/jurnal/konten";
import { daftarTerbitanPublik } from "@/lib/jurnal/alur-server";

// Halaman satu terbitan jurnal. Sejak Tahap 4 membaca basis data lewat
// lapisan store: hanya terbitan berstatus published yang punya halaman
// publik; slug terbitan draf atau tidak dikenal menjawab 404. Daftar
// isi tersusun menurut urutan penempatan artikel.

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
  const tanggal =
    terbitan.tanggalTerbit?.slice(0, 10) ?? String(terbitan.tahun);

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 space-y-8">
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <span className="text-[11px] font-bold uppercase tracking-widest text-mahad-green-dark bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
          Terbitan — Versi Uji
          {terbitan.isCurrent ? " • Terbitan Berjalan" : ""}
        </span>
        <h1 className="font-serif font-bold text-2xl sm:text-4xl text-slate-800 mt-4">
          {terbitan.label}
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          {JURNAL_NAMA_LABEL_UJI} &bull; Tanggal terbit: {tanggal}
        </p>
        {terbitan.uraian && (
          <p className="text-sm text-slate-600 mt-3">{terbitan.uraian}</p>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="font-serif font-bold text-xl text-mahad-green-dark">
          Daftar Isi ({terbitan.artikel.length} artikel)
        </h2>
        {terbitan.artikel.map((a) => (
          <article
            key={a.slug}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
          >
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
              {a.bagianLabel && (
                <span className="bg-mahad-gold-light text-mahad-green-dark px-2.5 py-0.5 rounded-full">
                  {a.bagianLabel}
                </span>
              )}
              {a.halaman && (
                <span className="text-slate-400 normal-case tracking-normal font-medium">
                  hlm. {a.halaman}
                </span>
              )}
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
              {a.penulis.map((p) => p.nama).join(", ")} — {a.afiliasiUtama}
            </p>
            <p className="text-sm text-slate-600 mt-3 line-clamp-3">
              {a.abstrak}
            </p>
            <p className="text-xs text-slate-400 mt-3">
              DOI: {a.doi ? a.doi : "belum diterbitkan"}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}

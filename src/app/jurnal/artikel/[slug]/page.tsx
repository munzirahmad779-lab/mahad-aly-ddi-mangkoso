import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import type { Metadata } from "next";
import {
  getArtikel,
  getTerbitan,
  JURNAL_NAMA_LABEL_UJI,
  JURNAL_NAMA_PLACEHOLDER
} from "@/lib/jurnal/konten";

// Halaman artikel jurnal VERSI UJI dengan metadata lengkap:
// - tag citation_* (Google Scholar) lewat Metadata.other
// - meta Dublin Core (DC.*) lewat Metadata.other
// - JSON-LD ScholarlyArticle di badan halaman
// Seluruh artikel di sini adalah contoh bertanda contoh dengan penulis
// fiktif; DOI belum diterbitkan pada versi uji.

async function urlAsal(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || "http";
  return `${proto}://${host}`;
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const artikel = getArtikel(slug);
  if (!artikel) return { title: "Artikel tidak ditemukan" };
  const terbitan = getTerbitan(artikel.terbitanSlug);
  const asal = await urlAsal();
  const urlArtikel = `${asal}/jurnal/artikel/${artikel.slug}`;
  const tanggal = artikel.tanggalTerbit; // YYYY-MM-DD
  const [tahun, bulan, hari] = tanggal.split("-");

  return {
    title: `${artikel.judul} | ${JURNAL_NAMA_LABEL_UJI}`,
    description: artikel.abstrak,
    alternates: { canonical: `/jurnal/artikel/${slug}` },
    robots: { index: false, follow: false },
    other: {
      // Google Scholar (citation_*)
      citation_title: artikel.judul,
      citation_author: artikel.penulis,
      citation_journal_title: `${JURNAL_NAMA_PLACEHOLDER} (Usulan Nama - Versi Uji)`,
      citation_publication_date: `${tahun}/${bulan}/${hari}`,
      citation_volume: "1",
      citation_issue: "1",
      citation_firstpage: artikel.halaman.split("-")[0],
      citation_lastpage: artikel.halaman.split("-")[1] ?? "",
      citation_abstract_html_url: urlArtikel,
      citation_language: "id",
      // Dublin Core (DC.*)
      "DC.title": artikel.judul,
      "DC.creator": artikel.penulis,
      "DC.subject": artikel.kataKunci,
      "DC.description": artikel.abstrak,
      "DC.publisher": "Ma'had Aly DDI Mangkoso (versi uji)",
      "DC.date": tanggal,
      "DC.type": "Text",
      "DC.identifier": urlArtikel,
      "DC.language": "id",
      "DC.source": `${JURNAL_NAMA_LABEL_UJI}; ${terbitan?.label ?? ""}; ${artikel.halaman}`
    }
  };
}

export default async function ArtikelJurnalPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artikel = getArtikel(slug);
  if (!artikel) notFound();
  const terbitan = getTerbitan(artikel.terbitanSlug);
  const asal = await urlAsal();
  const urlArtikel = `${asal}/jurnal/artikel/${artikel.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    headline: artikel.judul,
    name: artikel.judul,
    author: artikel.penulis.map((p) => ({
      "@type": "Person",
      name: p,
      affiliation: { "@type": "Organization", name: artikel.afiliasi }
    })),
    datePublished: artikel.tanggalTerbit,
    inLanguage: "id",
    abstract: artikel.abstrak,
    keywords: artikel.kataKunci.join(", "),
    pageStart: artikel.halaman.split("-")[0],
    pageEnd: artikel.halaman.split("-")[1] ?? undefined,
    url: urlArtikel,
    isPartOf: {
      "@type": "PublicationIssue",
      name: terbitan?.label ?? "",
      isPartOf: {
        "@type": "Periodical",
        name: JURNAL_NAMA_LABEL_UJI,
        publisher: {
          "@type": "Organization",
          name: "Ma'had Aly DDI Mangkoso"
        }
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c")
        }}
      />
      <article className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-10">
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
          <span className="bg-mahad-gold-light text-mahad-green-dark px-2.5 py-0.5 rounded-full">
            {artikel.seksi}
          </span>
          <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-0.5 rounded-full">
            Artikel Contoh — Versi Uji
          </span>
        </div>

        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-800 leading-snug mt-4">
          {artikel.judul}
        </h1>

        <p className="text-sm text-slate-600 mt-4">
          <span className="font-semibold">{artikel.penulis.join(", ")}</span>
          <br />
          <span className="text-slate-500">{artikel.afiliasi}</span>
        </p>

        <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm mt-6 border-y border-slate-200 py-4">
          <div className="flex gap-2">
            <dt className="font-semibold text-slate-500 w-24 shrink-0">Terbitan</dt>
            <dd>
              {terbitan ? (
                <Link
                  href={`/jurnal/terbitan/${terbitan.slug}`}
                  className="text-mahad-green hover:underline"
                >
                  {terbitan.label}
                </Link>
              ) : (
                "-"
              )}
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-semibold text-slate-500 w-24 shrink-0">Halaman</dt>
            <dd>{artikel.halaman}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-semibold text-slate-500 w-24 shrink-0">Tanggal</dt>
            <dd>{artikel.tanggalTerbit}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-semibold text-slate-500 w-24 shrink-0">Bahasa</dt>
            <dd>{artikel.bahasa}</dd>
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <dt className="font-semibold text-slate-500 w-24 shrink-0">DOI</dt>
            <dd>
              {artikel.doi
                ? artikel.doi
                : "Belum diterbitkan (kolom DOI disiapkan sejak awal; versi uji belum memiliki DOI)"}
            </dd>
          </div>
        </dl>

        <h2 className="font-serif font-bold text-lg text-mahad-green-dark mt-8">
          Abstrak
        </h2>
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed mt-2 text-justify">
          {artikel.abstrak}
        </p>

        <h2 className="font-serif font-bold text-lg text-mahad-green-dark mt-8">
          Kata Kunci
        </h2>
        <div className="flex flex-wrap gap-2 mt-2">
          {artikel.kataKunci.map((k) => (
            <span
              key={k}
              className="text-xs bg-slate-100 border border-slate-200 text-slate-600 rounded-full px-3 py-1"
            >
              {k}
            </span>
          ))}
        </div>

        <div className="mt-10 rounded-xl bg-amber-50 border border-amber-300 px-4 py-3 text-xs sm:text-sm text-amber-900">
          Halaman ini adalah artikel <strong>contoh</strong> pada versi uji
          sistem jurnal. Nama penulis bersifat fiktif dan isi abstrak adalah
          teks contoh, bukan karya ilmiah yang diterbitkan.
        </div>
      </article>
    </div>
  );
}

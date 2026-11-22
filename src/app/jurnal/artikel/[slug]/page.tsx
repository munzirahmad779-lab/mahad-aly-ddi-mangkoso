import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import type { Metadata } from "next";
import {
  JURNAL_NAMA_LABEL_UJI,
  JURNAL_NAMA_PLACEHOLDER
} from "@/lib/jurnal/konten";
import {
  artikelPublikDariSlug,
  catatKunjunganArtikel
} from "@/lib/jurnal/alur-server";
import { infoPenarikanDariSlug } from "@/lib/jurnal/publik5-server";
import { teksKutipan } from "@/lib/jurnal/publik5";
import type { JurnalArtikelPublik } from "@/lib/jurnal/alur";

// Halaman artikel jurnal dengan metadata lengkap:
// - tag citation_* (Google Scholar) lewat Metadata.other, termasuk
//   citation_pdf_url yang menunjuk jalur PDF satu direktori dengan
//   halaman artikel ini
// - meta Dublin Core (DC.*) lewat Metadata.other
// - JSON-LD ScholarlyArticle di badan halaman
// Sejak Tahap 4 isinya membaca basis data lewat lapisan store: hanya
// artikel published di dalam terbitan published yang punya halaman;
// selain itu 404. DOI tampil sebagai belum diterbitkan sampai DOI
// sungguhan didepositkan (pekerjaan sesudah e-ISSN, lihat rancangan).

export const dynamic = "force-dynamic";

async function urlAsal(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || "http";
  return `${proto}://${host}`;
}

function pecahHalaman(halaman: string | null): {
  pertama?: string;
  terakhir?: string;
} {
  if (!halaman) return {};
  const [pertama, terakhir] = halaman.split("-").map((s) => s.trim());
  return { pertama: pertama || undefined, terakhir: terakhir || undefined };
}

function labelBahasa(kode: string): string {
  if (kode === "en") return "Bahasa Inggris";
  if (kode === "ar") return "Bahasa Arab";
  return "Bahasa Indonesia";
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const artikel = await artikelPublikDariSlug(slug);
  if (!artikel) return { title: "Artikel tidak ditemukan" };
  const asal = await urlAsal();
  const urlArtikel = `${asal}/jurnal/artikel/${artikel.slug}`;
  const urlPdf = `${asal}/jurnal/artikel/${artikel.slug}/pdf`;
  const tanggal = artikel.tanggalTerbit.slice(0, 10); // YYYY-MM-DD
  const [tahun, bulan, hari] = tanggal.split("-");
  const { pertama, terakhir } = pecahHalaman(artikel.halaman);
  const namaPenulis = artikel.penulis.map((p) => p.nama);

  const other: Record<string, string | string[]> = {
    // Google Scholar (citation_*)
    citation_title: artikel.judul,
    citation_author: namaPenulis,
    citation_journal_title: `${JURNAL_NAMA_PLACEHOLDER} (Usulan Nama - Versi Uji)`,
    citation_publication_date: `${tahun}/${bulan}/${hari}`,
    citation_abstract_html_url: urlArtikel,
    citation_pdf_url: urlPdf,
    citation_language: artikel.bahasa,
    // Dublin Core (DC.*)
    "DC.title": artikel.judul,
    "DC.creator": namaPenulis,
    "DC.subject": artikel.kataKunci,
    "DC.description": artikel.abstrak,
    "DC.publisher": "Ma'had Aly DDI Mangkoso (versi uji)",
    "DC.date": tanggal,
    "DC.type": "Text",
    "DC.identifier": urlArtikel,
    "DC.language": artikel.bahasa,
    "DC.source": `${JURNAL_NAMA_LABEL_UJI}; ${artikel.terbitanLabel}`,
    "DC.rights": artikel.lisensi
  };
  if (artikel.volume != null) other.citation_volume = String(artikel.volume);
  if (artikel.nomor != null) other.citation_issue = String(artikel.nomor);
  if (pertama) other.citation_firstpage = pertama;
  if (terakhir) other.citation_lastpage = terakhir;
  if (artikel.doi) {
    other.citation_doi = artikel.doi;
    other["DC.identifier"] = [urlArtikel, `https://doi.org/${artikel.doi}`];
  }

  return {
    title: `${artikel.judul} | ${JURNAL_NAMA_LABEL_UJI}`,
    description: artikel.abstrak,
    alternates: { canonical: `/jurnal/artikel/${slug}` },
    robots: { index: false, follow: false },
    other
  };
}

export default async function ArtikelJurnalPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artikel = await artikelPublikDariSlug(slug);
  if (!artikel) {
    // Artikel yang ditarik sesudah terbit tidak hilang diam-diam:
    // halamannya menjadi pemberitahuan penarikan (asas COPE).
    const penarikan = await infoPenarikanDariSlug(slug);
    if (penarikan) {
      return (
        <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8">
          <article className="bg-white rounded-2xl shadow-sm border border-red-200 p-6 sm:p-10">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full">
              Artikel Ditarik (Retracted)
            </span>
            <h1 className="font-serif font-bold text-2xl text-slate-800 leading-snug mt-4">
              {penarikan.judul}
            </h1>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed mt-4">
              Artikel ini telah ditarik dari publikasi oleh redaksi pada{" "}
              {new Date(penarikan.ditarikPada).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric"
              })}
              .
            </p>
            {penarikan.alasanTarik && (
              <p className="text-sm text-slate-600 mt-3">
                Alasan penarikan: {penarikan.alasanTarik}
              </p>
            )}
            <p className="text-sm text-slate-500 mt-3">
              Catatan bibliografis artikel tetap dipertahankan dan rekod
              OAI-PMH-nya ditandai sebagai terhapus (deleted) sesuai
              kebijakan koreksi dan penarikan jurnal.
            </p>
          </article>
        </div>
      );
    }
    notFound();
  }
  // Pencatatan metrik dasar: satu kunjungan halaman artikel menaikkan
  // penghitung harian. Kegagalannya tidak pernah menggagalkan halaman.
  await catatKunjunganArtikel(artikel.kode);
  const asal = await urlAsal();
  const urlArtikel = `${asal}/jurnal/artikel/${artikel.slug}`;
  const tanggal = artikel.tanggalTerbit.slice(0, 10);
  const { pertama, terakhir } = pecahHalaman(artikel.halaman);

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    headline: artikel.judul,
    name: artikel.judul,
    author: artikel.penulis.map((p) => ({
      "@type": "Person",
      name: p.nama,
      affiliation: { "@type": "Organization", name: p.afiliasi }
    })),
    datePublished: tanggal,
    inLanguage: artikel.bahasa,
    abstract: artikel.abstrak,
    keywords: artikel.kataKunci.join(", "),
    url: urlArtikel,
    license: artikel.lisensi,
    isPartOf: {
      "@type": "PublicationIssue",
      name: artikel.terbitanLabel,
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
  if (pertama) jsonLd.pageStart = pertama;
  if (terakhir) jsonLd.pageEnd = terakhir;
  if (artikel.doi) jsonLd.identifier = `https://doi.org/${artikel.doi}`;

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
          {artikel.bagianLabel && (
            <span className="bg-mahad-gold-light text-mahad-green-dark px-2.5 py-0.5 rounded-full">
              {artikel.bagianLabel}
            </span>
          )}
          <span className="bg-emerald-50 text-mahad-green-dark border border-emerald-200 px-2.5 py-0.5 rounded-full">
            Artikel Terbit — Versi Uji
          </span>
        </div>

        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-800 leading-snug mt-4">
          {artikel.judul}
        </h1>

        <div className="text-sm text-slate-600 mt-4 space-y-1">
          {artikel.penulis.map((p, i) => (
            <p key={i}>
              <span className="font-semibold">{p.nama}</span>
              {p.afiliasi && (
                <span className="text-slate-500"> — {p.afiliasi}</span>
              )}
            </p>
          ))}
        </div>

        <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm mt-6 border-y border-slate-200 py-4">
          <div className="flex gap-2">
            <dt className="font-semibold text-slate-500 w-24 shrink-0">Terbitan</dt>
            <dd>
              <Link
                href={`/jurnal/terbitan/${artikel.terbitanSlug}`}
                className="text-mahad-green hover:underline"
              >
                {artikel.terbitanLabel}
              </Link>
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-semibold text-slate-500 w-24 shrink-0">Halaman</dt>
            <dd>{artikel.halaman ?? "-"}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-semibold text-slate-500 w-24 shrink-0">Tanggal</dt>
            <dd>{tanggal}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-semibold text-slate-500 w-24 shrink-0">Bahasa</dt>
            <dd>{labelBahasa(artikel.bahasa)}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-semibold text-slate-500 w-24 shrink-0">Lisensi</dt>
            <dd>{artikel.lisensi}</dd>
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <dt className="font-semibold text-slate-500 w-24 shrink-0">DOI</dt>
            <dd>
              {artikel.doi ? (
                <a
                  href={`https://doi.org/${artikel.doi}`}
                  className="text-mahad-green hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  https://doi.org/{artikel.doi}
                </a>
              ) : (
                "Belum diterbitkan (kolom DOI disiapkan sejak awal; DOI diterbitkan sesudah e-ISSN aktif)"
              )}
            </dd>
          </div>
        </dl>

        {(artikel.punyaPdf || artikel.punyaHtml) && (
          <div className="mt-6 flex flex-wrap gap-3">
            {artikel.punyaPdf && (
              <a
                href={`/jurnal/artikel/${artikel.slug}/pdf`}
                className="bg-mahad-gold hover:bg-yellow-400 text-mahad-green-dark font-bold text-sm px-5 py-2.5 rounded-full shadow transition"
              >
                Unduh PDF
              </a>
            )}
            {artikel.punyaHtml && (
              <a
                href={`/jurnal/artikel/${artikel.slug}/html`}
                target="_blank"
                rel="noreferrer"
                className="bg-white border border-slate-300 hover:border-mahad-gold font-bold text-sm px-5 py-2.5 rounded-full transition"
              >
                Baca HTML
              </a>
            )}
          </div>
        )}

        <h2 className="font-serif font-bold text-lg text-mahad-green-dark mt-8">
          Abstrak
        </h2>
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed mt-2 text-justify">
          {artikel.abstrak}
        </p>

        {artikel.abstrakEn && (
          <>
            <h2 className="font-serif font-bold text-lg text-mahad-green-dark mt-8">
              Abstract
            </h2>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed mt-2 text-justify">
              {artikel.abstrakEn}
            </p>
          </>
        )}

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

        {artikel.pernyataanAi && (
          <>
            <h2 className="font-serif font-bold text-lg text-mahad-green-dark mt-8">
              Pernyataan Pemakaian AI
            </h2>
            <p className="text-sm text-slate-600 mt-2">{artikel.pernyataanAi}</p>
          </>
        )}

        <h2 className="font-serif font-bold text-lg text-mahad-green-dark mt-8">
          Cara Mengutip
        </h2>
        <p className="text-sm text-slate-700 leading-relaxed mt-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
          {teksKutipan({
            judul: artikel.judul,
            penulis: artikel.penulis,
            tahun: artikel.tahun,
            volume: artikel.volume,
            nomor: artikel.nomor,
            halaman: artikel.halaman,
            doi: artikel.doi,
            slug: artikel.slug
          })}
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <a
            href={`/api/jurnal/artikel/${artikel.kode}/sitasi?format=bibtex`}
            className="bg-white border border-slate-300 hover:border-mahad-gold font-bold text-sm px-5 py-2 rounded-full transition"
          >
            Unduh BibTeX
          </a>
          <a
            href={`/api/jurnal/artikel/${artikel.kode}/sitasi?format=ris`}
            className="bg-white border border-slate-300 hover:border-mahad-gold font-bold text-sm px-5 py-2 rounded-full transition"
          >
            Unduh RIS
          </a>
        </div>
      </article>
    </div>
  );
}

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
import { tJurnal, type JurnalDict } from "@/lib/jurnal/i18n";
import { localeJurnalServer } from "@/lib/jurnal/i18n-server";
import { KerangkaPublik } from "../../kerangka-publik";

// Halaman artikel jurnal dengan metadata lengkap:
// - tag citation_* (Google Scholar) lewat Metadata.other, termasuk
//   citation_pdf_url yang menunjuk jalur PDF satu direktori dengan
//   halaman artikel ini
// - meta Dublin Core (DC.*) lewat Metadata.other
// - JSON-LD ScholarlyArticle di badan halaman
// Isinya membaca basis data lewat lapisan store: hanya artikel
// published di dalam terbitan published yang punya halaman; selain
// itu 404. DOI tampil sebagai belum diterbitkan sampai DOI sungguhan
// didepositkan (pekerjaan sesudah e-ISSN, lihat rancangan). Tampilan
// mengikuti pola halaman artikel situs jurnal pada umumnya: judul,
// penulis, tombol galley, kotak keterangan, abstrak, kata kunci,
// daftar pustaka, dan blok sitasi.

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

function JudulBagian({ children }: { children: string }) {
  return (
    <h2 className="mt-10 border-b border-slate-200 pb-1.5 font-serif text-lg font-bold text-jurnal-hijau-gelap">
      {children}
    </h2>
  );
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
  const teks: JurnalDict = tJurnal(await localeJurnalServer());
  const artikel = await artikelPublikDariSlug(slug);
  if (!artikel) {
    // Artikel yang ditarik sesudah terbit tidak hilang diam-diam:
    // halamannya menjadi pemberitahuan penarikan (asas COPE).
    const penarikan = await infoPenarikanDariSlug(slug);
    if (penarikan) {
      return (
        <KerangkaPublik>
          <article className="border border-red-300 bg-red-50 p-6 sm:p-8">
            <span className="bg-red-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-red-700">
              Artikel Ditarik (Retracted)
            </span>
            <h1 className="mt-4 font-serif text-2xl font-bold leading-snug text-slate-900">
              {penarikan.judul}
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-slate-700 sm:text-base">
              Artikel ini telah ditarik dari publikasi oleh redaksi pada{" "}
              {new Date(penarikan.ditarikPada).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric"
              })}
              .
            </p>
            {penarikan.alasanTarik && (
              <p className="mt-3 text-sm text-slate-600">
                Alasan penarikan: {penarikan.alasanTarik}
              </p>
            )}
            <p className="mt-3 text-sm text-slate-500">
              Catatan bibliografis artikel tetap dipertahankan dan rekod
              OAI-PMH-nya ditandai sebagai terhapus (deleted) sesuai
              kebijakan koreksi dan penarikan jurnal.
            </p>
          </article>
        </KerangkaPublik>
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
    <KerangkaPublik>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c")
        }}
      />
      <article>
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
          {artikel.bagianLabel && (
            <span className="bg-jurnal-emas-muda px-2.5 py-0.5 text-jurnal-hijau-gelap">
              {artikel.bagianLabel}
            </span>
          )}
          <span className="bg-emerald-50 px-2.5 py-0.5 text-jurnal-hijau-gelap">
            {teks.artikelTerbitLabel} — {teks.spandukJudul}
          </span>
        </div>

        <h1 className="mt-4 font-serif text-2xl font-bold leading-snug text-slate-900 sm:text-3xl">
          {artikel.judul}
        </h1>

        <div className="mt-4 space-y-1 text-sm text-slate-700">
          {artikel.penulis.map((p, i) => (
            <p key={i}>
              <span className="font-semibold">{p.nama}</span>
              {p.afiliasi && (
                <span className="text-slate-500"> — {p.afiliasi}</span>
              )}
            </p>
          ))}
        </div>

        {(artikel.punyaPdf || artikel.punyaHtml) && (
          <div className="mt-5 flex flex-wrap gap-2.5">
            {artikel.punyaPdf && (
              <a
                href={`/jurnal/artikel/${artikel.slug}/pdf`}
                className="bg-jurnal-hijau-gelap px-5 py-2.5 text-sm font-bold text-white transition hover:bg-jurnal-hijau"
              >
                {teks.bacaPdf}
              </a>
            )}
            {artikel.punyaHtml && (
              <a
                href={`/jurnal/artikel/${artikel.slug}/html`}
                target="_blank"
                rel="noreferrer"
                className="border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:border-jurnal-hijau-gelap hover:text-jurnal-hijau-gelap"
              >
                {teks.bacaHtml}
              </a>
            )}
          </div>
        )}

        <dl className="mt-7 grid gap-x-8 gap-y-2.5 border-y border-slate-200 py-4 text-sm sm:grid-cols-2">
          <div className="flex gap-2">
            <dt className="w-28 shrink-0 font-semibold text-slate-500">
              {teks.labelTerbitan}
            </dt>
            <dd>
              <Link
                href={`/jurnal/terbitan/${artikel.terbitanSlug}`}
                className="text-jurnal-hijau hover:underline"
              >
                {artikel.terbitanLabel}
              </Link>
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-28 shrink-0 font-semibold text-slate-500">
              {teks.labelHalaman}
            </dt>
            <dd>{artikel.halaman ?? "-"}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-28 shrink-0 font-semibold text-slate-500">
              {teks.labelTanggal}
            </dt>
            <dd>{tanggal}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-28 shrink-0 font-semibold text-slate-500">
              {teks.labelBahasa}
            </dt>
            <dd>{labelBahasa(artikel.bahasa)}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-28 shrink-0 font-semibold text-slate-500">
              {teks.labelLisensi}
            </dt>
            <dd>{artikel.lisensi}</dd>
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <dt className="w-28 shrink-0 font-semibold text-slate-500">DOI</dt>
            <dd>
              {artikel.doi ? (
                <a
                  href={`https://doi.org/${artikel.doi}`}
                  className="text-jurnal-hijau hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  https://doi.org/{artikel.doi}
                </a>
              ) : (
                teks.doiBelum +
                " (kolom DOI disiapkan sejak awal; DOI diterbitkan sesudah e-ISSN aktif)"
              )}
            </dd>
          </div>
        </dl>

        <JudulBagian>{teks.abstrak}</JudulBagian>
        <p className="mt-3 text-justify text-sm leading-relaxed text-slate-700 sm:text-base">
          {artikel.abstrak}
        </p>

        {artikel.abstrakEn && (
          <>
            <JudulBagian>Abstract</JudulBagian>
            <p className="mt-3 text-justify text-sm leading-relaxed text-slate-700 sm:text-base">
              {artikel.abstrakEn}
            </p>
          </>
        )}

        <JudulBagian>{teks.kataKunci}</JudulBagian>
        <p className="mt-3 text-sm text-slate-700">
          {artikel.kataKunci.join(", ")}
        </p>

        {artikel.pernyataanAi && (
          <>
            <JudulBagian>{teks.pernyataanAiJudul}</JudulBagian>
            <p className="mt-3 text-sm text-slate-600">
              {artikel.pernyataanAi}
            </p>
          </>
        )}

        {artikel.referensi && (
          <>
            <JudulBagian>{teks.daftarPustaka}</JudulBagian>
            <div className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700">
              {artikel.referensi}
            </div>
          </>
        )}

        <JudulBagian>{teks.caraMengutip}</JudulBagian>
        <p className="mt-3 border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-700">
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
        <div className="mt-3 flex flex-wrap gap-2.5">
          <a
            href={`/api/jurnal/artikel/${artikel.kode}/sitasi?format=bibtex`}
            className="border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-jurnal-hijau-gelap hover:text-jurnal-hijau-gelap"
          >
            {teks.unduhSitasiBibtex}
          </a>
          <a
            href={`/api/jurnal/artikel/${artikel.kode}/sitasi?format=ris`}
            className="border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-jurnal-hijau-gelap hover:text-jurnal-hijau-gelap"
          >
            {teks.unduhSitasiRis}
          </a>
        </div>
      </article>
    </KerangkaPublik>
  );
}

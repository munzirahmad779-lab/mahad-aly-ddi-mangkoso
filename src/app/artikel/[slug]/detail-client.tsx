"use client";

import { Fragment, use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useArticles } from "@/context/ArticleContext";
import ArticleCard from "@/components/articles/ArticleCard";
import ReadingBeam from "@/components/common/ReadingBeam";
import ViewCount from "@/components/common/ViewCount";

interface ArticleDetailPageProps {
  params: Promise<{ slug: string }>;
}

/* ── Render terstruktur isi artikel ──────────────────────────────────
   Isi artikel di database adalah teks polos. Di sini ia dipecah per
   baris: baris subbab dirender sebagai heading, baris yang mayoritas
   aksara Arab dirender sebagai paragraf Arab (RTL), sisanya paragraf
   biasa dengan rentang Arab di dalamnya dibungkus span.teks-arab.
   Teks artikelnya sendiri TIDAK diubah. */

const ARABIC_CHAR_RE =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
const ARABIC_RUN_RE =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+(?:[ \t.,;:!?'"()\-\u2013\u2014\u060C\u061B\u061F]+[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+)*/g;

function arabicRatio(text: string): number {
  let arab = 0;
  let total = 0;
  for (const ch of text) {
    if (/\s/.test(ch)) continue;
    total++;
    if (ARABIC_CHAR_RE.test(ch)) arab++;
  }
  return total === 0 ? 0 : arab / total;
}

const KATA_BAB = [
  "pendahuluan",
  "latar belakang",
  "pembahasan",
  "kesimpulan",
  "penutup",
  "abstrak",
  "metode",
  "rumusan masalah",
  "daftar pustaka",
  "sumber referensi",
  "kata pengantar",
  "saran",
];

// Entitas HTML pada naskah sumber (&apos;, &quot;, dsb.) dinetralkan
// HANYA untuk keperluan uji pola; teks yang dirender tetap aslinya.
function bersihUntukUji(line: string): string {
  return line
    .replace(/&[a-zA-Z]+;/g, "'")
    .replace(/&#\d+;/g, "'")
    .trim();
}

// Aturan heading yang konservatif, dari pola nyata naskah mahasiswa.
function isHeading(rawLine: string): boolean {
  const line = bersihUntukUji(rawLine);
  if (!line) return false;
  // Baris Arab tidak pernah jadi heading.
  if (arabicRatio(line) > 0.5) return false;

  // "BAB I" / "Bab 2"
  if (/^(BAB|Bab)\s+([IVXLC]{1,6}|\d{1,3})\b/.test(line)) return true;

  // Pola "A. Judul": maks 80 karakter; satu titik di akhir ditoleransi
  // (mahasiswa kerap mengakhiri judul subbab dengan titik,
  // mis. "C. Hanya Berharap kepada Allah SWT.")
  if (/^[A-Z]\.\s+\S/.test(line) && line.length <= 80 && !/[,;]$/.test(line))
    return true;

  // Pola "1. Judul": maks 80 karakter, tidak diakhiri . , ;
  if (
    /^\d{1,2}\.\s+\S/.test(line) &&
    line.length <= 80 &&
    !/[.,;]$/.test(line)
  )
    return true;

  // Kata pembuka bab persis sebagai baris tersendiri
  const lower = line
    .toLowerCase()
    .replace(/[:.]$/, "")
    .trim();
  if (KATA_BAB.includes(lower)) return true;

  // Kata pembuka bab diikuti subjudul singkat
  for (const k of KATA_BAB) {
    if (lower.startsWith(k)) {
      const rest = lower.slice(k.length);
      if (
        (rest.startsWith(":") || rest.startsWith(" ")) &&
        line.length <= 60 &&
        !/[.,;]$/.test(line)
      )
        return true;
    }
  }

  // Seluruhnya HURUF KAPITAL: minimal 2 kata, atau kata kunci bab
  const huruf = line.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ]/g, "");
  if (
    huruf.length >= 3 &&
    /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(line) &&
    line === line.toUpperCase()
  ) {
    const kata = line.split(/\s+/).filter(Boolean);
    if (kata.length >= 2 || KATA_BAB.includes(lower)) return true;
  }

  return false;
}

// Bungkus rentang aksara Arab di dalam teks Latin dengan span.teks-arab.
function renderCampuran(text: string, kunci: string) {
  const potongan = text.split(new RegExp(`(${ARABIC_RUN_RE.source})`, "g"));
  return potongan.map((bagian, i) =>
    bagian && ARABIC_CHAR_RE.test(bagian) ? (
      <span key={`${kunci}-${i}`} className="teks-arab">
        {bagian}
      </span>
    ) : (
      <Fragment key={`${kunci}-${i}`}>{bagian}</Fragment>
    )
  );
}

function IsiArtikel({ content }: { content: string }) {
  const elemen: React.ReactNode[] = [];
  (content || "").split(/\n\s*\n/).forEach((blok) => {
    blok.split(/\r?\n/).forEach((mentah) => {
      const baris = mentah.trim();
      if (!baris) return;
      const kunci = `isi-${elemen.length}`;
      if (isHeading(baris)) {
        elemen.push(
          <h2
            key={kunci}
            className={`font-serif font-bold text-emerald-900 text-xl sm:text-2xl leading-snug border-l-4 border-amber-500 pl-3 sm:pl-4 ${
              elemen.length > 0 ? "mt-12" : ""
            }`}
          >
            {renderCampuran(baris, kunci)}
          </h2>
        );
      } else if (arabicRatio(bersihUntukUji(baris)) > 0.7) {
        elemen.push(
          <p
            key={kunci}
            dir="rtl"
            className="teks-arab blok-arab text-right"
            style={{ marginTop: "2rem", marginBottom: "2rem" }}
          >
            {baris}
          </p>
        );
      } else {
        elemen.push(<p key={kunci}>{renderCampuran(baris, kunci)}</p>);
      }
    });
  });
  return <>{elemen}</>;
}

export default function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const { slug } = use(params);
  const { articles, incrementArticleViews, isCatalogReady } = useArticles();
  const bodyRef = useRef<HTMLDivElement>(null);

  const cleanSlug = decodeURIComponent(slug || "").toLowerCase().trim();
  const foundArticle = (articles || []).find(
    (a) => a.slug?.toLowerCase() === cleanSlug || a.id === slug
  );

  // Sinyal pratinjau admin yang sama dengan MaintenanceGate: admin yang
  // sedang mempratinjau situs (localStorage "mahad_admin_preview" atau
  // query ?preview=true) tetap boleh membuka draf dari panel admin.
  const [adminPreviewChecked, setAdminPreviewChecked] = useState(false);
  const [isAdminPreview, setIsAdminPreview] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const fromQuery = window.location.search.includes("preview=true");
      if (fromQuery) {
        try { localStorage.setItem("mahad_admin_preview", "true"); } catch {}
      }
      setIsAdminPreview(
        fromQuery || localStorage.getItem("mahad_admin_preview") === "true"
      );
    }
    setAdminPreviewChecked(true);
  }, []);

  // Artikel draf tidak terbaca pengunjung: bagi non-admin ia diperlakukan
  // seolah tidak ada (keadaan tidak ditemukan di bawah).
  const article =
    foundArticle && foundArticle.status === "draft" && !isAdminPreview
      ? undefined
      : foundArticle;

  useEffect(() => {
    if (article && article.slug) {
      incrementArticleViews(article.slug);
    }
  }, [article?.slug]);

  // Katalog sudah terkonfirmasi dari server tapi artikel tetap tidak ada
  // → 404 sungguhan, bukan soft-404 berstatus 200.
  if (!article && isCatalogReady && adminPreviewChecked) {
    notFound();
  }

  if (!article) {
    return (
      <main className="pt-32 md:pt-40 lg:pt-60 pb-20 bg-slate-50 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-5xl mb-4">📖</div>
          <h1 className="font-serif font-bold text-2xl text-slate-800">
            Naskah Artikel Tidak Ditemukan
          </h1>
          <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
            Artikel yang Anda cari mungkin telah diperbarui judulnya atau dipindahkan ke arsip oleh redaksi.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/artikel"
              className="px-5 py-2.5 bg-mahad-gold text-mahad-green-dark font-bold text-xs rounded-full shadow hover:bg-yellow-400 transition"
            >
              Lihat Semua Artikel
            </Link>
            <Link
              href="/"
              className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-full hover:bg-slate-200 transition"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const relatedArticles = articles
    .filter(
      (a) =>
        a.category === article.category && a.id !== article.id && a.status !== "draft"
    )
    .slice(0, 2);

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = encodeURIComponent(article.title);

  // Structured data untuk Google (rich snippet: penulis, tanggal, artikel)
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    author: { "@type": "Person", name: article.author },
    datePublished: article.date,
    inLanguage: "id",
    mainEntityOfPage: `https://mahadaly-ddimangkoso.my.id/artikel/${article.slug}`,
    publisher: {
      "@type": "EducationalOrganization",
      name: "Ma'had Aly DDI Mangkoso",
      url: "https://mahadaly-ddimangkoso.my.id"
    }
  };

  return (
    <main className="pt-32 md:pt-40 lg:pt-60 pb-20 bg-slate-50 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      
      {/* Header Artikel */}
      <section className="bg-mahad-green-dark text-white py-14 bg-islamic-pattern">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4">
            <Link
              href={article.type === "opini" ? "/opini" : "/artikel"}
              className="inline-flex items-center gap-1.5 text-xs text-mahad-gold-light hover:text-white bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-full transition border border-white/15"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>{article.type === "opini" ? "Kembali ke Opini Santri" : "Kembali ke Mimbar Kajian"}</span>
            </Link>
          </div>

          <div className="mb-3">
            <span className="inline-block text-xs font-bold uppercase tracking-wider bg-mahad-gold text-mahad-green-dark px-3 py-1 rounded-full shadow-xs">
              {article.categoryLabel}
            </span>
          </div>

          <h1 className="font-serif font-bold text-2xl sm:text-4xl lg:text-5xl text-white leading-tight">
            {article.title}
          </h1>

          <div className="mt-6 pt-6 border-t border-emerald-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-emerald-200">
            <div>
              <p className="font-bold text-white text-sm">{article.author}</p>
              <p className="text-emerald-300">{article.authorRole}</p>
            </div>
            <div className="text-right">
              <p>{article.date} ({article.hijriDate})</p>
              <p className="text-mahad-gold font-semibold">
                Waktu baca: &plusmn; {article.readTime}
              </p>
              <div className="mt-1.5 flex justify-end">
                <ViewCount />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Badan Tulisan & Sidebar */}
      <div ref={bodyRef} className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <ReadingBeam targetRef={bodyRef} />

        {/* Foto utama artikel dari thumbnail_url basis data, bila ada */}
        {article.imageUrl && (
          <figure className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full max-h-[480px] object-cover"
            />
          </figure>
        )}
        
        {/* Konten Utama */}
        <article className="bg-white rounded-2xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-6">
          
          {/* Kotak Abstrak */}
          <div className="bg-emerald-50 border-l-4 border-emerald-700 p-5 rounded-r-xl">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1 font-bold">
              Pokok Pikiran &amp; Abstrak
            </h4>
            <p className="text-slate-700 text-sm italic leading-relaxed">
              {article.excerpt}
            </p>
          </div>

          {/* Isi Teks Lengkap */}
          <div className="text-slate-800 leading-relaxed text-base sm:text-lg space-y-5 font-sans">
            <IsiArtikel content={article.content} />
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-slate-500">Kata Kunci:</span>
              {article.tags.map((t, i) => (
                <span key={i} className="bg-slate-100 text-emerald-900 px-2.5 py-1 rounded-md font-medium">
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Social Share Buttons */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Bagikan Tulisan Ini:
            </span>
            <div className="flex items-center gap-2">
              <a
                href={`https://wa.me/?text=${shareTitle}%20${encodeURIComponent(currentUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
              >
                <span>WhatsApp</span>
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
              >
                <span>Facebook</span>
              </a>
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${shareTitle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
              >
                <span>Telegram</span>
              </a>
            </div>
          </div>
        </article>

        {/* Bio Penulis */}
        <div className="bg-emerald-50 rounded-2xl p-6 sm:p-8 border border-emerald-100 flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow">
            {article.author.charAt(0)}
          </div>
          <div className="space-y-1">
            <h4 className="font-serif font-bold text-lg text-emerald-950">{article.author}</h4>
            <p className="text-xs text-emerald-800 font-semibold">{article.authorRole}</p>
            <p className="text-xs text-slate-600 leading-relaxed">
              {article.authorBio || "Sivitas akademika Ma'had Aly DDI Mangkoso yang aktif menulis risalah dan kajian pemikiran hukum Islam."}
            </p>
          </div>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-2xl text-slate-900">
              Kajian Terkait dalam Kategori Serupa
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedArticles.map((rel) => (
                <ArticleCard key={rel.id} article={rel} />
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
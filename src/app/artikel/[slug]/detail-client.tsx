"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useArticles } from "@/context/ArticleContext";
import { supabase } from "@/lib/supabase/client";
import { dalamSeriKajianFathulQorib } from "@/lib/content-mappers";
import ArticleCard from "@/components/articles/ArticleCard";
import ReadingBeam from "@/components/common/ReadingBeam";
import ViewCount from "@/components/common/ViewCount";
import GambarAman from "@/components/common/GambarAman";
import IsiTulisan from "@/components/common/IsiTulisan";

interface ArticleDetailPageProps {
  params: Promise<{ slug: string }>;
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

  // Isi lengkap tidak lagi ikut di data awal halaman (demi meringankan
  // muatan server); sinkronisasi katalog biasanya mengisinya sesaat
  // sesudah halaman dimuat. Bila isi dari katalog masih kosong, muat
  // langsung dari basis data berdasarkan slug agar badan tulisan selalu
  // tampil utuh.
  const [isiLokal, setIsiLokal] = useState("");
  useEffect(() => {
    if (!article || article.content) return;
    let batal = false;
    supabase
      .from("articles")
      .select("content")
      .eq("slug", cleanSlug)
      .maybeSingle()
      .then(({ data }) => {
        if (!batal && data?.content) setIsiLokal(data.content as string);
      });
    return () => {
      batal = true;
    };
  }, [article?.slug, article?.content, cleanSlug]);

  // Katalog sudah terkonfirmasi dari server tapi artikel tetap tidak ada
  // → 404 sungguhan, bukan soft-404 berstatus 200.
  if (!article && isCatalogReady && adminPreviewChecked) {
    notFound();
  }

  if (!article) {
    return (
      <main className="pt-32 md:pt-40 lg:pt-60 pb-20 bg-slate-50 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-10 h-10 mx-auto rounded-full border-4 border-slate-200 border-t-mahad-gold animate-spin mb-4" />
          <h1 className="font-serif font-bold text-2xl text-slate-800">
            Memuat Artikel
          </h1>
          <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
            Isi artikel sedang dimuat, mohon tunggu sebentar.
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

  // Artikel seri Kajian Fathul Qorib hanya saling terkait di dalam
  // serinya dan tidak muncul sebagai terkait di artikel lain
  // (ketetapan user 19 Nov 2026: serinya khusus di Kajian & Diskusi).
  const diSeriKajian = dalamSeriKajianFathulQorib(article);
  const relatedArticles = articles
    .filter(
      (a) =>
        a.category === article.category &&
        a.id !== article.id &&
        a.status !== "draft" &&
        dalamSeriKajianFathulQorib(a) === diSeriKajian
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
    mainEntityOfPage: `https://mahadaly-ddimangkoso.ac.id/artikel/${article.slug}`,
    publisher: {
      "@type": "EducationalOrganization",
      name: "Ma'had Aly DDI Mangkoso",
      url: "https://mahadaly-ddimangkoso.ac.id"
    }
  };

  return (
    <main className="pt-32 md:pt-40 lg:pt-60 pb-20 bg-slate-50 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c") }}
      />
      
      {/* Header Artikel. Lebar kolom baca 46rem (ketetapan 26 Nov 2026
          mengikuti riset panjang baris Dyson & Haselgrove: 45-75 huruf
          per baris; 52rem sebelumnya menghasilkan 85-95 huruf di
          desktop, terlalu panjang dan melelahkan). */}
      <section className="bg-mahad-green-dark text-white py-14 bg-islamic-pattern">
        <div className="max-w-[46rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4">
            <Link
              href={article.type === "opini" ? "/opini" : diSeriKajian ? "/kategori/kajian-fathul-qorib" : "/artikel"}
              className="inline-flex items-center gap-1.5 text-xs text-mahad-gold-light hover:text-white bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-full transition border border-white/15"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>{article.type === "opini" ? "Kembali ke Opini Santri" : diSeriKajian ? "Kembali ke Kajian Fathul Qorib" : "Kembali ke Mimbar Kajian"}</span>
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

          <div className="mt-6 pt-6 border-t border-emerald-800/80 flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between text-xs text-emerald-200">
            <div>
              <p className="font-bold text-white text-sm">{article.author}</p>
              <p className="text-emerald-300">{article.authorRole}</p>
            </div>
            <div className="text-left sm:text-right">
              <p>{article.date} ({article.hijriDate})</p>
              <p className="text-mahad-gold font-semibold">
                Waktu baca: &plusmn; {article.readTime}
              </p>
              <div className="mt-1.5 flex justify-start sm:justify-end">
                <ViewCount />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Badan Tulisan & Sidebar */}
      <div ref={bodyRef} className="relative max-w-[46rem] mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <ReadingBeam targetRef={bodyRef} />

        {/* Foto utama artikel dari thumbnail_url basis data, bila ada */}
        {article.imageUrl && (
          <figure className="relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-200 shadow-sm bg-slate-100">
            <GambarAman
              src={article.imageUrl}
              alt={article.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </figure>
        )}
        
        {/* Konten Utama */}
        <article className="bg-white rounded-2xl p-5 sm:p-10 lg:p-12 border border-slate-200 shadow-sm space-y-6">
          
          {/* Kotak Pokok Pikiran */}
          <div className="bg-emerald-50 border-l-4 border-emerald-700 p-5 rounded-r-xl">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1 font-bold">
              Pokok Pikiran
            </h4>
            <p className="text-slate-700 text-sm italic leading-relaxed">
              {article.excerpt}
            </p>
          </div>

          {/* Isi Teks Lengkap */}
          <div className="badan-tulisan text-slate-800 text-[1.0625rem] leading-[1.85] sm:text-lg sm:leading-[1.85] space-y-5 font-sans [overflow-wrap:anywhere]">
            <IsiTulisan content={article.content || isiLokal} />
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
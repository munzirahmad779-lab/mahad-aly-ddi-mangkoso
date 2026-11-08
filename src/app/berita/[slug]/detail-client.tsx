"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useArticles } from "@/context/ArticleContext";

interface BeritaDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default function BeritaDetailPage({ params }: BeritaDetailPageProps) {
  const { slug } = use(params);
  const { news, isCatalogReady } = useArticles();

  const cleanSlug = decodeURIComponent(slug || "").toLowerCase().trim();
  const item = (news || []).find(
    (n) => n.slug?.toLowerCase() === cleanSlug || n.id === slug
  );

  // Katalog sudah terkonfirmasi dari server tapi berita tetap tidak ada
  // → 404 sungguhan, bukan soft-404 berstatus 200.
  if (!item && isCatalogReady) {
    notFound();
  }

  if (!item) {
    return (
      <main className="pt-32 md:pt-40 lg:pt-60 pb-20 bg-slate-50 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-5xl mb-4">📰</div>
          <h1 className="font-serif font-bold text-2xl text-slate-800">
            Warta Berita Tidak Ditemukan
          </h1>
          <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
            Kabar atau berita yang Anda tuju mungkin telah diperbarui atau diarsipkan.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/berita"
              className="px-5 py-2.5 bg-mahad-gold text-mahad-green-dark font-bold text-xs rounded-full shadow hover:bg-yellow-400 transition"
            >
              Lihat Semua Warta
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

  return (
    <main className="pt-32 md:pt-40 lg:pt-60 pb-20 bg-slate-50 min-h-screen">
      <section className="bg-mahad-green-dark text-white py-14 bg-islamic-pattern">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4">
            <Link
              href="/berita"
              className="inline-flex items-center gap-1.5 text-xs text-mahad-gold-light hover:text-white bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-full transition border border-white/15"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Kembali ke Warta &amp; Berita</span>
            </Link>
          </div>
          <div className="mb-3">
            <span className="inline-block bg-mahad-gold text-mahad-green-dark text-xs font-bold px-3 py-0.5 rounded-full">
              {item.category}
            </span>
          </div>
          <h1 className="font-serif font-bold text-2xl sm:text-4xl text-white leading-snug">
            {item.title}
          </h1>
          <p className="text-xs text-emerald-200 mt-4">
            Diterbitkan pada: {item.date} &bull; Oleh: {item.author}
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Gambar Utama Berita (Opsional) */}
        {item.imageUrl && (
          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-white">
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full max-h-[480px] object-cover"
            />
          </div>
        )}

        <article className="bg-white rounded-2xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-6 text-slate-800 leading-relaxed text-base sm:text-lg">
          {(item.content || "").split(/\n\s*\n/).map((block: string, i: number) => {
            const t = block.trim();
            if (!t) return null;
            if (t.startsWith("## ")) {
              return (
                <h2 key={i} className="font-serif font-bold text-xl sm:text-2xl text-mahad-green-dark pt-2">
                  {t.slice(3)}
                </h2>
              );
            }
            if (t.startsWith("### ")) {
              return (
                <h3 key={i} className="font-serif font-bold text-lg sm:text-xl text-mahad-green-dark pt-1">
                  {t.slice(4)}
                </h3>
              );
            }
            if (i === 0) {
              const dash = t.indexOf("—");
              return (
                <p key={i} className="text-lg sm:text-xl leading-relaxed text-slate-700">
                  {dash > 0 ? (
                    <>
                      <strong className="font-bold text-mahad-green-dark">{t.slice(0, dash + 1)}</strong>
                      {t.slice(dash + 1)}
                    </>
                  ) : (
                    t
                  )}
                </p>
              );
            }
            return <p key={i}>{t}</p>;
          })}
        </article>

        {/* Berkas Lampiran / File Unduhan Resmi (Opsional) */}
        {item.attachmentUrl && (
          <div className="p-6 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
                📄
              </div>
              <div>
                <h4 className="font-bold text-emerald-950 text-sm sm:text-base">
                  {item.attachmentName || "Berkas Lampiran Resmi"}
                </h4>
                <p className="text-xs text-emerald-700">
                  {item.attachmentSize ? `Ukuran: ${item.attachmentSize} • ` : ""}Dokumen resmi terbitan Ma&apos;had Aly DDI Mangkoso
                </p>
              </div>
            </div>

            <a
              href={item.attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow transition shrink-0"
            >
              <span>📥 Unduh Berkas</span>
            </a>
          </div>
        )}
      </div>
    </main>
  );
}

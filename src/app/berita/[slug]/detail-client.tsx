"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useArticles } from "@/context/ArticleContext";
import ViewCount from "@/components/common/ViewCount";
import GambarAman from "@/components/common/GambarAman";
import { PanelSaran } from "@/components/common/PanelSaran";
import IsiTulisan from "@/components/common/IsiTulisan";
import {
  adalahTulisanHariGuru,
  tautanItemBerita
} from "@/lib/hari-guru";

interface BeritaDetailPageProps {
  params: Promise<{ slug: string }>;
  beritaAwal?: any;
}

export default function BeritaDetailPage({ params, beritaAwal }: BeritaDetailPageProps) {
  const { slug } = use(params);
  const { news, isCatalogReady } = useArticles();

  const cleanSlug = decodeURIComponent(slug || "").toLowerCase().trim();
  const itemKonteks = (news || []).find(
    (n) => n.slug?.toLowerCase() === cleanSlug || n.id === slug
  );
  // Sama seperti halaman artikel: data konteks didahulukan, isi berita
  // diambil dari mana pun yang sudah memuatnya (data awal server
  // membawanya sejak render pertama).
  const item = itemKonteks
    ? {
        ...(beritaAwal || {}),
        ...itemKonteks,
        content: itemKonteks.content || beritaAwal?.content || ""
      }
    : (beritaAwal ?? undefined);

  // Katalog sudah terkonfirmasi dari server tapi berita tetap tidak ada
  // → 404 sungguhan, bukan soft-404 berstatus 200.
  if (!item && isCatalogReady) {
    notFound();
  }

  if (!item) {
    return (
      <main className="pt-32 md:pt-40 lg:pt-60 pb-20 bg-slate-50 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-10 h-10 mx-auto rounded-full border-4 border-slate-200 border-t-mahad-gold animate-spin mb-4" />
          <h1 className="font-serif font-bold text-2xl text-slate-800">
            Memuat Berita
          </h1>
          <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
            Isi berita sedang dimuat, mohon tunggu sebentar.
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

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = encodeURIComponent(item.title);
  const wartaLain = (news || [])
    .filter((n) => n.id !== item.id && !adalahTulisanHariGuru(n))
    .slice(0, 3);

  return (
    <main className="pt-32 md:pt-40 lg:pt-60 pb-20 bg-slate-50 min-h-screen">
      <section className="bg-mahad-green-dark text-white py-14 bg-islamic-pattern">
        <div className="max-w-[46rem] mx-auto px-4 sm:px-6 lg:px-8">
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
          <div className="mt-3">
            <ViewCount />
          </div>
        </div>
      </section>

      <div className="max-w-[46rem] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Gambar Utama Berita (Opsional) */}
        {item.imageUrl && (
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-100">
            <GambarAman
              src={item.imageUrl}
              alt={item.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        )}

        <article className="badan-tulisan bg-white rounded-2xl p-5 sm:p-10 lg:p-12 border border-slate-200 shadow-sm space-y-6 text-slate-800 text-[1.0625rem] leading-[1.85] sm:text-lg sm:leading-[1.85] [overflow-wrap:anywhere]">
          <IsiTulisan content={item.content || ""} paragrafPembuka />

          {/* Baris bagikan, pola yang sama dengan laman artikel
              (temuan audit layout no. 11: bawah berita jalan buntu) */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Bagikan Warta Ini:
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

        {/* Panel saran khusus tulisan Hari Guru: saran terkunci ke
            tulisan ini, tanpa pilihan judul lain. */}
        {(item.category as string) === "Hari Guru" && (
          <PanelSaran
            terkunci={{ slug: item.slug, judul: item.title }}
          />
        )}

        {/* Berkas Lampiran / File Unduhan Resmi (Opsional) */}
        {item.attachmentUrl && (
          <div className="p-6 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-800 text-white flex items-center justify-center shadow-xs shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6M9 8h1m4-5H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z" />
                </svg>
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
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0 0l-4-4m4 4l4-4" />
                </svg>
                <span>Unduh Berkas</span>
            </a>
          </div>
        )}
        {/* Warta lainnya untuk melanjutkan membaca */}
        {wartaLain.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-2xl text-slate-900">
              Warta Lainnya
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {wartaLain.map((n) => (
                <Link
                  key={n.id}
                  href={tautanItemBerita(n)}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-emerald-700 shadow-sm hover:shadow-lg transition group flex flex-col"
                >
                  {n.imageUrl ? (
                    <div className="relative w-full h-36 overflow-hidden bg-slate-100">
                      <GambarAman
                        src={n.imageUrl}
                        alt={n.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="relative w-full h-36 overflow-hidden bg-emerald-900 flex items-center justify-center">
                      <div className="absolute inset-0 bg-islamic-pattern opacity-40"></div>
                      <img
                        src="/image_067524.png"
                        alt=""
                        className="relative h-16 w-16 object-contain opacity-90"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="p-4 flex flex-col gap-2">
                    <span className="self-start bg-emerald-100 text-emerald-800 font-bold text-[11px] px-2.5 py-0.5 rounded-full">
                      {n.category}
                    </span>
                    <span className="font-serif font-bold text-slate-900 leading-snug group-hover:text-emerald-800 transition line-clamp-3">
                      {n.title}
                    </span>
                    <span className="text-xs text-slate-500">{n.date}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

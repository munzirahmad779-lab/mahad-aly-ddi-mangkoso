"use client";

import { useMemo, useState } from "react";
import { useArticles } from "@/context/ArticleContext";
import { hitungWaktuBaca } from "@/lib/content-mappers";
import type { NewsItem } from "@/lib/types";

// Registri penulis Open Tulisan Hari Guru.
// Cara menambah peserta baru: tambahkan satu entri di daftar ini dengan
// slug yang persis sama dengan slug baris berita bertipe "Hari Guru"
// milik penulis itu, nama penulis, dan keterangan (boleh dikosongkan).
// Urutan tombol di laman mengikuti urutan daftar ini. Bila slug seorang
// peserta belum ada di data berita, entri itu dilewati diam-diam sampai
// baris beritanya diterbitkan.
const REGISTRI_PENULIS = [
  {
    slug: "guru-yang-menjadi-lentera-kenangan-bersama-para-pembimbingku-di-hari-guru",
    nama: "Mona Az-zaqiyyah",
    keterangan: "Mahasantri Sanah Ula"
  },
  {
    slug: "tentang-mereka-yang-menanamkan-cahaya",
    nama: "Wiladah Mazkiyah",
    keterangan: ""
  },
  {
    slug: "menghayati-sebuah-mosi-otokritik-untuk-mahasantri",
    nama: "Fikran Zahir",
    keterangan: ""
  }
];

const TIPE_HARI_GURU = "Hari Guru";

interface PesertaTampil {
  slug: string;
  nama: string;
  keterangan: string;
  item: NewsItem;
}

function inisialNama(nama: string): string {
  return nama
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((kata) => kata[0]?.toUpperCase() || "")
    .join("");
}

// Render badan tulisan dengan aturan yang sama seperti detail berita:
// blok dipisah baris kosong menjadi paragraf, "## " menjadi h2, dan
// "### " menjadi h3.
function IsiTulisan({ konten }: { konten: string }) {
  return (
    <>
      {(konten || "").split(/\n\s*\n/).map((block: string, i: number) => {
        const t = block.trim();
        if (!t) return null;
        if (t.startsWith("## ")) {
          return (
            <h2
              key={i}
              className="font-serif font-bold text-xl sm:text-2xl text-mahad-green-dark pt-2"
            >
              {t.slice(3)}
            </h2>
          );
        }
        if (t.startsWith("### ")) {
          return (
            <h3
              key={i}
              className="font-serif font-bold text-lg sm:text-xl text-mahad-green-dark pt-1"
            >
              {t.slice(4)}
            </h3>
          );
        }
        return <p key={i}>{t}</p>;
      })}
    </>
  );
}

export default function HariGuruPage() {
  const { news, isCatalogReady } = useArticles();
  const [slugAktif, setSlugAktif] = useState<string | null>(null);
  const [tersalin, setTersalin] = useState(false);

  // Saring berita bertipe persis "Hari Guru" (kolom tipe terpetakan ke
  // field category), lalu cocokkan ke registri berdasarkan slug. Urutan
  // hasil mengikuti registri, bukan urutan data.
  const peserta = useMemo<PesertaTampil[]>(() => {
    const daftar = (Array.isArray(news) ? news : []).filter(
      (n) => (n.category as string) === TIPE_HARI_GURU
    );
    const hasil: PesertaTampil[] = [];
    for (const p of REGISTRI_PENULIS) {
      const item = daftar.find(
        (n) => n.slug?.toLowerCase() === p.slug.toLowerCase()
      );
      if (item) hasil.push({ ...p, item });
    }
    return hasil;
  }, [news]);

  const terpilih = peserta.find((p) => p.slug === slugAktif) || peserta[0] || null;

  const bagikan = async () => {
    if (!terpilih) return;
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: terpilih.item.title, url });
      } catch {
        // Dialog bagikan dibatalkan user; tidak ada tindakan lanjutan.
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setTersalin(true);
        window.setTimeout(() => setTersalin(false), 2500);
      } catch {
        // Clipboard tidak tersedia; jangan mengaku tautan tersalin.
      }
    }
  };

  return (
    <main className="pt-32 md:pt-40 lg:pt-60 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Kepala laman */}
        <div className="text-center">
          <span className="inline-block bg-mahad-gold text-mahad-green-dark text-xs font-bold px-3.5 py-1 rounded-full tracking-widest">
            KHUSUS • HARI GURU
          </span>
          <h1 className="font-serif font-bold text-3xl sm:text-5xl text-mahad-green-dark mt-4">
            Open Tulisan Hari Guru
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto mt-3">
            Kumpulan tulisan refleksi mahasantri dalam memperingati Hari Guru.
            Pilih nama penulis untuk membaca karyanya.
          </p>
        </div>

        {!isCatalogReady ? (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm text-center py-16 px-6 mt-10">
            <div className="w-10 h-10 mx-auto rounded-full border-4 border-slate-200 border-t-mahad-gold animate-spin" />
            <h2 className="font-serif font-bold text-xl text-slate-800 mt-5">
              Memuat Tulisan
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              Kumpulan tulisan Hari Guru sedang dimuat, mohon tunggu sebentar.
            </p>
          </div>
        ) : peserta.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm text-center py-16 px-6 mt-10">
            <h2 className="font-serif font-bold text-xl text-slate-800">
              Tulisan Sedang Disiapkan
            </h2>
            <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
              Tulisan Hari Guru akan tampil di laman ini begitu diterbitkan.
            </p>
          </div>
        ) : (
          <>
            {/* Sebaris tombol pilih nama penulis */}
            <div className="flex flex-wrap justify-center gap-2.5 mt-10">
              {peserta.map((p) => {
                const aktif = terpilih?.slug === p.slug;
                return (
                  <button
                    key={p.slug}
                    type="button"
                    onClick={() => setSlugAktif(p.slug)}
                    aria-pressed={aktif}
                    className={
                      aktif
                        ? "inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold border border-mahad-gold bg-mahad-gold text-mahad-green-dark shadow-sm transition"
                        : "inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold border border-mahad-green-dark/30 bg-white text-mahad-green-dark hover:border-mahad-green-dark hover:bg-emerald-50 transition"
                    }
                  >
                    {aktif && (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                    {p.nama}
                  </button>
                );
              })}
            </div>

            {/* Kartu baca */}
            {terpilih && (
              <article className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-12 mt-8">
                <h2 className="font-serif font-bold text-2xl sm:text-3xl text-mahad-green-dark text-center leading-snug">
                  {terpilih.item.title}
                </h2>
                <div className="flex items-center justify-center gap-3 mt-6">
                  <div className="w-11 h-11 shrink-0 rounded-full bg-mahad-green-dark text-mahad-gold flex items-center justify-center font-serif font-bold">
                    {inisialNama(terpilih.nama)}
                  </div>
                  <div>
                    <p className="text-sm text-slate-700">
                      oleh{" "}
                      <span className="font-bold text-mahad-green-dark">
                        {terpilih.nama}
                      </span>
                      {" • "}
                      {terpilih.item.date}
                      {" • "}
                      {hitungWaktuBaca(terpilih.item.content)} membaca
                    </p>
                    {terpilih.keterangan && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        {terpilih.keterangan}
                      </p>
                    )}
                  </div>
                </div>
                <div className="w-24 h-0.5 bg-mahad-gold rounded mx-auto my-8" />
                <div className="space-y-6 text-slate-800 leading-relaxed text-base sm:text-lg">
                  <IsiTulisan konten={terpilih.item.content} />
                </div>
              </article>
            )}

            {/* Bagikan */}
            <div className="text-center mt-8">
              <button
                type="button"
                onClick={bagikan}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-mahad-green-dark text-white font-bold text-sm rounded-full shadow hover:opacity-90 transition"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.59 13.51l6.83 3.98m-.01-10.98l-6.82 3.98M21 5a3 3 0 11-6 0 3 3 0 016 0zM9 12a3 3 0 11-6 0 3 3 0 016 0zm12 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Bagikan
              </button>
              {tersalin && (
                <p className="text-sm text-emerald-700 mt-2">Tautan disalin</p>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

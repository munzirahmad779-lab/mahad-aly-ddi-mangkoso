"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useArticles } from "@/context/ArticleContext";
import ArticleCard from "@/components/articles/ArticleCard";
import { muatPetaKunjungan, segarkanPetaBerkala } from "@/components/common/ViewCount";
import Reveal from "@/components/common/Reveal";
import { urutkanPrioritas } from "@/lib/priorities";
import { dalamSeriKajianFathulQorib } from "@/lib/content-mappers";

export default function LatestArticles() {
  const { articles, homePriorities } = useArticles();
  const [selectedCategory, setSelectedCategory] = useState<string>("semua");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [pages, setPages] = useState<Record<string, number>>({});

  useEffect(() => {
    let alive = true;
    const pakai = (p: Record<string, number>) => {
      if (alive) setPages(p);
    };
    muatPetaKunjungan().then(pakai);
    const berhenti = segarkanPetaBerkala(pakai);
    return () => {
      alive = false;
      berhenti();
    };
  }, []);

  // Beranda hanya menampilkan artikel terbit; draf tidak tampil dan
  // tidak ikut terhitung di teks jumlah artikel. Seri Kajian Fathul
  // Qorib juga dikeluarkan (ketetapan user 19 Nov 2026): serinya
  // khusus di ruang Kajian & Diskusi, bukan di bagian Mimbar beranda.
  const publicArticles = articles.filter(
    (a) => a.status !== "draft" && !dalamSeriKajianFathulQorib(a)
  );

  // Paling banyak dibaca: angka pembaca WAJIB dari peta kunjungan
  // server yang sama dengan lencana pembaca di kartu dan di halaman
  // artikel (gabungan era blob + era tabel atomik), BUKAN kolom views
  // atomik yang hanya menghitung sejak 11 Nov 2026. Panel ini pernah
  // menampilkan 9 pembaca untuk artikel Nurhayati yang angka riilnya
  // 60 (kasus 22 Nov 2026) karena memakai kolom atomik itu.
  const pembacaRiil = (a: (typeof publicArticles)[number]) => {
    const n = pages[`/artikel/${a.slug}`];
    return typeof n === "number" ? n : a.views || 0;
  };

  // Kandidat panel Paling Dibaca: sepuluh artikel teratas menurut
  // pembaca riil yang jumlah pembacanya lebih dari nol. Sejak 26 Nov
  // 2026 panel menampilkannya BERGILIR menurut kepopuleran (perintah
  // user): lima artikel dalam satu waktu sebagai daftar peringkat
  // bernomor asli, berganti tiap 6 detik bila kandidat lebih dari
  // lima (putaran pertama peringkat 1-5, putaran kedua 6-10, lalu
  // kembali ke awal). Putaran berhenti sementara selama pointer atau
  // fokus keyboard berada di panel. Panel hanya tampil bila kandidat
  // sedikitnya tiga; kandidat tiga sampai lima tampil semua tanpa
  // putaran.
  const kandidatPalingDibaca = [...publicArticles]
    .map((a) => ({ ...a, views: pembacaRiil(a) }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10)
    .filter((a) => a.views > 0);

  const PER_PUTARAN = 5;
  const jumlahPutaran = Math.ceil(kandidatPalingDibaca.length / PER_PUTARAN);
  const [indeksPutaran, setIndeksPutaran] = useState(0);
  const [jedaPutaran, setJedaPutaran] = useState(false);

  useEffect(() => {
    if (jumlahPutaran <= 1 || jedaPutaran) return;
    const id = setInterval(() => {
      setIndeksPutaran((i) => (i + 1) % jumlahPutaran);
    }, 6000);
    return () => clearInterval(id);
  }, [jumlahPutaran, jedaPutaran]);

  const putaranAktif = jumlahPutaran > 0 ? indeksPutaran % jumlahPutaran : 0;
  const palingDibaca = kandidatPalingDibaca.slice(
    putaranAktif * PER_PUTARAN,
    putaranAktif * PER_PUTARAN + PER_PUTARAN
  );

  // Prioritas admin (panel Prioritas Beranda) tampil lebih dulu;
  // sisanya mengikuti urutan asal (terbaru dulu).
  const orderedArticles = urutkanPrioritas(publicArticles, homePriorities?.articles);
  const filteredArticles = orderedArticles.filter((art) => {
    const matchesCategory =
      selectedCategory === "semua" || art.category === selectedCategory;
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Beranda dibatasi 6 kajian (perintah user 13 Nov 2026); katalog
  // lengkapnya tetap di halaman /artikel.
  const displayedArticles = filteredArticles.slice(0, 6);

  return (
    <section id="mimbar-kajian" className="py-24 bg-emerald-50/60 border-t border-emerald-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header Bagian Artikel */}
        <Reveal>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-200/80 px-3 py-1 rounded-full">
              Kajian Ilmiah &amp; Riset
            </span>
            <h2 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-emerald-950 mt-3">
              Mimbar Kajian Keislaman
            </h2>
            <div className="h-1.5 w-20 bg-mahad-gold mt-4 mb-2 rounded-full"></div>
            <p className="text-slate-600 text-sm sm:text-base">
              Kumpulan tulisan akademik, telaah usuliyah, dan esai sivitas akademika ({publicArticles.length} artikel terbit).
            </p>
          </div>

          <Link
            href="/kirim-tulisan"
            className="self-start md:self-auto inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-6 py-3.5 rounded-xl shadow transition"
          >
            <svg className="w-4 h-4 text-mahad-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span>Kirim Naskah Anda</span>
          </Link>
        </div>
        </Reveal>

        {/* Paling Dibaca: peringkat berdasarkan pembaca riil, tampil bergilir */}
        {kandidatPalingDibaca.length >= 3 && (
          <div
            className="mt-8 bg-white rounded-2xl border border-emerald-100 shadow-sm p-5 sm:p-6"
            onMouseEnter={() => setJedaPutaran(true)}
            onMouseLeave={() => setJedaPutaran(false)}
            onFocus={() => setJedaPutaran(true)}
            onBlur={() => setJedaPutaran(false)}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">📈</span>
              <h3 className="font-serif font-bold text-lg text-emerald-950">Paling Dibaca</h3>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                berdasarkan pembaca riil
              </span>
            </div>
            <div key={putaranAktif} aria-live="off" className="transition-opacity duration-500 animate-kalam-masuk">
              <ol className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
                {palingDibaca.map((art, idx) => {
                  const peringkat = putaranAktif * PER_PUTARAN + idx + 1;
                  return (
                    <li key={art.id}>
                      <Link
                        href={`/artikel/${art.slug}`}
                        className="group flex gap-3 items-start p-3 rounded-xl hover:bg-emerald-50 transition h-full"
                      >
                        <span className={`font-serif font-bold text-xl leading-none mt-0.5 ${
                          peringkat === 1 ? "text-mahad-gold" : "text-slate-300 group-hover:text-emerald-700"
                        }`}>
                          {peringkat}
                        </span>
                        <span>
                          <span className="block text-xs font-bold text-slate-800 group-hover:text-emerald-900 leading-snug line-clamp-2">
                            {art.title}
                          </span>
                          <span className="block text-[10px] text-slate-500 mt-1">
                            {art.author} · {art.views} pembaca
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </div>
            {jumlahPutaran > 1 && (
              <div className="mt-4 flex justify-center gap-2">
                {Array.from({ length: jumlahPutaran }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Putaran populer ke-${i + 1}`}
                    onClick={() => setIndeksPutaran(i)}
                    className={`h-2 w-2 rounded-full transition-colors ${
                      i === putaranAktif ? "bg-emerald-800" : "bg-slate-300"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Filter Tombol & Input Pencarian */}
        <div className="mt-10 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory("semua")}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold border transition ${
                selectedCategory === "semua"
                  ? "bg-emerald-800 text-white border-emerald-800"
                  : "bg-white text-slate-700 border-slate-300 hover:border-emerald-800"
              }`}
            >
              Semua Kajian
            </button>

            {/* Tombol Spesial Karya Anregurutta */}
            <button
              type="button"
              onClick={() => setSelectedCategory("karya-anregurutta")}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold border-2 transition flex items-center gap-1.5 ${
                selectedCategory === "karya-anregurutta"
                  ? "bg-mahad-gold text-mahad-green-dark border-mahad-gold shadow-sm"
                  : "bg-amber-100 text-amber-900 border-mahad-gold hover:bg-mahad-gold hover:text-mahad-green-dark"
              }`}
            >
              <span>★ Karya Anregurutta</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory("usul-fikih")}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold border transition ${
                selectedCategory === "usul-fikih"
                  ? "bg-emerald-800 text-white border-emerald-800"
                  : "bg-white text-slate-700 border-slate-300 hover:border-emerald-800"
              }`}
            >
              Usul Fikih
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory("tafsir-hadis")}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold border transition ${
                selectedCategory === "tafsir-hadis"
                  ? "bg-emerald-800 text-white border-emerald-800"
                  : "bg-white text-slate-700 border-slate-300 hover:border-emerald-800"
              }`}
            >
              Tafsir &amp; Hadis
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              placeholder="Cari judul atau penulis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-full text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-mahad-gold shadow-sm"
            />
          </div>

        </div>

        {/* Grid Artikel */}
        {displayedArticles.length > 0 ? (
          <>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedArticles.map((article, idx) => (
              <Reveal key={article.id} delay={(idx % 3) * 0.08} className="h-full">
                <div className="relative h-full [&>article]:h-full">
                  {homePriorities?.articles?.includes(article.id) && (
                    <span className="absolute -top-2.5 left-4 z-10 bg-mahad-gold text-mahad-green-dark text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow">
                      Pilihan Redaksi
                    </span>
                  )}
                  <ArticleCard article={article} />
                </div>
              </Reveal>
            ))}
          </div>
          {filteredArticles.length > displayedArticles.length && (
            <div className="mt-10 text-center">
              <Link
                href="/artikel"
                className="inline-flex items-center gap-2 border-2 border-emerald-800 text-emerald-900 hover:bg-emerald-800 hover:text-white font-bold px-6 py-3 rounded-xl transition"
              >
                <span>Lihat Semua {filteredArticles.length} Kajian</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          )}
          </>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 mt-8 shadow-sm">
            <p className="text-slate-600 font-medium mb-3">
              Tidak ada artikel yang cocok dengan kriteria pencarian Anda.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("semua");
                setSearchQuery("");
              }}
              className="text-sm text-emerald-800 font-bold underline"
            >
              Reset Filter &amp; Tampilkan Semua
            </button>
          </div>
        )}

      </div>
    </section>
  );
}

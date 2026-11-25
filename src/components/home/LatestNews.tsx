"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useArticles } from "@/context/ArticleContext";
import Reveal from "@/components/common/Reveal";
import { CardViewCount, muatPetaKunjungan, segarkanPetaBerkala } from "@/components/common/ViewCount";
import {
  KARTU_GABUNGAN_HARI_GURU,
  adalahTulisanHariGuru,
  tautanItemBerita
} from "@/lib/hari-guru";

export default function LatestNews() {
  const { news } = useArticles();
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

  // Panel Warta & Berita berdiri sendiri, terpisah dari panel Mimbar
  // (perintah user 10 Nov 2026). Sejak 13 Nov 2026 panel ini adalah
  // panel PALING POPULER (perintah user): warta dengan pembaca
  // terbanyak menurut peta kunjungan server yang sama dengan lencana
  // jumlah pembaca di kartu; bila views seri, urutan data awal yang
  // dipertahankan (terbaru dulu). Panel ini tampil di beranda SEBELUM
  // panel Mimbar Kajian (urutan home_sections di basis data).
  //
  // Sejak 26 Nov 2026 tampilannya BERGILIR menurut kepopuleran
  // (perintah user): kandidat adalah delapan warta teratas yang
  // pembacanya lebih dari nol, ditampilkan dua kartu dalam satu waktu
  // dan berganti tiap 6 detik mengikuti urutan peringkat (1-2, lalu
  // 3-4, lalu 5-6, lalu 7-8, lalu kembali ke awal). Bila belum ada
  // warta yang tercatat dibaca, kandidat kembali ke perilaku lama:
  // empat warta pertama menurut urutan data awal. Putaran berhenti
  // sementara selama pointer atau fokus keyboard berada di bagian ini.
  // Perintah user 26 Nov 2026: tiga tulisan Hari Guru tidak ikut
  // berputar satu-satu di panel ini; panel menampilkan satu kartu
  // gabungan tertaut ke laman /hari-guru, ditambahkan sebagai
  // kandidat terakhir sesudah kandidat populer terpilih.
  const kabarBiasa = news.filter((item) => !adalahTulisanHariGuru(item));
  const terurut = [...kabarBiasa].sort(
    (a, b) =>
      (pages[`/berita/${b.slug}`] || 0) - (pages[`/berita/${a.slug}`] || 0)
  );
  const populer = terurut.filter(
    (item) => (pages[`/berita/${item.slug}`] || 0) > 0
  );
  const kandidat = populer.length > 0 ? populer.slice(0, 8) : terurut.slice(0, 4);
  if (news.some(adalahTulisanHariGuru)) {
    // NewsItem membatasi category ke Berita/Pengumuman/Agenda, padahal
    // tipe "Hari Guru" memang hidup di basis data dan dipetakan konteks
    // apa adanya; kartu gabungan dicast mengikuti bentuk kandidat.
    kandidat.push(
      KARTU_GABUNGAN_HARI_GURU as unknown as (typeof kandidat)[number]
    );
  }

  const PER_PUTARAN = 2;
  const jumlahPutaran = Math.ceil(kandidat.length / PER_PUTARAN);
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
  const tampil = kandidat.slice(
    putaranAktif * PER_PUTARAN,
    putaranAktif * PER_PUTARAN + PER_PUTARAN
  );

  return (
    <section
      className="py-20 bg-slate-50 border-t border-slate-200"
      onMouseEnter={() => setJedaPutaran(true)}
      onMouseLeave={() => setJedaPutaran(false)}
      onFocus={() => setJedaPutaran(true)}
      onBlur={() => setJedaPutaran(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <Reveal>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
              Paling Populer
            </span>
            <h2 className="font-serif font-bold text-3xl sm:text-4xl text-slate-900 mt-3">
              Warta &amp; Berita Ma&apos;had Aly
            </h2>
            <div className="h-1.5 w-16 bg-mahad-gold mt-3 mb-2 rounded-full"></div>
          </div>

          <Link
            href="/berita"
            className="text-xs sm:text-sm font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
          >
            <span>Lihat Semua Warta &amp; Berita</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
        </Reveal>

        <div
          key={putaranAktif}
          aria-live="off"
          className="grid grid-cols-1 md:grid-cols-2 gap-6 transition-opacity duration-500 animate-kalam-masuk"
        >
          {tampil.map((item) => (
            <article
              key={item.id}
              className="h-full bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-emerald-700 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {item.imageUrl ? (
                  <div className="relative w-full h-48 overflow-hidden bg-slate-100">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    {item.attachmentUrl && (
                      <span className="absolute top-3 right-3 bg-amber-500 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                        <span>📎 Dokumen Lampiran</span>
                      </span>
                    )}
                  </div>
                ) : (
                  // Berita tanpa foto sampul: tampilkan sampul penanda resmi
                  // (lambang kampus di atas pola) setinggi sampul foto, supaya
                  // kartu tidak menyisakan ruang putih kosong besar karena
                  // kartu setinggi kartu berfoto di baris yang sama
                  // (perbaikan bug 25 Nov 2026).
                  <div className="relative w-full h-48 overflow-hidden bg-emerald-900 flex items-center justify-center">
                    <div className="absolute inset-0 bg-islamic-pattern opacity-40"></div>
                    <img
                      src="/image_067524.png"
                      alt=""
                      className="relative h-24 w-24 object-contain opacity-90"
                      loading="lazy"
                    />
                    {item.attachmentUrl && (
                      <span className="absolute top-3 right-3 bg-amber-500 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                        <span>📎 Dokumen Lampiran</span>
                      </span>
                    )}
                  </div>
                )}
                <div className="p-6 sm:p-8 pb-0">
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
                      {item.category}
                    </span>
                    <span className="text-slate-500">{item.date}</span>
                  </div>
                  <h3 className="font-serif font-bold text-xl text-slate-900 leading-snug mb-3 group-hover:text-emerald-800 transition">
                    <Link href={tautanItemBerita(item)}>{item.title}</Link>
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">
                    {item.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-6 sm:p-8 pt-0">
                <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500">Oleh: <strong>{item.author}</strong></span>
                    <CardViewCount
                      slug={item.slug}
                      basePath={item.id === KARTU_GABUNGAN_HARI_GURU.id ? "" : "/berita"}
                    />
                  </div>
                  <Link
                    href={tautanItemBerita(item)}
                    className="font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Baca Selengkapnya</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {jumlahPutaran > 1 && (
          <div className="mt-6 flex justify-center gap-2">
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
    </section>
  );
}

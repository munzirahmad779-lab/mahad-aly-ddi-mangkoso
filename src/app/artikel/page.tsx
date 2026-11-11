"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useArticles } from "@/context/ArticleContext";
import ArticleCard from "@/components/articles/ArticleCard";
import { kolomDariKategori } from "@/lib/content-mappers";
import type { Article, CategoryInfo, KolomArtikel } from "@/lib/types";

const KOLOM_LABEL_KOSONG: Record<KolomArtikel, string> = {
  fiqh: "kajian fikih",
  kitab: "kajian kitab",
  tematik: "kajian tematik",
  esai: "tulisan opini",
  berita: "berita kampus"
};

export default function AllArticlesPage() {
  const { articles, categories, pageTexts } = useArticles();
  // Tab "semua" adalah tampilan awal Mimbar Mahad (ketetapan user 8 Nov
  // 2026): campuran seluruh tulisan terbit (artikel, kajian tematik,
  // opini, karya ilmiah fiqh kontemporer, kitab, dan berita), bukan
  // membuka pada satu kolom yang bisa jadi hanya berisi satu tulisan.
  const [activeTab, setActiveTab] = useState<KolomArtikel | "semua">("semua");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "popular">("newest");
  // Peta jumlah dilihat dari catatan kunjungan server, sumber yang sama
  // dengan angka "Dilihat X kali" di kartu. Urutan "Paling Populer" wajib
  // membaca peta ini: kolom views di tabel artikel hampir semuanya 0,
  // jadi mengurutkan berdasar kolom itu tidak mengubah urutan apa pun
  // (bug yang dilaporkan user 11 Nov 2026).
  const [petaPopuler, setPetaPopuler] = useState<Record<string, number>>({});
  useEffect(() => {
    let hidup = true;
    fetch("/api/analytics/stats", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!hidup) return;
        if (d && d.stats && d.stats.pages && typeof d.stats.pages === "object") {
          setPetaPopuler(d.stats.pages as Record<string, number>);
        }
      })
      .catch(() => {});
    return () => {
      hidup = false;
    };
  }, []);
  const jumlahDilihat = (a: Article): number => {
    const dariServer = petaPopuler[`/artikel/${a.slug}`];
    return typeof dariServer === "number" ? dariServer : a.views || 0;
  };
  // Saringan kelompok penulis (ketetapan user 8 Nov 2026): Dosen,
  // Alumni, Mahasiswa. Kelompok dibaca dari peran penulis (authorRole);
  // peran yang tidak menyebut dosen/alumni tergolong mahasiswa, sesuai
  // keadaan data saat ini yang seluruhnya mahasantri.
  const [kelompok, setKelompok] = useState<"semua" | "dosen" | "alumni" | "mahasiswa">("semua");
  const kelompokPenulis = (a: Article): "dosen" | "alumni" | "mahasiswa" => {
    const r = (a.authorRole || "").toLowerCase();
    if (
      r.includes("dosen") ||
      r.includes("masyayikh") ||
      r.includes("pimpinan") ||
      r.includes("mudir") ||
      r.includes("rektor")
    ) {
      return "dosen";
    }
    if (r.includes("alumni")) return "alumni";
    return "mahasiswa";
  };
  const KELOMPOK_LABEL: Record<string, string> = {
    semua: "Semua Penulis",
    dosen: "Dosen",
    alumni: "Alumni",
    mahasiswa: "Mahasiswa"
  };

  // Kolom kategori: pakai field kolom bila ada, selain itu turunkan dari slug.
  const kolomKategori = (c: CategoryInfo): KolomArtikel =>
    c.kolom ?? kolomDariKategori(c.slug, c.type);
  // Kolom artikel diselesaikan lewat kategorinya (cocok slug atau id), agar
  // artikel basis data yang category-nya berupa id tetap tergolong benar.
  const kategoriArtikel = (a: Article): CategoryInfo | undefined =>
    categories.find((c) => c.slug === a.category || c.id === a.category);
  const kolomArtikel = (a: Article): KolomArtikel => {
    const cat = kategoriArtikel(a);
    return cat ? kolomKategori(cat) : (a.kolom ?? kolomDariKategori(a.category, a.type));
  };
  const slugKategoriArtikel = (a: Article): string =>
    kategoriArtikel(a)?.slug ?? a.category;
  // Sisi publik hanya menampilkan artikel terbit; draf tidak dihitung
  // di lencana tab dan tidak ditampilkan sebagai kartu.
  const publicArticles = articles.filter((a) => a.status !== "draft");
  const hitungKolom = (k: KolomArtikel) =>
    publicArticles.filter((a) => kolomArtikel(a) === k).length;

  const TABS: {
    key: KolomArtikel | "semua";
    label: string;
    icon: string;
    semuaLabel: string;
    aktifClass: string;
    badgeAktifClass: string;
  }[] = [
    {
      key: "semua",
      label: "Semua",
      icon: "🕌",
      semuaLabel: "Semua Kategori",
      aktifClass: "bg-emerald-900",
      badgeAktifClass: "bg-emerald-950 text-emerald-200"
    },
    {
      key: "fiqh",
      label: pageTexts?.artikelFiqhTabLabel || "Kajian Fiqh Mu'asarah",
      icon: "🏛️",
      semuaLabel: "Semua Gugus Fiqh",
      aktifClass: "bg-emerald-800",
      badgeAktifClass: "bg-emerald-950 text-emerald-200"
    },
    {
      key: "kitab",
      label: "Kajian Kitab dan Pengajian",
      icon: "📖",
      semuaLabel: "Semua Kategori Kitab",
      aktifClass: "bg-emerald-700",
      badgeAktifClass: "bg-emerald-950 text-emerald-200"
    },
    {
      key: "tematik",
      label: "Kajian Tematik",
      icon: "📚",
      semuaLabel: "Semua Kategori Tematik",
      aktifClass: "bg-teal-700",
      badgeAktifClass: "bg-teal-950 text-teal-200"
    },
    {
      key: "esai",
      label: pageTexts?.artikelOpiniTabLabel || "Opini & Refleksi Santri",
      icon: "✍️",
      semuaLabel: "Semua Tema Esai",
      aktifClass: "bg-amber-600",
      badgeAktifClass: "bg-amber-800 text-amber-200"
    }
  ];
  const tabAktif = TABS.find((t) => t.key === activeTab) ?? TABS[0];

  const activeArticles =
    activeTab === "semua"
      ? publicArticles
      : publicArticles.filter((a) => kolomArtikel(a) === activeTab);
  const activeCategories =
    activeTab === "semua"
      ? categories
      : categories.filter((c) => kolomKategori(c) === activeTab);

  const filtered = activeArticles
    .filter((a) => {
      const matchCat = selectedCategory === "all" || slugKategoriArtikel(a) === selectedCategory;
      const matchKelompok = kelompok === "semua" || kelompokPenulis(a) === kelompok;
      const matchSearch =
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.author.toLowerCase().includes(search.toLowerCase()) ||
        a.excerpt.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch && matchKelompok;
    })
    .sort((a, b) => {
      if (sortBy === "popular") {
        return jumlahDilihat(b) - jumlahDilihat(a);
      }
      return 0; // default order is newest
    });

  return (
    <main className="pt-32 md:pt-40 lg:pt-60 pb-20 bg-slate-50 min-h-screen">
      {/* Header Banner Dinamis */}
      <section className="bg-mahad-green-dark text-white py-14 bg-islamic-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-mahad-gold bg-white/10 px-3.5 py-1 rounded-full">
            {activeTab === "semua"
              ? "Mimbar Mahad"
              : activeTab === "berita"
                ? "Warta Kampus"
                : activeTab !== "esai"
                  ? (pageTexts?.artikelBadge || "Publikasi Ilmiah Takhassus")
                  : (pageTexts?.opiniBadge || "Ruang Gagasan Santri & Esai")}
          </span>
          <h1 className="font-serif font-bold text-3xl sm:text-5xl text-white mt-3">
            {activeTab === "semua"
              ? "Mimbar Mahad"
              : activeTab === "berita"
                ? "Berita & Kegiatan"
                : activeTab !== "esai"
                  ? (pageTexts?.artikelTitle || "Mimbar Kajian Fiqh Mu'asarah")
                  : (pageTexts?.opiniTitle || "Mimbar Opini & Refleksi Santri")}
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base max-w-2xl mx-auto mt-2">
            {activeTab === "semua"
              ? "Seluruh tulisan terbit Ma'had Aly DDI Mangkoso dalam satu mimbar: artikel, kajian tematik, opini dan refleksi, serta karya ilmiah fiqh kontemporer."
              : activeTab === "berita"
                ? "Kabar kegiatan, pengumuman, dan liputan resmi Ma'had Aly DDI Mangkoso."
                : activeTab !== "esai"
                  ? (pageTexts?.artikelDesc ||
                      "Kumpulan artikel telaah hukum Islam kontemporer, kajian ushul fikih, dan risalah pemikiran ulama DDI Mangkoso.")
                  : (pageTexts?.opiniDesc ||
                      "Refleksi sosial keagamaan, catatan adab santri, dan esai pemikiran mahasantri serta asatidz Ma'had Aly DDI Mangkoso.")}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Tab Switcher 4 Kolom */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key);
                  setSelectedCategory("all");
                }}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                  activeTab === tab.key
                    ? `${tab.aktifClass} text-white shadow`
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === tab.key ? tab.badgeAktifClass : "bg-slate-200 text-slate-600"}`}>
                  {tab.key === "semua" ? publicArticles.length : hitungKolom(tab.key)}
                </span>
              </button>
            ))}
          </div>

          <Link
            href="/kirim-tulisan"
            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 self-center"
          >
            <span>✉️</span>
            <span>Kirim Tulisan / Opini Anda &rarr;</span>
          </Link>
        </div>

        {/* Controls */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-12 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 mr-1">
              Kelompok Penulis:
            </span>
            {(["semua", "dosen", "alumni", "mahasiswa"] as const).map((k) => {
              const jumlah =
                k === "semua"
                  ? activeArticles.length
                  : activeArticles.filter((a) => kelompokPenulis(a) === k).length;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKelompok(k)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                    kelompok === k
                      ? "bg-emerald-800 text-white shadow"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {KELOMPOK_LABEL[k]} ({jumlah})
                </button>
              );
            })}
          </div>

          <div className="md:col-span-6 relative">
            <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              placeholder={activeTab === "esai" ? "Cari judul opini atau nama santri..." : "Cari judul kajian fikih atau penulis..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-mahad-gold"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-mahad-gold"
            >
              <option value="all">
                {tabAktif.semuaLabel}
              </option>
              {activeCategories.map((c) => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-mahad-gold"
            >
              <option value="newest">Urutkan: Terbaru</option>
              <option value="popular">Urutkan: Paling Populer</option>
            </select>
          </div>
        </div>

        {/* Grid Articles */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((art) => (
              <ArticleCard key={art.id} article={art} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <p className="text-slate-600 font-medium">
              Tidak ada {kelompok !== "semua" ? `tulisan ${KELOMPOK_LABEL[kelompok].toLowerCase()}` : activeTab === "semua" ? "tulisan" : KOLOM_LABEL_KOSONG[activeTab]} yang cocok dengan pencarian Anda.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedCategory("all");
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700"
            >
              Reset Filter
            </button>
          </div>
        )}

        {/* Elemen Tambahan Kustom CMS Halaman Artikel */}
        {(() => {
          const customArtikelElements = (pageTexts?.customElements || []).filter(
            (el) => el.page === "artikel"
          );
          if (customArtikelElements.length === 0) return null;

          return (
            <div className="space-y-6 pt-6">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-8 bg-mahad-gold rounded-full inline-block"></span>
                <h2 className="font-serif font-bold text-2xl text-slate-900">
                  Rubrik &amp; Informasi Publikasi Tambahan
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {customArtikelElements.map((el) => (
                  <div
                    key={el.id}
                    className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      {el.icon && <span className="text-2xl">{el.icon}</span>}
                      {el.badge && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                          {el.badge}
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif font-bold text-lg text-slate-900">{el.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">{el.desc}</p>
                    {el.link && (
                      <div className="pt-2">
                        <a
                          href={el.link}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 underline"
                        >
                          <span>Pelajari Selengkapnya</span>
                          <span>&rarr;</span>
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

      </div>
    </main>
  );
}

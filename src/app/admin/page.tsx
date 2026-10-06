"use client";

import { useState } from "react";
import Link from "next/link";
import { useArticles } from "@/context/ArticleContext";
import { Article, Thesis, NewsItem, CategoryInfo } from "@/lib/types";

export default function AdminPage() {
  const {
    articles,
    addArticle,
    updateArticle,
    deleteArticle,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    theses,
    addThesis,
    updateThesis,
    deleteThesis,
    submissions,
    updateSubmissionStatus,
    deleteSubmission,
    news,
    addNews,
    updateNews,
    deleteNews,
    settings,
    updateSettings,
    resetAllData
  } = useArticles();

  // Pengaman PIN Sederhana
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  // Tab Active
  const [activeTab, setActiveTab] = useState<"stats" | "articles" | "categories" | "theses" | "submissions" | "news" | "settings">("stats");

  // State Form Artikel
  const [isEditingArticle, setIsEditingArticle] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [articleForm, setArticleForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    author: "",
    authorRole: "Dosen / Mahasantri",
    authorBio: "",
    category: categories[0]?.slug || "fiqh-muamalah-kontemporer",
    categoryLabel: categories[0]?.name || "Fiqh Muamalah Kontemporer",
    date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
    hijriDate: "1448 H",
    readTime: "5 menit",
    isSpecial: false,
    tags: ""
  });

  // State Form Kategori
  const [isEditingCat, setIsEditingCat] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catForm, setCatForm] = useState({
    name: "",
    description: "",
    iconName: "book"
  });

  // State Form Skripsi
  const [isEditingThesis, setIsEditingThesis] = useState(false);
  const [editingThesisId, setEditingThesisId] = useState<string | null>(null);
  const [thesisForm, setThesisForm] = useState({
    title: "",
    author: "",
    nim: "",
    angkatan: "Angkatan VIII (2022)",
    year: "2026",
    advisor1: "AGH. Prof. Dr. M. Faried Wadjedy, MA",
    advisor2: "Ust. M. Idrus, M.Ag.",
    abstractId: "",
    abstractAr: "",
    keywords: "",
    category: categories[0]?.name || "Fiqh Muamalah Kontemporer",
    categoryLabel: categories[0]?.name || "Fiqh Muamalah Kontemporer",
    downloadUrl: "https://drive.google.com/file/d/...",
    fileSize: "3.2 MB"
  });

  // State Form Berita
  const [isEditingNews, setIsEditingNews] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [newsForm, setNewsForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "Berita" as "Berita" | "Pengumuman" | "Agenda",
    author: "Humas Ma'had Aly",
    date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
  });

  // State Form Settings
  const [settingsForm, setSettingsForm] = useState(settings);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === "1234") {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  // 1. Simpan Artikel
  const handleSaveArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleForm.title || !articleForm.content || !articleForm.author) {
      alert("Mohon isi judul, penulis, dan isi artikel!");
      return;
    }

    const payload = {
      ...articleForm,
      tags: articleForm.tags ? articleForm.tags.split(",").map((t) => t.trim()) : []
    };

    if (isEditingArticle && editingArticleId) {
      updateArticle(editingArticleId, payload);
      alert("Artikel berhasil diperbarui!");
    } else {
      addArticle(payload);
      alert("Artikel baru berhasil diterbitkan!");
    }

    setIsEditingArticle(false);
    setEditingArticleId(null);
    setArticleForm({
      title: "",
      excerpt: "",
      content: "",
      author: "",
      authorRole: "Dosen / Mahasantri",
      authorBio: "",
      category: categories[0]?.slug || "fiqh-muamalah-kontemporer",
      categoryLabel: categories[0]?.name || "Fiqh Muamalah Kontemporer",
      date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
      hijriDate: "1448 H",
      readTime: "5 menit",
      isSpecial: false,
      tags: ""
    });
  };

  // 2. Simpan Kategori
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.name) {
      alert("Nama kategori wajib diisi!");
      return;
    }

    if (isEditingCat && editingCatId) {
      updateCategory(editingCatId, catForm);
      alert("Kategori berhasil diperbarui!");
    } else {
      addCategory(catForm);
      alert("Kategori baru berhasil ditambahkan!");
    }

    setIsEditingCat(false);
    setEditingCatId(null);
    setCatForm({ name: "", description: "", iconName: "book" });
  };

  // 3. Simpan Skripsi
  const handleSaveThesis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!thesisForm.title || !thesisForm.author || !thesisForm.downloadUrl) {
      alert("Mohon isi judul, penulis, dan link Google Drive!");
      return;
    }

    const payload = {
      ...thesisForm,
      keywords: thesisForm.keywords ? thesisForm.keywords.split(",").map((k) => k.trim()) : []
    };

    if (isEditingThesis && editingThesisId) {
      updateThesis(editingThesisId, payload);
      alert("Data skripsi berhasil diperbarui!");
    } else {
      addThesis(payload);
      alert("Naskah skripsi baru berhasil ditambahkan ke Repositori!");
    }

    setIsEditingThesis(false);
    setEditingThesisId(null);
    setThesisForm({
      title: "",
      author: "",
      nim: "",
      angkatan: "Angkatan VIII (2022)",
      year: "2026",
      advisor1: "AGH. Prof. Dr. M. Faried Wadjedy, MA",
      advisor2: "Ust. M. Idrus, M.Ag.",
      abstractId: "",
      abstractAr: "",
      keywords: "",
      category: categories[0]?.name || "Fiqh Muamalah Kontemporer",
      categoryLabel: categories[0]?.name || "Fiqh Muamalah Kontemporer",
      downloadUrl: "https://drive.google.com/file/d/...",
      fileSize: "3.2 MB"
    });
  };

  // 4. Simpan Berita
  const handleSaveNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsForm.title || !newsForm.content) {
      alert("Mohon isi judul dan isi berita!");
      return;
    }

    if (isEditingNews && editingNewsId) {
      updateNews(editingNewsId, newsForm);
      alert("Berita berhasil diperbarui!");
    } else {
      addNews(newsForm);
      alert("Berita baru berhasil diterbitkan!");
    }

    setIsEditingNews(false);
    setEditingNewsId(null);
    setNewsForm({
      title: "",
      excerpt: "",
      content: "",
      category: "Berita",
      author: "Humas Ma'had Aly",
      date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    });
  };

  // 5. Simpan Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(settingsForm);
    alert("Pengaturan identitas website berhasil disimpan!");
  };

  // 1. Tampilan Layar Kunci PIN
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen pt-28 pb-16 bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-mahad-gold text-mahad-green-dark rounded-full flex items-center justify-center mx-auto text-2xl font-bold shadow-lg">
            🔒
          </div>
          <div>
            <h1 className="font-serif font-bold text-2xl text-white">Super Admin CMS</h1>
            <p className="text-slate-400 text-xs mt-1">Ma&apos;had Aly DDI Mangkoso &bull; Fiqh Mu&apos;asarah</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Masukkan PIN Admin (Default: 1234)"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full text-center tracking-widest text-lg px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-mahad-gold text-white"
              />
              {pinError && <p className="text-xs text-red-400 mt-2">PIN salah! Coba ketik: 1234</p>}
            </div>
            <button
              type="submit"
              className="w-full bg-mahad-gold hover:bg-yellow-400 text-mahad-green-dark font-bold py-3 rounded-xl shadow transition"
            >
              Buka Panel Kendali Admin
            </button>
          </form>
          <p className="text-[11px] text-slate-500">PIN default awal: <strong className="text-slate-300">1234</strong></p>
        </div>
      </main>
    );
  }

  // 2. Tampilan Dashboard
  return (
    <main className="pt-24 pb-20 bg-slate-100 min-h-screen">
      
      {/* Header Dashboard */}
      <section className="bg-mahad-green-dark text-white py-8 border-b border-emerald-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-mahad-gold bg-white/10 px-3 py-1 rounded-full">
              Pusat Kendali Redaksi &bull; CMS Mandiri
            </span>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-white mt-1">
              Admin Ma&apos;had Aly DDI Mangkoso
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-emerald-100 transition"
            >
              Lihat Website
            </Link>
            <button
              type="button"
              onClick={() => setIsAuthenticated(false)}
              className="px-4 py-2 rounded-xl bg-red-600/80 hover:bg-red-700 text-xs font-semibold text-white transition"
            >
              Keluar
            </button>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
          {[
            { id: "stats", label: "📊 Ringkasan Statistik" },
            { id: "articles", label: `📚 Artikel (${articles.length})` },
            { id: "categories", label: `🏷️ Kategori (${categories.length})` },
            { id: "theses", label: `🎓 Skripsi (${theses.length})` },
            { id: "submissions", label: `📥 Naskah Masuk (${submissions.length})` },
            { id: "news", label: `📰 Berita & Agenda (${news.length})` },
            { id: "settings", label: "⚙️ Pengaturan Website" }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === tab.id
                  ? "bg-emerald-800 text-white shadow"
                  : "bg-white text-slate-700 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 0: STATS OVERVIEW */}
        {activeTab === "stats" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-xs text-slate-400 font-bold uppercase">Total Artikel Terbit</span>
                <p className="font-serif font-bold text-3xl text-emerald-900">{articles.length}</p>
              </div>
              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-xs text-slate-400 font-bold uppercase">Kategori Fiqh</span>
                <p className="font-serif font-bold text-3xl text-mahad-gold">{categories.length}</p>
              </div>
              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-xs text-slate-400 font-bold uppercase">Repositori Skripsi</span>
                <p className="font-serif font-bold text-3xl text-emerald-900">{theses.length}</p>
              </div>
              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-xs text-slate-400 font-bold uppercase">Naskah Santri Masuk</span>
                <p className="font-serif font-bold text-3xl text-amber-600">{submissions.length}</p>
              </div>
            </div>

            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs sm:text-sm text-emerald-900 leading-relaxed">
              <strong className="block text-base font-serif text-emerald-950 mb-1">Panduan Penggunaan Admin:</strong>
              Anda memiliki kebebasan penuh mengelola data artikel, menambah kategori kajian baru tanpa batas, memasukkan metadata skripsi beserta link Google Drive, serta memantau tulisan santri yang masuk secara langsung tanpa perlu menyentuh kodingan.
            </div>
          </div>
        )}

        {/* TAB 1: KELOLA ARTIKEL */}
        {activeTab === "articles" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-lg text-emerald-950 pb-2 border-b">
                {isEditingArticle ? "✏️ Edit Artikel" : "➕ Tulis Artikel Baru"}
              </h3>
              <form onSubmit={handleSaveArticle} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Judul Artikel *</label>
                  <input
                    type="text"
                    required
                    value={articleForm.title}
                    onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                    className="w-full p-2.5 text-sm bg-slate-50 border rounded-lg"
                    placeholder="Judul kajian fiqh..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Kategori *</label>
                    <select
                      value={articleForm.category}
                      onChange={(e) => {
                        const selected = categories.find((c) => c.slug === e.target.value);
                        setArticleForm({
                          ...articleForm,
                          category: e.target.value,
                          categoryLabel: selected?.name || e.target.value,
                          isSpecial: e.target.value === "karya-anregurutta"
                        });
                      }}
                      className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.slug}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Penulis *</label>
                    <input
                      type="text"
                      required
                      value={articleForm.author}
                      onChange={(e) => setArticleForm({ ...articleForm, author: e.target.value })}
                      className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                      placeholder="Nama penulis..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Abstrak Singkat *</label>
                  <textarea
                    rows={2}
                    required
                    value={articleForm.excerpt}
                    onChange={(e) => setArticleForm({ ...articleForm, excerpt: e.target.value })}
                    className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                    placeholder="Ringkasan abstrak..."
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Isi Lengkap Artikel (Support Teks Arab) *</label>
                  <textarea
                    rows={7}
                    required
                    value={articleForm.content}
                    onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })}
                    className="w-full p-2 text-xs bg-slate-50 border rounded-lg font-sans"
                    placeholder="Isi naskah lengkap..."
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tags / Kata Kunci</label>
                  <input
                    type="text"
                    value={articleForm.tags}
                    onChange={(e) => setArticleForm({ ...articleForm, tags: e.target.value })}
                    className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                    placeholder="Fiqh Muamalah, AI, Kripto (pisahkan koma)"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow text-xs"
                >
                  {isEditingArticle ? "Simpan Perubahan" : "Terbitkan Artikel"}
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-serif font-bold text-lg text-emerald-950 pb-2 border-b">
                Daftar Artikel ({articles.length})
              </h3>
              <div className="space-y-2.5 max-h-175 overflow-y-auto">
                {articles.map((art) => (
                  <div key={art.id} className="p-3.5 bg-slate-50 rounded-xl border flex items-start justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-emerald-800 uppercase text-[10px]">{art.categoryLabel}</span>
                      <h4 className="font-bold text-slate-900 text-sm mt-0.5">{art.title}</h4>
                      <p className="text-slate-500 text-[11px]">Penulis: {art.author} &bull; {art.views || 0}x dibaca</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingArticle(true);
                          setEditingArticleId(art.id);
                          setArticleForm({
                            title: art.title,
                            excerpt: art.excerpt,
                            content: art.content,
                            author: art.author,
                            authorRole: art.authorRole,
                            authorBio: art.authorBio || "",
                            category: art.category,
                            categoryLabel: art.categoryLabel,
                            date: art.date,
                            hijriDate: art.hijriDate,
                            readTime: art.readTime,
                            isSpecial: art.isSpecial || false,
                            tags: art.tags?.join(", ") || ""
                          });
                        }}
                        className="px-2.5 py-1 bg-amber-500 text-white rounded font-bold"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Hapus artikel: "${art.title}"?`)) deleteArticle(art.id);
                        }}
                        className="px-2.5 py-1 bg-red-600 text-white rounded font-bold"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: KELOLA KATEGORI (TANPA BATAS) */}
        {activeTab === "categories" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-lg text-emerald-950 pb-2 border-b">
                {isEditingCat ? "✏️ Edit Kategori" : "➕ Tambah Kategori Baru (Tanpa Batas)"}
              </h3>
              <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Kategori *</label>
                  <input
                    type="text"
                    required
                    value={catForm.name}
                    onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                    className="w-full p-2.5 text-sm bg-slate-50 border rounded-lg"
                    placeholder="Misal: Fiqh Kedaulatan Digital"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Deskripsi Ringkas</label>
                  <textarea
                    rows={3}
                    value={catForm.description}
                    onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                    className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                    placeholder="Uraian fokus kajian kategori ini..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-800 text-white font-bold rounded-xl shadow text-xs"
                >
                  {isEditingCat ? "Simpan Kategori" : "Tambah Kategori"}
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-serif font-bold text-lg text-emerald-950 pb-2 border-b">
                Daftar Kategori Aktif ({categories.length})
              </h3>
              <div className="space-y-2.5 max-h-175 overflow-y-auto">
                {categories.map((cat) => (
                  <div key={cat.id} className="p-3.5 bg-slate-50 rounded-xl border flex items-center justify-between gap-3 text-xs">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{cat.name}</h4>
                      <p className="text-slate-500 text-[11px] line-clamp-1">{cat.description}</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingCat(true);
                          setEditingCatId(cat.id);
                          setCatForm({ name: cat.name, description: cat.description, iconName: cat.iconName });
                        }}
                        className="px-2.5 py-1 bg-amber-500 text-white rounded font-bold"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Hapus kategori: "${cat.name}"?`)) deleteCategory(cat.id);
                        }}
                        className="px-2.5 py-1 bg-red-600 text-white rounded font-bold"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: KELOLA SKRIPSI */}
        {activeTab === "theses" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-lg text-emerald-950 pb-2 border-b">
                {isEditingThesis ? "✏️ Edit Data Skripsi" : "➕ Tambah Skripsi Mahasantri"}
              </h3>
              <form onSubmit={handleSaveThesis} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Judul Skripsi *</label>
                  <input
                    type="text"
                    required
                    value={thesisForm.title}
                    onChange={(e) => setThesisForm({ ...thesisForm, title: e.target.value })}
                    className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                    placeholder="Judul skripsi lengkap..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Penulis (Mahasantri) *</label>
                    <input
                      type="text"
                      required
                      value={thesisForm.author}
                      onChange={(e) => setThesisForm({ ...thesisForm, author: e.target.value })}
                      className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">NIM *</label>
                    <input
                      type="text"
                      required
                      value={thesisForm.nim}
                      onChange={(e) => setThesisForm({ ...thesisForm, nim: e.target.value })}
                      className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tahun Lulus *</label>
                    <input
                      type="text"
                      required
                      value={thesisForm.year}
                      onChange={(e) => setThesisForm({ ...thesisForm, year: e.target.value })}
                      className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Ukuran File (MB)</label>
                    <input
                      type="text"
                      value={thesisForm.fileSize}
                      onChange={(e) => setThesisForm({ ...thesisForm, fileSize: e.target.value })}
                      className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Link Download PDF (Google Drive) *</label>
                  <input
                    type="url"
                    required
                    value={thesisForm.downloadUrl}
                    onChange={(e) => setThesisForm({ ...thesisForm, downloadUrl: e.target.value })}
                    className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                    placeholder="https://drive.google.com/file/d/..."
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Abstrak Indonesia *</label>
                  <textarea
                    rows={3}
                    required
                    value={thesisForm.abstractId}
                    onChange={(e) => setThesisForm({ ...thesisForm, abstractId: e.target.value })}
                    className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Abstrak Bahasa Arab</label>
                  <textarea
                    rows={3}
                    dir="rtl"
                    value={thesisForm.abstractAr}
                    onChange={(e) => setThesisForm({ ...thesisForm, abstractAr: e.target.value })}
                    className="w-full p-2 text-xs bg-slate-50 border rounded-lg font-serif"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-800 text-white font-bold rounded-xl shadow text-xs"
                >
                  {isEditingThesis ? "Simpan Perubahan Skripsi" : "Tambahkan Skripsi"}
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-serif font-bold text-lg text-emerald-950 pb-2 border-b">
                Daftar Skripsi di Repositori ({theses.length})
              </h3>
              <div className="space-y-2.5 max-h-175 overflow-y-auto">
                {theses.map((th) => (
                  <div key={th.id} className="p-3.5 bg-slate-50 rounded-xl border flex items-start justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-emerald-800 text-[10px]">Tahun {th.year} &bull; {th.categoryLabel}</span>
                      <h4 className="font-bold text-slate-900 text-sm mt-0.5">{th.title}</h4>
                      <p className="text-slate-500 text-[11px]">Penulis: {th.author} (NIM: {th.nim})</p>
                      <a href={th.downloadUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-700 text-[11px] underline">
                        Buka Link Google Drive &rarr;
                      </a>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingThesis(true);
                          setEditingThesisId(th.id);
                          setThesisForm({
                            title: th.title,
                            author: th.author,
                            nim: th.nim,
                            angkatan: th.angkatan,
                            year: th.year,
                            advisor1: th.advisor1,
                            advisor2: th.advisor2,
                            abstractId: th.abstractId,
                            abstractAr: th.abstractAr,
                            keywords: th.keywords.join(", "),
                            category: th.category,
                            categoryLabel: th.categoryLabel,
                            downloadUrl: th.downloadUrl,
                            fileSize: th.fileSize
                          });
                        }}
                        className="px-2.5 py-1 bg-amber-500 text-white rounded font-bold"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Hapus skripsi: "${th.title}"?`)) deleteThesis(th.id);
                        }}
                        className="px-2.5 py-1 bg-red-600 text-white rounded font-bold"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: KELOLA NASKAH MASUK */}
        {activeTab === "submissions" && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-lg text-emerald-950 pb-2 border-b">
              Kotak Masuk Kiriman Naskah Santri ({submissions.length})
            </h3>

            {submissions.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-sm">
                Belum ada naskah baru yang masuk dari form &ldquo;Kirim Tulisan&rdquo;.
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((sub) => (
                  <div key={sub.id} className="p-5 bg-slate-50 rounded-xl border space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded">
                        Kategori: {sub.kategori}
                      </span>
                      <span className="text-slate-400">{sub.tanggal} &bull; Status: <strong className="uppercase text-amber-700">{sub.status}</strong></span>
                    </div>

                    <div>
                      <h4 className="font-serif font-bold text-lg text-slate-900">{sub.judul}</h4>
                      <p className="text-slate-600">Penulis: <strong>{sub.nama}</strong> ({sub.email}) &bull; Afiliasi: {sub.afiliasi || "Umum"}</p>
                    </div>

                    <div className="p-3 bg-white border rounded-lg text-slate-700">
                      <strong>Abstrak Naskah:</strong>
                      <p className="mt-1 leading-relaxed">{sub.abstrak}</p>
                    </div>

                    {sub.fileLink && (
                      <p className="text-emerald-800">
                        Link Dokumen: <a href={sub.fileLink} target="_blank" rel="noopener noreferrer" className="underline font-bold">{sub.fileLink}</a>
                      </p>
                    )}

                    <div className="flex justify-end gap-2 pt-2 border-t">
                      <button
                        type="button"
                        onClick={() => {
                          // 1-Click Publish ke Artikel Live
                          addArticle({
                            title: sub.judul,
                            excerpt: sub.abstrak.slice(0, 150) + "...",
                            content: sub.abstrak,
                            author: sub.nama,
                            authorRole: sub.afiliasi || "Mahasantri Marhalah Ula",
                            category: categories[0]?.slug || "fiqh-muamalah-kontemporer",
                            categoryLabel: sub.kategori,
                            date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
                            hijriDate: "1448 H",
                            readTime: "5 menit"
                          });
                          updateSubmissionStatus(sub.id, "publish");
                          alert("Naskah berhasil langsung diterbitkan menjadi Artikel Live!");
                        }}
                        className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg"
                      >
                        ✓ Terbitkan Jadi Artikel Live
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteSubmission(sub.id)}
                        className="px-3 py-1.5 bg-red-600 text-white font-bold rounded-lg"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: KELOLA BERITA */}
        {activeTab === "news" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-lg text-emerald-950 pb-2 border-b">
                {isEditingNews ? "✏️ Edit Berita" : "➕ Tulis Warta / Pengumuman Baru"}
              </h3>
              <form onSubmit={handleSaveNews} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Judul Berita *</label>
                  <input
                    type="text"
                    required
                    value={newsForm.title}
                    onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                    className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Kategori *</label>
                    <select
                      value={newsForm.category}
                      onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value as any })}
                      className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                    >
                      <option value="Berita">Berita</option>
                      <option value="Pengumuman">Pengumuman</option>
                      <option value="Agenda">Agenda</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Penulis</label>
                    <input
                      type="text"
                      value={newsForm.author}
                      onChange={(e) => setNewsForm({ ...newsForm, author: e.target.value })}
                      className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Isi Berita *</label>
                  <textarea
                    rows={6}
                    required
                    value={newsForm.content}
                    onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value, excerpt: e.target.value.slice(0, 120) + "..." })}
                    className="w-full p-2 text-xs bg-slate-50 border rounded-lg"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-800 text-white font-bold rounded-xl shadow text-xs"
                >
                  {isEditingNews ? "Simpan Perubahan Berita" : "Terbitkan Berita"}
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-serif font-bold text-lg text-emerald-950 pb-2 border-b">
                Daftar Berita ({news.length})
              </h3>
              <div className="space-y-2.5 max-h-175 overflow-y-auto">
                {news.map((item) => (
                  <div key={item.id} className="p-3.5 bg-slate-50 rounded-xl border flex items-start justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-emerald-800 text-[10px]">{item.category} &bull; {item.date}</span>
                      <h4 className="font-bold text-slate-900 text-sm mt-0.5">{item.title}</h4>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingNews(true);
                          setEditingNewsId(item.id);
                          setNewsForm({
                            title: item.title,
                            excerpt: item.excerpt,
                            content: item.content,
                            category: item.category,
                            author: item.author,
                            date: item.date
                          });
                        }}
                        className="px-2.5 py-1 bg-amber-500 text-white rounded font-bold"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Hapus berita: "${item.title}"?`)) deleteNews(item.id);
                        }}
                        className="px-2.5 py-1 bg-red-600 text-white rounded font-bold"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: PENGATURAN IDENTITAS WEBSITE */}
        {activeTab === "settings" && (
          <div className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-serif font-bold text-xl text-emerald-950 pb-3 border-b">
              Pengaturan Identitas &amp; Informasi Lembaga (Edit Tanpa Koding)
            </h3>
            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-700 mb-1">Nama Resmi Lembaga</label>
                <input
                  type="text"
                  value={settingsForm.institutionName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, institutionName: e.target.value })}
                  className="w-full p-2.5 text-sm bg-slate-50 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 mb-1">Nama Mudir / Pimpinan</label>
                  <input
                    type="text"
                    value={settingsForm.mudirName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, mudirName: e.target.value })}
                    className="w-full p-2.5 text-sm bg-slate-50 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Email Penerima Naskah Santri</label>
                  <input
                    type="email"
                    value={settingsForm.emailSubmission}
                    onChange={(e) => setSettingsForm({ ...settingsForm, emailSubmission: e.target.value })}
                    className="w-full p-2.5 text-sm bg-slate-50 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 mb-1">Nomor Telepon / WhatsApp</label>
                  <input
                    type="text"
                    value={settingsForm.phone}
                    onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                    className="w-full p-2.5 text-sm bg-slate-50 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Alamat Lengkap</label>
                  <input
                    type="text"
                    value={settingsForm.address}
                    onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                    className="w-full p-2.5 text-sm bg-slate-50 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Visi Lembaga</label>
                <textarea
                  rows={2}
                  value={settingsForm.visi}
                  onChange={(e) => setSettingsForm({ ...settingsForm, visi: e.target.value })}
                  className="w-full p-2.5 text-sm bg-slate-50 border rounded-lg"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="submit"
                  className="px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow transition"
                >
                  Simpan Semua Pengaturan Website
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Kembalikan seluruh data ke pengaturan awal?")) resetAllData();
                  }}
                  className="px-4 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-red-600 hover:text-white transition"
                >
                  Reset ke Data Default
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </main>
  );
}
"use client";

import { useState } from "react";
import Link from "next/link";
import { useArticles } from "@/context/ArticleContext";
import { Article } from "@/lib/types";

export default function AdminPage() {
  const { articles, submissions, addArticle, updateArticle, deleteArticle, deleteSubmission } = useArticles();

  // Pengaman PIN Sederhana
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  // Tab Menu Admin
  const [activeTab, setActiveTab] = useState<"articles" | "submissions">("articles");

  // Form State untuk Tambah / Edit Artikel
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    author: "",
    authorRole: "Dosen / Mahasantri",
    category: "usul-fikih" as "karya-anregurutta" | "usul-fikih" | "tafsir-hadis",
    categoryLabel: "Usul Fikih",
    date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
    hijriDate: "1448 H",
    readTime: "5 menit",
    isSpecial: false,
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === "1234") {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleCategoryChange = (cat: "karya-anregurutta" | "usul-fikih" | "tafsir-hadis") => {
    const labels: Record<string, string> = {
      "karya-anregurutta": "Karya Anregurutta",
      "usul-fikih": "Usul Fikih",
      "tafsir-hadis": "Tafsir & Hadis",
    };
    setFormData({
      ...formData,
      category: cat,
      categoryLabel: labels[cat],
      isSpecial: cat === "karya-anregurutta",
    });
  };

  const handleSaveArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content || !formData.author) {
      alert("Mohon isi judul, penulis, dan isi artikel!");
      return;
    }

    if (isEditing && editingId) {
      updateArticle(editingId, formData);
      alert("Artikel berhasil diperbarui!");
    } else {
      addArticle(formData);
      alert("Artikel baru berhasil diterbitkan!");
    }

    // Reset Form
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      author: "",
      authorRole: "Dosen / Mahasantri",
      category: "usul-fikih",
      categoryLabel: "Usul Fikih",
      date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
      hijriDate: "1448 H",
      readTime: "5 menit",
      isSpecial: false,
    });
  };

  const handleEditClick = (art: Article) => {
    setIsEditing(true);
    setEditingId(art.id);
    setFormData({
      title: art.title,
      excerpt: art.excerpt,
      content: art.content,
      author: art.author,
      authorRole: art.authorRole,
      category: art.category,
      categoryLabel: art.categoryLabel,
      date: art.date,
      hijriDate: art.hijriDate,
      readTime: art.readTime,
      isSpecial: art.isSpecial || false,
    });
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  // 1. Tampilan Layar Kunci PIN
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen pt-28 pb-16 bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-mahad-gold text-mahad-green-dark rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
            🔒
          </div>
          <div>
            <h1 className="font-serif font-bold text-2xl text-white">Panel Redaksi Ma&apos;had</h1>
            <p className="text-slate-400 text-xs mt-1">Masukkan PIN Admin untuk mengelola konten website</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Masukkan PIN (Default: 1234)"
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
              Buka Panel Redaksi
            </button>
          </form>
          <p className="text-[11px] text-slate-500">PIN default awal: <strong className="text-slate-300">1234</strong></p>
        </div>
      </main>
    );
  }

  // 2. Tampilan Dashboard Redaksi
  return (
    <main className="pt-24 pb-20 bg-slate-100 min-h-screen">
      
      {/* Header Dashboard */}
      <section className="bg-mahad-green-dark text-white py-8 border-b border-emerald-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-mahad-gold bg-white/10 px-3 py-1 rounded-full">
              Pusat Kendali Redaksi
            </span>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-white mt-1">
              Admin CMS Ma&apos;had Aly DDI Mangkoso
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

      {/* Konten Dashboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Navigasi Tab */}
        <div className="flex gap-3 border-b border-slate-200 pb-4">
          <button
            type="button"
            onClick={() => setActiveTab("articles")}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition ${
              activeTab === "articles"
                ? "bg-emerald-800 text-white shadow"
                : "bg-white text-slate-700 hover:bg-slate-200"
            }`}
          >
            📚 Kelola Artikel ({articles.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("submissions")}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
              activeTab === "submissions"
                ? "bg-emerald-800 text-white shadow"
                : "bg-white text-slate-700 hover:bg-slate-200"
            }`}
          >
            <span>📥 Naskah Masuk dari Santri</span>
            <span className="bg-mahad-gold text-mahad-green-dark px-2 py-0.5 rounded-full text-xs font-bold">
              {submissions.length}
            </span>
          </button>
        </div>

        {/* TAB 1: KELOLA ARTIKEL */}
        {activeTab === "articles" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Form Tambah / Edit Artikel */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-serif font-bold text-lg text-emerald-950">
                  {isEditing ? "✏️ Edit Artikel" : "➕ Tulis Artikel Baru"}
                </h3>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setEditingId(null);
                      setFormData({
                        title: "",
                        excerpt: "",
                        content: "",
                        author: "",
                        authorRole: "Dosen / Mahasantri",
                        category: "usul-fikih",
                        categoryLabel: "Usul Fikih",
                        date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
                        hijriDate: "1448 H",
                        readTime: "5 menit",
                        isSpecial: false,
                      });
                    }}
                    className="text-xs text-red-600 font-bold hover:underline"
                  >
                    Batal Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveArticle} className="space-y-4 text-xs font-medium">
                <div>
                  <label className="block text-slate-700 mb-1">Judul Artikel *</label>
                  <input
                    type="text"
                    required
                    placeholder="Judul kajian ilmiah..."
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-mahad-gold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 mb-1">Kategori *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleCategoryChange(e.target.value as any)}
                      className="w-full p-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                    >
                      <option value="karya-anregurutta">Karya Anregurutta</option>
                      <option value="usul-fikih">Usul Fikih</option>
                      <option value="tafsir-hadis">Tafsir &amp; Hadis</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1">Penulis *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nama penulis..."
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      className="w-full p-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Abstrak / Ringkasan *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Ringkasan singkat isi tulisan..."
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    className="w-full p-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Isi Lengkap Artikel *</label>
                  <textarea
                    rows={8}
                    required
                    placeholder="Tulis naskah lengkap artikel kajian di sini..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full p-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow transition text-sm"
                >
                  {isEditing ? "Simpan Perubahan Artikel" : "Terbitkan Artikel ke Web"}
                </button>
              </form>
            </div>

            {/* Daftar Artikel Terbit */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-lg text-emerald-950 pb-3 border-b border-slate-100">
                Daftar Artikel di Website ({articles.length})
              </h3>

              <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
                {articles.map((art) => (
                  <div
                    key={art.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white transition flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                        {art.categoryLabel}
                      </span>
                      <h4 className="font-serif font-bold text-base text-slate-900 leading-snug">
                        {art.title}
                      </h4>
                      <p className="text-xs text-slate-500">Oleh: {art.author} &bull; {art.date}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEditClick(art)}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Yakin ingin menghapus artikel: "${art.title}"?`)) {
                            deleteArticle(art.id);
                          }
                        }}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition"
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

        {/* TAB 2: NASKAH MASUK DARI SANTRI */}
        {activeTab === "submissions" && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-lg text-emerald-950 pb-3 border-b border-slate-100">
              Kotak Masuk Kiriman Naskah Mahasantri
            </h3>

            {submissions.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-sm">
                Belum ada naskah baru yang masuk dari form &ldquo;Kirim Tulisan&rdquo;.
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((sub) => (
                  <div key={sub.id} className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded">
                        Kategori: {sub.kategori}
                      </span>
                      <span className="text-xs text-slate-400">{sub.tanggal}</span>
                    </div>

                    <div>
                      <h4 className="font-serif font-bold text-xl text-slate-900">{sub.judul}</h4>
                      <p className="text-xs text-slate-600 mt-0.5">Penulis: <strong>{sub.nama}</strong> ({sub.afiliasi || "Umum"})</p>
                    </div>

                    <div className="bg-white p-3.5 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed">
                      <strong className="block text-slate-900 mb-1">Abstrak Masuk:</strong>
                      {sub.abstrak}
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => {
                          // Otomatis pindah ke form editor untuk dijadikan artikel resmi
                          setActiveTab("articles");
                          setFormData({
                            title: sub.judul,
                            excerpt: sub.abstrak.slice(0, 150) + "...",
                            content: sub.abstrak,
                            author: sub.nama,
                            authorRole: sub.afiliasi || "Mahasantri",
                            category: (sub.kategori as any) || "usul-fikih",
                            categoryLabel: sub.kategori || "Usul Fikih",
                            date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
                            hijriDate: "1448 H",
                            readTime: "5 menit",
                            isSpecial: false,
                          });
                        }}
                        className="px-4 py-2 bg-emerald-800 text-white text-xs font-bold rounded-lg hover:bg-emerald-900 transition"
                      >
                        Terbitkan Naskah Ini
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteSubmission(sub.id)}
                        className="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-red-600 hover:text-white transition"
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

      </div>
    </main>
  );
}
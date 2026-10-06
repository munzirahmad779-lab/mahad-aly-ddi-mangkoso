"use client";

import { useState } from "react";
import Link from "next/link";
import { useArticles } from "@/context/ArticleContext";

export default function KirimTulisanPage() {
  const { addSubmission } = useArticles();

  const [formData, setFormData] = useState({
    nama: "",
    kategori: "Usul Fikih",
    afiliasi: "",
    judul: "",
    abstrak: "",
    orisinalitas: false,
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nama || !formData.kategori || !formData.judul || !formData.abstrak) {
      setStatus("error");
      setErrorMessage("Mohon lengkapi semua kolom yang bertanda bintang (*).");
      return;
    }

    if (!formData.orisinalitas) {
      setStatus("error");
      setErrorMessage("Anda wajib mencentang pernyataan orisinalitas naskah.");
      return;
    }

    setStatus("submitting");

    // 1. Simpan ke sistem Admin Redaksi
    addSubmission({
      nama: formData.nama,
      kategori: formData.kategori,
      afiliasi: formData.afiliasi,
      judul: formData.judul,
      abstrak: formData.abstrak,
    });

    // 2. Berikan delay singkat & konfirmasi sukses
    setTimeout(() => {
      setStatus("success");
      setFormData({
        nama: "",
        kategori: "Usul Fikih",
        afiliasi: "",
        judul: "",
        abstrak: "",
        orisinalitas: false,
      });
    }, 1000);
  };

  return (
    <main className="pt-24 pb-20 bg-slate-50 min-h-screen">
      <section className="bg-mahad-green-dark text-white py-14 bg-islamic-pattern">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <Link
            href="/#mimbar-kajian"
            className="inline-flex items-center gap-1.5 text-xs text-mahad-gold-light hover:text-mahad-gold mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Kembali ke Beranda</span>
          </Link>
          <h1 className="font-serif font-bold text-3xl sm:text-4xl text-white">
            Kirim Naskah Tulisan
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base mt-2">
            Salurkan karya ilmiah, riset thurats, dan gagasan keislaman Anda ke Mimbar Kajian Ma&apos;had Aly DDI Mangkoso.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-sm">
          
          {status === "success" ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                ✓
              </div>
              <h3 className="font-serif font-bold text-2xl text-slate-900">
                Alhamdulillah! Naskah Berhasil Terkirim
              </h3>
              <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
                Tulisan Anda telah tercatat langsung di sistem Redaksi Ma&apos;had Aly DDI Mangkoso dan akan segera ditelaah untuk diterbitkan.
              </p>
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="mt-4 inline-flex items-center gap-2 bg-emerald-800 text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-emerald-900 transition"
              >
                Kirim Naskah Lain
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              
              {status === "error" && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
                  {errorMessage}
                </div>
              )}

              {/* Nama Penulis */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Nama Lengkap &amp; Gelar <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ahmad Yusuf Mubarak, S.Ag."
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-mahad-gold"
                />
              </div>

              {/* Kategori & Afiliasi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Kategori Tulisan <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.kategori}
                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-mahad-gold"
                  >
                    <option value="Karya Anregurutta">Karya Anregurutta</option>
                    <option value="Usul Fikih">Usul Fikih</option>
                    <option value="Tafsir & Hadis">Tafsir &amp; Hadis</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Afiliasi / Status Santri
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Mahasantri Semester VI"
                    value={formData.afiliasi}
                    onChange={(e) => setFormData({ ...formData, afiliasi: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-mahad-gold"
                  />
                </div>
              </div>

              {/* Judul */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Judul Karya Ilmiah <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Tuliskan judul lengkap naskah Anda"
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-mahad-gold"
                />
              </div>

              {/* Abstrak */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Abstrak / Pokok Pikiran <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Uraikan latar belakang masalah, metode istinbath/rujukan kitab yang dipakai, dan temuan tulisan Anda..."
                  value={formData.abstrak}
                  onChange={(e) => setFormData({ ...formData, abstrak: e.target.value })}
                  className="w-full p-4 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-mahad-gold"
                />
              </div>

              {/* Checkbox Orisinalitas */}
              <div className="flex items-start gap-3 pt-2">
                <input
                  type="checkbox"
                  id="orisinalitasCheck"
                  checked={formData.orisinalitas}
                  onChange={(e) => setFormData({ ...formData, orisinalitas: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded text-emerald-800 focus:ring-mahad-gold"
                />
                <label htmlFor="orisinalitasCheck" className="text-xs text-slate-600 leading-relaxed cursor-pointer">
                  Saya menyatakan bahwa naskah ini merupakan karya asli, menjunjung tinggi amanah ilmiah, dan tidak bertentangan dengan kaidah ahlussunnah wal jama&apos;ah.
                </label>
              </div>

              {/* Tombol Kirim */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  {status === "submitting" ? (
                    <span>Sedang Mengirim Naskah...</span>
                  ) : (
                    <>
                      <span>Kirim Naskah ke Redaksi</span>
                      <svg className="w-4 h-4 text-mahad-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>
      </div>
    </main>
  );
}
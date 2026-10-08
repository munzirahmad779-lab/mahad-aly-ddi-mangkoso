"use client";

import { useState } from "react";
import Link from "next/link";
import { useArticles } from "@/context/ArticleContext";
import { 
  GraduationCap, 
  Calendar, 
  CheckCircle2, 
  Users, 
  Award, 
  Download, 
  ExternalLink, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  PhoneCall, 
  FileText,
  Clock,
  Sparkles
} from "lucide-react";

export default function PmbPage() {
  const { pmbWaves, pmbFAQs, settings } = useArticles();

  const [activeWaveId, setActiveWaveId] = useState<string>(pmbWaves[0]?.id || "");
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  const selectedWave = pmbWaves.find((w) => w.id === activeWaveId) || pmbWaves[0];

  const toggleFaq = (id: string) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  return (
    <main className="pt-24 pb-20 bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-mahad-green-dark text-white py-16 bg-islamic-pattern relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="text-xs font-bold uppercase tracking-widest text-mahad-gold bg-white/10 px-3.5 py-1 rounded-full inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Penerimaan Mahasantri Baru (PMB)</span>
          </span>
          <h1 className="font-serif font-bold text-3xl sm:text-5xl text-white mt-4 leading-tight">
            Beasiswa Penuh 100% Kader Ulama
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base max-w-2xl mx-auto mt-3 leading-relaxed">
            Pendidikan Tinggi Marhalah Ula (M.1) Takhassus Fiqh wa Usuluhu Ma&apos;had Aly DDI Mangkoso. Membina generasi fakih, berakhlak mulia, dan berakar pada sanad keilmuan klasik.
          </p>

          {/* Tombol Aksi Utama */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {selectedWave?.registrationLink ? (
              <a
                href={selectedWave.registrationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-mahad-gold text-mahad-green-dark hover:bg-yellow-400 font-bold text-sm rounded-xl shadow-lg transition flex items-center gap-2"
              >
                <span>Daftar Online Sekarang</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <Link
                href="/kontak"
                className="px-6 py-3 bg-mahad-gold text-mahad-green-dark hover:bg-yellow-400 font-bold text-sm rounded-xl shadow-lg transition flex items-center gap-2"
              >
                <span>Hubungi Panitia Seleksi</span>
                <ExternalLink className="w-4 h-4" />
              </Link>
            )}

            {selectedWave?.brochureUrl && (
              <a
                href={selectedWave.brochureUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl border border-white/20 transition flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Brosur PMB (PDF)</span>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Info Beasiswa Penuh */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xl shrink-0">
              🎓
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Bebas Biaya Kuliah 100%</h4>
              <p className="text-[11px] text-slate-500">Selama 4 tahun masa studi</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xl shrink-0">
              🏠
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Asrama Mukim 24 Jam</h4>
              <p className="text-[11px] text-slate-500">Termasuk konsumsi harian santri</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-xl shrink-0">
              📜
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Ijazah Diakui Negara</h4>
              <p className="text-[11px] text-slate-500">Gelar S.Ag &amp; Sanad Kitab Klasik</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gelombang Pendaftaran & Rincian */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
        {/* Tab Gelombang */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h2 className="font-serif font-bold text-2xl text-slate-900">
                Pilihan Gelombang Pendaftaran
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih jalur seleksi yang sesuai dengan kualifikasi Anda
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {pmbWaves.map((wave) => (
              <button
                key={wave.id}
                type="button"
                onClick={() => setActiveWaveId(wave.id)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                  (selectedWave?.id === wave.id)
                    ? "bg-emerald-800 text-white shadow-md"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>{wave.name}</span>
              </button>
            ))}
          </div>

          {/* Rincian Gelombang Terpilih */}
          {selectedWave && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-8">
              {/* Header Rincian */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                    Jalur Aktif
                  </span>
                  <h3 className="font-serif font-bold text-xl sm:text-2xl text-slate-900 mt-2">
                    {selectedWave.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Periode: <strong>{selectedWave.startDate}</strong> s/d <strong>{selectedWave.endDate}</strong></span>
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Kuota Penerimaan:</span>
                    <span className="text-base font-bold text-emerald-950">{selectedWave.quota}</span>
                  </div>
                </div>
              </div>

              {/* Poster / Brosur Gambar (Jika Ada) */}
              {selectedWave.imageUrl && (
                <div className="rounded-xl overflow-hidden border border-slate-200 max-h-80 bg-slate-100">
                  <img
                    src={selectedWave.imageUrl}
                    alt={selectedWave.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}

              {/* Beasiswa Info */}
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  <span>Skema Pembiayaan:</span>
                </span>
                <p className="text-xs sm:text-sm text-amber-950 font-medium">
                  {selectedWave.scholarshipInfo}
                </p>
              </div>

              {/* Dua Kolom: Persyaratan & Prosedur */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Persyaratan */}
                <div className="space-y-4">
                  <h4 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-800" />
                    <span>Persyaratan Pendaftaran</span>
                  </h4>
                  <ul className="space-y-2.5">
                    {selectedWave.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          ✓
                        </span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Alur Seleksi */}
                <div className="space-y-4">
                  <h4 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-800" />
                    <span>Tahapan &amp; Alur Seleksi</span>
                  </h4>
                  <ul className="space-y-2.5">
                    {selectedWave.procedure.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tanya Jawab Sering Ditanyakan (FAQ PMB) */}
        {pmbFAQs && pmbFAQs.length > 0 && (
          <div className="space-y-6 pt-6 border-t border-slate-200">
            <div className="text-center max-w-xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">
                FAQ PMB
              </span>
              <h2 className="font-serif font-bold text-2xl text-slate-900 mt-2">
                Pertanyaan Seputar Pendaftaran
              </h2>
            </div>

            <div className="space-y-3 max-w-3xl mx-auto">
              {pmbFAQs.map((faq) => {
                const isOpen = openFaqId === faq.id;

                return (
                  <div
                    key={faq.id}
                    className="bg-white border border-slate-200 rounded-xl overflow-hidden transition"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 hover:bg-slate-50 transition"
                    >
                      <span className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-emerald-800 shrink-0" />
                        <span>{faq.question}</span>
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-slate-600 border-t border-slate-100 bg-slate-50/40 leading-relaxed">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Kotak Bantuan Panitia */}
        <div className="p-8 bg-emerald-950 text-white rounded-3xl text-center space-y-4">
          <PhoneCall className="w-8 h-8 text-mahad-gold mx-auto" />
          <h3 className="font-serif font-bold text-xl text-white">
            Butuh Panduan Pendaftaran Lebih Lanjut?
          </h3>
          <p className="text-xs sm:text-sm text-emerald-200 max-w-md mx-auto">
            Sekretariat PMB Ma&apos;had Aly DDI Mangkoso siap melayani konsultasi pendaftaran, verifikasi berkas, dan info ujian seleksi.
          </p>
          <div className="pt-2">
            <Link
              href="/kontak"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-mahad-gold text-mahad-green-dark font-bold text-xs rounded-xl shadow-md hover:bg-yellow-400 transition"
            >
              <span>Hubungi Kontak Sekretariat &rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

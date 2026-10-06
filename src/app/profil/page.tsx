"use client";

import { useState } from "react";
import Image from "next/image";
import { useArticles } from "@/context/ArticleContext";

export default function ProfilPage() {
  const { settings, lecturers, facilities, accreditations } = useArticles();
  const [activeTab, setActiveTab] = useState<
    "sejarah" | "visi-misi" | "masyayikh" | "struktur" | "sarana" | "akreditasi"
  >("sejarah");

  return (
    <main className="pt-24 pb-20 bg-slate-50 min-h-screen">
      {/* Header Banner */}
      <section className="bg-mahad-green-dark text-white py-14 bg-islamic-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-mahad-gold bg-white/10 px-3.5 py-1 rounded-full">
            Identitas &amp; Sejarah Lembaga
          </span>
          <h1 className="font-serif font-bold text-3xl sm:text-5xl text-white mt-3">
            Profil Ma&apos;had Aly DDI Mangkoso
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base max-w-2xl mx-auto mt-2">
            Pusat Pendidikan Tinggi Kader Ulama Takhassus Fiqh wa Usuluhu Berfokus pada Fiqh Mu&apos;asarah.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Tab Selector */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4 bg-white p-3 rounded-2xl shadow-sm">
          {[
            { id: "sejarah", label: "Sejarah Lembaga" },
            { id: "visi-misi", label: "Visi & Misi" },
            { id: "masyayikh", label: `Masyayikh & Dosen (${lecturers.filter(l => l.isActive).length})` },
            { id: "struktur", label: "Struktur Organisasi" },
            { id: "sarana", label: `Sarana & Prasarana (${facilities.length})` },
            { id: "akreditasi", label: `Sertifikat Akreditasi (${accreditations.length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === tab.id
                  ? "bg-emerald-800 text-white shadow-md"
                  : "bg-slate-50 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: SEJARAH */}
        {activeTab === "sejarah" && (
          <div id="sejarah" className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-8 bg-mahad-gold rounded-full inline-block"></span>
              <h2 className="font-serif font-bold text-2xl sm:text-3xl text-emerald-950">
                Sejarah Pendirian Ma&apos;had Aly DDI Mangkoso
              </h2>
            </div>

            {settings.historyArabic && (
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-right font-serif text-lg text-emerald-900 leading-loose" dir="rtl">
                {settings.historyArabic}
              </div>
            )}
            
            <div className="text-slate-700 space-y-4 text-sm sm:text-base leading-relaxed">
              {settings.historyContent ? (
                <div className="space-y-4 whitespace-pre-line leading-relaxed">
                  {settings.historyContent}
                </div>
              ) : (
                <>
                  <p>
                    Ma&apos;had Aly DDI Mangkoso didirikan di Kompleks Kampus Pondok Pesantren DDI Mangkoso, Kabupaten Barru, Sulawesi Selatan{settings.establishedDate ? ` (${settings.establishedDate})` : ""}.
                  </p>
                  <p>
                    Gagasan luhur ini diinisiasi oleh {settings.mudirName} bersama dewan masyaikh dan pimpinan Pondok Pesantren DDI Mangkoso. Kelahiran lembaga ini didorong oleh keprihatinan yang mendalam atas semakin langkanya ulama fukaha (mutafaqqih fiddin) yang menguasai khazanah turats klasik secara mendalam sekaligus memiliki kelenturan nalar dalam menjawab problematika umat di era modern (Fiqh Mu&apos;asarah).
                  </p>
                  <p>
                    Melanjutkan wasiat perjuangan pendiri utama Darud Da&apos;wah wal Irsyad (DDI), <strong>AGH. Abdurrahman Ambo Dalle</strong>, Ma&apos;had Aly DDI Mangkoso berkomitmen penuh mencetak kader-kader mujtahid kontemporer melalui masa pengkaderan intensif 4 tahun dengan beasiswa penuh 100% via program Orang Tua Asuh.
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: VISI & MISI */}
        {activeTab === "visi-misi" && (
          <div id="visi-misi" className="space-y-6">
            <div className="bg-emerald-900 text-white rounded-2xl p-8 border border-emerald-800 shadow-md">
              <span className="text-xs font-bold uppercase tracking-widest text-mahad-gold">Visi Kelembagaan</span>
              <h3 className="font-serif font-bold text-xl sm:text-2xl text-white mt-2 leading-relaxed">
                &ldquo;{settings.visi}&rdquo;
              </h3>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-xl text-emerald-950">Misi Utama Lembaga</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {settings.misi.map((m, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-mahad-gold text-mahad-green-dark font-bold flex items-center justify-center shrink-0 text-xs">
                      {idx + 1}
                    </span>
                    <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">{m}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MASYAYIKH / DEWAN DOSEN */}
        {activeTab === "masyayikh" && (
          <div id="masyayikh" className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b">
              <h2 className="font-serif font-bold text-2xl text-emerald-950">
                Masyayikh &amp; Dewan Dosen Pengampu
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                Pendidik &amp; Ulama Otoritatif Turats &amp; Fiqh Mu&apos;asarah
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lecturers
                .filter((l) => l.isActive)
                .sort((a, b) => a.order - b.order)
                .map((m) => (
                  <div key={m.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3 shadow-sm hover:shadow-md transition">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-mahad-gold relative bg-emerald-100 flex items-center justify-center text-xl font-bold text-emerald-800">
                      {m.photoUrl ? (
                        <Image
                          src={m.photoUrl}
                          alt={m.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                          unoptimized={true}
                        />
                      ) : (
                        <span>👳</span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-base text-slate-900">{m.name}</h4>
                      <p className="text-xs font-semibold text-emerald-800">{m.title || m.role}</p>
                    </div>
                    <div className="pt-2 border-t text-xs text-slate-600 space-y-1">
                      <p><strong>Keahlian:</strong> {m.expertise}</p>
                      {m.education && m.education.length > 0 && (
                        <p><strong>Pendidikan:</strong> {m.education.join(" • ")}</p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB 4: STRUKTUR ORGANISASI */}
        {activeTab === "struktur" && (
          <div id="struktur" className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
            <h2 className="font-serif font-bold text-2xl text-emerald-950">Struktur Organisasi Ma&apos;had Aly</h2>
            <div className="space-y-4 text-xs sm:text-sm text-slate-700">
              <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                <span className="font-bold text-emerald-900 block text-xs uppercase tracking-wider">Mudir Ma&apos;had Aly:</span>
                <p className="text-xl font-serif font-bold text-slate-900 mt-1">{settings.mudirName}</p>
                <p className="text-xs text-slate-600 mt-1">Pimpinan Tertinggi &amp; Pengasuh Halaqah Turats</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-800 block">Wakil Mudir I (Bidang Akademik &amp; Kurikulum):</span>
                  <p className="text-slate-700 font-semibold mt-0.5">Ust. M. Idrus, M.Ag.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-800 block">Wakil Mudir II (Keuangan &amp; Beasiswa OTA):</span>
                  <p className="text-slate-700 font-semibold mt-0.5">Biro Administrasi &amp; Orang Tua Asuh</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-800 block">Lembaga Bahtsul Masail (LBM):</span>
                  <p className="text-slate-700 font-semibold mt-0.5">Dewan Masyaikh &amp; Peneliti Muda Fiqh Mu&apos;asarah</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-800 block">LP2M (Pusat Riset &amp; Pengabdian):</span>
                  <p className="text-slate-700 font-semibold mt-0.5">Redaksi Jurnal &amp; Mimbar Kajian Ilmiah</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SARANA & PRASARANA */}
        {activeTab === "sarana" && (
          <div id="sarana" className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
            <h2 className="font-serif font-bold text-2xl text-emerald-950">Sarana &amp; Prasarana Pembelajaran</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs sm:text-sm">
              {facilities.map((fac) => (
                <div key={fac.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
                  <div className="w-full h-36 rounded-xl overflow-hidden bg-slate-200 relative">
                    {fac.photoUrl ? (
                      <Image
                        src={fac.photoUrl}
                        alt={fac.name}
                        width={400}
                        height={200}
                        className="w-full h-full object-cover"
                        unoptimized={true}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">🏛️</div>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      {fac.category}
                    </span>
                    <h4 className="font-bold text-slate-900 text-base mt-1">{fac.name}</h4>
                    <p className="text-slate-600 mt-1 text-xs leading-relaxed">{fac.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: AKREDITASI */}
        {activeTab === "akreditasi" && (
          <div id="akreditasi" className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
            <h2 className="font-serif font-bold text-2xl text-emerald-950">Status &amp; Sertifikat Akreditasi</h2>
            <div className="space-y-4">
              {accreditations.map((acc) => (
                <div key={acc.id} className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-200 px-3 py-1 rounded-full">
                      {acc.status}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">{acc.validDate}</span>
                  </div>
                  <h3 className="font-serif font-bold text-xl text-emerald-950">{acc.name}</h3>
                  <p className="text-xs sm:text-sm text-slate-700">Penerbit: <strong>{acc.issuer}</strong></p>
                  {acc.pdfUrl && (
                    <a
                      href={acc.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 underline hover:text-emerald-950"
                    >
                      <span>📄 Unduh / Lihat Sertifikat Resmi PDF</span>
                      {acc.fileSize && <span>({acc.fileSize})</span>}
                      <span>&rarr;</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}

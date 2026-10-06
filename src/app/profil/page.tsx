"use client";

import { useState } from "react";
import Link from "next/link";
import { useArticles } from "@/context/ArticleContext";

export default function ProfilPage() {
  const { settings } = useArticles();
  const [activeTab, setActiveTab] = useState<"sejarah" | "visi-misi" | "masyayikh" | "struktur" | "sarana" | "akreditasi">("sejarah");

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
            { id: "sejarah", label: "Sejarah Berdiri (2013)" },
            { id: "visi-misi", label: "Visi & Misi" },
            { id: "masyayikh", label: "Masyayikh / Dewan Dosen" },
            { id: "struktur", label: "Struktur Organisasi" },
            { id: "sarana", label: "Sarana & Prasarana" },
            { id: "akreditasi", label: "Sertifikat Akreditasi" }
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
            
            <div className="text-slate-700 space-y-4 text-sm sm:text-base leading-relaxed">
              <p>
                Ma&apos;had Aly DDI Mangkoso resmi didirikan pada tanggal <strong className="text-emerald-900 font-semibold">{settings.establishedDate}</strong> di Kompleks Kampus Pondok Pesantren DDI Mangkoso, Kabupaten Barru, Sulawesi Selatan.
              </p>
              <p>
                Gagasan luhur ini diinisiasi oleh <strong>{settings.mudirName}</strong> bersama dewan masyaikh dan pimpinan Pondok Pesantren DDI Mangkoso. Kelahiran lembaga ini didorong oleh keprihatinan yang mendalam atas semakin langkanya ulama fukaha (*mutafaqqih fiddin*) yang menguasai khazanah turats klasik secara mendalam sekaligus memiliki kelenturan nalar dalam menjawab problematika umat di era modern (*Fiqh Mu&apos;asarah*).
              </p>
              <p>
                Melanjutkan wasiat perjuangan pendiri utama Darud Da&apos;wah wal Irsyad (DDI), <strong>AGH. Abdurrahman Ambo Dalle</strong>, Ma&apos;had Aly DDI Mangkoso berkomitmen penuh mencetak kader-kader mujtahid kontemporer melalui masa pengkaderan intensif 4 tahun dengan beasiswa penuh 100% via program Orang Tua Asuh.
              </p>
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
            <h2 className="font-serif font-bold text-2xl text-emerald-950">
              Masyayikh &amp; Dewan Dosen Pengampu
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: "AGH. Prof. Dr. M. Faried Wadjedy, MA", role: "Mudir Ma'had Aly / Guru Besar Fiqh", focus: "Kutubut Turats & Fatwa Wasathiyyah" },
                { name: "Ust. M. Idrus, M.Ag.", role: "Kepala Bidang Akademik", focus: "Ushul Fikih & Fiqh Muamalah Digital" },
                { name: "Ismail Hannanong, Lc., M.H.", role: "Dosen Senior", focus: "Dirasah Hadits & Fiqh Medis" },
                { name: "Ust. H. Syahrul, M.Pd.I.", role: "Dosen Qawa'id Fiqhiyyah", focus: "Kaidah Fikih Asasiyah" },
                { name: "Dewan Masyaikh DDI Mangkoso", role: "Pengampu Pengajian Halaqah", focus: "Sorogan Kitab Kuning Salaf" }
              ].map((m, i) => (
                <div key={i} className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h4 className="font-serif font-bold text-base text-slate-900">{m.name}</h4>
                  <p className="text-xs font-semibold text-emerald-800">{m.role}</p>
                  <p className="text-xs text-slate-500">Takhassus: {m.focus}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: STRUKTUR */}
        {activeTab === "struktur" && (
          <div id="struktur" className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
            <h2 className="font-serif font-bold text-2xl text-emerald-950">Struktur Organisasi Ma&apos;had Aly</h2>
            <div className="space-y-4 text-xs sm:text-sm text-slate-700">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="font-bold text-emerald-900 block">Mudir Ma&apos;had Aly:</span>
                <p className="text-base font-serif font-bold text-slate-900">{settings.mudirName}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-800 block">Wakil Mudir I (Bidang Akademik):</span>
                  <p>Ust. M. Idrus, M.Ag.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-800 block">Wakil Mudir II (Administrasi &amp; Keuangan):</span>
                  <p>Biro Keuangan &amp; Donatur Orang Tua Asuh</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-800 block">Lembaga Bahtsul Masail (LBM):</span>
                  <p>Tim Masyaikh &amp; Peneliti Muda Fiqh Mu&apos;asarah</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-800 block">LP2M (Penelitian &amp; Pengabdian):</span>
                  <p>Redaksi Jurnal &amp; Mimbar Kajian Ilmiah</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SARANA */}
        {activeTab === "sarana" && (
          <div id="sarana" className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
            <h2 className="font-serif font-bold text-2xl text-emerald-950">Sarana &amp; Prasarana Pembelajaran</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs sm:text-sm">
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-base">Masjid &amp; Halaqah Utama</h4>
                <p className="text-slate-600">Pusat pengajian wetonan, sorogan, dan mudzakarah kitab kuning salaf.</p>
              </div>
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-base">Perpustakaan Turats</h4>
                <p className="text-slate-600">Ribuan jilid kitab rujukan primer fiqh madzhab empat dan manuskrip karya ulama Nusantara.</p>
              </div>
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-base">Asrama Khusus Mahasantri</h4>
                <p className="text-slate-600">Fasilitas mukim santri 24 jam dengan bimbingan akhlak dan disiplin bahasa Arab.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: AKREDITASI */}
        {activeTab === "akreditasi" && (
          <div id="akreditasi" className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
            <h2 className="font-serif font-bold text-2xl text-emerald-950">Status &amp; Sertifikat Akreditasi</h2>
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-200 px-3 py-1 rounded-full">
                Izin Operasional Resmi Kemenag RI
              </span>
              <h3 className="font-serif font-bold text-xl text-emerald-950">
                Pendidikan Tinggi Keagamaan Islam (Ma&apos;had Aly Marhalah Ula)
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                Ma&apos;had Aly DDI Mangkoso beroperasi secara legal formal berdasarkan izin operasional Kementerian Agama Republik Indonesia dengan hak menyelenggarakan program sarjana kader ulama (S.Ag.) setara jenjang Strata Satu (S-1).
              </p>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}

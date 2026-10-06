"use client";

import Link from "next/link";
import { useArticles } from "@/context/ArticleContext";

export default function AkademikPage() {
  const { settings } = useArticles();

  return (
    <main className="pt-24 pb-20 bg-slate-50 min-h-screen">
      {/* Header Banner */}
      <section className="bg-mahad-green-dark text-white py-14 bg-islamic-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-mahad-gold bg-white/10 px-3.5 py-1 rounded-full">
            Struktur Pendidikan &amp; Kurikulum
          </span>
          <h1 className="font-serif font-bold text-3xl sm:text-5xl text-white mt-3">
            Akademik {settings.takhassus}
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base max-w-2xl mx-auto mt-2">
            Pendidikan intensif 4 tahun (8 Semester) jenjang Marhalah Ula dengan kurikulum terpadu Turats Salaf dan Riset Fiqh Mu&apos;asarah.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        
        {/* Takhassus & Fokus Keilmuan */}
        <div id="takhassus" className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
              Program Takhassus
            </span>
            <h2 className="font-serif font-bold text-2xl text-slate-900">
              Fiqh wa Usuluhu (Hukum Islam &amp; Kaidah Ushul)
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Program ini membina kemampuan mahasantri dalam membaca naskah klasik tanpa harakat, memahami konteks sosio-historis teks fiqih, dan menguasai kaidah tarjih lintas madzhab.
            </p>
          </div>

          <div id="fiqh-muasarah" className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white p-8 rounded-2xl shadow-xl space-y-4 border border-mahad-gold/30">
            <span className="text-xs font-bold uppercase tracking-wider text-mahad-gold bg-white/10 px-3 py-1 rounded-full">
              Fokus Spesialisasi
            </span>
            <h2 className="font-serif font-bold text-2xl text-mahad-gold">
              Fiqh Mu&apos;asarah (الفقه المعاصر) &bull; Fiqh Kontemporer
            </h2>
            <p className="text-emerald-100 text-sm leading-relaxed">
              Mahasantri dibekali keterampilan istinbath hukum atas isu-isu mutakhir: transaksi kripto, fintech syariah, bioetika medis, kecerdasan buatan (AI), green economy, dan hukum kewarganegaraan modern.
            </p>
          </div>
        </div>

        {/* Struktur Kurikulum Per Tahun */}
        <div id="kurikulum" className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-8 bg-mahad-gold rounded-full inline-block"></span>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900">
              Struktur Kurikulum 4 Tahun (Marhalah Ula)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">Tahun I (Smtr 1-2)</span>
              <h4 className="font-serif font-bold text-lg text-slate-900">Penguatan Ilmu Alat</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Nahwu (Alfiyah Ibn Malik), Sharaf (Al-Maqshud), Balaghah (Al-Jauhar al-Maknun), Mantiq, dan Pengantar Fiqh Syafi&apos;i (Fathul Qarib).
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">Tahun II (Smtr 3-4)</span>
              <h4 className="font-serif font-bold text-lg text-slate-900">Pendalaman Turats</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ushul Fikih (Al-Waraqat &amp; Jam&apos;ul Jawami&apos;), Fathul Mu&apos;in, Tafsir Ayat al-Ahkam, dan Hadits Ahkam (Bulughul Maram).
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">Tahun III (Smtr 5-6)</span>
              <h4 className="font-serif font-bold text-lg text-slate-900">Fiqh Muqaran &amp; Kaidah</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Al-Asybah wan Nazha&apos;ir (As-Suyuthi), Fiqh Muqaran al-Madzahib (Bidayatul Mujtahid), dan Maqashid Syari&apos;ah (Asy-Syathibi).
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">Tahun IV (Smtr 7-8)</span>
              <h4 className="font-serif font-bold text-lg text-slate-900">Fiqh Mu&apos;asarah &amp; Skripsi</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bahtsul Masail Isu Kontemporer, Metodologi Fatwa DSN/MUI, dan Penyusunan Risalah Ilmiah (Skripsi Sarjana).
              </p>
            </div>
          </div>
        </div>

        {/* Kalender & Pedoman */}
        <div id="kalender" className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-serif font-bold text-xl text-slate-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-mahad-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Kalender Akademik 2026/2027</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex justify-between pb-1 border-b"><span>Kuliah Semester Ganjil:</span><strong>Agustus - Desember</strong></li>
              <li className="flex justify-between pb-1 border-b"><span>Ujian Tengah Semester (UTS):</span><strong>Oktober</strong></li>
              <li className="flex justify-between pb-1 border-b"><span>Ujian Akhir Semester (UAS):</span><strong>Desember</strong></li>
              <li className="flex justify-between pb-1 border-b"><span>Sidang Munaqasyah Skripsi:</span><strong>Mei - Juni</strong></li>
            </ul>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
            <div>
              <h3 className="font-serif font-bold text-xl text-slate-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Buku Pedoman Akademik</span>
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Panduan resmi sistem SKS halaqah, tata tertib mahasantri, dan pedoman penulisan skripsi standar Marhalah Ula.
              </p>
            </div>
            <Link
              href="/skripsi"
              className="inline-flex items-center justify-center gap-2 bg-emerald-800 text-white font-bold px-4 py-2.5 rounded-xl hover:bg-emerald-900 transition text-xs"
            >
              <span>Lihat Repositori Skripsi Mahasantri</span>
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}

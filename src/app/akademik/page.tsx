"use client";

import { useState } from "react";
import Link from "next/link";
import { useArticles } from "@/context/ArticleContext";

export default function AkademikPage() {
  const { settings, courses, calendarEvents, pageTexts } = useArticles();
  const [selectedSemester, setSelectedSemester] = useState<number>(1);

  const safeCourses = Array.isArray(courses) ? courses : [];
  const safeCalendarEvents = Array.isArray(calendarEvents) ? calendarEvents : [];
  const filteredCourses = safeCourses.filter((c) => c.semester === selectedSemester);

  return (
    <main className="pt-24 pb-20 bg-slate-50 min-h-screen">
      {/* Header Banner */}
      <section className="bg-mahad-green-dark text-white py-14 bg-islamic-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-mahad-gold bg-white/10 px-3.5 py-1 rounded-full">
            {pageTexts?.akademikBadge || "Struktur Pendidikan & Kurikulum"}
          </span>
          <h1 className="font-serif font-bold text-3xl sm:text-5xl text-white mt-3">
            {pageTexts?.akademikTitle || `Akademik ${settings?.takhassus || "Fiqh wa Usuluhu"}`}
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base max-w-2xl mx-auto mt-2">
            {pageTexts?.akademikDesc ||
              "Pendidikan intensif 4 tahun (8 Semester) jenjang Marhalah Ula dengan kurikulum terpadu Turats Salaf dan Riset Fiqh Mu'asarah."}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        
        {/* Takhassus & Fokus Keilmuan */}
        <div id="takhassus" className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
              {pageTexts?.akademikTakhassusBadge || "Program Takhassus"}
            </span>
            <h2 className="font-serif font-bold text-2xl text-slate-900">
              {pageTexts?.akademikTakhassusTitle || settings.takhassus}
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              {pageTexts?.akademikTakhassusDesc ||
                "Program ini membina kemampuan mahasantri dalam membaca naskah klasik tanpa harakat, memahami konteks sosio-historis teks fiqih, dan menguasai kaidah tarjih lintas madzhab."}
            </p>
          </div>

          <div id="fiqh-muasarah" className="bg-linear-to-br from-emerald-900 to-emerald-950 text-white p-8 rounded-2xl shadow-xl space-y-4 border border-mahad-gold/30">
            <span className="text-xs font-bold uppercase tracking-wider text-mahad-gold bg-white/10 px-3 py-1 rounded-full">
              {pageTexts?.akademikFokusBadge || "Fokus Spesialisasi Utama"}
            </span>
            <h2 className="font-serif font-bold text-2xl text-mahad-gold">
              {pageTexts?.akademikFokusTitle || settings.focusField}
            </h2>
            <p className="text-emerald-100 text-sm leading-relaxed">
              {pageTexts?.akademikFokusDesc ||
                "Mahasantri dibekali keterampilan istinbath hukum atas isu-isu mutakhir: transaksi kripto, fintech syariah, bioetika medis, kecerdasan buatan (AI), green economy, dan hukum kewarganegaraan modern."}
            </p>
          </div>
        </div>

        {/* Struktur Kurikulum Interaktif Per Semester */}
        <div id="kurikulum" className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-8 bg-mahad-gold rounded-full inline-block"></span>
              <h2 className="font-serif font-bold text-2xl text-slate-900">
                Struktur Kurikulum 8 Semester
              </h2>
            </div>
            {/* Semester Buttons */}
            <div className="flex flex-wrap gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <button
                  key={sem}
                  type="button"
                  onClick={() => setSelectedSemester(sem)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    selectedSemester === sem
                      ? "bg-emerald-800 text-white shadow"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Smtr {sem}
                </button>
              ))}
            </div>
          </div>

          {/* List Matakuliah Semester Terpilih */}
          <div className="space-y-4">
            <h3 className="font-bold text-base text-emerald-900">
              Daftar Mata Kuliah Semester {selectedSemester}
            </h3>

            {filteredCourses.length === 0 ? (
              <div className="p-6 bg-slate-50 rounded-xl border text-center text-xs text-slate-500">
                Belum ada rincian mata kuliah untuk semester {selectedSemester}. Admin dapat menambahkannya via Panel Admin.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCourses.map((crs) => (
                  <div key={crs.id} className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-800 text-xs bg-emerald-100 px-2.5 py-0.5 rounded">
                        {crs.credits} SKS
                      </span>
                      <span className="text-[11px] text-slate-500">Pengampu: {crs.lecturer}</span>
                    </div>
                    <h4 className="font-serif font-bold text-slate-900 text-base">{crs.name}</h4>
                    <p className="text-slate-600 text-xs leading-relaxed">{crs.description}</p>
                    <div className="pt-2 border-t text-[11px] text-slate-500 space-y-0.5">
                      <p><strong>Kitab Utama:</strong> {crs.mainBook}</p>
                      {crs.supportBook && <p><strong>Kitab Pendukung:</strong> {crs.supportBook}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Kalender Akademik & Buku Pedoman */}
        <div id="kalender" className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-sm">
          {/* Kalender */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-xl text-slate-900 flex items-center gap-2">
              <span>📅</span>
              <span>{pageTexts?.akademikKalenderTitle || "Kalender Akademik"} ({calendarEvents.length} Agenda)</span>
            </h3>
            <div className="space-y-3">
              {calendarEvents.map((ev) => (
                <div key={ev.id} className="p-3.5 bg-slate-50 rounded-xl border flex items-start justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-emerald-800 text-[10px] uppercase bg-emerald-100 px-2 py-0.5 rounded">
                      {ev.category}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm mt-1">{ev.name}</h4>
                    <p className="text-slate-600 text-[11px] mt-0.5">{ev.description}</p>
                  </div>
                  <span className="font-bold text-slate-700 bg-white px-2.5 py-1 rounded border text-[10px] shrink-0 text-right">
                    {ev.startDate}
                    {ev.endDate && ev.endDate !== ev.startDate && ` - ${ev.endDate}`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Buku Pedoman & Sistem Penilaian */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-serif font-bold text-lg text-slate-900 flex items-center gap-2">
                <span>📘</span>
                <span>{pageTexts?.akademikPedomanTitle || "Buku Pedoman Akademik"}</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {pageTexts?.akademikPedomanDesc ||
                  "Panduan resmi sistem SKS halaqah, tata tertib mahasantri, kurikulum turats, dan pedoman penulisan risalah skripsi."}
              </p>
              {settings.academicGuideBookUrl && (
                <a
                  href={settings.academicGuideBookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-4 py-2.5 rounded-xl transition text-xs shadow"
                >
                  <span>Unduh Pedoman PDF</span>
                  {settings.academicGuideBookSize && <span>({settings.academicGuideBookSize})</span>}
                  <span>&rarr;</span>
                </a>
              )}
            </div>

            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-2">
              <h4 className="font-serif font-bold text-base text-emerald-950">
                {pageTexts?.akademikPenilaianTitle || "Sistem Penilaian & Kelulusan"}
              </h4>
              <p className="text-xs text-emerald-900 leading-relaxed">
                {pageTexts?.akademikPenilaianDesc || settings.gradingSystemRules ||
                  "Sistem penilaian menggabungkan pengujian hafalan matan turats (ikhtibar), penguasaan qawa'id fiqhiyyah, keaktifan halaqah Bahtsul Masail, serta penulisan risalah ilmiah skripsi (munaqasyah) dengan predikat kelulusan Mumtaz (Cum Laude)."}
              </p>
            </div>
          </div>
        </div>

        {/* Elemen / Kartu Tambahan Kustom CMS */}
        {(() => {
          const customCards = (pageTexts?.customElements || []).filter((el) => el.page === "akademik");
          if (customCards.length === 0) return null;

          return (
            <div className="space-y-6 pt-4">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-8 bg-mahad-gold rounded-full inline-block"></span>
                <h2 className="font-serif font-bold text-2xl text-slate-900">
                  Program &amp; Informasi Akademik Tambahan
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {customCards.map((el) => (
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

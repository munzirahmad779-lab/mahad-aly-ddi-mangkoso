"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useArticles } from "@/context/ArticleContext";
import { DemaMember, DemaDivision } from "@/lib/types";

export default function DemaPage() {
  const { demaSettings } = useArticles();
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>("all");
  const [searchMemberQuery, setSearchMemberQuery] = useState<string>("");
  const [selectedMemberModal, setSelectedMemberModal] = useState<DemaMember | null>(null);

  const divisions = useMemo(() => {
    return (demaSettings?.divisions || [])
      .filter((d) => d.isActive !== false && d.id !== "div-bph" && d.code !== "bph")
      .sort((a, b) => a.order - b.order);
  }, [demaSettings]);

  const members = useMemo(() => {
    return (demaSettings?.members || []).filter((m) => m.isActive !== false).sort((a, b) => a.order - b.order);
  }, [demaSettings]);

  // Presidium BPH Core Members
  const bphMembers = useMemo(() => {
    return members.filter((m) => m.divisionId === "div-bph" || m.divisionId === "bph");
  }, [members]);

  // Division Filtered Members
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchDivision =
        selectedDivisionId === "all"
          ? true
          : selectedDivisionId === "bph"
          ? m.divisionId === "div-bph" || m.divisionId === "bph"
          : m.divisionId === selectedDivisionId;

      const matchSearch = searchMemberQuery.trim() === ""
        ? true
        : m.name.toLowerCase().includes(searchMemberQuery.toLowerCase()) ||
          m.role.toLowerCase().includes(searchMemberQuery.toLowerCase()) ||
          (m.marhalah && m.marhalah.toLowerCase().includes(searchMemberQuery.toLowerCase())) ||
          (m.bio && m.bio.toLowerCase().includes(searchMemberQuery.toLowerCase()));

      return matchDivision && matchSearch;
    });
  }, [members, selectedDivisionId, searchMemberQuery]);

  // Active division details if specific division pill is selected
  const activeDivisionDetail: DemaDivision | undefined = useMemo(() => {
    if (selectedDivisionId === "all" || selectedDivisionId === "bph") return undefined;
    return divisions.find((d) => d.id === selectedDivisionId);
  }, [divisions, selectedDivisionId]);

  return (
    <main className="pt-28 sm:pt-32 md:pt-36 pb-24 bg-slate-50 min-h-screen">
      {/* ══════════════════════════════════════════════════════════════
          1. HERO HEADER: Kabinet DeMa & Motto Arab
         ══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#02241b] via-[#053d2e] to-[#011a13] text-white py-16 sm:py-20 border-b border-emerald-900/60 shadow-xl">
        {/* Islamic Subtle Motif Background */}
        <div className="absolute inset-0 bg-islamic-pattern opacity-10 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-mahad-gold/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-white/10 text-mahad-gold border border-mahad-gold/30 backdrop-blur-md mb-4 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-mahad-gold animate-pulse" />
            <span>Dewan Mahasantri (DeMa) • Ma&apos;had Aly DDI Mangkoso</span>
          </div>

          {/* Main Period Title */}
          <h1 className="font-serif font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight max-w-4xl mx-auto drop-shadow-md">
            {demaSettings?.periodTitle || "Kabinet Khidmah & Intelektual"}
          </h1>

          {/* Arabic Motto Calligraphy */}
          {demaSettings?.leadQuoteArabic && (
            <p className="font-serif text-xl sm:text-2xl lg:text-3xl text-mahad-gold mt-4 font-normal tracking-wide drop-shadow" dir="rtl">
              {demaSettings.leadQuoteArabic}
            </p>
          )}

          {/* Tagline & Lead Description */}
          <p className="text-emerald-100 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto mt-4 leading-relaxed font-light">
            {demaSettings?.tagline ||
              "Mengakar pada Turats Klasik, Menjulang dalam Gagasan Fiqh Kontemporer."}
          </p>

          {demaSettings?.leadQuote && (
            <p className="text-xs sm:text-sm text-emerald-300/80 italic max-w-xl mx-auto mt-2">
              &ldquo;{demaSettings.leadQuote}&rdquo;
            </p>
          )}

          {/* Quick Stats Pill */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-emerald-200">
            <div className="bg-white/5 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-sm flex items-center gap-2">
              <span className="text-mahad-gold font-bold">🏛️ {divisions.length}</span>
              <span>Divisi Fungsional</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-sm flex items-center gap-2">
              <span className="text-mahad-gold font-bold">👥 {members.length}</span>
              <span>Pengurus Amanah</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-sm flex items-center gap-2">
              <span className="text-mahad-gold font-bold">📜 M.1</span>
              <span>Kader Ulama Fiqh</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          2. BENTO-GRID / ORG-CHART PRESIDIUM BPH (Pimpinan Tertinggi)
         ══════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
                <span className="w-2.5 h-1 bg-mahad-gold rounded-full" />
                <span>Presidium Utama</span>
              </div>
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-slate-900">
                Badan Pengurus Harian (BPH) DeMa
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Pimpinan mandataris musyawarah kubra mahasantri Ma&apos;had Aly DDI Mangkoso.
              </p>
            </div>

            <div className="text-right hidden sm:block">
              <span className="text-xs bg-emerald-50 text-emerald-900 font-bold px-3 py-1.5 rounded-full border border-emerald-200">
                Masa Khidmah Berjalan
              </span>
            </div>
          </div>

          {/* Org-Chart Hierarchy Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {bphMembers.map((leader, idx) => {
              // Custom green styling: checked via leader.isHighlighted OR defaults to first 2 leaders (Ketua & Wakil) if not explicitly set
              const isGreenCard = leader.isHighlighted !== undefined
                ? leader.isHighlighted
                : idx < 2 || leader.role.toLowerCase().includes("ketua");

              return (
                <div
                  key={leader.id}
                  onClick={() => setSelectedMemberModal(leader)}
                  className={`group relative rounded-2xl p-5 cursor-pointer transition-all duration-300 flex flex-col justify-between border ${
                    isGreenCard
                      ? "bg-gradient-to-b from-[#043d2e] to-[#02241b] text-white border-emerald-600/80 shadow-lg hover:shadow-2xl hover:-translate-y-1 ring-1 ring-emerald-500/30"
                      : "bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                  }`}
                >
                  <div>
                    {/* Top Role Badge */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full whitespace-nowrap ${
                          isGreenCard
                            ? "bg-mahad-gold text-slate-950 font-extrabold shadow-sm"
                            : "bg-emerald-100 text-emerald-900 border border-emerald-200"
                        }`}
                      >
                        {leader.role}
                      </span>
                      {leader.nim && (
                        <span className={`text-[10px] font-mono shrink-0 ${isGreenCard ? "text-emerald-300" : "text-slate-400"}`}>
                          #{leader.nim}
                        </span>
                      )}
                    </div>

                    {/* Avatar & Info */}
                    <div className="flex items-center gap-3.5 mb-3">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 font-bold text-lg overflow-hidden border-2 shadow-inner transition-transform group-hover:scale-105 ${
                          isGreenCard
                            ? "bg-[#064e3b] text-mahad-gold border-mahad-gold/60"
                            : "bg-emerald-100 text-emerald-900 border-emerald-300"
                        }`}
                      >
                        {leader.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={leader.photoUrl}
                            alt={leader.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{leader.name.charAt(0)}</span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className={`font-serif font-bold text-sm sm:text-base leading-snug line-clamp-2 ${isGreenCard ? "text-white" : "text-slate-900"}`}>
                          {leader.name}
                        </h3>
                        <p className={`text-[11px] truncate mt-0.5 ${isGreenCard ? "text-emerald-200" : "text-slate-500"}`}>
                          {leader.marhalah || "Mahasantri Marhalah Ula"}
                        </p>
                      </div>
                    </div>

                    {/* Bio Snippet */}
                    <p className={`text-xs line-clamp-2 leading-relaxed ${isGreenCard ? "text-emerald-100/80" : "text-slate-600"}`}>
                      {leader.bio || "Fokus pada pendampingan tata kelola ormawa dan riset keilmuan santri."}
                    </p>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className={`mt-4 pt-3 border-t flex items-center justify-between text-[11px] font-semibold ${
                    isGreenCard ? "border-emerald-800/80 text-emerald-300" : "border-slate-100 text-emerald-700"
                  }`}>
                    <span>Detail Profil & Amanah</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          3. INTERACTIVE DIVISION PILLS FILTER & SEARCH
         ══════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
              <span className="w-2.5 h-1 bg-mahad-gold rounded-full" />
              <span>Struktur & Fungsionaris</span>
            </div>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900">
              Eksplorasi Divisi & Pengurus DeMa
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Pilih divisi di bawah untuk melihat program kerja khusus dan nama fungsionaris yang bertugas.
            </p>
          </div>

          {/* Search Input Box */}
          <div className="w-full md:w-72 relative">
            <input
              type="text"
              value={searchMemberQuery}
              onChange={(e) => setSearchMemberQuery(e.target.value)}
              placeholder="Cari pengurus / divisi..."
              className="w-full text-xs bg-white border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-full py-2.5 pl-9 pr-4 text-slate-800 shadow-sm"
            />
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchMemberQuery && (
              <button
                type="button"
                onClick={() => setSearchMemberQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Division Pill Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none">
          {/* Option All */}
          <button
            type="button"
            onClick={() => setSelectedDivisionId("all")}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm shrink-0 flex items-center gap-1.5 ${
              selectedDivisionId === "all"
                ? "bg-emerald-800 text-white shadow-md ring-2 ring-emerald-600"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <span>✨ Semua Divisi ({members.length})</span>
          </button>

          {/* Option BPH */}
          <button
            type="button"
            onClick={() => setSelectedDivisionId("bph")}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm shrink-0 flex items-center gap-1.5 ${
              selectedDivisionId === "bph"
                ? "bg-emerald-800 text-white shadow-md ring-2 ring-emerald-600"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <span>👑 Presidium BPH ({bphMembers.length})</span>
          </button>

          {/* Dynamic Divisions */}
          {divisions.map((div) => {
            const count = members.filter((m) => m.divisionId === div.id).length;
            const isSelected = selectedDivisionId === div.id;
            return (
              <button
                key={div.id}
                type="button"
                onClick={() => setSelectedDivisionId(div.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-emerald-800 text-white shadow-md ring-2 ring-emerald-600"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <span>{div.icon || "📌"}</span>
                <span>{div.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ══════════════════════════════════════════════════════════════
            4. ACTIVE DIVISION FOCUS BANNER (Tugas Pokok & Proker)
           ══════════════════════════════════════════════════════════════ */}
        {activeDivisionDetail && (
          <div className="mt-4 bg-gradient-to-r from-emerald-900/90 to-[#043d2e] text-white rounded-2xl p-5 sm:p-6 shadow-md border border-emerald-700/60 animate-fadeIn">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{activeDivisionDetail.icon || "📌"}</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-mahad-gold">
                    Fokus Divisi Aktif
                  </span>
                </div>
                <h3 className="font-serif font-bold text-xl sm:text-2xl text-white">
                  {activeDivisionDetail.name}
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100/90 max-w-3xl leading-relaxed">
                  {activeDivisionDetail.description}
                </p>
              </div>

              {activeDivisionDetail.responsibilities && activeDivisionDetail.responsibilities.length > 0 && (
                <div className="bg-black/20 rounded-xl p-3.5 border border-white/10 shrink-0 lg:max-w-md">
                  <span className="text-[11px] font-bold text-mahad-gold uppercase tracking-wider block mb-1.5">
                    Program Kerja Utama:
                  </span>
                  <ul className="text-xs text-emerald-100 space-y-1">
                    {activeDivisionDetail.responsibilities.map((r, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-mahad-gold shrink-0">✓</span>
                        <span className="leading-snug">{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            5. MEMBER CARDS SHOWCASE (Modern Bento Cards)
           ══════════════════════════════════════════════════════════════ */}
        <div className="mt-8">
          {filteredMembers.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <span className="text-4xl block mb-2">🔍</span>
              <h3 className="font-bold text-slate-800 text-base">Tidak ada pengurus ditemukan</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Coba gunakan kata kunci pencarian lain atau pilih tab divisi lainnya.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchMemberQuery("");
                  setSelectedDivisionId("all");
                }}
                className="mt-4 px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-bold shadow hover:bg-emerald-900 transition"
              >
                Tampilkan Semua Pengurus
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredMembers.map((member) => {
                const memberDiv = divisions.find((d) => d.id === member.divisionId);
                const isBph = member.divisionId === "div-bph" || member.divisionId === "bph";
                const isGreenCard = Boolean(member.isHighlighted);

                return (
                  <div
                    key={member.id}
                    onClick={() => setSelectedMemberModal(member)}
                    className={`group rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-1 ${
                      isGreenCard
                        ? "bg-gradient-to-b from-[#043d2e] to-[#02241b] text-white border-emerald-600/80 shadow-lg hover:shadow-2xl ring-1 ring-emerald-500/30"
                        : "bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-500"
                    }`}
                  >
                    <div>
                      {/* Top Header Badge */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
                          isGreenCard
                            ? "bg-mahad-gold text-slate-950 font-extrabold shadow-sm"
                            : isBph
                            ? "bg-amber-100 text-amber-900 border border-amber-200"
                            : "bg-emerald-50 text-emerald-800 border border-emerald-100"
                        }`}>
                          {isBph ? "👑 Presidium" : memberDiv?.name || "Divisi DeMa"}
                        </span>
                        {member.nim && (
                          <span className={`text-[10px] font-mono shrink-0 ${isGreenCard ? "text-emerald-300" : "text-slate-400"}`}>
                            #{member.nim}
                          </span>
                        )}
                      </div>

                      {/* Avatar Image / Placeholder */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base shrink-0 overflow-hidden shadow-inner border ${
                          isGreenCard
                            ? "bg-[#064e3b] text-mahad-gold border-mahad-gold/60"
                            : "bg-gradient-to-tr from-emerald-800 to-emerald-600 text-white border-emerald-300"
                        }`}>
                          {member.photoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={member.photoUrl}
                              alt={member.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            member.name.charAt(0)
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className={`font-serif font-bold text-sm leading-snug line-clamp-2 ${isGreenCard ? "text-white" : "text-slate-900 group-hover:text-emerald-800 transition"}`}>
                            {member.name}
                          </h4>
                          <span className={`text-[11px] font-semibold block truncate mt-0.5 ${isGreenCard ? "text-emerald-200" : "text-emerald-700"}`}>
                            {member.role}
                          </span>
                        </div>
                      </div>

                      {/* Marhalah */}
                      <div className={`text-[11px] mb-2.5 flex items-center gap-1.5 ${isGreenCard ? "text-emerald-200/90" : "text-slate-500"}`}>
                        <span>🎓</span>
                        <span className="truncate">{member.marhalah || "Mahasantri Marhalah Ula"}</span>
                      </div>

                      {/* Bio / Quote Snippet */}
                      {member.quote ? (
                        <p className={`text-xs italic p-2.5 rounded-xl border line-clamp-2 ${
                          isGreenCard
                            ? "bg-black/20 text-emerald-100 border-white/10"
                            : "bg-slate-50 text-slate-600 border-slate-100"
                        }`}>
                          &ldquo;{member.quote}&rdquo;
                        </p>
                      ) : (
                        <p className={`text-xs line-clamp-2 ${isGreenCard ? "text-emerald-100/80" : "text-slate-600"}`}>
                          {member.bio || "Fungsionaris aktif yang berkhidmah dalam Dewan Mahasantri."}
                        </p>
                      )}
                    </div>

                    {/* Bottom CTA */}
                    <div className={`mt-4 pt-3 border-t flex items-center justify-between text-[11px] font-semibold ${
                      isGreenCard ? "border-emerald-800/80 text-emerald-300" : "border-slate-100 text-emerald-800 group-hover:text-emerald-900"
                    }`}>
                      <span>Buka Profil Lengkap</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          6. MODAL DETAIL PENGURUS (POP-UP BIODATA LENGKAP)
         ══════════════════════════════════════════════════════════════ */}
      {selectedMemberModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedMemberModal(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative overflow-hidden animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background accent banner */}
            <div className="absolute top-0 inset-x-0 h-36 bg-gradient-to-r from-emerald-950 via-[#043d2e] to-emerald-900 border-b border-emerald-700/50" />

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedMemberModal(null)}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center text-sm font-bold transition border border-white/20"
            >
              ✕
            </button>

            {/* Profile Header (Avatar and Title placed cleanly on top with white text on dark banner) */}
            <div className="relative pt-4 flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6 z-10">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white shadow-xl border-4 border-white flex items-center justify-center font-bold text-2xl text-emerald-900 overflow-hidden shrink-0 mt-2">
                {selectedMemberModal.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedMemberModal.photoUrl}
                    alt={selectedMemberModal.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{selectedMemberModal.name.charAt(0)}</span>
                )}
              </div>

              <div className="text-center sm:text-left min-w-0 flex-1 pt-1 sm:pt-2">
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-mahad-gold text-slate-950 shadow-sm mb-1.5">
                  {selectedMemberModal.role}
                </span>
                <h3 className="font-serif font-bold text-lg sm:text-2xl text-white leading-tight drop-shadow-sm">
                  {selectedMemberModal.name}
                </h3>
                <p className="text-xs text-emerald-200 mt-1 font-medium">
                  {selectedMemberModal.marhalah || "Mahasantri Marhalah Ula"}
                </p>
              </div>
            </div>

            {/* Content Details */}
            <div className="space-y-4 pt-2">
              {/* Meta Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Divisi Naungan</span>
                  <span className="font-semibold text-slate-800">
                    {divisions.find((d) => d.id === selectedMemberModal.divisionId)?.name || "Presidium BPH"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">NIM / Stambuk</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {selectedMemberModal.nim || "Resmi Terdaftar"}
                  </span>
                </div>
              </div>

              {/* Bio */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Deskripsi & Fokus Khidmah:
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                  {selectedMemberModal.bio || "Menjalankan tugas amanah fungsionaris dengan penuh integritas dan keteladanan sanad turats Ma'had Aly DDI Mangkoso."}
                </p>
              </div>

              {/* Quote */}
              {selectedMemberModal.quote && (
                <div className="bg-emerald-50/70 border-l-4 border-emerald-700 p-3 rounded-r-xl">
                  <span className="text-[10px] font-bold text-emerald-900 block mb-0.5 uppercase tracking-wider">
                    Motto & Prinsip Santri:
                  </span>
                  <p className="text-xs text-emerald-950 italic font-serif leading-relaxed">
                    &ldquo;{selectedMemberModal.quote}&rdquo;
                  </p>
                </div>
              )}

              {/* Social / Link */}
              {selectedMemberModal.instagram && (
                <div className="pt-2 flex justify-end">
                  <a
                    href={
                      selectedMemberModal.instagram.startsWith("http")
                        ? selectedMemberModal.instagram
                        : `https://instagram.com/${selectedMemberModal.instagram.replace("@", "")}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-emerald-800 hover:text-emerald-950 font-bold"
                  >
                    <span>📷 Akun Media Sosial</span>
                    <span>↗</span>
                  </a>
                </div>
              )}
            </div>

            {/* Modal Bottom Button */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedMemberModal(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          7. BOTTOM CTA SECTION (Kirim Aspirasi & Kontak DeMa)
         ══════════════════════════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-20">
        <div className="bg-gradient-to-r from-emerald-900 via-[#032e22] to-emerald-950 rounded-3xl p-8 sm:p-10 text-white shadow-xl border border-emerald-700/60 text-center relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            <div className="mb-4">
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-mahad-gold bg-white/10 px-4 py-1.5 rounded-full border border-mahad-gold/30">
                Aspirasi Mahasantri
              </span>
            </div>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-white mt-1 mb-3">
              Sampaikan Gagasan & Kolaborasi Bersama DeMa
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-light mb-6 max-w-xl">
              Dewan Mahasantri Ma&apos;had Aly DDI Mangkoso senantiasa membuka ruang komunikasi bagi civitas akademika, alumni, dan masyarakat luas untuk kemajuan pendidikan kader ulama.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/kirim-tulisan"
                className="px-5 py-2.5 bg-mahad-gold hover:bg-yellow-400 text-slate-950 font-bold rounded-full text-xs shadow-md transition transform hover:-translate-y-0.5"
              >
                ✍️ Kirim Risalah & Opini Santri
              </Link>
              <Link
                href="/kontak"
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full text-xs border border-white/20 transition"
              >
                📞 Hubungi Sekretariat
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

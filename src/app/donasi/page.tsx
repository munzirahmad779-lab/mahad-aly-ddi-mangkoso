"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useArticles } from "@/context/ArticleContext";
import { DonationProgram, DonationCategoryKey } from "@/lib/types";

export default function DonasiPage() {
  const { donations } = useArticles();
  const [selectedCategory, setSelectedCategory] = useState<"all" | DonationCategoryKey>("all");
  const [copiedBankId, setCopiedBankId] = useState<string | null>(null);
  const [selectedProgramModal, setSelectedProgramModal] = useState<DonationProgram | null>(null);

  const categories = [
    { id: "all", label: "🌟 Semua Program" },
    { id: "short_course_mesir", label: "✈️ Short Course Mesir" },
    { id: "web_dev", label: "💻 Pengembangan Web" },
    { id: "orang_tua_asuh", label: "🤝 Orang Tua Angkat" },
    { id: "operasional_umum", label: "🏛️ Infaq & Sarana Ma'had" }
  ];

  const filteredPrograms = donations.filter((p) => {
    if (!p.isActive) return false;
    if (selectedCategory === "all") return true;
    return p.category === selectedCategory;
  });

  const handleCopyAccount = (bankId: string, accountNumber: string) => {
    navigator.clipboard.writeText(accountNumber);
    setCopiedBankId(bankId);
    setTimeout(() => setCopiedBankId(null), 2500);
  };

  const formatRupiah = (val?: number) => {
    if (!val || val === 0) return "Rp 0";
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header Banner */}
      <section className="relative bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 text-white pt-36 md:pt-40 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-15"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-800/80 border border-emerald-500/40 text-emerald-200 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
            <span>🤲</span>
            <span>Infaq, Sedekah &amp; Wakaf Jariyah</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
            Dukung Kaderisasi Fuqaha &amp; <br className="hidden sm:inline" />
            <span className="text-mahad-gold">Peradaban Keilmuan Islam</span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-300 text-sm sm:text-base leading-relaxed">
            Salurkan infaq terbaik Anda untuk riset risalah ilmiah ke Mesir, orang tua angkat mahasantri,
            pengembangan sistem digital dakwah, serta sarana halaqah Ma&apos;had Aly DDI Mangkoso.
          </p>

          <div className="pt-2">
            <blockquote className="max-w-2xl mx-auto p-4 rounded-2xl bg-white/5 border border-white/10 text-xs sm:text-sm text-emerald-100 italic font-serif">
              &ldquo;Perumpamaan orang yang menginfakkan hartanya di jalan Allah seperti sebutir biji yang menumbuhkan tujuh tangkai, pada setiap tangkai ada seratus biji...&rdquo;
              <footer className="mt-1 text-[11px] font-sans font-semibold text-emerald-300 not-italic">
                — QS. Al-Baqarah: 261
              </footer>
            </blockquote>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                selectedCategory === cat.id
                  ? "bg-emerald-800 text-white shadow-md shadow-emerald-950/20 scale-105"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Program Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {filteredPrograms.map((prog) => {
            const hasTarget = prog.targetAmount && prog.targetAmount > 0;
            const collected = prog.collectedAmount || 0;
            const percent = hasTarget ? Math.min(100, Math.round((collected / (prog.targetAmount || 1)) * 100)) : 0;

            return (
              <div
                key={prog.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Image Container */}
                  <div className="relative h-56 w-full bg-slate-100 overflow-hidden">
                    {prog.imageUrl ? (
                      <img
                        src={prog.imageUrl}
                        alt={prog.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-emerald-900 text-white font-serif text-3xl font-bold">
                        Ma&apos;had Aly
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-900/90 text-white backdrop-blur-sm border border-emerald-700/50">
                        {prog.categoryLabel}
                      </span>
                      {prog.isFeatured && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-slate-950 shadow-sm">
                          ⭐ Program Utama
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 sm:p-7 space-y-4">
                    <h3 className="font-serif font-bold text-xl sm:text-2xl text-slate-900 leading-snug">
                      {prog.title}
                    </h3>

                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-3">
                      {prog.shortDesc}
                    </p>

                    {/* Funding Progress (jika ada target) */}
                    {hasTarget ? (
                      <div className="space-y-2 pt-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500">Terkumpul:</span>
                          <span className="font-bold text-emerald-800 font-serif text-sm">
                            {formatRupiah(prog.collectedAmount)}
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-full transition-all duration-1000"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between items-center text-[11px] text-slate-500 pt-0.5">
                          <span>Target: {formatRupiah(prog.targetAmount)}</span>
                          <span className="font-bold text-emerald-700">{percent}% ({prog.donorCount || 0} Donatur)</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
                        <span className="font-medium">🤝 Infaq Berkelanjutan / Terbuka</span>
                        <span className="font-bold">{prog.donorCount || 0} Muhsinin Bergabung</span>
                      </div>
                    )}

                    {/* Bank Accounts Section */}
                    <div className="space-y-2 pt-1">
                      <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block">
                        Rekening Donasi Resmi:
                      </span>
                      <div className="space-y-2">
                        {prog.bankAccounts.map((bank) => (
                          <div
                            key={bank.id}
                            className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 transition"
                          >
                            <div className="space-y-0.5">
                              <p className="text-xs font-bold text-slate-900">{bank.bankName}</p>
                              <p className="font-mono text-sm sm:text-base font-bold text-emerald-900 tracking-wide">
                                {bank.accountNumber}
                              </p>
                              <p className="text-[11px] text-slate-500">a.n. {bank.accountHolder}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopyAccount(bank.id, bank.accountNumber)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0 ${
                                copiedBankId === bank.id
                                  ? "bg-emerald-600 text-white"
                                  : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-300"
                              }`}
                            >
                              <span>{copiedBankId === bank.id ? "✓" : "📋"}</span>
                              <span>{copiedBankId === bank.id ? "Tersalin!" : "Salin No."}</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="p-6 pt-0 sm:p-7 sm:pt-0 space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Read Story Modal */}
                    <button
                      type="button"
                      onClick={() => setSelectedProgramModal(prog)}
                      className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 text-center transition"
                    >
                      📖 Rincian Program &amp; Kisah
                    </button>

                    {/* Download Proposal if exists */}
                    {prog.proposalUrl && (
                      <a
                        href={prog.proposalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-center transition flex items-center justify-center gap-1"
                      >
                        <span>📄</span>
                        <span className="truncate">Unduh Proposal PDF</span>
                      </a>
                    )}
                  </div>

                  {/* WhatsApp Confirmation */}
                  {prog.contactPerson && (
                    <a
                      href={`https://wa.me/${prog.contactPerson.phone}?text=${encodeURIComponent(
                        `Assalamu'alaikum Warahmatullahi Wabarakatuh.\n\nSaya ingin konfirmasi donasi / infaq untuk program:\n*${prog.title}*\n\nMohon konfirmasi tanda terima infaq resmi Ma'had Aly DDI Mangkoso. Terima kasih.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-emerald-800 hover:bg-emerald-900 text-white text-center transition flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span>📲</span>
                      <span>Konfirmasi Donasi via WhatsApp ({prog.contactPerson.name})</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Accountability & Transparency Section */}
        <section className="mt-16 bg-gradient-to-r from-emerald-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
          <div className="max-w-3xl space-y-4 relative z-10">
            <span className="text-mahad-gold text-xs uppercase tracking-widest font-bold">
              AKUNTABILITAS &amp; AMANAH KELEMBAGAAN
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold">
              Transparansi Penuh Di Bawah Bimbingan Dewan Masyaikh
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Seluruh dana donasi, wakaf, dan infaq yang disalurkan melalui rekening resmi dikelola secara terpisah
              sesuai akad peruntukan program. Dewan Pembina dan Pengawas memastikan setiap rupiah tersalurkan langsung
              untuk memajukan khazanah keilmuan Islam dan mencetak generasi fuqaha kontemporer yang berakhlak mulia.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-emerald-200">
              <span className="flex items-center gap-1.5">✓ Rekening Resmi Lembaga</span>
              <span className="flex items-center gap-1.5">✓ Bebas Biaya Administrasi Tersembunyi</span>
              <span className="flex items-center gap-1.5">✓ Laporan Berkala untuk Para Muhsinin</span>
            </div>
          </div>
        </section>
      </div>

      {/* Program Detail Modal */}
      {selectedProgramModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900">
                  {selectedProgramModal.categoryLabel}
                </span>
                <h3 className="font-serif font-bold text-xl sm:text-2xl text-slate-900 mt-2">
                  {selectedProgramModal.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProgramModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-sm font-bold shrink-0 transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <h4 className="font-bold text-slate-900 uppercase text-xs tracking-wider">Latar Belakang &amp; Deskripsi:</h4>
              <p className="whitespace-pre-line">{selectedProgramModal.story || selectedProgramModal.shortDesc}</p>
            </div>

            {selectedProgramModal.proposalUrl && (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/80 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-emerald-950">Berkas Proposal / Laporan Resmi</p>
                  <p className="text-[11px] text-slate-500">{selectedProgramModal.proposalName || "Dokumen Program PDF"}</p>
                </div>
                <a
                  href={selectedProgramModal.proposalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-800 text-white hover:bg-emerald-900 transition shrink-0"
                >
                  Unduh PDF
                </a>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedProgramModal(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useArticles } from "@/context/ArticleContext";
import { HomeSectionConfigItem } from "@/lib/types";

// ══════════════════════════════════════════════════════════════
// 1. HOME DONATION SECTION (Program Infaq & Donasi Pilihan)
// ══════════════════════════════════════════════════════════════
export function HomeDonationSection({ section }: { section: HomeSectionConfigItem }) {
  const { donations } = useArticles();
  const [copiedBankId, setCopiedBankId] = useState<string | null>(null);

  const activeDonations = (donations || [])
    .filter((d) => d.isActive !== false)
    .slice(0, section.maxItems || 3);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBankId(id);
    setTimeout(() => setCopiedBankId(null), 2000);
  };

  if (activeDonations.length === 0) return null;

  return (
    <section className="py-20 bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 text-white relative overflow-hidden">
      {/* Background Decorative Rings */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-mahad-gold/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-700/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-mahad-gold/20 border border-mahad-gold/40 rounded-full text-mahad-gold text-xs font-bold tracking-wide">
            <span>🤲</span>
            <span>{section.badge || "Amal Jariyah & Infaq Mahasantri"}</span>
          </div>
          <h2 className="font-serif font-bold text-2xl sm:text-4xl text-white">
            {section.title || section.label || "Dukung Kaderisasi Ulama Ahli Fiqh"}
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {section.subtitle ||
              "Salurkan infaq dan sedekah terbaik Anda untuk riset mahasantri, orang tua asuh kader ulama, dan sarana Ma'had Aly DDI Mangkoso."}
          </p>
        </div>

        {/* Donation Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeDonations.map((item) => {
            const percent =
              item.targetAmount && item.targetAmount > 0
                ? Math.min(100, Math.round(((item.collectedAmount || 0) / item.targetAmount) * 100))
                : null;

            return (
              <div
                key={item.id}
                className="bg-emerald-900/60 backdrop-blur-md border border-emerald-700/50 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:border-mahad-gold/50 transition-all duration-300 flex flex-col group"
              >
                {/* Banner Image */}
                <div className="relative h-48 w-full overflow-hidden bg-emerald-950">
                  <Image
                    src={item.imageUrl || "/image_067524.png"}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/40 to-transparent" />
                  <span className="absolute top-4 left-4 px-3 py-1 bg-mahad-gold text-mahad-green-dark text-[11px] font-bold rounded-full shadow">
                    {item.category === "short_course_mesir"
                      ? "✈️ Risalah Mesir"
                      : item.category === "web_dev"
                      ? "💻 Infaq Website"
                      : item.category === "orang_tua_asuh"
                      ? "🤝 Orang Tua Asuh"
                      : "🏛️ Infaq Ma'had"}
                  </span>
                </div>

                {/* Card Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-serif font-bold text-lg text-white group-hover:text-mahad-gold transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-slate-300 text-xs line-clamp-3 leading-relaxed">
                      {item.shortDesc}
                    </p>
                  </div>

                  {/* Target & Progress */}
                  {percent !== null && (
                    <div className="space-y-2 pt-2 border-t border-emerald-800/60">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Terkumpul:</span>
                        <span className="font-bold text-mahad-gold">
                          Rp {(item.collectedAmount || 0).toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="w-full bg-emerald-950 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-yellow-400 to-mahad-gold h-full rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Target: Rp {(item.targetAmount || 0).toLocaleString("id-ID")}</span>
                        <span className="font-bold text-white">{percent}%</span>
                      </div>
                    </div>
                  )}

                  {/* Bank Accounts Mini Pills */}
                  {item.bankAccounts && item.bankAccounts.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                        Salin Rekening Resmi:
                      </span>
                      <div className="space-y-1">
                        {item.bankAccounts.slice(0, 2).map((bank) => (
                          <div
                            key={bank.id}
                            className="flex items-center justify-between p-2 bg-emerald-950/60 border border-emerald-800/60 rounded-xl text-xs"
                          >
                            <span className="font-mono text-mahad-gold font-bold">
                              {bank.bankName} - {bank.accountNumber}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(bank.accountNumber, bank.id)}
                              className="px-2 py-0.5 bg-mahad-gold/20 hover:bg-mahad-gold hover:text-mahad-green-dark text-mahad-gold text-[10px] font-bold rounded-lg transition"
                            >
                              {copiedBankId === bank.id ? "✓ Tersalin" : "Salin"}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Link */}
                  <div className="pt-2">
                    <Link
                      href="/donasi"
                      className="w-full py-3 bg-mahad-gold hover:bg-yellow-400 text-mahad-green-dark font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 group-hover:scale-[1.02]"
                    >
                      <span>Infaq Sekarang</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA to Donasi Page */}
        <div className="text-center mt-12">
          <Link
            href="/donasi"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-full border border-white/20 transition"
          >
            <span>Lihat Semua Program &amp; Laporan Infaq</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════
// 2. HOME BAHTSUL MASAIL SECTION
// ══════════════════════════════════════════════════════════════
export function HomeBahtsulSection({ section }: { section: HomeSectionConfigItem }) {
  const { bahtsulQA } = useArticles();
  const list = (bahtsulQA || []).slice(0, section.maxItems || 3);

  if (list.length === 0) return null;

  return (
    <section className="py-20 bg-slate-900 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-800/40 border border-emerald-700/60 rounded-full text-emerald-300 text-xs font-bold">
            <span>🕌</span>
            <span>{section.badge || "Fiqh Mu'asarah & Turats"}</span>
          </div>
          <h2 className="font-serif font-bold text-2xl sm:text-4xl text-white">
            {section.title || section.label || "Bahtsul Masail & Tanya Jawab Fiqh"}
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            {section.subtitle ||
              "Hasil musyawarah fatwa dan telaah hukum syar'i mahasantri serta dewan masyayikh berlandaskan kitab-kitab muktabarah."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {list.map((item) => (
            <div
              key={item.id}
              className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-mahad-gold/60 transition shadow-lg"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="px-2.5 py-1 bg-emerald-900 text-emerald-300 rounded-md font-bold">
                    {item.theme || "Fiqh Kontemporer"}
                  </span>
                  <span className="text-slate-400">{item.date || "Terbaru"}</span>
                </div>
                <h3 className="font-serif font-bold text-base text-white hover:text-mahad-gold transition line-clamp-2">
                  <Link href={`/bahtsul-masail?id=${item.id}`}>{item.title}</Link>
                </h3>
                <p className="text-slate-300 text-xs line-clamp-3 leading-relaxed">
                  {item.question}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-700 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Penelaah / Rujukan:</span>
                <span className="font-bold text-mahad-gold px-2 py-0.5 bg-mahad-gold/10 rounded">
                  {item.author || "Dewan Fatwa"}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/bahtsul-masail"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-full transition shadow-md"
          >
            <span>Buka Seluruh Hasil Bahtsul Masail</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════
// 3. HOME PMB SECTION (Penerimaan Mahasantri Baru)
// ══════════════════════════════════════════════════════════════
export function HomePMBSection({ section }: { section: HomeSectionConfigItem }) {
  const { pmbWaves } = useArticles();
  const activeWave = (pmbWaves || [])[0];

  return (
    <section className="py-20 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <span className="inline-block px-3 py-1 bg-mahad-gold text-mahad-green-dark text-xs font-bold rounded-full shadow">
              {section.badge || "Penerimaan Mahasantri Baru (PMB)"}
            </span>
            <h2 className="font-serif font-bold text-2xl sm:text-4xl text-white">
              {section.title || "Jadilah Generasi Ulama Fiqh Masa Depan"}
            </h2>
            <p className="text-emerald-100 text-sm sm:text-base leading-relaxed max-w-2xl">
              {section.subtitle ||
                "Pendaftaran jenjang Marhalah Ula (M.1) Takhassus Fiqh wa Usuluhu Ma'had Aly DDI Mangkoso telah dibuka. Beasiswa penuh, bimbingan sanad kitab salaf, dan asrama representatif."}
            </p>
            {activeWave && (
              <div className="flex flex-wrap gap-4 pt-2 text-xs">
                <div className="bg-black/30 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/10">
                  <span className="text-slate-300 block text-[10px]">Gelombang Aktif:</span>
                  <span className="font-bold text-mahad-gold text-sm">{activeWave.name}</span>
                </div>
                <div className="bg-black/30 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/10">
                  <span className="text-slate-300 block text-[10px]">Jadwal Pendaftaran:</span>
                  <span className="font-bold text-white text-sm">{activeWave.startDate} s/d {activeWave.endDate}</span>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
            <Link
              href="/pmb"
              className="px-6 py-4 bg-mahad-gold hover:bg-yellow-400 text-mahad-green-dark font-bold text-center rounded-2xl shadow-xl transition transform hover:-translate-y-1"
            >
              Daftar PMB Online Sekarang
            </Link>
            <Link
              href="/pmb#syarat"
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-center rounded-2xl transition"
            >
              Lihat Brosur &amp; Persyaratan
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════
// 4. HOME SUBMISSION CTA SECTION (Kirim Tulisan)
// ══════════════════════════════════════════════════════════════
export function HomeSubmissionSection({ section }: { section: HomeSectionConfigItem }) {
  return (
    <section className="py-16 bg-emerald-950 text-white border-t border-emerald-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
        <span className="inline-block px-3 py-1 bg-mahad-gold/20 text-mahad-gold border border-mahad-gold/40 rounded-full text-xs font-bold">
          ✍️ {section.badge || "Mimbar Penulis Santri & Alumni"}
        </span>
        <h2 className="font-serif font-bold text-2xl sm:text-3xl text-white">
          {section.title || "Punya Risalah Ilmiah atau Opini Fiqh?"}
        </h2>
        <p className="text-slate-300 text-sm max-w-2xl mx-auto leading-relaxed">
          {section.subtitle ||
            "Kirimkan karya tulis Anda untuk ditinjau oleh Dewan Redaksi Ma'had Aly DDI Mangkoso. Naskah yang lolos kurasi akan dipublikasikan di Mimbar Ilmiah."}
        </p>
        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <Link
            href="/kirim-tulisan"
            className="px-6 py-3 bg-mahad-gold hover:bg-yellow-400 text-mahad-green-dark font-bold rounded-xl text-xs sm:text-sm shadow-lg transition"
          >
            Kirim Naskah Baru
          </Link>
          <Link
            href="/submission/track"
            className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl text-xs sm:text-sm transition"
          >
            Lacak Status Naskah
          </Link>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════
// 5. HOME MASYAYIKH SECTION (Dewan Dosen & Kyai)
// ══════════════════════════════════════════════════════════════
export function HomeMasyayikhSection({ section }: { section: HomeSectionConfigItem }) {
  const { lecturers } = useArticles();
  const list = (lecturers || []).slice(0, section.maxItems || 4);

  if (list.length === 0) return null;

  return (
    <section className="py-20 bg-slate-50 text-slate-900 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 border border-emerald-300 rounded-full text-emerald-900 text-xs font-bold">
            <span>👳</span>
            <span>{section.badge || "Sanad & Masyayikh"}</span>
          </div>
          <h2 className="font-serif font-bold text-2xl sm:text-4xl text-emerald-950">
            {section.title || section.label || "Dewan Masyayikh & Dosen Pengajar"}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            {section.subtitle ||
              "Dibimbing langsung oleh para masyaikh dan pakar fiqh yang bersambung sanad keilmuannya."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {list.map((lec) => (
            <div
              key={lec.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition text-center space-y-3"
            >
              <div className="w-24 h-24 mx-auto relative rounded-full overflow-hidden border-2 border-mahad-gold shadow">
                <Image
                  src={lec.photoUrl || "/image_067524.png"}
                  alt={lec.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{lec.name}</h3>
                <p className="text-[11px] text-emerald-800 font-semibold">{lec.title}</p>
                <p className="text-[10px] text-slate-500 line-clamp-2 mt-1">{lec.expertise}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/profil#masyayikh"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs rounded-full transition shadow"
          >
            <span>Lihat Profil Lengkap Seluruh Dosen</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════
// 6. HOME CUSTOM CONTENT SECTION
// ══════════════════════════════════════════════════════════════
export function HomeCustomSection({ section }: { section: HomeSectionConfigItem }) {
  return (
    <section
      className={`py-16 ${
        section.bgColor || "bg-white"
      } border-b border-slate-200 text-slate-900`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {section.imageUrl && (
            <div className="md:col-span-5 relative h-72 rounded-2xl overflow-hidden shadow-lg border border-slate-200">
              <Image
                src={section.imageUrl}
                alt={section.title || "Custom Banner"}
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className={section.imageUrl ? "md:col-span-7 space-y-4" : "col-span-12 max-w-3xl mx-auto text-center space-y-4"}>
            {section.badge && (
              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full text-xs font-bold">
                {section.badge}
              </span>
            )}
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-emerald-950">
              {section.title || section.label}
            </h2>
            {section.subtitle && (
              <p className="text-slate-600 text-sm font-medium">{section.subtitle}</p>
            )}
            {section.content && (
              <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                {section.content}
              </div>
            )}
            {section.ctaText && section.ctaUrl && (
              <div className="pt-2">
                <Link
                  href={section.ctaUrl}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs sm:text-sm shadow transition"
                >
                  <span>{section.ctaText}</span>
                  <span>→</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

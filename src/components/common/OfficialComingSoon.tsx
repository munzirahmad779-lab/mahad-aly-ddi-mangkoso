"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function OfficialComingSoon() {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.origin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#02241a] via-[#043d2e] to-[#021f17] text-white flex flex-col justify-between relative overflow-hidden select-none font-sans">
      {/* Background Islamic Pattern & Ambient Glow */}
      <div className="absolute inset-0 bg-islamic-pattern opacity-15 pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-mahad-gold/15 blur-3xl pointer-events-none" />

      {/* Top Utility Bar */}
      <header className="relative z-10 border-b border-emerald-900/60 bg-[#02241a]/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 relative shrink-0 drop-shadow-md">
            <Image
              src="/image_067524.png"
              alt="Logo Ma'had Aly DDI Mangkoso"
              width={44}
              height={44}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <div>
            <h2 className="font-serif font-bold text-sm sm:text-base text-white tracking-wide">
              MA&apos;HAD ALY DDI MANGKOSO
            </h2>
            <p className="text-[10px] sm:text-xs text-mahad-gold uppercase tracking-wider font-semibold">
              Takhassus Fiqh wa Usuluhu • Kampus Kader Ulama
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/login"
            className="text-[11px] text-emerald-300 hover:text-white bg-white/5 hover:bg-white/10 border border-emerald-800/80 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 font-medium"
          >
            <span>🔒</span>
            <span className="hidden sm:inline">Akses Redaksi</span>
          </Link>
        </div>
      </header>

      {/* Main Content Hero */}
      <main className="relative z-10 flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 flex flex-col items-center justify-center text-center">
        {/* Emblem Logo Center */}
        <div className="mb-6 relative group">
          <div className="w-24 h-24 sm:w-28 sm:h-28 relative mx-auto drop-shadow-2xl transition-transform duration-300 group-hover:scale-105">
            <Image
              src="/image_067524.png"
              alt="Logo Emblem Ma'had Aly"
              width={112}
              height={112}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-mahad-gold/20 rounded-full blur-xl -z-10 group-hover:bg-mahad-gold/30 transition-all" />
        </div>

        {/* Bismillah Calligraphy */}
        <div className="font-serif text-mahad-gold text-2xl sm:text-3xl mb-4 tracking-wide drop-shadow" dir="rtl">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-mahad-gold/15 border border-mahad-gold/40 rounded-full text-mahad-gold text-xs font-bold uppercase tracking-wider mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-mahad-gold animate-pulse" />
          <span>Tahap Finalisasi Data &amp; Khazanah Digital</span>
        </div>

        {/* Main Title */}
        <h1 className="font-serif font-bold text-2xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-snug sm:leading-tight max-w-3xl mb-4">
          Meneguhkan Khazanah Turats, Menjawab Dinamika Zaman
        </h1>

        <p className="text-emerald-200/90 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto font-normal leading-relaxed mb-8">
          Pendidikan Tinggi Kader Ulama Takhassus Fiqh wa Usuluhu — Berakar kuat pada sanad keilmuan klasik Anregurutta, progresif merespons tantangan kontemporer.
        </p>

        {/* Announcement Box */}
        <div className="w-full bg-[#032e22]/90 border border-emerald-700/60 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl text-left space-y-4 mb-8">
          <div className="flex items-center gap-2 text-mahad-gold font-bold text-xs sm:text-sm uppercase tracking-wider border-b border-emerald-800/80 pb-3">
            <span>📢</span>
            <span>Maklumat Redaksi &amp; Pengelola Portal</span>
          </div>

          <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
            <strong className="text-white">Assalamu&apos;alaikum Warahmatullahi Wabarakatuh.</strong>
            <br />
            Saat ini dewan masyaikh dan tim redaksi sedang menyempurnakan basis data kurikulum kitab turats klasik, repositori risalah ilmiah mahasantri, direktori fatwa bahtsul masail, dan sistem penerimaan mahasantri baru (PMB).
          </p>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Insya Allah, portal resmi ini akan segera diluncurkan secara penuh untuk masyarakat luas. Bagi mahasantri, alumni, dan calon pendaftar yang membutuhkan informasi resmi, silakan menghubungi narahubung sekretariat di bawah ini.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href="https://wa.me/6281242345678?text=Assalamu%27alaikum%20Sekretariat%20Mahad%20Aly%20DDI%20Mangkoso"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition"
            >
              <span>💬</span>
              <span>Hubungi WhatsApp Sekretariat</span>
            </a>

            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium text-xs px-4 py-2.5 rounded-xl border border-white/20 transition cursor-pointer"
            >
              <span>{copied ? "✓ Tersalin!" : "🔗 Bagikan Tautan"}</span>
            </button>
          </div>
        </div>

        {/* Key Educational Pillars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full text-center">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-emerald-800/50">
            <div className="font-serif font-bold text-lg sm:text-xl text-mahad-gold">M.1</div>
            <div className="text-[11px] text-emerald-200/80 uppercase tracking-wider font-semibold mt-0.5">
              Jenjang Marhalah Ula
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-emerald-800/50">
            <div className="font-serif font-bold text-lg sm:text-xl text-mahad-gold">4 Tahun</div>
            <div className="text-[11px] text-emerald-200/80 uppercase tracking-wider font-semibold mt-0.5">
              Masa Pengkaderan
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-emerald-800/50">
            <div className="font-serif font-bold text-lg sm:text-xl text-mahad-gold">Turats</div>
            <div className="text-[11px] text-emerald-200/80 uppercase tracking-wider font-semibold mt-0.5">
              Sanad Kitab Salaf
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-emerald-800/50">
            <div className="font-serif font-bold text-lg sm:text-xl text-mahad-gold">100%</div>
            <div className="text-[11px] text-emerald-200/80 uppercase tracking-wider font-semibold mt-0.5">
              Beasiswa Penuh
            </div>
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="relative z-10 border-t border-emerald-900/60 bg-[#021f17] px-4 sm:px-8 py-5 text-center text-xs text-emerald-300/70 space-y-2">
        <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-emerald-300/80">
          <span>📍 Kompleks Ponpes DDI Mangkoso, Kec. Soppeng Riaja, Kab. Barru, Sulsel 90752</span>
          <span>•</span>
          <span>✉️ redaksi@mahadaly-ddimangkoso.my.id</span>
        </p>
        <p className="text-[11px] text-emerald-400/60">
          © 2026 Ma&apos;had Aly DDI Mangkoso. Hak Cipta Dilindungi • Mewarisi Khazanah Turats, Menjaga Sanad Ulama Nusantara.
        </p>
      </footer>
    </div>
  );
}

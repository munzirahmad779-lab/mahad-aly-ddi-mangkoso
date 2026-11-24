"use client";

import Link from "next/link";

interface ComingSoonProps {
  title: string;
  badge: string;
  description: string;
  icon?: React.ReactNode;
}

export default function ComingSoon({ title, badge, description, icon }: ComingSoonProps) {
  return (
    <main className="pt-28 md:pt-40 lg:pt-60 pb-20 bg-slate-50 min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl text-center space-y-6">
        
        {/* Badge */}
        <span className="inline-block text-xs font-bold uppercase tracking-widest bg-mahad-gold text-mahad-green-dark px-4 py-1 rounded-full shadow-sm">
          {badge}
        </span>

        {/* Icon */}
        <div className="w-20 h-20 bg-emerald-50 text-emerald-800 rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner">
          {icon || (
            <svg className="w-10 h-10 text-emerald-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h1 className="font-serif font-bold text-3xl sm:text-4xl text-slate-900">{title}</h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            {description}
          </p>
        </div>

        {/* Info Ketersediaan. Dulu di sini ada formulir "Beritahu Saya"
            yang membuang alamat email tanpa menyimpannya di mana pun,
            padahal teksnya menjanjikan pemberitahuan. Formulir itu dicabut
            agar halaman ini tidak menjanjikan yang tidak terjadi. */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
            Layanan Sedang Disiapkan
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
            Halaman ini akan tersedia setelah layanan resmi dibuka. Silakan kunjungi kembali halaman ini secara berkala untuk melihat perkembangannya.
          </p>
        </div>

        {/* Back Link */}
        <div className="pt-2">
          <Link
            href="/"
            className="text-xs text-emerald-800 hover:text-emerald-950 font-bold underline"
          >
            &larr; Kembali ke Halaman Utama
          </Link>
        </div>

      </div>
    </main>
  );
}

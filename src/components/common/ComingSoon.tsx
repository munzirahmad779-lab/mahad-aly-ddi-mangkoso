"use client";

import { useState } from "react";
import Link from "next/link";

interface ComingSoonProps {
  title: string;
  badge: string;
  description: string;
  icon?: React.ReactNode;
}

export default function ComingSoon({ title, badge, description, icon }: ComingSoonProps) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <main className="pt-28 pb-20 bg-slate-50 min-h-[85vh] flex items-center justify-center p-4">
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

        {/* Notification Subscription Form */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
            Dapatkan Notifikasi Saat Layanan Ini Dibuka
          </h3>
          {subscribed ? (
            <p className="text-xs text-emerald-700 font-bold bg-emerald-50 p-3 rounded-xl border border-emerald-200">
              ✓ Terima kasih! Kami akan mengirimkan pemberitahuan ke email Anda saat layanan ini resmi diluncurkan.
            </p>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="email"
                required
                placeholder="Masukkan alamat email Anda..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-mahad-gold"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow transition"
              >
                Beritahu Saya
              </button>
            </form>
          )}
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

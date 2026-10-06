"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        setErrorMessage(
          error.message === "Invalid login credentials"
            ? "Email atau kata sandi tidak cocok. Periksa kembali akun Anda."
            : error.message
        );
        setLoading(false);
        return;
      }

      if (data?.session) {
        // Cek status role di tabel public.users
        const { data: userProfile, error: profileError } = await supabase
          .from("users")
          .select("role, is_active, nama_lengkap")
          .eq("id", data.user.id)
          .single();

        if (profileError || !userProfile?.is_active) {
          await supabase.auth.signOut();
          setErrorMessage("Akun Anda tidak aktif atau belum memiliki hak akses panel admin.");
          setLoading(false);
          return;
        }

        router.push("/admin");
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Terjadi kesalahan saat masuk. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen pt-28 pb-16 bg-slate-950 text-white flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-mahad-gold text-mahad-green-dark rounded-full flex items-center justify-center mx-auto text-3xl font-bold shadow-lg">
            🕌
          </div>
          <div>
            <h1 className="font-serif font-bold text-2xl text-white">Masuk Panel Redaksi</h1>
            <p className="text-slate-400 text-xs mt-1">
              Ma&apos;had Aly DDI Mangkoso &bull; Fiqh Mu&apos;asarah
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 bg-red-950/80 border border-red-800/80 rounded-xl text-xs text-red-200 flex items-start gap-2 animate-fadeIn">
            <span className="text-base">⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs font-medium">
          <div>
            <label className="block text-slate-300 font-bold mb-1.5">Alamat Email Resmi</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@ddimangkoso.ac.id"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-mahad-gold text-white placeholder:text-slate-600 text-sm"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-slate-300 font-bold">Kata Sandi (Password)</label>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-mahad-gold text-white placeholder:text-slate-600 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-mahad-gold hover:bg-yellow-400 text-mahad-green-dark font-bold py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="animate-spin text-lg">⏳</span>
                <span>Memverifikasi Akun...</span>
              </>
            ) : (
              <>
                <span>🔒</span>
                <span>Masuk ke Panel Kendali</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Info */}
        <div className="pt-4 border-t border-slate-800 text-center space-y-2">
          <p className="text-[11px] text-slate-500">
            Akses privat khusus Masyaikh, Dewan Dosen, dan Redaksi Resmi.
          </p>
          <Link
            href="/"
            className="inline-block text-xs text-mahad-gold hover:underline transition opacity-80 hover:opacity-100"
          >
            &larr; Kembali ke Beranda Portal Publik
          </Link>
        </div>
      </div>
    </main>
  );
}

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

  // Remember Me & Forgot Password State
  const [rememberMe, setRememberMe] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState<{ success: boolean; text: string } | null>(null);

  // Restore remembered email on mount
  useState(() => {
    if (typeof window !== "undefined") {
      const savedEmail = localStorage.getItem("mahad_remember_email");
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    }
  });

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMsg(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
        redirectTo: `${window.location.origin}/admin/login`
      });
      if (error) throw error;
      setForgotMsg({
        success: true,
        text: "Tautan reset kata sandi telah dikirim ke email Anda! Periksa kotak masuk atau spam."
      });
    } catch (err: any) {
      setForgotMsg({
        success: false,
        text: err?.message || "Gagal mengirim email reset kata sandi."
      });
    } finally {
      setForgotLoading(false);
    }
  };

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

        if (rememberMe) {
          localStorage.setItem("mahad_remember_email", email.trim());
          localStorage.setItem("mahad_session_remember", "true");
        } else {
          localStorage.removeItem("mahad_remember_email");
          localStorage.removeItem("mahad_session_remember");
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
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-[11px] text-mahad-gold hover:underline font-semibold"
              >
                Lupa Password?
              </button>
            </div>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-mahad-gold text-white placeholder:text-slate-600 text-sm"
            />
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 text-xs">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-mahad-gold focus:ring-mahad-gold"
              />
              <span>Ingat saya (Simpan sesi 7 hari)</span>
            </label>
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

        {/* Modal Lupa Password */}
        {showForgotPassword && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-serif font-bold text-base text-white">Reset Kata Sandi</h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotMsg(null);
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {forgotMsg ? (
                <div className={`p-3 rounded-xl text-xs ${
                  forgotMsg.success ? "bg-emerald-950 border border-emerald-800 text-emerald-200" : "bg-rose-950 border border-rose-800 text-rose-200"
                }`}>
                  {forgotMsg.text}
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  Masukkan alamat email resmi Anda. Kami akan mengirimkan tautan reset kata sandi ke kotak masuk email Anda.
                </p>
              )}

              <form onSubmit={handleForgotPassword} className="space-y-3">
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="nama@ddimangkoso.ac.id"
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-mahad-gold"
                />
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-2.5 bg-mahad-gold text-mahad-green-dark font-bold rounded-xl text-xs transition disabled:opacity-50"
                >
                  {forgotLoading ? "Mengirim Tautan..." : "Kirim Tautan Reset"}
                </button>
              </form>
            </div>
          </div>
        )}

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

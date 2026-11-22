"use client";

import { useCallback, useState, type FormEvent, type ReactNode } from "react";
import { supabase } from "@/lib/supabase/client";
import { ambilSesiKlien, simpanSesiLokal } from "@/lib/jurnal/sesi-klien";

// Komponen bersama panel Tahap 5: pengambilan token sesi dan formulir
// masuk staf. Mengikuti pola panel terbitan Tahap 4: sesi lokal uji
// didahulukan, sesudah itu sesi Supabase Auth; login lewat proxy
// /api/jurnal/auth/login yang menegakkan batas laju di server.

export async function ambilTokenPanel(): Promise<string | null> {
  const sesiLokal = await ambilSesiKlien();
  if (sesiLokal?.mode === "local" && sesiLokal.token) {
    return sesiLokal.token;
  }
  const {
    data: { session }
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

export function KerangkaPanel({
  judul,
  perluLogin,
  memuat,
  galat,
  pesan,
  onMuatUlang,
  children
}: {
  judul: string;
  perluLogin: boolean;
  memuat: boolean;
  galat: string | null;
  pesan: string | null;
  onMuatUlang: () => void;
  children: ReactNode;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [sibuk, setSibuk] = useState(false);

  const handleLogin = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setLoginError(null);
      setSibuk(true);
      try {
        const res = await fetch("/api/jurnal/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          setLoginError(data?.error || "Email atau kata sandi salah.");
          return;
        }
        if (data?.localSession?.token) {
          simpanSesiLokal({ token: data.localSession.token, email });
        } else if (data?.session) {
          await supabase.auth.setSession(data.session);
        }
        onMuatUlang();
      } catch {
        setLoginError("Gagal menghubungi server.");
      } finally {
        setSibuk(false);
      }
    },
    [email, password, onMuatUlang]
  );

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8">
      <h1 className="font-serif font-bold text-2xl text-mahad-green-dark">
        {judul}
      </h1>
      {pesan && (
        <p className="mt-4 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {pesan}
        </p>
      )}
      {galat && (
        <p className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900">
          {galat}
        </p>
      )}
      {memuat ? (
        <p className="mt-6 text-sm text-slate-500">Memuat…</p>
      ) : perluLogin ? (
        <form
          onSubmit={handleLogin}
          className="mt-6 max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4"
        >
          <p className="text-sm text-slate-600">
            Halaman ini memerlukan sesi staf jurnal. Masuk dengan akun
            staf yang terdaftar.
          </p>
          {loginError && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {loginError}
            </p>
          )}
          <label className="block">
            <span className="text-sm font-semibold text-slate-600">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-600">
              Kata sandi
            </span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
            />
          </label>
          <button
            type="submit"
            disabled={sibuk}
            className="bg-mahad-gold hover:bg-yellow-400 disabled:opacity-60 text-mahad-green-dark font-bold text-sm px-5 py-2.5 rounded-full shadow transition"
          >
            {sibuk ? "Memproses…" : "Masuk"}
          </button>
        </form>
      ) : (
        children
      )}
    </div>
  );
}

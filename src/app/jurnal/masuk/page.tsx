"use client";

import { useState, type FormEvent } from "react";
import { tJurnal } from "@/lib/jurnal/i18n";
import { useJurnalLocale } from "@/lib/jurnal/i18n-klien";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { simpanSesiLokal } from "@/lib/jurnal/sesi-klien";

// Halaman masuk penulis jurnal (Tahap 2). Memakai route login jurnal
// yang sudah ada (/api/jurnal/auth/login, pola proxy login situs utama):
// - Mode supabase: sesi Supabase Auth diterapkan ke klien, lalu penulis
//   diarahkan ke Naskah Saya.
// - Mode lokal: token sesi lokal disimpan, penulis diarahkan ke
//   Naskah Saya dengan label mode uji.
// Staf redaksi tetap masuk lewat halaman Panel Redaksi.

export default function MasukJurnalPage() {
  const teks = tJurnal(useJurnalLocale());
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [memproses, setMemproses] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMemproses(true);
    setGalat(null);
    try {
      const res = await fetch("/api/jurnal/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        setGalat(data?.error || "Email atau kata sandi tidak cocok.");
        return;
      }
      if (data.mode === "local" && data.localSession?.token) {
        simpanSesiLokal({
          token: data.localSession.token,
          email: data.localSession.email,
          nama: data.localSession.nama
        });
      } else if (data.session?.access_token) {
        const { error } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        });
        if (error) throw error;
      }
      router.push("/jurnal/naskah-saya");
    } catch (err) {
      setGalat(
        err instanceof Error ? err.message : "Terjadi kesalahan saat masuk."
      );
    } finally {
      setMemproses(false);
    }
  }

  const kelasInput =
    "w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:border-mahad-gold focus:ring-1 focus:ring-mahad-gold bg-white";

  return (
    <div className="max-w-xl mx-auto px-3 sm:px-6 lg:px-8">
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-800">
          {teks.masukJudul}
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          Masuk dengan akun penulis untuk mengirim naskah dan memantau
          naskah Anda. Belum punya akun?{" "}
          <Link href="/jurnal/daftar" className="text-mahad-green font-semibold underline">
            Daftar akun penulis
          </Link>{" "}
          Lupa kata sandi?{" "}
          <Link href="/jurnal/lupa-sandi" className="text-mahad-green font-semibold underline">
            Atur ulang kata sandi
          </Link>
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={kelasInput}
              placeholder="nama@contoh.ac.id"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1">
              Kata Sandi
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={kelasInput}
            />
          </div>
          {galat && (
            <p className="rounded-xl border border-red-300 bg-red-50 text-red-700 text-sm px-4 py-3">
              {galat}
            </p>
          )}
          <button
            type="submit"
            disabled={memproses}
            className="bg-mahad-gold hover:bg-yellow-400 disabled:opacity-60 text-mahad-green-dark font-bold text-sm px-6 py-3 rounded-full shadow transition"
          >
            {memproses ? "Memeriksa..." : "Masuk"}
          </button>
        </form>
      </section>
    </div>
  );
}

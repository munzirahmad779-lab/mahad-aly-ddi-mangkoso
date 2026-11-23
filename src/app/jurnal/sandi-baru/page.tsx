"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";

// Halaman atur ulang kata sandi (Tahap Penutup Celah, butir S4).
// Tiga jalur masuk:
// - mode lokal: ?token=... dari halaman lupa sandi (lingkungan uji),
// - mode supabase alur implisit: #access_token=...&refresh_token=...,
// - mode supabase alur PKCE: ?code=...
// Penyelesaian selalu lewat /api/jurnal/auth/sandi-baru di server.

export default function SandiBaruPage() {
  const [token, setToken] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [siap, setSiap] = useState(false);
  const [kataSandi, setKataSandi] = useState("");
  const [konfirmasi, setKonfirmasi] = useState("");
  const [memproses, setMemproses] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [selesai, setSelesai] = useState(false);

  useEffect(() => {
    const cari = new URLSearchParams(window.location.search);
    setToken(cari.get("token"));
    setCode(cari.get("code"));
    const hash = new URLSearchParams(
      window.location.hash.replace(/^#/, "")
    );
    setAccessToken(hash.get("access_token"));
    setRefreshToken(hash.get("refresh_token"));
    setSiap(true);
  }, []);

  const punyaKredensial = Boolean(
    token || code || (accessToken && refreshToken)
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setGalat(null);
    if (kataSandi !== konfirmasi) {
      setGalat("Konfirmasi kata sandi tidak sama.");
      return;
    }
    setMemproses(true);
    try {
      const res = await fetch("/api/jurnal/auth/sandi-baru", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token ?? undefined,
          accessToken: accessToken ?? undefined,
          refreshToken: refreshToken ?? undefined,
          code: code ?? undefined,
          kataSandiBaru: kataSandi
        })
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setGalat(data?.error || "Gagal mengganti kata sandi.");
      } else {
        setSelesai(true);
      }
    } catch {
      setGalat("Gagal menghubungi server.");
    }
    setMemproses(false);
  }

  return (
    <div className="max-w-xl mx-auto px-3 sm:px-6 lg:px-8">
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-800">
          Atur Ulang Kata Sandi
        </h1>
        {selesai ? (
          <p className="text-sm text-slate-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mt-4">
            Kata sandi berhasil diganti. Silakan{" "}
            <Link
              href="/jurnal/masuk"
              className="text-mahad-green font-semibold underline"
            >
              masuk dengan kata sandi baru
            </Link>
            .
          </p>
        ) : siap && !punyaKredensial ? (
          <p className="text-sm text-slate-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mt-4">
            Tautan pemulihan tidak ditemukan atau sudah tidak lengkap.
            Silakan{" "}
            <Link
              href="/jurnal/lupa-sandi"
              className="text-mahad-green font-semibold underline"
            >
              minta tautan reset baru
            </Link>
            .
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="sandi"
                className="block text-sm font-semibold text-slate-700 mb-1"
              >
                Kata Sandi Baru
              </label>
              <input
                id="sandi"
                type="password"
                required
                value={kataSandi}
                onChange={(e) => setKataSandi(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-mahad-green"
              />
              <p className="text-xs text-slate-400 mt-1">
                Minimal 10 karakter, mengandung huruf dan angka, maksimal
                128 karakter.
              </p>
            </div>
            <div>
              <label
                htmlFor="konfirmasi"
                className="block text-sm font-semibold text-slate-700 mb-1"
              >
                Konfirmasi Kata Sandi Baru
              </label>
              <input
                id="konfirmasi"
                type="password"
                required
                value={konfirmasi}
                onChange={(e) => setKonfirmasi(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-mahad-green"
              />
            </div>
            {galat && (
              <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {galat}
              </p>
            )}
            <button
              type="submit"
              disabled={memproses}
              className="w-full bg-mahad-green text-white font-semibold rounded-xl px-4 py-2.5 text-sm disabled:opacity-60"
            >
              {memproses ? "Menyimpan..." : "Simpan Kata Sandi Baru"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

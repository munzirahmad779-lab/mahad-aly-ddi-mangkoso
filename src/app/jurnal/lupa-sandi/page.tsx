"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

// Halaman lupa kata sandi (Tahap Penutup Celah, butir S4). Mengirim
// permintaan ke /api/jurnal/auth/lupa-sandi; jawaban selalu generik.
// Pada mode lokal (uji), token sekali pakai ditampilkan sebagai tautan
// uji karena tidak ada kotak surat pada lingkungan uji.

export default function LupaSandiPage() {
  const [email, setEmail] = useState("");
  const [memproses, setMemproses] = useState(false);
  const [pesan, setPesan] = useState<string | null>(null);
  const [tokenUji, setTokenUji] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMemproses(true);
    setPesan(null);
    setTokenUji(null);
    try {
      const res = await fetch("/api/jurnal/auth/lupa-sandi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await res.json().catch(() => null);
      setPesan(
        data?.pesan ||
          "Bila akun dengan email tersebut ada, tautan reset telah dikirim."
      );
      if (data?.tokenUji) setTokenUji(data.tokenUji as string);
    } catch {
      setPesan(
        "Bila akun dengan email tersebut ada, tautan reset telah dikirim."
      );
    }
    setMemproses(false);
  }

  return (
    <div className="max-w-xl mx-auto px-3 sm:px-6 lg:px-8">
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-800">
          Lupa Kata Sandi
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          Masukkan email akun jurnal Anda. Kami akan mengirim tautan untuk
          mengatur ulang kata sandi.
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-slate-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-mahad-green"
            />
          </div>
          <button
            type="submit"
            disabled={memproses}
            className="w-full bg-mahad-green text-white font-semibold rounded-xl px-4 py-2.5 text-sm disabled:opacity-60"
          >
            {memproses ? "Mengirim..." : "Kirim Tautan Reset"}
          </button>
        </form>
        {pesan && (
          <p className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mt-4">
            {pesan}
          </p>
        )}
        {tokenUji && (
          <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mt-3">
            Mode uji lokal:{" "}
            <Link
              href={`/jurnal/sandi-baru?token=${tokenUji}`}
              className="font-semibold underline"
            >
              buka halaman atur ulang kata sandi
            </Link>
          </p>
        )}
        <p className="text-sm text-slate-500 mt-4">
          Kembali ke{" "}
          <Link
            href="/jurnal/masuk"
            className="text-mahad-green font-semibold underline"
          >
            halaman masuk
          </Link>
        </p>
      </section>
    </div>
  );
}

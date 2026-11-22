"use client";

import { useState, type FormEvent } from "react";
import { tJurnal } from "@/lib/jurnal/i18n";
import { useJurnalLocale } from "@/lib/jurnal/i18n-klien";
import Link from "next/link";
import {
  JURNAL_CONSENT_TEKS,
  KEBIJAKAN_KATA_SANDI_LABEL,
  validasiKataSandi
} from "@/lib/jurnal/wizard";
import TurnstileJurnal from "@/components/jurnal/turnstile";

// Pendaftaran akun penulis jurnal (Tahap 2).
// Persetujuan (consent) eksplisit adalah syarat server: tanpa centang
// persetujuan, route /api/jurnal/auth/register menolak pendaftaran.
// Mode supabase: akun Supabase Auth + peran author. Mode lokal: akun uji
// lokal yang jelas berlabel mode uji.

export default function DaftarPenulisJurnalPage() {
  const teks = tJurnal(useJurnalLocale());
  const [form, setForm] = useState({
    nama: "",
    email: "",
    password: "",
    afiliasi: "",
    negara: "",
    orcid: ""
  });
  const [setuju, setSetuju] = useState(false);
  const [tokenTurnstile, setTokenTurnstile] = useState<string | null>(null);
  const [mengirim, setMengirim] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [hasil, setHasil] = useState<{ mode: string; email: string } | null>(
    null
  );

  const ubah =
    (kolom: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [kolom]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    // Kebijakan kata sandi yang sama dengan yang ditegakkan server
    // (wizard.ts), diperiksa lebih dulu di sini untuk umpan balik cepat.
    const galatSandi = validasiKataSandi(form.password);
    if (galatSandi) {
      setGalat(galatSandi);
      return;
    }
    setMengirim(true);
    setGalat(null);
    try {
      const res = await fetch("/api/jurnal/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          persetujuan: setuju,
          turnstileToken: tokenTurnstile ?? undefined
        })
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setGalat(data?.error || "Pendaftaran gagal. Coba lagi.");
      } else {
        setHasil({ mode: data.mode, email: data.email });
      }
    } catch {
      setGalat("Tidak dapat menghubungi server.");
    } finally {
      setMengirim(false);
    }
  }

  const kelasInput =
    "w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:border-mahad-gold focus:ring-1 focus:ring-mahad-gold bg-white";

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8">
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-800">
          {teks.daftarJudul}
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          Akun penulis dipakai untuk mengirim naskah lewat wizard kirim dan
          memantau naskah Anda di halaman Naskah Saya. Satu akun berlaku
          untuk seluruh pengiriman Anda.
        </p>

        {hasil ? (
          <div className="mt-6 rounded-xl border-2 border-emerald-500 bg-emerald-50 px-5 py-4">
            <p className="font-bold text-emerald-900">
              Pendaftaran berhasil untuk {hasil.email}.
            </p>
            {hasil.mode === "local" && (
              <p className="text-sm text-amber-800 mt-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2">
                Mode uji lokal: akun ini adalah akun uji yang tersimpan di
                lapisan data uji lokal situs ini, bukan akun resmi kampus.
              </p>
            )}
            <p className="text-sm text-emerald-800 mt-2">
              Selanjutnya{" "}
              <Link
                href="/jurnal/masuk"
                className="text-mahad-green font-semibold underline"
              >
                masuk dengan akun penulis
              </Link>{" "}
              untuk mulai mengirim naskah.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nama" className="block text-sm font-semibold text-slate-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  id="nama"
                  required
                  value={form.nama}
                  onChange={ubah("nama")}
                  className={kelasInput}
                  placeholder="Nama lengkap penulis"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={ubah("email")}
                  className={kelasInput}
                  placeholder="nama@contoh.ac.id"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1">
                Kata Sandi
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={10}
                value={form.password}
                onChange={ubah("password")}
                className={kelasInput}
              />
              <p className="text-xs text-slate-400 mt-1">
                {KEBIJAKAN_KATA_SANDI_LABEL}
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="afiliasi" className="block text-sm font-semibold text-slate-700 mb-1">
                  Afiliasi
                </label>
                <input
                  id="afiliasi"
                  required
                  value={form.afiliasi}
                  onChange={ubah("afiliasi")}
                  className={kelasInput}
                  placeholder="Lembaga / institusi penulis"
                />
              </div>
              <div>
                <label htmlFor="negara" className="block text-sm font-semibold text-slate-700 mb-1">
                  Negara (tidak wajib)
                </label>
                <input
                  id="negara"
                  value={form.negara}
                  onChange={ubah("negara")}
                  className={kelasInput}
                  placeholder="Indonesia"
                />
              </div>
            </div>
            <div>
              <label htmlFor="orcid" className="block text-sm font-semibold text-slate-700 mb-1">
                ORCID iD (tidak wajib)
              </label>
              <input
                id="orcid"
                value={form.orcid}
                onChange={ubah("orcid")}
                className={kelasInput}
                placeholder="0000-0000-0000-0000"
              />
            </div>

            <label
              htmlFor="persetujuan"
              className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 cursor-pointer"
            >
              <input
                id="persetujuan"
                type="checkbox"
                checked={setuju}
                onChange={(e) => setSetuju(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 accent-emerald-700"
              />
              <span className="text-sm text-slate-700">{JURNAL_CONSENT_TEKS}</span>
            </label>

            <TurnstileJurnal onToken={setTokenTurnstile} />

            {galat && (
              <p className="rounded-xl border border-red-300 bg-red-50 text-red-700 text-sm px-4 py-3">
                {galat}
              </p>
            )}

            <button
              type="submit"
              disabled={mengirim || !setuju}
              className="bg-mahad-gold hover:bg-yellow-400 disabled:opacity-60 text-mahad-green-dark font-bold text-sm px-6 py-3 rounded-full shadow transition"
            >
              {mengirim ? "Mendaftarkan..." : "Daftar Akun Penulis"}
            </button>
            <p className="text-sm text-slate-500">
              Sudah punya akun?{" "}
              <Link href="/jurnal/masuk" className="text-mahad-green font-semibold underline">
                Masuk di sini
              </Link>
            </p>
          </form>
        )}
      </section>
    </div>
  );
}

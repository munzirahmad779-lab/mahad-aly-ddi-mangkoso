"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ambilSesiKlien } from "@/lib/jurnal/sesi-klien";
import {
  JURNAL_CONSENT_TEKS,
  KEBIJAKAN_KATA_SANDI_LABEL
} from "@/lib/jurnal/wizard";

// Halaman klaim undangan reviewer (Tahap 3). Token dibaca dari URL;
// server hanya menyimpan hash token. Bila alamat undangan belum punya
// akun, halaman menampilkan formulir pendaftaran berpersetujuan dengan
// peran reviewer; bila sudah punya akun, penerima masuk dulu lalu
// mengklaim dari sesi itu.

export default function TerimaUndanganPage() {
  const [token, setToken] = useState("");
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [akunSudahAda, setAkunSudahAda] = useState(false);
  const [berhasil, setBerhasil] = useState<string | null>(null);
  const [mengirim, setMengirim] = useState(false);

  const [nama, setNama] = useState("");
  const [afiliasi, setAfiliasi] = useState("");
  const [negara, setNegara] = useState("");
  const [orcid, setOrcid] = useState("");
  const [password, setPassword] = useState("");
  const [persetujuan, setPersetujuan] = useState(false);

  const periksa = useCallback(async (tk: string) => {
    try {
      const res = await fetch(
        `/api/jurnal/auth/klaim-undangan?token=${encodeURIComponent(tk)}`
      );
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setGalat(data?.error || "Tautan undangan tidak dapat diperiksa.");
      } else {
        setEmail(data.email as string);
        setAkunSudahAda(Boolean(data.akunSudahAda));
      }
    } catch {
      setGalat("Tidak dapat menghubungi server.");
    } finally {
      setMemuat(false);
    }
  }, []);

  useEffect(() => {
    const tk =
      new URLSearchParams(window.location.search).get("token") ?? "";
    setToken(tk);
    if (!tk) {
      setGalat("Tautan undangan tidak memuat token. Minta tautan baru kepada redaksi.");
      setMemuat(false);
      return;
    }
    void periksa(tk);
  }, [periksa]);

  async function klaimAkunAda() {
    setMengirim(true);
    setGalat(null);
    try {
      const sesi = await ambilSesiKlien();
      const res = await fetch("/api/jurnal/auth/klaim-undangan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(sesi?.token
            ? { Authorization: `Bearer ${sesi.token}` }
            : {})
        },
        body: JSON.stringify({ token })
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setGalat(data?.error || "Klaim undangan gagal.");
        return;
      }
      setBerhasil(
        "Peran reviewer sudah ditambahkan ke akun Anda. Buka Dasbor Reviewer untuk melihat penugasan."
      );
    } catch {
      setGalat("Tidak dapat menghubungi server.");
    } finally {
      setMengirim(false);
    }
  }

  async function klaimDaftarBaru(e: FormEvent) {
    e.preventDefault();
    setMengirim(true);
    setGalat(null);
    try {
      const res = await fetch("/api/jurnal/auth/klaim-undangan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          nama,
          afiliasi,
          negara,
          orcid,
          password,
          persetujuan
        })
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setGalat(data?.error || "Klaim undangan gagal.");
        return;
      }
      setBerhasil(
        "Akun reviewer Anda berhasil dibuat. Silakan masuk, lalu buka Dasbor Reviewer untuk melihat penugasan."
      );
    } catch {
      setGalat("Tidak dapat menghubungi server.");
    } finally {
      setMengirim(false);
    }
  }

  const kelasInput =
    "w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-mahad-gold";

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8">
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-800">
          Undangan Reviewer
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          Redaksi mengundang Anda menjadi reviewer (mitra bestari) jurnal
          ini. Telaah berjalan double-blind: Anda tidak melihat identitas
          penulis, dan penulis tidak melihat identitas Anda.
        </p>

        {memuat ? (
          <p className="text-sm text-slate-500 mt-6">Memeriksa undangan...</p>
        ) : berhasil ? (
          <div className="mt-6 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 text-sm px-4 py-3">
            <p className="font-semibold">Undangan berhasil diklaim.</p>
            <p className="mt-1">{berhasil}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/jurnal/masuk"
                className="bg-mahad-gold hover:bg-yellow-400 text-mahad-green-dark font-bold text-sm px-6 py-2.5 rounded-full shadow transition"
              >
                Masuk
              </Link>
              <Link
                href="/jurnal/review"
                className="bg-white border border-slate-300 hover:border-mahad-gold font-bold text-sm px-6 py-2.5 rounded-full transition"
              >
                Dasbor Reviewer
              </Link>
            </div>
          </div>
        ) : (
          <>
            {galat && (
              <p className="mt-4 rounded-xl border border-red-300 bg-red-50 text-red-700 text-sm px-4 py-3">
                {galat}
              </p>
            )}
            {email && (
              <p className="text-sm text-slate-600 mt-4">
                Undangan ini ditujukan kepada <strong>{email}</strong>.
              </p>
            )}
            {email && akunSudahAda && (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-4">
                <p className="text-sm text-slate-600">
                  Alamat ini sudah memiliki akun jurnal. Masuk dengan akun
                  itu terlebih dahulu bila belum, lalu klaim undangan ini
                  dari sesi Anda.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={klaimAkunAda}
                    disabled={mengirim}
                    className="bg-mahad-gold hover:bg-yellow-400 disabled:opacity-60 text-mahad-green-dark font-bold text-sm px-6 py-2.5 rounded-full shadow transition"
                  >
                    {mengirim ? "Memproses..." : "Klaim dengan Akun Saya"}
                  </button>
                  <Link
                    href="/jurnal/masuk"
                    className="bg-white border border-slate-300 hover:border-mahad-gold font-bold text-sm px-6 py-2.5 rounded-full transition"
                  >
                    Masuk Dulu
                  </Link>
                </div>
              </div>
            )}
            {email && !akunSudahAda && (
              <form
                onSubmit={klaimDaftarBaru}
                className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-4"
              >
                <div>
                  <label htmlFor="klaim-nama" className="block text-sm font-semibold text-slate-700 mb-1">
                    Nama Lengkap
                  </label>
                  <input id="klaim-nama" required value={nama} onChange={(e) => setNama(e.target.value)} className={kelasInput} />
                </div>
                <div>
                  <label htmlFor="klaim-afiliasi" className="block text-sm font-semibold text-slate-700 mb-1">
                    Afiliasi
                  </label>
                  <input id="klaim-afiliasi" required value={afiliasi} onChange={(e) => setAfiliasi(e.target.value)} className={kelasInput} />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="klaim-negara" className="block text-sm font-semibold text-slate-700 mb-1">
                      Negara (tidak wajib)
                    </label>
                    <input id="klaim-negara" value={negara} onChange={(e) => setNegara(e.target.value)} className={kelasInput} />
                  </div>
                  <div>
                    <label htmlFor="klaim-orcid" className="block text-sm font-semibold text-slate-700 mb-1">
                      ORCID (tidak wajib)
                    </label>
                    <input id="klaim-orcid" value={orcid} onChange={(e) => setOrcid(e.target.value)} className={kelasInput} />
                  </div>
                </div>
                <div>
                  <label htmlFor="klaim-password" className="block text-sm font-semibold text-slate-700 mb-1">
                    Kata Sandi
                  </label>
                  <input id="klaim-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={kelasInput} />
                  <p className="text-xs text-slate-500 mt-1">{KEBIJAKAN_KATA_SANDI_LABEL}</p>
                </div>
                <label htmlFor="klaim-persetujuan" className="flex items-start gap-3 text-sm text-slate-600">
                  <input
                    id="klaim-persetujuan"
                    type="checkbox"
                    checked={persetujuan}
                    onChange={(e) => setPersetujuan(e.target.checked)}
                    className="mt-0.5"
                  />
                  <span>{JURNAL_CONSENT_TEKS}</span>
                </label>
                <button
                  type="submit"
                  disabled={mengirim || !persetujuan}
                  className="bg-mahad-gold hover:bg-yellow-400 disabled:opacity-60 text-mahad-green-dark font-bold text-sm px-6 py-2.5 rounded-full shadow transition"
                >
                  {mengirim ? "Memproses..." : "Buat Akun Reviewer"}
                </button>
              </form>
            )}
          </>
        )}
      </section>
    </div>
  );
}

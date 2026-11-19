"use client";

import { useState, type FormEvent } from "react";

// Halaman lacak naskah cabang jurnal VERSI UJI.
// Membaca status dari lapisan data uji yang sama dengan formulir kirim
// dan panel redaksi, lewat /api/jurnal/submissions/[kode].

interface NaskahUji {
  kode: string;
  judul: string;
  penulis: string;
  email: string;
  afiliasi: string;
  abstrak: string;
  status: string;
  riwayat: { status: string; pada: string }[];
  dibuatPada: string;
}

export default function LacakNaskahJurnalPage() {
  const [kode, setKode] = useState("");
  const [memuat, setMemuat] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [naskah, setNaskah] = useState<NaskahUji | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMemuat(true);
    setGalat(null);
    setNaskah(null);
    try {
      const res = await fetch(
        `/api/jurnal/submissions/${encodeURIComponent(kode.trim())}`
      );
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setGalat(data?.error || "Kode lacak tidak ditemukan.");
      } else {
        setNaskah(data.submission as NaskahUji);
      }
    } catch {
      setGalat("Tidak dapat menghubungi server uji.");
    } finally {
      setMemuat(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8">
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-800">
          Lacak Naskah — Versi Uji
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          Masukkan kode lacak berformat <span className="font-mono">JRN-YYYY-XXXX</span>{" "}
          yang Anda terima saat mengirim naskah uji. Status yang tampil
          berasal dari lapisan data uji situs ini.
        </p>

        <form onSubmit={onSubmit} className="mt-6 flex flex-col sm:flex-row gap-3">
          <input
            value={kode}
            onChange={(e) => setKode(e.target.value)}
            placeholder="Contoh: JRN-2026-1234"
            className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:border-mahad-gold focus:ring-1 focus:ring-mahad-gold"
            aria-label="Kode lacak naskah"
          />
          <button
            type="submit"
            disabled={memuat || !kode.trim()}
            className="bg-mahad-green-dark hover:bg-mahad-green disabled:opacity-60 text-white font-bold text-sm px-6 py-2.5 rounded-full transition"
          >
            {memuat ? "Memeriksa..." : "Lacak"}
          </button>
        </form>

        {galat && (
          <p className="mt-5 rounded-xl border border-red-300 bg-red-50 text-red-700 text-sm px-4 py-3">
            {galat}
          </p>
        )}

        {naskah && (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50/60 px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Status Terkini
            </p>
            <p className="text-lg font-bold text-mahad-green-dark mt-1">
              {naskah.status}
            </p>
            <dl className="mt-4 space-y-1.5 text-sm text-slate-700">
              <div className="flex gap-2">
                <dt className="font-semibold w-24 shrink-0">Kode</dt>
                <dd className="font-mono">{naskah.kode}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-semibold w-24 shrink-0">Judul</dt>
                <dd>{naskah.judul}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-semibold w-24 shrink-0">Penulis</dt>
                <dd>
                  {naskah.penulis} — {naskah.afiliasi}
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-semibold w-24 shrink-0">Dikirim</dt>
                <dd>{new Date(naskah.dibuatPada).toLocaleString("id-ID")}</dd>
              </div>
            </dl>
            <h2 className="text-sm font-bold text-slate-700 mt-5">
              Riwayat Status
            </h2>
            <ol className="mt-2 space-y-1.5">
              {naskah.riwayat.map((r, i) => (
                <li
                  key={i}
                  className="flex flex-wrap gap-x-3 text-sm text-slate-600"
                >
                  <span className="font-semibold text-slate-700">
                    {r.status}
                  </span>
                  <span className="text-slate-400">
                    {new Date(r.pada).toLocaleString("id-ID")}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>
    </div>
  );
}

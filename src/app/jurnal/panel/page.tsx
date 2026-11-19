"use client";

import { useCallback, useEffect, useState } from "react";

// Panel redaksi cabang jurnal VERSI UJI.
// TANPA login sungguhan — ditandai jelas di halaman. Mendaftar naskah dari
// lapisan data uji dan mengubah status lewat PATCH
// /api/jurnal/submissions/[kode]; perubahan terbaca di halaman lacak.

const PILIHAN_STATUS = [
  "Diterima Redaksi",
  "Direview",
  "Revisi",
  "Diterima",
  "Ditolak"
] as const;

interface NaskahUji {
  kode: string;
  judul: string;
  penulis: string;
  email: string;
  afiliasi: string;
  abstrak: string;
  status: string;
  dibuatPada: string;
}

export default function PanelRedaksiJurnalPage() {
  const [daftar, setDaftar] = useState<NaskahUji[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState<string | null>(null);
  const [menyimpan, setMenyimpan] = useState<string | null>(null);
  const [pesan, setPesan] = useState<string | null>(null);

  const muatDaftar = useCallback(async () => {
    try {
      const res = await fetch("/api/jurnal/submissions");
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setGalat(data?.error || "Gagal memuat daftar naskah uji.");
      } else {
        setDaftar(data.submissions as NaskahUji[]);
        setGalat(null);
      }
    } catch {
      setGalat("Tidak dapat menghubungi server uji.");
    } finally {
      setMemuat(false);
    }
  }, []);

  useEffect(() => {
    muatDaftar();
  }, [muatDaftar]);

  async function ubahStatus(kode: string, status: string) {
    setMenyimpan(kode);
    setPesan(null);
    try {
      const res = await fetch(
        `/api/jurnal/submissions/${encodeURIComponent(kode)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status })
        }
      );
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setGalat(data?.error || "Gagal mengubah status.");
      } else {
        setPesan(`Status naskah ${kode} diubah menjadi "${status}".`);
        await muatDaftar();
      }
    } catch {
      setGalat("Tidak dapat menghubungi server uji.");
    } finally {
      setMenyimpan(null);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8">
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-800">
          Panel Redaksi — Versi Uji
        </h1>
        <div className="mt-3 rounded-xl border-2 border-amber-500 bg-amber-100 px-4 py-3 text-amber-900 text-sm">
          <strong>Panel uji tanpa login.</strong> Halaman ini sengaja dibuka
          tanpa gerbang masuk hanya untuk menguji alur redaksi. Panel resmi
          kelak wajib memakai login redaksi. Semua naskah di bawah berasal
          dari lapisan data uji.
        </div>

        {pesan && (
          <p className="mt-4 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 text-sm px-4 py-3">
            {pesan}
          </p>
        )}
        {galat && (
          <p className="mt-4 rounded-xl border border-red-300 bg-red-50 text-red-700 text-sm px-4 py-3">
            {galat}
          </p>
        )}

        {memuat ? (
          <p className="text-sm text-slate-500 mt-6">Memuat daftar naskah...</p>
        ) : daftar.length === 0 ? (
          <p className="text-sm text-slate-500 mt-6">
            Belum ada naskah di lapisan data uji. Kirim satu lewat halaman{" "}
            <a href="/jurnal/kirim" className="text-mahad-green font-semibold underline">
              Kirim Naskah
            </a>{" "}
            untuk mulai menguji.
          </p>
        ) : (
          <div className="mt-6 space-y-4">
            {daftar.map((n) => (
              <article
                key={n.kode}
                className="border border-slate-200 rounded-xl p-4 sm:p-5 bg-slate-50"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-bold text-slate-500">
                      {n.kode}
                    </p>
                    <h2 className="font-serif font-bold text-base sm:text-lg text-slate-800 leading-snug mt-1">
                      {n.judul}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      {n.penulis} ({n.email}) — {n.afiliasi}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Dikirim {new Date(n.dibuatPada).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <span className="text-xs font-bold bg-mahad-gold-light text-mahad-green-dark px-3 py-1 rounded-full shrink-0">
                    {n.status}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-3 line-clamp-3">
                  {n.abstrak}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <label
                    htmlFor={`status-${n.kode}`}
                    className="text-xs font-semibold text-slate-500"
                  >
                    Ubah status:
                  </label>
                  <select
                    id={`status-${n.kode}`}
                    value={n.status}
                    disabled={menyimpan === n.kode}
                    onChange={(e) => ubahStatus(n.kode, e.target.value)}
                    className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:border-mahad-gold"
                  >
                    {PILIHAN_STATUS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {menyimpan === n.kode && (
                    <span className="text-xs text-slate-400">Menyimpan...</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

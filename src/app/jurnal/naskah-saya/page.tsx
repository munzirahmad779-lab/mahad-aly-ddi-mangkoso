"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ambilSesiKlien,
  hapusSesiLokal,
  type SesiKlienJurnal
} from "@/lib/jurnal/sesi-klien";
import { supabase } from "@/lib/supabase/client";
import type { JurnalSubmissionView } from "@/lib/jurnal/status";

// Halaman "Naskah Saya" (Tahap 2): daftar naskah milik penulis yang
// masuk, beserta status berkosakata OJS dan linimasanya. Data datang
// dari /api/jurnal/naskah-saya yang menyaring menurut pemilik sesi di
// server; penulis tidak pernah menerima naskah orang lain.

export default function NaskahSayaPage() {
  const [sesi, setSesi] = useState<SesiKlienJurnal | null>(null);
  const [memuat, setMemuat] = useState(true);
  const [daftar, setDaftar] = useState<JurnalSubmissionView[]>([]);
  const [galat, setGalat] = useState<string | null>(null);

  const muat = useCallback(async () => {
    const s = await ambilSesiKlien();
    setSesi(s);
    if (!s) {
      setMemuat(false);
      return;
    }
    try {
      const res = await fetch("/api/jurnal/naskah-saya", {
        headers: { Authorization: `Bearer ${s.token}` }
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setGalat(data?.error || "Gagal memuat naskah Anda.");
      } else {
        setDaftar(data.submissions as JurnalSubmissionView[]);
      }
    } catch {
      setGalat("Tidak dapat menghubungi server.");
    } finally {
      setMemuat(false);
    }
  }, []);

  useEffect(() => {
    void muat();
  }, [muat]);

  async function keluar() {
    hapusSesiLokal();
    await supabase.auth.signOut().catch(() => {});
    setSesi(null);
    setDaftar([]);
  }

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8">
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-800">
            Naskah Saya
          </h1>
          {sesi && (
            <button
              onClick={keluar}
              className="text-xs font-bold bg-white border border-slate-300 hover:border-mahad-gold rounded-full px-4 py-1.5 transition"
            >
              Keluar
            </button>
          )}
        </div>

        {memuat ? (
          <p className="text-sm text-slate-500 mt-6">Memuat naskah Anda...</p>
        ) : !sesi ? (
          <div className="mt-4">
            <p className="text-sm text-slate-600">
              Halaman ini memerlukan akun penulis. Silakan masuk untuk
              melihat naskah Anda.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/jurnal/masuk"
                className="bg-mahad-gold hover:bg-yellow-400 text-mahad-green-dark font-bold text-sm px-6 py-2.5 rounded-full shadow transition"
              >
                Masuk Penulis
              </Link>
              <Link
                href="/jurnal/daftar"
                className="bg-white border border-slate-300 hover:border-mahad-gold font-bold text-sm px-6 py-2.5 rounded-full transition"
              >
                Daftar Akun Penulis
              </Link>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-600 mt-2">
              Masuk sebagai <strong>{sesi.email}</strong>
              {sesi.mode === "local" && (
                <span className="text-amber-700"> (akun uji lokal)</span>
              )}
              . Daftar di bawah hanya memuat naskah milik akun ini.
            </p>
            {galat && (
              <p className="mt-4 rounded-xl border border-red-300 bg-red-50 text-red-700 text-sm px-4 py-3">
                {galat}
              </p>
            )}
            {daftar.length === 0 && !galat ? (
              <p className="text-sm text-slate-500 mt-6">
                Anda belum memiliki naskah. Kirim naskah pertama lewat{" "}
                <Link
                  href="/jurnal/kirim"
                  className="text-mahad-green font-semibold underline"
                >
                  wizard kirim naskah
                </Link>
                .
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
                          {n.penulis}
                          {n.bagianLabel ? ` — ${n.bagianLabel}` : ""}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Dikirim{" "}
                          {new Date(n.dibuatPada).toLocaleString("id-ID")}
                        </p>
                      </div>
                      <span className="text-xs font-bold bg-mahad-gold-light text-mahad-green-dark px-3 py-1 rounded-full shrink-0">
                        {n.statusLabel}
                      </span>
                    </div>
                    {n.berkas && n.berkas.length > 0 && (
                      <p className="text-xs text-slate-500 mt-3">
                        Berkas tercatat:{" "}
                        {n.berkas
                          .map(
                            (b) =>
                              `${b.kategori === "utama" ? "utama" : "pendukung"}: ${b.namaAsli}`
                          )
                          .join("; ")}
                      </p>
                    )}
                    {n.riwayat.length > 0 && (
                      <ol className="mt-4 space-y-2 border-l-2 border-slate-200 pl-4">
                        {n.riwayat.map((r, i) => (
                          <li key={i} className="text-sm">
                            <span className="font-semibold text-slate-700">
                              {r.label}
                            </span>{" "}
                            <span className="text-slate-400 text-xs">
                              {new Date(r.pada).toLocaleString("id-ID")}
                            </span>
                            {r.catatan && (
                              <span className="block text-slate-500">
                                {r.catatan}
                              </span>
                            )}
                          </li>
                        ))}
                      </ol>
                    )}
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

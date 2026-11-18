"use client";

import { useState } from "react";
import Link from "next/link";
import dataKalam from "@/lib/kalam-hikmah.json";

// Hub Kalam Hikmah di Mimbar Mahad (ketetapan user 19 Nov 2026):
// tombol khusus "Kalam Hikmah" membuka daftar nama masyayikh, dan
// nama yang diketuk membuka kumpulan kalam hikmah beliau tepat di
// bawah namanya, tanpa berpindah laman. Isi kalam sama persis dengan
// artikel "Mutiara Hikmah Para Masyayikh DDI Mangkoso"; data di
// src/lib/kalam-hikmah.json disusun dari berkas susunan terbit artikel
// itu dan terverifikasi baris demi baris (5 masyayikh, 21 kalam).

interface BarisKalam {
  teks: string;
  subjudul?: boolean;
  arab?: boolean;
}

interface Kalam {
  judul: string | null;
  baris: BarisKalam[];
}

interface KumpulanMasyayikh {
  nama: string;
  kalam: Kalam[];
}

const MASYAYIKH = dataKalam.masyayikh as KumpulanMasyayikh[];
const TOTAL_KALAM = MASYAYIKH.reduce((n, m) => n + m.kalam.length, 0);

export default function KalamHikmahHub() {
  const [terbuka, setTerbuka] = useState<string | null>(
    MASYAYIKH[0]?.nama ?? null
  );

  return (
    <div className="space-y-4">
      <div className="bg-emerald-900 text-white rounded-2xl px-6 py-5 shadow-sm bg-islamic-pattern">
        <p className="text-sm sm:text-base text-emerald-50 leading-relaxed">
          {MASYAYIKH.length} kumpulan kalam hikmah dari {MASYAYIKH.length}{" "}
          masyayikh pengajian, seluruhnya {TOTAL_KALAM} kalam. Ketuk nama
          masyayikh untuk membuka kumpulan kalam beliau.
        </p>
        <Link
          href={dataKalam.tautanArtikel}
          className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-mahad-gold hover:text-yellow-300 underline"
        >
          <span>Baca versi artikel lengkap: Mutiara Hikmah Para Masyayikh</span>
          <span>&rarr;</span>
        </Link>
      </div>

      {MASYAYIKH.map((m) => {
        const buka = terbuka === m.nama;
        return (
          <div
            key={m.nama}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setTerbuka(buka ? null : m.nama)}
              aria-expanded={buka}
              className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-slate-50 transition"
            >
              <span>
                <span className="block font-serif font-bold text-xl sm:text-2xl text-emerald-950">
                  {m.nama}
                </span>
                <span className="block text-xs font-bold text-slate-500 mt-1">
                  {m.kalam.length} kalam hikmah
                </span>
              </span>
              <span
                className={`shrink-0 w-9 h-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center transition-transform ${
                  buka ? "rotate-180" : ""
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </span>
            </button>

            {buka && (
              <div className="px-6 pb-6 pt-1 border-t border-slate-100 space-y-8">
                {m.kalam.map((k, i) => (
                  <article key={i} className="space-y-3">
                    {k.judul && (
                      <h3 className="font-serif font-bold text-lg text-emerald-900 border-l-4 border-amber-500 pl-3 leading-snug">
                        {k.judul}
                      </h3>
                    )}
                    {k.baris.map((b, j) =>
                      b.subjudul ? (
                        <p
                          key={j}
                          className="font-serif font-bold text-emerald-900 pt-1"
                        >
                          {b.teks}
                        </p>
                      ) : b.arab ? (
                        <p
                          key={j}
                          dir="rtl"
                          className="teks-arab text-right text-lg leading-loose text-slate-800"
                        >
                          {b.teks}
                        </p>
                      ) : (
                        <p
                          key={j}
                          dir="auto"
                          className="text-sm sm:text-base text-slate-700 leading-relaxed"
                        >
                          {b.teks}
                        </p>
                      )
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

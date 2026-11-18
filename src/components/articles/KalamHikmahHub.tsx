"use client";

import { useState } from "react";
import Link from "next/link";
import dataKalam from "@/lib/kalam-hikmah.json";

// Hub Kalam Hikmah di Mimbar Mahad (ketetapan user 19 Nov 2026):
// tombol khusus "Kalam Hikmah" membuka hub kumpulan kalam hikmah
// para masyayikh. Tampilannya model tab (pilihan user 19 Nov 2026
// pukul 02:03, menggantikan model lipatan): nama-nama masyayikh
// berjajar sebagai tab, dan panel di bawahnya berganti ke kumpulan
// kalam masyayikh yang tabnya diketuk. Isi kalam sama persis dengan
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
  const [tabAktif, setTabAktif] = useState<string>(MASYAYIKH[0]?.nama ?? "");
  const kumpulan =
    MASYAYIKH.find((m) => m.nama === tabAktif) ?? MASYAYIKH[0];

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

      {/* Tab nama masyayikh */}
      <div className="flex flex-wrap gap-2">
        {MASYAYIKH.map((m) => {
          const aktif = m.nama === kumpulan.nama;
          return (
            <button
              key={m.nama}
              type="button"
              onClick={() => setTabAktif(m.nama)}
              aria-pressed={aktif}
              className={`px-4 sm:px-5 py-2.5 rounded-full text-sm font-bold transition flex items-center gap-2 border-2 ${
                aktif
                  ? "bg-emerald-900 border-emerald-900 text-white shadow"
                  : "bg-white border-emerald-900/70 text-emerald-900 hover:bg-emerald-50"
              }`}
            >
              <span>{m.nama}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full ${
                  aktif
                    ? "bg-mahad-gold text-emerald-950"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {m.kalam.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Panel kumpulan kalam masyayikh yang tabnya aktif */}
      {kumpulan && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-6 sm:px-7 py-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">
            Kumpulan Kalam Hikmah
          </p>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-emerald-950 mt-1.5">
            {kumpulan.nama}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {kumpulan.kalam.length} kalam hikmah
          </p>

          <div className="mt-2">
            {kumpulan.kalam.map((k, i) => (
              <article key={i} className="mt-7 space-y-3">
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
        </div>
      )}
    </div>
  );
}

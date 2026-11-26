"use client";

import { useEffect, useRef, useState } from "react";
import Reveal from "@/components/common/Reveal";

// Bagian Kalam Anregurutta di beranda (pemasangan kalam hikmah,
// perintah user 18-19 Nov 2026): foto Anregurutta Mangkoso (Gurutta
// Farid; keterangan foto memakai nama lengkap bergelar pilihan user
// 19 Nov 2026: Prof. Dr. KH. Muhammad Faried Wadjedy, Lc., M.A.)
// di samping kalam beliau. Yang tampil
// hanya kalam Anregurutta, tiap kalam wajib menyertakan nama beliau.
// Tombol "Baca Mutiara Hikmah Para Masyayikh" yang dulu tertaut ke
// artikel himpunan kalam para masyayikh sudah dibuang 26 Nov 2026
// mengikuti penghapusan artikel itu atas perintah user (user sudah
// memerintahkannya sejak 21 Nov 2026 dan mengulanginya 26 Nov);
// bagian ini kini berdiri sendiri tanpa tautan ke artikel mana pun.
// Pergantian kalam tiap 1 menit
// (perintah user 19 Nov 2026 pukul 01:26, menggantikan tiap beberapa
// detik lalu tiap 3 jam): pergantiannya hanya menukar teks di
// peramban pengunjung, tanpa memanggil server sama sekali, jadi
// ringan dan tidak membebani laman. Sejak 26 Nov 2026 pukul 07:58
// (perintah user) putarannya WAJIB berubah terus dan bisa digeser:
// pilihan manual lewat titik atau geseran tidak lagi menghentikan
// putaran tetap seperti versi awal, ia hanya memindahkan kalam dan
// penghitung 1 menit mulai lagi dari awal.
const KALAM_ANREGURUTTA: string[] = [
  "Orang yang tidak melaksanakan sholat adalah orang yang mengkhianati Tuhan, jika Tuhan saja yang ia khianati apalagi sesamanya manusia",
  "Puncak bahagia adalah ketika kita membahagiakan orang yang kita cintai",
  "Keberhasilan itu harus diperjuangkan melalui keteguhan hati dan melalui kesabaran.",
  "Siapa yang rajin mengejar maka dia yang dapat lebih banyak.",
  "Jika ushul sudah melekat dihati maka fiqih akan menjelma di lisan",
];

const JEDA_PUTAR_MS = 60_000;

export default function KalamSection() {
  const [aktif, setAktif] = useState(0);
  const geserAwalX = useRef<number | null>(null);
  const geserSudahPindah = useRef(false);

  const pindahKalam = (i: number) => {
    const n = KALAM_ANREGURUTTA.length;
    setAktif(((i % n) + n) % n);
  };

  // Berganti sendiri tiap 1 menit, terus berputar tanpa henti.
  // Penghitung waktu bergantung pada kalam aktif, jadi setiap
  // perpindahan (otomatis, titik, atau geseran) memulai lagi
  // hitungan 1 menit penuh untuk kalam yang baru tampil.
  useEffect(() => {
    const timer = setTimeout(() => {
      setAktif((i) => (i + 1) % KALAM_ANREGURUTTA.length);
    }, JEDA_PUTAR_MS);
    return () => clearTimeout(timer);
  }, [aktif]);

  // Geseran memakai Pointer Events (satu jalur untuk sentuh,
  // tetikus, dan pena) dan berpindah begitu jarak geser melewati
  // ambang selama gerakan, bukan menunggu lepas: cara pertama yang
  // menunggu lepas tetikus terbukti gagal pada uji hidup 26 Nov
  // 2026 pukul 08:22, seretannya tidak mengubah kalam sama sekali.
  // Penangkapan penunjuk (pointer capture) menjaga gerakan tetap
  // terbaca walau penunjuk menyimpang keluar wilayah teks di tengah
  // seretan, dan pelepasan tetikus mengecek ulang jarak terakhir:
  // pada uji ulang 08:28 arah maju lolos tetapi arah mundur gagal,
  // diduga karena penunjuk sempat keluar wilayah dan membatalkan
  // awal geseran.
  const mulaiGeser = (x: number) => {
    geserAwalX.current = x;
    geserSudahPindah.current = false;
  };
  const selamaGeser = (x: number) => {
    if (geserAwalX.current === null || geserSudahPindah.current) return;
    const selisih = x - geserAwalX.current;
    if (Math.abs(selisih) < 30) return;
    geserSudahPindah.current = true;
    pindahKalam(aktif + (selisih < 0 ? 1 : -1));
  };
  const akhiriGeser = (x?: number) => {
    if (
      typeof x === "number" &&
      geserAwalX.current !== null &&
      !geserSudahPindah.current
    ) {
      const selisih = x - geserAwalX.current;
      if (Math.abs(selisih) >= 30) {
        pindahKalam(aktif + (selisih < 0 ? 1 : -1));
      }
    }
    geserAwalX.current = null;
  };

  return (
    <section className="relative py-16 sm:py-20 bg-mahad-green-dark text-white overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-islamic-pattern pointer-events-none" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-14">
            {/* Foto Anregurutta */}
            <div className="shrink-0 text-center">
              <div className="relative w-52 h-52 sm:w-64 sm:h-64 rounded-3xl overflow-hidden border-4 border-mahad-gold/50 shadow-2xl mx-auto">
                <img
                  src="/gurutta-farid.jpg"
                  alt="Anregurutta Mangkoso, Prof. Dr. KH. Muhammad Faried Wadjedy, Lc., M.A."
                  className="w-full h-full object-cover object-top"
                  loading="lazy"
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-black/20 rounded-3xl pointer-events-none" />
              </div>
              <p className="mt-4 font-bold text-mahad-gold tracking-wide">
                Anregurutta Mangkoso
              </p>
              <p className="text-xs sm:text-sm text-white/70 font-medium">
                Prof. Dr. KH. Muhammad Faried Wadjedy, Lc., M.A.
                <br />
                Pimpinan Pondok Pesantren DDI Mangkoso
              </p>
            </div>

            {/* Putaran kalam */}
            <div className="flex-1 text-center md:text-left">
              <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] bg-mahad-gold text-mahad-green-dark px-3.5 py-1.5 rounded-full shadow">
                Kalam Anregurutta
              </span>

              <div
                className="mt-6 min-h-32 sm:min-h-36 flex items-center justify-center md:justify-start cursor-grab active:cursor-grabbing select-none touch-pan-y"
                onPointerDown={(e) => {
                  try {
                    e.currentTarget.setPointerCapture(e.pointerId);
                  } catch {
                    // Penangkapan gagal tidak menghalangi geseran biasa.
                  }
                  mulaiGeser(e.clientX);
                }}
                onPointerMove={(e) => selamaGeser(e.clientX)}
                onPointerUp={(e) => akhiriGeser(e.clientX)}
                onPointerCancel={() => akhiriGeser()}
              >
                <blockquote
                  key={aktif}
                  className="animate-kalam-masuk font-serif italic font-bold text-xl sm:text-2xl lg:text-[2rem] leading-snug text-white"
                >
                  &ldquo;{KALAM_ANREGURUTTA[aktif]}&rdquo;
                </blockquote>
              </div>

              <div className="mt-4 flex items-center justify-center md:justify-start gap-3">
                <span className="h-0.5 w-8 bg-mahad-gold/70 rounded-full"></span>
                <p className="font-bold text-sm tracking-wider uppercase text-mahad-gold">
                  Anregurutta Mangkoso
                </p>
              </div>

              {/* Penunjuk kalam: bisa diketuk untuk berpindah kalam */}
              <div className="mt-6 flex items-center justify-center md:justify-start gap-2">
                {KALAM_ANREGURUTTA.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Kalam ke-${i + 1}`}
                    onClick={() => pindahKalam(i)}
                    className={`h-2.5 rounded-full transition-all ${
                      i === aktif
                        ? "w-8 bg-mahad-gold"
                        : "w-2.5 bg-white/30 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

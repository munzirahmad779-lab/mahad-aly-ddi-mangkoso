"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Reveal from "@/components/common/Reveal";

// Bagian Kalam Anregurutta di beranda (pemasangan kalam hikmah,
// perintah user 18-19 Nov 2026): foto Anregurutta Mangkoso (Gurutta
// Farid; keterangan foto memakai nama lengkap bergelar pilihan user
// 19 Nov 2026: Prof. Dr. KH. Muhammad Faried Wadjedy, Lc., M.A.)
// di samping kalam beliau. Yang tampil
// hanya kalam Anregurutta, tiap kalam wajib menyertakan nama beliau,
// dan semuanya tertaut ke artikel Mutiara Hikmah Para Masyayikh. Isi
// kalam sama dengan yang berjalan di ticker navbar (kalam pendek
// pilihan dari artikel yang sama). Pergantian kalam tiap 1 menit
// (perintah user 19 Nov 2026 pukul 01:26, menggantikan tiap beberapa
// detik lalu tiap 3 jam): pergantiannya hanya menukar teks di
// peramban pengunjung, tanpa memanggil server sama sekali, jadi
// ringan dan tidak membebani laman.
const KALAM_ANREGURUTTA: string[] = [
  "Orang yang tidak melaksanakan sholat adalah orang yang mengkhianati Tuhan, jika Tuhan saja yang ia khianati apalagi sesamanya manusia",
  "Puncak bahagia adalah ketika kita membahagiakan orang yang kita cintai",
  "Keberhasilan itu harus diperjuangkan melalui keteguhan hati dan melalui kesabaran.",
  "Siapa yang rajin mengejar maka dia yang dapat lebih banyak.",
  "Jika ushul sudah melekat dihati maka fiqih akan menjelma di lisan",
];

const TAUTAN_ARTIKEL = "/artikel/mutiara-hikmah-para-masyayikh-ddi-mangkoso";
const JEDA_PUTAR_MS = 60_000;

export default function KalamSection() {
  const [aktif, setAktif] = useState(0);
  const dipilihManual = useRef(false);

  // Berganti sendiri tiap 1 menit. Pilihan manual lewat titik
  // penunjuk dihormati: sesudah pengunjung memilih, putaran berhenti
  // selama kunjungan itu.
  useEffect(() => {
    const timer = setInterval(() => {
      if (!dipilihManual.current) {
        setAktif((i) => (i + 1) % KALAM_ANREGURUTTA.length);
      }
    }, JEDA_PUTAR_MS);
    return () => clearInterval(timer);
  }, []);

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

              <div className="mt-6 min-h-32 sm:min-h-36 flex items-center justify-center md:justify-start">
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
                    onClick={() => {
                      dipilihManual.current = true;
                      setAktif(i);
                    }}
                    className={`h-2.5 rounded-full transition-all ${
                      i === aktif
                        ? "w-8 bg-mahad-gold"
                        : "w-2.5 bg-white/30 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>

              <div className="mt-8">
                <Link
                  href={TAUTAN_ARTIKEL}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-mahad-gold text-mahad-green-dark font-bold text-xs rounded-full shadow hover:bg-yellow-400 transition"
                >
                  Baca Mutiara Hikmah Para Masyayikh
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

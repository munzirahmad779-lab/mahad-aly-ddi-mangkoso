"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// Lencana jumlah pembaca untuk publik. Angkanya diambil dari catatan
// kunjungan server (GET /api/analytics/stats, peta pages[pathname]) yang
// ditulis pelacak trafik global setiap kali halaman publik dibuka.
//
// ATURAN KESESUAIAN (ketetapan user 8 Nov 2026): angka di dalam tulisan
// HARUS sama dengan angka di kartu tulisannya pada tampilan awal. Karena
// itu lencana ini membaca potret data yang SAMA dengan kartu, lewat
// muatPetaKunjungan() yang dimuat sekali per sesi halaman: kartu yang
// menampilkan 5 akan membuka tulisan yang juga menampilkan 5 pada
// kunjungan yang sama. Kunjungan yang sedang berjalan ikut terhitung
// mulai pemuatan halaman berikutnya. Versi lama menunggu 900ms agar
// klik sendiri ikut terhitung, dan justru membuat angka di dalam selalu
// lebih besar satu daripada di kartu.
// Angka ditampilkan diam sebagai angka akhir, tanpa animasi hitung naik
// (aturan tetap web kampus).
export default function ViewCount({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    muatPetaKunjungan().then((pages) => {
      if (!alive) return;
      setCount(typeof pages[pathname] === "number" ? pages[pathname] : 0);
    });
    return () => {
      alive = false;
    };
  }, [pathname]);

  if (count === null) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 bg-white/10 text-emerald-200 text-xs px-3 py-0.5 rounded-full ${className}`}
    >
      <svg
        className="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"
        />
        <circle cx="12" cy="12" r="3" />
      </svg>
      Dilihat {count.toLocaleString("id-ID")} kali
    </span>
  );
}

// ── Jumlah dilihat untuk KARTU (artikel dan warta) ────────────────────
// Perintah user 8 Nov 2026: setiap tampilan awal tulisan (kartu di daftar
// artikel dan beranda, sebelum diklik) ikut menampilkan sudah berapa kali
// dilihat. Perintah user 10 Nov 2026: kartu warta memakai tampilan yang
// sama, membaca peta yang sama untuk jalurnya sendiri (basePath "/berita").
// Satu ambilan stats dipakai bersama oleh semua kartu di halaman
// (janji dimuat sekali di tingkat modul), membaca peta pages yang sama
// dengan lencana halaman detail. Angka selalu tampil di setiap kartu
// begitu data termuat, termasuk 0 untuk tulisan yang belum tercatat
// dibuka pada penghitung berjalan (ketetapan user 8 Nov 2026: masing
// masing tulisan harus ada angkanya di tampilan awal).
let petaKunjungan: Promise<Record<string, number>> | null = null;

function muatPetaKunjungan(): Promise<Record<string, number>> {
  if (!petaKunjungan) {
    petaKunjungan = fetch("/api/analytics/stats", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) =>
        d && d.stats && d.stats.pages && typeof d.stats.pages === "object"
          ? (d.stats.pages as Record<string, number>)
          : {}
      )
      .catch(() => ({}));
  }
  return petaKunjungan;
}

export function CardViewCount({ slug, basePath = "/artikel" }: { slug: string; basePath?: string }) {
  const [jumlah, setJumlah] = useState<number | null>(null);

  useEffect(() => {
    let hidup = true;
    muatPetaKunjungan().then((pages) => {
      if (!hidup) return;
      const n = pages[`${basePath}/${slug}`];
      setJumlah(typeof n === "number" ? n : 0);
    });
    return () => {
      hidup = false;
    };
  }, [slug, basePath]);

  if (jumlah === null) return null;

  return (
    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
      <span>Dilihat {jumlah.toLocaleString("id-ID")} kali</span>
    </p>
  );
}

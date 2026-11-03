"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// Lencana jumlah pembaca untuk publik. Angkanya diambil dari catatan
// kunjungan server (GET /api/analytics/stats, peta pages[pathname]) yang
// ditulis pelacak trafik global setiap kali halaman publik dibuka, jadi
// angka yang dilihat pengunjung sama dengan yang tercatat di server.
// Angka ditampilkan diam sebagai angka akhir, tanpa animasi hitung naik
// (aturan tetap web kampus).
export default function ViewCount({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    // Jeda singkat agar hit kunjungan halaman ini sendiri, yang dikirim
    // pelacak global lewat sendBeacon, sempat tercatat sebelum dibaca.
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/analytics/stats", { cache: "no-store" });
        const data = await res.json();
        if (!alive) return;
        const pages = data?.stats?.pages || {};
        setCount(typeof pages[pathname] === "number" ? pages[pathname] : 0);
      } catch {
        if (alive) setCount(null);
      }
    }, 900);
    return () => {
      alive = false;
      clearTimeout(timer);
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

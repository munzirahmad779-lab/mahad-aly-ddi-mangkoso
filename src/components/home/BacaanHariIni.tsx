"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import Reveal from "@/components/common/Reveal";

// Panel rekap bacaan harian di beranda. Datanya potret
// 'daily_read_counts' di site_content, ditulis otomatis oleh web
// sendiri tiap tengah malam (rute internal rekap malam): berapa kali
// tiap artikel dibaca pada hari yang baru berakhir beserta totalnya.
// Panel tidak tampil bila potret belum ada, masih baseline (jalan
// pertama, belum ada pembanding), atau tidak ada artikel yang dibaca
// pada hari itu. Angka ditampilkan diam sebagai angka akhir, tanpa
// animasi hitung naik (aturan tetap web kampus).

interface ItemBacaan {
  slug: string;
  judul: string;
  hariIni: number;
  total: number;
}

interface PotretBacaan {
  date: string;
  tanggalLabel: string;
  baseline?: boolean;
  items: ItemBacaan[];
}

export default function BacaanHariIni() {
  const [potret, setPotret] = useState<PotretBacaan | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await supabase
          .from("site_content")
          .select("value")
          .eq("key", "daily_read_counts")
          .maybeSingle();
        if (!alive) return;
        const nilai = data?.value as PotretBacaan | null | undefined;
        if (nilai && Array.isArray(nilai.items)) {
          setPotret(nilai);
        }
      } catch {
        // Potret belum tersedia: panel diam tidak tampil.
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (!potret || potret.baseline) return null;

  const terbaca = potret.items.filter((it) => it.hariIni > 0).slice(0, 10);
  if (terbaca.length === 0) return null;

  return (
    <section className="py-24 bg-white border-t border-emerald-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-200/80 px-3 py-1 rounded-full">
              Rekap Bacaan
            </span>
            <h2 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-emerald-950 mt-3">
              Bacaan {potret.tanggalLabel}
            </h2>
            <div className="h-1.5 w-20 bg-mahad-gold mt-4 mb-2 rounded-full"></div>
            <p className="text-slate-600 text-sm sm:text-base">
              Diperbarui otomatis setiap tengah malam pukul 00.00 WITA
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-8 bg-emerald-50/60 rounded-2xl border border-emerald-100 shadow-sm p-5 sm:p-6">
            <ol className="grid gap-2.5 sm:grid-cols-2">
              {terbaca.map((item, idx) => (
                <li
                  key={item.slug}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white border border-emerald-100/70"
                >
                  <span
                    className={`font-serif font-bold text-xl leading-none ${
                      idx === 0 ? "text-mahad-gold" : "text-slate-300"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <Link
                    href={`/artikel/${item.slug}`}
                    className="flex-1 min-w-0 text-xs font-bold text-slate-800 hover:text-emerald-900 leading-snug line-clamp-2 transition"
                  >
                    {item.judul}
                  </Link>
                  <span className="text-[11px] text-slate-500 whitespace-nowrap">
                    {item.hariIni.toLocaleString("id-ID")} kali dibaca · total{" "}
                    {item.total.toLocaleString("id-ID")}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

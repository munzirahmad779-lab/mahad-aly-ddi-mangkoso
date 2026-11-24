"use client";

// Pemilih bahasa antarmuka jurnal (Tahap 6). Pilihan disimpan persisten
// di cookie "jurnal-bahasa" (satu tahun, path /jurnal) dan localStorage,
// lalu halaman dimuat ulang supaya server merender kerangka dalam bahasa
// dan arah tulis (RTL untuk Arab) yang benar sejak awal.

import { useEffect, useState } from "react";
import {
  isJurnalLocale,
  JURNAL_LOCALE_COOKIE,
  JURNAL_LOCALE_LABEL,
  JURNAL_LOCALE_STORAGE,
  JURNAL_LOCALES,
  tJurnal,
  type JurnalLocale
} from "@/lib/jurnal/i18n";

export default function PemilihBahasa({ gelap = false }: { gelap?: boolean }) {
  const [locale, setLocale] = useState<JurnalLocale>("ar");

  useEffect(() => {
    const dariCookie = document.cookie
      .split(";")
      .map((s) => s.trim())
      .find((s) => s.startsWith(`${JURNAL_LOCALE_COOKIE}=`))
      ?.split("=")[1];
    const dariStorage = window.localStorage.getItem(JURNAL_LOCALE_STORAGE);
    const aktif = isJurnalLocale(dariCookie)
      ? dariCookie
      : isJurnalLocale(dariStorage)
        ? dariStorage
        : "ar";
    setLocale(aktif);
  }, []);

  function ganti(l: JurnalLocale) {
    setLocale(l);
    document.cookie = `${JURNAL_LOCALE_COOKIE}=${l}; path=/jurnal; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    try {
      window.localStorage.setItem(JURNAL_LOCALE_STORAGE, l);
    } catch {
      // localStorage tidak tersedia; cookie tetap menjadi sumber server.
    }
    window.location.reload();
  }

  const t = tJurnal(locale);
  return (
    <div className="flex items-center gap-2" data-testid="pemilih-bahasa">
      <label
        htmlFor="jurnal-pilih-bahasa"
        className={`text-xs font-semibold ${gelap ? "text-white/85" : "text-slate-600"}`}
      >
        {t.pilihBahasa}
      </label>
      <select
        id="jurnal-pilih-bahasa"
        value={locale}
        onChange={(e) => ganti(e.target.value as JurnalLocale)}
        className={`text-xs sm:text-sm font-semibold rounded-md border px-2.5 py-1.5 ${
          gelap
            ? "border-white/25 bg-jurnal-hijau text-white"
            : "border-slate-300 bg-white text-slate-700"
        }`}
      >
        {JURNAL_LOCALES.map((l) => (
          <option key={l} value={l}>
            {JURNAL_LOCALE_LABEL[l]}
          </option>
        ))}
      </select>
    </div>
  );
}

"use client";

// Pembaca bahasa jurnal di sisi klien (Tahap 6). Cookie adalah sumber
// yang sama dengan server; localStorage cadangan. Nilai awal "ar"
// (bahasa utama jurnal) supaya render pertama komponen klien tidak
// berkedip, lalu diselaraskan dari cookie pada efek pertama.

import { useEffect, useState } from "react";
import {
  isJurnalLocale,
  JURNAL_LOCALE_COOKIE,
  JURNAL_LOCALE_STORAGE,
  type JurnalLocale
} from "./i18n";

export function useJurnalLocale(): JurnalLocale {
  const [locale, setLocale] = useState<JurnalLocale>("ar");
  useEffect(() => {
    const dariCookie = document.cookie
      .split(";")
      .map((s) => s.trim())
      .find((s) => s.startsWith(`${JURNAL_LOCALE_COOKIE}=`))
      ?.split("=")[1];
    let dariStorage: string | null = null;
    try {
      dariStorage = window.localStorage.getItem(JURNAL_LOCALE_STORAGE);
    } catch {
      dariStorage = null;
    }
    if (isJurnalLocale(dariCookie)) setLocale(dariCookie);
    else if (isJurnalLocale(dariStorage)) setLocale(dariStorage);
  }, []);
  return locale;
}

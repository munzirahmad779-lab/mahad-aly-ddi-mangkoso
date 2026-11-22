// Pembaca bahasa jurnal di sisi server — SERVER ONLY (Tahap 6).
// Bahasa dibaca dari cookie "jurnal-bahasa" yang dipasang pemilih bahasa;
// bawaan id bila cookie tidak ada atau tidak sah.

import { cookies } from "next/headers";
import {
  isJurnalLocale,
  JURNAL_LOCALE_COOKIE,
  type JurnalLocale
} from "./i18n";

export async function localeJurnalServer(): Promise<JurnalLocale> {
  try {
    const c = await cookies();
    const v = c.get(JURNAL_LOCALE_COOKIE)?.value;
    return isJurnalLocale(v) ? v : "id";
  } catch {
    return "id";
  }
}

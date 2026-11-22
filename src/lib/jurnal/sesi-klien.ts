// Pembantu sesi jurnal sisi klien (Tahap 2).
// Dua bentuk sesi mengikuti mode data server:
// - Mode lokal: token sesi lokal disimpan di localStorage kunci
//   "jurnal-sesi-lokal" oleh halaman masuk.
// - Mode supabase: sesi Supabase Auth yang diterapkan halaman masuk ke
//   klien Supabase (pola yang sama dengan panel redaksi).

import { supabase } from "@/lib/supabase/client";

export interface SesiKlienJurnal {
  mode: "local" | "supabase";
  token: string;
  email: string;
  nama?: string;
  roles: string[];
}

export const KUNCI_SESI_LOKAL = "jurnal-sesi-lokal";

export function simpanSesiLokal(sesi: {
  token: string;
  email: string;
  nama?: string;
}): void {
  try {
    localStorage.setItem(KUNCI_SESI_LOKAL, JSON.stringify(sesi));
  } catch {
    // Penyimpanan tidak tersedia; sesi hanya hidup selama halaman dibuka.
  }
}

export function hapusSesiLokal(): void {
  try {
    localStorage.removeItem(KUNCI_SESI_LOKAL);
  } catch {
    // abaikan
  }
}

export async function ambilSesiKlien(): Promise<SesiKlienJurnal | null> {
  try {
    const mentah = localStorage.getItem(KUNCI_SESI_LOKAL);
    if (mentah) {
      const s = JSON.parse(mentah) as {
        token?: string;
        email?: string;
        nama?: string;
      };
      if (s?.token && s?.email) {
        return {
          mode: "local",
          token: s.token,
          email: s.email,
          nama: s.nama,
          roles: ["author"]
        };
      }
    }
  } catch {
    // lanjut ke sesi supabase
  }
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (session?.access_token) {
    return {
      mode: "supabase",
      token: session.access_token,
      email: session.user.email ?? "",
      roles: []
    };
  }
  return null;
}

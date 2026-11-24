// ─────────────────────────────────────────────────────────────────────────────
// Pengaturan jurnal (kunci-nilai) — SERVER ONLY.
//
// Satu-satunya pengaturan yang tinggal di sini saat ini: bendera akses
// publik (kunci 'akses_publik', nilai 'terbuka' | 'tertutup') yang
// dibaca middleware untuk gerbang /jurnal. Buka dan tutup dilakukan
// Manajer Jurnal dari panel admin (perintah user 24 Nov 2026: pasang
// sekarang supaya tidak perlu pasang lagi nanti; membukanya lewat
// panel admin), tanpa ubah kode dan tanpa deploy ulang.
//
// Mode supabase: tabel jurnal_pengaturan (migrasi 010), RLS aktif,
// akses lewat supabaseAdmin sesudah pemeriksaan peran di route.
// Mode lokal: berkas .jurnal-uji/pengaturan.json lewat antrean tulis
// bersama store lokal; nilai bawaan 'tertutup' menyamai produksi.
// ─────────────────────────────────────────────────────────────────────────────

import { promises as fs } from "fs";
import path from "path";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getJurnalDataMode } from "./store";
import { antrianUntuk } from "./store-local";
import { catatPeristiwaKeamanan } from "./keamanan";

export type AksesPublikJurnal = "terbuka" | "tertutup";

const KUNCI_AKSES = "akses_publik";
const FILE_PENGATURAN = path.join(
  process.cwd(),
  ".jurnal-uji",
  "pengaturan.json"
);

function normalisasiAkses(nilai: unknown): AksesPublikJurnal {
  return nilai === "terbuka" ? "terbuka" : "tertutup";
}

async function bacaAksesLokal(): Promise<AksesPublikJurnal> {
  try {
    const mentah = await fs.readFile(FILE_PENGATURAN, "utf8");
    const data = JSON.parse(mentah) as Record<string, unknown>;
    return normalisasiAkses(data[KUNCI_AKSES]);
  } catch {
    return "tertutup";
  }
}

export async function bacaAksesPublikJurnal(): Promise<AksesPublikJurnal> {
  const mode = await getJurnalDataMode();
  if (mode === "supabase") {
    const { data, error } = await supabaseAdmin
      .from("jurnal_pengaturan")
      .select("nilai")
      .eq("kunci", KUNCI_AKSES)
      .maybeSingle();
    if (error) {
      throw new Error(`Gagal membaca pengaturan jurnal: ${error.message}`);
    }
    return normalisasiAkses(data?.nilai);
  }
  return bacaAksesLokal();
}

export async function tetapkanAksesPublikJurnal(
  nilai: AksesPublikJurnal,
  aktor: { id?: string | null; email?: string | null }
): Promise<AksesPublikJurnal> {
  const mode = await getJurnalDataMode();
  if (mode === "supabase") {
    const { error } = await supabaseAdmin.from("jurnal_pengaturan").upsert(
      {
        kunci: KUNCI_AKSES,
        nilai,
        diubah_pada: new Date().toISOString(),
        diubah_oleh: aktor.id ?? null
      },
      { onConflict: "kunci" }
    );
    if (error) {
      throw new Error(`Gagal menyimpan pengaturan jurnal: ${error.message}`);
    }
  } else {
    await antrianUntuk(FILE_PENGATURAN)(async () => {
      let data: Record<string, unknown> = {};
      try {
        data = JSON.parse(
          await fs.readFile(FILE_PENGATURAN, "utf8")
        ) as Record<string, unknown>;
      } catch {
        data = {};
      }
      data[KUNCI_AKSES] = nilai;
      await fs.mkdir(path.dirname(FILE_PENGATURAN), { recursive: true });
      await fs.writeFile(
        FILE_PENGATURAN,
        JSON.stringify(data, null, 2),
        "utf8"
      );
    });
  }
  await catatPeristiwaKeamanan("akses_publik_diubah", {
    email: aktor.email ?? null,
    rincian: `akses_publik:${nilai}`
  });
  return nilai;
}

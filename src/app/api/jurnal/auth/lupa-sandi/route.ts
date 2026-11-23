import { NextRequest, NextResponse } from "next/server";
import { mintaResetSandi } from "@/lib/jurnal/akun-kelola";
import {
  bacaJsonTerbatas,
  batasiLajuJurnal,
  catatPeristiwaKeamanan,
  responsBadanTerlaluBesar
} from "@/lib/jurnal/keamanan";
import { getClientIp } from "@/lib/rate-limit";

// Permintaan reset kata sandi (Tahap Penutup Celah, butir S4).
// Jawaban selalu generik agar tidak membocorkan keberadaan akun.
// Mode supabase: tautan pemulihan resmi Supabase Auth dikirim ke email.
// Mode lokal (uji): token sekali pakai dibuat di store lokal dan, hanya
// pada mode uji ini, dikembalikan pada badan respons sebagai tokenUji
// agar alur dapat diuji tanpa kotak surat; mode supabase tidak pernah
// mengembalikan token apa pun.

export const dynamic = "force-dynamic";

const PESAN_GENERIK =
  "Bila akun dengan email tersebut ada, tautan reset telah dikirim.";

export async function POST(req: NextRequest) {
  const { data: body, terlaluBesar } = await bacaJsonTerbatas(req, 4 * 1024);
  if (terlaluBesar) return responsBadanTerlaluBesar();
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const dibatasi = await batasiLajuJurnal(
    req,
    "lupa-sandi",
    {
      perIp: { limit: 10, windowMs: 60 * 60 * 1000 },
      perAkun: { limit: 5, windowMs: 60 * 60 * 1000 }
    },
    email || null
  );
  if (dibatasi) return dibatasi;
  if (!email || !email.includes("@")) {
    return NextResponse.json({ ok: true, pesan: PESAN_GENERIK });
  }
  try {
    const hasil = await mintaResetSandi(email);
    await catatPeristiwaKeamanan("reset_sandi_diminta", {
      ip: getClientIp(req),
      email,
      rincian: `mode-${hasil.mode}`
    });
    return NextResponse.json({
      ok: true,
      pesan: PESAN_GENERIK,
      ...(hasil.mode === "local" && hasil.tokenLokal
        ? { tokenUji: hasil.tokenLokal }
        : {})
    });
  } catch (err) {
    console.error(
      "POST /api/jurnal/auth/lupa-sandi gagal:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json({ ok: true, pesan: PESAN_GENERIK });
  }
}

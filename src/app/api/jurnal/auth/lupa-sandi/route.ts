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
// Mode lokal (uji): token sekali pakai dibuat di store lokal, tetapi
// TIDAK pernah dikembalikan pada badan respons dalam mode apa pun
// (perbaikan audit Irisan 2: token yang keluar lewat respons dapat
// dipakai siapa pun yang tahu email korban). Pada mode lokal token
// hanya dicatat di log server agar alur tetap dapat diuji tanpa kotak
// surat; penguji mengambilnya dari log, bukan dari respons API.

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
    if (hasil.mode === "local" && hasil.tokenLokal) {
      // Mode uji saja: token dicatat di log server, tidak pernah di
      // badan respons. Log server hanya terbaca operator mesin.
      console.warn(
        `[jurnal] Token reset mode lokal untuk ${email}: ${hasil.tokenLokal} (buka /jurnal/sandi-baru?token=<token> untuk menguji)`
      );
    }
    await catatPeristiwaKeamanan("reset_sandi_diminta", {
      ip: getClientIp(req),
      email,
      rincian: `mode-${hasil.mode}`
    });
    return NextResponse.json({
      ok: true,
      pesan: PESAN_GENERIK
    });
  } catch (err) {
    console.error(
      "POST /api/jurnal/auth/lupa-sandi gagal:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json({ ok: true, pesan: PESAN_GENERIK });
  }
}

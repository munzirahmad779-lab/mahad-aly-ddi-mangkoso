import { NextRequest, NextResponse } from "next/server";
import { selesaikanResetSandi } from "@/lib/jurnal/akun-kelola";
import {
  bacaJsonTerbatas,
  batasiLajuJurnal,
  catatPeristiwaKeamanan,
  responsBadanTerlaluBesar
} from "@/lib/jurnal/keamanan";
import { validasiKataSandi } from "@/lib/jurnal/wizard";
import { getClientIp } from "@/lib/rate-limit";

// Penyelesaian reset kata sandi (Tahap Penutup Celah, butir S4).
// Mode lokal: token sekali pakai dari store lokal. Mode supabase: sesi
// pemulihan Supabase Auth (token dari tautan email atau kode PKCE).

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const dibatasi = await batasiLajuJurnal(req, "sandi-baru", {
    perIp: { limit: 20, windowMs: 60 * 60 * 1000 }
  });
  if (dibatasi) return dibatasi;

  const { data: body, terlaluBesar } = await bacaJsonTerbatas(req, 8 * 1024);
  if (terlaluBesar) return responsBadanTerlaluBesar();
  const kataSandiBaru =
    typeof body?.kataSandiBaru === "string" ? body.kataSandiBaru : "";
  const galatSandi = validasiKataSandi(kataSandiBaru);
  if (galatSandi) {
    return NextResponse.json({ error: galatSandi }, { status: 400 });
  }
  try {
    const galat = await selesaikanResetSandi({
      tokenLokal:
        typeof body?.token === "string" ? body.token : undefined,
      accessToken:
        typeof body?.accessToken === "string" ? body.accessToken : undefined,
      refreshToken:
        typeof body?.refreshToken === "string"
          ? body.refreshToken
          : undefined,
      kodePkce: typeof body?.code === "string" ? body.code : undefined,
      kataSandiBaru
    });
    if (galat) {
      await catatPeristiwaKeamanan("reset_sandi_gagal", {
        ip: getClientIp(req),
        rincian: galat
      });
      return NextResponse.json({ error: galat }, { status: 400 });
    }
    await catatPeristiwaKeamanan("reset_sandi_selesai", {
      ip: getClientIp(req)
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(
      "POST /api/jurnal/auth/sandi-baru gagal:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { error: "Gagal mengganti kata sandi." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import {
  daftarPenggunaJurnal,
  ubahPenggunaJurnal
} from "@/lib/jurnal/akun-kelola";
import { tuntutPeranJurnal } from "@/lib/jurnal/gerbang";
import {
  bacaJsonTerbatas,
  batasiLajuJurnal,
  responsBadanTerlaluBesar
} from "@/lib/jurnal/keamanan";
import type { JurnalRole } from "@/lib/jurnal/status";

// Manajemen akun jurnal (Tahap Penutup Celah, butir S4b dan prasyarat
// M2). Hanya journal_manager: melihat daftar pengguna, mengganti
// peran, dan menonaktifkan atau mengaktifkan akun. Penjaga di lapisan
// kelola: akun sendiri tidak dapat dinonaktifkan dan minimal satu
// Manajer Jurnal aktif harus selalu tersisa.

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const dibatasi = await batasiLajuJurnal(req, "pengguna", {
    perIp: { limit: 120, windowMs: 60 * 1000 }
  });
  if (dibatasi) return dibatasi;
  const gerbang = await tuntutPeranJurnal(req, "pengguna", [
    "journal_manager"
  ]);
  if (!gerbang.ok) return gerbang.response;
  try {
    const pengguna = await daftarPenggunaJurnal();
    return NextResponse.json({ pengguna });
  } catch (err) {
    console.error(
      "GET /api/jurnal/pengguna gagal:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { error: "Gagal memuat daftar pengguna." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const dibatasi = await batasiLajuJurnal(req, "pengguna-ubah", {
    perIp: { limit: 60, windowMs: 60 * 60 * 1000 }
  });
  if (dibatasi) return dibatasi;
  const gerbang = await tuntutPeranJurnal(req, "pengguna-ubah", [
    "journal_manager"
  ]);
  if (!gerbang.ok) return gerbang.response;

  const { data: body, terlaluBesar } = await bacaJsonTerbatas(req, 8 * 1024);
  if (terlaluBesar) return responsBadanTerlaluBesar();
  const email = typeof body?.email === "string" ? body.email : "";
  if (!email.includes("@")) {
    return NextResponse.json(
      { error: "Email pengguna tidak sah." },
      { status: 400 }
    );
  }
  const patch: { aktif?: boolean; peran?: JurnalRole[] } = {};
  if (typeof body?.aktif === "boolean") patch.aktif = body.aktif;
  if (Array.isArray(body?.peran)) {
    patch.peran = body.peran.filter(
      (p: unknown): p is JurnalRole => typeof p === "string"
    ) as JurnalRole[];
  }
  if (patch.aktif === undefined && patch.peran === undefined) {
    return NextResponse.json(
      { error: "Tidak ada perubahan yang diminta." },
      { status: 400 }
    );
  }
  try {
    const galat = await ubahPenggunaJurnal(email, patch, gerbang.sesi.email);
    if (galat) return NextResponse.json({ error: galat }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(
      "PATCH /api/jurnal/pengguna gagal:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { error: "Gagal mengubah pengguna." },
      { status: 500 }
    );
  }
}

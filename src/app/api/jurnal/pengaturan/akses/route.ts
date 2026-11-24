import { NextRequest, NextResponse } from "next/server";
import { tuntutPeranJurnal } from "@/lib/jurnal/gerbang";
import {
  bacaJsonTerbatas,
  batasiLajuJurnal,
  responsBadanTerlaluBesar
} from "@/lib/jurnal/keamanan";
import {
  bacaAksesPublikJurnal,
  tetapkanAksesPublikJurnal,
  type AksesPublikJurnal
} from "@/lib/jurnal/pengaturan";

// Buka/tutup akses publik jurnal dari panel admin (perintah user
// 24 Nov 2026). Hanya journal_manager. Nilai tinggal di
// jurnal_pengaturan (migrasi 010) dan dibaca middleware dengan cache
// singkat; perubahan berlaku tanpa deploy ulang. Env JURNAL_AKSES
// tetap menjadi penimpa paksa di atas nilai ini untuk keadaan darurat.

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const dibatasi = await batasiLajuJurnal(req, "pengaturan-akses", {
    perIp: { limit: 120, windowMs: 60 * 1000 }
  });
  if (dibatasi) return dibatasi;
  const gerbang = await tuntutPeranJurnal(req, "pengaturan-akses", [
    "journal_manager"
  ]);
  if (!gerbang.ok) return gerbang.response;
  try {
    const akses = await bacaAksesPublikJurnal();
    return NextResponse.json({ akses });
  } catch (err) {
    console.error(
      "GET /api/jurnal/pengaturan/akses gagal:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { error: "Gagal membaca status akses publik." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const dibatasi = await batasiLajuJurnal(req, "pengaturan-akses", {
    perIp: { limit: 30, windowMs: 60 * 1000 }
  });
  if (dibatasi) return dibatasi;
  const gerbang = await tuntutPeranJurnal(req, "pengaturan-akses", [
    "journal_manager"
  ]);
  if (!gerbang.ok) return gerbang.response;
  const { data: body, terlaluBesar } = await bacaJsonTerbatas(req, 4096);
  if (terlaluBesar) return responsBadanTerlaluBesar();
  if (!body) {
    return NextResponse.json(
      { error: "Badan permintaan tidak sah." },
      { status: 400 }
    );
  }
  const akses = body.akses;
  if (akses !== "terbuka" && akses !== "tertutup") {
    return NextResponse.json(
      { error: "Nilai akses harus 'terbuka' atau 'tertutup'." },
      { status: 400 }
    );
  }
  try {
    const tersimpan = await tetapkanAksesPublikJurnal(
      akses as AksesPublikJurnal,
      { id: gerbang.sesi.userId, email: gerbang.sesi.email }
    );
    return NextResponse.json({ akses: tersimpan });
  } catch (err) {
    console.error(
      "PATCH /api/jurnal/pengaturan/akses gagal:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { error: "Gagal menyimpan status akses publik." },
      { status: 500 }
    );
  }
}

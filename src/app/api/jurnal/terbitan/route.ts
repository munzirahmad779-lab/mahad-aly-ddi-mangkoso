import { NextRequest, NextResponse } from "next/server";
import {
  buatTerbitanBaru,
  daftarArtikelSiapTetapkan,
  daftarTerbitanStaf
} from "@/lib/jurnal/alur-server";
import { tuntutStafJurnal } from "@/lib/jurnal/gerbang";
import {
  BATAS_TEKS,
  bacaJsonTerbatas,
  batasiLajuJurnal,
  responsBadanTerlaluBesar
} from "@/lib/jurnal/keamanan";

// Pengelolaan terbitan jurnal (Tahap 4). GET memuat daftar terbitan
// beserta daftar isinya dan artikel berstatus production yang siap
// ditetapkan; POST membuat terbitan draf baru. Hanya peran staf.

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const dibatasi = await batasiLajuJurnal(req, "terbitan-daftar", {
    perIp: { limit: 120, windowMs: 60 * 1000 }
  });
  if (dibatasi) return dibatasi;

  const gerbang = await tuntutStafJurnal(req, "terbitan-daftar");
  if (!gerbang.ok) return gerbang.response;

  try {
    const [terbitan, siapTetapkan] = await Promise.all([
      daftarTerbitanStaf(),
      daftarArtikelSiapTetapkan()
    ]);
    return NextResponse.json({ terbitan, siapTetapkan });
  } catch (err) {
    console.error(
      "GET /api/jurnal/terbitan gagal:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { error: "Gagal memuat daftar terbitan." },
      { status: 500 }
    );
  }
}

function angkaAtauNull(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return Math.trunc(v);
  if (typeof v === "string" && v.trim() && !Number.isNaN(Number(v))) {
    return Math.trunc(Number(v));
  }
  return null;
}

export async function POST(req: NextRequest) {
  const dibatasi = await batasiLajuJurnal(req, "terbitan-buat", {
    perIp: { limit: 30, windowMs: 60 * 60 * 1000 }
  });
  if (dibatasi) return dibatasi;

  const gerbang = await tuntutStafJurnal(req, "terbitan-buat");
  if (!gerbang.ok) return gerbang.response;

  const { data: body, terlaluBesar } = await bacaJsonTerbatas(req, 16 * 1024);
  if (terlaluBesar) return responsBadanTerlaluBesar();

  const volume = angkaAtauNull(body?.volume);
  const number = angkaAtauNull(body?.number);
  const year = angkaAtauNull(body?.year);
  const judul =
    typeof body?.judul === "string" && body.judul.trim()
      ? body.judul.trim()
      : null;
  const uraian =
    typeof body?.uraian === "string" && body.uraian.trim()
      ? body.uraian.trim()
      : null;
  if (!year || year < 1900 || year > 2200) {
    return NextResponse.json(
      { error: "Tahun terbitan wajib diisi dengan tahun yang sah." },
      { status: 400 }
    );
  }
  if (
    (judul && judul.length > BATAS_TEKS.judul) ||
    (uraian && uraian.length > BATAS_TEKS.abstrak)
  ) {
    return NextResponse.json(
      { error: "Judul atau uraian terbitan terlalu panjang." },
      { status: 400 }
    );
  }

  try {
    const terbitan = await buatTerbitanBaru(
      { volume, number, year, judul, uraian },
      { userId: gerbang.sesi.userId, email: gerbang.sesi.email }
    );
    return NextResponse.json({ terbitan }, { status: 201 });
  } catch (err) {
    const pesan =
      err instanceof Error ? err.message : "Gagal membuat terbitan.";
    return NextResponse.json({ error: pesan }, { status: 400 });
  }
}

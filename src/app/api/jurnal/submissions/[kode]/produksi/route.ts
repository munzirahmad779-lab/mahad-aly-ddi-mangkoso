import { NextRequest, NextResponse } from "next/server";
import { buatTugasProduksi } from "@/lib/jurnal/alur-server";
import { tuntutStafJurnal } from "@/lib/jurnal/gerbang";
import {
  BATAS_TEKS,
  bacaJsonTerbatas,
  batasiLajuJurnal,
  normalisasiKodeLacak,
  responsBadanTerlaluBesar
} from "@/lib/jurnal/keamanan";

// Membuat tugas produksi untuk satu naskah (Tahap 4). Hanya staf.
// Tanpa layoutEmail, tugas dikerjakan editor yang masuk sendiri.

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ kode: string }> }
) {
  const dibatasi = await batasiLajuJurnal(req, "alur-produksi-tugas", {
    perIp: { limit: 60, windowMs: 60 * 1000 }
  });
  if (dibatasi) return dibatasi;

  const { kode: kodeMentah } = await params;
  const kode = normalisasiKodeLacak(kodeMentah);
  if (!kode) {
    return NextResponse.json(
      { error: "Format kode lacak tidak sah." },
      { status: 400 }
    );
  }

  const gerbang = await tuntutStafJurnal(req, "alur-produksi-tugas");
  if (!gerbang.ok) return gerbang.response;

  const { data: body, terlaluBesar } = await bacaJsonTerbatas(req, 8 * 1024);
  if (terlaluBesar) return responsBadanTerlaluBesar();
  const layoutEmail =
    typeof body?.layoutEmail === "string" && body.layoutEmail.trim()
      ? body.layoutEmail.trim()
      : null;
  const catatan =
    typeof body?.catatan === "string" && body.catatan.trim()
      ? body.catatan.trim()
      : null;
  if (catatan && catatan.length > BATAS_TEKS.catatan) {
    return NextResponse.json(
      { error: `Catatan melebihi batas ${BATAS_TEKS.catatan} karakter.` },
      { status: 400 }
    );
  }

  try {
    const hasil = await buatTugasProduksi(
      kode,
      { layoutEmail, catatan },
      { userId: gerbang.sesi.userId, email: gerbang.sesi.email }
    );
    return NextResponse.json(hasil, { status: 201 });
  } catch (err) {
    const pesan =
      err instanceof Error ? err.message : "Gagal membuat tugas produksi.";
    const status = /tidak ditemukan/i.test(pesan) ? 404 : 400;
    return NextResponse.json({ error: pesan }, { status });
  }
}

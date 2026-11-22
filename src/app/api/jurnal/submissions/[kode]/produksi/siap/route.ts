import { NextRequest, NextResponse } from "next/server";
import { tandaiSiapTerbit } from "@/lib/jurnal/alur-server";
import { tuntutStafJurnal } from "@/lib/jurnal/gerbang";
import {
  bacaJsonTerbatas,
  batasiLajuJurnal,
  normalisasiKodeLacak,
  responsBadanTerlaluBesar
} from "@/lib/jurnal/keamanan";

// Menandai galley siap terbit (Tahap 4). Hanya staf, dan fasad
// mensyaratkan proof penulis sudah disetujui.

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ kode: string }> }
) {
  const dibatasi = await batasiLajuJurnal(req, "alur-produksi-siap", {
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

  const gerbang = await tuntutStafJurnal(req, "alur-produksi-siap");
  if (!gerbang.ok) return gerbang.response;

  const { data: body, terlaluBesar } = await bacaJsonTerbatas(req, 8 * 1024);
  if (terlaluBesar) return responsBadanTerlaluBesar();
  const tugasId = typeof body?.tugasId === "string" ? body.tugasId : "";
  if (!tugasId) {
    return NextResponse.json(
      { error: "tugasId wajib dikirim." },
      { status: 400 }
    );
  }

  try {
    await tandaiSiapTerbit(kode, tugasId, {
      userId: gerbang.sesi.userId,
      email: gerbang.sesi.email
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    const pesan =
      err instanceof Error ? err.message : "Gagal menandai siap terbit.";
    const status = /tidak ditemukan/i.test(pesan) ? 404 : 400;
    return NextResponse.json({ error: pesan }, { status });
  }
}

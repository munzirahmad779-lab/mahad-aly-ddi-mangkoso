import { NextRequest, NextResponse } from "next/server";
import { tanggapiPenugasan } from "@/lib/jurnal/review-server";
import { tuntutReviewerJurnal } from "@/lib/jurnal/gerbang";
import {
  bacaJsonTerbatas,
  batasiLajuJurnal,
  responsBadanTerlaluBesar
} from "@/lib/jurnal/keamanan";

// Reviewer menanggapi undangan telaah: menerima atau menolak penugasan
// miliknya sendiri (Tahap 3). Penugasan orang lain dijawab 404 lewat
// pesan fasad yang seragam.

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const dibatasi = await batasiLajuJurnal(req, "review-tanggapi", {
    perIp: { limit: 60, windowMs: 60 * 1000 }
  });
  if (dibatasi) return dibatasi;

  const gerbang = await tuntutReviewerJurnal(req, "review-tanggapi");
  if (!gerbang.ok) return gerbang.response;

  const { data: body, terlaluBesar } = await bacaJsonTerbatas(req, 8 * 1024);
  if (terlaluBesar) return responsBadanTerlaluBesar();
  if (typeof body?.terima !== "boolean") {
    return NextResponse.json(
      { error: "Kolom terima wajib berisi true atau false." },
      { status: 400 }
    );
  }

  const { id } = await params;
  try {
    await tanggapiPenugasan(id, body.terima, {
      userId: gerbang.sesi.userId,
      email: gerbang.sesi.email
    });
    return NextResponse.json({
      status: body.terima ? "accepted" : "declined"
    });
  } catch (err) {
    const pesan =
      err instanceof Error ? err.message : "Gagal menanggapi undangan.";
    const status = /tidak ditemukan/i.test(pesan) ? 404 : 400;
    return NextResponse.json({ error: pesan }, { status });
  }
}

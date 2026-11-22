import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "@/lib/rate-limit";
import { rincianPenugasanReviewer } from "@/lib/jurnal/review-server";
import { tuntutReviewerJurnal } from "@/lib/jurnal/gerbang";
import {
  batasiLajuJurnal,
  catatPeristiwaKeamanan
} from "@/lib/jurnal/keamanan";

// Rincian satu penugasan untuk reviewer pemiliknya (Tahap 3). Penugasan
// milik orang lain dijawab 404 (bukan 403) supaya keberadaannya tidak
// terkonfirmasi, dan penolakan tercatat sebagai peristiwa keamanan.
// Bentuk jawabannya anonim secara struktural: naskah tanpa identitas
// penulis dan berkas tanpa nama berkas asli.

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const dibatasi = await batasiLajuJurnal(req, "review-rincian", {
    perIp: { limit: 120, windowMs: 60 * 1000 }
  });
  if (dibatasi) return dibatasi;

  const gerbang = await tuntutReviewerJurnal(req, "review-rincian");
  if (!gerbang.ok) return gerbang.response;

  const { id } = await params;
  try {
    const penugasan = await rincianPenugasanReviewer(id, {
      userId: gerbang.sesi.userId,
      email: gerbang.sesi.email
    });
    if (!penugasan) {
      await catatPeristiwaKeamanan("review_ditolak", {
        ip: getClientIp(req),
        email: gerbang.sesi.email,
        rincian: "review-rincian:bukan-milik-atau-tidak-ada"
      });
      return NextResponse.json(
        { error: "Penugasan tidak ditemukan." },
        { status: 404 }
      );
    }
    return NextResponse.json({ penugasan });
  } catch (err) {
    console.error(
      "GET /api/jurnal/review/[id] gagal:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { error: "Gagal memuat penugasan telaah." },
      { status: 500 }
    );
  }
}

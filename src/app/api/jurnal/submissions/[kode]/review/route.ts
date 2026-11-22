import { NextRequest, NextResponse } from "next/server";
import { getSubmission } from "@/lib/jurnal/store";
import { keadaanReviewUntukStaf } from "@/lib/jurnal/review-server";
import { tuntutStafJurnal } from "@/lib/jurnal/gerbang";
import {
  batasiLajuJurnal,
  normalisasiKodeLacak
} from "@/lib/jurnal/keamanan";

// Keadaan review satu naskah untuk staf (Tahap 3): naskah lengkap,
// putaran beserta penugasan dan hasil telaahnya, dan daftar berkas.
// Hanya peran staf; bentuk ini memuat identitas reviewer dan komentar
// rahasia untuk editor, jadi tidak pernah diserahkan ke peran lain.

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ kode: string }> }
) {
  const dibatasi = await batasiLajuJurnal(req, "review-keadaan", {
    perIp: { limit: 120, windowMs: 60 * 1000 }
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

  const gerbang = await tuntutStafJurnal(req, "review-keadaan");
  if (!gerbang.ok) return gerbang.response;

  try {
    const [naskah, keadaan] = await Promise.all([
      getSubmission(kode),
      keadaanReviewUntukStaf(kode)
    ]);
    if (!naskah || !keadaan) {
      return NextResponse.json(
        { error: "Kode lacak tidak ditemukan." },
        { status: 404 }
      );
    }
    return NextResponse.json({ naskah, ...keadaan });
  } catch (err) {
    console.error(
      "GET /api/jurnal/submissions/[kode]/review gagal:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { error: "Gagal memuat keadaan telaah." },
      { status: 500 }
    );
  }
}

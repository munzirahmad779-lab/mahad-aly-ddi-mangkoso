import { NextRequest, NextResponse } from "next/server";
import { serahkanReview } from "@/lib/jurnal/review-server";
import { tuntutReviewerJurnal } from "@/lib/jurnal/gerbang";
import { isJurnalRecommendation } from "@/lib/jurnal/review";
import {
  bacaJsonTerbatas,
  batasiLajuJurnal,
  responsBadanTerlaluBesar
} from "@/lib/jurnal/keamanan";

// Reviewer menyerahkan hasil telaah untuk penugasannya sendiri
// (Tahap 3): rekomendasi wajib, komentar untuk penulis, dan komentar
// rahasia untuk editor. Komentar rahasia tidak pernah diteruskan ke
// sisi penulis (lihat hasilReviewUntukPenulis di review-server.ts).

export const dynamic = "force-dynamic";

const BATAS_KOMENTAR = 10000;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const dibatasi = await batasiLajuJurnal(req, "review-serahkan", {
    perIp: { limit: 60, windowMs: 60 * 1000 }
  });
  if (dibatasi) return dibatasi;

  const gerbang = await tuntutReviewerJurnal(req, "review-serahkan");
  if (!gerbang.ok) return gerbang.response;

  const { data: body, terlaluBesar } = await bacaJsonTerbatas(
    req,
    32 * 1024
  );
  if (terlaluBesar) return responsBadanTerlaluBesar();
  if (!isJurnalRecommendation(body?.rekomendasi)) {
    return NextResponse.json(
      {
        error:
          "Rekomendasi harus salah satu dari: accept, minor_revisions, major_revisions, decline, see_comments."
      },
      { status: 400 }
    );
  }
  const komentarPenulis =
    typeof body?.komentarPenulis === "string" ? body.komentarPenulis : "";
  const komentarEditor =
    typeof body?.komentarEditor === "string" ? body.komentarEditor : "";
  if (
    komentarPenulis.length > BATAS_KOMENTAR ||
    komentarEditor.length > BATAS_KOMENTAR
  ) {
    return NextResponse.json(
      { error: `Komentar melebihi batas ${BATAS_KOMENTAR} karakter.` },
      { status: 400 }
    );
  }

  const { id } = await params;
  try {
    await serahkanReview(
      id,
      {
        rekomendasi: body.rekomendasi,
        komentarPenulis: komentarPenulis || null,
        komentarEditor: komentarEditor || null
      },
      { userId: gerbang.sesi.userId, email: gerbang.sesi.email }
    );
    return NextResponse.json({ status: "completed" });
  } catch (err) {
    const pesan =
      err instanceof Error ? err.message : "Gagal menyerahkan telaah.";
    const status = /tidak ditemukan/i.test(pesan) ? 404 : 400;
    return NextResponse.json({ error: pesan }, { status });
  }
}

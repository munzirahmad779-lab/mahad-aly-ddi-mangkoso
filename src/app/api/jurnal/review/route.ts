import { NextRequest, NextResponse } from "next/server";
import { daftarPenugasanReviewer } from "@/lib/jurnal/review-server";
import { tuntutReviewerJurnal } from "@/lib/jurnal/gerbang";
import { batasiLajuJurnal } from "@/lib/jurnal/keamanan";

// Daftar penugasan telaah milik reviewer yang masuk (Tahap 3). Jawaban
// hanya memuat penugasannya sendiri dalam bentuk anonim: tidak ada nama,
// email, atau afiliasi penulis di dalamnya (anonimitas dibangun di
// lapisan data, lihat review-server.ts dan review-internal.ts).

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const dibatasi = await batasiLajuJurnal(req, "review-daftar", {
    perIp: { limit: 120, windowMs: 60 * 1000 }
  });
  if (dibatasi) return dibatasi;

  const gerbang = await tuntutReviewerJurnal(req, "review-daftar");
  if (!gerbang.ok) return gerbang.response;

  try {
    const penugasan = await daftarPenugasanReviewer({
      userId: gerbang.sesi.userId,
      email: gerbang.sesi.email
    });
    return NextResponse.json({
      viewer: { email: gerbang.sesi.email, roles: gerbang.sesi.roles },
      penugasan
    });
  } catch (err) {
    console.error(
      "GET /api/jurnal/review gagal:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { error: "Gagal memuat penugasan telaah." },
      { status: 500 }
    );
  }
}

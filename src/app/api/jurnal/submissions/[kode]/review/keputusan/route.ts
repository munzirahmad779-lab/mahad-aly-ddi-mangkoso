import { NextRequest, NextResponse } from "next/server";
import { keputusanPutaran } from "@/lib/jurnal/review-server";
import { tuntutStafJurnal } from "@/lib/jurnal/gerbang";
import { isJurnalReviewDecision } from "@/lib/jurnal/review";
import {
  BATAS_TEKS,
  bacaJsonTerbatas,
  batasiLajuJurnal,
  normalisasiKodeLacak,
  responsBadanTerlaluBesar
} from "@/lib/jurnal/keamanan";

// Keputusan editor atas putaran telaah yang terbuka (khusus staf,
// Tahap 3): accept menutup putaran dan menggerakkan naskah ke
// copyediting, decline menjadi declined, minor/major revisions menutup
// putaran dan menunggu revisi penulis. Keputusan mensyaratkan minimal
// 2 penugasan reviewer aktif pada putaran itu (ditegakkan fasad).

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ kode: string }> }
) {
  const dibatasi = await batasiLajuJurnal(req, "review-keputusan", {
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

  const gerbang = await tuntutStafJurnal(req, "review-keputusan");
  if (!gerbang.ok) return gerbang.response;

  const { data: body, terlaluBesar } = await bacaJsonTerbatas(req, 8 * 1024);
  if (terlaluBesar) return responsBadanTerlaluBesar();
  if (!isJurnalReviewDecision(body?.keputusan)) {
    return NextResponse.json(
      {
        error:
          "Keputusan harus salah satu dari: accept, minor_revisions, major_revisions, decline."
      },
      { status: 400 }
    );
  }
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
    const hasil = await keputusanPutaran(
      kode,
      { keputusan: body.keputusan, catatan },
      { userId: gerbang.sesi.userId, email: gerbang.sesi.email }
    );
    return NextResponse.json(hasil);
  } catch (err) {
    const pesan =
      err instanceof Error ? err.message : "Gagal mengambil keputusan.";
    const status = /tidak ditemukan/i.test(pesan) ? 404 : 400;
    return NextResponse.json({ error: pesan }, { status });
  }
}

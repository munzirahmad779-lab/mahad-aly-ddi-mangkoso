import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "@/lib/rate-limit";
import { berkasUntukUnduhanReviewer } from "@/lib/jurnal/review-server";
import { tuntutReviewerJurnal } from "@/lib/jurnal/gerbang";
import {
  BUCKET_LOKAL_UJI,
  bacaBerkasLokalUji,
  tandaTanganiUnduhan
} from "@/lib/jurnal/berkas";
import {
  batasiLajuJurnal,
  catatPeristiwaKeamanan
} from "@/lib/jurnal/keamanan";

// Unduhan berkas naskah untuk reviewer pemilik penugasan (Tahap 3).
// Hak akses diperiksa fasad menurut kepemilikan penugasan dan putaran;
// berkas di luar yang terlihat pada putaran penugasan dijawab 404.
// Mode R2: pengalihan 302 ke URL unduh bertanda tangan berumur 10
// menit. Mode uji lokal: isi berkas dialirkan route ini dengan nama
// unduhan generik (nama berkas asli tidak dipakai karena bisa memuat
// nama penulis).

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; berkasId: string }> }
) {
  const dibatasi = await batasiLajuJurnal(req, "review-unduh", {
    perIp: { limit: 60, windowMs: 60 * 1000 }
  });
  if (dibatasi) return dibatasi;

  const gerbang = await tuntutReviewerJurnal(req, "review-unduh");
  if (!gerbang.ok) return gerbang.response;

  const { id, berkasId } = await params;
  try {
    const sasaran = await berkasUntukUnduhanReviewer(id, berkasId, {
      userId: gerbang.sesi.userId,
      email: gerbang.sesi.email
    });
    if (!sasaran) {
      await catatPeristiwaKeamanan("review_ditolak", {
        ip: getClientIp(req),
        email: gerbang.sesi.email,
        rincian: "review-unduh:bukan-milik-atau-tidak-terlihat"
      });
      return NextResponse.json(
        { error: "Berkas tidak ditemukan untuk penugasan ini." },
        { status: 404 }
      );
    }

    if (sasaran.bucket === BUCKET_LOKAL_UJI) {
      const isi = await bacaBerkasLokalUji(sasaran.kunci);
      if (!isi) {
        return NextResponse.json(
          { error: "Isi berkas uji lokal tidak ditemukan." },
          { status: 404 }
        );
      }
      return new NextResponse(new Uint8Array(isi), {
        status: 200,
        headers: {
          "Content-Type": sasaran.mime || "application/octet-stream",
          "Content-Length": String(isi.length),
          "Content-Disposition": `attachment; filename="naskah-telaah${sasaran.ekstensi}"`,
          "Cache-Control": "private, no-store"
        }
      });
    }

    const url = await tandaTanganiUnduhan(sasaran.bucket, sasaran.kunci);
    return NextResponse.redirect(url, 302);
  } catch (err) {
    console.error(
      "GET /api/jurnal/review/[id]/berkas/[berkasId] gagal:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { error: "Gagal menyiapkan unduhan berkas." },
      { status: 500 }
    );
  }
}

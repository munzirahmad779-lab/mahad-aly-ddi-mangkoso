import { NextRequest, NextResponse } from "next/server";
import { bukaPutaran } from "@/lib/jurnal/review-server";
import { tuntutStafJurnal } from "@/lib/jurnal/gerbang";
import {
  batasiLajuJurnal,
  normalisasiKodeLacak
} from "@/lib/jurnal/keamanan";

// Membuka putaran telaah baru untuk satu naskah (khusus staf, Tahap 3).
// Putaran pertama menggerakkan naskah submitted ke review; putaran
// berikutnya mensyaratkan keputusan revisi pada putaran sebelumnya dan
// berkas revisi yang sudah diunggah penulis. Aturan lengkapnya ditegakkan
// fasad review-server.ts.

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ kode: string }> }
) {
  const dibatasi = await batasiLajuJurnal(req, "review-putaran", {
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

  const gerbang = await tuntutStafJurnal(req, "review-putaran");
  if (!gerbang.ok) return gerbang.response;

  try {
    const hasil = await bukaPutaran(kode, {
      userId: gerbang.sesi.userId,
      email: gerbang.sesi.email
    });
    return NextResponse.json({ putaran: hasil.nomor }, { status: 201 });
  } catch (err) {
    const pesan = err instanceof Error ? err.message : "Gagal membuka putaran.";
    const status = /tidak ditemukan/i.test(pesan) ? 404 : 400;
    return NextResponse.json({ error: pesan }, { status });
  }
}

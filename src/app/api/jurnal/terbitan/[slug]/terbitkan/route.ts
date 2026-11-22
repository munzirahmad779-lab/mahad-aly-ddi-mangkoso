import { NextRequest, NextResponse } from "next/server";
import { terbitkanTerbitan } from "@/lib/jurnal/alur-server";
import { tuntutStafJurnal } from "@/lib/jurnal/gerbang";
import { batasiLajuJurnal } from "@/lib/jurnal/keamanan";

// Tombol terbitkan terbitan (Tahap 4): semua artikel production yang
// ditetapkan bergerak menjadi published lewat tabel transisi status,
// tanggal terbit terisi, dan terbitan menjadi terbitan berjalan.
// Hanya peran staf.

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const dibatasi = await batasiLajuJurnal(req, "terbitan-terbitkan", {
    perIp: { limit: 30, windowMs: 60 * 60 * 1000 }
  });
  if (dibatasi) return dibatasi;

  const gerbang = await tuntutStafJurnal(req, "terbitan-terbitkan");
  if (!gerbang.ok) return gerbang.response;

  const { slug } = await params;
  try {
    const hasil = await terbitkanTerbitan(decodeURIComponent(slug), {
      userId: gerbang.sesi.userId,
      email: gerbang.sesi.email
    });
    return NextResponse.json({ success: true, ...hasil });
  } catch (err) {
    const pesan =
      err instanceof Error ? err.message : "Gagal menerbitkan terbitan.";
    const status = /tidak ditemukan/i.test(pesan) ? 404 : 400;
    return NextResponse.json({ error: pesan }, { status });
  }
}

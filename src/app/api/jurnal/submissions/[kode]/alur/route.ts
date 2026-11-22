import { NextRequest, NextResponse } from "next/server";
import { getSubmission } from "@/lib/jurnal/store";
import {
  daftarPetugasTahap,
  keadaanAlurUntukStaf
} from "@/lib/jurnal/alur-server";
import { tuntutStafJurnal } from "@/lib/jurnal/gerbang";
import {
  batasiLajuJurnal,
  normalisasiKodeLacak
} from "@/lib/jurnal/keamanan";

// Keadaan alur Tahap 4 satu naskah untuk staf: tugas copyediting, tugas
// produksi beserta galley dan hasil proof, penempatan terbitan, dan
// daftar petugas tahap yang dapat ditugaskan. Hanya peran staf.

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ kode: string }> }
) {
  const dibatasi = await batasiLajuJurnal(req, "alur-keadaan", {
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

  const gerbang = await tuntutStafJurnal(req, "alur-keadaan");
  if (!gerbang.ok) return gerbang.response;

  try {
    const [naskah, keadaan, petugasCopy, petugasLayout] = await Promise.all([
      getSubmission(kode),
      keadaanAlurUntukStaf(kode),
      daftarPetugasTahap("copyeditor"),
      daftarPetugasTahap("layout_editor")
    ]);
    if (!naskah || !keadaan) {
      return NextResponse.json(
        { error: "Kode lacak tidak ditemukan." },
        { status: 404 }
      );
    }
    return NextResponse.json({
      naskah,
      ...keadaan,
      petugasCopy,
      petugasLayout
    });
  } catch (err) {
    console.error(
      "GET /api/jurnal/submissions/[kode]/alur gagal:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { error: "Gagal memuat keadaan alur naskah." },
      { status: 500 }
    );
  }
}

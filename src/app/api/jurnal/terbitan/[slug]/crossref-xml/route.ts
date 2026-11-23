import { NextRequest, NextResponse } from "next/server";
import { daftarTerbitanPublik } from "@/lib/jurnal/alur-server";
import { bangunXmlDepositCrossref } from "@/lib/jurnal/crossref";
import { tuntutPeranJurnal } from "@/lib/jurnal/gerbang";
import { batasiLajuJurnal } from "@/lib/jurnal/keamanan";

// Unduh XML deposit Crossref untuk satu terbitan (Tahap Penutup Celah).
// Hanya journal_manager. Berkas ini yang kemudian didepositkan lewat
// formulir web Crossref atau servlet deposit; hasilnya dicatat lewat
// rute status-doi per artikel. Artikel tanpa DOI dilewati dan dihitung
// di header respons.

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const dibatasi = await batasiLajuJurnal(req, "terbitan-crossref-xml", {
    perIp: { limit: 30, windowMs: 60 * 60 * 1000 }
  });
  if (dibatasi) return dibatasi;
  const gerbang = await tuntutPeranJurnal(req, "terbitan-crossref-xml", [
    "journal_manager"
  ]);
  if (!gerbang.ok) return gerbang.response;

  const { slug } = await params;
  const terbitan = (await daftarTerbitanPublik()).find((t) => t.slug === slug);
  if (!terbitan) {
    return NextResponse.json(
      { error: "Terbitan tidak ditemukan atau belum terbit." },
      { status: 404 }
    );
  }
  const basisUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin
  ).replace(/\/$/, "");
  const hasil = bangunXmlDepositCrossref({ terbitan, basisUrl });
  if (hasil.jumlahArtikel === 0) {
    return NextResponse.json(
      { error: "Belum ada artikel ber-DOI pada terbitan ini." },
      { status: 400 }
    );
  }
  return new NextResponse(hasil.xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Content-Disposition": `attachment; filename="crossref-${slug}.xml"`,
      "X-Jumlah-Artikel": String(hasil.jumlahArtikel),
      "X-Terlewat-Tanpa-Doi": String(hasil.terlewatTanpaDoi),
      "Cache-Control": "private, no-store"
    }
  });
}

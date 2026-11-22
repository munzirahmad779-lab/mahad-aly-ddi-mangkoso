import { NextRequest, NextResponse } from "next/server";
import { artikelPublikDariSlug } from "@/lib/jurnal/alur-server";
import { buatBibtex, buatRis } from "@/lib/jurnal/publik5";
import {
  batasiLajuJurnal,
  normalisasiKodeLacak
} from "@/lib/jurnal/keamanan";

// Unduhan sitasi per artikel published (Tahap 5): BibTeX dan RIS.
// Hanya artikel yang tampil publik yang punya unduhan sitasi; artikel
// belum terbit atau sudah ditarik menjawab 404.

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ kode: string }> }
) {
  const dibatasi = await batasiLajuJurnal(req, "artikel-sitasi", {
    perIp: { limit: 120, windowMs: 60 * 1000 }
  });
  if (dibatasi) return dibatasi;

  const { kode: kodeMentah } = await params;
  const kode = normalisasiKodeLacak(kodeMentah);
  if (!kode) {
    return NextResponse.json(
      { error: "Kode lacak tidak sah." },
      { status: 400 }
    );
  }
  const format = req.nextUrl.searchParams.get("format") ?? "bibtex";
  if (format !== "bibtex" && format !== "ris") {
    return NextResponse.json(
      { error: "Format sitasi yang tersedia: bibtex dan ris." },
      { status: 400 }
    );
  }

  const artikel = await artikelPublikDariSlug(kode);
  if (!artikel) {
    return NextResponse.json(
      { error: "Artikel tidak ditemukan atau belum terbit." },
      { status: 404 }
    );
  }

  const urlArtikel = `${req.nextUrl.origin}/jurnal/artikel/${artikel.slug}`;
  const sumber = {
    judul: artikel.judul,
    penulis: artikel.penulis,
    tahun: artikel.tahun,
    volume: artikel.volume,
    nomor: artikel.nomor,
    halaman: artikel.halaman,
    doi: artikel.doi,
    slug: artikel.slug
  };
  const isi = format === "bibtex" ? buatBibtex(sumber, urlArtikel) : buatRis(sumber, urlArtikel);
  const namaBerkas = `${artikel.slug}.${format === "bibtex" ? "bib" : "ris"}`;
  return new NextResponse(isi, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${namaBerkas}"`
    }
  });
}

import { NextRequest, NextResponse } from "next/server";
import {
  artikelPublikDariSlug,
  catatUnduhanArtikel,
  galleyPublikDariSlug
} from "@/lib/jurnal/alur-server";
import {
  BUCKET_LOKAL_UJI,
  bacaBerkasLokalUji,
  tandaTanganiUnduhan
} from "@/lib/jurnal/berkas";

// Galley PDF artikel terbit, disajikan dari jalur satu direktori
// dengan halaman artikel (/jurnal/artikel/<slug>/pdf) mengikuti pola
// yang diharapkan Google Scholar untuk citation_pdf_url. Isi berkas
// tidak pernah disimpan di aplikasi: mode R2 menjawab dengan alihan ke
// URL unduh bertanda tangan berumur 10 menit; mode uji lokal membaca
// berkas dari folder scratch klon. Hanya artikel published di dalam
// terbitan published yang berkasnya bisa keluar; selain itu 404.
// Setiap penyajian yang berhasil menaikkan penghitung unduhan harian.

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const artikel = await artikelPublikDariSlug(slug);
  if (!artikel) {
    return NextResponse.json(
      { error: "Artikel tidak ditemukan." },
      { status: 404 }
    );
  }
  const galley = await galleyPublikDariSlug(slug, "pdf");
  if (!galley) {
    return NextResponse.json(
      { error: "Galley PDF artikel ini belum tersedia." },
      { status: 404 }
    );
  }

  await catatUnduhanArtikel(artikel.kode);

  if (galley.bucket === BUCKET_LOKAL_UJI) {
    const isi = await bacaBerkasLokalUji(galley.kunci);
    if (!isi) {
      return NextResponse.json(
        { error: "Berkas galley tidak ditemukan di penyimpanan." },
        { status: 404 }
      );
    }
    return new NextResponse(new Uint8Array(isi), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${artikel.slug}.pdf"`,
        "Cache-Control": "public, max-age=300"
      }
    });
  }

  try {
    const url = await tandaTanganiUnduhan(galley.bucket, galley.kunci);
    return NextResponse.redirect(url, 307);
  } catch {
    return NextResponse.json(
      { error: "Gagal menyiapkan tautan unduhan galley." },
      { status: 502 }
    );
  }
}

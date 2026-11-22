import { NextRequest, NextResponse } from "next/server";
import {
  artikelPublikDariSlug,
  galleyPublikDariSlug
} from "@/lib/jurnal/alur-server";
import {
  BUCKET_LOKAL_UJI,
  bacaBerkasLokalUji,
  tandaTanganiUnduhan
} from "@/lib/jurnal/berkas";

// Galley HTML artikel terbit. Berkas HTML berasal dari petugas layout,
// jadi isinya wajib dirender dalam kotak pasir: route ini meminta
// Content-Security-Policy: sandbox, dan karena header config global
// menimpa header route handler, nilai yang sama ditegakkan untuk
// jalur ini di next.config.ts (entri khusus /jurnal/artikel/:slug/html
// sesudah entri global). Pada mode R2 jawabannya alihan
// ke URL bertanda tangan; pengetatan serupa di sisi R2 adalah pekerjaan
// masa deploy (dicatat di laporan Tahap 4). Hanya artikel published di
// dalam terbitan published; selain itu 404.

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
  const galley = await galleyPublikDariSlug(slug, "html");
  if (!galley) {
    return NextResponse.json(
      { error: "Galley HTML artikel ini belum tersedia." },
      { status: 404 }
    );
  }

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
        "Content-Type": "text/html; charset=utf-8",
        "Content-Security-Policy": "sandbox",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "public, max-age=300"
      }
    });
  }

  try {
    const url = await tandaTanganiUnduhan(galley.bucket, galley.kunci);
    return NextResponse.redirect(url, 307);
  } catch {
    return NextResponse.json(
      { error: "Gagal menyiapkan tautan galley HTML." },
      { status: 502 }
    );
  }
}

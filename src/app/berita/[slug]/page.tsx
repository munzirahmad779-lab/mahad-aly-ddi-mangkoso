import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { slugExistsInTable, OG_LOGO_IMAGE, fetchNewsDetail } from "@/lib/seo";
import { supabaseAnon } from "@/lib/supabase/server";
import { SLUG_TULISAN_HARI_GURU, TAUTAN_HARI_GURU } from "@/lib/hari-guru";
import DetailClient from "./detail-client";

const BASE = "https://mahadaly-ddimangkoso.ac.id";
const SITE = "Ma'had Aly DDI Mangkoso";

interface Props {
  params: Promise<{ slug: string }>;
}

// Pembungkus server: pastikan slug benar-benar ada di database sebelum
// merender komponen klien, agar URL berita yang tidak ada membalas
// HTTP 404 sungguhan (bukan soft-404 berstatus 200). Bila DB tidak bisa
// dipastikan (error), halaman tetap dirender dan klien yang memutuskan.
//
// Metadata rute ini dibuat SATU kali di sini. Sebelumnya layout segmen
// ini juga mengekspor generateMetadata dengan canonical slug mentah,
// sementara page memakai slug bersih, sehingga dua kueri basis data dan
// dua versi metadata bersaing untuk rute yang sama. Hasil gabungan yang
// tampil selama ini dipertahankan persis: judul dari baris berita,
// canonical memakai slug bersih, description dan OpenGraph dari isi
// berita (gambar berita sendiri bila ada, selain itu logo situs).
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cleanSlug = decodeURIComponent(slug || "").toLowerCase().trim();
  let n: any = null;
  try {
    const { data } = await supabaseAnon
      .from("news")
      .select("judul, konten, tipe, created_at, gambar_url")
      .ilike("slug", cleanSlug)
      .maybeSingle();
    n = data;
  } catch {}

  if (!n) {
    return {
      title: "Berita Tidak Ditemukan",
      robots: { index: false, follow: true },
      alternates: { canonical: `${BASE}/berita/${cleanSlug}` }
    };
  }
  const description =
    (n.konten || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160) ||
    `Warta dan pengumuman resmi ${SITE}.`;
  return {
    title: n.judul,
    description,
    alternates: { canonical: `${BASE}/berita/${cleanSlug}` },
    openGraph: {
      title: n.judul,
      description,
      type: "article",
      url: `${BASE}/berita/${slug}`,
      siteName: SITE,
      // Berita bergambar: pratinjau WA memakai gambar halamannya
      // (perintah user 21 Nov 2026). Tanpa gambar: logo situs.
      images: n.gambar_url
        ? [{ url: n.gambar_url, alt: n.judul }]
        : [OG_LOGO_IMAGE]
    }
  };
}

export default async function BeritaDetailPage({ params }: Props) {
  const { slug } = await params;
  const cleanSlug = decodeURIComponent(slug || "").toLowerCase().trim();
  // Perintah user 26 Nov 2026: tiga tulisan Hari Guru tidak lagi
  // berdiri sebagai berita satu-satu; alamat lamanya mengalihkan ke
  // laman gabungan /hari-guru tempat pembaca memilih tulisannya.
  if (SLUG_TULISAN_HARI_GURU.includes(cleanSlug)) {
    redirect(TAUTAN_HARI_GURU);
  }
  const exists = await slugExistsInTable("news", cleanSlug);
  if (exists === false) {
    notFound();
  }
  // Data awal lengkap dari server (termasuk isi berita) agar isi ikut
  // ter-render pada HTML pertama untuk perayap; komponen klien tetap
  // memuat ulang datanya sendiri sesudah tampil.
  const beritaAwal = await fetchNewsDetail(cleanSlug);
  return <DetailClient params={params} beritaAwal={beritaAwal} />;
}

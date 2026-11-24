import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { slugExistsInTable, OG_LOGO_IMAGE } from "@/lib/seo";
import { supabaseAnon } from "@/lib/supabase/server";
import DetailClient from "./detail-client";

const BASE = "https://mahadaly-ddimangkoso.ac.id";
const SITE = "Ma'had Aly DDI Mangkoso";

interface Props {
  params: Promise<{ slug: string }>;
}

// Pembungkus server: pastikan slug benar-benar ada di database sebelum
// merender komponen klien, agar URL skripsi yang tidak ada membalas
// HTTP 404 sungguhan (bukan soft-404 berstatus 200). Bila DB tidak bisa
// dipastikan (error), halaman tetap dirender dan klien yang memutuskan.
//
// Metadata rute ini dibuat SATU kali di sini. Sebelumnya layout segmen
// ini juga mengekspor generateMetadata, sehingga dua kueri basis data
// dan dua sumber metadata bersaing untuk rute yang sama. Hasil gabungan
// yang tampil selama ini dipertahankan persis: judul dari baris risalah,
// canonical memakai slug bersih, description dari abstrak Indonesia,
// OpenGraph memakai logo situs.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cleanSlug = decodeURIComponent(slug || "").toLowerCase().trim();
  let t: any = null;
  try {
    const { data } = await supabaseAnon
      .from("theses")
      .select("judul, penulis, abstrak_id, created_at")
      .ilike("slug", cleanSlug)
      .maybeSingle();
    t = data;
  } catch {}

  if (!t) {
    return {
      title: "Risalah Tidak Ditemukan",
      robots: { index: false, follow: true },
      alternates: { canonical: `${BASE}/skripsi/${cleanSlug}` }
    };
  }
  const description =
    (t.abstrak_id || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160) ||
    `Risalah skripsi mahasantri ${SITE} karya ${t.penulis || "mahasantri"}.`;
  return {
    title: t.judul,
    description,
    alternates: { canonical: `${BASE}/skripsi/${cleanSlug}` },
    openGraph: {
      title: t.judul,
      description,
      type: "article",
      url: `${BASE}/skripsi/${slug}`,
      siteName: SITE,
      images: [OG_LOGO_IMAGE]
    }
  };
}

export default async function SkripsiDetailPage({ params }: Props) {
  const { slug } = await params;
  const cleanSlug = decodeURIComponent(slug || "").toLowerCase().trim();
  const exists = await slugExistsInTable("theses", cleanSlug);
  if (exists === false) {
    notFound();
  }
  return <DetailClient params={params} />;
}

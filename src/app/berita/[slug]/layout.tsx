import type { Metadata } from "next";
import { supabaseAnon } from "@/lib/supabase/server";
import { OG_LOGO_IMAGE } from "@/lib/seo";

const BASE = "https://mahadaly-ddimangkoso.ac.id";
const SITE = "Ma'had Aly DDI Mangkoso";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let n: any = null;
  try {
    const { data } = await supabaseAnon
      .from("news")
      .select("judul, konten, tipe, created_at, gambar_url")
      .ilike("slug", decodeURIComponent(slug).toLowerCase().trim())
      .maybeSingle();
    n = data;
  } catch {}

  if (!n) {
    return { title: "Berita Tidak Ditemukan", robots: { index: false, follow: true } };
  }
  const description =
    (n.konten || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160) ||
    `Warta dan pengumuman resmi ${SITE}.`;
  return {
    title: n.judul,
    description,
    alternates: { canonical: `${BASE}/berita/${slug}` },
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

export default function BeritaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

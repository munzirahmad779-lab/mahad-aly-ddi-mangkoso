import type { Metadata } from "next";
import { supabaseAnon } from "@/lib/supabase/server";

const BASE = "https://mahadaly-ddimangkoso.my.id";
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
      .select("judul, konten, tipe, created_at")
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
      siteName: SITE
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

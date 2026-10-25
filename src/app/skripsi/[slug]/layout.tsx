import type { Metadata } from "next";
import { supabaseAnon } from "@/lib/supabase/server";

const BASE = "https://mahadaly-ddimangkoso.my.id";
const SITE = "Ma'had Aly DDI Mangkoso";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let t: any = null;
  try {
    const { data } = await supabaseAnon
      .from("theses")
      .select("judul, penulis, abstrak_id, created_at")
      .ilike("slug", decodeURIComponent(slug).toLowerCase().trim())
      .maybeSingle();
    t = data;
  } catch {}

  if (!t) {
    return { title: "Risalah Tidak Ditemukan", robots: { index: false, follow: true } };
  }
  const description =
    (t.abstrak_id || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160) ||
    `Risalah skripsi mahasantri ${SITE} karya ${t.penulis || "mahasantri"}.`;
  return {
    title: t.judul,
    description,
    alternates: { canonical: `${BASE}/skripsi/${slug}` },
    openGraph: {
      title: t.judul,
      description,
      type: "article",
      url: `${BASE}/skripsi/${slug}`,
      siteName: SITE
    }
  };
}

export default function SkripsiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

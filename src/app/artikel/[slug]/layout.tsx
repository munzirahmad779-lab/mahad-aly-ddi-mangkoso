import type { Metadata } from "next";
import { articleMetadata, fetchArticleMeta } from "@/lib/seo";

interface Props {
  params: Promise<{ slug: string }>;
}

// Metadata per-artikel: title, description, canonical, OpenGraph — dari DB.
// Menyembuhkan bug canonical global yang membuat Google menolak mengindeks
// halaman konten.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await fetchArticleMeta(decodeURIComponent(slug).toLowerCase().trim());
  return articleMetadata(decodeURIComponent(slug).toLowerCase().trim(), article);
}

export default function ArtikelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

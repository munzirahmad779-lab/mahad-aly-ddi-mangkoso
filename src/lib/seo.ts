import type { Metadata } from "next";
import { supabaseAnon } from "@/lib/supabase/server";

const BASE = "https://mahadaly-ddimangkoso.my.id";
const SITE = "Ma'had Aly DDI Mangkoso";

export function stripHtml(s: string | null | undefined, max = 160): string {
  const plain = (s || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return plain.length > max ? plain.slice(0, max - 1) + "…" : plain;
}

interface ArticleRow {
  title: string;
  excerpt: string | null;
  content: string | null;
  author_name: string | null;
  created_at: string;
  updated_at: string | null;
}

export async function fetchArticleMeta(slug: string) {
  try {
    const { data } = await supabaseAnon
      .from("articles")
      .select("title, excerpt, content, author_name, created_at, updated_at")
      .ilike("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    return (data as ArticleRow) || null;
  } catch {
    return null;
  }
}

export function articleMetadata(
  slug: string,
  a: ArticleRow | null,
  path = `/artikel/${slug}`
): Metadata {
  if (!a) {
    return {
      title: "Artikel Tidak Ditemukan",
      robots: { index: false, follow: true }
    };
  }
  const description = a.excerpt?.trim() || stripHtml(a.content);
  return {
    title: a.title,
    description,
    alternates: { canonical: `${BASE}${path}` },
    openGraph: {
      title: a.title,
      description,
      type: "article",
      url: `${BASE}${path}`,
      publishedTime: a.created_at,
      modifiedTime: a.updated_at || a.created_at,
      authors: [a.author_name || "Redaksi"],
      siteName: SITE
    }
  };
}

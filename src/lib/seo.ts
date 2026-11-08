import type { Metadata } from "next";
import { supabaseAnon } from "@/lib/supabase/server";

const BASE = "https://mahadaly-ddimangkoso.my.id";
const SITE = "Ma'had Aly DDI Mangkoso";

// Gambar pratinjau tautan (og:image) untuk SEMUA halaman baca:
// logo situs, sesuai ketetapan user 9 Nov 2026 (logo saja, bukan foto
// sampul tulisan), supaya kartu pratinjau WhatsApp selalu berlogo dan
// tidak tampak seperti tautan phishing. Berkasnya og-logo.jpg: logo di
// atas latar putih padat 1200x630 TANPA transparansi. Berkas logo asli
// (image_067524.png) adalah PNG palet bertransparansi penuh di sudut
// dan perayap pratinjau WhatsApp mengabaikan gambar seperti itu
// (terbukti 9 Nov 2026: kartu teks muncul, gambar tidak, bahkan pada
// tautan segar), jadi pratinjau memakai berkas turunan yang padat ini.
export const OG_LOGO_URL = `${BASE}/og-logo.jpg`;
export const OG_LOGO_IMAGE = {
  url: OG_LOGO_URL,
  secureUrl: OG_LOGO_URL,
  width: 1200,
  height: 630,
  alt: SITE
};

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

/**
 * Cek keberadaan slug di tabel konten (sisi server, untuk status 404
 * sungguhan pada halaman detail). Mengembalikan:
 *  - true  → slug ditemukan
 *  - false → kueri BERHASIL dan slug pasti tidak ada
 *  - null  → tidak bisa dipastikan (DB error) — pemanggil JANGAN 404-kan,
 *            biarkan komponen klien yang memutuskan seperti sebelumnya.
 */
export async function slugExistsInTable(
  table: "articles" | "news" | "theses" | "categories",
  slug: string
): Promise<boolean | null> {
  try {
    const bySlug = await supabaseAnon.from(table).select("slug").ilike("slug", slug).maybeSingle();
    if (bySlug.error) return null;
    if (bySlug.data) return true;
    // Halaman klien juga menerima kecocokan via id langsung — tetapi kolom
    // id bertipe uuid: menanyakannya dengan string bukan-uuid membuat
    // PostgREST membalas error (yang akan terbaca sebagai "tidak pasti").
    // Jadi kueri id hanya dijalankan bila slug memang berbentuk uuid;
    // selain itu ketiadaan slug sudah pasti.
    const looksUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    if (!looksUuid) return false;
    const byId = await supabaseAnon.from(table).select("slug").eq("id", slug).maybeSingle();
    if (byId.error) return null;
    return Boolean(byId.data);
  } catch {
    return null;
  }
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
      siteName: SITE,
      images: [OG_LOGO_IMAGE]
    }
  };
}

/** Ambil judul baris konten apa pun berdasarkan slug (untuk metadata). */
export async function fetchRowTitle(
  table: "news" | "theses" | "categories",
  slug: string
): Promise<string | null> {
  try {
    // Skema memakai nama kolom Bahasa Indonesia untuk dua tabel ini.
    const field = table === "categories" ? "nama" : "judul";
    const { data } = await supabaseAnon
      .from(table)
      .select(field)
      .ilike("slug", slug)
      .maybeSingle();
    const row = data as unknown as Record<string, string> | null;
    return row?.[field] || null;
  } catch {
    return null;
  }
}

/** Metadata sederhana berisi judul + canonical untuk halaman detail. */
export function simpleDetailMetadata(title: string | null, path: string, fallbackTitle: string): Metadata {
  if (!title) {
    return { title: fallbackTitle, alternates: { canonical: `${BASE}${path}` } };
  }
  return { title, alternates: { canonical: `${BASE}${path}` } };
}

import { supabaseAnon } from "@/lib/supabase/server";

export const revalidate = 1800; // RSS segar tiap 30 menit

function escapeXml(s: string): string {
  return (s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(request: Request) {
  const baseUrl = "https://mahadaly-ddimangkoso.my.id";
  const siteName = "Ma'had Aly DDI Mangkoso";

  let items = "";
  try {
    const [art, news] = await Promise.all([
      supabaseAnon
        .from("articles")
        .select("title, slug, excerpt, author_name, created_at")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(20),
      supabaseAnon
        .from("news")
        .select("judul, slug, konten, tipe, tanggal, created_at")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(20)
    ]);

    for (const a of art.data || []) {
      items += `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${baseUrl}/artikel/${a.slug}</link>
      <guid isPermaLink="true">${baseUrl}/artikel/${a.slug}</guid>
      <description>${escapeXml(a.excerpt || "")}</description>
      <author>${escapeXml(a.author_name || "Redaksi")}</author>
      <pubDate>${new Date(a.created_at).toUTCString()}</pubDate>
    </item>\n`;
    }
    for (const n of news.data || []) {
      items += `    <item>
      <title>${escapeXml(n.judul)}</title>
      <link>${baseUrl}/berita/${n.slug}</link>
      <guid isPermaLink="true">${baseUrl}/berita/${n.slug}</guid>
      <description>${escapeXml((n.konten || "").slice(0, 300))}</description>
      <category>${escapeXml(n.tipe || "Berita")}</category>
      <pubDate>${new Date(n.created_at).toUTCString()}</pubDate>
    </item>\n`;
    }
  } catch {
    // Feed tetap valid (kosong) bila DB tidak terjangkau
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteName)} — Kajian Fiqh Mu'asarah &amp; Warta</title>
    <link>${baseUrl}</link>
    <description>Kumpulan kajian fiqh mu'asarah, fatwa kontemporer, dan warta resmi ${escapeXml(siteName)}.</description>
    <language>id</language>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
${items}  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=1800, s-maxage=1800"
    }
  });
}

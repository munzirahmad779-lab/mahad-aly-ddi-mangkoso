import { NextRequest } from "next/server";
import { daftarTerbitanPublik } from "@/lib/jurnal/alur-server";
import { HALAMAN_KEBIJAKAN } from "@/lib/jurnal/kebijakan";
import { JURNAL_BAGIAN } from "@/lib/jurnal/wizard";

// Sitemap jurnal (Tahap 5): hanya URL etalase jurnal sendiri, yaitu
// halaman jurnal, halaman kebijakan, jelajah bagian, terbitan
// published, dan artikel published. Satu URL per artikel dengan
// canonical ke diri sendiri; DOI menunjuk halaman artikel yang sama.

export const dynamic = "force-dynamic";

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(req: NextRequest) {
  const asal = req.nextUrl.origin;
  const terbitan = await daftarTerbitanPublik();
  const entri: { url: string; lastmod?: string }[] = [
    { url: `${asal}/jurnal` },
    { url: `${asal}/jurnal/cari` },
    { url: `${asal}/jurnal/pengumuman` },
    ...HALAMAN_KEBIJAKAN.map((h) => ({
      url: `${asal}/jurnal/halaman/${h.slug}`
    })),
    ...JURNAL_BAGIAN.map((b) => ({ url: `${asal}/jurnal/bagian/${b.slug}` }))
  ];
  for (const t of terbitan) {
    entri.push({
      url: `${asal}/jurnal/terbitan/${t.slug}`,
      lastmod: t.tanggalTerbit?.slice(0, 10)
    });
    for (const a of t.artikel) {
      entri.push({
        url: `${asal}/jurnal/artikel/${a.slug}`,
        lastmod: a.tanggalTerbit.slice(0, 10)
      });
    }
  }
  const isi = entri
    .map(
      (e) =>
        `  <url>\n    <loc>${xmlEscape(e.url)}</loc>${e.lastmod ? `\n    <lastmod>${e.lastmod}</lastmod>` : ""}\n  </url>`
    )
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${isi}\n</urlset>\n`;
  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" }
  });
}

import { MetadataRoute } from "next";
import { supabaseAnon } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://mahadaly-ddimangkoso.my.id";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/profil`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/akademik`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/artikel`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/berita`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/pmb`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/bahtsul-masail`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/skripsi`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/jurnal`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/elibrary`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/donasi`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/dema`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/kirim-tulisan`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/kontak`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/warta`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/opini`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  ];

  // Ambil artikel dari Supabase. Bila kueri gagal, seksi ini KOSONG —
  // jangan pernah jatuh ke data contoh (mock): sitemap yang mengiklankan
  // konten contoh menyesatkan crawler dan pengunjung.
  let articles: any[] = [];
  try {
    const { data, error } = await supabaseAnon
      .from("articles")
      .select("slug, updated_at, created_at, status")
      .eq("status", "published");
    if (error) throw error;
    if (data) {
      articles = data.map((item: any) => ({
        slug: item.slug,
        updatedAt: item.updated_at,
        createdAt: item.created_at,
      })) as any;
    }
  } catch (error) {
    console.error("Error fetching articles for sitemap:", error);
  }

  const articleRoutes: MetadataRoute.Sitemap = articles.map((article: any) => ({
    url: `${baseUrl}/artikel/${article.slug}`,
    lastModified: new Date(article.updatedAt || article.publishedAt || article.createdAt || new Date()),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Tabel news TIDAK punya kolom updated_at — memilihnya membuat kueri
  // gagal total (PostgREST 42703) dan dulu diam-diam jatuh ke data contoh.
  let newsList: any[] = [];
  try {
    const { data, error } = await supabaseAnon
      .from("news")
      .select("slug, created_at, status")
      .eq("status", "published");
    if (error) throw error;
    if (data) {
      newsList = data.map((item: any) => ({
        slug: item.slug,
        createdAt: item.created_at,
      })) as any;
    }
  } catch (error) {
    console.error("Error fetching news for sitemap:", error);
  }

  const newsRoutes: MetadataRoute.Sitemap = newsList.map((news: any) => ({
    url: `${baseUrl}/berita/${news.slug}`,
    lastModified: new Date(news.publishedAt || news.createdAt || new Date()),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Skripsi (repositori) — tabel theses juga tanpa updated_at (lihat news).
  let theses: any[] = [];
  try {
    const { data, error } = await supabaseAnon
      .from("theses")
      .select("slug, created_at, status")
      .eq("status", "published");
    if (error) throw error;
    if (data) {
      theses = data.map((item: any) => ({
        slug: item.slug,
        createdAt: item.created_at,
      })) as any;
    }
  } catch (error) {
    console.error("Error fetching theses for sitemap:", error);
  }

  const thesisRoutes: MetadataRoute.Sitemap = theses.map((t: any) => ({
    url: `${baseUrl}/skripsi/${t.slug}`,
    lastModified: new Date(t.createdAt || new Date()),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // Kategori kajian — tabel categories tanpa updated_at & created_at.
  let cats: any[] = [];
  try {
    const { data, error } = await supabaseAnon
      .from("categories")
      .select("slug, is_published");
    if (error) throw error;
    if (data) {
      cats = data.filter((c: any) => c.is_published !== false).map((item: any) => ({
        slug: item.slug,
      })) as any;
    }
  } catch (error) {
    console.error("Error fetching categories for sitemap:", error);
  }

  const categoryRoutes: MetadataRoute.Sitemap = cats.map((c: any) => ({
    url: `${baseUrl}/kategori/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...articleRoutes, ...newsRoutes, ...thesisRoutes, ...categoryRoutes];
}

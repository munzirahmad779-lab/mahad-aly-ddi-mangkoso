import { MetadataRoute } from "next";
import { INITIAL_ARTICLES, INITIAL_NEWS } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase/client";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://mahadaly-ddimangkoso.my.id";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/profil`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/profil/sejarah`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/profil/visi-misi`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/profil/struktur`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/profil/fasilitas`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/profil/sanad-keilmuan`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/akademik`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/artikel`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/berita`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/pmb`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/bahtsul-masail`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/skripsi`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/jurnal`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/elibrary`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/donasi`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/kirim-tulisan`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/kontak`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/warta`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/opini`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  ];

  // Try fetching latest articles from Supabase, fallback to INITIAL_ARTICLES
  let articles = INITIAL_ARTICLES;
  try {
    const { data } = await supabase
      .from("articles")
      .select("slug, updated_at, created_at, status")
      .eq("status", "published");
    if (data && data.length > 0) {
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

  // Try fetching latest news from Supabase, fallback to INITIAL_NEWS
  let newsList = INITIAL_NEWS;
  try {
    const { data } = await supabase
      .from("news")
      .select("slug, updated_at, created_at, status")
      .eq("status", "published");
    if (data && data.length > 0) {
      newsList = data.map((item: any) => ({
        slug: item.slug,
        updatedAt: item.updated_at,
        createdAt: item.created_at,
      })) as any;
    }
  } catch (error) {
    console.error("Error fetching news for sitemap:", error);
  }

  const newsRoutes: MetadataRoute.Sitemap = newsList.map((news: any) => ({
    url: `${baseUrl}/berita/${news.slug}`,
    lastModified: new Date(news.updatedAt || news.publishedAt || news.createdAt || new Date()),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...articleRoutes, ...newsRoutes];
}

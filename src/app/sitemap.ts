import { MetadataRoute } from "next";
import { supabaseAnon } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://mahadaly-ddimangkoso.my.id";

  // Halaman statis SENGAJA tanpa lastModified: dulu diisi new Date()
  // sehingga semua URL mengaku "baru saja diubah" setiap sitemap dibuka —
  // Google belajar mengabaikan sitemap yang tidak jujur seperti itu.
  // lastmod hanya diisi dari tanggal basis data yang nyata (artikel/
  // berita/skripsi). Perbaikan 28 Okt 2026.
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/profil`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/akademik`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/artikel`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/berita`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/pmb`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/bahtsul-masail`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/skripsi`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/jurnal`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/elibrary`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/donasi`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/dema`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/kirim-tulisan`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/kontak`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/warta`, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/opini`, changeFrequency: "weekly", priority: 0.8 },
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

  const articleRoutes: MetadataRoute.Sitemap = articles.map((article: any) => {
    const tgl = article.updatedAt || article.createdAt;
    return {
      url: `${baseUrl}/artikel/${article.slug}`,
      ...(tgl ? { lastModified: new Date(tgl) } : {}),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    };
  });

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

  const newsRoutes: MetadataRoute.Sitemap = newsList.map((news: any) => {
    const tgl = news.createdAt;
    return {
      url: `${baseUrl}/berita/${news.slug}`,
      ...(tgl ? { lastModified: new Date(tgl) } : {}),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    };
  });

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

  const thesisRoutes: MetadataRoute.Sitemap = theses.map((t: any) => {
    const tgl = t.createdAt;
    return {
      url: `${baseUrl}/skripsi/${t.slug}`,
      ...(tgl ? { lastModified: new Date(tgl) } : {}),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    };
  });

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

  // Kategori tidak punya kolom tanggal yang bisa dipercaya — lastmod
  // SENGAJA dikosongkan. Cap "baru saja diubah" palsu membuat Google
  // mengabaikan sitemap (perbaikan 28 Okt 2026).
  const categoryRoutes: MetadataRoute.Sitemap = cats.map((c: any) => ({
    url: `${baseUrl}/kategori/${c.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...articleRoutes, ...newsRoutes, ...thesisRoutes, ...categoryRoutes];
}

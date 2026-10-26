import { formatHijriShort } from "@/lib/hijri-calendar";

// Mapper data dari tabel Supabase → tipe aplikasi.
// Dipakai RootLayout (SSR seed agar tidak ada kedipan konten) — murni fungsi,
// tanpa akses browser. Tanggal memakai timezone Asia/Makassar secara eksplisit
// agar hasil format identik di server maupun browser.

export function tanggalIndoId(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Makassar"
    });
  } catch {
    return "";
  }
}

export function mapDbArticles(rows: any[]): any[] {
  return (rows || []).map((a: any) => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt || "",
    content: a.content,
    author: a.author_name || "Redaksi",
    authorRole: a.author_role || "Mahasantri Marhalah Ula",
    authorBio: "",
    category: a.category_id || "fiqh-muamalah-kontemporer",
    categoryLabel: "Fiqh Mu'asarah",
    date: tanggalIndoId(a.created_at),
    hijriDate: formatHijriShort(a.created_at ? new Date(a.created_at) : new Date()),
    readTime: "5 menit",
    views: a.views || 0,
    tags: a.tags || []
  }));
}

export function mapDbTheses(rows: any[]): any[] {
  return (rows || []).map((t: any) => ({
    id: t.id,
    slug: t.slug,
    title: t.judul,
    author: t.penulis,
    nim: t.nim,
    angkatan: t.angkatan,
    year: t.tahun,
    advisor1: t.pembimbing_1,
    advisor2: t.pembimbing_2,
    abstractId: t.abstrak_id || "",
    abstractAr: t.abstrak_ar || "",
    keywords: t.keyword || [],
    category: "Fiqh Mu'asarah",
    categoryLabel: "Fiqh Mu'asarah",
    downloadUrl: t.pdf_url || "",
    fileSize: t.pdf_size_mb || "3.5 MB"
  }));
}

export function mapDbCategories(rows: any[]): any[] {
  return (rows || []).map((c: any) => {
    const isOpini =
      c.type === "opini" ||
      c.slug?.startsWith("opini-") ||
      c.slug?.startsWith("refleksi-") ||
      c.slug?.startsWith("kolom-") ||
      c.slug?.startsWith("sosial-");
    return {
      id: c.id,
      slug: c.slug,
      name: c.nama,
      description: c.deskripsi || "",
      iconName: c.icon || "book",
      type: isOpini ? ("opini" as const) : ("artikel" as const)
    };
  });
}

export function mapDbNews(rows: any[]): any[] {
  return (rows || []).map((n: any) => ({
    id: n.id,
    slug: n.slug,
    title: n.judul,
    excerpt: n.konten ? n.konten.slice(0, 120) + "..." : "",
    content: n.konten,
    category: n.tipe || "Berita",
    author: "Humas Ma'had Aly",
    date: n.tanggal || tanggalIndoId(n.created_at),
    imageUrl: n.gambar_url
  }));
}

export function mapDbCollections(rows: any[]): {
  lecturers: any[];
  facilities: any[];
} {
  const rowsSafe = rows || [];
  const lecturers = rowsSafe
    .filter((c: any) => c.collection_type === "masyayikh")
    .map((c: any, idx: number) => ({
      id: c.id,
      name: c.data?.name || "Nama Dosen",
      title: c.data?.title || "",
      role: c.data?.role || "Dosen Pengampu",
      photoUrl: c.data?.photoUrl || "",
      expertise: c.data?.expertise || "",
      education: Array.isArray(c.data?.education)
        ? c.data.education
        : typeof c.data?.education === "string" && c.data.education.trim().length > 0
        ? c.data.education.split(/•|â€¢/).map((s: string) => s.trim()).filter(Boolean)
        : [],
      publications: Array.isArray(c.data?.publications)
        ? c.data.publications
        : typeof c.data?.publications === "string" && c.data.publications.trim().length > 0
        ? c.data.publications.split(/•|â€¢/).map((s: string) => s.trim()).filter(Boolean)
        : [],
      order: idx + 1,
      isActive: c.data?.isActive !== false
    }));
  const facilities = rowsSafe
    .filter((c: any) => c.collection_type === "sarana")
    .map((c: any) => ({
      id: c.id,
      name: c.data?.name || "Nama Fasilitas",
      category: c.data?.category || "Masjid",
      photoUrl: c.data?.photoUrl || "",
      description: c.data?.description || "",
      capacity: c.data?.capacity,
      specs: c.data?.specs
    }));
  return { lecturers, facilities };
}

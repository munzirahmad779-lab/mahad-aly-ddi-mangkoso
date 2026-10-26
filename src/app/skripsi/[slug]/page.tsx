import { notFound } from "next/navigation";
import { slugExistsInTable } from "@/lib/seo";
import DetailClient from "./detail-client";

interface Props {
  params: Promise<{ slug: string }>;
}

// Pembungkus server: pastikan slug benar-benar ada di database sebelum
// merender komponen klien, agar URL skripsi yang tidak ada membalas
// HTTP 404 sungguhan (bukan soft-404 berstatus 200). Bila DB tidak bisa
// dipastikan (error), halaman tetap dirender dan klien yang memutuskan.
export default async function SkripsiDetailPage({ params }: Props) {
  const { slug } = await params;
  const cleanSlug = decodeURIComponent(slug || "").toLowerCase().trim();
  const exists = await slugExistsInTable("theses", cleanSlug);
  if (exists === false) {
    notFound();
  }
  return <DetailClient params={params} />;
}

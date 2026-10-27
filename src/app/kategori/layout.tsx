import type { Metadata } from "next";
import type { ReactNode } from "react";

// Judul unik + canonical per bagian (sebelumnya semua halaman memakai
// judul bawaan root dan tanpa canonical, temuan audit 27 Okt 2026).
export const metadata: Metadata = {
  title: "Kategori Kajian",
  alternates: { canonical: "/kategori" }
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}

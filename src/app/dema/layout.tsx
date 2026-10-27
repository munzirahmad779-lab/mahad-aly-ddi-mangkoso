import type { Metadata } from "next";
import type { ReactNode } from "react";

// Judul unik + canonical per bagian (sebelumnya semua halaman memakai
// judul bawaan root dan tanpa canonical, temuan audit 27 Okt 2026).
export const metadata: Metadata = {
  title: "Dewan Mahasantri (DeMa)",
  alternates: { canonical: "/dema" }
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}

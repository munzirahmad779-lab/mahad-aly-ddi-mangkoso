import type { Metadata } from "next";
import type { ReactNode } from "react";

// Judul unik + canonical per bagian (temuan audit 27 Okt 2026).
export const metadata: Metadata = {
  title: "Buku & Karya Tulis",
  alternates: { canonical: "/buku" }
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}

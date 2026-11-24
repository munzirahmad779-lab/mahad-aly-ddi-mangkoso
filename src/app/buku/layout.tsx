import type { Metadata } from "next";
import type { ReactNode } from "react";

// Canonical per bagian (temuan audit 27 Okt 2026). Judul TIDAK
// didefinisikan di sini: page.tsx rute ini mempunyai judulnya sendiri
// ("Penerbitan Buku & Risalah") yang selalu menang, sehingga judul
// layout hanya menjadi kode mati yang menyesatkan perawat.
export const metadata: Metadata = {
  alternates: { canonical: "/buku" }
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}

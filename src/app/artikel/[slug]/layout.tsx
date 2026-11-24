import type { ReactNode } from "react";

// Metadata per-artikel (title, description, canonical, OpenGraph) hanya
// dibuat satu kali di page.tsx segmen ini lewat generateMetadata.
// Sebelumnya layout ini mengekspor generateMetadata yang sama persis,
// sehingga setiap permintaan menjalankan pengambilan metadata yang sama
// dua kali. Layout di sini hanya meneruskan children.
export default function ArtikelLayout({ children }: { children: ReactNode }) {
  return children;
}

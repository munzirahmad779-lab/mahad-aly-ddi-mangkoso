import type { ReactNode } from "react";

// Metadata per-berita hanya dibuat satu kali di page.tsx segmen ini
// lewat generateMetadata. Sebelumnya layout ini dan page sama-sama
// membangun metadata untuk rute yang sama (dua kueri basis data per
// permintaan, canonical versi slug mentah dari layout bersaing dengan
// canonical slug bersih dari page). Layout di sini hanya meneruskan
// children.
export default function BeritaLayout({ children }: { children: ReactNode }) {
  return children;
}

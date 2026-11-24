import type { ReactNode } from "react";

// Metadata per-risalah hanya dibuat satu kali di page.tsx segmen ini
// lewat generateMetadata. Sebelumnya layout ini dan page sama-sama
// mengambil data dan membangun metadata untuk rute yang sama (dua kueri
// basis data dan dua sumber metadata bersaing). Layout di sini hanya
// meneruskan children.
export default function SkripsiLayout({ children }: { children: ReactNode }) {
  return children;
}

import type { Metadata } from "next";
import type { ReactNode } from "react";

// Judul unik + canonical untuk laman khusus Open Tulisan Hari Guru.
export const metadata: Metadata = {
  title: "Open Tulisan Hari Guru",
  description:
    "Kumpulan tulisan refleksi mahasantri dalam memperingati Hari Guru. Pilih nama penulis untuk membaca karyanya.",
  alternates: { canonical: "/hari-guru" }
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}

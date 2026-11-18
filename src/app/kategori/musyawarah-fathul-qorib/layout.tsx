import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Musyawarah Fathul Qorib",
  description:
    "Ruang hasil Musyawarah Fathul Qorib Ma'had Aly DDI Mangkoso: pembacaan dan pembahasan kitab Fathul Qorib dalam musyawarah rutin, diterbitkan sebagai tulisan tersendiri.",
  alternates: { canonical: "/kategori/musyawarah-fathul-qorib" }
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}

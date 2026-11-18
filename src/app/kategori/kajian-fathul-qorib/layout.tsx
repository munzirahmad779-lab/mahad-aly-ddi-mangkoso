import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Kajian Fathul Qorib",
  description:
    "Ruang hasil Kajian Fathul Qorib Ma'had Aly DDI Mangkoso: pembacaan dan pembahasan kitab Fathul Qorib dalam kajian rutin, diterbitkan sebagai tulisan tersendiri.",
  alternates: { canonical: "/kategori/kajian-fathul-qorib" }
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}

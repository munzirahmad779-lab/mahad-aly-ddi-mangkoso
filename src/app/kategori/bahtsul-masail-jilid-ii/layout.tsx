import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Hasil Bahtsul Masa'il Jilid II",
  description:
    "Ketetapan resmi Bahtsul Masa'il Jilid II Ma'had Aly DDI Mangkoso: empat masail yang dibahas dan ditetapkan, dapat dibaca langsung di web dan diunduh dokumen resminya.",
  alternates: { canonical: "/bahtsul-masail/jilid-ii" }
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}

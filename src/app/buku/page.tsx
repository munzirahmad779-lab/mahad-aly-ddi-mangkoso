import type { Metadata } from "next";
import ComingSoon from "@/components/common/ComingSoon";

export const metadata: Metadata = {
  title: "Penerbitan Buku & Risalah",
  description: "Katalog buku, manuskrip turats, dan risalah fatwa karya masyaikh dan mahasantri."
};

export default function BukuPage() {
  return (
    <ComingSoon
      badge="Penerbitan &amp; Percetakan"
      title="Buku &amp; Risalah DDI Mangkoso Press"
      description="Katalog publikasi cetak dan digital risalah fatwa, syarah kitab thurats, serta bunga rampai pemikiran ulama DDI Mangkoso."
    />
  );
}

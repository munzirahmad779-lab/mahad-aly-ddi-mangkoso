import ComingSoon from "@/components/common/ComingSoon";

export const metadata = {
  title: "e-Library Turats Digital",
  description: "Perpustakaan digital kitab kuning dan manuskrip Islam klasik.",
  alternates: { canonical: "/elibrary" }
};

export default function ELibraryPage() {
  return (
    <ComingSoon
      badge="Perpustakaan Digital"
      title="e-Library Maktabah Turats DDI"
      description="Layanan katalog online dan digitalisasi naskah kuno manuskrip Gurutta Ambo Dalle serta referensi kutubut turats salaf."
    />
  );
}

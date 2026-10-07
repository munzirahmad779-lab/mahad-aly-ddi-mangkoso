"use client";

import Hero from "@/components/home/Hero";
import QuoteSection from "@/components/home/QuoteSection";
import AboutPreview from "@/components/home/AboutPreview";
import StudyCategories from "@/components/home/StudyCategories";
import LatestArticles from "@/components/home/LatestArticles";
import LatestTheses from "@/components/home/LatestTheses";
import LatestNews from "@/components/home/LatestNews";
import { useArticles } from "@/context/ArticleContext";

export default function HomePage() {
  const { homeSections } = useArticles();

  // Sort active sections
  const activeSections = [...(homeSections || [])]
    .filter((sec) => sec.isActive !== false)
    .sort((a, b) => a.order - b.order);

  const renderSection = (name: string, id: string) => {
    switch (name) {
      case "hero":
        return <Hero key={id} />;
      case "quote":
      case "kalam_hikmah":
        return <QuoteSection key={id} />;
      case "about":
      case "profil_singkat":
        return <AboutPreview key={id} />;
      case "categories":
      case "kategori_kajian":
        return <StudyCategories key={id} />;
      case "articles":
      case "artikel_terbaru":
        return <LatestArticles key={id} />;
      case "theses":
      case "skripsi_terbaru":
        return <LatestTheses key={id} />;
      case "news":
      case "warta_terbaru":
        return <LatestNews key={id} />;
      default:
        return null;
    }
  };

  return (
    <main>
      {activeSections.length > 0 ? (
        activeSections.map((sec) => renderSection(sec.name, sec.id))
      ) : (
        <>
          <Hero />
          <QuoteSection />
          <AboutPreview />
          <StudyCategories />
          <LatestArticles />
          <LatestTheses />
          <LatestNews />
        </>
      )}
    </main>
  );
}
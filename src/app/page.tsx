"use client";

import Hero from "@/components/home/Hero";
import QuoteSection from "@/components/home/QuoteSection";
import AboutPreview from "@/components/home/AboutPreview";
import StudyCategories from "@/components/home/StudyCategories";
import LatestArticles from "@/components/home/LatestArticles";
import LatestTheses from "@/components/home/LatestTheses";
import LatestNews from "@/components/home/LatestNews";
import {
  HomeDonationSection,
  HomeBahtsulSection,
  HomePMBSection,
  HomeSubmissionSection,
  HomeMasyayikhSection,
  HomeCustomSection
} from "@/components/home/HomeDynamicSections";
import { useArticles } from "@/context/ArticleContext";
import { HomeSectionConfigItem } from "@/lib/types";

export default function HomePage() {
  const { homeSections } = useArticles();

  // Sort active sections
  const activeSections = [...(homeSections || [])]
    .filter((sec) => sec.isActive !== false)
    .sort((a, b) => a.order - b.order);

  const renderSection = (sec: HomeSectionConfigItem) => {
    const name = sec.name?.toLowerCase() || "";
    switch (name) {
      case "hero":
        return <Hero key={sec.id} />;
      case "quote":
      case "kalam_hikmah":
        return <QuoteSection key={sec.id} />;
      case "about":
      case "profil_singkat":
        return <AboutPreview key={sec.id} />;
      case "categories":
      case "kategori_kajian":
        return <StudyCategories key={sec.id} />;
      case "articles":
      case "artikel_terbaru":
        return <LatestArticles key={sec.id} />;
      case "theses":
      case "skripsi_terbaru":
        return <LatestTheses key={sec.id} />;
      case "donasi":
      case "donations":
      case "infaq":
        return <HomeDonationSection key={sec.id} section={sec} />;
      case "bahtsul":
      case "bahtsul_masail":
        return <HomeBahtsulSection key={sec.id} section={sec} />;
      case "pmb":
      case "pmb_online":
        return <HomePMBSection key={sec.id} section={sec} />;
      case "submission":
      case "kirim_tulisan":
        return <HomeSubmissionSection key={sec.id} section={sec} />;
      case "masyayikh":
      case "dosen":
        return <HomeMasyayikhSection key={sec.id} section={sec} />;
      case "news":
      case "warta_terbaru":
        return <LatestNews key={sec.id} />;
      default:
        // Any custom / banner / user added section
        return <HomeCustomSection key={sec.id} section={sec} />;
    }
  };

  return (
    <main>
      {activeSections.length > 0 ? (
        activeSections.map((sec) => renderSection(sec))
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
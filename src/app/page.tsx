import Hero from "@/components/home/Hero";
import QuoteSection from "@/components/home/QuoteSection";
import AboutPreview from "@/components/home/AboutPreview";
import StudyCategories from "@/components/home/StudyCategories";
import LatestArticles from "@/components/home/LatestArticles";
import LatestTheses from "@/components/home/LatestTheses";
import LatestNews from "@/components/home/LatestNews";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <QuoteSection />
      <AboutPreview />
      <StudyCategories />
      <LatestArticles />
      <LatestTheses />
      <LatestNews />
    </main>
  );
}
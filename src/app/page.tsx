import Hero from "@/components/home/Hero";
import QuoteSection from "@/components/home/QuoteSection";
import AboutPreview from "@/components/home/AboutPreview";
import StudyCategories from "@/components/home/StudyCategories";
import LatestArticles from "@/components/home/LatestArticles";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <QuoteSection />
      <AboutPreview />
      <StudyCategories />
      <LatestArticles />
    </main>
  );
}
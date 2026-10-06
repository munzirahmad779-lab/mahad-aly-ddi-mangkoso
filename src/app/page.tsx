import Hero from "@/components/home/Hero";
import QuoteSection from "@/components/home/QuoteSection";
import AboutPreview from "@/components/home/AboutPreview";
import StudyCategories from "@/components/home/StudyCategories";
import LatestArticles from "@/components/home/LatestArticles";
import { ARTICLES } from "@/lib/mock-data";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <QuoteSection />
      <AboutPreview />
      <StudyCategories />
      <LatestArticles articles={ARTICLES} />
    </main>
  );
}
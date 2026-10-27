"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import NumberTicker from "@/components/common/NumberTicker";
import Image from "next/image";
import Link from "next/link";
import { useArticles } from "@/context/ArticleContext";
import { INITIAL_HERO_SETTINGS } from "@/lib/mock-data";
import { HeroSlideItem } from "@/lib/types";

export default function Hero() {
  const { heroSettings } = useArticles();

  const logoSrc = heroSettings?.logoUrl || "/image_067524.png";
  const metrics = heroSettings?.metrics || INITIAL_HERO_SETTINGS.metrics;

  // Active Slides Array (from context or initial fallback)
  const rawSlides: HeroSlideItem[] =
    heroSettings?.slides && heroSettings.slides.length > 0
      ? heroSettings.slides
      : INITIAL_HERO_SETTINGS.slides || [];

  const slides = rawSlides
    .filter((s) => s.isActive !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  // Fallback single slide if slides list is completely empty
  const defaultSlide: HeroSlideItem = {
    id: "default-slide",
    title: heroSettings?.title || "Pendidikan Tinggi Kader Ulama",
    titleHighlight: heroSettings?.titleHighlight || "",
    subtitle:
      heroSettings?.subtitle ||
      "Pusat kaderisasi ulama berwawasan wasathiyyah, berakar kuat pada tradisi sanad dan khazanah kitab klasik (Turats), serta berakhlakul karimah untuk kemaslahatan umat.",
    arabicBismillah: heroSettings?.arabicBismillah || "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    cta1Text: heroSettings?.cta1Text || "Kenali Ma'had",
    cta1Url: heroSettings?.cta1Url || "/tentang",
    cta2Text: heroSettings?.cta2Text || "Baca Mimbar Kajian",
    cta2Url: heroSettings?.cta2Url || "/artikel"
  };

  const activeSlides = slides.length > 0 ? slides : [defaultSlide];

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
  }, [activeSlides.length]);

  // Auto-play interval timer for smooth background text transitions (if > 1 slide)
  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const intervalTime = heroSettings?.autoPlayInterval || 6000;
    const timer = setInterval(() => {
      nextSlide();
    }, intervalTime);
    return () => clearInterval(timer);
  }, [activeSlides.length, heroSettings?.autoPlayInterval, nextSlide]);

  const currentSlide = activeSlides[currentIndex] || defaultSlide;

  // Parallax latar hero (redesign Fase 1): lapisan latar bergeser lebih
  // lambat daripada scroll. Hanya transform yang dianimasikan Motion.
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "16%"]);

  // Judul tampil per kata (efek SplitText ala Magic UI/React Bits)
  const titleWords = (currentSlide.title || "").split(/\s+/).filter(Boolean);
  const highlightWords = (currentSlide.titleHighlight || "")
    .split(/\s+/)
    .filter(Boolean);
  const wordReveal = (delay: number) => ({
    initial: { y: "110%" },
    animate: { y: 0 },
    transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <section ref={heroRef} className="relative pt-40 pb-20 md:pt-48 md:pb-28 bg-mahad-green-dark text-white overflow-hidden flex items-center min-h-[90vh] select-none">
      {/* Lapisan latar parallax: pola Islami + gambar slide aktif */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 scale-[1.15] pointer-events-none">
        <div className="absolute inset-0 bg-islamic-pattern opacity-60"></div>
        {currentSlide.bgImageUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25 transition-opacity duration-700"
            style={{ backgroundImage: `url('${currentSlide.bgImageUrl}')` }}
          ></div>
        )}
      </motion.div>

      {/* Ambient Glow Effects */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 rounded-full bg-emerald-600/20 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-mahad-gold/15 blur-3xl pointer-events-none"></div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10 w-full">
        {/* Logo Ma'had Aly DDI Mangkoso (Clean Original View) */}
        <div className="inline-block relative mb-6">
          <div className="w-28 h-28 sm:w-36 sm:h-36 mx-auto relative drop-shadow-2xl hover:scale-105 transition-transform">
            <Image
              src={logoSrc}
              alt="Logo Ma'had Aly DDI Mangkoso"
              width={144}
              height={144}
              className="w-full h-full object-contain"
              priority
            />
          </div>
        </div>

        {/* Kaligrafi Basmalah / Motto */}
        {currentSlide.arabicBismillah && (
          <motion.div
            key={`basmalah-${currentSlide.id}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05, ease: "easeOut" }}
            className="font-serif text-mahad-gold text-2xl sm:text-3xl mb-5 tracking-wide"
            dir="rtl"
          >
            {currentSlide.arabicBismillah}
          </motion.div>
        )}

        {/* Judul Slide Utama & Subtitle */}
        <div key={currentSlide.id}>
          <h1 className="font-serif font-bold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight sm:leading-snug max-w-4xl mx-auto">
            {titleWords.map((word, i) => (
              <span key={`t-${i}`} className="inline-block overflow-hidden align-bottom pb-2 -mb-2">
                <motion.span className="inline-block will-change-transform" {...wordReveal(0.15 + i * 0.05)}>
                  {word}
                  {"\u00A0"}
                </motion.span>
              </span>
            ))}
            {highlightWords.length > 0 && (
              <span className="text-mahad-gold block sm:inline-block mt-1 sm:mt-0">
                {highlightWords.map((word, i) => (
                  <span key={`h-${i}`} className="inline-block overflow-hidden align-bottom pb-2 -mb-2">
                    <motion.span
                      className="inline-block will-change-transform"
                      {...wordReveal(0.15 + (titleWords.length + i) * 0.05)}
                    >
                      {word}
                      {"\u00A0"}
                    </motion.span>
                  </span>
                ))}
              </span>
            )}
          </h1>

          {/* Deskripsi Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45, ease: "easeOut" }}
            className="mt-5 max-w-3xl mx-auto text-base sm:text-lg lg:text-xl text-emerald-100/90 font-normal leading-relaxed"
          >
            {currentSlide.subtitle}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
            className="mt-9 flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            {currentSlide.cta1Text && (
              <Link
                href={currentSlide.cta1Url || "/artikel"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-mahad-gold hover:bg-yellow-400 text-mahad-green-dark font-bold px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <span>{currentSlide.cta1Text}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            )}
            {currentSlide.cta2Text && (
              <Link
                href={currentSlide.cta2Url || "/skripsi"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-2 border-mahad-gold text-mahad-gold hover:bg-mahad-gold hover:text-mahad-green-dark font-bold px-8 py-3.5 rounded-full transition-all duration-200"
              >
                <span>{currentSlide.cta2Text}</span>
              </Link>
            )}
          </motion.div>
        </div>

        {/* Dynamic Metrics Grid */}
        {metrics && metrics.length > 0 && (
          <div className="mt-14 pt-8 border-t border-emerald-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {metrics.map((m) => (
              <div key={m.id} className="p-3">
                <div className="font-serif font-bold text-2xl sm:text-3xl text-mahad-gold">
                  <NumberTicker value={m.value} />
                </div>
                <div className="text-xs text-emerald-200/80 mt-1 uppercase tracking-wider font-medium">
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
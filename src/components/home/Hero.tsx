"use client";

import { useState, useEffect, useCallback } from "react";
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
    badge: heroSettings?.badge || "Pusat Kaderisasi Fuqaha Kontemporer",
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
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
  }, [activeSlides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  }, [activeSlides.length]);

  // Auto-play interval timer
  useEffect(() => {
    if (isPaused || activeSlides.length <= 1) return;
    const intervalTime = heroSettings?.autoPlayInterval || 6000;
    const timer = setInterval(() => {
      nextSlide();
    }, intervalTime);
    return () => clearInterval(timer);
  }, [isPaused, activeSlides.length, heroSettings?.autoPlayInterval, nextSlide]);

  const currentSlide = activeSlides[currentIndex] || defaultSlide;

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative pt-40 pb-20 md:pt-48 md:pb-28 bg-mahad-green-dark text-white overflow-hidden flex items-center min-h-[92vh] select-none"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-islamic-pattern opacity-60 pointer-events-none"></div>

      {/* Ambient Glow Effects */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 rounded-full bg-emerald-600/20 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-mahad-gold/15 blur-3xl pointer-events-none"></div>

      {/* Optional Custom Background Image for active slide */}
      {currentSlide.bgImageUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25 transition-opacity duration-700 pointer-events-none"
          style={{ backgroundImage: `url('${currentSlide.bgImageUrl}')` }}
        ></div>
      )}

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10 w-full">
        {/* Logo Ma'had Aly */}
        <div className="inline-block relative mb-5">
          <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto relative drop-shadow-2xl hover:scale-105 transition-transform">
            <Image
              src={logoSrc}
              alt="Logo Ma'had Aly DDI Mangkoso"
              width={128}
              height={128}
              className="w-full h-full object-contain"
              priority
            />
          </div>
        </div>

        {/* Slide Counter & Badge */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {currentSlide.badge && (
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-emerald-500/40 text-mahad-gold text-xs font-semibold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
              <span className="w-2 h-2 rounded-full bg-mahad-gold animate-ping"></span>
              <span>{currentSlide.badge}</span>
            </span>
          )}
        </div>

        {/* Kaligrafi Basmalah / Motto */}
        {currentSlide.arabicBismillah && (
          <div className="font-serif text-mahad-gold text-2xl sm:text-3xl mb-4 tracking-wide transition-all duration-500" dir="rtl">
            {currentSlide.arabicBismillah}
          </div>
        )}

        {/* Judul Slide Utama (Animated Key Transition) */}
        <div key={currentSlide.id} className="animate-fadeIn">
          <h1 className="font-serif font-bold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight sm:leading-snug max-w-4xl mx-auto">
            {currentSlide.title}{" "}
            {currentSlide.titleHighlight && (
              <span className="text-mahad-gold block sm:inline-block mt-1 sm:mt-0">
                {currentSlide.titleHighlight}
              </span>
            )}
          </h1>

          {/* Deskripsi Subtitle */}
          <p className="mt-5 max-w-3xl mx-auto text-base sm:text-lg lg:text-xl text-emerald-100/90 font-normal leading-relaxed">
            {currentSlide.subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
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
          </div>
        </div>

        {/* Slide Carousel Controls (Only show if activeSlides > 1) */}
        {activeSlides.length > 1 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            {/* Prev Arrow */}
            <button
              type="button"
              onClick={prevSlide}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-mahad-gold hover:text-mahad-green-dark flex items-center justify-center transition border border-white/20"
              title="Slide Sebelumnya"
            >
              ‹
            </button>

            {/* Pagination Dots */}
            <div className="flex items-center gap-2">
              {activeSlides.map((s, idx) => (
                <button
                  key={s.id || idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`transition-all duration-300 rounded-full ${
                    currentIndex === idx
                      ? "w-8 h-2.5 bg-mahad-gold"
                      : "w-2.5 h-2.5 bg-white/30 hover:bg-white/60"
                  }`}
                  title={`Ke Slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Next Arrow */}
            <button
              type="button"
              onClick={nextSlide}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-mahad-gold hover:text-mahad-green-dark flex items-center justify-center transition border border-white/20"
              title="Slide Selanjutnya"
            >
              ›
            </button>
          </div>
        )}

        {/* Dynamic Metrics Repeater */}
        {metrics && metrics.length > 0 && (
          <div className="mt-12 pt-6 border-t border-emerald-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {metrics.map((m) => (
              <div key={m.id} className="p-2.5">
                <div className="font-serif font-bold text-2xl sm:text-3xl text-mahad-gold">{m.value}</div>
                <div className="text-[11px] text-emerald-200/80 mt-1 uppercase tracking-wider font-medium">
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
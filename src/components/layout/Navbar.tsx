"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useArticles } from "@/context/ArticleContext";
import { INITIAL_NAVBAR_SETTINGS } from "@/lib/mock-data";
import { NavbarLink } from "@/lib/types";
import { getRealtimeHijriDate } from "@/lib/hijri-calendar";

export default function Navbar() {
  const { categories, navbarSettings } = useArticles();
  const pathname = usePathname();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [desktopDropdown, setDesktopDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Header blur (Fase 3): setelah halaman di-scroll, latar navbar lebih
  // tembus cahaya + blur lebih kuat + bayangan lebih dalam.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const headerRef = useRef<HTMLElement>(null);

  const safeCategories = Array.isArray(categories) ? categories : [];
  const fiqhCategories = safeCategories.filter((c) => c.type !== "opini");
  const opiniCategories = safeCategories.filter((c) => c.type === "opini");

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => {
    setIsOpen(false);
    setActiveDropdown(null);
    setDesktopDropdown(null);
  };

  const toggleDropdown = (id: string) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const toggleDesktopDropdown = (id: string) => {
    setDesktopDropdown((prev) => (prev === id ? null : id));
  };

  // Close desktop dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setDesktopDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/artikel?q=${encodeURIComponent(searchQuery.trim())}`);
      closeMenu();
    }
  };

  // Automatic Real-Time Hijri Date (NU & Kemenag RI MABIMS Hisab/Rukyat)
  const [autoHijriDate, setAutoHijriDate] = useState<string>(() => {
    return getRealtimeHijriDate(new Date()).fullFormatted;
  });

  useEffect(() => {
    const res = getRealtimeHijriDate(new Date());
    setAutoHijriDate(res.fullFormatted);
  }, []);

  // Branding & Configuration from Context / Admin
  const logoUrl = navbarSettings?.logoUrl || "/image_067524.png";
  const brandTitle = navbarSettings?.brandTitle || "Ma'had Aly";
  const brandSubtitle = navbarSettings?.brandSubtitle || "DDI Mangkoso";

  // Tier 1: Top Bar Config
  const topBarConfig = navbarSettings?.topBar ?? INITIAL_NAVBAR_SETTINGS.topBar;
  const isTopBarActive = topBarConfig?.isActive !== false;
  const hotlinePhone = topBarConfig?.phone || "(0421) 510-123 • WA: 0812-4234-xxxx";
  const hotlineEmail = topBarConfig?.email || "redaksi@mahadaly-ddimangkoso.my.id";
  const quickLinkText = topBarConfig?.quickLinkText || "E-Library Turats";
  const quickLinkUrl = topBarConfig?.quickLinkUrl || "/elibrary";

  // Tier 3: Ticker Bar Config
  const tickerConfig = navbarSettings?.tickerBar ?? INITIAL_NAVBAR_SETTINGS.tickerBar;
  const isTickerActive = tickerConfig?.isActive !== false;
  const tickerBadge = tickerConfig?.badgeLabel || "Kajian Hangat";
  const tickerItems =
    tickerConfig?.tickerItems && tickerConfig.tickerItems.length > 0
      ? tickerConfig.tickerItems
      : INITIAL_NAVBAR_SETTINGS.tickerBar?.tickerItems || [];
  const showSearch = tickerConfig?.showSearch !== false;

  // Use dynamic navLinks from context, fallback to INITIAL_NAVBAR_SETTINGS if empty
  const rawNavLinks: NavbarLink[] =
    navbarSettings?.navLinks && navbarSettings.navLinks.length > 0
      ? navbarSettings.navLinks
      : INITIAL_NAVBAR_SETTINGS.navLinks;

  // Filter ONLY active links and normalize labels (e.g. ensure DeMa is strictly "DeMa", not long text)
  const navLinks = rawNavLinks
    .filter((link) => link.isActive !== false)
    .map((link) => {
      if (link.url === "/dema" || link.url.startsWith("/dema")) {
        return { ...link, label: "DeMa" };
      }
      return link;
    })
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const isLinkActive = (url: string) => {
    if (url === "/") return pathname === "/";
    return pathname.startsWith(url.split("#")[0]);
  };

  // Tata letak Opsi C — dua baris (pilihan user, 28 Okt 2026):
  // SEMUA menu aktif tampil di baris kedua navbar; tidak lagi dipotong 8 +
  // dilipat ke "Lainnya", karena baris kedua luas. Baris kedua diatur
  // justify-center + flex-wrap, jadi setiap menu yang ditambah admin lewat
  // panel membuat SELURUH baris bergeser dan tetap persis di tengah
  // (menu paling kiri ikut bergeser ke kiri) — bukan menumpuk di satu sisi.
  const primaryLinks = navLinks;
  const overflowLinks: typeof navLinks = [];
  const hasOverflow = overflowLinks.length > 0;
  const isAnyOverflowActive = overflowLinks.some(
    (l) => isLinkActive(l.url) || l.children?.some((c) => isLinkActive(c.url))
  );

  return (
    <header ref={headerRef} className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "shadow-2xl" : "shadow-md"}`}>
      {/* ══════════════════════════════════════════════════════════════
          TIER 1: TOP UTILITY BAR (Kalender Hijriah & Hotline Kontak)
         ══════════════════════════════════════════════════════════════ */}
      {isTopBarActive && (
        <div className="bg-[#032e22] text-emerald-200 border-b border-emerald-900/60 text-[11px] py-1 select-none relative z-30">
          {/* Padding di DALAM wadah max-w-7xl (bukan di luarnya) agar tepi
              konten sejajar persis dengan navbar & ticker di bawahnya */}
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
            {/* Kiri: Tanggal Hijriah & Masehi */}
            <div className="flex items-center gap-2 truncate">
              <span className="inline-flex items-center gap-1.5 text-mahad-gold font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-mahad-gold animate-pulse"></span>
                <span>📅</span>
                <span>{autoHijriDate}</span>
              </span>
              {topBarConfig?.announcementText && (
                <span className="hidden md:inline text-emerald-300/80 border-l border-emerald-800/80 pl-2 truncate max-w-md">
                  {topBarConfig.announcementText}
                </span>
              )}
            </div>

            {/* Kanan: Hotline Telepon, Email Resmi, dan Quick Link */}
            <div className="flex items-center gap-4 shrink-0 text-[11px]">
              {hotlinePhone && (
                <a
                  href={`https://wa.me/${hotlinePhone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1 hover:text-white transition"
                  title="Hubungi Sekretariat Ma'had Aly"
                >
                  <span className="text-emerald-400">📞</span>
                  <span>{hotlinePhone}</span>
                </a>
              )}
              {hotlineEmail && (
                <a
                  href={`mailto:${hotlineEmail}`}
                  className="hidden md:inline-flex items-center gap-1 hover:text-white transition"
                  title="Kirim Email Resmi"
                >
                  <span className="text-emerald-400">✉️</span>
                  <span>{hotlineEmail}</span>
                </a>
              )}
              {quickLinkText && (
                <Link
                  href={quickLinkUrl}
                  className="text-mahad-gold hover:text-yellow-300 font-semibold underline underline-offset-2 transition"
                >
                  {quickLinkText} →
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TIER 2: MAIN EMERALD NAVBAR
         ══════════════════════════════════════════════════════════════ */}
      {/* TANPA backdrop-blur (perbaikan lag): blur di belakang header lengket
          memaksa browser menggambar ulang area itu di SETIAP frame scroll —
          penyebab lag halaman penuh di HP. Warna solid nyaris sama tampilannya. */}
      <nav className={`${scrolled ? "bg-mahad-green-dark/95" : "bg-mahad-green-dark/98"} text-white border-b border-emerald-900 transition-all duration-300 relative z-40`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-18 lg:h-auto lg:py-2.5 lg:flex-wrap flex items-center justify-between gap-2 sm:gap-4 overflow-visible">
          
          {/* BRAND & LOGO (Prominent Official Emblem) */}
          <Link
            href="/"
            onClick={closeMenu}
            className="flex items-center gap-2.5 sm:gap-3 group shrink-0 select-none z-20 relative mr-3 xl:mr-6"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 xl:w-12 xl:h-12 relative shrink-0 drop-shadow-md group-hover:scale-105 transition-transform duration-200">
              <Image
                src={logoUrl}
                alt="Logo Ma'had Aly DDI Mangkoso"
                width={48}
                height={48}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div className="leading-tight shrink-0">
              <span className="block font-serif font-bold text-sm sm:text-base xl:text-lg text-white group-hover:text-mahad-gold transition-colors whitespace-nowrap tracking-tight">
                {brandTitle}
              </span>
              <span className="block text-[9px] sm:text-[10.5px] font-semibold text-mahad-gold tracking-wider uppercase whitespace-nowrap">
                {brandSubtitle}
              </span>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION (Primary standalone links: Beranda -> ... -> DeMa) */}
          <div className="hidden lg:flex items-center justify-center flex-wrap gap-1 xl:gap-2.5 2xl:gap-3 text-xs xl:text-[13px] font-medium order-3 basis-full border-t border-emerald-800/50 pt-2 mt-1">
            {primaryLinks.map((link) => {
              const hasChildren = link.children && link.children.length > 0;
              const isKajianMenu =
                !hasChildren &&
                (link.url === "/kategori" || link.label.toLowerCase().includes("kajian"));

              // 1. Dropdown with custom children from Admin (e.g. Akademik, Profil)
              if (hasChildren) {
                const isDropdownOpen = desktopDropdown === link.id;
                return (
                  <div key={link.id} className="relative group shrink-0 flex items-center">
                    <Link
                      href={link.url}
                      onClick={closeMenu}
                      className={`px-1.5 xl:px-2.5 py-1.5 rounded-l-lg transition-colors whitespace-nowrap ${
                        isLinkActive(link.url) || link.children?.some((c) => isLinkActive(c.url))
                          ? "text-mahad-gold font-bold bg-white/10 border-y border-l border-mahad-gold/40"
                          : "text-emerald-100 hover:text-mahad-gold hover:bg-white/5"
                      }`}
                    >
                      {link.label}
                    </Link>
                    <button
                      type="button"
                      aria-label={`Buka submenu ${link.label}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDesktopDropdown(link.id);
                      }}
                      className={`p-1.5 rounded-r-lg transition-colors cursor-pointer ${
                        isLinkActive(link.url) || link.children?.some((c) => isLinkActive(c.url)) || isDropdownOpen
                          ? "text-mahad-gold bg-white/10 border-y border-r border-mahad-gold/40"
                          : "text-emerald-200 hover:text-mahad-gold hover:bg-white/5"
                      }`}
                    >
                      <svg
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          isDropdownOpen ? "rotate-180" : "group-hover:rotate-180"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div
                      className={`absolute left-0 top-full mt-1.5 ${
                        isDropdownOpen ? "block" : "hidden group-hover:block"
                      } w-60 bg-[#064e3b] border border-emerald-700/80 rounded-xl shadow-2xl py-2 z-[70] backdrop-blur-md animate-fadeIn`}
                    >
                      {/* Parent Link Direct Shortcut inside Dropdown */}
                      <Link
                        href={link.url}
                        onClick={closeMenu}
                        className={`block px-4 py-2 text-xs border-b border-emerald-800/80 font-bold transition flex items-center justify-between ${
                          pathname === link.url
                            ? "bg-white/10 text-mahad-gold"
                            : "hover:bg-white/10 text-emerald-100 hover:text-mahad-gold"
                        }`}
                      >
                        <span>Halaman Utama {link.label}</span>
                        <span className="text-[10px] text-mahad-gold">→</span>
                      </Link>
                      {link.children
                        ?.filter((c) => c.isActive !== false)
                        .map((child) => (
                          <Link
                            key={child.id}
                            href={child.url}
                            onClick={closeMenu}
                            className={`block px-4 py-2 text-xs transition ${
                              isLinkActive(child.url)
                                ? "bg-white/10 text-mahad-gold font-bold"
                                : "hover:bg-white/10 hover:text-mahad-gold text-emerald-100"
                            }`}
                          >
                            {child.label}
                          </Link>
                        ))}
                    </div>
                  </div>
                );
              }

              // 2. Special Dynamic Kajian Menu with Categories
              if (isKajianMenu) {
                const isKajianOpen = desktopDropdown === "kajian";
                return (
                  <div key={link.id} className="relative group shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDesktopDropdown("kajian");
                      }}
                      className={`flex items-center gap-1 px-2 xl:px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                        isLinkActive("/kategori") || isKajianOpen
                          ? "text-mahad-gold font-bold bg-white/10 border border-mahad-gold/40"
                          : "text-emerald-100 hover:text-mahad-gold hover:bg-white/5"
                      }`}
                    >
                      <span>{link.label}</span>
                      <svg
                        className={`w-3.5 h-3.5 transition-transform ${
                          isKajianOpen ? "rotate-180" : "group-hover:rotate-180"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div
                      className={`absolute left-0 top-full mt-1.5 ${
                        isKajianOpen ? "block" : "hidden group-hover:block"
                      } w-72 bg-[#064e3b] border border-emerald-700/80 rounded-xl shadow-2xl py-2 z-[70] max-h-96 overflow-y-auto divide-y divide-emerald-800/60 backdrop-blur-md animate-fadeIn`}
                    >
                      <div className="py-1">
                        <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-mahad-gold flex items-center justify-between">
                          <span>🏛️ Kajian Fiqh Mu&apos;asarah</span>
                          <Link
                            href="/kategori"
                            onClick={closeMenu}
                            className="text-[10px] text-emerald-200 hover:text-white underline"
                          >
                            Semua →
                          </Link>
                        </div>
                        {fiqhCategories.map((cat) => (
                          <Link
                            key={cat.id}
                            href={`/kategori/${cat.slug}`}
                            onClick={closeMenu}
                            className="block px-4 py-1.5 text-xs hover:bg-white/10 hover:text-mahad-gold transition"
                          >
                            {cat.name}
                          </Link>
                        ))}
                      </div>
                      {opiniCategories.length > 0 && (
                        <div className="py-1">
                          <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-mahad-gold flex items-center justify-between">
                            <span>✍️ Opini &amp; Refleksi Santri</span>
                            <Link
                              href="/kategori"
                              onClick={closeMenu}
                              className="text-[10px] text-emerald-200 hover:text-white underline"
                            >
                              Semua →
                            </Link>
                          </div>
                          {opiniCategories.map((cat) => (
                            <Link
                              key={cat.id}
                              href={`/kategori/${cat.slug}`}
                              onClick={closeMenu}
                              className="block px-4 py-1.5 text-xs hover:bg-white/10 hover:text-mahad-gold transition"
                            >
                              {cat.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              // 3. Regular Top-Level Navigation Link (including Infaq & Donasi and DeMa!)
              return (
                <Link
                  key={link.id}
                  href={link.url}
                  onClick={closeMenu}
                  className={`px-1.5 xl:px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    isLinkActive(link.url)
                      ? "text-mahad-gold font-bold bg-white/10 border border-mahad-gold/40"
                      : "text-emerald-100 hover:text-mahad-gold hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* 4. Sleek "Lainnya ▾" Dropdown (Only appears if active links exceed 8!) */}
            {hasOverflow && (
              <div className="relative group shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDesktopDropdown("overflow");
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    isAnyOverflowActive || desktopDropdown === "overflow"
                      ? "text-mahad-gold font-bold bg-white/10 border border-mahad-gold/40"
                      : "text-emerald-100 hover:text-mahad-gold hover:bg-white/5"
                  }`}
                >
                  <span>Lainnya</span>
                  <span className="text-[10px] bg-mahad-gold/20 text-mahad-gold px-1.5 py-0.2 rounded-full font-bold ml-0.5">
                    +{overflowLinks.length}
                  </span>
                  <svg
                    className={`w-3.5 h-3.5 transition-transform ${
                      desktopDropdown === "overflow" ? "rotate-180" : "group-hover:rotate-180"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <div
                  className={`absolute right-0 top-full mt-1.5 ${
                    desktopDropdown === "overflow" ? "block" : "hidden group-hover:block"
                  } w-64 bg-[#064e3b] border border-emerald-700/80 rounded-2xl shadow-2xl py-2 z-[70] backdrop-blur-md animate-fadeIn`}
                >
                  <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-mahad-gold border-b border-emerald-800/80 mb-1">
                    Menu Tambahan
                  </div>
                  {overflowLinks.map((link) => (
                    <div key={link.id} className="px-1">
                      <Link
                        href={link.url}
                        onClick={closeMenu}
                        className={`block px-3.5 py-2 rounded-xl text-xs transition flex items-center justify-between ${
                          isLinkActive(link.url)
                            ? "bg-white/10 text-mahad-gold font-bold"
                            : "text-emerald-100 hover:bg-white/10 hover:text-mahad-gold"
                        }`}
                      >
                        <span>{link.label}</span>
                        {link.children && link.children.length > 0 && (
                          <span className="text-[10px] text-slate-400">›</span>
                        )}
                      </Link>
                      {link.children && link.children.length > 0 && (
                        <div className="pl-4 pr-1 py-1 space-y-0.5 bg-black/20 rounded-lg my-1">
                          {link.children
                            .filter((c) => c.isActive !== false)
                            .map((child) => (
                              <Link
                                key={child.id}
                                href={child.url}
                                onClick={closeMenu}
                                className={`block px-3 py-1.5 rounded-lg text-[11px] transition ${
                                  isLinkActive(child.url)
                                    ? "text-mahad-gold font-bold"
                                    : "text-emerald-200 hover:text-mahad-gold"
                                }`}
                              >
                                {child.label}
                              </Link>
                            ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ACTION BUTTON & SEARCH */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Kotak pencarian selalu tampil di baris pertama (Opsi C):
                menggantikan ikon cari mengembang, karena baris pertama kini
                lega — menu sudah turun ke baris kedua. */}
            {showSearch && (
              <form onSubmit={handleSearchSubmit} className="relative hidden lg:block w-56 xl:w-72">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari kajian, fatwa, artikel..."
                  className="w-full bg-[#032e22]/90 border border-emerald-700/60 rounded-full py-2 pl-4 pr-9 text-xs text-white placeholder-emerald-300/60 focus:outline-none focus:border-mahad-gold focus:ring-1 focus:ring-mahad-gold transition"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-300 hover:text-mahad-gold transition"
                  title="Cari"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </form>
            )}

            {/* High-Contrast Action Button (Kirim Tulisan / PMB Online) */}
            {navbarSettings?.ctaButton?.isActive !== false && navbarSettings?.ctaButton?.isVisible !== false && (
              <Link
                href={navbarSettings?.ctaButton?.url || "/kirim-tulisan"}
                className="hidden lg:inline-flex items-center gap-1.5 bg-mahad-gold hover:bg-yellow-400 text-mahad-green-dark font-bold text-xs px-3.5 xl:px-4 py-2 xl:py-2.5 rounded-full shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 whitespace-nowrap shrink-0"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <span>{navbarSettings?.ctaButton?.text || navbarSettings?.ctaButton?.label || "Kirim Tulisan"}</span>
              </Link>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={toggleMenu}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl text-emerald-100 hover:text-white hover:bg-white/10 transition focus:outline-none focus:ring-2 focus:ring-mahad-gold shrink-0"
              aria-label="Buka menu navigasi"
              aria-expanded={isOpen}
            >
              {isOpen ? (
                <svg className="w-6 h-6 text-mahad-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════════
          TIER 3: KAJIAN & WARTA TICKER BAR (Infinite Moving Marquee!)
         ══════════════════════════════════════════════════════════════ */}
      {isTickerActive && (
        <div className="bg-[#043d2e] text-emerald-100 border-b border-emerald-800/80 text-xs py-1.5 shadow-inner hidden md:block relative z-30 overflow-hidden">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
            {/* Ticker Badge */}
            <span className="bg-mahad-gold text-mahad-green-dark text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 flex items-center gap-1 shadow-sm z-20">
              <span>⚡</span>
              <span>{tickerBadge}</span>
            </span>

            {/* Infinite Auto-Moving Marquee Track */}
            <div className="flex-1 min-w-0 overflow-hidden relative z-10">
              <div className="animate-marquee flex items-center gap-8 text-xs whitespace-nowrap">
                {[...tickerItems, ...tickerItems].map((item, idx) => (
                  <Link
                    key={`${item.id || idx}-${idx}`}
                    href={item.url}
                    className="hover:text-mahad-gold transition flex items-center gap-2 text-emerald-200 group cursor-pointer py-0.5"
                  >
                    <span className="text-mahad-gold font-bold">•</span>
                    <span className="group-hover:underline underline-offset-2">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Kanan: Link Cepat ke Indeks Artikel */}
            <Link
              href="/artikel"
              className="text-[11px] text-emerald-300 hover:text-mahad-gold font-medium shrink-0 hidden lg:inline-flex items-center gap-1 transition z-20 cursor-pointer"
            >
              <span>Indeks Kajian</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          MOBILE ACCORDION DRAWER
         ══════════════════════════════════════════════════════════════ */}
      <div
        className={`lg:hidden overflow-y-auto bg-mahad-green-dark border-t border-emerald-900 transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[85vh] opacity-100 py-4 shadow-2xl" : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="px-5 space-y-2 text-sm font-medium">
          {/* Mobile Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative pb-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kajian, fatwa, artikel..."
              className="w-full bg-emerald-950 border border-emerald-700/60 rounded-xl py-2 pl-3.5 pr-10 text-xs text-white placeholder-emerald-400/60 focus:outline-none focus:border-mahad-gold"
            />
            <button
              type="submit"
              aria-label="Cari kajian, fatwa, dan artikel"
              className="absolute right-3 top-2.5 text-mahad-gold"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>

          {/* Navigation Links */}
          {navLinks.map((link) => {
            const hasChildren = link.children && link.children.length > 0;
            const isKajianMenu =
              !hasChildren &&
              (link.url === "/kategori" || link.label.toLowerCase().includes("kajian"));

            // Accordion Dropdown with Custom Children
            if (hasChildren) {
              const isExpanded = activeDropdown === link.id;
              return (
                <div key={link.id} className="rounded-lg overflow-hidden bg-white/5 border border-emerald-900/60">
                  <div className="flex items-center justify-between">
                    <Link
                      href={link.url}
                      onClick={closeMenu}
                      className={`flex-1 py-2.5 px-3 font-semibold transition ${
                        isLinkActive(link.url)
                          ? "text-mahad-gold font-bold"
                          : "text-emerald-100 hover:text-mahad-gold"
                      }`}
                    >
                      {link.label}
                    </Link>
                    <button
                      type="button"
                      aria-label={`Buka submenu ${link.label}`}
                      onClick={() => toggleDropdown(link.id)}
                      className="p-2.5 text-emerald-300 hover:text-mahad-gold transition"
                    >
                      <svg
                        className={`w-4 h-4 transform transition-transform duration-200 ${
                          isExpanded ? "rotate-180 text-mahad-gold" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                  {isExpanded && (
                    <div className="pl-6 pr-3 py-2 space-y-1 bg-black/30 border-t border-emerald-900/80 text-xs">
                      <Link
                        href={link.url}
                        onClick={closeMenu}
                        className="block py-1.5 font-bold text-mahad-gold flex items-center justify-between"
                      >
                        <span>Halaman Utama {link.label}</span>
                        <span>→</span>
                      </Link>
                      {link.children
                        ?.filter((c) => c.isActive !== false)
                        .map((child) => (
                          <Link
                            key={child.id}
                            href={child.url}
                            onClick={closeMenu}
                            className="block py-1.5 text-emerald-200 hover:text-white"
                          >
                            {child.label}
                          </Link>
                        ))}
                    </div>
                  )}
                </div>
              );
            }

            // Accordion Kajian Menu with Categories
            if (isKajianMenu) {
              const isExpanded = activeDropdown === "kajian";
              return (
                <div key={link.id}>
                  <button
                    type="button"
                    onClick={() => toggleDropdown("kajian")}
                    className="w-full flex items-center justify-between py-2 px-3 rounded-lg text-emerald-100 hover:bg-white/5 hover:text-mahad-gold"
                  >
                    <span>{link.label}</span>
                    <svg
                      className={`w-4 h-4 transform transition-transform ${
                        isExpanded ? "rotate-180 text-mahad-gold" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isExpanded && (
                    <div className="pl-6 py-2 space-y-2 bg-black/20 rounded-lg text-xs max-h-56 overflow-y-auto">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-mahad-gold mb-1">
                          🏛️ Fiqh Mu&apos;asarah
                        </div>
                        {fiqhCategories.map((cat) => (
                          <Link
                            key={cat.id}
                            href={`/kategori/${cat.slug}`}
                            onClick={closeMenu}
                            className="block py-1 text-emerald-200 hover:text-mahad-gold"
                          >
                            {cat.name}
                          </Link>
                        ))}
                      </div>
                      {opiniCategories.length > 0 && (
                        <div className="pt-1.5 border-t border-emerald-900/60">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-mahad-gold mb-1">
                            ✍️ Opini &amp; Refleksi
                          </div>
                          {opiniCategories.map((cat) => (
                            <Link
                              key={cat.id}
                              href={`/kategori/${cat.slug}`}
                              onClick={closeMenu}
                              className="block py-1 text-emerald-200 hover:text-mahad-gold"
                            >
                              {cat.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            }

            // Regular Link
            return (
              <Link
                key={link.id}
                href={link.url}
                onClick={closeMenu}
                className={`block py-2 px-3 rounded-lg transition ${
                  isLinkActive(link.url)
                    ? "bg-white/10 text-mahad-gold font-bold"
                    : "text-emerald-100 hover:bg-white/5 hover:text-mahad-gold"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          {/* Mobile CTA */}
          {navbarSettings?.ctaButton?.isActive !== false && navbarSettings?.ctaButton?.isVisible !== false && (
            <div className="pt-3">
              <Link
                href={navbarSettings?.ctaButton?.url || "/kirim-tulisan"}
                onClick={closeMenu}
                className="w-full py-3 bg-mahad-gold text-mahad-green-dark font-bold rounded-xl shadow flex items-center justify-center gap-2 text-center"
              >
                <span>{navbarSettings?.ctaButton?.text || navbarSettings?.ctaButton?.label || "Kirim Tulisan"}</span>
              </Link>
            </div>
          )}

          {/* Mobile Contact Footer */}
          <div className="pt-4 border-t border-emerald-800/80 text-xs text-emerald-300/80 space-y-1">
            <p className="flex items-center gap-1.5 text-mahad-gold font-medium">
              <span>📅</span> {autoHijriDate}
            </p>
            {hotlinePhone && (
              <p className="flex items-center gap-1.5">
                <span>📞</span> {hotlinePhone}
              </p>
            )}
            {hotlineEmail && (
              <p className="flex items-center gap-1.5">
                <span>✉️</span> {hotlineEmail}
              </p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
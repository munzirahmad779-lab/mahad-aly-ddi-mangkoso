"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useArticles } from "@/context/ArticleContext";
import { INITIAL_NAVBAR_SETTINGS } from "@/lib/mock-data";
import { NavbarLink } from "@/lib/types";

export default function Navbar() {
  const { categories, navbarSettings } = useArticles();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [desktopDropdown, setDesktopDropdown] = useState<string | null>(null);

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

  const logoUrl = navbarSettings?.logoUrl || "/image_067524.png";
  const brandTitle = navbarSettings?.brandTitle || "Ma'had Aly";
  const brandSubtitle = navbarSettings?.brandSubtitle || "DDI Mangkoso • Fiqh Mu'asarah";

  // Use dynamic navLinks from context, fallback to INITIAL_NAVBAR_SETTINGS if empty
  const rawNavLinks: NavbarLink[] =
    navbarSettings?.navLinks && navbarSettings.navLinks.length > 0
      ? navbarSettings.navLinks
      : INITIAL_NAVBAR_SETTINGS.navLinks;

  const navLinks = rawNavLinks
    .filter((link) => link.isActive !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const isLinkActive = (url: string) => {
    if (url === "/") return pathname === "/";
    return pathname.startsWith(url.split("#")[0]);
  };

  // Smart Desktop Overflow Prevention:
  // If there are more than 6-7 links, put excess links in a sleek "Lainnya ▾" dropdown
  // to guarantee the Brand Logo and "Ma'had Aly" title NEVER collide or stack on ANY screen!
  const MAX_DESKTOP_PRIMARY = navLinks.length <= 7 ? 7 : 6;
  const primaryLinks = navLinks.slice(0, MAX_DESKTOP_PRIMARY);
  const overflowLinks = navLinks.slice(MAX_DESKTOP_PRIMARY);
  const hasOverflow = overflowLinks.length > 0;
  const isAnyOverflowActive = overflowLinks.some((l) =>
    isLinkActive(l.url) || l.children?.some((c) => isLinkActive(c.url))
  );

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-mahad-green-dark/95 backdrop-blur-md text-white border-b border-emerald-900 transition-shadow shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* ══════════════════════════════════════════════════════════════
            BRAND & LOGO (Immune to shrinking or wrapping)
           ══════════════════════════════════════════════════════════════ */}
        <Link
          href="/"
          onClick={closeMenu}
          className="flex items-center gap-2.5 sm:gap-3.5 group shrink-0 min-w-fit select-none"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 relative shrink-0 drop-shadow-md group-hover:scale-105 transition-transform duration-200">
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
            <span className="block font-serif font-bold text-base sm:text-lg xl:text-xl text-white group-hover:text-mahad-gold transition-colors whitespace-nowrap tracking-tight">
              {brandTitle}
            </span>
            <span className="block text-[10px] sm:text-[11px] font-semibold text-mahad-gold tracking-wider uppercase whitespace-nowrap">
              {brandSubtitle}
            </span>
          </div>
        </Link>

        {/* ══════════════════════════════════════════════════════════════
            DESKTOP NAVIGATION (Responsive Spacing + "Lainnya ▾" Overflow)
           ══════════════════════════════════════════════════════════════ */}
        <div className="hidden lg:flex items-center justify-end gap-1.5 xl:gap-3 2xl:gap-4 text-xs xl:text-[13px] font-medium flex-1 min-w-0">
          {primaryLinks.map((link) => {
            const hasChildren = link.children && link.children.length > 0;
            const isKajianMenu =
              !hasChildren &&
              (link.url === "/kategori" || link.label.toLowerCase().includes("kajian"));

            // 1. Dropdown with custom children from Admin
            if (hasChildren) {
              const isDropdownOpen = desktopDropdown === link.id;
              return (
                <div key={link.id} className="relative group shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDesktopDropdown(link.id);
                    }}
                    className={`flex items-center gap-1 px-2 xl:px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                      isLinkActive(link.url) || link.children?.some(c => isLinkActive(c.url)) || isDropdownOpen
                        ? "text-mahad-gold font-bold bg-white/10"
                        : "text-emerald-100 hover:text-mahad-gold hover:bg-white/5"
                    }`}
                  >
                    <span>{link.label}</span>
                    <svg className={`w-3.5 h-3.5 transition-transform ${isDropdownOpen ? "rotate-180" : "group-hover:rotate-180"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className={`absolute left-0 top-full ${isDropdownOpen ? "block" : "hidden group-hover:block"} w-60 bg-mahad-green-dark border border-emerald-800 rounded-xl shadow-2xl py-2 z-50 animate-fadeIn`}>
                    {link.children?.filter(c => c.isActive !== false).map((child) => (
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
                        ? "text-mahad-gold font-bold bg-white/10"
                        : "text-emerald-100 hover:text-mahad-gold hover:bg-white/5"
                    }`}
                  >
                    <span>{link.label}</span>
                    <svg className={`w-3.5 h-3.5 transition-transform ${isKajianOpen ? "rotate-180" : "group-hover:rotate-180"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className={`absolute left-0 top-full ${isKajianOpen ? "block" : "hidden group-hover:block"} w-72 bg-mahad-green-dark border border-emerald-800 rounded-xl shadow-2xl py-2 z-50 max-h-96 overflow-y-auto divide-y divide-emerald-800/60 animate-fadeIn`}>
                    <div className="py-1">
                      <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-mahad-gold flex items-center justify-between">
                        <span>🏛️ Kajian Fiqh Mu&apos;asarah</span>
                        <Link href="/kategori" onClick={closeMenu} className="text-[10px] text-emerald-200 hover:text-white underline">
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
                          <Link href="/kategori" onClick={closeMenu} className="text-[10px] text-emerald-200 hover:text-white underline">
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

            // 3. Regular Top-Level Navigation Link
            return (
              <Link
                key={link.id}
                href={link.url}
                onClick={closeMenu}
                className={`px-2 xl:px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  isLinkActive(link.url)
                    ? "text-mahad-gold font-bold bg-white/10 border-b-2 border-mahad-gold"
                    : "text-emerald-100 hover:text-mahad-gold hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          {/* 4. Sleek "Lainnya ▾" Dropdown (When links exceed 6/7) */}
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
                    ? "text-mahad-gold font-bold bg-white/10 border-b-2 border-mahad-gold"
                    : "text-emerald-100 hover:text-mahad-gold hover:bg-white/5"
                }`}
              >
                <span>Lainnya</span>
                <span className="text-[10px] bg-mahad-gold/20 text-mahad-gold px-1.5 py-0.2 rounded-full font-bold ml-0.5">
                  +{overflowLinks.length}
                </span>
                <svg className={`w-3.5 h-3.5 transition-transform ${desktopDropdown === "overflow" ? "rotate-180" : "group-hover:rotate-180"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div className={`absolute right-0 top-full ${desktopDropdown === "overflow" ? "block" : "hidden group-hover:block"} w-64 bg-mahad-green-dark border border-emerald-800 rounded-2xl shadow-2xl py-2 z-50 animate-fadeIn`}>
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
                        {link.children.filter(c => c.isActive !== false).map((child) => (
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

        {/* ══════════════════════════════════════════════════════════════
            ACTION BUTTON & MOBILE HAMBURGER
           ══════════════════════════════════════════════════════════════ */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {navbarSettings?.ctaButton?.isActive !== false && navbarSettings?.ctaButton?.isVisible !== false && (
            <Link
              href={navbarSettings?.ctaButton?.url || "/pmb"}
              className="hidden lg:inline-flex items-center gap-1.5 bg-mahad-gold hover:bg-yellow-400 text-mahad-green-dark font-bold text-xs px-3 xl:px-4 py-2 xl:py-2.5 rounded-full shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 whitespace-nowrap shrink-0"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span>{navbarSettings?.ctaButton?.text || navbarSettings?.ctaButton?.label || "PMB Online"}</span>
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

      {/* ══════════════════════════════════════════════════════════════
          MOBILE ACCORDION DRAWER (All links rendered vertically)
         ══════════════════════════════════════════════════════════════ */}
      <div
        className={`lg:hidden overflow-y-auto bg-mahad-green-dark border-t border-emerald-900 transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[85vh] opacity-100 py-4 shadow-2xl" : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="px-5 space-y-1.5 text-sm font-medium">
          {navLinks.map((link) => {
            const hasChildren = link.children && link.children.length > 0;
            const isKajianMenu =
              !hasChildren &&
              (link.url === "/kategori" || link.label.toLowerCase().includes("kajian"));

            // 1. Accordion Dropdown with Custom Children
            if (hasChildren) {
              const isExpanded = activeDropdown === link.id;
              return (
                <div key={link.id}>
                  <button
                    type="button"
                    onClick={() => toggleDropdown(link.id)}
                    className="w-full flex items-center justify-between py-2 px-3 rounded-lg text-emerald-100 hover:bg-white/5 hover:text-mahad-gold"
                  >
                    <span>{link.label}</span>
                    <svg className={`w-4 h-4 transform transition-transform ${isExpanded ? "rotate-180 text-mahad-gold" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isExpanded && (
                    <div className="pl-6 py-1 space-y-1 bg-black/20 rounded-lg text-xs">
                      {link.children?.filter(c => c.isActive !== false).map((child) => (
                        <Link
                          key={child.id}
                          href={child.url}
                          onClick={closeMenu}
                          className="block py-1.5 text-emerald-200 hover:text-mahad-gold"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            // 2. Accordion Kajian Menu with Categories
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
                    <svg className={`w-4 h-4 transform transition-transform ${isExpanded ? "rotate-180 text-mahad-gold" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

            // 3. Regular Link
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
                href={navbarSettings?.ctaButton?.url || "/pmb"}
                onClick={closeMenu}
                className="w-full py-3 bg-mahad-gold text-mahad-green-dark font-bold rounded-xl shadow flex items-center justify-center gap-2 text-center"
              >
                <span>{navbarSettings?.ctaButton?.text || navbarSettings?.ctaButton?.label || "PMB Online"}</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
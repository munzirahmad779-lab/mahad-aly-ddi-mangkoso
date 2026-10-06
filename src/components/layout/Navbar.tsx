"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="fixed top-0 inset-x-0 z-40 bg-mahad-green-dark/95 backdrop-blur-md text-white border-b border-emerald-900 transition-shadow shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand & Logo */}
        <Link href="/" onClick={closeMenu} className="flex items-center gap-3.5 group">
          <div className="w-12 h-12 relative shrink-0 drop-shadow-md group-hover:scale-105 transition-transform duration-200">
            <Image
              src="/image_067524.png"
              alt="Logo Ma'had Aly DDI Mangkoso"
              width={48}
              height={48}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <div className="leading-tight">
            <span className="block font-serif font-bold text-lg sm:text-xl text-white group-hover:text-mahad-gold transition-colors">
              Ma&apos;had Aly
            </span>
            <span className="block text-xs font-semibold text-mahad-gold tracking-wider uppercase">
              DDI Mangkoso
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-7 text-sm font-medium">
          <Link href="/" className="text-emerald-100 hover:text-mahad-gold transition-colors">
            Beranda
          </Link>
          <Link href="/tentang" className="text-emerald-100 hover:text-mahad-gold transition-colors">
            Profil &amp; Sejarah
          </Link>
          <Link href="/#mimbar-kajian" className="text-emerald-100 hover:text-mahad-gold transition-colors">
            Mimbar Kajian
          </Link>
          <Link href="/kategori/karya-anregurutta" className="text-emerald-100 hover:text-mahad-gold transition-colors">
            Karya Anregurutta
          </Link>
          
          <Link
            href="/kirim-tulisan"
            className="bg-mahad-gold hover:bg-yellow-400 text-mahad-green-dark font-bold px-5 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span>Kirim Tulisan</span>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={toggleMenu}
          className="md:hidden w-11 h-11 flex items-center justify-center rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition focus:outline-none focus:ring-2 focus:ring-mahad-gold"
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

      {/* Mobile Drawer Menu */}
      <div
        className={`md:hidden overflow-hidden bg-mahad-green-dark border-t border-emerald-900 transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-5 py-4 space-y-2 text-base font-medium">
          <Link
            href="/"
            onClick={closeMenu}
            className="block py-2.5 px-3 rounded-lg text-emerald-100 hover:bg-white/5 hover:text-mahad-gold transition"
          >
            Beranda
          </Link>
          <Link
            href="/tentang"
            onClick={closeMenu}
            className="block py-2.5 px-3 rounded-lg text-emerald-100 hover:bg-white/5 hover:text-mahad-gold transition"
          >
            Profil &amp; Sejarah
          </Link>
          <Link
            href="/#mimbar-kajian"
            onClick={closeMenu}
            className="block py-2.5 px-3 rounded-lg text-emerald-100 hover:bg-white/5 hover:text-mahad-gold transition"
          >
            Mimbar Kajian
          </Link>
          <Link
            href="/kategori/karya-anregurutta"
            onClick={closeMenu}
            className="block py-2.5 px-3 rounded-lg text-emerald-100 hover:bg-white/5 hover:text-mahad-gold transition"
          >
            Karya Anregurutta
          </Link>
          <div className="pt-2">
            <Link
              href="/kirim-tulisan"
              onClick={closeMenu}
              className="w-full py-3 bg-mahad-gold text-mahad-green-dark font-bold rounded-xl shadow flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span>Kirim Tulisan Anda</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useArticles } from "@/context/ArticleContext";

export default function Navbar() {
  const { categories, navbarSettings } = useArticles();
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const safeCategories = Array.isArray(categories) ? categories : [];
  const fiqhCategories = safeCategories.filter((c) => c.type !== "opini");
  const opiniCategories = safeCategories.filter((c) => c.type === "opini");

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => {
    setIsOpen(false);
    setActiveDropdown(null);
  };

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const logoUrl = navbarSettings?.logoUrl || "/image_067524.png";
  const brandTitle = navbarSettings?.brandTitle || "Ma'had Aly";
  const brandSubtitle = navbarSettings?.brandSubtitle || "DDI Mangkoso • Fiqh Mu'asarah";

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-mahad-green-dark/95 backdrop-blur-md text-white border-b border-emerald-900 transition-shadow shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand & Logo */}
        <Link href="/" onClick={closeMenu} className="flex items-center gap-3.5 group shrink-0">
          <div className="w-12 h-12 relative shrink-0 drop-shadow-md group-hover:scale-105 transition-transform duration-200">
            <Image
              src={logoUrl}
              alt="Logo Ma'had Aly DDI Mangkoso"
              width={48}
              height={48}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <div className="leading-tight">
            <span className="block font-serif font-bold text-lg sm:text-xl text-white group-hover:text-mahad-gold transition-colors">
              {brandTitle}
            </span>
            <span className="block text-[11px] font-semibold text-mahad-gold tracking-wider uppercase">
              {brandSubtitle}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-5 text-[13px] font-medium">
          <Link href="/" className="text-emerald-100 hover:text-mahad-gold transition-colors">
            Beranda
          </Link>

          {/* Dropdown Profil */}
          <div className="relative group">
            <button
              type="button"
              className="flex items-center gap-1 text-emerald-100 hover:text-mahad-gold transition-colors py-2"
            >
              <span>Profil</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className="absolute left-0 top-full hidden group-hover:block w-56 bg-mahad-green-dark border border-emerald-800 rounded-xl shadow-2xl py-2 z-50">
              <Link href="/profil#sejarah" className="block px-4 py-2 hover:bg-white/10 hover:text-mahad-gold transition">
                Sejarah Lembaga
              </Link>
              <Link href="/profil#visi-misi" className="block px-4 py-2 hover:bg-white/10 hover:text-mahad-gold transition">
                Visi &amp; Misi
              </Link>
              <Link href="/profil#masyayikh" className="block px-4 py-2 hover:bg-white/10 hover:text-mahad-gold transition">
                Masyayikh &amp; Dewan Dosen
              </Link>
              <Link href="/profil#struktur" className="block px-4 py-2 hover:bg-white/10 hover:text-mahad-gold transition">
                Struktur Organisasi
              </Link>
              <Link href="/profil#sarana" className="block px-4 py-2 hover:bg-white/10 hover:text-mahad-gold transition">
                Sarana &amp; Prasarana
              </Link>
              <Link href="/profil#akreditasi" className="block px-4 py-2 hover:bg-white/10 hover:text-mahad-gold transition">
                Sertifikat Akreditasi
              </Link>
            </div>
          </div>

          {/* Dropdown Akademik */}
          <div className="relative group">
            <button
              type="button"
              className="flex items-center gap-1 text-emerald-100 hover:text-mahad-gold transition-colors py-2"
            >
              <span>Akademik</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className="absolute left-0 top-full hidden group-hover:block w-64 bg-mahad-green-dark border border-emerald-800 rounded-xl shadow-2xl py-2 z-50">
              <Link href="/akademik#takhassus" className="block px-4 py-2 hover:bg-white/10 hover:text-mahad-gold transition">
                Takhassus: Fiqh wa Usuluhu
              </Link>
              <Link href="/akademik#fiqh-muasarah" className="block px-4 py-2 hover:bg-white/10 hover:text-mahad-gold transition">
                Fokus: Fiqh Mu&apos;asarah
              </Link>
              <Link href="/akademik#kurikulum" className="block px-4 py-2 hover:bg-white/10 hover:text-mahad-gold transition">
                Kurikulum 4 Tahun (M.1)
              </Link>
              <Link href="/akademik#kalender" className="block px-4 py-2 hover:bg-white/10 hover:text-mahad-gold transition">
                Kalender Akademik
              </Link>
            </div>
          </div>

          {/* Dropdown Kajian Fiqh Mu'asarah & Opini */}
          <div className="relative group">
            <button
              type="button"
              className="flex items-center gap-1 text-emerald-100 hover:text-mahad-gold transition-colors py-2"
            >
              <span>Kajian</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7-7-7-7" />
              </svg>
            </button>
            <div className="absolute left-0 top-full hidden group-hover:block w-72 bg-mahad-green-dark border border-emerald-800 rounded-xl shadow-2xl py-2 z-50 max-h-96 overflow-y-auto divide-y divide-emerald-800/60">
              <div className="py-1">
                <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-mahad-gold">
                  🏛️ Kajian Fiqh Mu&apos;asarah
                </div>
                {fiqhCategories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/kategori/${cat.slug}`}
                    className="block px-4 py-1.5 text-xs hover:bg-white/10 hover:text-mahad-gold transition"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
              {opiniCategories.length > 0 && (
                <div className="py-1">
                  <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-mahad-gold">
                    ✍️ Opini &amp; Refleksi Santri
                  </div>
                  {opiniCategories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/kategori/${cat.slug}`}
                      className="block px-4 py-1.5 text-xs hover:bg-white/10 hover:text-mahad-gold transition"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bahtsul Masail (Coming Soon) */}
          <Link
            href="/bahtsul-masail"
            className="text-emerald-100 hover:text-mahad-gold transition-colors flex items-center gap-1.5"
          >
            <span>Bahtsul Masail</span>
            <span className="text-[9px] bg-mahad-gold/20 text-mahad-gold border border-mahad-gold/40 px-1.5 py-0.5 rounded-full">
              Soon
            </span>
          </Link>

          {/* Dropdown Publikasi */}
          <div className="relative group">
            <button
              type="button"
              className="flex items-center gap-1 text-emerald-100 hover:text-mahad-gold transition-colors py-2"
            >
              <span>Publikasi</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7-7-7-7" />
              </svg>
            </button>
            <div className="absolute left-0 top-full hidden group-hover:block w-56 bg-mahad-green-dark border border-emerald-800 rounded-xl shadow-2xl py-2 z-50">
              <Link href="/artikel" className="flex items-center justify-between px-4 py-2 hover:bg-white/10 hover:text-mahad-gold transition">
                <span>Artikel Ilmiah</span>
                <span className="text-[10px] bg-emerald-700 text-white px-2 py-0.5 rounded-full">Live</span>
              </Link>
              <Link href="/skripsi" className="flex items-center justify-between px-4 py-2 hover:bg-white/10 hover:text-mahad-gold transition">
                <span>Skripsi Mahasantri</span>
                <span className="text-[10px] bg-mahad-gold text-mahad-green-dark font-bold px-2 py-0.5 rounded-full">PDF</span>
              </Link>
              <Link href="/jurnal" className="flex items-center justify-between px-4 py-2 hover:bg-white/10 hover:text-mahad-gold transition text-emerald-300/80">
                <span>Jurnal Ma&apos;had</span>
                <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded">Soon</span>
              </Link>
              <Link href="/buku" className="flex items-center justify-between px-4 py-2 hover:bg-white/10 hover:text-mahad-gold transition text-emerald-300/80">
                <span>Buku / Risalah</span>
                <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded">Soon</span>
              </Link>
            </div>
          </div>

          {/* PMB (Coming Soon) */}
          <Link
            href="/pmb"
            className="text-emerald-100 hover:text-mahad-gold transition-colors flex items-center gap-1.5"
          >
            <span>PMB</span>
            <span className="text-[9px] bg-mahad-gold/20 text-mahad-gold border border-mahad-gold/40 px-1.5 py-0.5 rounded-full">
              Soon
            </span>
          </Link>

          {/* Informasi & Berita */}
          <Link href="/berita" className="text-emerald-100 hover:text-mahad-gold transition-colors">
            Berita
          </Link>

          {/* Kontak */}
          <Link href="/kontak" className="text-emerald-100 hover:text-mahad-gold transition-colors">
            Kontak
          </Link>
        </div>

        {/* Action Button & Hamburger */}
        <div className="flex items-center gap-3">
          {navbarSettings?.ctaButton?.isActive !== false && navbarSettings?.ctaButton?.isVisible !== false && (
            <Link
              href={navbarSettings?.ctaButton?.url || "/kirim-tulisan"}
              className="hidden sm:inline-flex items-center gap-2 bg-mahad-gold hover:bg-yellow-400 text-mahad-green-dark font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-full shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
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
            className="lg:hidden w-11 h-11 flex items-center justify-center rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition focus:outline-none focus:ring-2 focus:ring-mahad-gold"
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

      {/* Mobile Accordion Drawer Menu */}
      <div
        className={`lg:hidden overflow-y-auto bg-mahad-green-dark border-t border-emerald-900 transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[85vh] opacity-100 py-4" : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="px-5 space-y-1.5 text-sm font-medium">
          <Link
            href="/"
            onClick={closeMenu}
            className="block py-2 px-3 rounded-lg text-emerald-100 hover:bg-white/5 hover:text-mahad-gold"
          >
            Beranda
          </Link>

          {/* Accordion Profil */}
          <div>
            <button
              type="button"
              onClick={() => toggleDropdown("profil")}
              className="w-full flex items-center justify-between py-2 px-3 rounded-lg text-emerald-100 hover:bg-white/5 hover:text-mahad-gold"
            >
              <span>Profil</span>
              <svg className={`w-4 h-4 transform transition-transform ${activeDropdown === "profil" ? "rotate-180 text-mahad-gold" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {activeDropdown === "profil" && (
              <div className="pl-6 py-1 space-y-1 bg-black/20 rounded-lg text-xs">
                <Link href="/profil#sejarah" onClick={closeMenu} className="block py-1.5 text-emerald-200 hover:text-mahad-gold">Sejarah Lembaga</Link>
                <Link href="/profil#visi-misi" onClick={closeMenu} className="block py-1.5 text-emerald-200 hover:text-mahad-gold">Visi &amp; Misi</Link>
                <Link href="/profil#masyayikh" onClick={closeMenu} className="block py-1.5 text-emerald-200 hover:text-mahad-gold">Masyayikh &amp; Dewan Dosen</Link>
                <Link href="/profil#struktur" onClick={closeMenu} className="block py-1.5 text-emerald-200 hover:text-mahad-gold">Struktur Organisasi</Link>
                <Link href="/profil#sarana" onClick={closeMenu} className="block py-1.5 text-emerald-200 hover:text-mahad-gold">Sarana &amp; Prasarana</Link>
                <Link href="/profil#akreditasi" onClick={closeMenu} className="block py-1.5 text-emerald-200 hover:text-mahad-gold">Sertifikat Akreditasi</Link>
              </div>
            )}
          </div>

          {/* Accordion Akademik */}
          <div>
            <button
              type="button"
              onClick={() => toggleDropdown("akademik")}
              className="w-full flex items-center justify-between py-2 px-3 rounded-lg text-emerald-100 hover:bg-white/5 hover:text-mahad-gold"
            >
              <span>Akademik</span>
              <svg className={`w-4 h-4 transform transition-transform ${activeDropdown === "akademik" ? "rotate-180 text-mahad-gold" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {activeDropdown === "akademik" && (
              <div className="pl-6 py-1 space-y-1 bg-black/20 rounded-lg text-xs">
                <Link href="/akademik#takhassus" onClick={closeMenu} className="block py-1.5 text-emerald-200 hover:text-mahad-gold">Takhassus: Fiqh wa Usuluhu</Link>
                <Link href="/akademik#fiqh-muasarah" onClick={closeMenu} className="block py-1.5 text-emerald-200 hover:text-mahad-gold">Fokus: Fiqh Mu&apos;asarah</Link>
                <Link href="/akademik#kurikulum" onClick={closeMenu} className="block py-1.5 text-emerald-200 hover:text-mahad-gold">Kurikulum 4 Tahun (M.1)</Link>
                <Link href="/akademik#kalender" onClick={closeMenu} className="block py-1.5 text-emerald-200 hover:text-mahad-gold">Kalender Akademik</Link>
              </div>
            )}
          </div>

          {/* Accordion Kajian & Kategori */}
          <div>
            <button
              type="button"
              onClick={() => toggleDropdown("kajian")}
              className="w-full flex items-center justify-between py-2 px-3 rounded-lg text-emerald-100 hover:bg-white/5 hover:text-mahad-gold"
            >
              <span>Kajian &amp; Kategori</span>
              <svg className={`w-4 h-4 transform transition-transform ${activeDropdown === "kajian" ? "rotate-180 text-mahad-gold" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {activeDropdown === "kajian" && (
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

          {/* Bahtsul Masail */}
          <Link
            href="/bahtsul-masail"
            onClick={closeMenu}
            className="flex items-center justify-between py-2 px-3 rounded-lg text-emerald-100 hover:bg-white/5 hover:text-mahad-gold"
          >
            <span>Bahtsul Masail</span>
            <span className="text-[9px] bg-mahad-gold/20 text-mahad-gold px-1.5 py-0.5 rounded">Coming Soon</span>
          </Link>

          {/* Accordion Publikasi */}
          <div>
            <button
              type="button"
              onClick={() => toggleDropdown("publikasi")}
              className="w-full flex items-center justify-between py-2 px-3 rounded-lg text-emerald-100 hover:bg-white/5 hover:text-mahad-gold"
            >
              <span>Publikasi</span>
              <svg className={`w-4 h-4 transform transition-transform ${activeDropdown === "publikasi" ? "rotate-180 text-mahad-gold" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {activeDropdown === "publikasi" && (
              <div className="pl-6 py-1 space-y-1 bg-black/20 rounded-lg text-xs">
                <Link href="/artikel" onClick={closeMenu} className="block py-1.5 text-emerald-200 hover:text-mahad-gold">Artikel Ilmiah (Live)</Link>
                <Link href="/skripsi" onClick={closeMenu} className="block py-1.5 text-emerald-200 hover:text-mahad-gold">Skripsi Mahasantri (PDF)</Link>
                <Link href="/jurnal" onClick={closeMenu} className="block py-1.5 text-emerald-300/60">Jurnal (Coming Soon)</Link>
                <Link href="/buku" onClick={closeMenu} className="block py-1.5 text-emerald-300/60">Buku / Risalah (Coming Soon)</Link>
              </div>
            )}
          </div>

          {/* PMB */}
          <Link
            href="/pmb"
            onClick={closeMenu}
            className="flex items-center justify-between py-2 px-3 rounded-lg text-emerald-100 hover:bg-white/5 hover:text-mahad-gold"
          >
            <span>PMB (Penerimaan Mahasantri Baru)</span>
            <span className="text-[9px] bg-mahad-gold/20 text-mahad-gold px-1.5 py-0.5 rounded">Coming Soon</span>
          </Link>

          {/* Informasi & Berita */}
          <Link
            href="/berita"
            onClick={closeMenu}
            className="block py-2 px-3 rounded-lg text-emerald-100 hover:bg-white/5 hover:text-mahad-gold"
          >
            Berita &amp; Agenda
          </Link>

          {/* Kontak */}
          <Link
            href="/kontak"
            onClick={closeMenu}
            className="block py-2 px-3 rounded-lg text-emerald-100 hover:bg-white/5 hover:text-mahad-gold"
          >
            Kontak &amp; Lokasi
          </Link>

          <div className="pt-3">
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
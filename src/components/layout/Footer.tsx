"use client";

import Link from "next/link";
import Image from "next/image";
import { useArticles } from "@/context/ArticleContext";

export default function Footer() {
  const { footerSettings, footerNav, footerFocus } = useArticles();

  // Fallback defaults in case context is still initializing or empty
  const logoUrl = footerSettings?.logoUrl || "/image_067524.png";
  const orgName = footerSettings?.orgName || "Ma'had Aly";
  const orgSubname = footerSettings?.orgSubname || "DDI Mangkoso";
  const description = footerSettings?.description || "Pendidikan Tinggi Kader Ulama jenjang Marhalah Ula (M.1). Berkhidmat melahirkan generasi mutafaqqih fiddin berwawasan wasathiyyah dan berakhlak mulia.";
  const address = footerSettings?.address || "Kompleks Ponpes DDI Mangkoso, Kec. Soppeng Riaja, Kab. Barru, Sulsel 90752";
  const kanalDescription = footerSettings?.kanalDescription || "Ikuti kabar pengajian, kajian halaqah, dan penerbitan jurnal resmi Ma'had Aly DDI Mangkoso:";
  const email = footerSettings?.email || "mahadaly@ddimangkoso.ac.id";
  const whatsapp = footerSettings?.whatsapp || "+62 812-3456-7890";
  const showAdminLink = footerSettings?.showAdminLink !== false;
  const adminLinkLabel = footerSettings?.adminLinkLabel || "🔒 Masuk Panel Redaksi (Admin)";
  const copyrightText = footerSettings?.copyrightText || "© 2026 Ma'had Aly DDI Mangkoso. Hak Cipta Dilindungi.";
  const tagline = footerSettings?.tagline || "Mewarisi Khazanah Turats • Menjaga Sanad Ulama Nusantara";
  const footerBgColor = footerSettings?.footerBgColor || "#0b4a25";
  const footerTextColor = footerSettings?.footerTextColor || "#ecfdf5";
  const columnLayout = footerSettings?.columnLayout ?? 4;

  // Filter and sort active nav and focus items
  const activeNavs = (footerNav || [])
    .filter((item) => item.isActive)
    .sort((a, b) => a.position - b.position);

  const activeFocus = (footerFocus || [])
    .filter((item) => item.isActive)
    .sort((a, b) => a.position - b.position);

  // Dynamic column layout class
  const getGridColsClass = () => {
    switch (Number(columnLayout)) {
      case 2:
        return "grid-cols-1 md:grid-cols-2";
      case 3:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      case 4:
      default:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
    }
  };

  return (
    <footer
      style={{ backgroundColor: footerBgColor, color: footerTextColor }}
      className="pt-16 pb-8 border-t-4 border-mahad-gold mt-auto transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid ${getGridColsClass()} gap-10 pb-12 border-b border-emerald-900/60`}>
          
          {/* Kolom 1: Identitas Lembaga */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 relative shrink-0 drop-shadow">
                <Image
                  src={logoUrl}
                  alt={`Logo ${orgName}`}
                  width={44}
                  height={44}
                  className="w-full h-full object-contain"
                  unoptimized={true}
                />
              </div>
              <div>
                <p className="font-serif font-bold text-lg text-white">{orgName}</p>
                {orgSubname && (
                  <p className="text-xs text-mahad-gold font-semibold uppercase tracking-wider">{orgSubname}</p>
                )}
              </div>
            </div>
            <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed">
              {description}
            </p>
            {address && (
              <p className="text-xs text-emerald-300/80 flex items-start gap-2">
                <svg className="w-4 h-4 text-mahad-gold shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{address}</span>
              </p>
            )}
          </div>

          {/* Kolom 2: Tautan Navigasi */}
          <div>
            <p className="font-serif font-bold text-base text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-mahad-gold"></span>
              <span>Navigasi Portal</span>
            </p>
            <ul className="space-y-2.5 text-sm">
              {activeNavs.map((link) => (
                <li key={link.id}>
                  <Link href={link.url} className="hover:text-mahad-gold transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
              {activeNavs.length === 0 && (
                <li className="text-xs text-emerald-300/50 italic">Tidak ada tautan navigasi</li>
              )}
            </ul>
          </div>

          {/* Kolom 3: Fokus Keilmuan (hanya jika layout >= 3 kolom) */}
          {Number(columnLayout) >= 3 && (
            <div>
              <p className="font-serif font-bold text-base text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-mahad-gold"></span>
                <span>Fokus Keilmuan</span>
              </p>
              <ul className="space-y-2.5 text-sm text-emerald-200/90">
                {activeFocus.map((focus) => (
                  <li key={focus.id}>
                    <Link href="/artikel" className="hover:text-mahad-gold transition-colors flex items-center gap-2">
                      {focus.icon && <span className="text-sm">{focus.icon}</span>}
                      <span>{focus.name}</span>
                    </Link>
                  </li>
                ))}
                {activeFocus.length === 0 && (
                  <li className="text-xs text-emerald-300/50 italic">Tidak ada fokus keilmuan</li>
                )}
              </ul>
            </div>
          )}

          {/* Kolom 4: Media & Kontak */}
          <div>
            <p className="font-serif font-bold text-base text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-mahad-gold"></span>
              <span>Kanal Informasi</span>
            </p>
            {kanalDescription && (
              <p className="text-xs text-emerald-200/90 mb-4 leading-relaxed">
                {kanalDescription}
              </p>
            )}
            <div className="space-y-2 text-xs text-emerald-200">
              {email && (
                <p>Email: <span className="text-white font-medium">{email}</span></p>
              )}
              {whatsapp && (
                <p>WhatsApp: <span className="text-white font-medium">{whatsapp}</span></p>
              )}
              {footerSettings?.facebookUrl && (
                <p>FB: <a href={footerSettings.facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:underline text-emerald-300">{footerSettings.facebookUrl}</a></p>
              )}
              {footerSettings?.youtubeUrl && (
                <p>YT: <a href={footerSettings.youtubeUrl} target="_blank" rel="noopener noreferrer" className="hover:underline text-emerald-300">{footerSettings.youtubeUrl}</a></p>
              )}
              {footerSettings?.instagramUrl && (
                <p>IG: <a href={footerSettings.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:underline text-emerald-300">{footerSettings.instagramUrl}</a></p>
              )}
            </div>
            
            {/* Tautan Khusus Admin */}
            {showAdminLink && (
              <div className="pt-4 mt-4 border-t border-emerald-900/60">
                <Link
                  href={footerSettings?.adminLinkUrl || "/admin"}
                  className="text-[11px] text-mahad-gold hover:underline flex items-center gap-1 opacity-75 hover:opacity-100 transition"
                >
                  <span>{adminLinkLabel}</span>
                </Link>
              </div>
            )}
          </div>

        </div>

        {/* Copyright & Tagline Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-300/70 gap-4 text-center sm:text-left">
          <p>{copyrightText}</p>
          {tagline && (
            <p className="text-mahad-gold-light">
              {tagline}
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
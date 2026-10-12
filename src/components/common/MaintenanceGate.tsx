"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useArticles } from "@/context/ArticleContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import OfficialComingSoon from "./OfficialComingSoon";

export default function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { settings } = useArticles();
  const [mounted, setMounted] = useState(false);
  const [isAdminPreview, setIsAdminPreview] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const isPreview =
        localStorage.getItem("mahad_admin_preview") === "true" ||
        window.location.search.includes("preview=true");

      if (window.location.search.includes("preview=true")) {
        localStorage.setItem("mahad_admin_preview", "true");
      }

      setIsAdminPreview(isPreview);
    }
  }, []);

  const handleExitPreview = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("mahad_admin_preview");
      setIsAdminPreview(false);
    }
  };

  // 1. Rute Admin & API SELALU bebas diakses kapan saja
  if (pathname.startsWith("/admin") || pathname.startsWith("/api")) {
    return <>{children}</>;
  }

  // 2. Jika Mode Pemeliharaan / Coming Soon AKTIF
  const isMaintenance = settings?.maintenanceMode ?? true;

  if (isMaintenance) {
    // Jika admin sedang dalam Mode Pratinjau (Preview Mode)
    if (mounted && isAdminPreview) {
      return (
        <>
          {/* Floating Admin Preview Banner */}
          <div className="bg-amber-500 text-slate-950 font-bold px-4 py-2 text-xs flex items-center justify-between sticky top-0 z-[100] shadow-md border-b border-amber-600">
            <div className="flex items-center gap-2">
              <span className="text-sm">👁️</span>
              <span>
                <strong>MODE PRATINJAU ADMIN AKTIF</strong> — Pengunjung publik saat ini hanya melihat layar resmi Coming Soon.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/admin"
                className="bg-slate-950 hover:bg-slate-800 text-white px-3 py-1 rounded-md text-[11px] font-semibold transition"
              >
                Kembali ke Panel Admin
              </Link>
              <button
                type="button"
                onClick={handleExitPreview}
                className="bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>

          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
        </>
      );
    }

    // Pengunjung Publik: Tampilkan Halaman Resmi Coming Soon
    return <OfficialComingSoon />;
  }

  // 3. Mode Normal (Live Publik): Tampilkan Website Lengkap
  return (
    <>
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </>
  );
}

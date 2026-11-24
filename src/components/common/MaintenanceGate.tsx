"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useArticles } from "@/context/ArticleContext";
import { supabase } from "@/lib/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import OfficialComingSoon from "./OfficialComingSoon";

export default function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Cabang jurnal tampil penuh sebagai laman jurnal itu sendiri:
  // kerangka situs kampus (topbar, Navbar beserta ticker, dan Footer)
  // tidak dirender pada rute /jurnal; pengunjung yang menekan menu
  // Jurnal langsung melihat tampilan jurnal saja. Perilaku gerbang
  // pemeliharaan di bawah tidak berubah untuk rute jurnal.
  const diJurnal = pathname.startsWith("/jurnal");
  const { settings, isSettingsLoaded } = useArticles();
  const [mounted, setMounted] = useState(false);
  const [isAdminPreview, setIsAdminPreview] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;
    let batal = false;

    (async () => {
      const dariUrl = window.location.search.includes("preview=true");
      const dariSimpanan =
        localStorage.getItem("mahad_admin_preview") === "true";
      if (!dariUrl && !dariSimpanan) {
        setIsAdminPreview(false);
        return;
      }

      // Parameter pratinjau sendirian TIDAK cukup: pratinjau hanya sah
      // bila peramban ini memegang sesi admin Supabase yang aktif (sesi
      // yang sama dengan yang diterbitkan server saat admin masuk lewat
      // /admin/login). Tanpa sesi, bendera pratinjau dibuang agar tidak
      // bisa dipakai pengunjung untuk menembus layar Coming Soon.
      const {
        data: { session }
      } = await supabase.auth.getSession();
      if (batal) return;

      if (session) {
        if (dariUrl) {
          localStorage.setItem("mahad_admin_preview", "true");
        }
        setIsAdminPreview(true);
      } else {
        localStorage.removeItem("mahad_admin_preview");
        setIsAdminPreview(false);
      }
    })();

    return () => {
      batal = true;
    };
  }, []);

  const handleExitPreview = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("mahad_admin_preview");
      setIsAdminPreview(false);
    }
  };

  // 1. Rute API
  if (pathname.startsWith("/api")) {
    return <>{children}</>;
  }

  // 2. Rute Admin: Tetap tampilkan Header Navbar & Footer resmi secara penuh
  if (pathname.startsWith("/admin")) {
    return (
      <>
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
      </>
    );
  }

  // 3. Sebelum status pengaturan terverifikasi dari storage/database, render placeholder senyap tanpa flash
  if (!isSettingsLoaded && !mounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 4. Cek apakah Mode Pemeliharaan / Coming Soon AKTIF
  const isMaintenance = settings?.maintenanceMode === true;

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

          {diJurnal ? (
            <div className="flex-1">{children}</div>
          ) : (
            <>
              <Navbar />
              <div className="flex-1">{children}</div>
              <Footer />
            </>
          )}
        </>
      );
    }

    // Pengunjung Publik: Tampilkan Halaman Resmi Coming Soon
    return <OfficialComingSoon />;
  }

  // 5. Mode Normal (Live Publik): Tampilkan Website Lengkap.
  //    Rute jurnal dikecualikan dari kerangka kampus (lihat diJurnal).
  if (diJurnal) {
    return <div className="flex-1">{children}</div>;
  }
  return (
    <>
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </>
  );
}

import Link from "next/link";
import type { ReactNode } from "react";
import { arahLocale, tJurnal } from "@/lib/jurnal/i18n";
import { localeJurnalServer } from "@/lib/jurnal/i18n-server";
import PemilihBahasa from "./pemilih-bahasa";

// Kerangka cabang jurnal VERSI UJI: spanduk penanda uji yang selalu tampil
// di semua halaman /jurnal, plus navigasi internal jurnal. Navbar dan
// Footer web utama tetap datang dari MaintenanceGate di layout akar.
// Tahap 6: kerangka diterjemahkan ke id, en, dan ar; bahasa dipilih
// pemilih bahasa (persisten lewat cookie) dan Arab dirender RTL pada
// wadah jurnal ini.

export default async function JurnalLayout({
  children
}: {
  children: ReactNode;
}) {
  const locale = await localeJurnalServer();
  const t = tJurnal(locale);
  const tautan: { href: string; label: string }[] = [
    { href: "/jurnal", label: t.navBeranda },
    { href: "/jurnal/cari", label: t.navCari },
    { href: "/jurnal/pengumuman", label: t.navPengumuman },
    { href: "/jurnal/halaman/tentang", label: t.navTentang },
    { href: "/jurnal/halaman/fokus-ruang-lingkup", label: t.navFokus },
    { href: "/jurnal/halaman/dewan-redaksi", label: t.navDewan },
    { href: "/jurnal/halaman/pedoman-penulis", label: t.navPedoman },
    { href: "/jurnal/halaman/etika-publikasi", label: t.navEtika },
    { href: "/jurnal/halaman/biaya-lisensi", label: t.navBiaya },
    { href: "/jurnal/terbitan/vol-1-no-1-versi-uji", label: t.navTerbitan },
    { href: "/jurnal/kirim", label: t.navKirim },
    { href: "/jurnal/lacak", label: t.navLacak },
    { href: "/jurnal/daftar", label: t.navDaftar },
    { href: "/jurnal/masuk", label: t.navMasuk },
    { href: "/jurnal/naskah-saya", label: t.navNaskahSaya },
    { href: "/jurnal/review", label: t.navReviewer },
    { href: "/jurnal/panel", label: t.navPanel },
    { href: "/jurnal/oai?verb=Identify", label: "OAI-PMH" }
  ];

  return (
    <main className="pt-32 md:pt-40 lg:pt-60 pb-20 bg-slate-50">
      <div lang={locale} dir={arahLocale(locale)}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          {/* Spanduk penanda versi uji — wajib selalu terlihat */}
          <div
            role="note"
            className="mb-6 rounded-xl border-2 border-amber-500 bg-amber-100 px-4 py-3 text-amber-900 shadow-sm"
          >
            <p className="text-sm sm:text-base font-bold tracking-wide">
              {t.spandukJudul}
            </p>
            <p className="text-xs sm:text-sm mt-1">{t.spandukIsi}</p>
          </div>

          {/* Pemilih bahasa (Tahap 6) */}
          <div className="mb-4 flex justify-end">
            <PemilihBahasa />
          </div>

          {/* Navigasi internal jurnal */}
          <nav aria-label={t.navigasiLabel} className="mb-8 flex flex-wrap gap-2">
            {tautan.map((x) => (
              <Link
                key={x.href}
                href={x.href}
                className="px-3.5 py-2 rounded-full bg-mahad-green-dark text-emerald-100 text-xs sm:text-sm font-semibold hover:bg-mahad-green hover:text-white transition"
              >
                {x.label}
              </Link>
            ))}
          </nav>
        </div>
        {children}
      </div>
    </main>
  );
}

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { arahLocale, tJurnal } from "@/lib/jurnal/i18n";
import { localeJurnalServer } from "@/lib/jurnal/i18n-server";
import {
  JURNAL_NAMA_LABEL_UJI,
  JURNAL_PENERBIT_UJI,
  JURNAL_SUBJUDUL
} from "@/lib/jurnal/konten";
import { HALAMAN_KEBIJAKAN } from "@/lib/jurnal/kebijakan";
import { daftarTerbitanPublik } from "@/lib/jurnal/alur-server";
import PemilihBahasa from "./pemilih-bahasa";

// Kerangka cabang jurnal mengikuti pola situs jurnal pada umumnya
// (model OJS 3): panel atas ramping berbahasa Arab menuju web utama
// kampus, spanduk penanda uji ramping, pita masthead berwarna
// penuh selebar halaman berisi nama jurnal putih dan tautan akun di
// sisi atasnya, bilah navigasi putih berisi menu terbitan, arsip,
// pengumuman, dan tentang plus pencarian, lalu kaki jurnal berisi
// penerbit, alamat redaksi, dan tautan kebijakan serta OAI-PMH.
// Palet memakai warna terukur lambang Ma'had Aly (token jurnal-* di
// globals.css). Cabang jurnal tampil penuh sebagai laman jurnal itu
// sendiri: gerbang kerangka situs (MaintenanceGate) tidak merender
// topbar, Navbar, ticker, dan Footer kampus pada rute /jurnal, jadi
// layout ini tidak lagi membutuhkan bantalan atas kompensasi navbar
// tetap kampus. Bahasa persisten lewat cookie dan Arab dirender RTL
// pada wadah jurnal ini.

const ALAMAT_REDAKSI =
  "Mangkoso, Kecamatan Soppeng Riaja, Kabupaten Barru, Sulawesi Selatan, Indonesia";

async function tautanTerbitanTerkini(): Promise<string> {
  // Tautan "Terbitan Terkini" menunjuk halaman terbitan berjalan bila
  // ada; selain itu jatuh ke jangkar seksi terbitan terkini di beranda.
  // Kegagalan membaca lapisan data tidak boleh menggagalkan kerangka.
  try {
    const terbitan = await daftarTerbitanPublik();
    const berjalan = terbitan.find((t) => t.isCurrent) ?? terbitan[0];
    if (berjalan) return `/jurnal/terbitan/${berjalan.slug}`;
  } catch {
    // Abaikan: tautan jangkar di bawah tetap berfungsi.
  }
  return "/jurnal#terbitan-terkini";
}

export default async function JurnalLayout({
  children
}: {
  children: ReactNode;
}) {
  // Locale dan tautan terbitan terkini saling bebas: jalankan paralel.
  const [locale, hrefTerbitanTerkini] = await Promise.all([
    localeJurnalServer(),
    tautanTerbitanTerkini()
  ]);
  const t = tJurnal(locale);

  const navigasiUtama: { href: string; label: string }[] = [
    { href: hrefTerbitanTerkini, label: t.navTerbitanTerkini },
    { href: "/jurnal#arsip-terbitan", label: t.navArsip },
    { href: "/jurnal/pengumuman", label: t.navPengumuman },
    { href: "/jurnal/halaman/tentang", label: t.navTentang }
  ];

  const navigasiKaki: { href: string; label: string }[] = [
    { href: "/jurnal", label: t.navBeranda },
    { href: "/jurnal/kirim", label: t.navKirim },
    { href: "/jurnal/lacak", label: t.navLacak },
    { href: "/jurnal/naskah-saya", label: t.navNaskahSaya },
    { href: "/jurnal/review", label: t.navReviewer },
    { href: "/jurnal/panel", label: t.navPanel }
  ];

  return (
    <main className="bg-white">
      <div lang={locale} dir={arahLocale(locale)}>
        {/* Panel atas ke web utama kampus. Isinya selalu berbahasa
            Arab apa pun bahasa antarmuka yang dipilih pengunjung,
            karena jurnal ini seluruhnya berbahasa Arab (ketetapan
            user 25 Nov 2026). Tautan ke situs utama di kaki jurnal
            tetap dipertahankan; panel ini jalan tambahan di paling
            atas laman. */}
        <div className="bg-jurnal-hijau text-white">
          <Link
            href="/"
            lang="ar"
            dir="rtl"
            aria-label="الموقع الرئيسي للمعهد العالي"
            className="mx-auto flex max-w-7xl items-center gap-2.5 px-3 py-2 transition hover:bg-jurnal-hijau-gelap sm:px-6 lg:px-8"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 shrink-0 text-jurnal-emas-terang"
            >
              <path d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
            </svg>
            <span className="min-w-0 text-xs leading-relaxed sm:text-sm">
              <strong className="font-bold">
                الموقع الرئيسي للمعهد العالي
              </strong>{" "}
              <span className="text-white/70">
                المعهد العالي لدار الدعوة والإرشاد منجكوسو
              </span>
            </span>
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ms-auto h-4 w-4 shrink-0"
            >
              <path d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
        </div>

        {/* Spanduk penanda versi uji, ramping, selalu terlihat */}
        <div className="border-b border-amber-300 bg-amber-50">
          <div
            role="note"
            className="mx-auto max-w-7xl px-3 py-2 text-amber-900 sm:px-6 lg:px-8"
          >
            <p className="text-xs leading-relaxed sm:text-sm">
              <strong className="font-bold tracking-wide">
                {t.spandukJudul}
              </strong>
              {": "}
              {t.spandukIsi}
            </p>
          </div>
        </div>

        {/* Pita masthead berwarna penuh: nama jurnal putih, tautan
            akun dan pemilih bahasa di sisi atas pita */}
        <div className="border-b-4 border-jurnal-emas bg-jurnal-hijau-gelap text-white">
          <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 pt-2.5">
              <nav
                aria-label={t.navigasiLabel}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold sm:text-sm"
              >
                <Link href="/jurnal/masuk" className="hover:text-jurnal-emas-terang">
                  {t.navMasuk}
                </Link>
                <Link href="/jurnal/daftar" className="hover:text-jurnal-emas-terang">
                  {t.navDaftar}
                </Link>
                <Link href="/jurnal/lacak" className="hover:text-jurnal-emas-terang">
                  {t.navLacak}
                </Link>
              </nav>
              <PemilihBahasa gelap />
            </div>
            <div className="flex items-center gap-4 pb-6 pt-3 sm:gap-5">
              <Image
                src="/image_067524.png"
                alt="Logo Ma'had Aly DDI Mangkoso"
                width={512}
                height={512}
                className="h-14 w-14 shrink-0 rounded-full bg-white p-0.5 sm:h-20 sm:w-20"
              />
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-widest text-jurnal-emas-terang">
                  {t.publikasiIlmiah}
                </p>
                <Link
                  href="/jurnal"
                  className="mt-0.5 block font-serif text-3xl font-bold leading-tight text-white sm:text-5xl"
                >
                  {JURNAL_NAMA_LABEL_UJI}
                </Link>
                <p className="mt-1.5 font-serif text-sm text-white/85 sm:text-lg">
                  {JURNAL_SUBJUDUL}
                </p>
                <p className="mt-1 text-xs text-white/65 sm:text-sm">
                  {t.diterbitkanOleh} {JURNAL_PENERBIT_UJI}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bilah navigasi putih dan kotak cari */}
        <div className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center px-3 sm:px-6 lg:px-8">
            <nav
              aria-label={t.navigasiLabel}
              className="flex flex-wrap items-center"
            >
              {navigasiUtama.map((x) => (
                <Link
                  key={x.label}
                  href={x.href}
                  className="px-3 py-3 text-[13px] font-bold uppercase tracking-wide text-jurnal-hijau-gelap transition hover:bg-jurnal-hijau/5 hover:text-jurnal-hijau sm:px-4 sm:text-sm"
                >
                  {x.label}
                </Link>
              ))}
            </nav>
            <form
              action="/jurnal/cari"
              method="get"
              className="ms-auto flex items-center py-2"
            >
              <input
                type="search"
                name="q"
                aria-label={t.navCari}
                placeholder={t.navCariPlaceholder}
                className="w-36 rounded-s-md border border-slate-300 px-3 py-1.5 text-sm text-slate-800 focus:border-jurnal-hijau focus:outline-none sm:w-52"
              />
              <button
                type="submit"
                className="rounded-e-md bg-jurnal-hijau px-3.5 py-1.5 text-sm font-bold text-white transition hover:bg-jurnal-hijau-gelap"
              >
                {t.cariTombol}
              </button>
            </form>
          </div>
        </div>

        {children}

        {/* Kaki jurnal */}
        <footer className="mt-16 bg-jurnal-hijau-gelap text-white/75">
          <div className="mx-auto grid max-w-7xl gap-10 px-3 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
            <div>
              <p className="font-serif text-xl font-bold leading-snug text-white">
                {JURNAL_NAMA_LABEL_UJI}
              </p>
              <p className="mt-2 font-serif text-sm text-white/85">
                {JURNAL_SUBJUDUL}
              </p>
              <p className="mt-4 text-sm leading-relaxed">
                <span className="font-semibold text-white">
                  {t.alamatRedaksiLabel}
                </span>
                <br />
                {ALAMAT_REDAKSI}
              </p>
              <p className="mt-3 text-sm leading-relaxed">
                {t.diterbitkanOleh} {JURNAL_PENERBIT_UJI}
              </p>
              <p className="mt-4 text-sm">
                <Link
                  href="/"
                  className="font-semibold text-white underline-offset-4 transition hover:text-jurnal-emas-terang hover:underline"
                >
                  {t.kakiSitusUtama}
                </Link>
              </p>
            </div>
            <nav aria-label={t.kakiNavigasi}>
              <p className="font-serif text-base font-bold text-white">
                {t.kakiNavigasi}
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                {navigasiKaki.map((x) => (
                  <li key={x.href}>
                    <Link href={x.href} className="hover:text-jurnal-emas-terang">
                      {x.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label={t.kakiKebijakan}>
              <p className="font-serif text-base font-bold text-white">
                {t.kakiKebijakan}
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                {HALAMAN_KEBIJAKAN.map((h) => (
                  <li key={h.slug}>
                    <Link
                      href={`/jurnal/halaman/${h.slug}`}
                      className="hover:text-jurnal-emas-terang"
                    >
                      {h.judul}
                    </Link>
                  </li>
                ))}
                <li>
                  <a
                    href="/jurnal/oai?verb=Identify"
                    className="hover:text-jurnal-emas-terang"
                  >
                    OAI-PMH
                  </a>
                </li>
              </ul>
            </nav>
          </div>
          <div className="border-t border-white/15">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-3 py-4 text-xs sm:px-6 lg:px-8">
              <p>{t.kakiLisensiTeks}</p>
              <p className="font-semibold tracking-wide">{t.spandukJudul}</p>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

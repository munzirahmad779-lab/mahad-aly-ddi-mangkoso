import Link from "next/link";
import type { ReactNode } from "react";

// Kerangka cabang jurnal VERSI UJI: spanduk penanda uji yang selalu tampil
// di semua halaman /jurnal, plus navigasi internal jurnal. Navbar dan
// Footer web utama tetap datang dari MaintenanceGate di layout akar.

const TAUTAN_JURNAL = [
  { href: "/jurnal", label: "Beranda Jurnal" },
  { href: "/jurnal/cari", label: "Cari Artikel" },
  { href: "/jurnal/pengumuman", label: "Pengumuman" },
  { href: "/jurnal/halaman/tentang", label: "Tentang Jurnal" },
  { href: "/jurnal/halaman/fokus-ruang-lingkup", label: "Fokus dan Ruang Lingkup" },
  { href: "/jurnal/halaman/dewan-redaksi", label: "Dewan Redaksi" },
  { href: "/jurnal/halaman/pedoman-penulis", label: "Pedoman Penulis" },
  { href: "/jurnal/halaman/etika-publikasi", label: "Etika Publikasi" },
  { href: "/jurnal/halaman/biaya-lisensi", label: "Biaya dan Lisensi" },
  { href: "/jurnal/terbitan/vol-1-no-1-versi-uji", label: "Terbitan" },
  { href: "/jurnal/kirim", label: "Kirim Naskah" },
  { href: "/jurnal/lacak", label: "Lacak Naskah" },
  { href: "/jurnal/daftar", label: "Daftar Penulis" },
  { href: "/jurnal/masuk", label: "Masuk Penulis" },
  { href: "/jurnal/naskah-saya", label: "Naskah Saya" },
  { href: "/jurnal/review", label: "Dasbor Reviewer" },
  { href: "/jurnal/panel", label: "Panel Redaksi" },
  { href: "/jurnal/oai?verb=Identify", label: "OAI-PMH" }
];

export default function JurnalLayout({ children }: { children: ReactNode }) {
  return (
    <main className="pt-32 md:pt-40 lg:pt-60 pb-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Spanduk penanda versi uji — wajib selalu terlihat */}
        <div
          role="note"
          className="mb-6 rounded-xl border-2 border-amber-500 bg-amber-100 px-4 py-3 text-amber-900 shadow-sm"
        >
          <p className="text-sm sm:text-base font-bold tracking-wide">
            VERSI UJI — BUKAN SITUS RESMI
          </p>
          <p className="text-xs sm:text-sm mt-1">
            Ini versi uji cabang jurnal kustom Ma&apos;had Aly DDI Mangkoso.
            Nama jurnal masih berupa usulan, seluruh artikel adalah contoh
            bertanda contoh, dan data naskah tersimpan di lapisan data uji
            terpisah (tidak masuk basis data produksi kampus).
          </p>
        </div>

        {/* Navigasi internal jurnal */}
        <nav
          aria-label="Navigasi jurnal versi uji"
          className="mb-8 flex flex-wrap gap-2"
        >
          {TAUTAN_JURNAL.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="px-3.5 py-2 rounded-full bg-mahad-green-dark text-emerald-100 text-xs sm:text-sm font-semibold hover:bg-mahad-green hover:text-white transition"
            >
              {t.label}
            </Link>
          ))}
        </nav>
      </div>
      {children}
    </main>
  );
}

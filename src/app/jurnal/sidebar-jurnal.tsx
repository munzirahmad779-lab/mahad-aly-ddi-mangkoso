import Link from "next/link";
import type { ReactNode } from "react";
import { tJurnal } from "@/lib/jurnal/i18n";
import { localeJurnalServer } from "@/lib/jurnal/i18n-server";
import {
  JURNAL_FOKUS_DAN_RUANG_LINGKUP,
  JURNAL_PENERBIT_UJI
} from "@/lib/jurnal/konten";
import { JURNAL_BAGIAN } from "@/lib/jurnal/wizard";

// Sidebar halaman publik jurnal mengikuti pola sidebar situs jurnal
// pada umumnya (model OJS 3): tombol kirim naskah berwarna mencolok
// di paling atas, lalu blok-blok bertajuk berisi tautan penulis,
// informasi jurnal, jelajah bagian, dan ringkasan fokus. Semua tautan
// menunjuk halaman yang sudah ada; tidak ada kontrol mati.

function Blok({
  judul,
  children
}: {
  judul: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-sm border border-slate-200 bg-white shadow-sm">
      <h2 className="bg-jurnal-hijau-gelap px-4 py-2.5 text-center font-serif text-[15px] font-bold text-white">
        {judul}
      </h2>
      <div className="p-4">{children}</div>
    </section>
  );
}

function BarisTautan({
  href,
  children
}: {
  href: string;
  children: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="block px-1 py-2 text-sm text-slate-700 transition hover:text-jurnal-hijau hover:underline"
      >
        {children}
      </Link>
    </li>
  );
}

export async function SidebarJurnal() {
  const locale = await localeJurnalServer();
  const t = tJurnal(locale);
  return (
    <aside className="space-y-6">
      {/* Kirim naskah */}
      <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-sm">
        <Link
          href="/jurnal/kirim"
          className="block rounded-sm bg-jurnal-hijau px-5 py-3.5 text-center text-sm font-bold uppercase tracking-wide text-white transition hover:bg-jurnal-hijau-gelap"
        >
          {t.kirimNaskah}
        </Link>
        <Link
          href="/jurnal/lacak"
          className="mt-2.5 block rounded-sm border border-slate-300 px-5 py-2.5 text-center text-sm font-semibold text-slate-700 transition hover:border-jurnal-hijau-gelap hover:text-jurnal-hijau-gelap"
        >
          {t.lacakNaskah}
        </Link>
      </div>

      {/* Untuk penulis */}
      <Blok judul={t.sidebarPenulisJudul}>
        <ul className="divide-y divide-slate-100">
          <BarisTautan href="/jurnal/halaman/pedoman-penulis">
            {t.navPedoman}
          </BarisTautan>
          <BarisTautan href="/jurnal/halaman/etika-publikasi">
            {t.navEtika}
          </BarisTautan>
          <BarisTautan href="/jurnal/halaman/biaya-lisensi">
            {t.navBiaya}
          </BarisTautan>
          <BarisTautan href="/jurnal/daftar">{t.navDaftar}</BarisTautan>
        </ul>
      </Blok>

      {/* Informasi jurnal */}
      <Blok judul={t.sidebarInfoJudul}>
        <dl className="space-y-2.5 text-sm">
          <div>
            <dt className="font-semibold text-slate-500">
              {t.sidebarPenerbit}
            </dt>
            <dd className="mt-0.5 text-slate-700">{JURNAL_PENERBIT_UJI}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-500">
              {t.sidebarFrekuensi}
            </dt>
            <dd className="mt-0.5 text-slate-700">
              {t.sidebarFrekuensiNilai}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-500">e-ISSN</dt>
            <dd className="mt-0.5 text-slate-700">{t.sidebarEissnNilai}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-500">
              {t.sidebarLisensi}
            </dt>
            <dd className="mt-0.5 text-slate-700">
              <Link
                href="/jurnal/halaman/biaya-lisensi"
                className="text-jurnal-hijau hover:underline"
              >
                CC BY 4.0
              </Link>
            </dd>
          </div>
        </dl>
        <ul className="mt-3 divide-y divide-slate-100 border-t border-slate-100">
          <BarisTautan href="/jurnal/halaman/dewan-redaksi">
            {t.navDewan}
          </BarisTautan>
          <BarisTautan href="/jurnal/halaman/tentang">
            {t.navTentang}
          </BarisTautan>
        </ul>
      </Blok>

      {/* Jelajah bagian */}
      <Blok judul={t.sidebarBagianJudul}>
        <ul className="divide-y divide-slate-100">
          {JURNAL_BAGIAN.map((b) => (
            <BarisTautan key={b.slug} href={`/jurnal/bagian/${b.slug}`}>
              {b.judulId}
            </BarisTautan>
          ))}
        </ul>
      </Blok>

      {/* Fokus dan ruang lingkup ringkas */}
      <Blok judul={t.fokusDanRuangLingkup}>
        <ul className="space-y-1.5 text-sm text-slate-700">
          {JURNAL_FOKUS_DAN_RUANG_LINGKUP[locale].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="font-bold text-jurnal-emas">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <Link
          href="/jurnal/halaman/fokus-ruang-lingkup"
          className="mt-3 inline-block text-sm font-semibold text-jurnal-hijau hover:underline"
        >
          {t.sidebarSelengkapnya}
        </Link>
      </Blok>
    </aside>
  );
}

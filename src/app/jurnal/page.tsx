import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  JURNAL_FOKUS_DAN_RUANG_LINGKUP,
  JURNAL_NAMA_LABEL_UJI,
  JURNAL_NAMA_PLACEHOLDER,
  JURNAL_PENERBIT_UJI,
  JURNAL_SUBJUDUL
} from "@/lib/jurnal/konten";
import { daftarTerbitanPublik } from "@/lib/jurnal/alur-server";
import { daftarPengumumanPublik } from "@/lib/jurnal/publik5-server";
import {
  tJurnal,
  type JurnalDict,
  type JurnalLocale
} from "@/lib/jurnal/i18n";
import { localeJurnalServer } from "@/lib/jurnal/i18n-server";
import { KerangkaPublik } from "./kerangka-publik";
import { DaftarArtikelPublik } from "./daftar-artikel";
import { SampulTerbitan } from "./sampul-terbitan";
import type { JurnalTerbitanPublik } from "@/lib/jurnal/alur";

// Beranda jurnal mengikuti pola beranda situs jurnal pada umumnya
// (model OJS 3): banner nama jurnal, blok tentang berisi sampul dan
// tabel informasi jurnal, terbitan terkini beserta daftar isinya,
// artikel terbaru, pengumuman terbaru, dan arsip terbitan. Semua daftar membaca
// basis data lewat lapisan store: hanya terbitan berstatus published
// beserta artikel published di dalamnya yang tampil.

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Turatsuna (Usulan Nama - Versi Uji) | Jurnal Ma'had Aly DDI Mangkoso",
  description:
    "Versi uji cabang jurnal kustom Ma'had Aly DDI Mangkoso: jurnal fiqh, ushul fiqh, dan kajian turats. Nama masih usulan.",
  alternates: { canonical: "/jurnal" },
  robots: { index: false, follow: false }
};

function JudulSeksi({ children }: { children: string }) {
  return (
    <h2 className="mb-5 border-b-2 border-jurnal-hijau-gelap pb-2 font-serif text-xl font-bold text-jurnal-hijau-gelap sm:text-2xl">
      {children}
    </h2>
  );
}

function tanggalTampil(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function BannerJurnal() {
  // Banner lebar di bawah navigasi mengikuti pola beranda situs
  // jurnal pada umumnya: pita hijau tua bermotif halus berisi nama
  // jurnal, subjudul, dan penerbit. Tanpa angka ISSN karena e-ISSN
  // jurnal ini belum terbit.
  return (
    <section className="relative overflow-hidden bg-jurnal-hijau-gelap text-white">
      <div
        className="bg-islamic-pattern absolute inset-0 opacity-50"
        aria-hidden="true"
      />
      <div className="relative px-5 py-8 text-center sm:py-10">
        <p className="font-serif text-3xl font-bold sm:text-4xl">
          {JURNAL_NAMA_PLACEHOLDER}
        </p>
        <div className="mx-auto mt-3 h-0.5 w-24 bg-jurnal-emas" />
        <p className="mt-3 font-serif text-base text-white/90 sm:text-lg">
          {JURNAL_SUBJUDUL}
        </p>
        <p className="mt-1.5 text-xs text-white/65 sm:text-sm">
          {JURNAL_PENERBIT_UJI}
        </p>
      </div>
    </section>
  );
}

function InfoJurnal({
  teks,
  locale,
  labelSampul
}: {
  teks: JurnalDict;
  locale: JurnalLocale;
  labelSampul: string;
}) {
  // Blok pembuka beranda mengikuti pola halaman tentang situs jurnal:
  // sampul terbitan di sisi awal dan tabel informasi jurnal di
  // sampingnya, disusul uraian tentang dan fokus ringkas. Semua nilai
  // tabel adalah fakta yang sudah ada; e-ISSN dinyatakan belum
  // terbit apa adanya.
  const baris: { label: string; nilai: ReactNode }[] = [
    { label: teks.infoNamaLabel, nilai: JURNAL_NAMA_LABEL_UJI },
    { label: teks.sidebarPenerbit, nilai: JURNAL_PENERBIT_UJI },
    { label: teks.sidebarFrekuensi, nilai: teks.sidebarFrekuensiNilai },
    { label: teks.infoBahasaLabel, nilai: teks.infoBahasaNilai },
    { label: "e-ISSN", nilai: teks.sidebarEissnNilai },
    {
      label: teks.sidebarLisensi,
      nilai: (
        <Link
          href="/jurnal/halaman/biaya-lisensi"
          className="font-semibold text-jurnal-hijau hover:underline"
        >
          CC BY 4.0
        </Link>
      )
    }
  ];
  return (
    <section>
      <JudulSeksi>{teks.navTentang}</JudulSeksi>
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="w-40 shrink-0 sm:w-48">
          <SampulTerbitan label={labelSampul} />
        </div>
        <div className="min-w-0 flex-1">
          <table className="w-full border-collapse text-sm">
            <tbody>
              {baris.map((b, i) => (
                <tr key={b.label} className={i % 2 ? "bg-white" : "bg-jurnal-hijau/5"}>
                  <th
                    scope="row"
                    className="w-36 border border-slate-200 px-3 py-2 text-start align-top font-semibold text-slate-600"
                  >
                    {b.label}
                  </th>
                  <td className="border border-slate-200 px-3 py-2 text-slate-800">
                    {b.nilai}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 text-sm leading-relaxed text-slate-700 sm:text-base">
            {teks.berandaTentangIsi}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-700 sm:text-base">
            {teks.fokusPengantar}
          </p>
          <ul className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {JURNAL_FOKUS_DAN_RUANG_LINGKUP[locale].map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm text-slate-700"
              >
                <span className="font-bold text-jurnal-emas">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/jurnal/halaman/tentang"
            className="mt-4 inline-block text-sm font-semibold text-jurnal-hijau hover:underline"
          >
            {teks.sidebarSelengkapnya}
          </Link>
        </div>
      </div>
    </section>
  );
}

function KepalaTerbitan({
  terbitan,
  teks
}: {
  terbitan: JurnalTerbitanPublik;
  teks: JurnalDict;
}) {
  const tanggal = tanggalTampil(terbitan.tanggalTerbit);
  return (
    <div className="flex flex-col gap-5 sm:flex-row">
      <Link
        href={`/jurnal/terbitan/${terbitan.slug}`}
        className="w-32 shrink-0 sm:w-40"
      >
        <SampulTerbitan label={terbitan.label} />
      </Link>
      <div className="min-w-0">
        <h3 className="font-serif text-xl font-bold leading-snug text-slate-900 sm:text-2xl">
          <Link
            href={`/jurnal/terbitan/${terbitan.slug}`}
            className="transition hover:text-jurnal-hijau-gelap hover:underline"
          >
            {terbitan.label}
          </Link>
          {terbitan.isCurrent && (
            <span className="ms-2 align-middle text-[11px] font-bold uppercase tracking-wider text-jurnal-hijau">
              {teks.terbitanBerjalan}
            </span>
          )}
        </h3>
        {tanggal && (
          <p className="mt-1 text-sm text-slate-500">
            {teks.labelTanggal}: {tanggal}
          </p>
        )}
        {terbitan.uraian && (
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {terbitan.uraian}
          </p>
        )}
        <p className="mt-2 text-sm text-slate-500">
          {terbitan.artikel.length} {teks.satuanArtikel}
        </p>
      </div>
    </div>
  );
}

export default async function JurnalBerandaPage() {
  const locale = await localeJurnalServer();
  const teks = tJurnal(locale);
  const terbitan = await daftarTerbitanPublik();
  const pengumuman = (await daftarPengumumanPublik()).slice(0, 3);
  const terkini = terbitan.find((t) => t.isCurrent) ?? terbitan[0] ?? null;
  const artikelTerbaru = terbitan
    .flatMap((t) => t.artikel)
    .sort((a, b) => (a.tanggalTerbit < b.tanggalTerbit ? 1 : -1))
    .slice(0, 5);

  return (
    <KerangkaPublik>
      <div className="space-y-12">
        <BannerJurnal />

        {/* Tentang jurnal: sampul dan tabel informasi */}
        <InfoJurnal
          teks={teks}
          locale={locale}
          labelSampul={terkini?.label ?? JURNAL_NAMA_PLACEHOLDER}
        />

        {/* Terbitan terkini beserta daftar isinya */}
        <section id="terbitan-terkini">
          <JudulSeksi>{teks.navTerbitanTerkini}</JudulSeksi>
          {terkini === null ? (
            <p className="border border-slate-200 p-5 text-sm text-slate-500">
              {teks.belumAdaTerbitan}
            </p>
          ) : (
            <>
              <KepalaTerbitan terbitan={terkini} teks={teks} />
              <div className="mt-6">
                <DaftarArtikelPublik
                  artikel={terkini.artikel}
                  kosong={teks.belumAdaArtikel}
                  ringkas
                />
              </div>
            </>
          )}
        </section>

        {/* Artikel terbaru lintas terbitan */}
        <section>
          <JudulSeksi>{teks.artikelTerbaru}</JudulSeksi>
          <DaftarArtikelPublik
            artikel={artikelTerbaru}
            kosong={teks.belumAdaArtikel}
          />
        </section>

        {/* Pengumuman terbaru */}
        {pengumuman.length > 0 && (
          <section>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-2 border-b-2 border-jurnal-hijau-gelap pb-2">
              <h2 className="font-serif text-xl font-bold text-jurnal-hijau-gelap sm:text-2xl">
                {teks.pengumuman}
              </h2>
              <Link
                href="/jurnal/pengumuman"
                className="text-sm font-semibold text-jurnal-hijau hover:underline"
              >
                {teks.semuaPengumuman}
              </Link>
            </div>
            <div className="divide-y divide-slate-200 border-y border-slate-200">
              {pengumuman.map((p) => (
                <article key={p.id} className="py-4">
                  <h3 className="font-serif text-lg font-bold text-slate-900">
                    {p.judul}
                  </h3>
                  {p.diterbitkanPada && (
                    <p className="mt-0.5 text-xs text-slate-400">
                      {tanggalTampil(p.diterbitkanPada)}
                    </p>
                  )}
                  <p className="mt-1.5 line-clamp-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                    {p.isi}
                  </p>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Arsip terbitan */}
        <section id="arsip-terbitan">
          <JudulSeksi>{teks.navArsip}</JudulSeksi>
          {terbitan.length === 0 ? (
            <p className="border border-slate-200 p-5 text-sm text-slate-500">
              {teks.belumAdaTerbitan}
            </p>
          ) : (
            <div className="divide-y divide-slate-200 border-y border-slate-200">
              {terbitan.map((t) => (
                <div key={t.slug} className="flex gap-4 py-4">
                  <Link
                    href={`/jurnal/terbitan/${t.slug}`}
                    className="w-20 shrink-0"
                  >
                    <SampulTerbitan label={t.label} mini />
                  </Link>
                  <div className="min-w-0">
                    <h3 className="font-serif text-lg font-bold leading-snug text-slate-900">
                      <Link
                        href={`/jurnal/terbitan/${t.slug}`}
                        className="transition hover:text-jurnal-hijau-gelap hover:underline"
                      >
                        {t.label}
                      </Link>
                      {t.isCurrent && (
                        <span className="ms-2 align-middle text-[11px] font-bold uppercase tracking-wider text-jurnal-hijau">
                          {teks.terbitanBerjalan}
                        </span>
                      )}
                    </h3>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {tanggalTampil(t.tanggalTerbit) ?? t.tahun} •{" "}
                      {t.artikel.length} {teks.satuanArtikel}
                    </p>
                    {t.uraian && (
                      <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                        {t.uraian}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </KerangkaPublik>
  );
}

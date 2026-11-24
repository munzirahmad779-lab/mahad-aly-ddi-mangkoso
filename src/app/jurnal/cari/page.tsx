import type { Metadata } from "next";
import { JURNAL_BAGIAN } from "@/lib/jurnal/wizard";
import {
  cariArtikelPublik
} from "@/lib/jurnal/publik5-server";
import { daftarTerbitanPublik } from "@/lib/jurnal/alur-server";
import { DaftarArtikelPublik } from "../daftar-artikel";
import { KerangkaPublik } from "../kerangka-publik";
import { tJurnal } from "@/lib/jurnal/i18n";
import { localeJurnalServer } from "@/lib/jurnal/i18n-server";

// Pencarian artikel jurnal (Tahap 5): hanya artikel published yang
// dicari, atas judul, abstrak, kata kunci, dan nama penulis. Pada mode
// supabase pencarian berjalan dengan ilike terlarikan di basis data;
// hasil akhir selalu disaring ulang oleh gerbang published lapisan
// publik, jadi artikel belum terbit tidak pernah muncul.

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pencarian Artikel | Turatsuna (Usulan Nama - Versi Uji)",
  robots: { index: false, follow: false }
};

const kelasInput =
  "rounded-md border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-jurnal-hijau-gelap";

export default async function CariArtikelPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; bagian?: string; terbitan?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const bagian = (sp.bagian ?? "").trim();
  const terbitanSlug = (sp.terbitan ?? "").trim();
  const [terbitan, hasil] = await Promise.all([
    daftarTerbitanPublik(),
    cariArtikelPublik({
      q,
      bagianSlug: bagian || null,
      terbitanSlug: terbitanSlug || null
    })
  ]);
  const mencari = Boolean(q || bagian || terbitanSlug);
  const teks = tJurnal(await localeJurnalServer());

  return (
    <KerangkaPublik>
      <h1 className="border-b-2 border-jurnal-hijau-gelap pb-2 font-serif text-2xl font-bold text-jurnal-hijau-gelap sm:text-3xl">
        {teks.cariJudul}
      </h1>
      <form
        method="get"
        className="mt-6 flex flex-wrap items-end gap-3 border border-slate-200 p-5"
      >
        <label className="flex-1 min-w-56 block">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {teks.kataKunci}
          </span>
          <input
            name="q"
            defaultValue={q}
            placeholder={teks.cariPlaceholder}
            className={`${kelasInput} mt-1 w-full`}
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {teks.saringBagian}
          </span>
          <select
            name="bagian"
            defaultValue={bagian}
            className={`${kelasInput} mt-1`}
          >
            <option value="">{teks.semuaPilihan} {teks.saringBagian}</option>
            {JURNAL_BAGIAN.map((b) => (
              <option key={b.slug} value={b.slug}>
                {b.judulId}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {teks.saringTerbitan}
          </span>
          <select
            name="terbitan"
            defaultValue={terbitanSlug}
            className={`${kelasInput} mt-1`}
          >
            <option value="">{teks.semuaPilihan} {teks.saringTerbitan}</option>
            {terbitan.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="bg-jurnal-hijau-gelap px-5 py-2.5 text-sm font-bold text-white transition hover:bg-jurnal-hijau"
        >
          {teks.cariTombol}
        </button>
      </form>

      <div className="mt-8">
        <p className="mb-4 text-sm text-slate-500">
          {mencari
            ? `${hasil.length} ${teks.hasilDitemukan}.`
            : `${hasil.length} ${teks.hasilDitemukan}.`}
        </p>
        <DaftarArtikelPublik artikel={hasil} kosong={teks.tidakDitemukan} />
      </div>
    </KerangkaPublik>
  );
}

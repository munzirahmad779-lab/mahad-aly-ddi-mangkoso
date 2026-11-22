import type { Metadata } from "next";
import { JURNAL_BAGIAN } from "@/lib/jurnal/wizard";
import {
  cariArtikelPublik
} from "@/lib/jurnal/publik5-server";
import { daftarTerbitanPublik } from "@/lib/jurnal/alur-server";
import { DaftarArtikelPublik } from "../daftar-artikel";

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
  "rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-mahad-gold";

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

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8">
      <h1 className="font-serif font-bold text-2xl sm:text-3xl text-mahad-green-dark">
        Pencarian Artikel
      </h1>
      <form
        method="get"
        className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-wrap gap-3 items-end"
      >
        <label className="flex-1 min-w-56 block">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Kata kunci
          </span>
          <input
            name="q"
            defaultValue={q}
            placeholder="Judul, abstrak, kata kunci, atau nama penulis"
            className={`${kelasInput} mt-1 w-full`}
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Bagian
          </span>
          <select
            name="bagian"
            defaultValue={bagian}
            className={`${kelasInput} mt-1`}
          >
            <option value="">Semua bagian</option>
            {JURNAL_BAGIAN.map((b) => (
              <option key={b.slug} value={b.slug}>
                {b.judulId}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Terbitan
          </span>
          <select
            name="terbitan"
            defaultValue={terbitanSlug}
            className={`${kelasInput} mt-1`}
          >
            <option value="">Semua terbitan</option>
            {terbitan.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="bg-mahad-gold hover:bg-yellow-400 text-mahad-green-dark font-bold text-sm px-5 py-2.5 rounded-full shadow transition"
        >
          Cari
        </button>
      </form>

      <div className="mt-8">
        <p className="text-sm text-slate-500 mb-4">
          {mencari
            ? `${hasil.length} artikel terbit cocok dengan pencarian.`
            : `${hasil.length} artikel terbit tersedia.`}
        </p>
        <DaftarArtikelPublik
          artikel={hasil}
          kosong="Tidak ada artikel terbit yang cocok. Coba kata kunci atau saringan lain."
        />
      </div>
    </div>
  );
}

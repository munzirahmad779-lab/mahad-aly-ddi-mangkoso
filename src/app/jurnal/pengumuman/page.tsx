import type { Metadata } from "next";
import { daftarPengumumanPublik } from "@/lib/jurnal/publik5-server";
import { tJurnal } from "@/lib/jurnal/i18n";
import { localeJurnalServer } from "@/lib/jurnal/i18n-server";
import { KerangkaPublik } from "../kerangka-publik";

// Halaman pengumuman publik jurnal: hanya pengumuman yang ditayangkan
// staf dan belum kedaluwarsa yang tampil, ditegakkan di fasad server.

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pengumuman | Turatsuna (Usulan Nama - Versi Uji)",
  robots: { index: false, follow: false }
};

export default async function PengumumanJurnalPage() {
  const pengumuman = await daftarPengumumanPublik();
  const teks = tJurnal(await localeJurnalServer());
  return (
    <KerangkaPublik>
      <h1 className="border-b-2 border-jurnal-hijau-gelap pb-2 font-serif text-2xl font-bold text-jurnal-hijau-gelap sm:text-3xl">
        {teks.pengumumanJudul}
      </h1>
      <div className="mt-4">
        {pengumuman.length === 0 && (
          <p className="border border-slate-200 p-5 text-sm text-slate-500">
            {teks.belumAdaPengumuman}
          </p>
        )}
        {pengumuman.length > 0 && (
          <div className="divide-y divide-slate-200 border-y border-slate-200">
          {pengumuman.map((p) => (
            <article key={p.id} className="py-5">
              <h2 className="font-serif text-lg font-bold text-slate-900">
                {p.judul}
              </h2>
              {p.diterbitkanPada && (
                <p className="mt-0.5 text-xs text-slate-400">
                  {new Date(p.diterbitkanPada).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}
                </p>
              )}
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700 sm:text-base">
                {p.isi}
              </p>
            </article>
          ))}
          </div>
        )}
      </div>
    </KerangkaPublik>
  );
}

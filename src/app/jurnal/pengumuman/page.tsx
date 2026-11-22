import type { Metadata } from "next";
import { daftarPengumumanPublik } from "@/lib/jurnal/publik5-server";

// Halaman pengumuman publik jurnal (Tahap 5): hanya pengumuman yang
// ditayangkan staf dan belum kedaluwarsa yang tampil, ditegakkan di
// fasad server.

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pengumuman | Turatsuna (Usulan Nama - Versi Uji)",
  robots: { index: false, follow: false }
};

export default async function PengumumanJurnalPage() {
  const pengumuman = await daftarPengumumanPublik();
  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8">
      <h1 className="font-serif font-bold text-2xl sm:text-3xl text-mahad-green-dark">
        Pengumuman
      </h1>
      <div className="mt-8 space-y-4">
        {pengumuman.length === 0 && (
          <p className="text-sm text-slate-500 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            Belum ada pengumuman yang tayang.
          </p>
        )}
        {pengumuman.map((p) => (
          <article
            key={p.id}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
          >
            <h2 className="font-serif font-bold text-lg text-slate-800">
              {p.judul}
            </h2>
            {p.diterbitkanPada && (
              <p className="text-xs text-slate-400 mt-1">
                {new Date(p.diterbitkanPada).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric"
                })}
              </p>
            )}
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed mt-3 whitespace-pre-line">
              {p.isi}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}

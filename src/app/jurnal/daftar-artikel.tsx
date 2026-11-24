import Link from "next/link";
import type { JurnalArtikelPublik } from "@/lib/jurnal/alur";
import { tJurnal } from "@/lib/jurnal/i18n";
import { localeJurnalServer } from "@/lib/jurnal/i18n-server";
import { RentangHalaman } from "./rentang-halaman";

// Daftar artikel publik bersama untuk beranda, daftar isi terbitan,
// pencarian, dan jelajah bagian. Tampilannya mengikuti pola daftar isi
// situs jurnal pada umumnya: baris-baris terpisah garis tipis berisi
// judul, penulis, keterangan terbitan dan halaman, serta tombol galley
// PDF dan HTML bila tersedia. Hanya menerima artikel yang sudah lolos
// gerbang published dari lapisan data; komponen ini tidak menyaring
// apa pun sendiri. Prop ringkas menyembunyikan abstrak (untuk daftar
// isi terbitan).

export async function DaftarArtikelPublik({
  artikel,
  kosong,
  ringkas = false
}: {
  artikel: JurnalArtikelPublik[];
  kosong: string;
  ringkas?: boolean;
}) {
  const t = tJurnal(await localeJurnalServer());
  if (artikel.length === 0) {
    return (
      <p className="border border-slate-200 p-5 text-sm text-slate-500">
        {kosong}
      </p>
    );
  }
  return (
    <div className="divide-y divide-slate-200 border-y border-slate-200">
      {artikel.map((a) => (
        <article key={a.slug} className="py-5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            {a.bagianLabel && (
              <span className="bg-jurnal-emas-muda px-2 py-0.5 font-bold uppercase tracking-wider text-jurnal-hijau-gelap">
                {a.bagianLabel}
              </span>
            )}
            <span className="text-slate-500">
              {a.terbitanLabel}
              {a.halaman && (
                <>
                  {" • "}
                  {t.halamanLabel}{" "}
                  <RentangHalaman halaman={a.halaman} />
                </>
              )}
            </span>
          </div>
          <h3 className="mt-2 font-serif text-lg font-bold leading-snug text-slate-900">
            <Link
              href={`/jurnal/artikel/${a.slug}`}
              className="transition hover:text-jurnal-hijau-gelap hover:underline"
            >
              {a.judul}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            {a.penulis.map((p) => p.nama).join(", ")}
            {a.afiliasiUtama && (
              <span className="text-slate-400"> — {a.afiliasiUtama}</span>
            )}
          </p>
          {!ringkas && (
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">
              {a.abstrak}
            </p>
          )}
          {(a.punyaPdf || a.punyaHtml) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {a.punyaPdf && (
                <a
                  href={`/jurnal/artikel/${a.slug}/pdf`}
                  className="bg-jurnal-hijau-gelap px-4 py-1.5 text-xs font-bold text-white transition hover:bg-jurnal-hijau"
                >
                  {t.bacaPdf}
                </a>
              )}
              {a.punyaHtml && (
                <a
                  href={`/jurnal/artikel/${a.slug}/html`}
                  target="_blank"
                  rel="noreferrer"
                  className="border border-slate-300 px-4 py-1.5 text-xs font-bold text-slate-700 transition hover:border-jurnal-hijau-gelap hover:text-jurnal-hijau-gelap"
                >
                  {t.bacaHtml}
                </a>
              )}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}

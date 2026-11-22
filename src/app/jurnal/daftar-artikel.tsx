import Link from "next/link";
import type { JurnalArtikelPublik } from "@/lib/jurnal/alur";

// Daftar artikel publik bersama untuk beranda, pencarian, dan jelajah
// bagian. Hanya menerima artikel yang sudah lolos gerbang published
// dari lapisan data; komponen ini tidak menyaring apa pun sendiri.

export function DaftarArtikelPublik({
  artikel,
  kosong
}: {
  artikel: JurnalArtikelPublik[];
  kosong: string;
}) {
  if (artikel.length === 0) {
    return <p className="text-sm text-slate-500">{kosong}</p>;
  }
  return (
    <div className="grid gap-4">
      {artikel.map((a) => (
        <article
          key={a.slug}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
        >
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
            {a.bagianLabel && (
              <span className="bg-mahad-gold-light text-mahad-green-dark px-2.5 py-0.5 rounded-full">
                {a.bagianLabel}
              </span>
            )}
            <span className="text-slate-400 normal-case tracking-normal font-medium">
              {a.terbitanLabel}
              {a.halaman ? ` • hlm. ${a.halaman}` : ""}
            </span>
          </div>
          <h3 className="font-serif font-bold text-lg text-slate-800 mt-3 leading-snug">
            <Link
              href={`/jurnal/artikel/${a.slug}`}
              className="hover:text-mahad-green transition"
            >
              {a.judul}
            </Link>
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {a.penulis.map((p) => p.nama).join(", ")} — {a.afiliasiUtama}
          </p>
          <p className="text-sm text-slate-600 mt-3 line-clamp-3">
            {a.abstrak}
          </p>
        </article>
      ))}
    </div>
  );
}

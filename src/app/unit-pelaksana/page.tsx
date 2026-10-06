"use client";

import Link from "next/link";

export default function UnitPelaksanaPage() {
  const units = [
    {
      name: "Lembaga Bahtsul Masail (LBM)",
      desc: "Unit pengkajian fatwa dan musyawarah hukum atas persoalan masyarakat modern berbasis metodologi istinbath Syafi'iyyah.",
      link: "/bahtsul-masail"
    },
    {
      name: "LP2M (Lembaga Penelitian & Pengabdian Masyarakat)",
      desc: "Mengelola publikasi jurnal, riset skripsi mahasantri, dan dakwah pengabdian keumatan di kawasan Indonesia Timur.",
      link: "/skripsi"
    },
    {
      name: "e-Library & Maktabah Turats",
      desc: "Pusat inventarisasi ribuan judul kitab rujukan klasik serta digitalisasi manuskrip karya Anregurutta.",
      link: "/elibrary"
    },
    {
      name: "Media Centre & Publikasi",
      desc: "Pengelola portal Mimbar Kajian online, penerbitan buletin halaqah, dan saluran komunikasi resmi pesantren.",
      link: "/artikel"
    }
  ];

  return (
    <main className="pt-24 pb-20 bg-slate-50 min-h-screen">
      <section className="bg-mahad-green-dark text-white py-14 bg-islamic-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-mahad-gold bg-white/10 px-3.5 py-1 rounded-full">
            Struktur Penunjang Akademik
          </span>
          <h1 className="font-serif font-bold text-3xl sm:text-5xl text-white mt-3">
            Unit Pelaksana Teknis (UPT)
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base max-w-2xl mx-auto mt-2">
            Organisasi pelaksana riset, bahtsul masail, dan perpustakaan Ma&apos;had Aly DDI Mangkoso.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {units.map((u, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-mahad-gold">Unit {i + 1}</span>
                <h3 className="font-serif font-bold text-2xl text-slate-900 mt-1 mb-2">{u.name}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{u.desc}</p>
              </div>
              <Link
                href={u.link}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 pt-3 border-t border-slate-100"
              >
                <span>Buka Layanan Unit</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

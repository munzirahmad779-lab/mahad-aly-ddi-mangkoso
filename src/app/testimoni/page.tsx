import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Testimoni — Ma'had Aly DDI Mangkoso",
  description:
    "Testimoni alumni, mahasantri, dan wali mahasantri tentang Ma'had Aly DDI Mangkoso.",
  // Canonical sendiri wajib ada: tanpa ini halaman mewarisi canonical
  // beranda dari root layout dan dianggap Google sebagai duplikat
  // beranda (temuan audit 9 Nov 2026).
  alternates: { canonical: "/testimoni" },
};

export default function TestimoniPage() {
  return (
    <main className="pt-32 md:pt-40 lg:pt-60 pb-20 bg-slate-50 min-h-screen">
      <section className="bg-mahad-green-dark text-white py-14 bg-islamic-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-mahad-gold bg-white/10 px-3.5 py-1 rounded-full">
            Informasi
          </span>
          <h1 className="font-serif font-bold text-3xl sm:text-5xl text-white mt-3">
            Testimoni
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base max-w-2xl mx-auto mt-2">
            Kesaksian alumni, mahasantri, dan wali mahasantri tentang belajar
            di Ma&apos;had Aly DDI Mangkoso.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-sm sm:text-base text-slate-700 leading-relaxed">
          <p>
            Halaman ini memuat testimoni asli dari alumni, mahasantri, dan wali
            mahasantri Ma&apos;had Aly DDI Mangkoso, ditampilkan apa adanya
            dengan nama dan angkatan pemberinya. Testimoni sedang dikumpulkan
            dari para alumni dan akan diterbitkan di halaman ini begitu
            diterima.
          </p>
          <p>
            Alumni, mahasantri, dan wali yang berkenan memberikan testimoni
            dapat mengirimkannya melalui WhatsApp admin resmi{" "}
            <a
              href="https://wa.me/6285754795186"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-emerald-800 hover:text-emerald-950"
            >
              0857-5479-5186
            </a>
            , disertai nama lengkap dan angkatan atau hubungan dengan
            mahasantri.
          </p>
        </div>
      </div>
    </main>
  );
}

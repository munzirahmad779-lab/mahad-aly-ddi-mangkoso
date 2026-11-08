import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pengambilan Ijazah — Ma'had Aly DDI Mangkoso",
  description:
    "Tata cara dan jadwal pengambilan ijazah Ma'had Aly DDI Mangkoso melalui Bagian Akademik.",
};

export default function PengambilanIjazahPage() {
  return (
    <main className="pt-32 md:pt-40 lg:pt-60 pb-20 bg-slate-50 min-h-screen">
      <section className="bg-mahad-green-dark text-white py-14 bg-islamic-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-mahad-gold bg-white/10 px-3.5 py-1 rounded-full">
            Informasi
          </span>
          <h1 className="font-serif font-bold text-3xl sm:text-5xl text-white mt-3">
            Pengambilan Ijazah
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base max-w-2xl mx-auto mt-2">
            Tata cara dan jadwal pengambilan ijazah Ma&apos;had Aly DDI
            Mangkoso.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8 text-sm sm:text-base text-slate-700 leading-relaxed">
          <section>
            <h2 className="font-serif font-bold text-xl text-slate-900 border-b border-slate-100 pb-3 mb-3">
              Pelayanan Bagian Akademik
            </h2>
            <p>
              Pengambilan ijazah dilayani oleh Bagian Akademik Ma&apos;had Aly
              DDI Mangkoso di kampus Mangkoso, Kabupaten Barru, pada hari dan
              jam layanan kampus. Jadwal pengambilan setiap angkatan diumumkan
              melalui pengumuman resmi kampus.
            </p>
            <p className="mt-3">
              Agar prosesnya lancar, alumni diminta memastikan kewajiban
              administrasinya telah selesai sebelum datang mengambil ijazah.
              Bila berhalangan hadir, pengambilan melalui perwakilan diatur
              langsung dengan Bagian Akademik.
            </p>
          </section>

          <section>
            <h2 className="font-serif font-bold text-xl text-slate-900 border-b border-slate-100 pb-3 mb-3">
              Konfirmasi Jadwal dan Berkas
            </h2>
            <p>
              Untuk memastikan jadwal pengambilan dan kelengkapan berkas,
              hubungi admin resmi Ma&apos;had Aly DDI Mangkoso melalui WhatsApp{" "}
              <a
                href="https://wa.me/6285754795186"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-emerald-800 hover:text-emerald-950"
              >
                0857-5479-5186
              </a>{" "}
              sebelum datang ke kampus.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

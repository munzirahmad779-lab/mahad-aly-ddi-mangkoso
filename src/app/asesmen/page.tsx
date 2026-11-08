import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Asesmen — Ma'had Aly DDI Mangkoso",
  description:
    "Asesmen dan pemeringkatan Ma'had Aly DDI Mangkoso oleh Majelis Masyayikh, dasar hukum pendirian, dan asesmen seleksi mahasantri baru.",
};

export default function AsesmenPage() {
  return (
    <main className="pt-32 md:pt-40 lg:pt-60 pb-20 bg-slate-50 min-h-screen">
      <section className="bg-mahad-green-dark text-white py-14 bg-islamic-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-mahad-gold bg-white/10 px-3.5 py-1 rounded-full">
            Informasi
          </span>
          <h1 className="font-serif font-bold text-3xl sm:text-5xl text-white mt-3">
            Asesmen
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base max-w-2xl mx-auto mt-2">
            Penjaminan mutu Ma&apos;had Aly DDI Mangkoso melalui asesmen Majelis
            Masyayikh, serta asesmen seleksi pada penerimaan mahasantri baru.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8 text-sm sm:text-base text-slate-700 leading-relaxed">
          <section>
            <h2 className="font-serif font-bold text-xl text-slate-900 border-b border-slate-100 pb-3 mb-3">
              Dasar Hukum Pendirian
            </h2>
            <p>
              Ma&apos;had Aly DDI Mangkoso berdiri berdasarkan Surat Keputusan
              Direktur Jenderal Pendidikan Islam Kementerian Agama Republik
              Indonesia Nomor 2971 Tahun 2018 tentang Izin Pendirian Ma&apos;had
              Aly, sebagai satuan pendidikan tinggi keagamaan di lingkungan
              Pondok Pesantren DDI Mangkoso, Kabupaten Barru, Sulawesi Selatan.
            </p>
          </section>

          <section>
            <h2 className="font-serif font-bold text-xl text-slate-900 border-b border-slate-100 pb-3 mb-3">
              Asesmen dan Pemeringkatan Majelis Masyayikh
            </h2>
            <p>
              Mutu penyelenggaraan Ma&apos;had Aly dinilai melalui asesmen oleh
              Majelis Masyayikh, lembaga penjaminan mutu pendidikan pesantren.
              Berdasarkan sertifikat asesmen yang diterbitkan Majelis Masyayikh,
              Ma&apos;had Aly DDI Mangkoso memperoleh peringkat{" "}
              <strong>MUMTAZ</strong> (unggul), berlaku mulai 28 November 2025
              sampai dengan 27 November 2032. Sertifikatnya dapat dilihat pada
              bagian akreditasi di halaman profil.
            </p>
            <p className="mt-3">
              <Link
                href="/profil#akreditasi"
                className="font-bold text-emerald-800 hover:text-emerald-950"
              >
                Lihat Sertifikat Akreditasi &rarr;
              </Link>
            </p>
          </section>

          <section>
            <h2 className="font-serif font-bold text-xl text-slate-900 border-b border-slate-100 pb-3 mb-3">
              Asesmen Seleksi Mahasantri Baru
            </h2>
            <p>
              Calon mahasantri mengikuti asesmen seleksi pada masa Penerimaan
              Mahasantri Baru (PMB). Materi, jadwal, dan ketentuan seleksi
              diumumkan pada halaman PMB setiap gelombang pendaftaran dibuka.
            </p>
            <p className="mt-3">
              <Link
                href="/pmb"
                className="font-bold text-emerald-800 hover:text-emerald-950"
              >
                Buka Halaman PMB Beasiswa &rarr;
              </Link>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

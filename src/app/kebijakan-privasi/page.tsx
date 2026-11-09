import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kebijakan Privasi — Ma'had Aly DDI Mangkoso",
  description:
    "Kebijakan privasi situs resmi Ma'had Aly DDI Mangkoso: data yang dikumpulkan, penggunaan cookie, dan iklan Google AdSense.",
  // Canonical sendiri wajib ada: tanpa ini halaman mewarisi canonical
  // beranda dari root layout dan dianggap Google sebagai duplikat
  // beranda (temuan audit 9 Nov 2026).
  alternates: { canonical: "/kebijakan-privasi" },
};

export default function KebijakanPrivasiPage() {
  return (
    <main className="pt-32 md:pt-40 lg:pt-60 pb-20 bg-slate-50 min-h-screen">
      <section className="bg-mahad-green-dark text-white py-14 bg-islamic-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-mahad-gold bg-white/10 px-3.5 py-1 rounded-full">
            Ketentuan Situs
          </span>
          <h1 className="font-serif font-bold text-3xl sm:text-5xl text-white mt-3">
            Kebijakan Privasi
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base max-w-2xl mx-auto mt-2">
            Bagaimana situs resmi Ma&apos;had Aly DDI Mangkoso memperlakukan data
            pengunjung, cookie, dan iklan.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8 text-sm sm:text-base text-slate-700 leading-relaxed">
          <section>
            <h2 className="font-serif font-bold text-xl text-slate-900 border-b border-slate-100 pb-3 mb-3">
              Pengelola Situs
            </h2>
            <p>
              Situs mahadaly-ddimangkoso.my.id adalah situs resmi Ma&apos;had Aly
              DDI Mangkoso, Mangkoso, Kabupaten Barru, Sulawesi Selatan. Kebijakan
              ini menjelaskan data apa saja yang diterima saat Anda mengunjungi
              situs ini dan bagaimana data itu digunakan.
            </p>
          </section>

          <section>
            <h2 className="font-serif font-bold text-xl text-slate-900 border-b border-slate-100 pb-3 mb-3">
              Data yang Dikumpulkan
            </h2>
            <p>
              Situs ini mencatat statistik kunjungan secara anonim melalui Google
              Analytics, misalnya halaman yang dibuka, perkiraan lokasi umum, dan
              jenis perangkat. Data statistik itu dipakai untuk memahami tulisan
              dan halaman yang paling banyak dibaca. Bila Anda mengisi formulir di
              situs ini, misalnya formulir pengiriman tulisan atau pesan kontak,
              data yang Anda tulis pada formulir itulah yang kami terima dan kami
              pakai hanya untuk keperluan layanan yang Anda minta.
            </p>
          </section>

          <section>
            <h2 className="font-serif font-bold text-xl text-slate-900 border-b border-slate-100 pb-3 mb-3">
              Cookie dan Iklan Google AdSense
            </h2>
            <p>
              Situs ini menayangkan iklan melalui Google AdSense. Google dan
              mitra pihak ketiga menggunakan cookie untuk menayangkan iklan
              berdasarkan kunjungan Anda sebelumnya ke situs ini dan ke situs lain
              di internet. Penggunaan cookie iklan oleh Google memungkinkan Google
              dan mitranya menayangkan iklan kepada pengunjung berdasarkan
              kunjungan mereka ke situs ini dan/atau situs lain.
            </p>
            <p className="mt-3">
              Anda dapat memilih untuk tidak menerima iklan yang dipersonalisasi
              dengan membuka{" "}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-800 font-medium hover:underline"
              >
                Setelan Iklan Google
              </a>
              . Anda juga dapat membaca cara Google menggunakan data dari situs
              yang memakai layanannya di{" "}
              <a
                href="https://policies.google.com/technologies/partner-sites"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-800 font-medium hover:underline"
              >
                halaman kebijakan Google untuk situs mitra
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-serif font-bold text-xl text-slate-900 border-b border-slate-100 pb-3 mb-3">
              Tautan ke Situs Lain
            </h2>
            <p>
              Sebagian halaman di situs ini memuat tautan ke situs lain, misalnya
              kanal media sosial resmi dan layanan Google. Kebijakan privasi ini
              hanya berlaku untuk situs mahadaly-ddimangkoso.my.id; situs lain
              mempunyai kebijakannya sendiri.
            </p>
          </section>

          <section>
            <h2 className="font-serif font-bold text-xl text-slate-900 border-b border-slate-100 pb-3 mb-3">
              Perubahan dan Kontak
            </h2>
            <p>
              Kebijakan ini dapat diperbarui mengikuti perkembangan layanan situs.
              Versi yang berlaku adalah versi yang tampil di halaman ini. Bila ada
              pertanyaan mengenai kebijakan privasi ini, silakan hubungi kami
              melalui halaman{" "}
              <Link href="/kontak" className="text-emerald-800 font-medium hover:underline">
                Kontak
              </Link>
              .
            </p>
            <p className="mt-3 text-slate-500">Berlaku sejak 8 November 2026.</p>
          </section>
        </div>
      </div>
    </main>
  );
}

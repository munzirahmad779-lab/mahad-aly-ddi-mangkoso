import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <header className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-mahad-green-dark text-white overflow-hidden flex items-center min-h-[90vh]">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-islamic-pattern opacity-60 pointer-events-none"></div>
      
      {/* Ambient Lighting */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 rounded-full bg-emerald-600/20 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-mahad-gold/15 blur-3xl pointer-events-none"></div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        
        {/* Logo Ma'had Murni (Tanpa Lingkaran Putih) */}
        <div className="inline-block relative mb-6">
          <div className="w-28 h-28 sm:w-36 sm:h-36 mx-auto relative drop-shadow-2xl">
            <Image
              src="/image_067524.png"
              alt="Logo Ma'had Aly DDI Mangkoso"
              width={144}
              height={144}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <span className="inline-block mt-3 bg-mahad-gold text-mahad-green-dark text-xs font-bold tracking-widest uppercase px-4 py-1 rounded-full shadow">
            Marhalah Ula (M.1)
          </span>
        </div>

        {/* Kaligrafi Basmalah */}
        <div className="font-serif text-mahad-gold text-2xl sm:text-3xl mb-4 tracking-wide" dir="rtl">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </div>

        {/* Judul Utama */}
        <h1 className="font-serif font-bold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight sm:leading-snug">
          Pendidikan Tinggi <span className="text-mahad-gold inline-block">Kader Ulama</span>
        </h1>

        {/* Deskripsi */}
        <p className="mt-5 max-w-3xl mx-auto text-base sm:text-lg lg:text-xl text-emerald-100/90 font-normal leading-relaxed">
          Pusat kaderisasi ulama berwawasan wasathiyyah, berakar kuat pada tradisi sanad dan khazanah kitab klasik (Turats), serta berakhlakul karimah untuk kemaslahatan umat.
        </p>

        {/* CTA Buttons */}
        <div className="mt-9 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/tentang"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-mahad-gold hover:bg-yellow-400 text-mahad-green-dark font-bold px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <span>Kenali Ma&apos;had</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
          <Link
            href="#mimbar-kajian"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-2 border-mahad-gold text-mahad-gold hover:bg-mahad-gold hover:text-mahad-green-dark font-bold px-8 py-3.5 rounded-full transition-all duration-200"
          >
            <span>Baca Mimbar Kajian</span>
          </Link>
        </div>

        {/* 4 Pilar Metrik Cepat */}
        <div className="mt-14 pt-8 border-t border-emerald-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3">
            <div className="font-serif font-bold text-2xl sm:text-3xl text-mahad-gold">2013</div>
            <div className="text-xs text-emerald-200/80 mt-1 uppercase tracking-wider">Tahun Berdiri</div>
          </div>
          <div className="p-3">
            <div className="font-serif font-bold text-2xl sm:text-3xl text-mahad-gold">4 Tahun</div>
            <div className="text-xs text-emerald-200/80 mt-1 uppercase tracking-wider">Masa Pengkaderan</div>
          </div>
          <div className="p-3">
            <div className="font-serif font-bold text-2xl sm:text-3xl text-mahad-gold">100%</div>
            <div className="text-xs text-emerald-200/80 mt-1 uppercase tracking-wider">Beasiswa Penuh</div>
          </div>
          <div className="p-3">
            <div className="font-serif font-bold text-2xl sm:text-3xl text-mahad-gold">Turats</div>
            <div className="text-xs text-emerald-200/80 mt-1 uppercase tracking-wider">Sanad Kitab Salaf</div>
          </div>
        </div>

      </div>
    </header>
  );
}
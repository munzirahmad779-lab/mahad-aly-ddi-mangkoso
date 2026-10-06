import Image from "next/image";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-mahad-green-dark text-white flex flex-col items-center justify-center p-6 bg-islamic-pattern relative overflow-hidden">
      <div className="max-w-2xl text-center space-y-6 z-10">
        
        {/* Logo Ma'had Murni Tanpa Lingkaran Putih */}
        <div className="w-28 h-28 sm:w-32 sm:h-32 mx-auto relative drop-shadow-2xl">
          <Image
            src="/image_067524.png"
            alt="Logo Ma'had Aly DDI Mangkoso"
            width={128}
            height={128}
            className="w-full h-full object-contain"
            priority
          />
        </div>

        {/* Kaligrafi Basmalah */}
        <p className="font-serif text-2xl sm:text-3xl text-mahad-gold" dir="rtl">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>

        {/* Judul dengan Font Cinzel */}
        <div className="space-y-2">
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-wide">
            MA&apos;HAD ALY DDI MANGKOSO
          </h1>
          <p className="text-mahad-gold-light font-medium text-base tracking-widest uppercase">
            Pendidikan Tinggi Kader Ulama
          </p>
        </div>

        {/* Kotak Status Setup */}
        <div className="bg-white/10 backdrop-blur-md border border-mahad-gold/40 rounded-2xl p-6 text-sm text-emerald-100 shadow-xl space-y-2">
          <p className="font-bold text-mahad-gold text-base">
            ✅ Tahap 1 Selesai &amp; Logo Sudah Bersih!
          </p>
          <p>
            Fondasi Next.js, font resmi, dan palet warna sudah siap 100%. Kita siap membangun komponen navigasi dan isi website.
          </p>
        </div>

      </div>
    </main>
  );
}
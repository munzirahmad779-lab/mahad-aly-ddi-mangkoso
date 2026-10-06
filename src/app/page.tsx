import Image from "next/image";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-mahad-green-dark text-white flex flex-col items-center justify-center p-6 bg-islamic-pattern relative overflow-hidden">
      <div className="max-w-2xl text-center space-y-6 z-10">
        
        {/* Logo Ma'had */}
        <div className="w-28 h-28 mx-auto rounded-full bg-white p-2 ring-4 ring-mahad-gold shadow-2xl relative">
          <Image
            src="/image_067524.png"
            alt="Logo Ma'had Aly DDI Mangkoso"
            width={112}
            height={112}
            className="w-full h-full object-contain rounded-full"
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
            ✅ Tahap 1 Berhasil Selesai!
          </p>
          <p>
            Struktur Next.js (App Router), TypeScript, Tailwind CSS, palet warna resmi (Emerald &amp; Gold), serta font Amiri + Inter + Cinzel sudah aktif dan siap digunakan.
          </p>
        </div>

      </div>
    </main>
  );
}
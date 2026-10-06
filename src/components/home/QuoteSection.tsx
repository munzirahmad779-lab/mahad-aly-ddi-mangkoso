export default function QuoteSection() {
  return (
    <section className="relative py-20 bg-linear-to-r from-mahad-gold via-yellow-400 to-mahad-gold text-mahad-green-dark shadow-inner">
      <div className="max-w-4xl mx-auto px-6 text-center">
        
        {/* Simbol Petik */}
        <div className="font-serif text-7xl sm:text-8xl leading-none text-mahad-green-dark/25 mb-2 select-none" aria-hidden="true">
          &ldquo;
        </div>

        {/* Teks Kalam Mutiara */}
        <blockquote className="font-serif italic font-bold text-2xl sm:text-3xl md:text-4xl leading-snug max-w-3xl mx-auto text-mahad-green-dark">
          Ilmu itu ibarat pelita. Tuntutlah ia dengan keikhlasan, amalkan dengan kasih sayang, agar cahayanya senantiasa menerangi kemaslahatan ummat.
        </blockquote>

        {/* Atribusi */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <span className="h-0.5 w-12 bg-mahad-green-dark/40 rounded-full"></span>
          <div>
            <p className="font-bold text-sm tracking-wider uppercase text-mahad-green-dark">
              Kata Mutiara Anregurutta
            </p>
            <p className="text-xs text-mahad-green-dark/80 font-medium">
              Pondok Pesantren DDI Mangkoso
            </p>
          </div>
          <span className="h-0.5 w-12 bg-mahad-green-dark/40 rounded-full"></span>
        </div>

      </div>
    </section>
  );
}
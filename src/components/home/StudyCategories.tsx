"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useArticles } from "@/context/ArticleContext";
import Reveal from "@/components/common/Reveal";

// Seksi kategori model Marquee Strip (desain G, dipilih user 27 Okt 2026):
// kartu kategori berjalan menyamping dalam beberapa baris berlawanan arah.
// Jumlah baris diatur admin dari panel Kategori (kunci "category_rows").
// Versi lite: animasi murni CSS transform, berhenti saat kursor di atasnya
// dan saat seksi berada di luar layar.
export default function StudyCategories() {
  const { categories, categoryRows } = useArticles();
  const sectionRef = useRef<HTMLElement>(null);

  // Animasi hanya berjalan selama seksi terlihat di layar (hemat CPU/baterai)
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) =>
        el.setAttribute("data-paused", entry.isIntersecting ? "false" : "true"),
      { threshold: 0.02 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const items = categories || [];
  if (items.length === 0) return null;

  const jumlahBaris = Math.max(
    1,
    Math.min(categoryRows || 2, 4, items.length)
  );

  // Bagi kategori bergiliran ke baris-baris (seperti membagi kartu) agar
  // tiap baris berisi campuran kategori, bukan potongan urutan yang sama.
  const baris: (typeof items)[] = Array.from({ length: jumlahBaris }, () => []);
  items.forEach((cat, i) => baris[i % jumlahBaris].push(cat));

  return (
    <section
      ref={sectionRef}
      className="py-20 bg-slate-50 border-t border-slate-200 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3.5 py-1 rounded-full">
              Fokus Keilmuan &bull; Fiqh Mu&apos;asarah (الفقه المعاصر)
            </span>
            <h2 className="font-serif font-bold text-3xl sm:text-4xl text-slate-900 mt-3">
              Gugus Kajian Fiqh Kontemporer
            </h2>
            <div className="h-1.5 w-16 bg-mahad-gold mx-auto mt-3 rounded-full"></div>
            <p className="text-slate-600 text-sm sm:text-base mt-3">
              Merespons dinamika hukum Islam modern dengan metodologi ushul fikih dan khazanah kitab klasik salaf.
            </p>
          </div>
        </Reveal>
      </div>

      <div className="marquee-wrap space-y-6 [mask-image:linear-gradient(to_right,transparent,black_7%,black_93%,transparent)]">
        {baris.map((isiBaris, r) => {
          // Isi separuh trek digandakan sampai cukup lebar, lalu separuh itu
          // digandakan sekali lagi — putaran -50% jadi mulus tanpa lompatan.
          const separuh = [...isiBaris];
          while (separuh.length < 4) separuh.push(...isiBaris);
          const trek = [...separuh, ...separuh];
          return (
            <div key={r} className="overflow-hidden">
              <div
                className="marquee-track"
                style={{
                  animationDuration: `${Math.max(22, separuh.length * 8)}s`,
                  animationDirection: r % 2 === 1 ? "reverse" : "normal",
                }}
              >
                {trek.map((cat, i) => {
                  const duplikat = i >= separuh.length;
                  return (
                    <Link
                      key={`${cat.id}-${i}`}
                      href={`/kategori/${cat.slug}`}
                      aria-hidden={duplikat}
                      tabIndex={duplikat ? -1 : undefined}
                      className="w-[380px] max-w-[85vw] shrink-0 mr-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-mahad-gold/60 transition flex items-start gap-4 group"
                    >
                      <span className="font-display font-bold text-lg text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-xl px-2.5 py-1.5 shrink-0">
                        {String(items.indexOf(cat) + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-mahad-gold">
                          Kajian Takhassus
                        </span>
                        <span className="block font-serif font-bold text-lg text-slate-900 leading-snug mt-0.5 group-hover:text-emerald-800 transition-colors">
                          {cat.name}
                        </span>
                        <span className="block text-slate-600 text-xs leading-relaxed line-clamp-2 mt-1">
                          {cat.description}
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

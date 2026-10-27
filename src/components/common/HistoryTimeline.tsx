"use client";

import { ReactNode } from "react";
import Reveal from "./Reveal";

export interface HistoryEntry {
  year?: string;
  body: ReactNode;
}

// Pisahkan teks sejarah menjadi entri linimasa. Paragraf dipisah baris
// kosong; paragraf yang diawali tahun (mis. "2013 M — ...") mendapat
// lencana tahun. Isi teksnya sendiri tidak diubah sama sekali.
export function entriesFromText(text: string): HistoryEntry[] {
  const blocks = text
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  const paras =
    blocks.length > 1
      ? blocks
      : text
          .split(/\n/)
          .map((s) => s.trim())
          .filter(Boolean);
  return paras.map((p) => {
    const m = p.match(/^(\d{3,4})\s*(H|M)?\s*[—–\-:.]\s*([\s\S]+)$/);
    if (m && +m[1] >= 1000 && +m[1] <= 2100) {
      return { year: `${m[1]}${m[2] ? " " + m[2] : ""}`, body: m[3] };
    }
    return { body: p };
  });
}

// Linimasa vertikal (Fase 3, ala Timeline Aceternity): garis gradasi
// emas→hijau dengan titik penanda di tiap babak sejarah.
export default function HistoryTimeline({ entries }: { entries: HistoryEntry[] }) {
  if (!entries.length) return null;
  return (
    <div className="relative pl-9">
      <div
        aria-hidden
        className="absolute left-[8px] top-2 bottom-2 w-0.5 rounded-full bg-gradient-to-b from-mahad-gold via-emerald-300 to-emerald-700"
      />
      <div className="space-y-7">
        {entries.map((e, i) => (
          <Reveal key={i} delay={Math.min(i * 0.06, 0.25)}>
            <div className="relative">
              <span
                aria-hidden
                className="absolute -left-9 top-1 w-[18px] h-[18px] rounded-full bg-white border-[3px] border-emerald-700 shadow-sm"
              />
              {e.year && (
                <span className="inline-block font-display font-bold text-xs tracking-wide text-mahad-green-dark bg-mahad-gold-light border border-mahad-gold/50 px-2.5 py-0.5 rounded-full mb-1.5">
                  {e.year}
                </span>
              )}
              <div className="text-slate-700 leading-relaxed whitespace-pre-line">
                {e.body}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";

// Renderer pintar untuk custom section profil.
// Membaca pola penulisan admin:
//   - Baris TANPA "•"  = judul kelompok (mis. "Latar Belakang")
//   - Baris "• Label: Isi" = kartu berlabel (ikon otomatis dari kata kunci)
//   - Baris "• Isi" saja = butir daftar bercentang
// Font & layout dikunci di sini — admin cukup menulis kalimatnya.

type Labeled = { tipe: "label"; label: string; isi: string };
type Plain = { tipe: "plain"; isi: string };
type Entry = Labeled | Plain;
type Group = { judul: string | null; icon: string; entries: Entry[] };

const ICON_MAP: [RegExp, string][] = [
  [/jenis|lembaga/i, "🏛️"],
  [/berdiri|tahun/i, "📅"],
  [/lokasi|alamat/i, "📍"],
  [/penyelenggara|yayasan/i, "🕌"],
  [/tradisi|sejarah/i, "📜"],
  [/asas|ideologi/i, "⚖️"],
  [/visi/i, "🔭"],
  [/misi/i, "🎯"],
  [/struktur/i, "🧱"],
  [/tekstual|qur/i, "📖"],
  [/substansial/i, "🧠"],
  [/alat/i, "🛠️"],
  [/pendekatan/i, "🔍"],
  [/bahasa/i, "🗣️"],
  [/mata kuliah|kurikulum/i, "📚"],
  [/praktik|pengabdian|ppm/i, "🤲"],
  [/sumber ajaran/i, "📚"],
  [/kajian kitab|kitab/i, "📗"],
  [/istinbath|hukum/i, "⚖️"],
  [/pemikiran/i, "💡"],
  [/predikat|nilai/i, "🏅"],
  [/gelar|ijazah|syahadah/i, "🎓"],
  [/perkuliahan|kuliah/i, "🏫"],
  [/kegiatan ilmiah|seminar/i, "🎤"],
  [/keorganisasian/i, "👥"],
  [/musyawarah/i, "🗣️"],
];

const GROUP_ICON: [RegExp, string][] = [
  [/latar belakang|profil/i, "📜"],
  [/kurikulum/i, "📖"],
  [/capaian|alumni/i, "🎓"],
  [/agenda|program/i, "📋"],
];

function iconUntuk(label: string, fallback = "✦"): string {
  for (const [rx, icon] of ICON_MAP) if (rx.test(label)) return icon;
  return fallback;
}

function iconGroup(judul: string): string {
  for (const [rx, icon] of GROUP_ICON) if (rx.test(judul)) return icon;
  return "✦";
}

function parseGroups(items: string[]): Group[] {
  const groups: Group[] = [];
  let current: Group | null = null;

  for (const raw of items || []) {
    const line = (raw || "").trim();
    if (!line) continue;
    const isBullet = line.startsWith("•") || line.startsWith("-") || line.startsWith("–");
    const body = line.replace(/^[•\-–]\s*/, "").trim();

    if (!isBullet) {
      if (current) groups.push(current);
      current = { judul: line, icon: iconGroup(line), entries: [] };
      continue;
    }

    if (!current) current = { judul: null, icon: "✦", entries: [] };
    // "Label: Isi" — pemisah titik dua di 30 karakter pertama
    const m = body.match(/^([^:]{2,32}):\s+([\s\S]+)$/);
    if (m) {
      current.entries.push({ tipe: "label", label: m[1].trim(), isi: m[2].trim() });
    } else {
      current.entries.push({ tipe: "plain", isi: body });
    }
  }
  if (current) groups.push(current);
  return groups;
}

function KartuBersama({ entry, idx }: { entry: Entry; idx: number }) {
  const delay = { animationDelay: `${Math.min(idx, 8) * 70}ms` };

  if (entry.tipe === "plain") {
    return (
      <li
        className="animate-reveal-up flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/70 border border-emerald-100"
        style={delay}
      >
        <span className="mt-0.5 w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <span className="text-sm text-slate-800 font-medium leading-relaxed">{entry.isi}</span>
      </li>
    );
  }

  // Visi & Misi tampil menonjol selebar kartu
  const menonjol = /visi|misi/i.test(entry.label);

  return (
    <div
      className={`animate-reveal-up rounded-xl border p-4 sm:p-5 transition hover:shadow-md ${
        menonjol
          ? "bg-gradient-to-br from-emerald-800 to-emerald-950 border-emerald-900 text-white md:col-span-2"
          : "bg-white border-emerald-100 hover:border-emerald-300"
      }`}
      style={delay}
    >
      <div className="flex items-start gap-3.5">
        <span
          className={`text-xl leading-none mt-0.5 shrink-0 ${
            menonjol ? "text-mahad-gold" : ""
          }`}
        >
          {iconUntuk(entry.label)}
        </span>
        <div className="min-w-0">
          <p
            className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${
              menonjol ? "text-mahad-gold" : "text-emerald-800"
            }`}
          >
            {entry.label}
          </p>
          <p
            className={`text-sm leading-relaxed font-medium ${
              menonjol ? "text-emerald-50 text-base sm:text-lg font-serif" : "text-slate-800"
            }`}
          >
            {entry.isi}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ProgramSectionView({ items }: { items: string[] }) {
  const groups = parseGroups(items);

  if (groups.length === 0) return null;

  return (
    <div className="space-y-8">
      {groups.map((g, gi) => (
        <div
          key={g.judul || gi}
          className="animate-reveal-up"
          style={{ animationDelay: `${Math.min(gi, 6) * 90}ms` }}
        >
          {g.judul && (
            <div className="flex items-center gap-2.5 mb-4">
              <span className="text-lg">{g.icon}</span>
              <h3 className="font-serif font-bold text-lg text-emerald-950">{g.judul}</h3>
              <span className="flex-1 h-px bg-emerald-100" />
            </div>
          )}
          <div
            className={
              g.entries.every((e) => e.tipe === "plain")
                ? "grid grid-cols-1 sm:grid-cols-2 gap-2.5"
                : "grid grid-cols-1 md:grid-cols-2 gap-3"
            }
          >
            {g.entries.map((e, i) => (
              <KartuBersama key={i} entry={e} idx={i} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

import { Fragment } from "react";

/* ── Perender bersama isi tulisan ────────────────────────────────────
   Dipakai laman artikel, laman berita, dan kartu baca Hari Guru
   (penggabungan 26 Nov 2026 dari audit layout bacaan: sebelumnya
   berita dan Hari Guru tidak punya penanganan teks Arab sama sekali,
   dan daftar serta kutipan tampil sebagai paragraf polos di semua
   laman). Isi di basis data adalah teks polos; di sini ia dipecah
   per baris: baris subbab menjadi heading, baris mayoritas aksara
   Arab menjadi paragraf Arab (RTL), baris daftar menjadi ul/ol,
   baris kutipan menjadi blockquote, sisanya paragraf biasa dengan
   rentang Arab di dalamnya dibungkus span.teks-arab. Teks aslinya
   TIDAK diubah. */

const ARABIC_CHAR_RE =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
const ARABIC_RUN_RE =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+(?:[ \t.,;:!?'\"()\-\u2013\u2014\u060C\u061B\u061F]+[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+)*/g;

function arabicRatio(text: string): number {
  let arab = 0;
  let total = 0;
  for (const ch of text) {
    if (/\s/.test(ch)) continue;
    total++;
    if (ARABIC_CHAR_RE.test(ch)) arab++;
  }
  return total === 0 ? 0 : arab / total;
}

const KATA_BAB = [
  "pendahuluan",
  "latar belakang",
  "pembahasan",
  "kesimpulan",
  "penutup",
  "abstrak",
  "metode",
  "rumusan masalah",
  "daftar pustaka",
  "sumber referensi",
  "kata pengantar",
  "saran",
];

// Entitas HTML pada naskah sumber (&apos;, &quot;, dsb.) dinetralkan
// HANYA untuk keperluan uji pola; teks yang dirender tetap aslinya.
function bersihUntukUji(line: string): string {
  return line
    .replace(/&[a-zA-Z]+;/g, "'")
    .replace(/&#\d+;/g, "'")
    .trim();
}

// Aturan heading yang konservatif, dari pola nyata naskah mahasiswa.
function isHeading(rawLine: string): boolean {
  const line = bersihUntukUji(rawLine);
  if (!line) return false;
  // Baris Arab tidak pernah jadi heading.
  if (arabicRatio(line) > 0.5) return false;

  // "BAB I" / "Bab 2"
  if (/^(BAB|Bab)\s+([IVXLC]{1,6}|\d{1,3})\b/.test(line)) return true;

  // Pola "A. Judul": maks 80 karakter; satu titik di akhir ditoleransi
  if (/^[A-Z]\.\s+\S/.test(line) && line.length <= 80 && !/[,;]$/.test(line))
    return true;

  // Pola "1. Judul": maks 80 karakter, tidak diakhiri . , ;
  if (
    /^\d{1,2}\.\s+\S/.test(line) &&
    line.length <= 80 &&
    !/[.,;]$/.test(line)
  )
    return true;

  // Kata pembuka bab persis sebagai baris tersendiri
  const lower = line
    .toLowerCase()
    .replace(/[:.]$/, "")
    .trim();
  if (KATA_BAB.includes(lower)) return true;

  // Kata pembuka bab diikuti subjudul singkat
  for (const k of KATA_BAB) {
    if (lower.startsWith(k)) {
      const rest = lower.slice(k.length);
      if (
        (rest.startsWith(":") || rest.startsWith(" ")) &&
        line.length <= 60 &&
        !/[.,;]$/.test(line)
      )
        return true;
    }
  }

  // Seluruhnya HURUF KAPITAL: minimal 2 kata, atau kata kunci bab
  const huruf = line.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ]/g, "");
  if (
    huruf.length >= 3 &&
    /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(line) &&
    line === line.toUpperCase()
  ) {
    const kata = line.split(/\s+/).filter(Boolean);
    if (kata.length >= 2 || KATA_BAB.includes(lower)) return true;
  }

  return false;
}

// Bungkus rentang aksara Arab di dalam teks Latin dengan span.teks-arab.
function renderCampuran(text: string, kunci: string) {
  const potongan = text.split(new RegExp(`(${ARABIC_RUN_RE.source})`, "g"));
  return potongan.map((bagian, i) =>
    bagian && ARABIC_CHAR_RE.test(bagian) ? (
      <span key={`${kunci}-${i}`} className="teks-arab">
        {bagian}
      </span>
    ) : (
      <Fragment key={`${kunci}-${i}`}>{bagian}</Fragment>
    )
  );
}

const POLA_DAFTAR_TAKBERURUT = /^[-*•]\s+(.+)$/;
const POLA_DAFTAR_BERURUT = /^\d{1,2}[.)]\s+(.+)$/;

interface IsiTulisanProps {
  content: string;
  // Gaya paragraf pembuka khas berita: paragraf polos pertama tampil
  // lebih besar dengan pangkal kalimat ditebalkan sebelum tanda pisah.
  paragrafPembuka?: boolean;
}

export default function IsiTulisan({
  content,
  paragrafPembuka = false,
}: IsiTulisanProps) {
  const elemen: React.ReactNode[] = [];
  let sudahAdaParagraf = false;

  const kunciBaru = () => `isi-${elemen.length}`;

  (content || "").split(/\n\s*\n/).forEach((blok) => {
    const barisBlok = blok
      .split(/\r?\n/)
      .map((b) => b.trim())
      .filter(Boolean);

    let daftar: { berurut: boolean; butir: string[] } | null = null;
    let kutipan: string[] = [];

    const tutupDaftar = () => {
      if (!daftar) return;
      const kunci = kunciBaru();
      const kelas =
        "pl-6 space-y-1.5 marker:text-emerald-800 " +
        (daftar.berurut ? "list-decimal" : "list-disc");
      const isi = daftar.butir.map((butir, i) => (
        <li key={`${kunci}-${i}`}>{renderCampuran(butir, `${kunci}-${i}`)}</li>
      ));
      elemen.push(
        daftar.berurut ? (
          <ol key={kunci} className={kelas}>
            {isi}
          </ol>
        ) : (
          <ul key={kunci} className={kelas}>
            {isi}
          </ul>
        )
      );
      daftar = null;
    };

    const tutupKutipan = () => {
      if (kutipan.length === 0) return;
      const kunci = kunciBaru();
      const teks = kutipan.join(" ");
      elemen.push(
        <blockquote
          key={kunci}
          className="border-l-4 border-amber-500 bg-emerald-50 rounded-r-xl px-5 py-4 italic text-slate-700"
        >
          {arabicRatio(bersihUntukUji(teks)) > 0.7 ? (
            <span dir="rtl" className="teks-arab block text-right not-italic">
              {teks}
            </span>
          ) : (
            renderCampuran(teks, kunci)
          )}
        </blockquote>
      );
      kutipan = [];
    };

    const tutupKelompok = () => {
      tutupDaftar();
      tutupKutipan();
    };

    barisBlok.forEach((baris, idx) => {
      // Heading markdown eksplisit ("## " / "### ") didahulukan.
      if (baris.startsWith("## ") || baris.startsWith("### ")) {
        tutupKelompok();
        const kunci = kunciBaru();
        const tingkat3 = baris.startsWith("### ");
        const teks = baris.slice(tingkat3 ? 4 : 3);
        elemen.push(
          tingkat3 ? (
            <h3
              key={kunci}
              className={`font-serif font-bold text-lg sm:text-xl text-emerald-900 leading-snug ${
                elemen.length > 0 ? "mt-8" : ""
              }`}
            >
              {renderCampuran(teks, kunci)}
            </h3>
          ) : (
            <h2
              key={kunci}
              className={`font-serif font-bold text-emerald-900 text-xl sm:text-2xl leading-snug border-l-4 border-amber-500 pl-3 sm:pl-4 ${
                elemen.length > 0 ? "mt-10" : ""
              }`}
            >
              {renderCampuran(teks, kunci)}
            </h2>
          )
        );
        return;
      }

      // Blok Arab penuh menjadi paragraf RTL berkelas blok-arab. Jarak
      // diserahkan ke satu sistem (space-y wadah), tanpa margin inline
      // lagi (temuan audit layout no. 7).
      if (arabicRatio(bersihUntukUji(baris)) > 0.7) {
        tutupKelompok();
        const kunci = kunciBaru();
        elemen.push(
          <p key={kunci} dir="rtl" className="teks-arab blok-arab text-right">
            {baris}
          </p>
        );
        return;
      }

      // Baris kutipan dikumpulkan menjadi satu blockquote.
      if (baris.startsWith("> ")) {
        tutupDaftar();
        kutipan.push(baris.slice(2));
        return;
      }

      // Baris daftar: penanda tak berurut selalu daftar; penanda
      // berurut hanya daftar bila berurutan dua baris atau lebih,
      // supaya baris subbab "1. Judul" yang berdiri sendiri tetap
      // diperlakukan sebagai heading oleh aturan konservatif di bawah.
      const takBerurut = baris.match(POLA_DAFTAR_TAKBERURUT);
      const berurut = baris.match(POLA_DAFTAR_BERURUT);
      const lanjutBerurut =
        !!berurut &&
        (daftar?.berurut === true ||
          (!!barisBlok[idx + 1] && POLA_DAFTAR_BERURUT.test(barisBlok[idx + 1])));
      if (takBerurut || lanjutBerurut) {
        tutupKutipan();
        const berurutIni = !takBerurut;
        if (!daftar || daftar.berurut !== berurutIni) {
          tutupDaftar();
          daftar = { berurut: berurutIni, butir: [] };
        }
        daftar.butir.push((takBerurut ?? berurut)![1]);
        return;
      }

      tutupKelompok();
      const kunci = kunciBaru();

      if (isHeading(baris)) {
        elemen.push(
          <h2
            key={kunci}
            className={`font-serif font-bold text-emerald-900 text-xl sm:text-2xl leading-snug border-l-4 border-amber-500 pl-3 sm:pl-4 ${
              elemen.length > 0 ? "mt-10" : ""
            }`}
          >
            {renderCampuran(baris, kunci)}
          </h2>
        );
        return;
      }

      if (paragrafPembuka && !sudahAdaParagraf) {
        sudahAdaParagraf = true;
        const pisah = baris.indexOf("—");
        elemen.push(
          <p key={kunci} className="text-lg sm:text-xl leading-relaxed text-slate-700">
            {pisah > 0 ? (
              <>
                <strong className="font-bold text-mahad-green-dark">
                  {baris.slice(0, pisah + 1)}
                </strong>
                {baris.slice(pisah + 1)}
              </>
            ) : (
              renderCampuran(baris, kunci)
            )}
          </p>
        );
        return;
      }

      sudahAdaParagraf = true;
      elemen.push(<p key={kunci}>{renderCampuran(baris, kunci)}</p>);
    });

    tutupKelompok();
  });

  return <>{elemen}</>;
}

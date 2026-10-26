/**
 * Utility Kalender Hijriah Real-Time Otomatis
 *
 * Mengikuti penanggalan Lembaga Falakiyah PBNU (NU) sebagaimana tayang di
 * NU Online. NU menetapkan awal bulan lewat rukyatul hilal/istikmal SETIAP
 * bulan, sehingga TIDAK ADA rumus kalender (Umalqura, aritmetik, MABIMS)
 * yang selalu sama dengan NU — buktinya pada 1448 H: Asyura versi NU jatuh
 * 26 Juni 2026, sehari lebih lambat dari Umalqura/Kemenag, sedangkan awal
 * Jumadil Ula-nya sama. Karena itu konversi di sini berbasis TABEL AWAL
 * BULAN dari pengumuman resmi LF PBNU (lihat NU_MONTH_STARTS), dan tanggal
 * di luar cakupan tabel jatuh ke perkiraan Umalqura sampai tabel diperbarui
 * mengikuti ikhbar LF PBNU berikutnya.
 */

const INDONESIAN_DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jum'at", "Sabtu"];
const INDONESIAN_MONTHS_GREGORIAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember"
];

const NU_HIJRI_MONTHS = [
  "Muharram",
  "Safar",
  "Rabi'ul Awwal",
  "Rabi'ul Akhir",
  "Jumadil Ula",
  "Jumadil Akhirah",
  "Rajab",
  "Sya'ban",
  "Ramadan",
  "Syawwal",
  "Dzulqa'dah",
  "Dzulhijjah"
];

/**
 * Awal bulan Hijriah menurut ikhbar LF PBNU (tanggal Masehi hari ke-1,
 * waktu Indonesia). Sumber per baris dicantumkan; perbarui tabel ini setiap
 * LF PBNU mengumumkan awal bulan berikutnya (±tanggal 29 bulan berjalan).
 */
const NU_MONTH_STARTS: Array<{ hijriYear: number; hijriMonthIndex: number; startUtcMs: number }> = [
  // 1 Muharram 1448 H = Rabu, 17 Juni 2026 — Pengumuman LF PBNU No. 146/PB.08/A.II.11.13/13/06/2026 (istikmal Dzulhijjah 1447)
  { hijriYear: 1448, hijriMonthIndex: 0, startUtcMs: Date.UTC(2026, 5, 17) },
  // 1 Safar 1448 H = Kamis, 16 Juli 2026 — disimpulkan dari rukyah awal Rabi'ul Awwal pada 29 Safar 1448 = 13 Agustus 2026 (Pengumuman No. 158)
  { hijriYear: 1448, hijriMonthIndex: 1, startUtcMs: Date.UTC(2026, 6, 16) },
  // 1 Rabi'ul Awwal 1448 H = Jum'at, 14 Agustus 2026 — Pengumuman LF PBNU No. 158/PB.08/A.II.11.13/13/08/2026 (rukyah)
  { hijriYear: 1448, hijriMonthIndex: 2, startUtcMs: Date.UTC(2026, 7, 14) },
  // 1 Rabi'ul Akhir 1448 H = Ahad, 13 September 2026 — Pengumuman LF PBNU No. 163/PB.08/A.II.11.13/13/09/2026 (istikmal)
  { hijriYear: 1448, hijriMonthIndex: 3, startUtcMs: Date.UTC(2026, 8, 13) },
  // 1 Jumadil Ula 1448 H = Senin, 12 Oktober 2026 — Pengumuman LF PBNU No. 163/PB.08/A.II.11.13/13/10/2026 (rukyah)
  { hijriYear: 1448, hijriMonthIndex: 4, startUtcMs: Date.UTC(2026, 9, 12) }
];

const DAY_MS = 86_400_000;

/** Konversi memakai tabel LF PBNU; null bila tanggal di luar cakupan tabel. */
function hijriFromNuTable(civilUtcMs: number): { hDay: number; hMonthIndex: number; hYear: number } | null {
  for (let i = 0; i < NU_MONTH_STARTS.length; i++) {
    const cur = NU_MONTH_STARTS[i];
    const next = NU_MONTH_STARTS[i + 1];
    if (civilUtcMs < cur.startUtcMs) continue;
    if (next && civilUtcMs >= next.startUtcMs) continue;
    const hDay = Math.floor((civilUtcMs - cur.startUtcMs) / DAY_MS) + 1;
    // Bulan Hijriah hanya 29/30 hari; di luar itu berarti sudah masuk bulan
    // yang belum diumumkan LF PBNU → jangan mengarang, pakai fallback.
    if (hDay < 1 || hDay > 30) return null;
    return { hDay, hMonthIndex: cur.hijriMonthIndex, hYear: cur.hijriYear };
  }
  return null;
}

export interface RealtimeHijriResult {
  hijriDay: number;
  hijriMonthName: string;
  hijriMonthIndex: number; // 0-based
  hijriYear: number;
  dayName: string;
  gregorianDateStr: string;
  fullFormatted: string; // e.g. "Jum'at, 28 Rabi'ul Akhir 1448 H / 9 Oktober 2026 M"
}

/**
 * Konversi tanggal Masehi ke Hijriah mengikuti tabel ikhbar LF PBNU;
 * di luar cakupan tabel, jatuh ke perkiraan Um al-Qura (Intl).
 */
export function getRealtimeHijriDate(date: Date = new Date(), timeZone?: string): RealtimeHijriResult {
  // Semua komponen tanggal dihitung pada zona waktu situs (bawaan
  // Asia/Makassar) — bukan zona mesin server (Cloudflare Workers berjalan
  // UTC sehingga meleset 1 hari pada 00.00–08.00 WITA).
  const tz = timeZone || "Asia/Makassar";
  let dayName = INDONESIAN_DAYS[date.getDay()];
  let gregDay = date.getDate();
  let gregMonth = INDONESIAN_MONTHS_GREGORIAN[date.getMonth()];
  let gregYear = date.getFullYear();
  let civilMonthNum = date.getMonth() + 1;
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      weekday: "short",
      day: "numeric",
      month: "numeric",
      year: "numeric"
    }).formatToParts(date);
    const get = (t: string) => parts.find((p) => p.type === t)?.value || "";
    const weekdayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    dayName = INDONESIAN_DAYS[weekdayMap[get("weekday")] ?? date.getDay()];
    gregDay = parseInt(get("day"), 10) || gregDay;
    civilMonthNum = parseInt(get("month"), 10) || civilMonthNum;
    gregMonth = INDONESIAN_MONTHS_GREGORIAN[civilMonthNum - 1];
    gregYear = parseInt(get("year"), 10) || gregYear;
  } catch {
    // zona tidak dikenal → pakai zona lokal seperti sebelumnya
  }
  const gregorianDateStr = `${gregDay} ${gregMonth} ${gregYear} M`;

  // Jalur utama: tabel awal bulan LF PBNU (persis penanggalan NU Online).
  const fromNu = hijriFromNuTable(Date.UTC(gregYear, civilMonthNum - 1, gregDay));
  if (fromNu) {
    const hijriMonthName = NU_HIJRI_MONTHS[fromNu.hMonthIndex];
    return {
      hijriDay: fromNu.hDay,
      hijriMonthName,
      hijriMonthIndex: fromNu.hMonthIndex,
      hijriYear: fromNu.hYear,
      dayName,
      gregorianDateStr,
      fullFormatted: `${dayName}, ${fromNu.hDay} ${hijriMonthName} ${fromNu.hYear} H / ${gregorianDateStr}`
    };
  }

  try {
    // Fallback untuk tanggal di luar cakupan tabel NU: perkiraan Um al-Qura.
    const formatter = new Intl.DateTimeFormat("id-ID-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      timeZone: tz
    });

    const parts = formatter.formatToParts(date);
    let hDay = 1;
    let hMonthNum = 1;
    let hYear = 1448;

    for (const part of parts) {
      if (part.type === "day") hDay = parseInt(part.value, 10);
      if (part.type === "month") hMonthNum = parseInt(part.value, 10);
      if (part.type === "year") hYear = parseInt(part.value, 10);
    }

    const monthIndex = Math.max(0, Math.min(11, hMonthNum - 1));
    const hijriMonthName = NU_HIJRI_MONTHS[monthIndex];

    const fullFormatted = `${dayName}, ${hDay} ${hijriMonthName} ${hYear} H / ${gregorianDateStr}`;

    return {
      hijriDay: hDay,
      hijriMonthName,
      hijriMonthIndex: monthIndex,
      hijriYear: hYear,
      dayName,
      gregorianDateStr,
      fullFormatted
    };
  } catch (err) {
    // Fallback jika Intl tidak didukung di environment tertentu
    return {
      hijriDay: 28,
      hijriMonthName: "Rabi'ul Akhir",
      hijriMonthIndex: 3,
      hijriYear: 1448,
      dayName,
      gregorianDateStr,
      fullFormatted: `${dayName}, 28 Rabi'ul Akhir 1448 H / ${gregorianDateStr}`
    };
  }
}

/**
 * Format singkat tanggal Hijriah untuk tanggal terbit konten,
 * mis. "15 Jumadil Ula 1448 H". Menggantikan cap tahun hardcoded
 * "1448 H" yang dulu ditempel ke semua artikel tanpa memandang
 * tanggal terbitnya.
 */
export function formatHijriShort(date: Date = new Date()): string {
  const r = getRealtimeHijriDate(date);
  return `${r.hijriDay} ${r.hijriMonthName} ${r.hijriYear} H`;
}

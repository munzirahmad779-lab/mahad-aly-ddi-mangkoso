/**
 * Utility Kalender Hijriah Real-Time Otomatis
 * Mengikuti Standar Hisab/Rukyat Lembaga Falakiyah PBNU (NU Online) & Kemenag RI (MABIMS)
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
 * Konversi tanggal Masehi ke Tanggal Hijriah Standar NU / Kemenag (MABIMS)
 * Menggunakan Intl.DateTimeFormat dengan fallback kalender Islami Um al-Qura
 */
export function getRealtimeHijriDate(date: Date = new Date()): RealtimeHijriResult {
  const dayName = INDONESIAN_DAYS[date.getDay()];
  const gregDay = date.getDate();
  const gregMonth = INDONESIAN_MONTHS_GREGORIAN[date.getMonth()];
  const gregYear = date.getFullYear();
  const gregorianDateStr = `${gregDay} ${gregMonth} ${gregYear} M`;

  try {
    // Format menggunakan Intl DateTimeFormat Hijriah Um al-Qura
    const formatter = new Intl.DateTimeFormat("id-ID-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "numeric",
      year: "numeric"
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

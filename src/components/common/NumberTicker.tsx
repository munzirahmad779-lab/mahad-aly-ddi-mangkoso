"use client";

// Nilai metrik ditampilkan LANGSUNG apa adanya — tanpa animasi hitung
// naik dari 0. Keputusan user (28 Okt 2026): animasi angka tetap
// menimbulkan frame drop di HP saat angka masuk layar, jadi dihapus
// total (berlaku juga untuk ticker rupiah donasi). Nama komponen
// dipertahankan agar pemanggil tidak berubah.
export default function NumberTicker({ value }: { value: string }) {
  return <span>{value}</span>;
}

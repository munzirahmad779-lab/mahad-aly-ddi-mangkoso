"use client";

// Nilai rupiah ditampilkan LANGSUNG apa adanya — tanpa animasi hitung
// naik dari 0. Keputusan user (28 Okt 2026): animasi angka jutaan tetap
// menimbulkan frame drop di HP saat angka masuk layar, jadi dihapus
// total. Nama komponen dipertahankan agar pemanggil tidak berubah.
export default function RupiahTicker({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return <span className={className}>Rp {value.toLocaleString("id-ID")}</span>;
}

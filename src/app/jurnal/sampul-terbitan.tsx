import { JURNAL_NAMA_LABEL_UJI, JURNAL_SUBJUDUL } from "@/lib/jurnal/konten";

// Sampul terbitan tipografis: blok hijau tua berbingkai garis emas
// berisi nama jurnal, garis aksen, dan label terbitan. Jurnal belum
// mempunyai berkas sampul gambar resmi, jadi sampul dirender sebagai
// komposisi teks yang jujur, bukan gambar karangan.
//
// Varian mini dipakai untuk kartu arsip yang lebarnya jauh lebih
// kecil: tipografi diperkecil mengikuti lebar itu dan subjudul
// disembunyikan, supaya teks tidak lagi menumpuk vertikal dan
// meluber keluar kotak sampul seperti pada ukuran penuh di lebar
// belasan piksel per baris.

export function SampulTerbitan({
  label,
  className = "",
  mini = false
}: {
  label: string;
  className?: string;
  mini?: boolean;
}) {
  if (mini) {
    return (
      <div
        className={`relative flex aspect-[3/4] w-full flex-col items-center justify-between bg-jurnal-hijau-gelap p-1.5 text-center text-white ${className}`}
        aria-hidden="true"
      >
        <div className="pointer-events-none absolute inset-1 border border-jurnal-emas/60" />
        <div className="relative">
          <p className="font-serif text-[8px] font-bold leading-[1.35]">
            {JURNAL_NAMA_LABEL_UJI}
          </p>
          <div className="mx-auto mt-1 h-px w-5 bg-jurnal-emas" />
        </div>
        <p className="relative font-serif text-[9px] font-bold leading-tight">
          {label}
        </p>
      </div>
    );
  }
  return (
    <div
      className={`relative flex aspect-[3/4] w-full flex-col items-center justify-between bg-jurnal-hijau-gelap p-4 text-center text-white ${className}`}
      aria-hidden="true"
    >
      <div className="pointer-events-none absolute inset-2 border border-jurnal-emas/60" />
      <div className="relative">
        <p className="font-serif text-sm font-bold leading-snug sm:text-base">
          {JURNAL_NAMA_LABEL_UJI}
        </p>
        <div className="mx-auto mt-2 h-0.5 w-10 bg-jurnal-emas" />
        <p className="mt-2 text-[10px] leading-snug text-white/75">
          {JURNAL_SUBJUDUL}
        </p>
      </div>
      <p className="relative font-serif text-base font-bold leading-snug sm:text-lg">
        {label}
      </p>
    </div>
  );
}

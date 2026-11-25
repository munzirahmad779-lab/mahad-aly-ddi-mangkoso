"use client";

import { useEffect, useState } from "react";

// Sampul penanda resmi situs (gradasi hijau kampus + ikon buku terbuka)
// dalam bentuk data URI, ditampilkan menggantikan gambar yang gagal
// dimuat. Perintah user 26 Nov 2026: tidak boleh ada gambar eror yang
// terlihat pembaca. Kasus pemicu: sampul artikel Lima Nasihat Gurutta
// Moh. Asy'ari tampil sebagai ikon gambar rusak di peramban user
// padahal berkasnya sendiri sehat; kegagalan muat sesaat di sisi
// pembaca tidak boleh lagi berujung ikon rusak.
const PENANDA =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23064e3b'/%3E%3Cstop offset='1' stop-color='%23047857'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='800' height='450' fill='url(%23g)'/%3E%3Cg transform='translate(352 177) scale(4)' fill='none' stroke='%23a7f3d0' stroke-width='1.3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z'/%3E%3Cpath d='M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z'/%3E%3C/g%3E%3C/svg%3E";

interface GambarAmanProps {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
}

// Pengganti langsung elemen img untuk gambar sampul: begitu muatan
// gagal, sumber diganti ke sampul penanda. Keadaan gagal diatur ulang
// setiap kali sumber berganti (kartu korsel memakai ulang komponen).
export default function GambarAman({
  src,
  alt,
  className,
  loading,
}: GambarAmanProps) {
  const [gagal, setGagal] = useState(false);

  useEffect(() => {
    setGagal(false);
  }, [src]);

  return (
    <img
      src={gagal || !src ? PENANDA : src}
      alt={alt}
      className={className}
      loading={loading}
      onError={() => setGagal(true)}
    />
  );
}

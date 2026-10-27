"use client";

import { motion } from "motion/react";
import { ReactNode, useEffect, useState } from "react";

// Pola muncul standar redesign Fase 1 (ala Blur Fade Magic UI): konten naik
// perlahan sambil fokus dari blur saat pertama kali masuk layar.
// CATATAN PERFORMA (perbaikan lag): menganimasikan filter blur itu MAHAL —
// browser harus me-raster ulang seluruh isi elemen di setiap frame, dan di
// seksi padat (mis. kartu-kartu donasi) belasan Reveal menyala bersamaan
// saat scroll cepat = lag terasa di HP. Jadi di layar kecil blur DIMATIKAN
// (cukup opacity + naik, tampilannya nyaris sama); efek blur penuh hanya
// berjalan di layar besar yang GPU-nya kuat.
export default function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const [ringan, setRingan] = useState(false);
  useEffect(() => {
    setRingan(window.matchMedia("(max-width: 768px)").matches);
  }, []);

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: ringan ? "blur(0px)" : "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

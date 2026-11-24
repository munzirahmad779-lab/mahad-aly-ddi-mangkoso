"use client";

import { motion } from "motion/react";
import { ReactNode } from "react";

// Pola muncul standar redesign Fase 1: konten naik perlahan sambil memudar
// masuk saat pertama kali masuk layar.
// CATATAN PERFORMA (perbaikan lag): menganimasikan filter blur itu MAHAL —
// browser harus me-raster ulang seluruh isi elemen di setiap frame, dan di
// seksi padat belasan Reveal menyala bersamaan saat scroll = lag terasa.
// Semula blur hanya dimatikan di layar kecil; sejak perbaikan lag 25 Nov
// 2026 blur dimatikan di SEMUA layar (cukup opacity + naik, tampilannya
// nyaris sama) supaya scroll mulus juga di desktop.
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
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

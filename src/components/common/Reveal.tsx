"use client";

import { motion } from "motion/react";
import { ReactNode } from "react";

// Pola muncul standar redesign Fase 1 (ala Blur Fade Magic UI): konten naik
// perlahan sambil fokus dari blur saat pertama kali masuk layar. Hanya
// menganimasikan opacity/transform/filter agar ringan di HP.
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
      initial={{ opacity: 0, y, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

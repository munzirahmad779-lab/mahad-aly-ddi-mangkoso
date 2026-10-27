"use client";

import { RefObject } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";

// Tracing Beam versi lite (Fase 3): garis gradasi hijau→emas di sisi kiri
// badan tulisan yang terisi mengikuti progres membaca, dengan titik cahaya
// di ujungnya. Murni transform (scaleY) dari Motion — tanpa SVG path berat.
// Hanya tampil di layar lebar (lg), di sisi luar kartu artikel.
export default function ReadingBeam({
  targetRef,
}: {
  targetRef: RefObject<HTMLElement | null>;
}) {
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start 0.8", "end 0.55"],
  });
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 25,
    mass: 0.4,
  });
  const dotTop = useTransform(scaleY, (v) => `${Math.min(100, Math.max(0, v * 100))}%`);

  return (
    <div
      aria-hidden
      className="hidden lg:block absolute -left-10 top-0 bottom-0 w-[3px] pointer-events-none"
    >
      {/* Rel kosong */}
      <div className="absolute inset-0 bg-slate-200/80 rounded-full" />
      {/* Isi beam mengikuti progres */}
      <motion.div
        className="absolute inset-0 origin-top rounded-full bg-gradient-to-b from-emerald-600 via-emerald-500 to-mahad-gold"
        style={{ scaleY }}
      />
      {/* Titik cahaya di ujung beam */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-mahad-gold shadow-[0_0_14px_rgba(212,175,55,0.95)]"
        style={{ top: dotTop }}
      />
    </div>
  );
}

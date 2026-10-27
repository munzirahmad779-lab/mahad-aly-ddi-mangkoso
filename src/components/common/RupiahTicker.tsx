"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "motion/react";

// Angka rupiah yang menghitung naik dari 0 saat pertama kali masuk layar
// (ticker donasi Fase 2). Sebelum terlihat, nilai asli langsung ditampilkan
// apa adanya agar tidak ada angka yang salah terbaca.
export default function RupiahTicker({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(value);
  const animatedRef = useRef(false);

  useEffect(() => {
    if (!inView || animatedRef.current) return;
    animatedRef.current = true;
    const controls = animate(0, value, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value]);

  return (
    <span ref={ref} className={className}>
      Rp {display.toLocaleString("id-ID")}
    </span>
  );
}

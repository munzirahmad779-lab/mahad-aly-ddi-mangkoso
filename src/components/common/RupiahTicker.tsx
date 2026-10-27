"use client";

import { useEffect, useRef } from "react";
import { animate, useInView } from "motion/react";

// Angka rupiah yang menghitung naik dari 0 saat pertama kali masuk layar
// (ticker donasi Fase 2). Selama animasi, nilai ditulis LANGSUNG ke node
// DOM — tanpa setState per frame — supaya scroll tetap ringan di HP
// (perbaikan lag: render ulang React 60x/detik di seksi donasi).
// Sebelum terlihat, nilai asli langsung ditampilkan apa adanya agar
// tidak ada angka yang salah terbaca.
export default function RupiahTicker({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const animatedRef = useRef(false);

  useEffect(() => {
    if (!inView || animatedRef.current) return;
    animatedRef.current = true;
    const node = ref.current;
    const format = (n: number) => "Rp " + n.toLocaleString("id-ID");
    const controls = animate(0, value, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        if (node) node.textContent = format(Math.round(v));
      },
      onComplete: () => {
        if (node) node.textContent = format(value);
      },
    });
    return () => controls.stop();
  }, [inView, value]);

  return (
    <span ref={ref} className={className}>
      Rp {value.toLocaleString("id-ID")}
    </span>
  );
}

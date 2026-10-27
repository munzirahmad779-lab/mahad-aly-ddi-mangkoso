"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "motion/react";

// Nilai metrik tampil sebagai angka berjalan (ala Number Ticker Magic UI) —
// HANYA bila nilai memang angka murni (boleh pemisah ribuan, akhiran % atau +).
// Nilai teks seperti "M.1", "4 Tahun", atau "Turats" ditampilkan apa adanya,
// persis seperti yang diisi admin.
export default function NumberTicker({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const match = /^\s*(\d{1,3}(?:\.\d{3})+|\d+)(%|\+)?\s*$/.exec(value || "");
  const target = match ? parseInt(match[1].replace(/\./g, ""), 10) : NaN;
  const suffix = match ? match[2] || "" : "";
  const [display, setDisplay] = useState<string>(value);

  useEffect(() => {
    if (!match || !inView || Number.isNaN(target)) return;
    const controls = animate(0, target, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v).toLocaleString("id-ID") + suffix),
    });
    return () => controls.stop();
    // match/target/suffix diturunkan murni dari value
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, value]);

  return <span ref={ref}>{display}</span>;
}

"use client";

import { useEffect, useRef } from "react";

// Widget Cloudflare Turnstile untuk halaman daftar dan wizard kirim
// jurnal (Tahap Keamanan). Widget HANYA tampil bila kunci situs
// NEXT_PUBLIC_TURNSTILE_SITE_KEY terpasang; tanpa kunci itu komponen
// tidak menggambar apa pun dan keputusan verifikasi berada di aturan
// server (src/lib/jurnal/keamanan.ts periksaTurnstile): mode supabase
// gagal tertutup, mode lokal dilewati dengan penanda log. Token hasil
// widget diteruskan pemanggil lewat onToken dan dikirim sebagai kolom
// turnstileToken pada badan permintaan.

interface TurnstileApi {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string;
      callback: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
    }
  ) => string;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";

export default function TurnstileJurnal({
  onToken
}: {
  onToken: (token: string | null) => void;
}) {
  const wadah = useRef<HTMLDivElement>(null);
  const tokenRef = useRef(onToken);
  tokenRef.current = onToken;

  useEffect(() => {
    if (!SITE_KEY || !wadah.current) return;
    let batal = false;

    const gambar = () => {
      if (batal || !wadah.current || !window.turnstile) return;
      window.turnstile.render(wadah.current, {
        sitekey: SITE_KEY,
        callback: (token) => tokenRef.current(token),
        "expired-callback": () => tokenRef.current(null),
        "error-callback": () => tokenRef.current(null)
      });
    };

    if (window.turnstile) {
      gambar();
    } else {
      const ada = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
      if (ada) {
        ada.addEventListener("load", gambar);
      } else {
        const skrip = document.createElement("script");
        skrip.src = SCRIPT_SRC;
        skrip.async = true;
        skrip.defer = true;
        skrip.addEventListener("load", gambar);
        document.head.appendChild(skrip);
      }
    }
    return () => {
      batal = true;
    };
  }, []);

  if (!SITE_KEY) return null;
  return (
    <div className="mt-2">
      <div ref={wadah} />
      <p className="text-xs text-slate-400 mt-1">
        Verifikasi keamanan: centang kotak di atas untuk membuktikan Anda
        bukan robot.
      </p>
    </div>
  );
}

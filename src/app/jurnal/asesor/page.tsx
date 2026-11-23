"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ambilTokenPanel, KerangkaPanel } from "../panel/login-panel";
import type { NaskahAsesorRingkasan } from "@/lib/jurnal/asesor";

// Halaman asesor: daftar naskah dengan proses editorialnya (gerbang
// M2). Asesor hanya membaca; identitas penulis dan reviewer tidak
// pernah tampil pada jalur ini.

export default function AsesorDaftarPage() {
  const [naskah, setNaskah] = useState<NaskahAsesorRingkasan[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [perluLogin, setPerluLogin] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  const muat = useCallback(async () => {
    const token = await ambilTokenPanel();
    try {
      const res = await fetch("/api/jurnal/asesor/naskah", {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json().catch(() => null);
      if (res.status === 401 || res.status === 403) {
        setPerluLogin(true);
      } else if (res.ok && data) {
        setNaskah(data.naskah ?? []);
        setPerluLogin(false);
      } else {
        setGalat(data?.error || "Gagal memuat daftar naskah.");
      }
    } catch {
      setGalat("Gagal menghubungi server.");
    }
    setMemuat(false);
  }, []);

  useEffect(() => {
    void muat();
  }, [muat]);

  return (
    <KerangkaPanel
      judul="Verifikasi Asesor"
      perluLogin={perluLogin}
      memuat={memuat}
      galat={galat}
      pesan={null}
      onMuatUlang={() => {
        setMemuat(true);
        void muat();
      }}
    >
      <p className="text-sm text-slate-500 mt-4">
        Daftar naskah beserta tahap proses editorialnya. Identitas penulis
        dan reviewer tidak ditampilkan pada halaman asesor.
      </p>
      <div className="mt-4 space-y-3">
        {naskah.length === 0 && !memuat && (
          <p className="text-sm text-slate-500">Belum ada naskah masuk.</p>
        )}
        {naskah.map((n) => (
          <Link
            key={n.kode}
            href={`/jurnal/asesor/${n.kode.toLowerCase()}`}
            className="block bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:border-mahad-green"
          >
            <p className="font-semibold text-slate-800">{n.judul}</p>
            <p className="text-sm text-slate-500 mt-1">
              {n.kode}
              {n.bagianLabel ? ` · ${n.bagianLabel}` : ""} · {n.statusLabel}{" "}
              · {n.jumlahPutaran} putaran telaah · masuk{" "}
              {new Date(n.dibuatPada).toLocaleDateString("id-ID")}
            </p>
          </Link>
        ))}
      </div>
    </KerangkaPanel>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

// Kartu "Akses Jurnal" di dasbor admin kampus: sakelar buka/tutup
// akses publik jurnal tanpa harus masuk panel jurnal (perintah user
// 25 Nov 2026). Berbicara ke /api/admin/jurnal-akses dengan token
// sesi admin kampus, mengikuti pola getAdminApiHeaders di halaman
// admin. Konfirmasi memakai kotak dalam halaman, bukan
// window.confirm, mengikuti pelajaran proyek jurnal.

type AksesJurnal = "terbuka" | "tertutup";

export default function KartuAksesJurnal() {
  const [akses, setAkses] = useState<AksesJurnal | null>(null);
  const [memuat, setMemuat] = useState(true);
  const [menyimpan, setMenyimpan] = useState(false);
  const [konfirmasi, setKonfirmasi] = useState<AksesJurnal | null>(null);
  const [pesan, setPesan] = useState<string | null>(null);
  const [galat, setGalat] = useState<string | null>(null);

  const ambilHeaders = useCallback(async (): Promise<Record<string, string>> => {
    const {
      data: { session },
      error
    } = await supabase.auth.getSession();
    if (error || !session?.access_token) {
      throw new Error("Sesi admin tidak ditemukan. Silakan keluar dan masuk kembali.");
    }
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`
    };
  }, []);

  const muatStatus = useCallback(async () => {
    setMemuat(true);
    try {
      const res = await fetch("/api/admin/jurnal-akses", {
        headers: await ambilHeaders()
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Gagal membaca status akses jurnal.");
      }
      setAkses(data.akses === "terbuka" ? "terbuka" : "tertutup");
      setGalat(null);
    } catch (err) {
      setGalat(
        err instanceof Error ? err.message : "Gagal membaca status akses jurnal."
      );
    } finally {
      setMemuat(false);
    }
  }, [ambilHeaders]);

  useEffect(() => {
    void muatStatus();
  }, [muatStatus]);

  const ubahAkses = async (nilai: AksesJurnal) => {
    setMenyimpan(true);
    setPesan(null);
    setGalat(null);
    try {
      const res = await fetch("/api/admin/jurnal-akses", {
        method: "PATCH",
        headers: await ambilHeaders(),
        body: JSON.stringify({ akses: nilai })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Gagal menyimpan status akses jurnal.");
      }
      setAkses(data.akses === "terbuka" ? "terbuka" : "tertutup");
      setKonfirmasi(null);
      setPesan(
        nilai === "terbuka"
          ? "Jurnal dibuka untuk publik. Perubahan berlaku dalam waktu sampai sekitar satu menit."
          : "Jurnal ditutup untuk publik. Perubahan berlaku dalam waktu sampai sekitar satu menit."
      );
    } catch (err) {
      setGalat(
        err instanceof Error ? err.message : "Gagal menyimpan status akses jurnal."
      );
    } finally {
      setMenyimpan(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
            <span>📖</span>
            <span>Akses Jurnal</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Buka dan tutup akses publik jurnal dari panel admin kampus ini.
          </p>
        </div>
        {akses && konfirmasi === null && (
          <button
            type="button"
            onClick={() =>
              setKonfirmasi(akses === "terbuka" ? "tertutup" : "terbuka")
            }
            className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition shrink-0"
          >
            {akses === "terbuka" ? "Tutup Jurnal" : "Buka Jurnal"}
          </button>
        )}
      </div>

      {memuat ? (
        <p className="text-sm text-slate-500">Memuat status akses jurnal...</p>
      ) : akses ? (
        <p className="text-sm text-slate-600">
          Keadaan sekarang:{" "}
          <strong className={akses === "terbuka" ? "text-emerald-700" : "text-amber-700"}>
            {akses === "terbuka"
              ? "TERBUKA untuk publik"
              : "TERTUTUP (hanya tim penguji)"}
          </strong>
          . Perubahan berlaku dalam waktu sampai sekitar satu menit tanpa
          deploy ulang.
        </p>
      ) : null}

      {pesan && (
        <p className="rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 text-sm px-4 py-3">
          {pesan}
        </p>
      )}
      {galat && (
        <div className="rounded-xl border border-red-300 bg-red-50 text-red-700 text-sm px-4 py-3 flex flex-wrap items-center justify-between gap-2">
          <span>{galat}</span>
          <button
            type="button"
            onClick={() => void muatStatus()}
            className="font-bold underline"
          >
            Coba lagi
          </button>
        </div>
      )}

      {konfirmasi !== null && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-900">
            {konfirmasi === "terbuka"
              ? "Buka jurnal untuk publik? Semua halaman jurnal, termasuk formulir pendaftaran dan pengiriman naskah, akan dapat diakses siapa pun."
              : "Tutup akses publik jurnal? Halaman jurnal akan kembali hanya dapat dibuka oleh tim penguji."}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => void ubahAkses(konfirmasi)}
              disabled={menyimpan}
              className="text-xs font-bold bg-amber-600 text-white rounded-full px-4 py-2 disabled:opacity-50"
            >
              {menyimpan
                ? "Menyimpan..."
                : konfirmasi === "terbuka"
                  ? "Ya, Buka Jurnal"
                  : "Ya, Tutup Jurnal"}
            </button>
            <button
              type="button"
              onClick={() => setKonfirmasi(null)}
              disabled={menyimpan}
              className="text-xs font-bold bg-white border border-slate-300 rounded-full px-4 py-2 disabled:opacity-50"
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

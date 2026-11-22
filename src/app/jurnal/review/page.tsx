"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ambilSesiKlien,
  type SesiKlienJurnal
} from "@/lib/jurnal/sesi-klien";
import type { JurnalAssignmentReviewerView } from "@/lib/jurnal/review";

// Dasbor reviewer (Tahap 3): daftar penugasan telaah milik reviewer yang
// masuk. Data dari /api/jurnal/review yang hanya mengembalikan
// penugasannya sendiri dalam bentuk anonim (tanpa identitas penulis).

export default function DasborReviewerPage() {
  const [sesi, setSesi] = useState<SesiKlienJurnal | null>(null);
  const [memuat, setMemuat] = useState(true);
  const [daftar, setDaftar] = useState<JurnalAssignmentReviewerView[]>([]);
  const [galat, setGalat] = useState<string | null>(null);

  const muat = useCallback(async () => {
    const s = await ambilSesiKlien();
    setSesi(s);
    if (!s) {
      setMemuat(false);
      return;
    }
    try {
      const res = await fetch("/api/jurnal/review", {
        headers: { Authorization: `Bearer ${s.token}` }
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setGalat(data?.error || "Gagal memuat penugasan telaah.");
      } else {
        setDaftar(data.penugasan as JurnalAssignmentReviewerView[]);
      }
    } catch {
      setGalat("Tidak dapat menghubungi server.");
    } finally {
      setMemuat(false);
    }
  }, []);

  useEffect(() => {
    void muat();
  }, [muat]);

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8">
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-800">
          Dasbor Reviewer
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          Telaah berjalan double-blind: identitas penulis tidak ditampilkan
          kepada reviewer, dan identitas Anda tidak ditampilkan kepada
          penulis.
        </p>

        {memuat ? (
          <p className="text-sm text-slate-500 mt-6">Memuat penugasan...</p>
        ) : !sesi ? (
          <div className="mt-4">
            <p className="text-sm text-slate-600">
              Halaman ini memerlukan akun reviewer. Silakan masuk terlebih
              dahulu.
            </p>
            <div className="mt-4">
              <Link
                href="/jurnal/masuk"
                className="bg-mahad-gold hover:bg-yellow-400 text-mahad-green-dark font-bold text-sm px-6 py-2.5 rounded-full shadow transition"
              >
                Masuk
              </Link>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-600 mt-2">
              Masuk sebagai <strong>{sesi.email}</strong>
              {sesi.mode === "local" && (
                <span className="text-amber-700"> (akun uji lokal)</span>
              )}
              .
            </p>
            {galat && (
              <p className="mt-4 rounded-xl border border-red-300 bg-red-50 text-red-700 text-sm px-4 py-3">
                {galat}
              </p>
            )}
            {daftar.length === 0 && !galat ? (
              <p className="text-sm text-slate-500 mt-6">
                Belum ada penugasan telaah untuk akun ini. Penugasan dari
                redaksi akan muncul di sini.
              </p>
            ) : (
              <div className="mt-6 space-y-4">
                {daftar.map((p) => (
                  <article
                    key={p.id}
                    className="border border-slate-200 rounded-xl p-4 sm:p-5 bg-slate-50"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-mono text-xs font-bold text-slate-500">
                          {p.kode} — Putaran {p.putaran}
                        </p>
                        <h2 className="font-serif font-bold text-base sm:text-lg text-slate-800 leading-snug mt-1">
                          {p.judul}
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                          {p.bagianLabel}
                          {p.tenggat
                            ? ` — Tenggat ${new Date(p.tenggat).toLocaleDateString("id-ID")}`
                            : ""}
                        </p>
                      </div>
                      <span className="text-xs font-bold bg-mahad-gold-light text-mahad-green-dark px-3 py-1 rounded-full shrink-0">
                        {p.statusLabel}
                      </span>
                    </div>
                    <div className="mt-4">
                      <Link
                        href={`/jurnal/review/${p.id}`}
                        className="bg-mahad-gold hover:bg-yellow-400 text-mahad-green-dark font-bold text-sm px-6 py-2.5 rounded-full shadow transition inline-block"
                      >
                        Buka Penugasan
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ambilSesiKlien,
  hapusSesiLokal,
  type SesiKlienJurnal
} from "@/lib/jurnal/sesi-klien";
import { supabase } from "@/lib/supabase/client";
import type { JurnalSubmissionView } from "@/lib/jurnal/status";
import type { JurnalHasilReviewPenulis } from "@/lib/jurnal/review";
import {
  validasiBerkasMeta,
  type JurnalBerkasMeta
} from "@/lib/jurnal/wizard";

// Halaman "Naskah Saya" (Tahap 2): daftar naskah milik penulis yang
// masuk, beserta status berkosakata OJS dan linimasanya. Data datang
// dari /api/jurnal/naskah-saya yang menyaring menurut pemilik sesi di
// server; penulis tidak pernah menerima naskah orang lain.
// Tahap 3 menambah: hasil telaah per putaran yang sudah diputuskan
// editor (reviewer tampil anonim sebagai "Reviewer 1", "Reviewer 2")
// dan formulir unggah berkas revisi sesudah keputusan revisi.

export default function NaskahSayaPage() {
  const [sesi, setSesi] = useState<SesiKlienJurnal | null>(null);
  const [memuat, setMemuat] = useState(true);
  const [daftar, setDaftar] = useState<JurnalSubmissionView[]>([]);
  const [hasilReview, setHasilReview] = useState<
    Record<string, JurnalHasilReviewPenulis[]>
  >({});
  const [galat, setGalat] = useState<string | null>(null);

  const muat = useCallback(async () => {
    const s = await ambilSesiKlien();
    setSesi(s);
    if (!s) {
      setMemuat(false);
      return;
    }
    try {
      const res = await fetch("/api/jurnal/naskah-saya", {
        headers: { Authorization: `Bearer ${s.token}` }
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setGalat(data?.error || "Gagal memuat naskah Anda.");
      } else {
        setDaftar(data.submissions as JurnalSubmissionView[]);
        setHasilReview(
          (data.hasilReview as Record<
            string,
            JurnalHasilReviewPenulis[]
          >) ?? {}
        );
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

  async function keluar() {
    hapusSesiLokal();
    await supabase.auth.signOut().catch(() => {});
    setSesi(null);
    setDaftar([]);
  }

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8">
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-800">
            Naskah Saya
          </h1>
          {sesi && (
            <button
              onClick={keluar}
              className="text-xs font-bold bg-white border border-slate-300 hover:border-mahad-gold rounded-full px-4 py-1.5 transition"
            >
              Keluar
            </button>
          )}
        </div>

        {memuat ? (
          <p className="text-sm text-slate-500 mt-6">Memuat naskah Anda...</p>
        ) : !sesi ? (
          <div className="mt-4">
            <p className="text-sm text-slate-600">
              Halaman ini memerlukan akun penulis. Silakan masuk untuk
              melihat naskah Anda.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/jurnal/masuk"
                className="bg-mahad-gold hover:bg-yellow-400 text-mahad-green-dark font-bold text-sm px-6 py-2.5 rounded-full shadow transition"
              >
                Masuk Penulis
              </Link>
              <Link
                href="/jurnal/daftar"
                className="bg-white border border-slate-300 hover:border-mahad-gold font-bold text-sm px-6 py-2.5 rounded-full transition"
              >
                Daftar Akun Penulis
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
              . Daftar di bawah hanya memuat naskah milik akun ini.
            </p>
            {galat && (
              <p className="mt-4 rounded-xl border border-red-300 bg-red-50 text-red-700 text-sm px-4 py-3">
                {galat}
              </p>
            )}
            {daftar.length === 0 && !galat ? (
              <p className="text-sm text-slate-500 mt-6">
                Anda belum memiliki naskah. Kirim naskah pertama lewat{" "}
                <Link
                  href="/jurnal/kirim"
                  className="text-mahad-green font-semibold underline"
                >
                  wizard kirim naskah
                </Link>
                .
              </p>
            ) : (
              <div className="mt-6 space-y-4">
                {daftar.map((n) => (
                  <article
                    key={n.kode}
                    className="border border-slate-200 rounded-xl p-4 sm:p-5 bg-slate-50"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-mono text-xs font-bold text-slate-500">
                          {n.kode}
                        </p>
                        <h2 className="font-serif font-bold text-base sm:text-lg text-slate-800 leading-snug mt-1">
                          {n.judul}
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                          {n.penulis}
                          {n.bagianLabel ? ` — ${n.bagianLabel}` : ""}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Dikirim{" "}
                          {new Date(n.dibuatPada).toLocaleString("id-ID")}
                        </p>
                      </div>
                      <span className="text-xs font-bold bg-mahad-gold-light text-mahad-green-dark px-3 py-1 rounded-full shrink-0">
                        {n.statusLabel}
                      </span>
                    </div>
                    {n.berkas && n.berkas.length > 0 && (
                      <p className="text-xs text-slate-500 mt-3">
                        Berkas tercatat:{" "}
                        {n.berkas
                          .map(
                            (b) =>
                              `${b.kategori === "utama" ? "utama" : "pendukung"}: ${b.namaAsli}`
                          )
                          .join("; ")}
                      </p>
                    )}
                    {(hasilReview[n.kode] ?? []).map((h) => (
                      <div
                        key={h.putaran}
                        className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3"
                      >
                        <p className="text-sm font-semibold text-slate-700">
                          Hasil Telaah Putaran {h.putaran}: {h.keputusanLabel}
                        </p>
                        {h.ulasan.length === 0 ? (
                          <p className="text-sm text-slate-500 mt-1">
                            Belum ada komentar reviewer yang diteruskan pada
                            putaran ini.
                          </p>
                        ) : (
                          <ul className="mt-2 space-y-3">
                            {h.ulasan.map((u, i) => (
                              <li key={i} className="text-sm">
                                <span className="font-semibold text-slate-700">
                                  {u.label}
                                </span>
                                {u.rekomendasiLabel && (
                                  <span className="text-slate-500">
                                    {" "}
                                    — Rekomendasi: {u.rekomendasiLabel}
                                  </span>
                                )}
                                {u.komentar && (
                                  <span className="block text-slate-600 whitespace-pre-line mt-1">
                                    {u.komentar}
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                    {(() => {
                      const hasil = hasilReview[n.kode] ?? [];
                      const terakhir = hasil[hasil.length - 1];
                      const perluRevisi =
                        n.status === "review" &&
                        terakhir &&
                        (terakhir.keputusan === "minor_revisions" ||
                          terakhir.keputusan === "major_revisions");
                      return perluRevisi && sesi ? (
                        <UnggahRevisi
                          kode={n.kode}
                          token={sesi.token}
                          putaran={terakhir.putaran}
                          onSelesai={muat}
                        />
                      ) : null;
                    })()}
                    {n.riwayat.length > 0 && (
                      <ol className="mt-4 space-y-2 border-l-2 border-slate-200 pl-4">
                        {n.riwayat.map((r, i) => (
                          <li key={i} className="text-sm">
                            <span className="font-semibold text-slate-700">
                              {r.label}
                            </span>{" "}
                            <span className="text-slate-400 text-xs">
                              {new Date(r.pada).toLocaleString("id-ID")}
                            </span>
                            {r.catatan && (
                              <span className="block text-slate-500">
                                {r.catatan}
                              </span>
                            )}
                          </li>
                        ))}
                      </ol>
                    )}
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

// Formulir unggah berkas revisi (Tahap 3). Berkas diunggah lewat alur
// Tahap 2 (sign lalu PUT ke R2, atau cadangan uji lokal), lalu
// metadatanya didaftarkan ke putaran yang meminta revisi lewat route
// revisi. Sesudah terdaftar, editor dapat membuka putaran berikutnya.
function UnggahRevisi({
  kode,
  token,
  putaran,
  onSelesai
}: {
  kode: string;
  token: string;
  putaran: number;
  onSelesai: () => Promise<void>;
}) {
  const [batchId] = useState(
    () =>
      `revisi-${Date.now().toString(36)}-${Math.random()
        .toString(36)
        .slice(2, 8)}`
  );
  const [metas, setMetas] = useState<JurnalBerkasMeta[]>([]);
  const [sibuk, setSibuk] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [berhasil, setBerhasil] = useState<string | null>(null);

  async function unggahSatu(
    file: File,
    kategori: "utama" | "pendukung"
  ): Promise<JurnalBerkasMeta | null> {
    const pesan = validasiBerkasMeta({
      kategori,
      namaAsli: file.name,
      mime: file.type,
      ukuran: file.size
    });
    if (pesan) {
      setGalat(pesan);
      return null;
    }
    const resSign = await fetch("/api/jurnal/uploads/sign", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        batchId,
        kategori,
        namaAsli: file.name,
        mime: file.type,
        ukuran: file.size
      })
    });
    const sign = await resSign.json().catch(() => null);
    if (!resSign.ok) {
      setGalat(sign?.error || "Gagal menyiapkan unggahan revisi.");
      return null;
    }
    if (sign.mode === "r2") {
      const put = await fetch(sign.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "application/octet-stream"
        },
        body: file
      });
      if (!put.ok) {
        setGalat("Unggahan revisi ke penyimpanan berkas gagal.");
        return null;
      }
      return {
        kategori,
        namaAsli: file.name,
        mime: file.type,
        ukuran: file.size,
        bucket: sign.bucket,
        kunci: sign.kunci,
        mode: "r2"
      };
    }
    const form = new FormData();
    form.append("berkas", file);
    form.append("kategori", kategori);
    form.append("batchId", batchId);
    const resLocal = await fetch("/api/jurnal/uploads/local", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form
    });
    const dataLocal = await resLocal.json().catch(() => null);
    if (!resLocal.ok) {
      setGalat(dataLocal?.error || "Unggahan revisi uji lokal gagal.");
      return null;
    }
    return dataLocal.berkas as JurnalBerkasMeta;
  }

  async function pilihUtama(files: FileList | null) {
    if (!files || files.length === 0) return;
    setGalat(null);
    const meta = await unggahSatu(files[0], "utama");
    if (meta) {
      setMetas((d) => [meta, ...d.filter((m) => m.kategori !== "utama")]);
    }
  }

  async function pilihPendukung(files: FileList | null) {
    if (!files || files.length === 0) return;
    setGalat(null);
    for (const file of Array.from(files)) {
      const meta = await unggahSatu(file, "pendukung");
      if (meta) setMetas((d) => [...d, meta]);
    }
  }

  async function kirimRevisi() {
    setSibuk(true);
    setGalat(null);
    try {
      const res = await fetch(
        `/api/jurnal/submissions/${encodeURIComponent(kode)}/revisi`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ berkas: metas })
        }
      );
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setGalat(data?.error || "Gagal mendaftarkan berkas revisi.");
        return;
      }
      setBerhasil(
        "Berkas revisi terdaftar. Redaksi akan membuka putaran telaah berikutnya."
      );
      setMetas([]);
      await onSelesai();
    } catch {
      setGalat("Tidak dapat menghubungi server.");
    } finally {
      setSibuk(false);
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3">
      <p className="text-sm font-semibold text-amber-900">
        Unggah Berkas Revisi (untuk Putaran {putaran})
      </p>
      <p className="text-xs text-amber-800 mt-1">
        Editor memutuskan revisi pada putaran {putaran}. Unggah naskah
        hasil revisi di sini; redaksi akan membuka putaran berikutnya
        sesudah berkas terdaftar.
      </p>
      {galat && (
        <p className="mt-3 rounded-xl border border-red-300 bg-red-50 text-red-700 text-sm px-4 py-3">
          {galat}
        </p>
      )}
      {berhasil && (
        <p className="mt-3 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 text-sm px-4 py-3">
          {berhasil}
        </p>
      )}
      <div className="mt-3 space-y-3">
        <div>
          <label
            htmlFor={`revisi-utama-${kode}`}
            className="block text-sm font-semibold text-slate-700 mb-1"
          >
            Berkas revisi utama (PDF atau DOCX)
          </label>
          <input
            id={`revisi-utama-${kode}`}
            type="file"
            accept=".pdf,.docx"
            onChange={(e) => void pilihUtama(e.target.files)}
            className="text-sm"
          />
        </div>
        <div>
          <label
            htmlFor={`revisi-pendukung-${kode}`}
            className="block text-sm font-semibold text-slate-700 mb-1"
          >
            Berkas pendukung revisi (tidak wajib)
          </label>
          <input
            id={`revisi-pendukung-${kode}`}
            type="file"
            multiple
            accept=".pdf,.docx,.xlsx,.zip"
            onChange={(e) => void pilihPendukung(e.target.files)}
            className="text-sm"
          />
        </div>
        {metas.length > 0 && (
          <ul className="text-xs text-slate-600 space-y-1">
            {metas.map((m, i) => (
              <li key={i}>
                Terunggah ({m.kategori}): {m.namaAsli}
              </li>
            ))}
          </ul>
        )}
        <button
          onClick={kirimRevisi}
          disabled={sibuk || !metas.some((m) => m.kategori === "utama")}
          className="bg-mahad-gold hover:bg-yellow-400 disabled:opacity-60 text-mahad-green-dark font-bold text-sm px-6 py-2.5 rounded-full shadow transition"
        >
          {sibuk ? "Mendaftarkan..." : "Daftarkan Berkas Revisi"}
        </button>
      </div>
    </div>
  );
}

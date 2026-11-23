"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ambilTokenPanel, KerangkaPanel } from "../../panel/login-panel";
import type { NaskahAsesorRincian } from "@/lib/jurnal/asesor";

// Rincian proses editorial untuk asesor (gerbang M2): putaran telaah,
// penugasan reviewer anonim dengan tenggat dan tanggal serah,
// keputusan editor, tahap copyediting dan produksi, serta linimasa
// status naskah. Tanpa identitas penulis dan reviewer.

function fmt(iso: string | null): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

export default function AsesorRincianPage() {
  const params = useParams<{ kode: string }>();
  const kode = (params?.kode ?? "").toUpperCase();
  const [rincian, setRincian] = useState<NaskahAsesorRincian | null>(null);
  const [memuat, setMemuat] = useState(true);
  const [perluLogin, setPerluLogin] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  const muat = useCallback(async () => {
    if (!kode) return;
    const token = await ambilTokenPanel();
    try {
      const res = await fetch(`/api/jurnal/asesor/naskah/${kode}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json().catch(() => null);
      if (res.status === 401 || res.status === 403) {
        setPerluLogin(true);
      } else if (res.ok && data) {
        setRincian(data.rincian);
        setPerluLogin(false);
      } else {
        setGalat(data?.error || "Gagal memuat rincian naskah.");
      }
    } catch {
      setGalat("Gagal menghubungi server.");
    }
    setMemuat(false);
  }, [kode]);

  useEffect(() => {
    void muat();
  }, [muat]);

  return (
    <KerangkaPanel
      judul="Rincian Proses Editorial"
      perluLogin={perluLogin}
      memuat={memuat}
      galat={galat}
      pesan={null}
      onMuatUlang={() => {
        setMemuat(true);
        void muat();
      }}
    >
      {rincian && (
        <div className="mt-6 space-y-6">
          <p className="text-sm">
            <Link
              href="/jurnal/asesor"
              className="text-mahad-green font-semibold underline"
            >
              Kembali ke daftar naskah
            </Link>
          </p>
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="font-serif font-bold text-lg text-slate-800">
              {rincian.judul}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {rincian.kode}
              {rincian.bagianLabel ? ` · ${rincian.bagianLabel}` : ""} ·
              Status: {rincian.statusLabel} · Masuk {fmt(rincian.dibuatPada)}
            </p>
            {rincian.kataKunci.length > 0 && (
              <p className="text-sm text-slate-500 mt-1">
                Kata kunci: {rincian.kataKunci.join(", ")}
              </p>
            )}
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="font-serif font-bold text-lg text-slate-800">
              Putaran Telaah Sejawat
            </h2>
            {rincian.putaran.length === 0 ? (
              <p className="text-sm text-slate-500 mt-3">
                Belum ada putaran telaah.
              </p>
            ) : (
              rincian.putaran.map((p) => (
                <div
                  key={p.nomor}
                  className="mt-4 border-t border-slate-100 pt-4 first:border-0 first:pt-0"
                >
                  <p className="text-sm font-semibold text-slate-700">
                    Putaran {p.nomor} · {p.status === "open" ? "Berjalan" : "Ditutup"}
                    {p.keputusanLabel
                      ? ` · Keputusan: ${p.keputusanLabel} (${fmt(p.diputuskanPada)})`
                      : ""}
                  </p>
                  <table className="w-full text-sm mt-2">
                    <thead>
                      <tr className="text-left text-slate-400 border-b border-slate-200">
                        <th className="py-1.5 pr-3 font-semibold">Reviewer</th>
                        <th className="py-1.5 pr-3 font-semibold">Status</th>
                        <th className="py-1.5 pr-3 font-semibold">Tenggat</th>
                        <th className="py-1.5 font-semibold">Diserahkan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {p.penugasan.map((a) => (
                        <tr
                          key={a.label}
                          className="border-b border-slate-100 last:border-0"
                        >
                          <td className="py-1.5 pr-3">{a.label}</td>
                          <td className="py-1.5 pr-3">{a.status}</td>
                          <td className="py-1.5 pr-3">{fmt(a.tenggat)}</td>
                          <td className="py-1.5">{fmt(a.diserahkanPada)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))
            )}
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="font-serif font-bold text-lg text-slate-800">
              Tahap Sesudah Telaah
            </h2>
            <dl className="text-sm mt-3 space-y-2">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <dt className="text-slate-500">Copyediting</dt>
                <dd className="font-semibold">
                  {rincian.copyediting ? rincian.copyediting.status : "Belum mulai"}
                </dd>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <dt className="text-slate-500">Produksi</dt>
                <dd className="font-semibold">
                  {rincian.produksi
                    ? `${rincian.produksi.status} (proof: ${rincian.produksi.proofStatus})`
                    : "Belum mulai"}
                </dd>
              </div>
            </dl>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="font-serif font-bold text-lg text-slate-800">
              Linimasa Status
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              {rincian.riwayat.map((r, i) => (
                <li
                  key={i}
                  className="flex justify-between border-b border-slate-100 pb-2 last:border-0"
                >
                  <span>{r.label}</span>
                  <span className="text-slate-400">{fmt(r.pada)}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </KerangkaPanel>
  );
}

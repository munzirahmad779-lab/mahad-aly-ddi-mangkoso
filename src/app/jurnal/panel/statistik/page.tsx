"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ambilTokenPanel, KerangkaPanel } from "../login-panel";
import type { JurnalStatistikView } from "@/lib/jurnal/publik5";

// Panel statistik (Tahap 5): total dan per artikel untuk dilihat dan
// unduhan, dari tabel metrik harian. Tidak ada data pribadi pengunjung
// yang dikumpulkan atau ditampilkan.

export default function PanelStatistikPage() {
  const [statistik, setStatistik] = useState<JurnalStatistikView | null>(null);
  const [memuat, setMemuat] = useState(true);
  const [perluLogin, setPerluLogin] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  const muat = useCallback(async () => {
    const token = await ambilTokenPanel();
    try {
      const res = await fetch("/api/jurnal/statistik", {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json().catch(() => null);
      if (res.status === 401 || res.status === 403) {
        setPerluLogin(true);
      } else if (res.ok && data) {
        setStatistik(data.statistik);
        setPerluLogin(false);
      } else {
        setGalat(data?.error || "Gagal memuat statistik.");
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
      judul="Panel Statistik Jurnal"
      perluLogin={perluLogin}
      memuat={memuat}
      galat={galat}
      pesan={null}
      onMuatUlang={() => {
        setMemuat(true);
        void muat();
      }}
    >
      {statistik && (
        <div className="mt-6 space-y-8">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Dilihat
              </p>
              <p className="font-serif font-bold text-3xl text-mahad-green-dark mt-2">
                {statistik.totalViews}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Unduhan PDF
              </p>
              <p className="font-serif font-bold text-3xl text-mahad-green-dark mt-2">
                {statistik.totalDownloads}
              </p>
            </div>
          </div>

          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="font-serif font-bold text-lg text-slate-800">
              Per Artikel
            </h2>
            {statistik.perArtikel.length === 0 ? (
              <p className="text-sm text-slate-500 mt-3">
                Belum ada kunjungan atau unduhan yang tercatat.
              </p>
            ) : (
              <table className="w-full text-sm mt-4">
                <thead>
                  <tr className="text-left text-slate-400 border-b border-slate-200">
                    <th className="py-2 pr-3 font-semibold">Artikel</th>
                    <th className="py-2 pr-3 font-semibold">Status</th>
                    <th className="py-2 pr-3 font-semibold text-right">
                      Dilihat
                    </th>
                    <th className="py-2 font-semibold text-right">Unduhan</th>
                  </tr>
                </thead>
                <tbody>
                  {statistik.perArtikel.map((a) => (
                    <tr
                      key={a.kode}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="py-2 pr-3">
                        <Link
                          href={`/jurnal/artikel/${a.kode.toLowerCase()}`}
                          className="text-mahad-green hover:underline"
                        >
                          {a.judul}
                        </Link>
                        <span className="block text-xs text-slate-400">
                          {a.kode}
                        </span>
                      </td>
                      <td className="py-2 pr-3">{a.status}</td>
                      <td className="py-2 pr-3 text-right">{a.views}</td>
                      <td className="py-2 text-right">{a.downloads}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="font-serif font-bold text-lg text-slate-800">
              Per Hari (30 hari tercatat terakhir)
            </h2>
            {statistik.perHari.length === 0 ? (
              <p className="text-sm text-slate-500 mt-3">
                Belum ada data harian.
              </p>
            ) : (
              <table className="w-full text-sm mt-4">
                <thead>
                  <tr className="text-left text-slate-400 border-b border-slate-200">
                    <th className="py-2 pr-3 font-semibold">Tanggal</th>
                    <th className="py-2 pr-3 font-semibold text-right">
                      Dilihat
                    </th>
                    <th className="py-2 font-semibold text-right">Unduhan</th>
                  </tr>
                </thead>
                <tbody>
                  {statistik.perHari.map((h) => (
                    <tr
                      key={h.tanggal}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="py-2 pr-3">{h.tanggal}</td>
                      <td className="py-2 pr-3 text-right">{h.views}</td>
                      <td className="py-2 text-right">{h.downloads}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>
      )}
    </KerangkaPanel>
  );
}

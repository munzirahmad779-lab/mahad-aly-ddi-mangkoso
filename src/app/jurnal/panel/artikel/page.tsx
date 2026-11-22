"use client";

import { useCallback, useEffect, useState } from "react";
import { ambilTokenPanel, KerangkaPanel } from "../login-panel";
import type { JurnalArtikelDoiView } from "@/lib/jurnal/publik5";

// Panel DOI dan penarikan (Tahap 5): hanya journal_manager. DOI diisi
// sesudah deposit Crossref; tampil publik sebagai tautan doi.org penuh.
// Penarikan menandai artikel sebagai ditarik: hilang dari publik,
// halamannya menjadi pemberitahuan, dan rekod OAI menjadi deleted.

export default function PanelArtikelPage() {
  const [artikel, setArtikel] = useState<JurnalArtikelDoiView[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [perluLogin, setPerluLogin] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [pesan, setPesan] = useState<string | null>(null);
  const [doiInput, setDoiInput] = useState<Record<string, string>>({});
  const [alasan, setAlasan] = useState<Record<string, string>>({});
  const [sibuk, setSibuk] = useState(false);

  const muat = useCallback(async () => {
    const token = await ambilTokenPanel();
    try {
      const res = await fetch("/api/jurnal/artikel", {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json().catch(() => null);
      if (res.status === 401 || res.status === 403) {
        setPerluLogin(true);
      } else if (res.ok && data) {
        setArtikel(data.artikel ?? []);
        setPerluLogin(false);
      } else {
        setGalat(data?.error || "Gagal memuat daftar artikel.");
      }
    } catch {
      setGalat("Gagal menghubungi server.");
    }
    setMemuat(false);
  }, []);

  useEffect(() => {
    void muat();
  }, [muat]);

  async function kirim(
    jalur: string,
    method: "PATCH" | "POST",
    body: unknown
  ): Promise<boolean> {
    const token = await ambilTokenPanel();
    if (!token) {
      setGalat("Sesi manajer jurnal tidak ditemukan. Masuk ulang.");
      return false;
    }
    setSibuk(true);
    try {
      const res = await fetch(jalur, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setGalat(data?.error || "Perintah gagal dijalankan.");
        return false;
      }
      return true;
    } catch {
      setGalat("Gagal menghubungi server.");
      return false;
    } finally {
      setSibuk(false);
    }
  }

  return (
    <KerangkaPanel
      judul="Panel DOI dan Penarikan Artikel"
      perluLogin={perluLogin}
      memuat={memuat}
      galat={galat}
      pesan={pesan}
      onMuatUlang={() => {
        setMemuat(true);
        void muat();
      }}
    >
      <p className="mt-4 text-sm text-slate-600 max-w-3xl">
        Halaman ini hanya untuk Manajer Jurnal. Isi DOI sesudah deposit
        Crossref selesai; kosongkan lalu simpan untuk menghapus DOI.
        Penarikan bersifat tetap di catatan: artikel tidak dihapus,
        hanya ditandai ditarik.
      </p>
      <div className="mt-6 space-y-4">
        {artikel.length === 0 && (
          <p className="text-sm text-slate-500">
            Belum ada artikel terbit.
          </p>
        )}
        {artikel.map((a) => (
          <article
            key={a.kode}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
          >
            <h3 className="font-serif font-bold text-slate-800">{a.judul}</h3>
            <p className="text-xs text-slate-400 mt-1">
              {a.kode}
              {a.ditarikPada
                ? ` • DITARIK pada ${new Date(a.ditarikPada).toLocaleString("id-ID")}`
                : ""}
            </p>
            {a.doi && (
              <p className="text-sm mt-2">
                DOI saat ini:{" "}
                <a
                  href={`https://doi.org/${a.doi}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-mahad-green hover:underline"
                >
                  https://doi.org/{a.doi}
                </a>
              </p>
            )}
            {!a.ditarikPada && (
              <div className="mt-4 flex flex-wrap gap-2 items-center">
                <input
                  value={doiInput[a.kode] ?? a.doi ?? ""}
                  onChange={(e) =>
                    setDoiInput({ ...doiInput, [a.kode]: e.target.value })
                  }
                  placeholder="10.1234/turatsuna.v1i1.1"
                  className="flex-1 min-w-56 rounded-xl border border-slate-300 px-3.5 py-2 text-sm"
                />
                <button
                  disabled={sibuk}
                  onClick={async () => {
                    if (
                      await kirim(
                        `/api/jurnal/artikel/${a.kode}/doi`,
                        "PATCH",
                        { doi: doiInput[a.kode] ?? a.doi ?? "" }
                      )
                    ) {
                      setPesan(`DOI ${a.kode} disimpan.`);
                      await muat();
                    }
                  }}
                  className="bg-mahad-gold hover:bg-yellow-400 disabled:opacity-60 text-mahad-green-dark font-bold text-sm px-5 py-2 rounded-full shadow transition"
                >
                  Simpan DOI
                </button>
              </div>
            )}
            {!a.ditarikPada && (
              <div className="mt-3 flex flex-wrap gap-2 items-center">
                <input
                  value={alasan[a.kode] ?? ""}
                  onChange={(e) =>
                    setAlasan({ ...alasan, [a.kode]: e.target.value })
                  }
                  placeholder="Alasan penarikan (tampil di pemberitahuan)"
                  className="flex-1 min-w-56 rounded-xl border border-slate-300 px-3.5 py-2 text-sm"
                />
                <button
                  disabled={sibuk}
                  onClick={async () => {
                    if (
                      confirm(
                        `Tarik artikel ${a.kode}? Artikel hilang dari publik dan rekod OAI-nya menjadi deleted.`
                      ) &&
                      (await kirim(
                        `/api/jurnal/artikel/${a.kode}/tarik`,
                        "POST",
                        { alasan: alasan[a.kode] ?? "" }
                      ))
                    ) {
                      setPesan(`Artikel ${a.kode} ditarik.`);
                      await muat();
                    }
                  }}
                  className="text-sm font-bold border border-red-300 text-red-700 hover:bg-red-50 rounded-full px-5 py-2 transition"
                >
                  Tarik Artikel
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
    </KerangkaPanel>
  );
}

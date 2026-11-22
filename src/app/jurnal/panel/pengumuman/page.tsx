"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ambilTokenPanel, KerangkaPanel } from "../login-panel";
import type { JurnalPengumumanView } from "@/lib/jurnal/publik5";

// Panel pengumuman (Tahap 5): staf membuat, menyunting, menayangkan,
// dan menghapus pengumuman. Yang publik hanya yang bertanda tayang dan
// belum kedaluwarsa; penegakannya di fasad server, halaman ini hanya
// menampilkan keadaan dan mengirim perintah.

const kelasInput =
  "w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-mahad-gold";

export default function PanelPengumumanPage() {
  const [daftar, setDaftar] = useState<JurnalPengumumanView[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [perluLogin, setPerluLogin] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [pesan, setPesan] = useState<string | null>(null);
  const [sibuk, setSibuk] = useState(false);
  const [baru, setBaru] = useState({
    judul: "",
    isi: "",
    tayang: true,
    kedaluwarsaPada: ""
  });

  const muat = useCallback(async () => {
    const token = await ambilTokenPanel();
    try {
      const res = await fetch("/api/jurnal/pengumuman", {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data) {
        setDaftar(data.pengumuman ?? []);
        setPerluLogin(!(data.modeStaf === true));
        if (data.modeStaf !== true) setPerluLogin(true);
      } else {
        setGalat(data?.error || "Gagal memuat pengumuman.");
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
    method: "POST" | "PATCH" | "DELETE",
    body?: unknown
  ): Promise<boolean> {
    const token = await ambilTokenPanel();
    if (!token) {
      setGalat("Sesi staf tidak ditemukan. Masuk ulang.");
      return false;
    }
    setSibuk(true);
    try {
      const res = await fetch(jalur, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(body !== undefined
            ? { "Content-Type": "application/json" }
            : {})
        },
        body: body !== undefined ? JSON.stringify(body) : undefined
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

  async function handleBuat(e: FormEvent) {
    e.preventDefault();
    setGalat(null);
    const ok = await kirim("/api/jurnal/pengumuman", "POST", {
      judul: baru.judul,
      isi: baru.isi,
      tayang: baru.tayang,
      kedaluwarsaPada: baru.kedaluwarsaPada
        ? new Date(baru.kedaluwarsaPada).toISOString()
        : null
    });
    if (ok) {
      setPesan("Pengumuman dibuat.");
      setBaru({ judul: "", isi: "", tayang: true, kedaluwarsaPada: "" });
      await muat();
    }
  }

  return (
    <KerangkaPanel
      judul="Panel Pengumuman"
      perluLogin={perluLogin}
      memuat={memuat}
      galat={galat}
      pesan={pesan}
      onMuatUlang={() => {
        setMemuat(true);
        void muat();
      }}
    >
      <form
        onSubmit={handleBuat}
        className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4"
      >
        <h2 className="font-serif font-bold text-lg text-slate-800">
          Pengumuman Baru
        </h2>
        <input
          required
          value={baru.judul}
          onChange={(e) => setBaru({ ...baru, judul: e.target.value })}
          placeholder="Judul pengumuman"
          className={kelasInput}
        />
        <textarea
          required
          value={baru.isi}
          onChange={(e) => setBaru({ ...baru, isi: e.target.value })}
          placeholder="Isi pengumuman"
          rows={4}
          className={kelasInput}
        />
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={baru.tayang}
              onChange={(e) => setBaru({ ...baru, tayang: e.target.checked })}
            />
            Tayang ke publik
          </label>
          <label className="flex items-center gap-2">
            Kedaluwarsa
            <input
              type="date"
              value={baru.kedaluwarsaPada}
              onChange={(e) =>
                setBaru({ ...baru, kedaluwarsaPada: e.target.value })
              }
              className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
            />
          </label>
          <button
            type="submit"
            disabled={sibuk}
            className="bg-mahad-gold hover:bg-yellow-400 disabled:opacity-60 text-mahad-green-dark font-bold text-sm px-5 py-2 rounded-full shadow transition"
          >
            Buat Pengumuman
          </button>
        </div>
      </form>

      <div className="mt-8 space-y-4">
        {daftar.length === 0 && (
          <p className="text-sm text-slate-500">Belum ada pengumuman.</p>
        )}
        {daftar.map((p) => (
          <article
            key={p.id}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-serif font-bold text-slate-800">{p.judul}</h3>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  p.tayang
                    ? "bg-emerald-50 text-mahad-green-dark border-emerald-200"
                    : "bg-slate-100 text-slate-500 border-slate-200"
                }`}
              >
                {p.tayang ? "Tayang" : "Draf"}
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-2 whitespace-pre-line">
              {p.isi}
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Dibuat {new Date(p.dibuatPada).toLocaleString("id-ID")}
              {p.kedaluwarsaPada
                ? ` • kedaluwarsa ${new Date(p.kedaluwarsaPada).toLocaleDateString("id-ID")}`
                : ""}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                disabled={sibuk}
                onClick={async () => {
                  if (
                    await kirim(`/api/jurnal/pengumuman/${p.id}`, "PATCH", {
                      tayang: !p.tayang
                    })
                  ) {
                    setPesan(
                      p.tayang
                        ? "Pengumuman ditarik ke draf."
                        : "Pengumuman ditayangkan."
                    );
                    await muat();
                  }
                }}
                className="text-xs font-bold border border-slate-300 hover:border-mahad-gold rounded-full px-4 py-1.5 transition"
              >
                {p.tayang ? "Jadikan Draf" : "Tayangkan"}
              </button>
              <button
                disabled={sibuk}
                onClick={async () => {
                  if (
                    confirm(`Hapus pengumuman "${p.judul}"?`) &&
                    (await kirim(`/api/jurnal/pengumuman/${p.id}`, "DELETE"))
                  ) {
                    setPesan("Pengumuman dihapus.");
                    await muat();
                  }
                }}
                className="text-xs font-bold border border-red-300 text-red-700 hover:bg-red-50 rounded-full px-4 py-1.5 transition"
              >
                Hapus
              </button>
            </div>
          </article>
        ))}
      </div>
    </KerangkaPanel>
  );
}

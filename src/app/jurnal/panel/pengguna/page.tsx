"use client";

import { useCallback, useEffect, useState } from "react";
import { ambilTokenPanel, KerangkaPanel } from "../login-panel";
import {
  JURNAL_ROLES,
  JURNAL_ROLE_LABEL_ID,
  type JurnalRole
} from "@/lib/jurnal/status";
import type { PenggunaJurnalView } from "@/lib/jurnal/akun-kelola";

// Panel manajemen akun jurnal (Tahap Penutup Celah, butir S4b). Hanya
// Manajer Jurnal: ganti peran dan nonaktifkan/aktifkan akun. Akun yang
// dinonaktifkan tidak dapat masuk lagi; minimal satu Manajer Jurnal
// aktif selalu dijaga di server.

export default function PanelPenggunaPage() {
  const [pengguna, setPengguna] = useState<PenggunaJurnalView[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [perluLogin, setPerluLogin] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [pesan, setPesan] = useState<string | null>(null);
  const [menyimpan, setMenyimpan] = useState<string | null>(null);

  const muat = useCallback(async () => {
    const token = await ambilTokenPanel();
    try {
      const res = await fetch("/api/jurnal/pengguna", {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json().catch(() => null);
      if (res.status === 401 || res.status === 403) {
        setPerluLogin(true);
      } else if (res.ok && data) {
        setPengguna(data.pengguna ?? []);
        setPerluLogin(false);
      } else {
        setGalat(data?.error || "Gagal memuat daftar pengguna.");
      }
    } catch {
      setGalat("Gagal menghubungi server.");
    }
    setMemuat(false);
  }, []);

  useEffect(() => {
    void muat();
  }, [muat]);

  async function simpan(
    email: string,
    patch: { aktif?: boolean; peran?: JurnalRole[] }
  ) {
    setMenyimpan(email);
    setPesan(null);
    setGalat(null);
    const token = await ambilTokenPanel();
    try {
      const res = await fetch("/api/jurnal/pengguna", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ email, ...patch })
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setGalat(data?.error || "Gagal menyimpan perubahan.");
      } else {
        setPesan(`Perubahan untuk ${email} tersimpan.`);
        await muat();
      }
    } catch {
      setGalat("Gagal menghubungi server.");
    }
    setMenyimpan(null);
  }

  function ubahPeranLokal(email: string, peran: JurnalRole, dicentang: boolean) {
    setPengguna((lama) =>
      lama.map((p) => {
        if (p.email !== email) return p;
        const baru = dicentang
          ? [...p.peran, peran]
          : p.peran.filter((x) => x !== peran);
        return { ...p, peran: baru };
      })
    );
  }

  return (
    <KerangkaPanel
      judul="Manajemen Akun Jurnal"
      perluLogin={perluLogin}
      memuat={memuat}
      galat={galat}
      pesan={pesan}
      onMuatUlang={() => {
        setMemuat(true);
        void muat();
      }}
    >
      <div className="mt-6 space-y-4">
        {pengguna.length === 0 && !memuat && (
          <p className="text-sm text-slate-500">Belum ada akun terdaftar.</p>
        )}
        {pengguna.map((p) => (
          <section
            key={p.email}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-800">{p.nama}</p>
                <p className="text-sm text-slate-500">
                  {p.email}
                  {p.afiliasi ? ` · ${p.afiliasi}` : ""}
                </p>
                <p
                  className={`text-xs font-semibold mt-1 ${p.aktif ? "text-emerald-600" : "text-red-600"}`}
                >
                  {p.aktif ? "Aktif" : "Nonaktif"}
                </p>
              </div>
              <button
                type="button"
                disabled={menyimpan === p.email}
                onClick={() => void simpan(p.email, { aktif: !p.aktif })}
                className={`text-sm font-semibold rounded-xl px-4 py-2 border disabled:opacity-60 ${
                  p.aktif
                    ? "border-red-200 text-red-700 bg-red-50"
                    : "border-emerald-200 text-emerald-700 bg-emerald-50"
                }`}
              >
                {p.aktif ? "Nonaktifkan" : "Aktifkan"}
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {JURNAL_ROLES.map((peran) => (
                <label
                  key={peran}
                  className="flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={p.peran.includes(peran)}
                    onChange={(e) =>
                      ubahPeranLokal(p.email, peran, e.target.checked)
                    }
                  />
                  {JURNAL_ROLE_LABEL_ID[peran]}
                </label>
              ))}
            </div>
            <button
              type="button"
              disabled={menyimpan === p.email}
              onClick={() => void simpan(p.email, { peran: p.peran })}
              className="mt-3 bg-mahad-green text-white text-sm font-semibold rounded-xl px-4 py-2 disabled:opacity-60"
            >
              Simpan Peran
            </button>
          </section>
        ))}
      </div>
    </KerangkaPanel>
  );
}

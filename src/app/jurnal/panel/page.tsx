"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  ambilSesiKlien,
  hapusSesiLokal,
  simpanSesiLokal
} from "@/lib/jurnal/sesi-klien";
import {
  JURNAL_STATUSES,
  JURNAL_STATUS_LABEL_ID,
  JURNAL_ROLE_LABEL_ID,
  type JurnalRole,
  type JurnalSubmissionView
} from "@/lib/jurnal/status";

// Panel redaksi jurnal "OJS versi kita" (Tahap 1, dikeraskan Tahap
// Keamanan). Panel mewajibkan login berperan staf pada KEDUA mode data:
// - Mode supabase: masuk lewat proxy /api/jurnal/auth/login (pola yang
//   sama dengan login admin situs), sesi diterapkan ke klien Supabase,
//   dan token Bearer dikirim ke route panel yang memeriksa peran jurnal
//   di server.
// - Mode lokal: masuk dengan akun staf uji (email tercantum di env
//   server JURNAL_LOCAL_STAFF_EMAILS); sesi lokal bertanda tangan
//   disimpan seperti sesi penulis, dan server menurunkan peran staf
//   dari email pada token. Akun penulis biasa ditolak panel.

interface Viewer {
  email: string;
  roles: string[];
}

export default function PanelRedaksiJurnalPage() {
  const [daftar, setDaftar] = useState<JurnalSubmissionView[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState<string | null>(null);
  const [menyimpan, setMenyimpan] = useState<string | null>(null);
  const [pesan, setPesan] = useState<string | null>(null);
  const [mode, setMode] = useState<"supabase" | "local" | null>(null);
  const [viewer, setViewer] = useState<Viewer | null>(null);
  const [perluLogin, setPerluLogin] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [masukLoading, setMasukLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const ambilToken = useCallback(async (): Promise<string | null> => {
    // Sesi lokal (mode uji) didahulukan; tokennya juga yang dipakai
    // halaman penulis. Sesudah itu sesi Supabase Auth untuk mode
    // supabase.
    const sesiLokal = await ambilSesiKlien();
    if (sesiLokal?.mode === "local" && sesiLokal.token) {
      return sesiLokal.token;
    }
    const {
      data: { session }
    } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  }, []);

  const muatDaftar = useCallback(async () => {
    try {
      const token = await ambilToken();
      const res = await fetch("/api/jurnal/submissions", {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json().catch(() => null);
      if (res.status === 401 || res.status === 403) {
        setPerluLogin(true);
        if (data?.mode === "local" || data?.mode === "supabase") {
          setMode(data.mode);
        }
        setDaftar([]);
        return;
      }
      if (!res.ok) {
        setGalat(data?.error || "Gagal memuat daftar naskah.");
      } else {
        setMode(data.mode === "supabase" ? "supabase" : "local");
        setViewer((data.viewer as Viewer | null) ?? null);
        setPerluLogin(false);
        setDaftar(data.submissions as JurnalSubmissionView[]);
        setGalat(null);
      }
    } catch {
      setGalat("Tidak dapat menghubungi server.");
    } finally {
      setMemuat(false);
    }
  }, [ambilToken]);

  useEffect(() => {
    muatDaftar();
  }, [muatDaftar]);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setMasukLoading(true);
    setLoginError(null);
    try {
      const res = await fetch("/api/jurnal/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const result = await res.json().catch(() => null);
      if (!res.ok || !result?.success) {
        setLoginError(
          result?.error || "Email atau kata sandi tidak cocok."
        );
        return;
      }
      if (result.localSession) {
        // Mode lokal: simpan sesi lokal staf uji, lalu muat antrean.
        simpanSesiLokal({
          token: result.localSession.token,
          email: result.localSession.email,
          nama: result.localSession.nama
        });
      } else if (result.session) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: result.session.access_token,
          refresh_token: result.session.refresh_token
        });
        if (sessionError) throw sessionError;
      } else {
        setLoginError("Jawaban masuk tidak memuat sesi.");
        return;
      }
      setPassword("");
      await muatDaftar();
    } catch (err) {
      setLoginError(
        err instanceof Error ? err.message : "Terjadi kesalahan saat masuk."
      );
    } finally {
      setMasukLoading(false);
    }
  }

  async function handleLogout() {
    hapusSesiLokal();
    await supabase.auth.signOut();
    setViewer(null);
    setDaftar([]);
    setPesan(null);
    await muatDaftar();
  }

  async function ubahStatus(kode: string, status: string) {
    setMenyimpan(kode);
    setPesan(null);
    try {
      const token = await ambilToken();
      const res = await fetch(
        `/api/jurnal/submissions/${encodeURIComponent(kode)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ status })
        }
      );
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setGalat(data?.error || "Gagal mengubah status.");
      } else {
        setPesan(
          `Status naskah ${kode} diubah menjadi "${JURNAL_STATUS_LABEL_ID[status as keyof typeof JURNAL_STATUS_LABEL_ID] || status}".`
        );
        await muatDaftar();
      }
    } catch {
      setGalat("Tidak dapat menghubungi server.");
    } finally {
      setMenyimpan(null);
    }
  }

  const labelPeran = (roles: string[]) =>
    roles
      .map(
        (r) =>
          JURNAL_ROLE_LABEL_ID[r as JurnalRole] || r
      )
      .join(", ");

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8">
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-800">
          Panel Redaksi Jurnal
        </h1>

        {mode === "local" && (
          <div className="mt-3 rounded-xl border-2 border-amber-500 bg-amber-100 px-4 py-3 text-amber-900 text-sm">
            <strong>Mode data lokal (uji).</strong> Basis data jurnal belum
            tersambung di lingkungan ini; panel tetap mewajibkan masuk
            dengan akun staf uji (email yang tercantum di daftar staf uji
            server). Naskah berasal dari lapisan data uji lokal. Begitu
            migrasi basis data jurnal dijalankan dan env server terpasang,
            panel ini mewajibkan login berperan jurnal.
          </div>
        )}
        {viewer && (
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 flex flex-wrap items-center justify-between gap-3">
            <p>
              Masuk sebagai <strong>{viewer.email}</strong>
              {viewer.roles.length > 0 && (
                <>
                  {" "}
                  — peran: <strong>{labelPeran(viewer.roles)}</strong>
                </>
              )}
            </p>
            <button
              onClick={handleLogout}
              className="text-xs font-bold bg-white border border-slate-300 hover:border-mahad-gold rounded-full px-4 py-1.5 transition"
            >
              Keluar
            </button>
          </div>
        )}

        {pesan && (
          <p className="mt-4 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 text-sm px-4 py-3">
            {pesan}
          </p>
        )}
        {galat && (
          <p className="mt-4 rounded-xl border border-red-300 bg-red-50 text-red-700 text-sm px-4 py-3">
            {galat}
          </p>
        )}

        {memuat ? (
          <p className="text-sm text-slate-500 mt-6">Memuat panel...</p>
        ) : perluLogin ? (
          <form
            onSubmit={handleLogin}
            className="mt-6 max-w-md rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-4"
          >
            <h2 className="font-serif font-bold text-lg text-slate-800">
              Masuk Panel Redaksi
            </h2>
            <p className="text-sm text-slate-600">
              Gunakan akun yang sudah diberi peran jurnal (Manajer Jurnal,
              Editor, atau Editor Bagian) oleh pengelola.
            </p>
            {loginError && (
              <p className="rounded-xl border border-red-300 bg-red-50 text-red-700 text-sm px-4 py-3">
                {loginError}
              </p>
            )}
            <div>
              <label
                htmlFor="email-panel"
                className="block text-sm font-semibold text-slate-700 mb-1"
              >
                Email
              </label>
              <input
                id="email-panel"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-mahad-gold"
                placeholder="nama@contoh.ac.id"
              />
            </div>
            <div>
              <label
                htmlFor="password-panel"
                className="block text-sm font-semibold text-slate-700 mb-1"
              >
                Kata Sandi
              </label>
              <input
                id="password-panel"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-mahad-gold"
              />
            </div>
            <button
              type="submit"
              disabled={masukLoading}
              className="bg-mahad-gold hover:bg-yellow-400 disabled:opacity-60 text-mahad-green-dark font-bold text-sm px-6 py-2.5 rounded-full shadow transition"
            >
              {masukLoading ? "Memeriksa..." : "Masuk"}
            </button>
          </form>
        ) : daftar.length === 0 ? (
          <p className="text-sm text-slate-500 mt-6">
            Belum ada naskah. Kirim satu lewat halaman{" "}
            <a
              href="/jurnal/kirim"
              className="text-mahad-green font-semibold underline"
            >
              Kirim Naskah
            </a>{" "}
            untuk mulai.
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
                      {n.penulis} ({n.email}) — {n.afiliasi}
                      {n.bagianLabel ? ` — Bagian: ${n.bagianLabel}` : ""}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Dikirim {new Date(n.dibuatPada).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <span className="text-xs font-bold bg-mahad-gold-light text-mahad-green-dark px-3 py-1 rounded-full shrink-0">
                    {n.statusLabel}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-3 line-clamp-3">
                  {n.abstrak}
                </p>
                {n.berkas && n.berkas.length > 0 && (
                  <p className="text-xs text-slate-500 mt-2">
                    Berkas:{" "}
                    {n.berkas
                      .map(
                        (b) =>
                          `${b.kategori === "utama" ? "utama" : "pendukung"}: ${b.namaAsli} (${b.bucket})`
                      )
                      .join("; ")}
                    {n.pernyataanAi
                      ? ` — Pernyataan AI tercatat.`
                      : ""}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <label
                    htmlFor={`status-${n.kode}`}
                    className="text-xs font-semibold text-slate-500"
                  >
                    Pindah tahap:
                  </label>
                  <select
                    id={`status-${n.kode}`}
                    value={n.status}
                    disabled={menyimpan === n.kode}
                    onChange={(e) => ubahStatus(n.kode, e.target.value)}
                    className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:border-mahad-gold"
                  >
                    {JURNAL_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {JURNAL_STATUS_LABEL_ID[s]}
                      </option>
                    ))}
                  </select>
                  {menyimpan === n.kode && (
                    <span className="text-xs text-slate-400">Menyimpan...</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

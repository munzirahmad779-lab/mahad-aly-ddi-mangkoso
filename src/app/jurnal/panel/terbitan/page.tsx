"use client";

import {
  useCallback,
  useEffect,
  useState,
  type FormEvent
} from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { ambilSesiKlien, simpanSesiLokal } from "@/lib/jurnal/sesi-klien";
import type { JurnalTerbitanView } from "@/lib/jurnal/alur";
import {
  JURNAL_STATUS_LABEL_ID,
  type JurnalStatus
} from "@/lib/jurnal/status";

interface ArtikelSiap {
  kode: string;
  judul: string;
  penulis: string;
}

// Pengelolaan terbitan (Tahap 4): staf membuat dan menyunting
// terbitan, menetapkan artikel berstatus production dengan urutan
// daftar isi, dan menerbitkan terbitan. Penerbitan mengubah artikel
// di dalamnya menjadi published lewat tabel transisi server dan
// tercatat di linimasa masing-masing naskah. Halaman ini hanya
// menampilkan keadaan dan mengirim perintah; aturan di server.

interface KeadaanTerbitan {
  terbitan: JurnalTerbitanView[];
  siapTetapkan: ArtikelSiap[];
}

const kelasInput =
  "w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-mahad-gold";

export default function PanelTerbitanPage() {
  const [mode, setMode] = useState<"supabase" | "local" | null>(null);
  const [memuat, setMemuat] = useState(true);
  const [perluLogin, setPerluLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [masukLoading, setMasukLoading] = useState(false);
  const [keadaan, setKeadaan] = useState<KeadaanTerbitan | null>(null);
  const [pesan, setPesan] = useState<string | null>(null);
  const [galat, setGalat] = useState<string | null>(null);
  const [sibuk, setSibuk] = useState(false);
  const [baru, setBaru] = useState({
    volume: "",
    nomor: "",
    tahun: String(new Date().getFullYear()),
    judul: "",
    uraian: "",
    tanggalTerbit: ""
  });
  const [tetapkan, setTetapkan] = useState<Record<string, string>>({});
  const [urutan, setUrutan] = useState<Record<string, string>>({});

  const ambilToken = useCallback(async (): Promise<string | null> => {
    // Pola yang sama dengan panel redaksi: sesi lokal didahulukan,
    // sesudah itu sesi Supabase Auth.
    const sesiLokal = await ambilSesiKlien();
    if (sesiLokal?.mode === "local" && sesiLokal.token) {
      return sesiLokal.token;
    }
    const {
      data: { session }
    } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  }, []);

  const muat = useCallback(async () => {
    const token = await ambilToken();
    try {
      const res = await fetch("/api/jurnal/terbitan", {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json().catch(() => null);
      if (res.status === 401 || res.status === 403) {
        setPerluLogin(true);
        if (data?.mode === "local" || data?.mode === "supabase") {
          setMode(data.mode);
        }
      } else if (res.ok && data) {
        setMode(data.mode === "supabase" ? "supabase" : "local");
        setKeadaan({
          terbitan: data.terbitan ?? [],
          siapTetapkan: data.siapTetapkan ?? []
        });
        setPerluLogin(false);
      } else {
        setGalat(data?.error || "Gagal memuat daftar terbitan.");
      }
    } catch {
      setGalat("Gagal menghubungi server.");
    }
    setMemuat(false);
  }, [ambilToken]);

  useEffect(() => {
    void muat();
  }, [muat]);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoginError(null);
    setMasukLoading(true);
    try {
      if (mode === "local") {
        const res = await fetch("/api/jurnal/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          setLoginError(data?.error || "Email atau kata sandi salah.");
          return;
        }
        simpanSesiLokal({ token: data.token, email });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) {
          setLoginError("Email atau kata sandi salah, atau akun belum terdaftar.");
          return;
        }
      }
      setMemuat(true);
      await muat();
    } catch {
      setLoginError("Gagal menghubungi server.");
    } finally {
      setMasukLoading(false);
    }
  }

  async function kirim(
    jalur: string,
    method: "POST" | "PATCH",
    body: unknown
  ): Promise<boolean> {
    const token = await ambilToken();
    if (!token) {
      setGalat("Sesi staf tidak ditemukan. Masuk ulang.");
      return false;
    }
    const res = await fetch(jalur, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setGalat(data?.error || "Permintaan gagal diproses.");
      return false;
    }
    return true;
  }

  async function buatTerbitan(e: FormEvent) {
    e.preventDefault();
    setSibuk(true);
    setGalat(null);
    setPesan(null);
    const token = await ambilToken();
    if (!token) {
      setGalat("Sesi staf tidak ditemukan. Masuk ulang.");
      setSibuk(false);
      return;
    }
    const res = await fetch("/api/jurnal/terbitan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        volume: Number(baru.volume),
        number: Number(baru.nomor),
        year: Number(baru.tahun),
        judul: baru.judul || undefined,
        uraian: baru.uraian || undefined
      })
    });
    const data = await res.json().catch(() => null);
    let ok = res.ok;
    if (!ok) {
      setGalat(data?.error || "Gagal membuat terbitan.");
    } else if (baru.tanggalTerbit && data?.terbitan?.slug) {
      // Tanggal terbit rencana ditetapkan lewat PATCH sesudah
      // terbitan lahir (route buat tidak menerima tanggal).
      ok = await kirim(
        `/api/jurnal/terbitan/${encodeURIComponent(data.terbitan.slug)}`,
        "PATCH",
        { tanggalTerbit: baru.tanggalTerbit }
      );
    }
    if (ok) {
      setPesan("Terbitan baru dibuat sebagai draf.");
      setBaru({
        volume: "",
        nomor: "",
        tahun: String(new Date().getFullYear()),
        judul: "",
        uraian: "",
        tanggalTerbit: ""
      });
      await muat();
    }
    setSibuk(false);
  }

  async function tetapkanArtikel(slug: string) {
    const kode = tetapkan[slug];
    if (!kode) {
      setGalat("Pilih artikel yang akan ditetapkan dulu.");
      return;
    }
    setSibuk(true);
    setGalat(null);
    setPesan(null);
    const ok = await kirim(
      `/api/jurnal/terbitan/${encodeURIComponent(slug)}/tetapkan`,
      "POST",
      { kode, urutan: urutan[slug] ? Number(urutan[slug]) : undefined }
    );
    if (ok) {
      setPesan(`Artikel ${kode} ditetapkan ke terbitan.`);
      await muat();
    }
    setSibuk(false);
  }

  async function lepaskanArtikel(slug: string, kode: string) {
    setSibuk(true);
    setGalat(null);
    setPesan(null);
    const ok = await kirim(
      `/api/jurnal/terbitan/${encodeURIComponent(slug)}/lepaskan`,
      "POST",
      { kode }
    );
    if (ok) {
      setPesan(`Artikel ${kode} dilepas dari terbitan.`);
      await muat();
    }
    setSibuk(false);
  }

  async function terbitkanTerbitan(slug: string, label: string) {
    if (
      !window.confirm(
        `Terbitkan ${label}? Semua artikel berstatus production di dalamnya menjadi published dan tampil di halaman publik.`
      )
    ) {
      return;
    }
    setSibuk(true);
    setGalat(null);
    setPesan(null);
    const ok = await kirim(
      `/api/jurnal/terbitan/${encodeURIComponent(slug)}/terbitkan`,
      "POST",
      {}
    );
    if (ok) {
      setPesan(`${label} diterbitkan.`);
      await muat();
    }
    setSibuk(false);
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-800">
            Pengelolaan Terbitan
          </h1>
          <Link
            href="/jurnal/panel"
            className="text-xs font-bold bg-white border border-slate-300 hover:border-mahad-gold rounded-full px-4 py-1.5 transition"
          >
            Kembali ke Panel Redaksi
          </Link>
        </div>

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
          <p className="text-sm text-slate-500 mt-6">Memuat terbitan...</p>
        ) : perluLogin ? (
          <form
            onSubmit={handleLogin}
            className="mt-6 max-w-md rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-4"
          >
            <h2 className="font-serif font-bold text-lg text-slate-800">
              Masuk Panel Redaksi
            </h2>
            {loginError && (
              <p className="rounded-xl border border-red-300 bg-red-50 text-red-700 text-sm px-4 py-3">
                {loginError}
              </p>
            )}
            <div>
              <label
                htmlFor="email-terbitan"
                className="block text-sm font-semibold text-slate-700 mb-1"
              >
                Email
              </label>
              <input
                id="email-terbitan"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={kelasInput}
                placeholder="nama@contoh.ac.id"
              />
            </div>
            <div>
              <label
                htmlFor="password-terbitan"
                className="block text-sm font-semibold text-slate-700 mb-1"
              >
                Kata Sandi
              </label>
              <input
                id="password-terbitan"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={kelasInput}
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
        ) : (
          <>
            <form
              onSubmit={buatTerbitan}
              className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-4"
            >
              <h2 className="font-serif font-bold text-lg text-slate-800">
                Buat Terbitan Baru
              </h2>
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label
                    htmlFor="baru-volume"
                    className="block text-sm font-semibold text-slate-700 mb-1"
                  >
                    Volume
                  </label>
                  <input
                    id="baru-volume"
                    type="number"
                    min={1}
                    required
                    value={baru.volume}
                    onChange={(e) =>
                      setBaru({ ...baru, volume: e.target.value })
                    }
                    className={kelasInput}
                  />
                </div>
                <div>
                  <label
                    htmlFor="baru-nomor"
                    className="block text-sm font-semibold text-slate-700 mb-1"
                  >
                    Nomor
                  </label>
                  <input
                    id="baru-nomor"
                    type="number"
                    min={1}
                    required
                    value={baru.nomor}
                    onChange={(e) =>
                      setBaru({ ...baru, nomor: e.target.value })
                    }
                    className={kelasInput}
                  />
                </div>
                <div>
                  <label
                    htmlFor="baru-tahun"
                    className="block text-sm font-semibold text-slate-700 mb-1"
                  >
                    Tahun
                  </label>
                  <input
                    id="baru-tahun"
                    type="number"
                    min={2000}
                    required
                    value={baru.tahun}
                    onChange={(e) =>
                      setBaru({ ...baru, tahun: e.target.value })
                    }
                    className={kelasInput}
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="baru-judul"
                  className="block text-sm font-semibold text-slate-700 mb-1"
                >
                  Judul terbitan (opsional)
                </label>
                <input
                  id="baru-judul"
                  type="text"
                  value={baru.judul}
                  onChange={(e) => setBaru({ ...baru, judul: e.target.value })}
                  className={kelasInput}
                  placeholder="mis. Edisi Perdana"
                />
              </div>
              <div>
                <label
                  htmlFor="baru-uraian"
                  className="block text-sm font-semibold text-slate-700 mb-1"
                >
                  Uraian (opsional)
                </label>
                <textarea
                  id="baru-uraian"
                  value={baru.uraian}
                  onChange={(e) =>
                    setBaru({ ...baru, uraian: e.target.value })
                  }
                  className={kelasInput}
                  rows={2}
                />
              </div>
              <div className="max-w-xs">
                <label
                  htmlFor="baru-tanggal"
                  className="block text-sm font-semibold text-slate-700 mb-1"
                >
                  Tanggal terbit rencana (opsional)
                </label>
                <input
                  id="baru-tanggal"
                  type="date"
                  value={baru.tanggalTerbit}
                  onChange={(e) =>
                    setBaru({ ...baru, tanggalTerbit: e.target.value })
                  }
                  className={kelasInput}
                />
              </div>
              <button
                type="submit"
                disabled={sibuk}
                className="bg-mahad-gold hover:bg-yellow-400 disabled:opacity-60 text-mahad-green-dark font-bold text-sm px-6 py-2.5 rounded-full shadow transition"
              >
                Buat Terbitan
              </button>
            </form>

            <div className="mt-8 space-y-5">
              {keadaan?.terbitan.length === 0 && (
                <p className="text-sm text-slate-500">
                  Belum ada terbitan. Buat terbitan pertama lewat formulir
                  di atas.
                </p>
              )}
              {keadaan?.terbitan.map((t) => (
                <article
                  key={t.slug}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="font-serif font-bold text-lg text-slate-800">
                      {t.label}
                      {t.isCurrent && (
                        <span className="ml-2 align-middle text-[11px] font-bold bg-emerald-100 text-mahad-green-dark border border-emerald-300 px-2.5 py-0.5 rounded-full">
                          Berjalan
                        </span>
                      )}
                    </h2>
                    <span className="text-xs font-bold bg-mahad-gold-light text-mahad-green-dark px-3 py-1 rounded-full">
                      {t.statusLabel}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">
                    Slug: {t.slug}
                    {t.tanggalTerbit
                      ? ` — tanggal terbit: ${t.tanggalTerbit.slice(0, 10)}`
                      : ""}
                  </p>
                  {t.uraian && (
                    <p className="text-sm text-slate-600">{t.uraian}</p>
                  )}
                  {t.artikel.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      Belum ada artikel yang ditetapkan.
                    </p>
                  ) : (
                    <ol className="space-y-2">
                      {t.artikel.map((a) => (
                        <li
                          key={a.kode}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm"
                        >
                          <span>
                            <span className="font-mono text-xs text-slate-400">
                              {a.urutan}. {a.kode}
                            </span>{" "}
                            — {a.judul}{" "}
                            <span className="text-slate-400">
                              (
                              {JURNAL_STATUS_LABEL_ID[
                                a.statusNaskah as JurnalStatus
                              ] ?? a.statusNaskah}
                              )
                            </span>
                          </span>
                          {t.status !== "published" && (
                            <button
                              onClick={() =>
                                void lepaskanArtikel(t.slug, a.kode)
                              }
                              disabled={sibuk}
                              className="text-xs font-bold bg-white border border-slate-300 hover:border-red-300 hover:text-red-600 rounded-full px-3 py-1 transition"
                            >
                              Lepaskan
                            </button>
                          )}
                        </li>
                      ))}
                    </ol>
                  )}
                  {t.status !== "published" && (
                    <div className="flex flex-wrap items-end gap-3">
                      <div className="min-w-64 flex-1">
                        <label
                          htmlFor={`tetapkan-${t.slug}`}
                          className="block text-sm font-semibold text-slate-700 mb-1"
                        >
                          Artikel berstatus production
                        </label>
                        <select
                          id={`tetapkan-${t.slug}`}
                          value={tetapkan[t.slug] ?? ""}
                          onChange={(e) =>
                            setTetapkan({
                              ...tetapkan,
                              [t.slug]: e.target.value
                            })
                          }
                          className={kelasInput}
                        >
                          <option value="">Pilih artikel...</option>
                          {keadaan.siapTetapkan
                            .filter(
                              (a) =>
                                !t.artikel.some((x) => x.kode === a.kode)
                            )
                            .map((a) => (
                              <option key={a.kode} value={a.kode}>
                                {a.kode} — {a.judul}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div className="w-28">
                        <label
                          htmlFor={`urutan-${t.slug}`}
                          className="block text-sm font-semibold text-slate-700 mb-1"
                        >
                          Urutan
                        </label>
                        <input
                          id={`urutan-${t.slug}`}
                          type="number"
                          min={1}
                          value={urutan[t.slug] ?? ""}
                          onChange={(e) =>
                            setUrutan({ ...urutan, [t.slug]: e.target.value })
                          }
                          className={kelasInput}
                        />
                      </div>
                      <button
                        onClick={() => void tetapkanArtikel(t.slug)}
                        disabled={sibuk}
                        className="bg-white border border-slate-300 hover:border-mahad-gold font-bold text-sm px-5 py-2.5 rounded-full transition"
                      >
                        Tetapkan Artikel
                      </button>
                      <button
                        onClick={() =>
                          void terbitkanTerbitan(t.slug, t.label)
                        }
                        disabled={sibuk || t.artikel.length === 0}
                        className="bg-mahad-gold hover:bg-yellow-400 disabled:opacity-60 text-mahad-green-dark font-bold text-sm px-5 py-2.5 rounded-full shadow transition"
                      >
                        Terbitkan Terbitan
                      </button>
                    </div>
                  )}
                  {t.status === "published" && (
                    <p className="text-sm text-slate-600">
                      Terbitan ini sudah diterbitkan dan tampil di halaman
                      publik.{" "}
                      <Link
                        href={`/jurnal/terbitan/${t.slug}`}
                        className="text-mahad-green font-semibold underline"
                      >
                        Lihat halaman publik
                      </Link>
                    </p>
                  )}
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

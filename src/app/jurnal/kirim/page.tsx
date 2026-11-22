"use client";

import { useEffect, useMemo, useState } from "react";
import { tJurnal } from "@/lib/jurnal/i18n";
import { useJurnalLocale } from "@/lib/jurnal/i18n-klien";
import Link from "next/link";
import {
  ambilSesiKlien,
  type SesiKlienJurnal
} from "@/lib/jurnal/sesi-klien";
import TurnstileJurnal from "@/components/jurnal/turnstile";
import {
  BERKAS_PENDUKUNG_MAX_JUMLAH,
  JURNAL_BAGIAN,
  JURNAL_CHECKLIST,
  daftarPeriksaKosong,
  labelBagian,
  teksPernyataanAi,
  validasiBerkasMeta,
  type JurnalAiMode,
  type JurnalBerkasKategori,
  type JurnalBerkasMeta,
  type JurnalDaftarPeriksa,
  type JurnalPenulisInput
} from "@/lib/jurnal/wizard";

// Wizard kirim naskah jurnal (Tahap 2), menggantikan formulir satu
// halaman versi uji. Enam langkah mengikuti rancangan OJS versi kita:
// 1) mulai: bagian, bahasa, daftar periksa 6 butir;
// 2) metadata: judul, abstrak dua bahasa, kata kunci;
// 3) penulis: penulis utama (akun yang masuk) dan penulis pendamping;
// 4) unggah berkas: naskah utama wajib, pendukung tidak wajib. Isi
//    berkas naik langsung ke R2 lewat URL bertanda tangan, atau ke
//    cadangan uji lokal bila R2 belum terkonfigurasi; server hanya
//    menerima metadata berkas;
// 5) pernyataan pemakaian AI (wajib);
// 6) tinjau dan kirim. Hasil: kode lacak JRN-YYYY-XXXX, status submitted.

const LANGKAH = [
  "Mulai dan Bagian",
  "Metadata",
  "Penulis",
  "Unggah Berkas",
  "Pernyataan AI",
  "Tinjau dan Kirim"
];

const kelasInput =
  "w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:border-mahad-gold focus:ring-1 focus:ring-mahad-gold bg-white";
const kelasLabel = "block text-sm font-semibold text-slate-700 mb-1";

interface BerkasTerpilih {
  kategori: JurnalBerkasKategori;
  file: File;
  meta: JurnalBerkasMeta | null; // terisi sesudah unggahan dicatat server
  sibuk: boolean;
  galat: string | null;
}

export default function KirimNaskahJurnalPage() {
  const teks = tJurnal(useJurnalLocale());
  const [sesi, setSesi] = useState<SesiKlienJurnal | null>(null);
  const [memuatSesi, setMemuatSesi] = useState(true);
  const [langkah, setLangkah] = useState(0);

  const [bagianSlug, setBagianSlug] = useState(JURNAL_BAGIAN[0].slug);
  const [bahasa, setBahasa] = useState<"id" | "en" | "ar">("id");
  const [periksa, setPeriksa] = useState<JurnalDaftarPeriksa>(
    daftarPeriksaKosong()
  );

  const [judul, setJudul] = useState("");
  const [abstrakId, setAbstrakId] = useState("");
  const [abstrakEn, setAbstrakEn] = useState("");
  const [kataKunciTeks, setKataKunciTeks] = useState("");

  const [utama, setUtama] = useState<JurnalPenulisInput>({
    nama: "",
    email: "",
    afiliasi: "",
    orcid: ""
  });
  const [pendamping, setPendamping] = useState<JurnalPenulisInput[]>([]);

  const [berkas, setBerkas] = useState<BerkasTerpilih[]>([]);
  const [batchId] = useState(
    () =>
      `uji-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
  );

  const [aiMode, setAiMode] = useState<JurnalAiMode>("tidak_memakai");
  const [aiTeks, setAiTeks] = useState("");

  const [mengirim, setMengirim] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [tokenTurnstile, setTokenTurnstile] = useState<string | null>(null);
  const [hasil, setHasil] = useState<{ kode: string; statusLabel: string } | null>(
    null
  );

  useEffect(() => {
    ambilSesiKlien()
      .then((s) => {
        setSesi(s);
        if (s) {
          setUtama((u) => ({
            ...u,
            nama: u.nama || s.nama || "",
            email: s.email
          }));
        }
      })
      .finally(() => setMemuatSesi(false));
  }, []);

  const periksaLengkap = useMemo(
    () => JURNAL_CHECKLIST.every((i) => periksa[i.kunci]),
    [periksa]
  );
  const kataKunci = useMemo(
    () =>
      kataKunciTeks
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
    [kataKunciTeks]
  );
  const berkasUtamaSiap = berkas.some(
    (b) => b.kategori === "utama" && b.meta
  );

  function sahLangkah(n: number): boolean {
    switch (n) {
      case 0:
        return periksaLengkap;
      case 1:
        return (
          judul.trim().length > 0 &&
          abstrakId.trim().length >= 50 &&
          abstrakEn.trim().length >= 30 &&
          kataKunci.length > 0
        );
      case 2:
        return (
          utama.nama.trim().length > 0 &&
          utama.afiliasi.trim().length > 0 &&
          pendamping.every(
            (p) =>
              p.nama.trim() &&
              p.afiliasi.trim() &&
              /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email.trim())
          )
        );
      case 3:
        return berkasUtamaSiap && berkas.every((b) => !b.sibuk && !b.galat);
      case 4:
        return aiMode === "tidak_memakai" || aiTeks.trim().length > 0;
      default:
        return true;
    }
  }

  async function unggahSatu(item: BerkasTerpilih) {
    const { file, kategori } = item;
    const pesan = validasiBerkasMeta({
      kategori,
      namaAsli: file.name,
      mime: file.type,
      ukuran: file.size
    });
    if (pesan) {
      setBerkas((d) =>
        d.map((b) => (b === item ? { ...b, galat: pesan, sibuk: false } : b))
      );
      return;
    }
    try {
      const resSign = await fetch("/api/jurnal/uploads/sign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Route unggah mewajibkan sesi penulis (Tahap Keamanan).
          ...(sesi?.token
            ? { Authorization: `Bearer ${sesi.token}` }
            : {})
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
        throw new Error(sign?.error || "Gagal menyiapkan unggahan.");
      }
      if (sign.mode === "r2") {
        const put = await fetch(sign.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type || "application/octet-stream" },
          body: file
        });
        if (!put.ok) throw new Error("Unggahan ke penyimpanan berkas gagal.");
        const meta: JurnalBerkasMeta = {
          kategori,
          namaAsli: file.name,
          mime: file.type,
          ukuran: file.size,
          bucket: sign.bucket,
          kunci: sign.kunci,
          mode: "r2"
        };
        setBerkas((d) =>
          d.map((b) => (b === item ? { ...b, meta, sibuk: false } : b))
        );
      } else {
        const form = new FormData();
        form.append("berkas", file);
        form.append("kategori", kategori);
        form.append("batchId", batchId);
        const resLocal = await fetch("/api/jurnal/uploads/local", {
          method: "POST",
          headers: sesi?.token
            ? { Authorization: `Bearer ${sesi.token}` }
            : {},
          body: form
        });
        const dataLocal = await resLocal.json().catch(() => null);
        if (!resLocal.ok) {
          throw new Error(dataLocal?.error || "Unggahan uji lokal gagal.");
        }
        setBerkas((d) =>
          d.map((b) =>
            b === item
              ? { ...b, meta: dataLocal.berkas as JurnalBerkasMeta, sibuk: false }
              : b
          )
        );
      }
    } catch (err) {
      setBerkas((d) =>
        d.map((b) =>
          b === item
            ? {
                ...b,
                sibuk: false,
                galat: err instanceof Error ? err.message : "Unggahan gagal."
              }
            : b
        )
      );
    }
  }

  function pilihBerkas(kategori: JurnalBerkasKategori, files: FileList | null) {
    if (!files || files.length === 0) return;
    const baru: BerkasTerpilih[] = Array.from(files).map((file) => ({
      kategori,
      file,
      meta: null,
      sibuk: true,
      galat: null
    }));
    setBerkas((d) => {
      const tanpaUtamaLama =
        kategori === "utama" ? d.filter((b) => b.kategori !== "utama") : d;
      const pendukungLama = tanpaUtamaLama.filter(
        (b) => b.kategori === "pendukung"
      ).length;
      const diterima =
        kategori === "pendukung"
          ? baru.slice(0, Math.max(0, BERKAS_PENDUKUNG_MAX_JUMLAH - pendukungLama))
          : baru.slice(0, 1);
      diterima.forEach((item) => void unggahSatu(item));
      return [...tanpaUtamaLama, ...diterima];
    });
  }

  async function kirim() {
    if (!sesi) return;
    setMengirim(true);
    setGalat(null);
    try {
      const res = await fetch("/api/jurnal/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sesi.token}`
        },
        body: JSON.stringify({
          bagianSlug,
          bahasa,
          daftarPeriksa: periksa,
          judul: judul.trim(),
          abstrakId: abstrakId.trim(),
          abstrakEn: abstrakEn.trim(),
          kataKunci,
          penulisUtama: {
            nama: utama.nama.trim(),
            email: sesi.email,
            afiliasi: utama.afiliasi.trim(),
            orcid: utama.orcid?.trim() || undefined
          },
          penulisPendamping: pendamping.map((p) => ({
            nama: p.nama.trim(),
            email: p.email.trim(),
            afiliasi: p.afiliasi.trim(),
            orcid: p.orcid?.trim() || undefined
          })),
          berkas: berkas
            .filter((b) => b.meta)
            .map((b) => b.meta as JurnalBerkasMeta),
          pernyataanAi: { mode: aiMode, teks: aiTeks.trim() },
          turnstileToken: tokenTurnstile ?? undefined
        })
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setGalat(data?.error || "Pengiriman gagal. Coba lagi.");
      } else {
        setHasil({ kode: data.kode, statusLabel: data.statusLabel });
      }
    } catch {
      setGalat("Tidak dapat menghubungi server.");
    } finally {
      setMengirim(false);
    }
  }

  if (memuatSesi) {
    return (
      <div className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8">
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <p className="text-sm text-slate-500">Memeriksa sesi penulis...</p>
        </section>
      </div>
    );
  }

  if (!sesi) {
    return (
      <div className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8">
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-800">
            {teks.kirimJudul}
          </h1>
          <p className="text-sm text-slate-600 mt-3">
            Pengiriman naskah memerlukan akun penulis, sama seperti sistem
            jurnal pada umumnya. Silakan masuk dengan akun penulis Anda,
            atau daftar terlebih dahulu bila belum memiliki akun.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/jurnal/masuk"
              className="bg-mahad-gold hover:bg-yellow-400 text-mahad-green-dark font-bold text-sm px-6 py-3 rounded-full shadow transition"
            >
              Masuk Penulis
            </Link>
            <Link
              href="/jurnal/daftar"
              className="bg-white border border-slate-300 hover:border-mahad-gold font-bold text-sm px-6 py-3 rounded-full transition"
            >
              Daftar Akun Penulis
            </Link>
          </div>
          <p className="text-sm text-slate-500 mt-4">
            Bila Anda hanya ingin memeriksa naskah yang sudah terkirim
            dengan kode lacak, gunakan{" "}
            <Link href="/jurnal/lacak" className="text-mahad-green font-semibold underline">
              halaman lacak naskah
            </Link>
            .
          </p>
        </section>
      </div>
    );
  }

  if (hasil) {
    return (
      <div className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8">
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <div className="rounded-xl border-2 border-emerald-500 bg-emerald-50 px-5 py-4">
            <p className="font-bold text-emerald-900">
              Naskah berhasil dikirim dan diterima redaksi.
            </p>
            <p className="text-sm text-emerald-800 mt-2">
              Kode lacak Anda:{" "}
              <span className="font-mono font-bold text-base">{hasil.kode}</span>
            </p>
            <p className="text-sm text-emerald-800">
              Status awal: <strong>{hasil.statusLabel}</strong>
            </p>
            <p className="text-sm mt-3">
              Pantau perkembangan naskah di{" "}
              <Link href="/jurnal/naskah-saya" className="text-mahad-green font-semibold underline">
                Naskah Saya
              </Link>{" "}
              atau dengan kode lacak di{" "}
              <Link href="/jurnal/lacak" className="text-mahad-green font-semibold underline">
                halaman lacak naskah
              </Link>
              .
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8">
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-800">
          {teks.kirimJudul}
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          Mengirim sebagai <strong>{sesi.email}</strong>
          {sesi.mode === "local" && (
            <span className="text-amber-700">
              {" "}
              (akun uji lokal, mode uji)
            </span>
          )}
          . Ikuti enam langkah berikut; naskah baru terkirim pada langkah
          terakhir.
        </p>

        <ol className="mt-5 flex flex-wrap gap-2" aria-label="Langkah wizard">
          {LANGKAH.map((label, i) => (
            <li
              key={label}
              aria-current={i === langkah ? "step" : undefined}
              className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                i === langkah
                  ? "bg-mahad-gold text-mahad-green-dark"
                  : i < langkah
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-100 text-slate-500"
              }`}
            >
              {i + 1}. {label}
            </li>
          ))}
        </ol>

        <div className="mt-6">
          {langkah === 0 && (
            <div className="space-y-5">
              <div>
                <span className={kelasLabel}>Bagian Jurnal</span>
                <div className="space-y-2">
                  {JURNAL_BAGIAN.map((b) => (
                    <label
                      key={b.slug}
                      htmlFor={`bagian-${b.slug}`}
                      className="flex items-start gap-3 rounded-xl border border-slate-200 px-4 py-3 cursor-pointer hover:border-mahad-gold"
                    >
                      <input
                        id={`bagian-${b.slug}`}
                        type="radio"
                        name="bagian"
                        checked={bagianSlug === b.slug}
                        onChange={() => setBagianSlug(b.slug)}
                        className="mt-1 h-4 w-4 accent-emerald-700"
                      />
                      <span>
                        <span className="block text-sm font-bold text-slate-800">
                          {b.judulId}
                        </span>
                        <span className="block text-xs text-slate-500">
                          {b.judulEn}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="bahasa" className={kelasLabel}>
                  Bahasa Naskah
                </label>
                <select
                  id="bahasa"
                  value={bahasa}
                  onChange={(e) =>
                    setBahasa(e.target.value as "id" | "en" | "ar")
                  }
                  className={kelasInput}
                >
                  <option value="id">Bahasa Indonesia</option>
                  <option value="en">English</option>
                  <option value="ar">العربية (Arab)</option>
                </select>
              </div>
              <fieldset>
                <legend className={kelasLabel}>
                  Daftar Periksa Pengiriman (semua wajib dicentang)
                </legend>
                <div className="space-y-2">
                  {JURNAL_CHECKLIST.map((item) => (
                    <label
                      key={item.kunci}
                      htmlFor={`periksa-${item.kunci}`}
                      className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 cursor-pointer"
                    >
                      <input
                        id={`periksa-${item.kunci}`}
                        type="checkbox"
                        checked={periksa[item.kunci]}
                        onChange={(e) =>
                          setPeriksa((p) => ({
                            ...p,
                            [item.kunci]: e.target.checked
                          }))
                        }
                        className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-700"
                      />
                      <span className="text-sm text-slate-700">{item.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          )}

          {langkah === 1 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="judul" className={kelasLabel}>
                  Judul Naskah
                </label>
                <input
                  id="judul"
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  className={kelasInput}
                  placeholder="Judul artikel yang diusulkan"
                />
              </div>
              <div>
                <label htmlFor="abstrak-id" className={kelasLabel}>
                  Abstrak (Bahasa Indonesia, minimal 50 karakter)
                </label>
                <textarea
                  id="abstrak-id"
                  rows={5}
                  value={abstrakId}
                  onChange={(e) => setAbstrakId(e.target.value)}
                  className={kelasInput}
                />
              </div>
              <div>
                <label htmlFor="abstrak-en" className={kelasLabel}>
                  Abstract (English, minimal 30 karakter)
                </label>
                <textarea
                  id="abstrak-en"
                  rows={5}
                  value={abstrakEn}
                  onChange={(e) => setAbstrakEn(e.target.value)}
                  className={kelasInput}
                />
              </div>
              <div>
                <label htmlFor="kata-kunci" className={kelasLabel}>
                  Kata Kunci (pisahkan dengan koma)
                </label>
                <input
                  id="kata-kunci"
                  value={kataKunciTeks}
                  onChange={(e) => setKataKunciTeks(e.target.value)}
                  className={kelasInput}
                  placeholder="ushul fiqh, maslahah, muamalah"
                />
              </div>
            </div>
          )}

          {langkah === 2 && (
            <div className="space-y-5">
              <div className="rounded-xl border border-slate-200 p-4 space-y-3">
                <h2 className="text-sm font-bold text-slate-800">
                  Penulis Utama (akun pengirim)
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="utama-nama" className={kelasLabel}>
                      Nama Lengkap
                    </label>
                    <input
                      id="utama-nama"
                      value={utama.nama}
                      onChange={(e) =>
                        setUtama((u) => ({ ...u, nama: e.target.value }))
                      }
                      className={kelasInput}
                    />
                  </div>
                  <div>
                    <label htmlFor="utama-email" className={kelasLabel}>
                      Email (email akun)
                    </label>
                    <input
                      id="utama-email"
                      value={sesi.email}
                      disabled
                      className={`${kelasInput} bg-slate-100 text-slate-500`}
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="utama-afiliasi" className={kelasLabel}>
                      Afiliasi
                    </label>
                    <input
                      id="utama-afiliasi"
                      value={utama.afiliasi}
                      onChange={(e) =>
                        setUtama((u) => ({ ...u, afiliasi: e.target.value }))
                      }
                      className={kelasInput}
                    />
                  </div>
                  <div>
                    <label htmlFor="utama-orcid" className={kelasLabel}>
                      ORCID iD (tidak wajib)
                    </label>
                    <input
                      id="utama-orcid"
                      value={utama.orcid ?? ""}
                      onChange={(e) =>
                        setUtama((u) => ({ ...u, orcid: e.target.value }))
                      }
                      className={kelasInput}
                      placeholder="0000-0000-0000-0000"
                    />
                  </div>
                </div>
              </div>

              {pendamping.map((p, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-800">
                      Penulis Pendamping {idx + 1}
                    </h2>
                    <button
                      type="button"
                      onClick={() =>
                        setPendamping((d) => d.filter((_, i) => i !== idx))
                      }
                      className="text-xs font-bold text-red-600 underline"
                    >
                      Hapus
                    </button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor={`pendamping-${idx}-nama`} className={kelasLabel}>
                        Nama Lengkap
                      </label>
                      <input
                        id={`pendamping-${idx}-nama`}
                        value={p.nama}
                        onChange={(e) =>
                          setPendamping((d) =>
                            d.map((x, i) =>
                              i === idx ? { ...x, nama: e.target.value } : x
                            )
                          )
                        }
                        className={kelasInput}
                      />
                    </div>
                    <div>
                      <label htmlFor={`pendamping-${idx}-email`} className={kelasLabel}>
                        Email
                      </label>
                      <input
                        id={`pendamping-${idx}-email`}
                        type="email"
                        value={p.email}
                        onChange={(e) =>
                          setPendamping((d) =>
                            d.map((x, i) =>
                              i === idx ? { ...x, email: e.target.value } : x
                            )
                          )
                        }
                        className={kelasInput}
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor={`pendamping-${idx}-afiliasi`} className={kelasLabel}>
                        Afiliasi
                      </label>
                      <input
                        id={`pendamping-${idx}-afiliasi`}
                        value={p.afiliasi}
                        onChange={(e) =>
                          setPendamping((d) =>
                            d.map((x, i) =>
                              i === idx
                                ? { ...x, afiliasi: e.target.value }
                                : x
                            )
                          )
                        }
                        className={kelasInput}
                      />
                    </div>
                    <div>
                      <label htmlFor={`pendamping-${idx}-orcid`} className={kelasLabel}>
                        ORCID iD (tidak wajib)
                      </label>
                      <input
                        id={`pendamping-${idx}-orcid`}
                        value={p.orcid ?? ""}
                        onChange={(e) =>
                          setPendamping((d) =>
                            d.map((x, i) =>
                              i === idx ? { ...x, orcid: e.target.value } : x
                            )
                          )
                        }
                        className={kelasInput}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  setPendamping((d) => [
                    ...d,
                    { nama: "", email: "", afiliasi: "", orcid: "" }
                  ])
                }
                className="text-sm font-bold bg-white border border-slate-300 hover:border-mahad-gold rounded-full px-5 py-2 transition"
              >
                Tambah Penulis Pendamping
              </button>
            </div>
          )}

          {langkah === 3 && (
            <div className="space-y-5">
              <div>
                <label htmlFor="berkas-utama" className={kelasLabel}>
                  Berkas Naskah Utama (PDF atau DOCX, maksimal 20 MB, wajib)
                </label>
                <input
                  id="berkas-utama"
                  type="file"
                  accept=".pdf,.docx"
                  onChange={(e) => pilihBerkas("utama", e.target.files)}
                  className="w-full text-sm"
                />
              </div>
              <div>
                <label htmlFor="berkas-pendukung" className={kelasLabel}>
                  Berkas Pendukung (PDF, DOCX, XLSX, atau ZIP; maksimal{" "}
                  {BERKAS_PENDUKUNG_MAX_JUMLAH} berkas, tidak wajib)
                </label>
                <input
                  id="berkas-pendukung"
                  type="file"
                  accept=".pdf,.docx,.xlsx,.zip"
                  multiple
                  onChange={(e) => pilihBerkas("pendukung", e.target.files)}
                  className="w-full text-sm"
                />
              </div>
              <p className="text-xs text-slate-500">
                Isi berkas tersimpan di penyimpanan berkas jurnal (R2);
                sistem hanya mencatat metadata berkasnya. Pada lingkungan
                uji tanpa R2, berkas tersimpan di folder uji lokal dan
                ditandai sebagai berkas uji.
              </p>
              {berkas.length > 0 && (
                <ul className="space-y-2">
                  {berkas.map((b, i) => (
                    <li
                      key={`${b.file.name}-${i}`}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                    >
                      <span>
                        <strong>
                          {b.kategori === "utama"
                            ? "Naskah utama"
                            : "Pendukung"}
                          :
                        </strong>{" "}
                        {b.file.name}{" "}
                        <span className="text-slate-400">
                          ({Math.max(1, Math.round(b.file.size / 1024))} KB)
                        </span>
                      </span>
                      <span
                        className={
                          b.galat
                            ? "text-red-600 font-semibold"
                            : b.meta
                              ? "text-emerald-700 font-semibold"
                              : "text-slate-400"
                        }
                      >
                        {b.galat
                          ? b.galat
                          : b.meta
                            ? `Terunggah (${b.meta.mode === "r2" ? "R2" : "uji lokal"})`
                            : "Mengunggah..."}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {langkah === 4 && (
            <div className="space-y-3">
              <span className={kelasLabel}>Pernyataan Pemakaian AI (wajib)</span>
              <label
                htmlFor="ai-tidak"
                className="flex items-start gap-3 rounded-xl border border-slate-200 px-4 py-3 cursor-pointer"
              >
                <input
                  id="ai-tidak"
                  type="radio"
                  name="ai"
                  checked={aiMode === "tidak_memakai"}
                  onChange={() => setAiMode("tidak_memakai")}
                  className="mt-1 h-4 w-4 accent-emerald-700"
                />
                <span className="text-sm text-slate-700">
                  Saya tidak memakai AI dalam penulisan naskah ini.
                </span>
              </label>
              <label
                htmlFor="ai-memakai"
                className="flex items-start gap-3 rounded-xl border border-slate-200 px-4 py-3 cursor-pointer"
              >
                <input
                  id="ai-memakai"
                  type="radio"
                  name="ai"
                  checked={aiMode === "memakai"}
                  onChange={() => setAiMode("memakai")}
                  className="mt-1 h-4 w-4 accent-emerald-700"
                />
                <span className="text-sm text-slate-700">
                  Saya memakai AI dalam penulisan naskah ini dan
                  menjelaskannya di bawah (alat apa, untuk apa). AI tidak
                  dicantumkan sebagai penulis.
                </span>
              </label>
              {aiMode === "memakai" && (
                <div>
                  <label htmlFor="ai-teks" className={kelasLabel}>
                    Penjelasan Pemakaian AI
                  </label>
                  <textarea
                    id="ai-teks"
                    rows={4}
                    value={aiTeks}
                    onChange={(e) => setAiTeks(e.target.value)}
                    className={kelasInput}
                    placeholder="Contoh: memakai ChatGPT untuk parafrase abstrak dan memeriksa ejaan; seluruh argumen dan referensi disusun penulis."
                  />
                </div>
              )}
            </div>
          )}

          {langkah === 5 && (
            <div className="space-y-4 text-sm text-slate-700">
              <h2 className="font-serif font-bold text-lg text-slate-800">
                Tinjau Pengiriman
              </h2>
              <dl className="space-y-2">
                <div>
                  <dt className="font-bold">Bagian</dt>
                  <dd>{labelBagian(bagianSlug)}</dd>
                </div>
                <div>
                  <dt className="font-bold">Judul</dt>
                  <dd>{judul}</dd>
                </div>
                <div>
                  <dt className="font-bold">Kata Kunci</dt>
                  <dd>{kataKunci.join(", ")}</dd>
                </div>
                <div>
                  <dt className="font-bold">Penulis</dt>
                  <dd>
                    {utama.nama} ({sesi.email}) — {utama.afiliasi}
                    {pendamping.map((p, i) => (
                      <span key={i} className="block">
                        {p.nama} ({p.email}) — {p.afiliasi}
                      </span>
                    ))}
                  </dd>
                </div>
                <div>
                  <dt className="font-bold">Berkas</dt>
                  <dd>
                    {berkas
                      .filter((b) => b.meta)
                      .map((b, i) => (
                        <span key={i} className="block">
                          {b.kategori === "utama" ? "Naskah utama" : "Pendukung"}:{" "}
                          {b.file.name} — tersimpan sebagai objek{" "}
                          <span className="font-mono text-xs">
                            {b.meta?.bucket}/{b.meta?.kunci}
                          </span>
                        </span>
                      ))}
                  </dd>
                </div>
                <div>
                  <dt className="font-bold">Pernyataan AI</dt>
                  <dd>
                    {teksPernyataanAi({ mode: aiMode, teks: aiTeks })}
                  </dd>
                </div>
                <div>
                  <dt className="font-bold">Daftar Periksa</dt>
                  <dd>Keenam butir telah dicentang.</dd>
                </div>
              </dl>
              <TurnstileJurnal onToken={setTokenTurnstile} />
              {galat && (
                <p className="rounded-xl border border-red-300 bg-red-50 text-red-700 px-4 py-3">
                  {galat}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            disabled={langkah === 0}
            onClick={() => setLangkah((l) => Math.max(0, l - 1))}
            className="bg-white border border-slate-300 hover:border-mahad-gold disabled:opacity-40 font-bold text-sm px-6 py-2.5 rounded-full transition"
          >
            Kembali
          </button>
          {langkah < LANGKAH.length - 1 ? (
            <button
              type="button"
              disabled={!sahLangkah(langkah)}
              onClick={() => setLangkah((l) => l + 1)}
              className="bg-mahad-gold hover:bg-yellow-400 disabled:opacity-50 text-mahad-green-dark font-bold text-sm px-6 py-2.5 rounded-full shadow transition"
            >
              Lanjut
            </button>
          ) : (
            <button
              type="button"
              disabled={mengirim}
              onClick={kirim}
              className="bg-mahad-gold hover:bg-yellow-400 disabled:opacity-60 text-mahad-green-dark font-bold text-sm px-6 py-3 rounded-full shadow transition"
            >
              {mengirim ? "Mengirim..." : "Kirim Naskah"}
            </button>
          )}
        </div>
        {langkah < LANGKAH.length - 1 && !sahLangkah(langkah) && (
          <p className="mt-3 text-xs text-slate-400 text-right">
            Lengkapi langkah ini untuk melanjutkan.
          </p>
        )}
      </section>
    </div>
  );
}

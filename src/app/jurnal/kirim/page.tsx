"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

// Formulir kirim naskah cabang jurnal VERSI UJI.
// Mengirim ke /api/jurnal/submissions yang menyimpan ke lapisan data uji
// lokal — BUKAN ke basis data produksi kampus. Berkas naskah tidak wajib
// dan tidak diunggah pada versi uji.

export default function KirimNaskahJurnalPage() {
  const [form, setForm] = useState({
    judul: "",
    penulis: "",
    email: "",
    afiliasi: "",
    abstrak: ""
  });
  const [mengirim, setMengirim] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [hasil, setHasil] = useState<{
    kode: string;
    status: string;
    statusLabel: string;
  } | null>(null);

  const ubah =
    (kolom: keyof typeof form) =>
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) =>
      setForm((f) => ({ ...f, [kolom]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMengirim(true);
    setGalat(null);
    try {
      const res = await fetch("/api/jurnal/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setGalat(data?.error || "Pengiriman gagal. Coba lagi.");
      } else {
        setHasil({
          kode: data.kode,
          status: data.status,
          statusLabel: data.statusLabel || data.status
        });
      }
    } catch {
      setGalat("Tidak dapat menghubungi server uji.");
    } finally {
      setMengirim(false);
    }
  }

  const kelasInput =
    "w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:border-mahad-gold focus:ring-1 focus:ring-mahad-gold bg-white";

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8">
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-800">
          Kirim Naskah — Versi Uji
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          Formulir ini hanya untuk menguji alur pengiriman naskah. Naskah
          tersimpan di <strong>lapisan data uji</strong> situs ini dan tidak
          masuk ke sistem kampus yang sebenarnya. Berkas naskah tidak perlu
          dilampirkan pada versi uji.
        </p>

        {hasil ? (
          <div className="mt-6 rounded-xl border-2 border-emerald-500 bg-emerald-50 px-5 py-4">
            <p className="font-bold text-emerald-900">
              Naskah uji berhasil diterima redaksi (data uji).
            </p>
            <p className="text-sm text-emerald-800 mt-2">
              Kode lacak Anda:{" "}
              <span className="font-mono font-bold text-base">{hasil.kode}</span>
            </p>
            <p className="text-sm text-emerald-800">
              Status awal: <strong>{hasil.statusLabel}</strong>
            </p>
            <p className="text-sm mt-3">
              Gunakan kode itu di{" "}
              <Link href="/jurnal/lacak" className="text-mahad-green font-semibold underline">
                halaman lacak naskah
              </Link>{" "}
              untuk memeriksa perubahan status.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="judul" className="block text-sm font-semibold text-slate-700 mb-1">
                Judul Naskah
              </label>
              <input
                id="judul"
                required
                value={form.judul}
                onChange={ubah("judul")}
                className={kelasInput}
                placeholder="Judul artikel yang diusulkan"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="penulis" className="block text-sm font-semibold text-slate-700 mb-1">
                  Nama Penulis
                </label>
                <input
                  id="penulis"
                  required
                  value={form.penulis}
                  onChange={ubah("penulis")}
                  className={kelasInput}
                  placeholder="Nama lengkap penulis"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1">
                  Email Penulis
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={ubah("email")}
                  className={kelasInput}
                  placeholder="nama@contoh.ac.id"
                />
              </div>
            </div>
            <div>
              <label htmlFor="afiliasi" className="block text-sm font-semibold text-slate-700 mb-1">
                Afiliasi
              </label>
              <input
                id="afiliasi"
                required
                value={form.afiliasi}
                onChange={ubah("afiliasi")}
                className={kelasInput}
                placeholder="Lembaga / institusi penulis"
              />
            </div>
            <div>
              <label htmlFor="abstrak" className="block text-sm font-semibold text-slate-700 mb-1">
                Abstrak
              </label>
              <textarea
                id="abstrak"
                required
                rows={6}
                value={form.abstrak}
                onChange={ubah("abstrak")}
                className={kelasInput}
                placeholder="Abstrak naskah (untuk versi uji cukup minimal 50 karakter)"
              />
            </div>
            <div>
              <label htmlFor="berkas" className="block text-sm font-semibold text-slate-700 mb-1">
                Berkas Naskah (tidak wajib — nonaktif pada versi uji)
              </label>
              <input
                id="berkas"
                type="file"
                disabled
                className="w-full text-sm text-slate-400"
              />
              <p className="text-xs text-slate-400 mt-1">
                Unggah berkas dinonaktifkan pada versi uji; cukup isi
                abstrak.
              </p>
            </div>

            {galat && (
              <p className="rounded-xl border border-red-300 bg-red-50 text-red-700 text-sm px-4 py-3">
                {galat}
              </p>
            )}

            <button
              type="submit"
              disabled={mengirim}
              className="bg-mahad-gold hover:bg-yellow-400 disabled:opacity-60 text-mahad-green-dark font-bold text-sm px-6 py-3 rounded-full shadow transition"
            >
              {mengirim ? "Mengirim..." : "Kirim Naskah Uji"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

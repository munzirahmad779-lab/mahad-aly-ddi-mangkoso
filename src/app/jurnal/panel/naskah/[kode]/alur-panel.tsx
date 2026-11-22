"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import type { JurnalStatus } from "@/lib/jurnal/status";
import type {
  JurnalPetugasOption,
  JurnalTugasCopyView,
  JurnalTugasProduksiView
} from "@/lib/jurnal/alur";
import {
  validasiBerkasMeta,
  type JurnalBerkasKategori,
  type JurnalBerkasMeta
} from "@/lib/jurnal/wizard";

// Panel alur Tahap 4 pada halaman rincian naskah staf: copyediting
// (buat tugas, unggah hasil sunting, pantau persetujuan penulis,
// pindah ke produksi) dan produksi (buat tugas, unggah galley PDF dan
// HTML, pantau proofread penulis, tandai siap terbit), plus ringkasan
// penempatan terbitan. Seluruh aturan ditegakkan server; komponen ini
// hanya menampilkan keadaan dan mengirim perintah.

interface KeadaanAlur {
  copyediting: JurnalTugasCopyView[];
  produksi: JurnalTugasProduksiView[];
  penempatan: { issueSlug: string; issueLabel: string; urutan: number } | null;
  petugasCopy: JurnalPetugasOption[];
  petugasLayout: JurnalPetugasOption[];
}

const STATUS_AKTIF_COPY = ["assigned", "in_progress", "author_review"];

export default function AlurPanel({
  kode,
  statusNaskah,
  ambilToken,
  onStatusBerubah
}: {
  kode: string;
  statusNaskah: JurnalStatus;
  ambilToken: () => Promise<string | null>;
  onStatusBerubah: () => Promise<void>;
}) {
  const [keadaan, setKeadaan] = useState<KeadaanAlur | null>(null);
  const [galat, setGalat] = useState<string | null>(null);
  const [pesan, setPesan] = useState<string | null>(null);
  const [sibuk, setSibuk] = useState(false);
  const [petugasCopyPilihan, setPetugasCopyPilihan] = useState("");
  const [petugasLayoutPilihan, setPetugasLayoutPilihan] = useState("");
  const [batchId] = useState(
    () =>
      `alur-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
  );

  const muat = useCallback(async () => {
    const token = await ambilToken();
    if (!token) return;
    try {
      const res = await fetch(
        `/api/jurnal/submissions/${encodeURIComponent(kode)}/alur`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json().catch(() => null);
      if (res.ok && data) {
        setKeadaan({
          copyediting: data.copyediting ?? [],
          produksi: data.produksi ?? [],
          penempatan: data.penempatan ?? null,
          petugasCopy: data.petugasCopy ?? [],
          petugasLayout: data.petugasLayout ?? []
        });
      }
    } catch {
      // Keadaan alur gagal dimuat tidak menutupi rincian telaah.
    }
  }, [ambilToken, kode]);

  useEffect(() => {
    void muat();
  }, [muat]);

  const kelasInput =
    "rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:border-mahad-gold";

  async function kirimJson(
    jalur: string,
    body: unknown
  ): Promise<boolean> {
    const token = await ambilToken();
    if (!token) {
      setGalat("Sesi staf tidak ditemukan. Masuk ulang lewat Panel Redaksi.");
      return false;
    }
    const res = await fetch(jalur, {
      method: "POST",
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

  async function unggahSatu(
    file: File,
    kategori: JurnalBerkasKategori
  ): Promise<JurnalBerkasMeta | null> {
    const token = await ambilToken();
    if (!token) {
      setGalat("Sesi staf tidak ditemukan. Masuk ulang lewat Panel Redaksi.");
      return null;
    }
    const pesanValidasi = validasiBerkasMeta({
      kategori,
      namaAsli: file.name,
      mime: file.type,
      ukuran: file.size
    });
    if (pesanValidasi) {
      setGalat(pesanValidasi);
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
      setGalat(sign?.error || "Gagal menyiapkan unggahan berkas.");
      return null;
    }
    if (sign.mode === "r2") {
      const put = await fetch(sign.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file
      });
      if (!put.ok) {
        setGalat("Unggahan berkas ke penyimpanan gagal.");
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
      setGalat(dataLocal?.error || "Unggahan uji lokal gagal.");
      return null;
    }
    return dataLocal.berkas as JurnalBerkasMeta;
  }

  async function buatTugasCopy(e: FormEvent) {
    e.preventDefault();
    setSibuk(true);
    setGalat(null);
    setPesan(null);
    const ok = await kirimJson(
      `/api/jurnal/submissions/${encodeURIComponent(kode)}/copyediting`,
      { copyeditorEmail: petugasCopyPilihan || undefined }
    );
    if (ok) {
      setPesan("Tugas copyediting dibuat.");
      await muat();
    }
    setSibuk(false);
  }

  async function unggahHasilCopy(
    tugasId: string,
    files: FileList | null
  ) {
    if (!files || files.length === 0) return;
    setSibuk(true);
    setGalat(null);
    setPesan(null);
    const meta = await unggahSatu(files[0], "utama");
    if (meta) {
      const ok = await kirimJson(
        `/api/jurnal/submissions/${encodeURIComponent(kode)}/copyediting/berkas`,
        { tugasId, berkas: meta }
      );
      if (ok) {
        setPesan("Hasil copyediting terdaftar; menunggu persetujuan penulis.");
        await muat();
      }
    }
    setSibuk(false);
  }

  async function pindahKeProduksi() {
    setSibuk(true);
    setGalat(null);
    setPesan(null);
    const token = await ambilToken();
    if (!token) {
      setGalat("Sesi staf tidak ditemukan.");
      setSibuk(false);
      return;
    }
    const res = await fetch(
      `/api/jurnal/submissions/${encodeURIComponent(kode)}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: "production",
          catatan: "Copyediting selesai; naskah masuk tahap produksi."
        })
      }
    );
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setGalat(data?.error || "Gagal memindahkan naskah ke produksi.");
    } else {
      setPesan("Naskah dipindahkan ke tahap Produksi.");
      await onStatusBerubah();
      await muat();
    }
    setSibuk(false);
  }

  async function buatTugasProduksi(e: FormEvent) {
    e.preventDefault();
    setSibuk(true);
    setGalat(null);
    setPesan(null);
    const ok = await kirimJson(
      `/api/jurnal/submissions/${encodeURIComponent(kode)}/produksi`,
      { layoutEmail: petugasLayoutPilihan || undefined }
    );
    if (ok) {
      setPesan("Tugas produksi dibuat.");
      await muat();
    }
    setSibuk(false);
  }

  async function unggahGalley(
    tugasId: string,
    jenis: "pdf" | "html",
    files: FileList | null
  ) {
    if (!files || files.length === 0) return;
    setSibuk(true);
    setGalat(null);
    setPesan(null);
    const meta = await unggahSatu(files[0], "galley");
    if (meta) {
      const ok = await kirimJson(
        `/api/jurnal/submissions/${encodeURIComponent(kode)}/produksi/galley`,
        { tugasId, jenis, berkas: meta }
      );
      if (ok) {
        setPesan(`Galley ${jenis.toUpperCase()} terdaftar.`);
        await muat();
      }
    }
    setSibuk(false);
  }

  async function tandaiSiap(tugasId: string) {
    setSibuk(true);
    setGalat(null);
    setPesan(null);
    const ok = await kirimJson(
      `/api/jurnal/submissions/${encodeURIComponent(kode)}/produksi/siap`,
      { tugasId }
    );
    if (ok) {
      setPesan("Galley ditandai siap terbit.");
      await muat();
    }
    setSibuk(false);
  }

  if (!keadaan) return null;
  const tugasCopyAktif = keadaan.copyediting.find((t) =>
    STATUS_AKTIF_COPY.includes(t.status)
  );
  const tugasCopyTerakhir =
    keadaan.copyediting[keadaan.copyediting.length - 1] ?? null;
  const tugasProduksiAktif =
    keadaan.produksi.find((t) => t.status !== "cancelled") ?? null;
  const tampilCopy =
    statusNaskah === "copyediting" || keadaan.copyediting.length > 0;
  const tampilProduksi =
    statusNaskah === "production" ||
    statusNaskah === "published" ||
    keadaan.produksi.length > 0;
  if (!tampilCopy && !tampilProduksi) return null;

  return (
    <div className="mt-10">
      <h2 className="font-serif font-bold text-xl text-slate-800">
        Copyediting dan Produksi
      </h2>
      {pesan && (
        <p className="mt-3 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 text-sm px-4 py-3">
          {pesan}
        </p>
      )}
      {galat && (
        <p className="mt-3 rounded-xl border border-red-300 bg-red-50 text-red-700 text-sm px-4 py-3">
          {galat}
        </p>
      )}

      {tampilCopy && (
        <section className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-3">
          <h3 className="font-serif font-bold text-base text-slate-800">
            Copyediting
          </h3>
          {keadaan.copyediting.map((t) => (
            <div
              key={t.id}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm space-y-2"
            >
              <p className="text-slate-700">
                <strong>{t.copyeditorNama}</strong> ({t.copyeditorEmail}) —{" "}
                {t.statusLabel}
              </p>
              {t.berkasHasil && (
                <p className="text-slate-600">
                  Berkas hasil sunting: {t.berkasHasil.namaAsli} (
                  {(t.berkasHasil.ukuran / 1024).toFixed(1)} KB)
                </p>
              )}
              {t.persetujuanPenulisPada && (
                <p className="text-slate-600">
                  Disetujui penulis pada{" "}
                  {new Date(t.persetujuanPenulisPada).toLocaleString("id-ID")}
                </p>
              )}
              {STATUS_AKTIF_COPY.includes(t.status) && (
                <div>
                  <label
                    htmlFor={`copy-hasil-${t.id}`}
                    className="block text-sm font-semibold text-slate-700 mb-1"
                  >
                    Unggah berkas hasil suntingan (PDF atau DOCX)
                  </label>
                  <input
                    id={`copy-hasil-${t.id}`}
                    type="file"
                    accept=".pdf,.docx"
                    disabled={sibuk}
                    onChange={(e) =>
                      void unggahHasilCopy(t.id, e.target.files)
                    }
                    className="text-sm"
                  />
                </div>
              )}
            </div>
          ))}
          {statusNaskah === "copyediting" && !tugasCopyAktif && (
            <form onSubmit={buatTugasCopy} className="space-y-3">
              <div>
                <label
                  htmlFor="petugas-copy"
                  className="block text-sm font-semibold text-slate-700 mb-1"
                >
                  Copyeditor
                </label>
                <select
                  id="petugas-copy"
                  value={petugasCopyPilihan}
                  onChange={(e) => setPetugasCopyPilihan(e.target.value)}
                  className={`${kelasInput} w-full sm:w-96`}
                >
                  <option value="">Saya sendiri (editor yang masuk)</option>
                  {keadaan.petugasCopy.map((p) => (
                    <option key={p.email} value={p.email}>
                      {p.nama} ({p.email})
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={sibuk}
                className="bg-mahad-gold hover:bg-yellow-400 disabled:opacity-60 text-mahad-green-dark font-bold text-sm px-6 py-2.5 rounded-full shadow transition"
              >
                Buat Tugas Copyediting
              </button>
            </form>
          )}
          {statusNaskah === "copyediting" &&
            tugasCopyTerakhir?.status === "completed" && (
              <button
                onClick={pindahKeProduksi}
                disabled={sibuk}
                className="bg-mahad-gold hover:bg-yellow-400 disabled:opacity-60 text-mahad-green-dark font-bold text-sm px-6 py-2.5 rounded-full shadow transition"
              >
                Pindah ke Produksi
              </button>
            )}
        </section>
      )}

      {tampilProduksi && (
        <section className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-3">
          <h3 className="font-serif font-bold text-base text-slate-800">
            Produksi dan Galley
          </h3>
          {keadaan.produksi.map((t) => (
            <div
              key={t.id}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm space-y-2"
            >
              <p className="text-slate-700">
                <strong>{t.layoutNama}</strong> ({t.layoutEmail}) —{" "}
                {t.statusLabel}
              </p>
              <p className="text-slate-600">
                Galley PDF:{" "}
                {t.galleyPdf ? t.galleyPdf.namaAsli : "belum diunggah"} •
                Galley HTML:{" "}
                {t.galleyHtml ? t.galleyHtml.namaAsli : "belum diunggah"}
              </p>
              <p className="text-slate-600">
                Proofread penulis: {t.proofLabel}
                {t.proofCatatan ? ` — "${t.proofCatatan}"` : ""}
              </p>
              {t.status !== "ready" && t.status !== "cancelled" && (
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor={`galley-pdf-${t.id}`}
                      className="block text-sm font-semibold text-slate-700 mb-1"
                    >
                      Unggah galley PDF
                    </label>
                    <input
                      id={`galley-pdf-${t.id}`}
                      type="file"
                      accept=".pdf"
                      disabled={sibuk}
                      onChange={(e) =>
                        void unggahGalley(t.id, "pdf", e.target.files)
                      }
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`galley-html-${t.id}`}
                      className="block text-sm font-semibold text-slate-700 mb-1"
                    >
                      Unggah galley HTML
                    </label>
                    <input
                      id={`galley-html-${t.id}`}
                      type="file"
                      accept=".html"
                      disabled={sibuk}
                      onChange={(e) =>
                        void unggahGalley(t.id, "html", e.target.files)
                      }
                      className="text-sm"
                    />
                  </div>
                </div>
              )}
              {t.status === "author_proof" &&
                t.proofStatus === "disetujui" && (
                  <button
                    onClick={() => void tandaiSiap(t.id)}
                    disabled={sibuk}
                    className="bg-mahad-gold hover:bg-yellow-400 disabled:opacity-60 text-mahad-green-dark font-bold text-sm px-6 py-2.5 rounded-full shadow transition"
                  >
                    Tandai Siap Terbit
                  </button>
                )}
            </div>
          ))}
          {statusNaskah === "production" && !tugasProduksiAktif && (
            <form onSubmit={buatTugasProduksi} className="space-y-3">
              <div>
                <label
                  htmlFor="petugas-layout"
                  className="block text-sm font-semibold text-slate-700 mb-1"
                >
                  Layout editor
                </label>
                <select
                  id="petugas-layout"
                  value={petugasLayoutPilihan}
                  onChange={(e) => setPetugasLayoutPilihan(e.target.value)}
                  className={`${kelasInput} w-full sm:w-96`}
                >
                  <option value="">Saya sendiri (editor yang masuk)</option>
                  {keadaan.petugasLayout.map((p) => (
                    <option key={p.email} value={p.email}>
                      {p.nama} ({p.email})
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={sibuk}
                className="bg-mahad-gold hover:bg-yellow-400 disabled:opacity-60 text-mahad-green-dark font-bold text-sm px-6 py-2.5 rounded-full shadow transition"
              >
                Buat Tugas Produksi
              </button>
            </form>
          )}
          <p className="text-sm text-slate-600">
            Penempatan terbitan:{" "}
            {keadaan.penempatan ? (
              <>
                <strong>{keadaan.penempatan.issueLabel}</strong>, urutan{" "}
                {keadaan.penempatan.urutan}.{" "}
              </>
            ) : (
              <>belum ditetapkan ke terbitan mana pun. </>
            )}
            <Link
              href="/jurnal/panel/terbitan"
              className="text-mahad-green font-semibold underline"
            >
              Buka Pengelolaan Terbitan
            </Link>
          </p>
        </section>
      )}
    </div>
  );
}

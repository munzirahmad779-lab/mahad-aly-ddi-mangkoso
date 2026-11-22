"use client";

import {
  useCallback,
  useEffect,
  useState,
  type FormEvent
} from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { ambilSesiKlien } from "@/lib/jurnal/sesi-klien";
import type { JurnalSubmissionView } from "@/lib/jurnal/status";
import {
  JURNAL_REVIEW_DECISIONS,
  JURNAL_REVIEW_DECISION_LABEL_ID,
  type JurnalBerkasStaffView,
  type JurnalReviewDecision,
  type JurnalReviewerOption,
  type JurnalRoundStaffView
} from "@/lib/jurnal/review";
import AlurPanel from "./alur-panel";

// Halaman rincian naskah untuk staf (Tahap 3): mengelola mesin review
// per naskah. Membuka putaran, menugaskan reviewer dari daftar pengguna
// berperan reviewer, mengundang reviewer baru lewat email (tautan klaim
// ditampilkan sekali untuk diserahkan staf), dan mengambil keputusan
// per putaran. Seluruh penegakan aturan berada di server; halaman ini
// hanya menampilkan keadaan dan mengirim perintah.

interface KeadaanReview {
  naskah: JurnalSubmissionView;
  putaranBerjalan: number | null;
  putaran: JurnalRoundStaffView[];
  berkas: JurnalBerkasStaffView[];
}

export default function PanelNaskahRincianPage() {
  const params = useParams<{ kode: string }>();
  const kode = decodeURIComponent(params.kode ?? "");
  const [memuat, setMemuat] = useState(true);
  const [keadaan, setKeadaan] = useState<KeadaanReview | null>(null);
  const [reviewers, setReviewers] = useState<JurnalReviewerOption[]>([]);
  const [galat, setGalat] = useState<string | null>(null);
  const [pesan, setPesan] = useState<string | null>(null);
  const [sibuk, setSibuk] = useState(false);

  const [reviewerPilihan, setReviewerPilihan] = useState("");
  const [tenggatHari, setTenggatHari] = useState("28");
  const [emailUndangan, setEmailUndangan] = useState("");
  const [tautanKlaim, setTautanKlaim] = useState<string | null>(null);
  const [keputusan, setKeputusan] =
    useState<JurnalReviewDecision>("major_revisions");
  const [catatan, setCatatan] = useState("");

  const ambilToken = useCallback(async (): Promise<string | null> => {
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
    if (!token) {
      setGalat("Sesi staf tidak ditemukan. Masuk lewat Panel Redaksi dulu.");
      setMemuat(false);
      return;
    }
    try {
      const [resKeadaan, resReviewers] = await Promise.all([
        fetch(`/api/jurnal/submissions/${encodeURIComponent(kode)}/review`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch("/api/jurnal/reviewers", {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      const data = await resKeadaan.json().catch(() => null);
      if (!resKeadaan.ok) {
        setGalat(data?.error || "Gagal memuat rincian naskah.");
      } else {
        setKeadaan(data as KeadaanReview);
        setGalat(null);
      }
      if (resReviewers.ok) {
        const dataR = await resReviewers.json().catch(() => null);
        setReviewers(
          (dataR?.reviewers as JurnalReviewerOption[]) ?? []
        );
      }
    } catch {
      setGalat("Tidak dapat menghubungi server.");
    } finally {
      setMemuat(false);
    }
  }, [ambilToken, kode]);

  useEffect(() => {
    void muat();
  }, [muat]);

  async function kirim(
    jalur: string,
    metode: string,
    body?: unknown
  ): Promise<boolean> {
    const token = await ambilToken();
    if (!token) {
      setGalat("Sesi staf tidak ditemukan. Masuk ulang lewat Panel Redaksi.");
      return false;
    }
    const res = await fetch(jalur, {
      method: metode,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setGalat(data?.error || "Permintaan gagal diproses.");
      return false;
    }
    if (data?.tautanKlaim) {
      setTautanKlaim(data.tautanKlaim as string);
    }
    return true;
  }

  async function bukaPutaranBaru() {
    setSibuk(true);
    setPesan(null);
    setGalat(null);
    const ok = await kirim(
      `/api/jurnal/submissions/${encodeURIComponent(kode)}/review/putaran`,
      "POST",
      {}
    );
    if (ok) {
      setPesan("Putaran telaah baru dibuka.");
      await muat();
    }
    setSibuk(false);
  }

  async function tugaskan(e: FormEvent) {
    e.preventDefault();
    if (!reviewerPilihan) {
      setGalat("Pilih reviewer dari daftar terlebih dahulu.");
      return;
    }
    setSibuk(true);
    setPesan(null);
    setGalat(null);
    const ok = await kirim(
      `/api/jurnal/submissions/${encodeURIComponent(kode)}/review/penugasan`,
      "POST",
      {
        reviewerEmail: reviewerPilihan,
        tenggatHari: Number(tenggatHari) || undefined
      }
    );
    if (ok) {
      setPesan(`Reviewer ${reviewerPilihan} ditugaskan pada putaran ini.`);
      await muat();
    }
    setSibuk(false);
  }

  async function undang(e: FormEvent) {
    e.preventDefault();
    setSibuk(true);
    setPesan(null);
    setGalat(null);
    setTautanKlaim(null);
    const ok = await kirim("/api/jurnal/reviewers", "POST", {
      email: emailUndangan
    });
    if (ok) {
      setPesan(
        `Undangan untuk ${emailUndangan} dibuat. Serahkan tautan klaim di bawah kepada calon reviewer; sesudah ia mengklaim, namanya muncul di daftar reviewer dan dapat ditugaskan.`
      );
      setEmailUndangan("");
      await muat();
    }
    setSibuk(false);
  }

  async function putuskan(e: FormEvent) {
    e.preventDefault();
    setSibuk(true);
    setPesan(null);
    setGalat(null);
    const ok = await kirim(
      `/api/jurnal/submissions/${encodeURIComponent(kode)}/review/keputusan`,
      "POST",
      { keputusan, catatan: catatan || undefined }
    );
    if (ok) {
      setPesan(
        `Keputusan putaran dicatat: ${JURNAL_REVIEW_DECISION_LABEL_ID[keputusan]}.`
      );
      setCatatan("");
      await muat();
    }
    setSibuk(false);
  }

  const kelasInput =
    "rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:border-mahad-gold";
  const putaranTerbuka = keadaan?.putaran.find(
    (p) => p.nomor === keadaan.putaranBerjalan
  );
  const aktifTerbuka =
    putaranTerbuka?.penugasan.filter(
      (a) => a.status !== "cancelled" && a.status !== "declined"
    ).length ?? 0;

  // Formulir undangan reviewer dipakai di dua tempat: di dalam grid
  // putaran terbuka (di samping formulir penugasan) dan berdiri sendiri
  // sebelum putaran dibuka, supaya editor bisa mengundang dan menunggu
  // klaim lebih dulu sebelum membuka putaran.
  const formulirUndangan = (
    <form
      onSubmit={undang}
      className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-3"
    >
      <h3 className="font-serif font-bold text-base text-slate-800">
        Undang Reviewer Baru
      </h3>
      <p className="text-sm text-slate-600">
        Untuk alamat yang belum terdaftar sebagai reviewer.
        Undangan menghasilkan tautan klaim yang diserahkan
        kepada calon reviewer.
      </p>
      <div>
        <label htmlFor="email-undangan" className="block text-sm font-semibold text-slate-700 mb-1">
          Email calon reviewer
        </label>
        <input
          id="email-undangan"
          type="email"
          required
          value={emailUndangan}
          onChange={(e) => setEmailUndangan(e.target.value)}
          className={`${kelasInput} w-full`}
          placeholder="nama@contoh.ac.id"
        />
      </div>
      <button
        type="submit"
        disabled={sibuk}
        className="bg-white border border-slate-300 hover:border-mahad-gold disabled:opacity-60 font-bold text-sm px-6 py-2.5 rounded-full transition"
      >
        Buat Undangan
      </button>
    </form>
  );

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8">
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <Link
          href="/jurnal/panel"
          className="text-sm text-mahad-green font-semibold underline"
        >
          Kembali ke Panel Redaksi
        </Link>
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-800 mt-3">
          Rincian Naskah dan Telaah
        </h1>

        {memuat ? (
          <p className="text-sm text-slate-500 mt-6">Memuat rincian...</p>
        ) : galat && !keadaan ? (
          <p className="mt-4 rounded-xl border border-red-300 bg-red-50 text-red-700 text-sm px-4 py-3">
            {galat}
          </p>
        ) : keadaan ? (
          <>
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
            {tautanKlaim && (
              <div className="mt-4 rounded-xl border border-sky-300 bg-sky-50 text-sky-900 text-sm px-4 py-3">
                <p className="font-semibold">Tautan klaim undangan reviewer:</p>
                <p className="font-mono text-xs break-all mt-1">
                  {tautanKlaim}
                </p>
                <p className="text-xs mt-1">
                  Tautan berlaku 14 hari dan hanya tampil sekali di sini.
                </p>
              </div>
            )}

            <div className="mt-5 border border-slate-200 rounded-xl p-4 sm:p-5 bg-slate-50">
              <p className="font-mono text-xs font-bold text-slate-500">
                {keadaan.naskah.kode}
              </p>
              <h2 className="font-serif font-bold text-lg text-slate-800 leading-snug mt-1">
                {keadaan.naskah.judul}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {keadaan.naskah.penulis} ({keadaan.naskah.email}) —{" "}
                {keadaan.naskah.afiliasi}
                {keadaan.naskah.bagianLabel
                  ? ` — Bagian: ${keadaan.naskah.bagianLabel}`
                  : ""}
              </p>
              <p className="text-sm text-slate-600 mt-2">
                Status: <strong>{keadaan.naskah.statusLabel}</strong>
              </p>
              {keadaan.berkas.length > 0 && (
                <ul className="mt-3 text-xs text-slate-500 space-y-1">
                  {keadaan.berkas.map((b) => (
                    <li key={b.id}>
                      Berkas {b.kategori}
                      {b.tahap === "review"
                        ? ` (revisi putaran ${b.putaran ?? "-"})`
                        : ""}
                      : {b.namaAsli} ({(b.ukuran / 1024).toFixed(1)} KB)
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <h2 className="font-serif font-bold text-xl text-slate-800 mt-8">
              Putaran Telaah
            </h2>
            {keadaan.putaran.length === 0 ? (
              <p className="text-sm text-slate-500 mt-3">
                Belum ada putaran telaah untuk naskah ini.
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                {keadaan.putaran.map((p) => (
                  <article
                    key={p.nomor}
                    className="border border-slate-200 rounded-xl p-4 sm:p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="font-serif font-bold text-base text-slate-800">
                        Putaran {p.nomor}
                      </h3>
                      <span className="text-xs font-bold bg-mahad-gold-light text-mahad-green-dark px-3 py-1 rounded-full">
                        {p.status === "open"
                          ? "Terbuka"
                          : `Ditutup — ${p.keputusanLabel ?? ""}`}
                      </span>
                    </div>
                    {p.penugasan.length === 0 ? (
                      <p className="text-sm text-slate-500 mt-3">
                        Belum ada reviewer yang ditugaskan pada putaran ini.
                      </p>
                    ) : (
                      <ul className="mt-3 space-y-3">
                        {p.penugasan.map((a) => (
                          <li
                            key={a.id}
                            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                          >
                            <p className="text-sm text-slate-700">
                              <strong>{a.reviewerNama}</strong> (
                              {a.reviewerEmail}) — {a.statusLabel}
                              {a.tenggat
                                ? ` — tenggat ${new Date(a.tenggat).toLocaleDateString("id-ID")}`
                                : ""}
                            </p>
                            {a.rekomendasiLabel && (
                              <p className="text-sm text-slate-600 mt-1">
                                Rekomendasi:{" "}
                                <strong>{a.rekomendasiLabel}</strong>
                              </p>
                            )}
                            {a.komentarPenulis && (
                              <p className="text-sm text-slate-600 mt-1 whitespace-pre-line">
                                <strong>Komentar untuk penulis:</strong>{" "}
                                {a.komentarPenulis}
                              </p>
                            )}
                            {a.komentarEditor && (
                              <p className="text-sm text-slate-600 mt-1 whitespace-pre-line">
                                <strong>Komentar rahasia untuk editor:</strong>{" "}
                                {a.komentarEditor}
                              </p>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>
                ))}
              </div>
            )}

            {(keadaan.naskah.status === "submitted" ||
              keadaan.naskah.status === "review") &&
              !putaranTerbuka && (
                <div className="mt-6">
                  <button
                    onClick={bukaPutaranBaru}
                    disabled={sibuk}
                    className="bg-mahad-gold hover:bg-yellow-400 disabled:opacity-60 text-mahad-green-dark font-bold text-sm px-6 py-2.5 rounded-full shadow transition"
                  >
                    Buka Putaran Telaah
                  </button>
                  <div className="mt-6 max-w-xl">{formulirUndangan}</div>
                </div>
              )}

            {putaranTerbuka && (
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <form
                  onSubmit={tugaskan}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-3"
                >
                  <h3 className="font-serif font-bold text-base text-slate-800">
                    Tugaskan Reviewer (Putaran {putaranTerbuka.nomor})
                  </h3>
                  {reviewers.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      Belum ada pengguna berperan reviewer. Undang reviewer
                      baru lewat formulir undangan di samping.
                    </p>
                  ) : (
                    <>
                      <div>
                        <label htmlFor="pilih-reviewer" className="block text-sm font-semibold text-slate-700 mb-1">
                          Reviewer
                        </label>
                        <select
                          id="pilih-reviewer"
                          value={reviewerPilihan}
                          onChange={(e) => setReviewerPilihan(e.target.value)}
                          className={`${kelasInput} w-full`}
                        >
                          <option value="">Pilih reviewer...</option>
                          {reviewers.map((r) => (
                            <option key={r.email} value={r.email}>
                              {r.nama} ({r.email})
                              {r.afiliasi ? ` — ${r.afiliasi}` : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="tenggat-hari" className="block text-sm font-semibold text-slate-700 mb-1">
                          Tenggat (hari)
                        </label>
                        <input
                          id="tenggat-hari"
                          type="number"
                          min={1}
                          max={90}
                          value={tenggatHari}
                          onChange={(e) => setTenggatHari(e.target.value)}
                          className={`${kelasInput} w-28`}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={sibuk}
                        className="bg-mahad-gold hover:bg-yellow-400 disabled:opacity-60 text-mahad-green-dark font-bold text-sm px-6 py-2.5 rounded-full shadow transition"
                      >
                        Tugaskan
                      </button>
                    </>
                  )}
                </form>

                {formulirUndangan}

                <form
                  onSubmit={putuskan}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-3 lg:col-span-2"
                >
                  <h3 className="font-serif font-bold text-base text-slate-800">
                    Keputusan Editor (Putaran {putaranTerbuka.nomor})
                  </h3>
                  <p className="text-sm text-slate-600">
                    Penugasan aktif pada putaran ini:{" "}
                    <strong>{aktifTerbuka}</strong> reviewer. Keputusan
                    memerlukan minimal 2 reviewer aktif.
                  </p>
                  <div>
                    <label htmlFor="keputusan" className="block text-sm font-semibold text-slate-700 mb-1">
                      Keputusan
                    </label>
                    <select
                      id="keputusan"
                      value={keputusan}
                      onChange={(e) =>
                        setKeputusan(e.target.value as JurnalReviewDecision)
                      }
                      className={`${kelasInput} w-full sm:w-96`}
                    >
                      {JURNAL_REVIEW_DECISIONS.map((d) => (
                        <option key={d} value={d}>
                          {JURNAL_REVIEW_DECISION_LABEL_ID[d]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="catatan-keputusan" className="block text-sm font-semibold text-slate-700 mb-1">
                      Catatan keputusan (tercatat di linimasa naskah)
                    </label>
                    <textarea
                      id="catatan-keputusan"
                      rows={3}
                      value={catatan}
                      onChange={(e) => setCatatan(e.target.value)}
                      className={`${kelasInput} w-full`}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={sibuk}
                    className="bg-mahad-gold hover:bg-yellow-400 disabled:opacity-60 text-mahad-green-dark font-bold text-sm px-6 py-2.5 rounded-full shadow transition"
                  >
                    Ambil Keputusan dan Tutup Putaran
                  </button>
                </form>
              </div>
            )}

            {keadaan.naskah.riwayat.length > 0 && (
              <>
                <h2 className="font-serif font-bold text-xl text-slate-800 mt-8">
                  Linimasa
                </h2>
                <ol className="mt-4 space-y-2 border-l-2 border-slate-200 pl-4">
                  {keadaan.naskah.riwayat.map((r, i) => (
                    <li key={i} className="text-sm">
                      <span className="font-semibold text-slate-700">
                        {r.label}
                      </span>{" "}
                      <span className="text-slate-400 text-xs">
                        {new Date(r.pada).toLocaleString("id-ID")}
                      </span>
                      {r.catatan && (
                        <span className="block text-slate-500">
                          {r.catatan}
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              </>
            )}
            <AlurPanel
              kode={kode}
              statusNaskah={keadaan.naskah.status}
              ambilToken={ambilToken}
              onStatusBerubah={muat}
            />
          </>
        ) : null}
      </section>
    </div>
  );
}

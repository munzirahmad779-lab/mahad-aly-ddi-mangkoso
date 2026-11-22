"use client";

import {
  useCallback,
  useEffect,
  useState,
  type FormEvent
} from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ambilSesiKlien } from "@/lib/jurnal/sesi-klien";
import {
  JURNAL_RECOMMENDATIONS,
  JURNAL_RECOMMENDATION_LABEL_ID,
  type JurnalAssignmentReviewerView,
  type JurnalRecommendation
} from "@/lib/jurnal/review";

// Rincian penugasan reviewer (Tahap 3): naskah anonim (judul, abstrak,
// kata kunci, bagian; tanpa identitas penulis), unduhan berkas lewat
// route berhak akses, tanggapan undangan, dan formulir telaah berisi
// rekomendasi, komentar untuk penulis, dan komentar rahasia untuk
// editor.

export default function RincianPenugasanPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [memuat, setMemuat] = useState(true);
  const [penugasan, setPenugasan] =
    useState<JurnalAssignmentReviewerView | null>(null);
  const [galat, setGalat] = useState<string | null>(null);
  const [pesan, setPesan] = useState<string | null>(null);
  const [sibuk, setSibuk] = useState(false);

  const [rekomendasi, setRekomendasi] =
    useState<JurnalRecommendation>("see_comments");
  const [komentarPenulis, setKomentarPenulis] = useState("");
  const [komentarEditor, setKomentarEditor] = useState("");

  const muat = useCallback(async () => {
    const s = await ambilSesiKlien();
    if (!s) {
      setGalat("Sesi reviewer tidak ditemukan. Silakan masuk ulang.");
      setMemuat(false);
      return;
    }
    try {
      const res = await fetch(`/api/jurnal/review/${id}`, {
        headers: { Authorization: `Bearer ${s.token}` }
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setGalat(data?.error || "Gagal memuat penugasan.");
      } else {
        setPenugasan(data.penugasan as JurnalAssignmentReviewerView);
        setGalat(null);
      }
    } catch {
      setGalat("Tidak dapat menghubungi server.");
    } finally {
      setMemuat(false);
    }
  }, [id]);

  useEffect(() => {
    void muat();
  }, [muat]);

  async function denganToken<T>(
    fn: (token: string) => Promise<T>
  ): Promise<T | null> {
    const s = await ambilSesiKlien();
    if (!s) {
      setGalat("Sesi reviewer tidak ditemukan. Silakan masuk ulang.");
      return null;
    }
    return fn(s.token);
  }

  async function tanggapi(terima: boolean) {
    setSibuk(true);
    setPesan(null);
    try {
      await denganToken(async (token) => {
        const res = await fetch(`/api/jurnal/review/${id}/tanggapi`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ terima })
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          setGalat(data?.error || "Gagal menanggapi undangan.");
          return;
        }
        setPesan(
          terima
            ? "Undangan telaah diterima. Silakan unduh berkas dan isi formulir telaah."
            : "Undangan telaah ditolak. Terima kasih atas tanggapannya."
        );
        await muat();
      });
    } finally {
      setSibuk(false);
    }
  }

  async function unduh(berkasId: string) {
    setGalat(null);
    try {
      await denganToken(async (token) => {
        const res = await fetch(
          `/api/jurnal/review/${id}/berkas/${encodeURIComponent(berkasId)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          setGalat(data?.error || "Unduhan berkas gagal.");
          return;
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "naskah-telaah";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      });
    } catch {
      setGalat("Unduhan berkas gagal.");
    }
  }

  async function serahkan(e: FormEvent) {
    e.preventDefault();
    setSibuk(true);
    setPesan(null);
    try {
      await denganToken(async (token) => {
        const res = await fetch(`/api/jurnal/review/${id}/serahkan`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            rekomendasi: rekomendasi,
            komentarPenulis,
            komentarEditor
          })
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          setGalat(data?.error || "Gagal menyerahkan telaah.");
          return;
        }
        setPesan("Telaah berhasil diserahkan kepada redaksi.");
        await muat();
      });
    } finally {
      setSibuk(false);
    }
  }

  const kelasArea =
    "w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-mahad-gold";

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8">
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <Link
          href="/jurnal/review"
          className="text-sm text-mahad-green font-semibold underline"
        >
          Kembali ke Dasbor Reviewer
        </Link>
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-800 mt-3">
          Penugasan Telaah
        </h1>

        {memuat ? (
          <p className="text-sm text-slate-500 mt-6">Memuat penugasan...</p>
        ) : galat && !penugasan ? (
          <p className="mt-4 rounded-xl border border-red-300 bg-red-50 text-red-700 text-sm px-4 py-3">
            {galat}
          </p>
        ) : penugasan ? (
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
            <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-xs font-bold text-slate-500">
                  {penugasan.kode} — Putaran {penugasan.putaran}
                </p>
                <h2 className="font-serif font-bold text-lg sm:text-xl text-slate-800 leading-snug mt-1">
                  {penugasan.judul}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {penugasan.bagianLabel}
                  {penugasan.kataKunci.length > 0
                    ? ` — Kata kunci: ${penugasan.kataKunci.join(", ")}`
                    : ""}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Naskah dikirim{" "}
                  {new Date(penugasan.naskahDikirimPada).toLocaleDateString(
                    "id-ID"
                  )}
                  {penugasan.tenggat
                    ? ` — Tenggat telaah ${new Date(penugasan.tenggat).toLocaleDateString("id-ID")}`
                    : ""}
                </p>
              </div>
              <span className="text-xs font-bold bg-mahad-gold-light text-mahad-green-dark px-3 py-1 rounded-full shrink-0">
                {penugasan.statusLabel}
              </span>
            </div>

            <p className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
              Identitas penulis tidak ditampilkan pada halaman ini dan
              tidak dikirim server kepada reviewer (double-blind).
            </p>

            <h3 className="font-serif font-bold text-base text-slate-800 mt-6">
              Abstrak
            </h3>
            <p className="text-sm text-slate-600 mt-2 whitespace-pre-line">
              {penugasan.abstrak}
            </p>
            {penugasan.abstrakEn && (
              <>
                <h3 className="font-serif font-bold text-base text-slate-800 mt-4">
                  Abstract
                </h3>
                <p className="text-sm text-slate-600 mt-2 whitespace-pre-line">
                  {penugasan.abstrakEn}
                </p>
              </>
            )}

            <h3 className="font-serif font-bold text-base text-slate-800 mt-6">
              Berkas Naskah
            </h3>
            {penugasan.berkas.length === 0 ? (
              <p className="text-sm text-slate-500 mt-2">
                Tidak ada berkas yang terlampir pada penugasan ini.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {penugasan.berkas.map((b) => (
                  <li
                    key={b.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3"
                  >
                    <span className="text-sm text-slate-600">
                      Berkas {b.kategori === "utama" ? "utama" : "pendukung"}
                      {b.tahap === "review"
                        ? ` (revisi putaran ${b.putaran ?? "-"})`
                        : ""}{" "}
                      — {(b.ukuran / 1024).toFixed(1)} KB
                    </span>
                    <button
                      onClick={() => unduh(b.id)}
                      className="text-xs font-bold bg-white border border-slate-300 hover:border-mahad-gold rounded-full px-4 py-1.5 transition"
                    >
                      Unduh Berkas
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {penugasan.status === "invited" && (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="font-serif font-bold text-base text-slate-800">
                  Tanggapi Undangan
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Terima undangan untuk mulai menelaah, atau tolak bila
                  berhalangan supaya redaksi dapat menugaskan reviewer lain.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={() => tanggapi(true)}
                    disabled={sibuk}
                    className="bg-mahad-gold hover:bg-yellow-400 disabled:opacity-60 text-mahad-green-dark font-bold text-sm px-6 py-2.5 rounded-full shadow transition"
                  >
                    Terima Undangan
                  </button>
                  <button
                    onClick={() => tanggapi(false)}
                    disabled={sibuk}
                    className="bg-white border border-slate-300 hover:border-red-300 disabled:opacity-60 font-bold text-sm px-6 py-2.5 rounded-full transition"
                  >
                    Tolak Undangan
                  </button>
                </div>
              </div>
            )}

            {(penugasan.status === "invited" ||
              penugasan.status === "accepted") && (
              <form
                onSubmit={serahkan}
                className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-4"
              >
                <h3 className="font-serif font-bold text-base text-slate-800">
                  Formulir Telaah
                </h3>
                <fieldset>
                  <legend className="text-sm font-semibold text-slate-700 mb-2">
                    Rekomendasi
                  </legend>
                  <div className="space-y-2">
                    {JURNAL_RECOMMENDATIONS.map((r) => (
                      <label
                        key={r}
                        htmlFor={`rek-${r}`}
                        className="flex items-center gap-2 text-sm text-slate-600"
                      >
                        <input
                          id={`rek-${r}`}
                          type="radio"
                          name="rekomendasi"
                          value={r}
                          checked={rekomendasi === r}
                          onChange={() =>
                            setRekomendasi(r as JurnalRecommendation)
                          }
                        />
                        {JURNAL_RECOMMENDATION_LABEL_ID[r]}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div>
                  <label
                    htmlFor="komentar-penulis"
                    className="block text-sm font-semibold text-slate-700 mb-1"
                  >
                    Komentar untuk Penulis
                  </label>
                  <textarea
                    id="komentar-penulis"
                    rows={5}
                    value={komentarPenulis}
                    onChange={(e) => setKomentarPenulis(e.target.value)}
                    className={kelasArea}
                    placeholder="Komentar ini diteruskan kepada penulis tanpa nama Anda."
                  />
                </div>
                <div>
                  <label
                    htmlFor="komentar-editor"
                    className="block text-sm font-semibold text-slate-700 mb-1"
                  >
                    Komentar Rahasia untuk Editor
                  </label>
                  <textarea
                    id="komentar-editor"
                    rows={3}
                    value={komentarEditor}
                    onChange={(e) => setKomentarEditor(e.target.value)}
                    className={kelasArea}
                    placeholder="Komentar ini hanya dibaca editor dan tidak diteruskan kepada penulis."
                  />
                </div>
                <button
                  type="submit"
                  disabled={sibuk}
                  className="bg-mahad-gold hover:bg-yellow-400 disabled:opacity-60 text-mahad-green-dark font-bold text-sm px-6 py-2.5 rounded-full shadow transition"
                >
                  {sibuk ? "Mengirim..." : "Serahkan Telaah"}
                </button>
              </form>
            )}

            {penugasan.status === "completed" && (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 space-y-2">
                <h3 className="font-serif font-bold text-base text-slate-800">
                  Telaah Sudah Diserahkan
                </h3>
                <p className="text-sm text-slate-600">
                  Rekomendasi Anda:{" "}
                  <strong>
                    {penugasan.rekomendasiLabel ?? penugasan.rekomendasi}
                  </strong>
                  {penugasan.diserahkanPada
                    ? ` — diserahkan ${new Date(penugasan.diserahkanPada).toLocaleString("id-ID")}`
                    : ""}
                </p>
                {penugasan.komentarPenulis && (
                  <p className="text-sm text-slate-600 whitespace-pre-line">
                    <strong>Komentar untuk penulis:</strong>{" "}
                    {penugasan.komentarPenulis}
                  </p>
                )}
                {penugasan.komentarEditor && (
                  <p className="text-sm text-slate-600 whitespace-pre-line">
                    <strong>Komentar untuk editor:</strong>{" "}
                    {penugasan.komentarEditor}
                  </p>
                )}
              </div>
            )}
          </>
        ) : null}
      </section>
    </div>
  );
}

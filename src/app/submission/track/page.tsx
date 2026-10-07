"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  User, 
  BookOpen, 
  Tag, 
  ArrowRight,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  RefreshCw
} from "lucide-react";

interface TimelineEvent {
  status: string;
  date: string;
  note: string;
}

interface TrackData {
  id: string;
  trackingCode: string;
  judul: string;
  nama: string;
  afiliasi: string;
  tipeNaskah: string;
  kategori: string;
  fileName: string;
  fileSize: string;
  status: "submitted" | "under_review" | "revision" | "accepted" | "rejected" | "published";
  feedback?: string;
  submittedAt: string;
  updatedAt: string;
  timeline: TimelineEvent[];
}

function TrackingContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("kode") || "";

  const [trackingCodeInput, setTrackingCodeInput] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TrackData | null>(null);

  const fetchTracking = async (codeToQuery: string) => {
    const cleanCode = codeToQuery.trim().toUpperCase();
    if (!cleanCode) {
      setError("Masukkan kode tracking naskah Anda (contoh: MAD-2026-0001).");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/submission/track?kode=${encodeURIComponent(cleanCode)}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Naskah dengan kode tersebut tidak ditemukan.");
      }

      setResult(data.data);
    } catch (err: any) {
      setError(err.message || "Gagal memuat status pelacakan naskah.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode) {
      setTrackingCodeInput(initialCode);
      fetchTracking(initialCode);
    }
  }, [initialCode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracking(trackingCodeInput);
  };

  const getStatusStepIndex = (status: string) => {
    switch (status) {
      case "submitted":
        return 1;
      case "under_review":
        return 2;
      case "revision":
      case "accepted":
      case "rejected":
        return 3;
      case "published":
        return 4;
      default:
        return 1;
    }
  };

  const currentStep = result ? getStatusStepIndex(result.status) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-mahad-gold bg-emerald-950/80 px-3.5 py-1.5 rounded-full inline-block border border-emerald-800">
          Layanan Penulis &amp; Mahasantri
        </span>
        <h1 className="font-serif font-bold text-3xl sm:text-4xl text-slate-900">
          Pelacakan Status Naskah
        </h1>
        <p className="text-slate-600 text-sm max-w-xl mx-auto">
          Pantau transparansi proses telaah dewan redaksi atas naskah risalah atau artikel ilmiah yang telah Anda kirimkan.
        </p>
      </div>

      {/* Form Input Pelacakan */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={trackingCodeInput}
              onChange={(e) => setTrackingCodeInput(e.target.value.toUpperCase())}
              placeholder="Masukkan Kode Pelacakan (Contoh: MAD-2026-0001)..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-mahad-green-dark hover:bg-emerald-800 text-white font-bold rounded-xl shadow transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Mencari Data...</span>
              </>
            ) : (
              <>
                <span>Lacak Status</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Detail Hasil Pelacakan */}
      {result && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
          
          {/* Header Kartu Naskah */}
          <div className="p-6 sm:p-8 bg-slate-50/70 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">KODE TRACKING:</span>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-900 font-mono font-bold text-sm rounded-lg border border-emerald-200">
                  {result.trackingCode}
                </span>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Diajukan pada: {new Date(result.submittedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>

            <h2 className="font-serif font-bold text-xl sm:text-2xl text-emerald-950 leading-snug">
              {result.judul}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 pt-2 border-t border-slate-200/80">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-700 shrink-0" />
                <span><strong>Penulis:</strong> {result.nama} {result.afiliasi ? `(${result.afiliasi})` : ""}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-700 shrink-0" />
                <span><strong>Tipe:</strong> {result.tipeNaskah}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-700 shrink-0" />
                <span><strong>Kategori:</strong> {result.kategori}</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between text-xs text-emerald-900">
              <span className="flex items-center gap-2 font-medium">
                <FileText className="w-4 h-4 text-emerald-700" />
                Berkas Terlampir: <strong>{result.fileName || "Dokumen Word (.docx)"}</strong> {result.fileSize ? `(${result.fileSize})` : ""}
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                ✓ Aman di Email Redaksi
              </span>
            </div>
          </div>

          {/* Stepper Status Visual */}
          <div className="p-6 sm:p-8 space-y-6">
            <h3 className="font-serif font-bold text-base text-slate-900">
              Tahapan Penelaahan Redaksi:
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {/* Step 1: Submitted */}
              <div className={`p-4 rounded-xl border transition ${
                currentStep >= 1 ? "bg-emerald-50 border-emerald-300 text-emerald-950" : "bg-slate-50 border-slate-200 text-slate-400"
              }`}>
                <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center font-bold text-xs mb-2 ${
                  currentStep >= 1 ? "bg-emerald-700 text-white" : "bg-slate-200 text-slate-500"
                }`}>
                  1
                </div>
                <h4 className="font-bold text-xs">Naskah Diterima</h4>
                <p className="text-[10px] text-slate-500 mt-1">Lampiran terkirim ke email redaksi</p>
              </div>

              {/* Step 2: Under Review */}
              <div className={`p-4 rounded-xl border transition ${
                currentStep >= 2 ? "bg-emerald-50 border-emerald-300 text-emerald-950" : "bg-slate-50 border-slate-200 text-slate-400"
              }`}>
                <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center font-bold text-xs mb-2 ${
                  currentStep >= 2 ? "bg-emerald-700 text-white" : "bg-slate-200 text-slate-500"
                }`}>
                  2
                </div>
                <h4 className="font-bold text-xs">Telaah Redaksi</h4>
                <p className="text-[10px] text-slate-500 mt-1">Review kesesuaian Fiqh &amp; Turats</p>
              </div>

              {/* Step 3: Keputusan (Revisi / Diterima / Ditolak) */}
              <div className={`p-4 rounded-xl border transition ${
                result.status === "revision" 
                  ? "bg-amber-50 border-amber-300 text-amber-950"
                  : result.status === "rejected"
                  ? "bg-rose-50 border-rose-300 text-rose-950"
                  : currentStep >= 3
                  ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                  : "bg-slate-50 border-slate-200 text-slate-400"
              }`}>
                <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center font-bold text-xs mb-2 ${
                  result.status === "revision"
                    ? "bg-amber-600 text-white"
                    : result.status === "rejected"
                    ? "bg-rose-600 text-white"
                    : currentStep >= 3
                    ? "bg-emerald-700 text-white"
                    : "bg-slate-200 text-slate-500"
                }`}>
                  3
                </div>
                <h4 className="font-bold text-xs">
                  {result.status === "revision" ? "Perlu Revisi" : result.status === "rejected" ? "Belum Lolos" : "Disetujui"}
                </h4>
                <p className="text-[10px] text-slate-500 mt-1">Keputusan dewan redaksi</p>
              </div>

              {/* Step 4: Published */}
              <div className={`p-4 rounded-xl border transition ${
                result.status === "published" ? "bg-emerald-50 border-emerald-300 text-emerald-950" : "bg-slate-50 border-slate-200 text-slate-400"
              }`}>
                <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center font-bold text-xs mb-2 ${
                  result.status === "published" ? "bg-emerald-700 text-white" : "bg-slate-200 text-slate-500"
                }`}>
                  4
                </div>
                <h4 className="font-bold text-xs">Diterbitkan</h4>
                <p className="text-[10px] text-slate-500 mt-1">Tayang di portal resmi</p>
              </div>
            </div>

            {/* Kotak Feedback Redaksi */}
            {result.feedback && (
              <div className={`p-5 rounded-2xl border ${
                result.status === "revision"
                  ? "bg-amber-50/80 border-amber-200 text-amber-950"
                  : result.status === "rejected"
                  ? "bg-rose-50/80 border-rose-200 text-rose-950"
                  : "bg-slate-50 border-slate-200 text-slate-800"
              }`}>
                <h4 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" />
                  Catatan &amp; Feedback Dewan Redaksi:
                </h4>
                <p className="text-xs leading-relaxed whitespace-pre-line">
                  {result.feedback}
                </p>
              </div>
            )}

            {/* Jika Diterima (ACC Tahap 2) */}
            {result.status === "accepted" && (
              <div className="p-5 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded uppercase tracking-wider">
                    Tahap 2 Terbuka
                  </span>
                  <h4 className="font-serif font-bold text-emerald-950 text-sm mt-1">
                    Selamat! Abstrak Anda Telah Disetujui (ACC)
                  </h4>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Silakan lanjutkan pengisian Naskah Lengkap (Full Paper) menggunakan Kode Akses Anda.
                  </p>
                </div>
                <Link
                  href={`/submission/full-paper?kode=${result.trackingCode}&nama=${encodeURIComponent(result.nama)}`}
                  className="px-5 py-2.5 bg-mahad-green-dark hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm shrink-0"
                >
                  <span>Buka Formulir Full Paper</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* Jika Diterbitkan */}
            {result.status === "published" && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-emerald-900 text-xs">Alhamdulillah! Artikel Anda Telah Terbit</h4>
                  <p className="text-[11px] text-emerald-700">Karya Anda kini dapat dibaca oleh publik pada Mimbar Kajian.</p>
                </div>
                <Link
                  href="/artikel"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                >
                  <span>Baca Mimbar Kajian</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* Riwayat Timeline Lengkap */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Riwayat Aktivitas Naskah:
              </h4>
              <div className="space-y-3">
                {result.timeline && result.timeline.length > 0 ? (
                  result.timeline.map((evt, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs">
                      <div className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0"></div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{evt.note}</p>
                        <span className="text-[10px] text-slate-400">
                          {new Date(evt.date).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">Belum ada riwayat aktivitas tambahan.</p>
                )}
              </div>
            </div>

          </div>

          {/* Bantuan Redaksi */}
          <div className="p-6 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-600 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              Dewan Redaksi Ma&apos;had Aly DDI Mangkoso menjamin integritas sanad &amp; orisinalitas riset.
            </span>
            <Link
              href="/kirim-tulisan"
              className="text-emerald-800 font-bold hover:underline"
            >
              Kirim Naskah Baru Lainnya &rarr;
            </Link>
          </div>

        </div>
      )}
    </div>
  );
}

export default function SubmissionTrackPage() {
  return (
    <main className="min-h-screen pt-28 pb-20 bg-slate-50">
      <Suspense fallback={
        <div className="max-w-4xl mx-auto py-24 text-center">
          <div className="w-8 h-8 border-4 border-emerald-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-slate-600">Memuat modul pelacakan naskah...</p>
        </div>
      }>
        <TrackingContent />
      </Suspense>
    </main>
  );
}

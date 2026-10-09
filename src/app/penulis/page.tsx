"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useArticles } from "@/context/ArticleContext";
import { Submission, Article } from "@/lib/types";
import {
  FileText,
  Key,
  User,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  BookOpen,
  Send,
  MessageSquare,
  LogOut,
  ArrowRight,
  ShieldAlert,
  Edit3
} from "lucide-react";

export default function PenulisDashboardPage() {
  const { submissions, articles, updateSubmissionStatus } = useArticles();

  // Auth State
  const [authorName, setAuthorName] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState<"submission" | "artikel" | "profil">("submission");

  // Selected submission for detail / reply
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [replyNote, setReplyNote] = useState("");
  const [replySuccess, setReplySuccess] = useState(false);

  // Filtered lists for the logged in author
  const authorSubmissions = submissions.filter((s) => {
    if (!authorName) return false;
    return s.nama.trim().toLowerCase() === authorName.trim().toLowerCase() ||
           s.nama.trim().toLowerCase().includes(authorName.trim().toLowerCase());
  });

  const authorArticles = articles.filter((a) => {
    if (!authorName) return false;
    return a.author.trim().toLowerCase() === authorName.trim().toLowerCase() ||
           a.author.trim().toLowerCase().includes(authorName.trim().toLowerCase());
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    const trimmedCode = accessCode.trim().toUpperCase();
    const trimmedName = authorName.trim().toLowerCase();

    const found = submissions.find((s) => {
      const matchCode = (s.accessCode && s.accessCode.toUpperCase() === trimmedCode) ||
                        (s.trackingCode && s.trackingCode.toUpperCase() === trimmedCode);
      const matchName = s.nama.trim().toLowerCase() === trimmedName ||
                        s.nama.trim().toLowerCase().includes(trimmedName);
      return matchCode && matchName;
    });

    if (!found) {
      setAuthError("Nama penulis atau kode tidak ditemukan. Gunakan Nama Lengkap saat pengiriman dan Kode Tracking atau Kode Akses Tahap 2 Anda.");
      return;
    }

    setIsLoggedIn(true);
    setSelectedSubId(found.id);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAuthorName("");
    setAccessCode("");
    setSelectedSubId(null);
  };

  const handleSendReply = async (subId: string) => {
    if (!replyNote.trim()) return;
    const target = submissions.find((s) => s.id === subId);
    if (!target) return;

    const formattedNote = `[Catatan Penulis]: ${replyNote.trim()}`;
    await updateSubmissionStatus(subId, target.status, formattedNote);
    setReplyNote("");
    setReplySuccess(true);
    setTimeout(() => setReplySuccess(false), 3000);
  };

  const getStatusBadge = (status: Submission["status"]) => {
    switch (status) {
      case "published":
      case "publish":
        return <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-bold">Terbit</span>;
      case "accepted":
        return <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-bold">ACC / Diterima</span>;
      case "revision":
      case "revisi":
        return <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-bold">Perlu Revisi</span>;
      case "rejected":
        return <span className="bg-rose-100 text-rose-800 text-xs px-2.5 py-1 rounded-full font-bold">Ditolak</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-full font-bold">Dalam Telaah</span>;
    }
  };

  return (
    <main className="pt-36 md:pt-40 pb-20 bg-slate-50 min-h-screen">
      {/* Header Bar */}
      <section className="bg-mahad-green-dark text-white py-12 bg-islamic-pattern">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-mahad-gold bg-emerald-950/70 border border-emerald-800 px-3 py-1 rounded-full">
                Portal Kontributor &amp; Mahasantri
              </span>
              <h1 className="font-serif font-bold text-2xl sm:text-3xl text-white mt-2">
                Dashboard Penulis
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100 mt-1">
                Kelola naskah, pantau catatan telaah redaksi, dan lihat riwayat artikel Anda di Ma&apos;had Aly DDI Mangkoso.
              </p>
            </div>
            {isLoggedIn && (
              <div className="flex items-center gap-3">
                <div className="bg-emerald-950/80 border border-emerald-800 px-3 py-2 rounded-xl text-right">
                  <p className="text-xs font-bold text-white">{authorName}</p>
                  <span className="text-[10px] text-mahad-gold">Penulis Terverifikasi</span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 bg-emerald-900 hover:bg-rose-900/60 text-white rounded-xl text-xs transition flex items-center gap-1 border border-emerald-700"
                  title="Keluar"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {!isLoggedIn ? (
          /* LOGIN FORM */
          <div className="max-w-md mx-auto bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-mahad-green-dark mx-auto flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <h2 className="font-serif font-bold text-xl text-slate-800">Masuk ke Ruang Penulis</h2>
              <p className="text-xs text-slate-500">
                Masukkan Nama Penulis dan Kode Naskah (Tracking Code atau Kode Akses) untuk membuka dashboard karya Anda.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Nama Lengkap Penulis</span>
                </label>
                <input
                  type="text"
                  required
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Nama saat mengajukan naskah"
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Kode Tracking / Kode Akses</span>
                </label>
                <input
                  type="text"
                  required
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="Contoh: MAD-2026-XXXX atau MAD2-2026-XXXX"
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono uppercase tracking-wider focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
              </div>

              {authError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-mahad-green-dark hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow transition flex items-center justify-center gap-2"
              >
                <span>Masuk Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500 space-y-1">
              <p>Belum mengirimkan naskah karya ilmiah atau opini?</p>
              <Link href="/kirim-tulisan" className="text-emerald-700 font-bold hover:underline inline-block">
                Kirim Naskah Baru &rarr;
              </Link>
            </div>
          </div>
        ) : (
          /* DASHBOARD INTERFACE */
          <div className="space-y-6">
            
            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab("submission")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeTab === "submission"
                    ? "bg-mahad-green-dark text-white shadow-sm"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Submission Saya ({authorSubmissions.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("artikel")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeTab === "artikel"
                    ? "bg-mahad-green-dark text-white shadow-sm"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Artikel Terbit ({authorArticles.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("profil")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeTab === "profil"
                    ? "bg-mahad-green-dark text-white shadow-sm"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Profil Penulis</span>
              </button>
            </div>

            {/* TAB: SUBMISSION SAYA */}
            {activeTab === "submission" && (
              <div className="space-y-4">
                {authorSubmissions.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                    Belum ada naskah yang diajukan dengan nama ini.
                  </div>
                ) : (
                  authorSubmissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                            {sub.trackingCode}
                          </span>
                          {getStatusBadge(sub.status)}
                        </div>
                        <span className="text-[11px] text-slate-400">Diajukan: {sub.tanggal}</span>
                      </div>

                      <div>
                        <h3 className="font-serif font-bold text-lg text-slate-900">{sub.judul}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Tipe: <strong>{sub.tipeNaskah || "Artikel Ilmiah"}</strong> &bull; Kategori: {sub.kategori}
                        </p>
                      </div>

                      {/* Abstrak */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                        <span className="font-bold text-slate-800 block">Abstrak Ringkas:</span>
                        <p className="line-clamp-3 italic leading-relaxed">{sub.abstrak}</p>
                      </div>

                      {/* Catatan / Feedback Redaksi */}
                      {sub.feedback && (
                        <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-xl text-xs text-amber-900 space-y-1">
                          <span className="font-bold flex items-center gap-1.5">
                            <MessageSquare className="w-4 h-4 text-amber-600" />
                            <span>Catatan Redaksi Ma&apos;had Aly:</span>
                          </span>
                          <p className="leading-relaxed">{sub.feedback}</p>
                        </div>
                      )}

                      {/* Action Links */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          {sub.accessCode && (
                            <Link
                              href={`/submission/full-paper?kode=${sub.accessCode}&nama=${encodeURIComponent(sub.nama)}`}
                              className="px-4 py-2 bg-mahad-green-dark hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Buka Formulir Full Paper (Tahap 2)</span>
                            </Link>
                          )}
                          <Link
                            href={`/submission/track?kode=${sub.trackingCode}`}
                            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1"
                          >
                            <span>Lacak Timeline</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>

                        {/* Balas Catatan Redaksi */}
                        <div className="w-full sm:w-auto flex items-center gap-2 mt-2 sm:mt-0">
                          <input
                            type="text"
                            value={selectedSubId === sub.id ? replyNote : ""}
                            onChange={(e) => {
                              setSelectedSubId(sub.id);
                              setReplyNote(e.target.value);
                            }}
                            placeholder="Ketik balasan untuk redaksi..."
                            className="p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl flex-1 sm:w-60 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                          />
                          <button
                            type="button"
                            onClick={() => handleSendReply(sub.id)}
                            className="p-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {replySuccess && selectedSubId === sub.id && (
                        <p className="text-[11px] text-emerald-700 font-bold">Catatan berhasil diteruskan ke redaksi.</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB: ARTIKEL TERBIT */}
            {activeTab === "artikel" && (
              <div className="space-y-4">
                {authorArticles.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                    Belum ada artikel yang diterbitkan atas nama ini.
                  </div>
                ) : (
                  authorArticles.map((art) => (
                    <div
                      key={art.id}
                      className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                          <span className="font-bold text-emerald-800">{art.categoryLabel}</span>
                          <span>&bull;</span>
                          <span>{art.date}</span>
                        </div>
                        <h3 className="font-serif font-bold text-lg text-slate-900">{art.title}</h3>
                        <p className="text-xs text-slate-600 line-clamp-2 mt-1">{art.excerpt}</p>
                      </div>
                      <Link
                        href={art.type === "opini" ? `/opini/${art.slug}` : `/artikel/${art.slug}`}
                        className="px-4 py-2 bg-mahad-green-dark text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition shrink-0 flex items-center gap-1.5"
                      >
                        <span>Lihat Publikasi</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB: PROFIL PENULIS */}
            {activeTab === "profil" && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 max-w-lg">
                <h3 className="font-serif font-bold text-lg text-slate-800">Profil &amp; Afiliasi Penulis</h3>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 block font-bold uppercase text-[10px]">Nama Lengkap</span>
                    <p className="font-bold text-slate-800 text-sm">{authorName}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold uppercase text-[10px]">Status Penulis</span>
                    <p className="text-emerald-700 font-semibold">Kontributor Terdaftar</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold uppercase text-[10px]">Total Naskah Diajukan</span>
                    <p className="text-slate-700">{authorSubmissions.length} Naskah</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold uppercase text-[10px]">Total Karya Diterbitkan</span>
                    <p className="text-slate-700">{authorArticles.length} Artikel</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </main>
  );
}

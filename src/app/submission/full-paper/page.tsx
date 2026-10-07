"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useArticles } from "@/context/ArticleContext";
import { Submission, SubmissionSection } from "@/lib/types";
import {
  FileText,
  Key,
  User,
  CheckCircle2,
  AlertCircle,
  Save,
  Send,
  Eye,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  ArrowLeft,
  BookOpen,
  Info,
  Clock,
  Sparkles
} from "lucide-react";

const DEFAULT_SECTIONS: SubmissionSection[] = [
  { id: "sec-1", title: "Pendahuluan", content: "" },
  { id: "sec-2", title: "Metode Penelitian", content: "" },
  { id: "sec-3", title: "Penelitian Terdahulu", content: "" },
  { id: "sec-4", title: "Pembahasan & Diskusi Fiqh", content: "" },
  { id: "sec-5", title: "Kesimpulan", content: "" },
  { id: "sec-6", title: "Daftar Pustaka", content: "" },
];

export default function FullPaperSubmissionPage() {
  const { submissions, saveSubmissionFullPaper } = useArticles();

  // Authentication State
  const [authorName, setAuthorName] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeSubmission, setActiveSubmission] = useState<Submission | null>(null);
  const [authError, setAuthError] = useState("");

  // Editor State
  const [sections, setSections] = useState<SubmissionSection[]>(DEFAULT_SECTIONS);
  const [footnotes, setFootnotes] = useState("");
  const [wordFileLink, setWordFileLink] = useState("");
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [autoSaveNotice, setAutoSaveNotice] = useState(false);

  // Check query params if any
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const codeParam = params.get("kode");
      const nameParam = params.get("nama");
      if (codeParam) setAccessCode(codeParam);
      if (nameParam) setAuthorName(nameParam);
    }
  }, []);

  // Try auto-login if match found in submissions
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
      setAuthError("Nama penulis atau kode akses tidak cocok. Pastikan kode akses Tahap 2 (MAD2-YYYY-XXXX) valid dan sesuai dengan email persetujuan.");
      return;
    }

    setActiveSubmission(found);
    setIsLoggedIn(true);

    // Load existing fullPaper if available
    if (found.fullPaper && found.fullPaper.sections && found.fullPaper.sections.length > 0) {
      setSections(found.fullPaper.sections);
      setFootnotes(found.fullPaper.footnotes || "");
      setWordFileLink(found.fullPaper.wordAttachmentUrl || "");
      if (found.fullPaper.lastSaved) {
        setLastSavedTime(found.fullPaper.lastSaved);
      }
    } else {
      // Check localStorage draft
      const localKey = `mahad_draft_${found.id}`;
      const savedDraft = localStorage.getItem(localKey);
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          if (parsed.sections) setSections(parsed.sections);
          if (parsed.footnotes) setFootnotes(parsed.footnotes);
        } catch {}
      }
    }
  };

  // Section manipulation
  const handleSectionTitleChange = (id: string, newTitle: string) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, title: newTitle } : s)));
  };

  const handleSectionContentChange = (id: string, newContent: string) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, content: newContent } : s)));
  };

  const addCustomSection = () => {
    const newId = "sec-" + Date.now().toString();
    setSections((prev) => [...prev, { id: newId, title: "Bagian Baru", content: "" }]);
  };

  const removeSection = (id: string) => {
    if (sections.length <= 1) return;
    setSections((prev) => prev.filter((s) => s.id !== id));
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;
    const newSecs = [...sections];
    const temp = newSecs[index];
    newSecs[index] = newSecs[targetIndex];
    newSecs[targetIndex] = temp;
    setSections(newSecs);
  };

  // Auto-Save Effect
  useEffect(() => {
    if (!isLoggedIn || !activeSubmission) return;

    const timer = setTimeout(() => {
      const now = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
      const payload = {
        sections,
        footnotes,
        wordAttachmentUrl: wordFileLink,
        lastSaved: now
      };
      localStorage.setItem(`mahad_draft_${activeSubmission.id}`, JSON.stringify(payload));
      setLastSavedTime(now);
      setAutoSaveNotice(true);
      setTimeout(() => setAutoSaveNotice(false), 2500);
    }, 1500);

    return () => clearTimeout(timer);
  }, [sections, footnotes, wordFileLink, isLoggedIn, activeSubmission]);

  // Submit Full Paper
  const handleSubmitFullPaper = async () => {
    if (!activeSubmission) return;

    // Check that at least first 2 sections have content
    const emptyCount = sections.filter((s) => !s.content.trim()).length;
    if (emptyCount === sections.length) {
      alert("Harap isi naskah lengkap sebelum mengirimkan naskah!");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await saveSubmissionFullPaper(activeSubmission.id, {
        sections,
        footnotes,
        wordAttachmentUrl: wordFileLink,
        lastSaved: new Date().toLocaleTimeString("id-ID"),
        submittedAt: new Date().toISOString()
      });

      if (res.success) {
        setSubmitSuccess(true);
      } else {
        alert("Gagal menyimpan naskah lengkap. Silakan coba kembali.");
      }
    } catch (e: any) {
      alert("Terjadi kendala saat menyimpan naskah: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="pt-28 pb-20 bg-slate-50 min-h-screen">
      {/* Header Bar */}
      <section className="bg-mahad-green-dark text-white py-12 bg-islamic-pattern">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <Link
                href="/kirim-tulisan"
                className="inline-flex items-center gap-1.5 text-xs text-mahad-gold-light hover:text-mahad-gold mb-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Informasi Pengiriman</span>
              </Link>
              <h1 className="font-serif font-bold text-2xl sm:text-3xl text-white flex items-center gap-2">
                <span>Formulir Naskah Lengkap (Tahap 2)</span>
                <span className="text-xs font-mono font-normal bg-mahad-gold/20 text-mahad-gold border border-mahad-gold/40 px-2.5 py-0.5 rounded-full">
                  Full Paper
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100 mt-1">
                Portal khusus penulis yang abstraknya telah disetujui (ACC) oleh Dewan Redaksi Ma&apos;had Aly DDI Mangkoso.
              </p>
            </div>
            {isLoggedIn && (
              <div className="bg-emerald-950/80 border border-emerald-800 p-3 rounded-xl text-right">
                <span className="text-[10px] text-mahad-gold block uppercase tracking-wider font-bold">Penulis Aktif</span>
                <p className="text-xs font-bold text-white truncate max-w-[200px]">{activeSubmission?.nama}</p>
                <span className="text-[10px] text-emerald-300 font-mono">{activeSubmission?.accessCode || activeSubmission?.trackingCode}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {!isLoggedIn ? (
          /* LOGIN AUTHOR BOX */
          <div className="max-w-md mx-auto bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-mahad-green-dark mx-auto flex items-center justify-center">
                <Key className="w-6 h-6" />
              </div>
              <h2 className="font-serif font-bold text-xl text-slate-800">Autentikasi Naskah Tahap 2</h2>
              <p className="text-xs text-slate-500">
                Masukkan nama lengkap Anda dan Kode Akses Tahap 2 yang telah dikirimkan redaksi melalui email pemberitahuan ACC.
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
                  placeholder="Nama sesuai saat submit abstrak"
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Kode Akses Tahap 2 (MAD2-YYYY-XXXX)</span>
                </label>
                <input
                  type="text"
                  required
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="Contoh: MAD2-2026-8821"
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
                <span>Buka Formulir Full Paper</span>
                <BookOpen className="w-4 h-4" />
              </button>
            </form>

            <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
              <span>Belum punya kode akses? Pantau status telaah di </span>
              <Link href="/submission/track" className="text-emerald-700 font-bold hover:underline">
                Halaman Tracking
              </Link>
            </div>
          </div>
        ) : submitSuccess ? (
          /* SUBMIT SUCCESS BANNER */
          <div className="bg-white rounded-2xl p-8 border border-emerald-200 text-center shadow-sm space-y-4 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center text-3xl">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="font-serif font-bold text-2xl text-slate-900">Naskah Lengkap Berhasil Dikirimkan!</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Alhamdulillah, naskah lengkap (Full Paper) karya <strong>{activeSubmission?.nama}</strong> dengan judul:
              <br />
              <span className="italic font-bold text-slate-800">&ldquo;{activeSubmission?.judul}&rdquo;</span>
              <br />
              telah diterima oleh Dewan Redaksi untuk proses finalisasi telaah dan penerbitan.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <Link
                href={`/submission/track?kode=${activeSubmission?.trackingCode}`}
                className="px-6 py-2.5 bg-mahad-green-dark text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition"
              >
                Pantau Status Terbit
              </Link>
              <button
                type="button"
                onClick={() => setSubmitSuccess(false)}
                className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition"
              >
                Edit Kembali Naskah
              </button>
            </div>
          </div>
        ) : (
          /* EDITOR / FULL PAPER FORM */
          <div className="space-y-6">
            
            {/* Metadata Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-mahad-green-dark bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    {activeSubmission?.tipeNaskah || "Artikel Ilmiah"}
                  </span>
                  <span className="text-xs text-slate-400">&bull;</span>
                  <span className="text-xs text-slate-600 font-medium">Kategori: {activeSubmission?.kategori}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  {autoSaveNotice ? (
                    <span className="text-emerald-600 font-medium flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Draft tersimpan otomatis</span>
                    </span>
                  ) : lastSavedTime ? (
                    <span className="flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3" />
                      <span>Tersimpan {lastSavedTime}</span>
                    </span>
                  ) : null}
                </div>
              </div>

              <div>
                <h2 className="font-serif font-bold text-xl sm:text-2xl text-slate-900">
                  {activeSubmission?.judul}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Oleh: <strong>{activeSubmission?.nama}</strong> {activeSubmission?.afiliasi ? `(${activeSubmission.afiliasi})` : ""}
                </p>
              </div>

              {/* Feedback Note from Admin if any */}
              {activeSubmission?.feedback && (
                <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-xl text-xs text-amber-900 space-y-1">
                  <span className="font-bold flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-amber-600" />
                    <span>Catatan Telaah Dewan Redaksi:</span>
                  </span>
                  <p className="italic leading-relaxed">{activeSubmission.feedback}</p>
                </div>
              )}
            </div>

            {/* Controls Bar */}
            <div className="flex items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewMode(!previewMode)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    previewMode
                      ? "bg-emerald-800 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{previewMode ? "Mode Sunting" : "Pratinjau (Preview)"}</span>
                </button>
                <button
                  type="button"
                  onClick={addCustomSection}
                  className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-mahad-green-dark border border-emerald-200 rounded-lg text-xs font-bold transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Bab / Bagian</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleSubmitFullPaper}
                disabled={isSubmitting}
                className="px-5 py-2 bg-mahad-green-dark hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? "Menyimpan..." : "Kirimkan Naskah Lengkap"}</span>
              </button>
            </div>

            {previewMode ? (
              /* PREVIEW MODE */
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-8">
                <div className="text-center space-y-2 border-b border-slate-200 pb-6">
                  <span className="text-xs font-mono text-mahad-gold bg-mahad-green-dark px-3 py-1 rounded-full uppercase tracking-wider">
                    {activeSubmission?.tipeNaskah || "Artikel Ilmiah"}
                  </span>
                  <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900 mt-2">
                    {activeSubmission?.judul}
                  </h1>
                  <p className="text-sm text-slate-600">
                    <strong>{activeSubmission?.nama}</strong>
                  </p>
                  <p className="text-xs text-slate-400">{activeSubmission?.afiliasi}</p>
                </div>

                {/* Abstrak Box */}
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
                  <span className="font-bold uppercase tracking-wider text-slate-900 block font-serif">Abstrak</span>
                  <p className="leading-relaxed italic">{activeSubmission?.abstrak}</p>
                  {activeSubmission?.keywords && (
                    <p className="pt-2 font-mono text-[11px] text-emerald-800">
                      <strong>Kata Kunci:</strong> {activeSubmission.keywords}
                    </p>
                  )}
                </div>

                {/* Render Each Section */}
                <div className="space-y-6">
                  {sections.map((sec, idx) => (
                    <section key={sec.id} className="space-y-2">
                      <h3 className="font-serif font-bold text-lg text-mahad-green-dark border-b border-emerald-100 pb-1">
                        {idx + 1}. {sec.title}
                      </h3>
                      <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                        {sec.content.trim() ? (
                          sec.content
                        ) : (
                          <span className="italic text-slate-400">Bagian ini belum diisi konten.</span>
                        )}
                      </div>
                    </section>
                  ))}
                </div>

                {/* Footnotes */}
                {footnotes && (
                  <div className="pt-6 border-t border-slate-200">
                    <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-slate-800 mb-2">
                      Catatan Kaki (Footnotes) &amp; Referensi Tambahan:
                    </h4>
                    <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed font-serif bg-slate-50 p-4 rounded-xl border border-slate-200">
                      {footnotes}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* SECTIONS EDITOR */
              <div className="space-y-4">
                {sections.map((sec, index) => (
                  <div
                    key={sec.id}
                    className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-3 transition hover:border-emerald-300"
                  >
                    {/* Section Header Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="w-6 h-6 rounded-full bg-mahad-green-dark text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <input
                          type="text"
                          value={sec.title}
                          onChange={(e) => handleSectionTitleChange(sec.id, e.target.value)}
                          className="font-serif font-bold text-sm sm:text-base text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-700 focus:outline-none flex-1 px-1"
                        />
                      </div>

                      {/* Move / Delete Actions */}
                      <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => moveSection(index, "up")}
                          disabled={index === 0}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded disabled:opacity-30"
                          title="Geser ke atas"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveSection(index, "down")}
                          disabled={index === sections.length - 1}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded disabled:opacity-30"
                          title="Geser ke bawah"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSection(sec.id)}
                          disabled={sections.length <= 1}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded disabled:opacity-30 ml-1"
                          title="Hapus bagian ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Section Textarea */}
                    <div>
                      <textarea
                        rows={7}
                        value={sec.content}
                        onChange={(e) => handleSectionContentChange(sec.id, e.target.value)}
                        placeholder={`Tuliskan uraian ${sec.title} di sini...`}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 leading-relaxed focus:bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                      />
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 px-1">
                        <span>{sec.content.length} karakter &bull; {sec.content.trim() ? sec.content.trim().split(/\s+/).length : 0} kata</span>
                        <span>Mendukung kutipan Arab langsung (RTL)</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Footnotes Field */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="font-serif font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-emerald-700" />
                      <span>Catatan Kaki (Footnotes) &amp; Rujukan Tambahan</span>
                    </h3>
                    <span className="text-[11px] text-slate-400">Opsional</span>
                  </div>
                  <textarea
                    rows={4}
                    value={footnotes}
                    onChange={(e) => setFootnotes(e.target.value)}
                    placeholder="Contoh: [1] Wahbah az-Zuhaili, Al-Fiqh al-Islami wa Adillatuh, jilid 4, hal. 112..."
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 leading-relaxed focus:bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>

                {/* Tautan Dokumen Eksternal (Opsional) */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="font-serif font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-700" />
                      <span>Tautan Berkas Word Final (Google Drive / Cloud Storage)</span>
                    </h3>
                    <span className="text-[11px] text-slate-400">Opsional</span>
                  </div>
                  <input
                    type="url"
                    value={wordFileLink}
                    onChange={(e) => setWordFileLink(e.target.value)}
                    placeholder="https://drive.google.com/file/d/..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-500">
                    Jika naskah Anda menyertakan tabel kompleks, bagan, atau format Arab khusus, Anda dapat menyertakan tautan berkas dokumen Word di sini.
                  </p>
                </div>

                {/* Final Submit Bottom Bar */}
                <div className="bg-emerald-900 text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
                  <div>
                    <h4 className="font-serif font-bold text-lg">Siap Mengirimkan Naskah Lengkap?</h4>
                    <p className="text-xs text-emerald-200 mt-0.5">
                      Dewan Redaksi akan menelaah naskah lengkap Anda sebelum dijadwalkan terbit di Mimbar Kajian.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setPreviewMode(true)}
                      className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition"
                    >
                      Pratinjau
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitFullPaper}
                      disabled={isSubmitting}
                      className="flex-1 sm:flex-none px-6 py-2.5 bg-mahad-gold hover:bg-amber-500 text-emerald-950 font-bold rounded-xl text-xs shadow transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmitting ? "Mengirim..." : "Kirim Naskah"}</span>
                    </button>
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

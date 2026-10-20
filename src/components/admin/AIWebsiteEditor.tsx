"use client";

import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Eye, 
  FileText, 
  Link as LinkIcon, 
  Layers, 
  Clock, 
  ShieldCheck, 
  ChevronRight, 
  Check, 
  X,
  History,
  Bot,
  Folder,
  Image as ImageIcon,
  ArrowDownToLine,
  Copy,
  ExternalLink,
  HelpCircle
} from "lucide-react";

import { isImageSupportedKey, AllowedAiKey } from "@/lib/ai/editor-service";

interface AIWebsiteEditorProps {
  isSuperAdmin: boolean;
  currentUserName: string;
  onRefreshData?: () => void;
  getAdminHeaders: () => Promise<Record<string, string>>;
}

export const MODULE_IMAGE_META: Record<string, { folder: string; label: string; elementTarget: string }> = {
  "home.hero": { folder: "umum", label: "Hero Banner", elementTarget: "Latar Belakang Slider & Foto Hero Beranda" },
  "masyayikh": { folder: "masyayikh", label: "Dewan Masyayikh", elementTarget: "Foto Profil Formal Masyaikh / Dewan Dosen Pengampu" },
  "facilities": { folder: "sarana", label: "Sarana Kampus", elementTarget: "Foto Dokumentasi Gedung, Asrama & Perpustakaan" },
  "quote": { folder: "masyayikh", label: "Kalam Hikmah", elementTarget: "Foto Potret Anregurutta dalam Bingkai Emas Hikmah" },
  "donations": { folder: "donasi", label: "Program Wakaf", elementTarget: "Poster & Foto Utama Program Wakaf & Pembangunan" },
  "about_page": { folder: "umum", label: "Halaman Tentang", elementTarget: "Foto Dokumentasi Pimpinan & Sejarah Kampus" },
  "header": { folder: "logo", label: "Header & Navigasi", elementTarget: "Logo Resmi Lembaga Ma'had Aly (Format PNG/WebP Transparan)" },
  "pmb": { folder: "artikel", label: "PMB Santri Baru", elementTarget: "Flyer Brosur & Banner Pengumuman Seleksi PMB" }
};

const TEMPLATE_PROMPTS = [
  {
    targetKey: "home.hero",
    label: "🌟 Hero & Slogan Beranda",
    prompt: "Perbarui judul dan slogan hero beranda agar lebih menegaskan peran Ma'had Aly DDI Mangkoso sebagai pusat kaderisasi ulama fiqh berwawasan wasathiyyah dan berakar pada tradisi Turats."
  },
  {
    targetKey: "masyayikh",
    label: "👥 Tambah / Poles Dewan Masyayikh",
    prompt: "Tambahkan profil Masyaikh/Dosen baru Dr. KH. Muhammad As'ad, Lc., M.Th.I. sebagai pengampu Fiqh Mu'amalah dan perbarui sanad keilmuan dewan pengampu."
  },
  {
    targetKey: "facilities",
    label: "🏛️ Sarana & Fasilitas Riset",
    prompt: "Perbarui sarana kampus dengan menambahkan Perpustakaan Riset Khazanah Turats & Digital berkapasitas 150 mahasantri."
  },
  {
    targetKey: "academic",
    label: "📖 Tambah Mata Kuliah Takhassus",
    prompt: "Tambahkan mata kuliah baru pada kurikulum semester 6: 'Kajian Fiqh Nawazil & Fatwa Kontemporer' dengan bobot 3 SKS."
  },
  {
    targetKey: "quote",
    label: "📜 Kalam Hikmah Anregurutta",
    prompt: "Perbarui kutipan Kalam Hikmah Anregurutta K.H. Abd. Rahman Ambo Dalle dengan teks Arab muttashil dan terjemahan resmi."
  },
  {
    targetKey: "pmb",
    label: "🎓 Jadwal & Seleksi PMB Online",
    prompt: "Perbarui informasi jadwal gelombang pendaftaran PMB Online dan syarat kemampuan membaca kitab kuning gundul."
  },
  {
    targetKey: "bahtsul",
    label: "🕌 Draf Putusan Bahtsul Masail",
    prompt: "Susun draf putusan Bahtsul Masail mengenai hukum zakat aset digital dan kripto menurut kajian madzhab Syafi'i."
  },
  {
    targetKey: "donations",
    label: "💰 Program Wakaf Laboratorium",
    prompt: "Tambahkan program donasi wakaf baru untuk pembangunan Laboratorium Fiqh Falak & Observatorium Hisab Rukyat."
  },
  {
    targetKey: "dema_settings",
    label: "👑 8 Divisi Resmi DeMa",
    prompt: "Perbarui semua 8 divisi Dewan Mahasantri (DeMa) lengkap dengan rincian ikon emoji, kode unik slug, tugas pokok, dan program kerja unggulan untuk: BPH, Jurnalistik, Pendidikan, Sarpras, Humas, Maktabah, Ibadah, dan Keamanan."
  },
  {
    targetKey: "about_page",
    label: "🏛️ Narasi Halaman Tentang",
    prompt: "Sempurnakan narasi pengantar pada halaman profil tentang Ma'had Aly agar lebih menyentuh, elegan, dan menjelaskan sanad keilmuan Anregurutta Ambo Dalle."
  },
  {
    targetKey: "footer",
    label: "🦶 Kontak Resmi Footer",
    prompt: "Periksa dan rapikan informasi kontak sekretariat, jam kerja layanan, dan deskripsi singkat lembaga pada bagian footer website."
  }
];

export default function AIWebsiteEditor({
  isSuperAdmin,
  currentUserName,
  onRefreshData,
  getAdminHeaders
}: AIWebsiteEditorProps) {
  const [targetKey, setTargetKey] = useState<string>("home.hero");
  const [prompt, setPrompt] = useState<string>("");
  const [sourceUrl, setSourceUrl] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      const mod = p.get("module") || p.get("target");
      if (mod) {
        setTargetKey(mod);
      }
    }
  }, []);
  
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const [proposal, setProposal] = useState<{
    targetKey: string;
    summary: string;
    proposedData: any;
    changes: Array<{ field: string; before: any; after: any }>;
    engineUsed: string;
  } | null>(null);

  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  // Snapshot History State
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [isLoadingSnapshots, setIsLoadingSnapshots] = useState<boolean>(false);
  const [rollbackLoadingId, setRollbackLoadingId] = useState<string | null>(null);

  // Google Drive Importer State
  const [driveInputUrl, setDriveInputUrl] = useState<string>("");
  const [driveFolderTarget, setDriveTargetFolder] = useState<string>("masyayikh");
  const [isImportingDrive, setIsImportingDrive] = useState<boolean>(false);
  const [driveImportResult, setDriveImportResult] = useState<{ url: string; fileId: string; provider: string } | null>(null);
  const [showFolderGuide, setShowFolderGuide] = useState<boolean>(false);

  // Sinkronisasi otomatis target folder upload berdasarkan modul yang dipilih
  useEffect(() => {
    if (isImageSupportedKey(targetKey) && MODULE_IMAGE_META[targetKey]) {
      setDriveTargetFolder(MODULE_IMAGE_META[targetKey].folder);
    }
  }, [targetKey]);

  // Fungsi Impor Gambar dari Google Drive ke Cloudflare R2
  const handleImportDriveImage = async () => {
    if (!driveInputUrl.trim()) {
      alert("Harap masukkan tautan file Google Drive terlebih dahulu.");
      return;
    }
    setIsImportingDrive(true);
    setErrorMsg(null);
    try {
      const headers = await getAdminHeaders();
      const res = await fetch("/api/admin/drive/import", {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          url: driveInputUrl.trim(),
          targetFolder: driveFolderTarget
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal mengimpor gambar dari Google Drive.");
      }
      setDriveImportResult({
        url: data.url,
        fileId: data.fileId,
        provider: data.provider
      });
      setSuccessMsg(`✓ Berhasil! Gambar dari Google Drive telah dipindahkan ke ${data.provider} dan siap digunakan.`);
    } catch (err: any) {
      alert("❌ " + (err.message || "Gagal mengimpor gambar dari Google Drive."));
    } finally {
      setIsImportingDrive(false);
    }
  };

  const handleInsertDriveUrlToPrompt = () => {
    if (!driveImportResult) return;
    setPrompt((prev) => `${prev ? prev + "\n" : ""}Gunakan foto: ${driveImportResult.url}`);
    alert("✓ Tautan gambar berhasil disisipkan ke kotak instruksi AI di atas!");
  };

  // Fetch Snapshot History
  const fetchSnapshots = async () => {
    try {
      setIsLoadingSnapshots(true);
      const headers = await getAdminHeaders();
      const res = await fetch("/api/admin/ai/snapshots", { headers });
      const data = await res.json();
      if (data.success && Array.isArray(data.snapshots)) {
        setSnapshots(data.snapshots);
      }
    } catch (err) {
      console.warn("Gagal mengambil snapshot:", err);
    } finally {
      setIsLoadingSnapshots(false);
    }
  };

  useEffect(() => {
    fetchSnapshots();
  }, []);

  // Generate Usulan AI
  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) {
      setErrorMsg("Harap masukkan instruksi atau prompt terlebih dahulu.");
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setProposal(null);

    try {
      const headers = await getAdminHeaders();
      const res = await fetch("/api/admin/ai/suggest", {
        method: "POST",
        headers,
        body: JSON.stringify({
          prompt: prompt.trim(),
          targetKey,
          sourceUrl: sourceUrl.trim() || undefined
        })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal membuat usulan AI.");
      }

      setProposal(json.data);
      setSuccessMsg("✓ Usulan perubahan konten berhasil dirancang oleh AI! Silakan tinjau perbandingan di bawah.");
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat memproses usulan AI.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Setujui & Publikasikan Perubahan
  const handleApply = async () => {
    if (!proposal) return;
    if (!isSuperAdmin) {
      alert("Aksi publikasi hanya dapat dilakukan oleh Super Admin.");
      return;
    }

    const confirmed = window.confirm(
      `Apakah Anda yakin ingin mempublikasikan perubahan ini ke website?\n\nTarget Konten: ${proposal.targetKey}\nRingkasan: ${proposal.summary}\n\nSistem akan otomatis mencatat versi cadangan (snapshot) sehingga Anda dapat melakukan rollback kapan saja jika diperlukan.`
    );
    if (!confirmed) return;

    setIsApplying(true);
    setErrorMsg(null);

    try {
      const headers = await getAdminHeaders();
      const res = await fetch("/api/admin/ai/apply", {
        method: "POST",
        headers,
        body: JSON.stringify({
          targetKey: proposal.targetKey,
          proposedData: proposal.proposedData,
          summary: proposal.summary
        })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal menerapkan konten AI.");
      }

      setSuccessMsg(`✓ Berhasil dipublikasikan! Snapshot #${json.snapshotId} telah dicatat untuk rollback.`);
      setProposal(null);
      setPrompt("");
      fetchSnapshots();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal mempublikasikan perubahan.");
    } finally {
      setIsApplying(false);
    }
  };

  // Rollback ke Snapshot Versi Tertentu
  const handleRollback = async (snapshotId: string, summary: string) => {
    if (!isSuperAdmin) {
      alert("Aksi rollback hanya dapat dilakukan oleh Super Admin.");
      return;
    }

    const confirmed = window.confirm(
      `⚠️ KONFIRMASI ROLLBACK:\n\nApakah Anda ingin mengembalikan konten ke versi sebelum perubahan:\n"${summary}"?\n\nKonten website akan langsung dipulihkan ke versi sebelumnya.`
    );
    if (!confirmed) return;

    setRollbackLoadingId(snapshotId);
    setErrorMsg(null);

    try {
      const headers = await getAdminHeaders();
      const res = await fetch("/api/admin/ai/rollback", {
        method: "POST",
        headers,
        body: JSON.stringify({ snapshotId })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal melakukan rollback.");
      }

      alert("✓ " + json.message);
      fetchSnapshots();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      alert("❌ " + (err.message || "Gagal melakukan rollback."));
    } finally {
      setRollbackLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 🛡️ Header Banner AI Assistant */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/60 border border-emerald-500/30 text-emerald-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-mahad-gold animate-pulse" />
              <span>AI Content Assistant (Protokol Terisolasi &amp; Terverifikasi)</span>
            </div>
            <h2 className="font-serif font-bold text-2xl text-white">
              AI Website Content Editor
            </h2>
            <p className="text-emerald-100/80 text-xs max-w-2xl leading-relaxed">
              Kirimkan instruksi atau dokumen sumber (Google Drive / catatan), dan asisten AI akan menyusun usulan perubahan terstruktur secara aman. Anda dapat memeriksa perbandingan visual, membuka pratinjau live, dan mempublikasikannya dengan perlindungan rollback 1-klik.
            </p>
          </div>

          <div className="bg-emerald-950/70 border border-emerald-700/60 rounded-xl p-3 text-xs space-y-1.5 shrink-0">
            <div className="flex items-center gap-2 text-emerald-300 font-bold">
              <ShieldCheck className="w-4 h-4 text-mahad-gold" />
              <span>Zona Konten Diizinkan</span>
            </div>
            <p className="text-[11px] text-emerald-200/70">
              Hero • Section Beranda • Tentang • Teks • Footer • Header
            </p>
            <div className="text-[10px] text-emerald-400 font-mono">
              Mode: {proposal?.engineUsed === "gemini-api" ? "Google Gemini 1.5 Flash" : "Heuristic Assistant Engine"}
            </div>
          </div>
        </div>
      </div>

      {/* ⚠️ Pesan Error & Sukses */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button type="button" onClick={() => setErrorMsg(null)} className="text-rose-600 hover:text-rose-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button type="button" onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 📝 PANEL FORM INPUT AI */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
            <Bot className="w-4 h-4 text-emerald-600" />
            <span>Formulir Perintah &amp; Instruksi AI</span>
          </div>
          <span className="text-[11px] text-slate-400">
            Masuk sebagai: <strong>{currentUserName}</strong>
          </span>
        </div>

        {/* 1. Pemilihan Target Konten (15 Modul Lengkap) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-700">
              Pilih Target Modul Website yang Ingin Diubah (15 Modul Lengkap):
            </label>
            <span className="text-[11px] text-emerald-700 font-semibold">
              Terpilih: <strong>{targetKey}</strong>
            </span>
          </div>

          <div className="space-y-3">
            {/* Kelompok A: Tata Letak & Profil */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                🎨 Tata Letak, Tampilan &amp; Profil
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: "home.hero", label: "🌟 Hero Banner & Metrik", desc: "Judul, slogan, tombol CTA beranda" },
                  { id: "home_sections", label: "📑 Urutan Section Beranda", desc: "Tata letak susunan komponen beranda" },
                  { id: "about_page", label: "🏛️ Halaman Tentang & Sejarah", desc: "Sejarah, sambutan, visi lembaga" },
                  { id: "header", label: "🧭 Header & Navigasi", desc: "Logo, teks instansi & link navbar" },
                  { id: "footer", label: "🦶 Footer Manager", desc: "Kontak sekretariat, link medsos & info" },
                  { id: "page_texts", label: "✍️ Teks Narasi Publik (CMS)", desc: "Pengantar artikel, opini & akademik" }
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTargetKey(t.id)}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      targetKey === t.id
                        ? "bg-emerald-50 border-emerald-600 ring-2 ring-emerald-500/20"
                        : "bg-slate-50/60 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-xs font-bold ${targetKey === t.id ? "text-emerald-900" : "text-slate-800"}`}>
                        {t.label}
                      </span>
                      {targetKey === t.id && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                    </div>
                    <div className="flex items-center justify-between w-full mt-2 pt-1 border-t border-slate-200/40">
                      <span className="text-[10px] text-slate-500 line-clamp-1">{t.desc}</span>
                      {isImageSupportedKey(t.id) ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200/60 shrink-0 ml-1.5 flex items-center gap-0.5">
                          <span>🖼️</span>
                          <span>Bisa Foto</span>
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200 shrink-0 ml-1.5 flex items-center gap-0.5">
                          <span>📝</span>
                          <span>Teks Saja</span>
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Kelompok B: Lembaga & Akademik */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                🏛️ Lembaga, Masyayikh &amp; Akademik
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: "masyayikh", label: "👥 Dewan Masyayikh & Dosen", desc: "Profil dosen pengampu & karya kitab" },
                  { id: "facilities", label: "🏫 Sarana & Fasilitas Kampus", desc: "Perpustakaan, masjid, asrama santri" },
                  { id: "academic", label: "📖 Akademik & Kurikulum", desc: "Mata kuliah takhassus & SKS semester" },
                  { id: "bahtsul", label: "🕌 Bahtsul Masail & Fatwa", desc: "Tanya jawab fiqh & ibarat rujukan kitab" },
                  { id: "pmb", label: "🎓 PMB & Penerimaan Santri", desc: "Gelombang pendaftaran, syarat seleksi" },
                  { id: "dema_settings", label: "👑 Dewan Mahasantri (DeMa)", desc: "Nama kabinet, struktur pengurus & divisi" }
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTargetKey(t.id)}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      targetKey === t.id
                        ? "bg-emerald-50 border-emerald-600 ring-2 ring-emerald-500/20"
                        : "bg-slate-50/60 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-xs font-bold ${targetKey === t.id ? "text-emerald-900" : "text-slate-800"}`}>
                        {t.label}
                      </span>
                      {targetKey === t.id && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                    </div>
                    <div className="flex items-center justify-between w-full mt-2 pt-1 border-t border-slate-200/40">
                      <span className="text-[10px] text-slate-500 line-clamp-1">{t.desc}</span>
                      {isImageSupportedKey(t.id) ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200/60 shrink-0 ml-1.5 flex items-center gap-0.5">
                          <span>🖼️</span>
                          <span>Bisa Foto</span>
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200 shrink-0 ml-1.5 flex items-center gap-0.5">
                          <span>📝</span>
                          <span>Teks Saja</span>
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Kelompok C: Hikmah, Donasi & Pesan */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                🤲 Kalam Hikmah, Donasi &amp; Komunikasi
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: "quote", label: "📜 Kalam Hikmah Anregurutta", desc: "Teks hikmah Arab RTL & terjemahan" },
                  { id: "donations", label: "💰 Program Donasi & Wakaf", desc: "Wakaf pembangunan, target & rekening" },
                  { id: "email_templates", label: "✉️ Template Email Notifikasi", desc: "Format pesan balasan otomatis naskah" }
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTargetKey(t.id)}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      targetKey === t.id
                        ? "bg-emerald-50 border-emerald-600 ring-2 ring-emerald-500/20"
                        : "bg-slate-50/60 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-xs font-bold ${targetKey === t.id ? "text-emerald-900" : "text-slate-800"}`}>
                        {t.label}
                      </span>
                      {targetKey === t.id && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                    </div>
                    <div className="flex items-center justify-between w-full mt-2 pt-1 border-t border-slate-200/40">
                      <span className="text-[10px] text-slate-500 line-clamp-1">{t.desc}</span>
                      {isImageSupportedKey(t.id) ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200/60 shrink-0 ml-1.5 flex items-center gap-0.5">
                          <span>🖼️</span>
                          <span>Bisa Foto</span>
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200 shrink-0 ml-1.5 flex items-center gap-0.5">
                          <span>📝</span>
                          <span>Teks Saja</span>
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Template Prompt Cepat */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600">⚡ Contoh Template Prompt Cepat:</span>
            <span className="text-[10px] text-slate-400">Klik untuk mengisi otomatis</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {TEMPLATE_PROMPTS.map((tp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setTargetKey(tp.targetKey);
                  setPrompt(tp.prompt);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-100 hover:text-emerald-900 border border-slate-200 text-[11px] text-slate-700 font-medium transition"
              >
                {tp.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Kolom Teks Prompt Utama */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Tulis Instruksi / Perintah Anda untuk AI: <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Tuliskan arahan perubahan dengan jelas... Contoh: 'Perbarui kalimat subjudul pada hero beranda menjadi lebih mengedepankan tradisi kajian kitab kuning Turats dan penguasaan fiqh modern.'"
            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition placeholder:text-slate-400 leading-relaxed"
          />
        </div>

        {/* 4. Dokumen Sumber / Google Drive Link (Opsional) */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Tautan Dokumen / Google Drive Sumber (Opsional):
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://docs.google.com/document/d/... atau https://drive.google.com/..."
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            {sourceUrl && (
              <button
                type="button"
                onClick={() => setSourceUrl("")}
                className="px-2.5 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-500 text-xs"
              >
                Reset
              </button>
            )}
          </div>
          <p className="text-[10px] text-slate-400">
            Jika memiliki dokumen naskah sambutan atau materi resmi di Google Drive, tempel tautannya di sini sebagai acuan AI.
          </p>
        </div>

        {/* 4.5. 📂 ALAT PEMINDAH GAMBAR GOOGLE DRIVE KE WEBSITE (CLOUDFLARE R2) - DIBATASI KHUSUS MODUL GAMBAR */}
        {isImageSupportedKey(targetKey) ? (
          <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0">
                  <ArrowDownToLine className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-xs text-emerald-950">
                    Tarik Gambar dari Google Drive ke Website (Otomatis)
                  </h4>
                  <p className="text-[10px] text-emerald-700/80">
                    Pindahkan foto dari Google Drive langsung ke penyimpanan Cloudflare R2 website tanpa upload manual.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowFolderGuide(!showFolderGuide)}
                className="text-[11px] text-emerald-800 hover:text-emerald-950 font-semibold flex items-center gap-1 shrink-0 self-start sm:self-auto bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-xs"
              >
                <Folder className="w-3.5 h-3.5 text-emerald-600" />
                <span>{showFolderGuide ? "Tutup Panduan Folder" : "Lihat Struktur Folder Disarankan"}</span>
              </button>
            </div>

            {/* Target Penempatan Elemen Gambar */}
            {MODULE_IMAGE_META[targetKey] && (
              <div className="flex items-center gap-2 p-2.5 bg-emerald-100/70 border border-emerald-300/80 rounded-xl text-xs text-emerald-950 font-medium">
                <span className="text-sm">🎯</span>
                <span>
                  Target Penempatan Foto: Foto yang diimpor akan dipasang sebagai <strong>{MODULE_IMAGE_META[targetKey].elementTarget}</strong>.
                </span>
              </div>
            )}

            {/* Panduan & Struktur Folder Google Drive Disarankan (Expandable) */}
            {showFolderGuide && (
              <div className="p-3.5 bg-white border border-emerald-200 rounded-xl space-y-2.5 text-xs text-slate-700 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 flex items-center gap-1.5 text-xs">
                    <Folder className="w-4 h-4 text-emerald-600" />
                    <span>Struktur Folder Google Drive Standar Ma'had Aly:</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Pastikan izin diset: 'Siapa saja yang memiliki link'</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <strong className="text-emerald-800 block">📁 01_Masyayikh/</strong>
                    <span className="text-slate-500">Foto Dosen/KH. Nama file: Dr_KH_Muhammad_Asad.jpg</span>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <strong className="text-emerald-800 block">📁 02_Sarana_Fasilitas/</strong>
                    <span className="text-slate-500">Perpustakaan, asrama, lab falak.</span>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <strong className="text-emerald-800 block">📁 03_Hero_Beranda/</strong>
                    <span className="text-slate-500">Banner &amp; foto latar belakang beranda utama.</span>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <strong className="text-emerald-800 block">📁 04_Kalam_Hikmah/</strong>
                    <span className="text-slate-500">Foto Anregurutta &amp; kaligrafi hikmah.</span>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <strong className="text-emerald-800 block">📁 05_Program_Wakaf_Donasi/</strong>
                    <span className="text-slate-500">Foto tanah wakaf, observatorium, lab.</span>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <strong className="text-emerald-800 block">📁 06_PMB_Brosur/</strong>
                    <span className="text-slate-500">Flyer brosur pendaftaran santri baru.</span>
                  </div>
                </div>

                <div className="pt-1 text-[11px] text-slate-600 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100 flex items-center justify-between">
                  <span>⚡ Anda juga bisa menjalankan skrip otomatis 1-klik di <strong>scripts/Setup-Google-Drive-Folders.js</strong> untuk membuat semua folder di atas dalam 3 detik!</span>
                </div>
              </div>
            )}

            {/* Input Link File Google Drive */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <ImageIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="url"
                  value={driveInputUrl}
                  onChange={(e) => setDriveInputUrl(e.target.value)}
                  placeholder="Tempel link foto Google Drive (Contoh: https://drive.google.com/file/d/1.../view)"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-emerald-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <select
                value={driveFolderTarget}
                onChange={(e) => setDriveTargetFolder(e.target.value)}
                className="py-2 px-3 bg-white border border-emerald-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="masyayikh">📁 Folder: Masyayikh</option>
                <option value="sarana">📁 Folder: Sarana/Fasilitas</option>
                <option value="artikel">📁 Folder: Artikel/Berita</option>
                <option value="donasi">📁 Folder: Donasi/Wakaf</option>
                <option value="galeri">📁 Folder: Galeri Santri</option>
                <option value="logo">📁 Folder: Logo Lembaga</option>
                <option value="umum">📁 Folder: Umum</option>
              </select>

              <button
                type="button"
                disabled={isImportingDrive || !driveInputUrl.trim()}
                onClick={handleImportDriveImage}
                className="py-2 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50 shrink-0 shadow-sm cursor-pointer"
              >
                {isImportingDrive ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Mengunduh...</span>
                  </>
                ) : (
                  <>
                    <ArrowDownToLine className="w-3.5 h-3.5" />
                    <span>Tarik Gambar ke Web</span>
                  </>
                )}
              </button>
            </div>

            {/* Hasil Impor Gambar */}
            {driveImportResult && (
              <div className="p-3 bg-white border border-emerald-300 rounded-xl flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={driveImportResult.url}
                    alt="Hasil Impor Drive"
                    className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0 bg-slate-100"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase block">
                      Tersimpan di {driveImportResult.provider}:
                    </span>
                    <p className="text-xs font-mono text-slate-800 truncate max-w-sm sm:max-w-md">
                      {driveImportResult.url}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleInsertDriveUrlToPrompt}
                    className="px-2.5 py-1.5 bg-mahad-gold text-mahad-green-dark font-bold text-[11px] rounded-lg shadow-xs hover:bg-yellow-400 transition flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Sisipkan ke Prompt AI</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start sm:items-center gap-3.5 text-xs text-slate-600">
            <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 text-base font-bold">
              📝
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h4 className="font-serif font-bold text-xs text-slate-900">
                  Modul Murni Teks &amp; Data (Upload Gambar Dibatasi Otomatis)
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  {targetKey}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Modul ini dikhususkan untuk struktur teks narasi, kurikulum, divisi organisasi, atau putusan fatwa tanpa elemen gambar. Alat impor gambar otomatis disembunyikan agar tampilan website tetap konsisten dan performa optimal.
              </p>
            </div>
          </div>
        )}

        {/* 5. Tombol Submit Generate */}
        <div className="pt-2">
          <button
            type="button"
            disabled={isGenerating || !prompt.trim()}
            onClick={() => handleGenerate()}
            className="w-full py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>AI Sedang Menganalisis &amp; Merancang Perubahan...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-mahad-gold" />
                <span>Rancang Usulan Perubahan dengan AI</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 🔍 PANEL USULAN AI & PERBANDINGAN PERUBAHAN (DIFF VIEWER) */}
      {proposal && (
        <div className="bg-white rounded-2xl border-2 border-emerald-500/40 shadow-lg p-6 space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                  Hasil Usulan AI
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Target: <strong>{proposal.targetKey}</strong>
                </span>
              </div>
              <h3 className="font-serif font-bold text-lg text-slate-900 mt-1">
                Tinjauan Perubahan yang Diusulkan
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Pratinjau Live</span>
              </button>
              <button
                type="button"
                onClick={() => setProposal(null)}
                className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl text-xs transition"
              >
                Tutup
              </button>
            </div>
          </div>

          {/* Ringkasan Penjelasan AI */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-1">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-mahad-gold" />
              <span>Penjelasan AI (Executive Summary):</span>
            </span>
            <p className="text-xs text-emerald-950 font-medium leading-relaxed">
              {proposal.summary}
            </p>
          </div>

          {/* Rincian Perbedaan Bidang (Diff Items) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700">
                Bidang Data yang Berubah ({proposal.changes.length} elemen):
              </h4>
              <span className="text-[10px] text-slate-400">Merah = Nilai Lama, Hijau = Nilai Baru AI</span>
            </div>

            {proposal.changes.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
                Tidak ada perbedaan nilai terdeteksi. Data saat ini sudah sesuai dengan instruksi yang diminta.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {proposal.changes.map((ch, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {ch.field}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-rose-600 block">Sebelumnya (Lama):</span>
                        <div className="font-mono text-[11px] break-words whitespace-pre-wrap">
                          {typeof ch.before === "object" ? JSON.stringify(ch.before, null, 2) : String(ch.before || "(kosong)")}
                        </div>
                      </div>
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-emerald-600 block">Usulan Baru AI:</span>
                        <div className="font-mono text-[11px] break-words whitespace-pre-wrap">
                          {typeof ch.after === "object" ? JSON.stringify(ch.after, null, 2) : String(ch.after || "(kosong)")}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tombol Publikasi & Batal */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setProposal(null)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
            >
              Batalkan Usulan Ini
            </button>
            <button
              type="button"
              disabled={isApplying}
              onClick={handleApply}
              className="w-full sm:w-auto px-6 py-2.5 bg-mahad-gold hover:bg-yellow-400 text-mahad-green-dark font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs disabled:opacity-50"
            >
              {isApplying ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-mahad-green-dark/30 border-t-mahad-green-dark rounded-full animate-spin" />
                  <span>Mempublikasikan &amp; Membuat Snapshot...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Setujui &amp; Publikasikan ke Website</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 🖼️ MODAL LIVE PREVIEW */}
      {isPreviewOpen && proposal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-700" />
                <h3 className="font-serif font-bold text-sm text-slate-800">
                  Pratinjau Live: {proposal.targetKey}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {proposal.targetKey === "home.hero" ? (
                <div 
                  className="relative p-8 rounded-2xl text-white text-center space-y-4 overflow-hidden border border-emerald-700 bg-cover bg-center shadow-lg"
                  style={{
                    backgroundImage: (proposal.proposedData?.bgImageUrl || proposal.proposedData?.backgroundImage)
                      ? `linear-gradient(rgba(6, 78, 59, 0.85), rgba(15, 23, 42, 0.9)), url('${proposal.proposedData?.bgImageUrl || proposal.proposedData?.backgroundImage}')`
                      : "linear-gradient(to bottom right, #064e3b, #0f172a, #064e3b)"
                  }}
                >
                  <span className="text-xs text-mahad-gold tracking-widest font-serif block">
                    {proposal.proposedData?.arabicBismillah || "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold">
                    {proposal.proposedData?.title || "Pusat Kaderisasi Ulama Fiqh"}{" "}
                    {proposal.proposedData?.titleHighlight && (
                      <span className="text-mahad-gold">{proposal.proposedData.titleHighlight}</span>
                    )}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-200 max-w-xl mx-auto leading-relaxed">
                    {proposal.proposedData?.subtitle || "Pusat kaderisasi ulama fiqh berwawasan wasathiyyah..."}
                  </p>
                  {(proposal.proposedData?.bgImageUrl || proposal.proposedData?.backgroundImage) && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 text-emerald-300 text-[10px] font-mono border border-emerald-500/30">
                      <span>✓ Foto Latar Belakang Terhubung dari Google Drive</span>
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <span className="px-4 py-2 bg-mahad-gold text-mahad-green-dark font-bold text-xs rounded-xl shadow-md">
                      {proposal.proposedData?.cta1Text || "Kenali Ma'had"}
                    </span>
                    <span className="px-4 py-2 bg-white/10 text-white font-bold text-xs rounded-xl border border-white/20">
                      {proposal.proposedData?.cta2Text || "Baca Mimbar"}
                    </span>
                  </div>
                </div>
              ) : proposal.targetKey === "masyayikh" && Array.isArray(proposal.proposedData) ? (
                <div className="space-y-4">
                  <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Daftar Dewan Masyayikh &amp; Pengampu Turats ({proposal.proposedData.length} Masyayikh):</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Pratinjau Kartu Profil
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {proposal.proposedData.map((m: any, idx: number) => (
                      <div key={m.id || idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 hover:border-emerald-300 transition">
                        <div className="flex items-center gap-3">
                          {m.photoUrl ? (
                            <img
                              src={m.photoUrl}
                              alt={m.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shrink-0 bg-slate-200 shadow-2xs"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-sm shrink-0">
                              {m.name ? m.name.charAt(0) : "M"}
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="font-serif font-bold text-xs text-slate-900 truncate">{m.name}</h4>
                            <p className="text-[11px] text-emerald-800 font-medium truncate">{m.role || m.title || "Dewan Masyayikh"}</p>
                            {m.photoUrl && (
                              <span className="text-[9px] text-emerald-600 block font-mono truncate">
                                📷 {m.photoUrl.startsWith("http") ? "Foto Terhubung" : m.photoUrl}
                              </span>
                            )}
                          </div>
                        </div>
                        {m.specialization && (
                          <div className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[10px] font-semibold">
                            Keahlian: {m.specialization}
                          </div>
                        )}
                        <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                          {m.bio || "Masyayikh pengampu kajian kitab kuning Ma'had Aly DDI Mangkoso."}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : proposal.targetKey === "facilities" && Array.isArray(proposal.proposedData) ? (
                <div className="space-y-4">
                  <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Sarana &amp; Fasilitas Pembelajaran ({proposal.proposedData.length} Fasilitas):</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Pratinjau Sarana
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {proposal.proposedData.map((f: any, idx: number) => (
                      <div key={f.id || idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                        {f.photoUrl && (
                          <div className="w-full h-32 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                            <img
                              src={f.photoUrl}
                              alt={f.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                            {f.category || "Fasilitas"}
                          </span>
                          {f.capacity && (
                            <span className="text-[10px] text-slate-500 font-semibold">
                              Daya Tampung: {f.capacity}
                            </span>
                          )}
                        </div>
                        <h4 className="font-serif font-bold text-xs text-slate-900">{f.name}</h4>
                        <p className="text-[11px] text-slate-600 leading-relaxed">{f.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : proposal.targetKey === "academic" && Array.isArray(proposal.proposedData) ? (
                <div className="space-y-4">
                  <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Kurikulum &amp; Mata Kuliah Takhassus ({proposal.proposedData.length} Mata Kuliah):</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Pratinjau Kurikulum
                    </span>
                  </div>
                  <div className="space-y-2">
                    {proposal.proposedData.map((c: any, idx: number) => (
                      <div key={c.id || idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 bg-slate-200 text-slate-800 font-mono text-[10px] font-bold rounded">
                              {c.code || "FIQ"}
                            </span>
                            <h4 className="font-serif font-bold text-xs text-slate-900 truncate">{c.name}</h4>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{c.description}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                            {c.sks || 3} SKS
                          </span>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded-full">
                            Sem. {c.semester || 1}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : proposal.targetKey === "quote" ? (
                <div className="bg-emerald-900 text-white p-6 rounded-2xl text-center space-y-4 border border-emerald-700 shadow-sm">
                  {proposal.proposedData?.imageUrl && (
                    <div className="flex justify-center">
                      <img
                        src={proposal.proposedData.imageUrl}
                        alt="Anregurutta"
                        className="w-20 h-20 rounded-full object-cover border-2 border-mahad-gold shadow-md bg-white/20"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  <span className="text-[11px] text-mahad-gold font-bold uppercase tracking-wider block">
                    Kutipan Kalam Hikmah
                  </span>
                  <div className="text-2xl font-serif text-mahad-gold leading-relaxed" dir="rtl">
                    {proposal.proposedData?.arabicQuote || "العِلْمُ بِلَا عَمَلٍ كَالشَّجَرِ بِلَا ثَمَرٍ"}
                  </div>
                  <p className="text-xs text-slate-200 italic max-w-lg mx-auto">
                    "{proposal.proposedData?.translation || "Ilmu tanpa amal laksana pohon yang rindang namun tanpa buah."}"
                  </p>
                  <p className="text-[11px] text-emerald-300 font-serif font-bold">
                    — {proposal.proposedData?.source || "Anregurutta K.H. Abd. Rahman Ambo Dalle"}
                  </p>
                  {proposal.proposedData?.imageUrl && (
                    <span className="text-[10px] text-emerald-300/80 block font-mono">
                      📷 Foto Tokoh Terhubung dari Google Drive
                    </span>
                  )}
                </div>
              ) : proposal.targetKey === "pmb" ? (
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                  {proposal.proposedData?.brochureUrl && (
                    <div className="w-full h-40 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                      <img
                        src={proposal.proposedData.brochureUrl}
                        alt="Brosur PMB"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  <div className="border-b border-slate-200 pb-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {proposal.proposedData?.waveName || "Penerimaan Mahasantri Baru"}
                    </span>
                    <h3 className="font-serif font-bold text-base text-slate-900 mt-1">
                      {proposal.proposedData?.title || "PMB Online"}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Jadwal Pendaftaran: <strong>{proposal.proposedData?.openDate || "-"}</strong> s/d <strong>{proposal.proposedData?.closeDate || "-"}</strong>
                    </p>
                  </div>
                  {proposal.proposedData?.requirements && Array.isArray(proposal.proposedData.requirements) && (
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold text-slate-700">Persyaratan Utama:</h4>
                      <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                        {proposal.proposedData.requirements.map((req: string, idx: number) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : proposal.targetKey === "bahtsul" && Array.isArray(proposal.proposedData) ? (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Draf Putusan Bahtsul Masail ({proposal.proposedData.length} Hasil Kajian):</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Pratinjau Fatwa
                    </span>
                  </div>
                  {proposal.proposedData.map((bm: any, idx: number) => (
                    <div key={bm.id || idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          {bm.category || "Bahtsul Masail"}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Status: <strong className="text-emerald-700 uppercase">{bm.status || "Draf"}</strong>
                        </span>
                      </div>
                      <h4 className="font-serif font-bold text-xs text-slate-900">{bm.question}</h4>
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-950 text-xs">
                        <strong>Ketetapan: </strong> {bm.answer}
                      </div>
                      {bm.reference && (
                        <p className="text-[10px] text-slate-500 italic">
                          Maraji' / Rujukan: {bm.reference}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : proposal.targetKey === "donations" && Array.isArray(proposal.proposedData) ? (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Program Donasi &amp; Wakaf ({proposal.proposedData.length} Program):</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Pratinjau Donasi
                    </span>
                  </div>
                  {proposal.proposedData.map((d: any, idx: number) => (
                    <div key={d.id || idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      {d.imageUrl && (
                        <div className="w-full h-32 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                          <img
                            src={d.imageUrl}
                            alt={d.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <h4 className="font-serif font-bold text-xs text-slate-900">{d.title}</h4>
                        <span className="px-2 py-0.5 rounded bg-mahad-gold/20 text-yellow-800 text-[10px] font-bold">
                          Target: Rp {Number(d.target || d.targetAmount || 0).toLocaleString("id-ID")}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{d.description || d.shortDesc}</p>
                      {d.bankName && (
                        <div className="text-[11px] text-slate-500 bg-white p-2 rounded border border-slate-200">
                          Rekening: <strong>{d.bankName}</strong> ({d.accountNumber}) a.n. {d.accountHolder}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : proposal.targetKey === "about_page" ? (
                <div className="space-y-4">
                  <div className="p-6 bg-emerald-900 text-white rounded-2xl space-y-2 border border-emerald-800">
                    <span className="text-[10px] text-mahad-gold font-bold uppercase tracking-widest">
                      {proposal.proposedData?.badge || "Tentang Lembaga"}
                    </span>
                    <h3 className="font-serif font-bold text-lg text-white">
                      {proposal.proposedData?.title || "Profil Ma'had Aly DDI Mangkoso"}
                    </h3>
                    <p className="text-xs text-emerald-100">
                      {proposal.proposedData?.subtitle || "Pusat Kaderisasi Ulama Fiqh Wasathiyyah"}
                    </p>
                  </div>
                  {proposal.proposedData?.imageUrl && (
                    <div className="w-full h-44 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                      <img
                        src={proposal.proposedData.imageUrl}
                        alt="Profil Lembaga"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                    <h4 className="font-serif font-bold text-xs text-slate-900">
                      {proposal.proposedData?.historyTitle || "Sejarah Lembaga"}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                      {proposal.proposedData?.historyNarrative}
                    </p>
                  </div>
                </div>
              ) : proposal.targetKey === "dema_settings" ? (
                <div className="space-y-4">
                  {/* Banner Kabinet DeMa */}
                  <div className="p-5 bg-gradient-to-br from-emerald-900 to-teal-900 text-white rounded-2xl space-y-2 border border-emerald-700">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-emerald-700/60 text-emerald-200 text-[10px] font-bold rounded-full border border-emerald-500/30">
                        {proposal.proposedData?.tagline || "Dewan Mahasantri (DeMa)"}
                      </span>
                      <span className="text-[10px] text-mahad-gold font-bold">
                        {Array.isArray(proposal.proposedData?.divisions) ? `${proposal.proposedData.divisions.length} Divisi Aktif` : "8 Divisi"}
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-lg text-white">
                      {proposal.proposedData?.periodTitle || "Kabinet Mahasantri"}
                    </h3>
                    {proposal.proposedData?.leadQuoteArabic && (
                      <p className="text-sm font-serif text-mahad-gold text-right" dir="rtl">
                        {proposal.proposedData.leadQuoteArabic}
                      </p>
                    )}
                    <p className="text-xs text-slate-200 italic">
                      "{proposal.proposedData?.leadQuote || "Menghidupkan Khazanah Turats, Menggerakkan Nalar Kontemporer."}"
                    </p>
                  </div>

                  {/* Daftar 8 Divisi DeMa */}
                  {Array.isArray(proposal.proposedData?.divisions) && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <span>Daftar 8 Divisi Kepengurusan DeMa:</span>
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          Format: Nama • Ikon • Slug • Tugas Pokok • Program Kerja
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {proposal.proposedData.divisions.map((div: any, idx: number) => (
                          <div key={div.id || idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 hover:border-emerald-300 transition">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-lg shrink-0 p-1 bg-white rounded-lg border border-slate-200 shadow-xs">
                                  {div.icon || "👑"}
                                </span>
                                <div className="min-w-0">
                                  <h5 className="font-serif font-bold text-xs text-slate-900 truncate">
                                    {div.name}
                                  </h5>
                                  <span className="text-[10px] font-mono text-slate-400">
                                    Slug: {div.code}
                                  </span>
                                </div>
                              </div>
                              <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold shrink-0">
                                {div.isActive !== false ? "Aktif di Web" : "Non-aktif"}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-600 leading-relaxed">
                              {div.description}
                            </p>

                            {Array.isArray(div.responsibilities) && div.responsibilities.length > 0 && (
                              <div className="pt-1 border-t border-slate-200/60 space-y-1">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                                  Program Kerja / Tugas Unggulan:
                                </span>
                                <ul className="list-disc list-inside text-[10px] text-slate-600 space-y-0.5">
                                  {div.responsibilities.map((res: string, rIdx: number) => (
                                    <li key={rIdx} className="leading-snug">{res}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs overflow-x-auto">
                  <pre>{JSON.stringify(proposal.proposedData, null, 2)}</pre>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Pratinjau ini dirender dari usulan baru AI tanpa menyentuh database.
              </span>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🕰️ RIWAYAT SNAPSHOT & ROLLBACK */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-700" />
            <h3 className="font-serif font-bold text-sm text-slate-800">
              Riwayat Versi Konten &amp; Snapshot Rollback
            </h3>
          </div>
          <button
            type="button"
            disabled={isLoadingSnapshots}
            onClick={fetchSnapshots}
            className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
          >
            <RotateCcw className={`w-3 h-3 ${isLoadingSnapshots ? "animate-spin" : ""}`} />
            <span>Segarkan Riwayat</span>
          </button>
        </div>

        {snapshots.length === 0 ? (
          <div className="p-6 bg-slate-50 rounded-xl text-center space-y-1">
            <Clock className="w-6 h-6 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold text-slate-600">Belum Ada Riwayat Perubahan Konten AI</p>
            <p className="text-[11px] text-slate-400">
              Setiap kali Anda menyetujui perubahan AI, salinan cadangan snapshot otomatis tersimpan di sini untuk opsi rollback.
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {snapshots.map((snap) => (
              <div
                key={snap.id}
                className="p-3 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs transition"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-slate-500 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {snap.targetKey}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {snap.appliedAt ? new Date(snap.appliedAt).toLocaleString("id-ID", { timeZone: "Asia/Makassar" }) : "-"} WITA
                    </span>
                    <span className="text-[10px] text-emerald-700 font-medium">
                      Oleh: {snap.appliedBy || "Super Admin"}
                    </span>
                  </div>
                  <p className="text-slate-800 font-semibold text-xs mt-0.5">
                    {snap.summary}
                  </p>
                </div>

                {isSuperAdmin && (
                  <button
                    type="button"
                    disabled={rollbackLoadingId === snap.id}
                    onClick={() => handleRollback(snap.id, snap.summary)}
                    className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold rounded-lg text-xs transition flex items-center gap-1 shrink-0 disabled:opacity-50"
                  >
                    <RotateCcw className={`w-3 h-3 ${rollbackLoadingId === snap.id ? "animate-spin" : ""}`} />
                    <span>{rollbackLoadingId === snap.id ? "Memulihkan..." : "Rollback Versi Ini"}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  buildCsvTemplate,
  buildCsvTemplateFileName,
  SHEET_MODULES,
  type SheetModuleDef
} from "@/lib/sheets/spreadsheet";
import type { SheetSyncModuleId } from "@/lib/types";

type PanelMode = "url" | "file";
type RunState = "idle" | "working" | "success" | "error";

interface PreviewItem {
  name: string;
  subtitle: string;
  badge: string;
  photoUrl: string;
  meta: string;
}

interface ModuleStatus {
  module: string;
  moduleLabel: string;
  siteContentKey: string;
  itemCount: number;
  syncedAt: string | null;
  source: string | null;
  hasBackup: boolean;
  backupAt: string | null;
}

interface ApiResult {
  success: boolean;
  error?: string;
  message?: string;
  count?: number;
  previewMode?: boolean;
  previewItems?: PreviewItem[];
  warnings?: string[];
  skipped?: { row: number; reason: string }[];
  detectedHeaders?: string[];
  unknownHeaders?: string[];
  headerCount?: number;
  target?: string;
  source?: string;
  syncedAt?: string;
}

interface SpreadsheetSyncPanelProps {
  /** Fungsi penyedia header otorisasi (token admin) dari halaman induk. */
  getAuthHeaders: () => Promise<Record<string, string>>;
  /** Dipanggil setelah sinkronisasi sukses agar state global dimuat ulang. */
  onSynced?: () => void;
}

function formatDateTime(iso: string | null): string {
  if (!iso) return "Belum pernah";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Belum pernah";
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Makassar"
  });
}

/** Avatar foto dengan fallback inisial bila link Drive privat/rusak. */
function SyncAvatar({ src, name }: { src: string; name: string }) {
  const [broken, setBroken] = useState(false);
  const initials = useMemo(
    () =>
      name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join(""),
    [name]
  );

  if (!src || broken) {
    return (
      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0">
        {initials || "?"}
      </div>
    );
  }

  return (
    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 shrink-0 relative">
      <Image
        src={src}
        alt={name}
        width={48}
        height={48}
        unoptimized
        className="w-full h-full object-cover"
        onError={() => setBroken(true)}
      />
    </div>
  );
}

export default function SpreadsheetSyncPanel({
  getAuthHeaders,
  onSynced
}: SpreadsheetSyncPanelProps) {
  const [activeModuleId, setActiveModuleId] = useState<SheetSyncModuleId>("masyayikh");
  const [mode, setMode] = useState<PanelMode>("url");
  const [sheetUrl, setSheetUrl] = useState("");
  const [sheetName, setSheetName] = useState("");
  const [fileName, setFileName] = useState("");
  const [csvContent, setCsvContent] = useState("");
  const [runState, setRunState] = useState<RunState>("idle");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<PreviewItem[] | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [detectedHeaders, setDetectedHeaders] = useState<string[]>([]);
  const [unknownHeaders, setUnknownHeaders] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<ModuleStatus[]>([]);
  // null = belum diketahui (GET status belum selesai)
  const [serviceRoleConfigured, setServiceRoleConfigured] = useState<boolean | null>(null);
  const [showMapping, setShowMapping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeModule: SheetModuleDef = useMemo(
    () => SHEET_MODULES.find((m) => m.id === activeModuleId) ?? SHEET_MODULES[0],
    [activeModuleId]
  );

  const activeStatus = useMemo(
    () => statuses.find((s) => s.module === activeModuleId) ?? null,
    [statuses, activeModuleId]
  );

  const resetFeedback = () => {
    setMessage("");
    setError("");
    setPreview(null);
    setWarnings([]);
    setDetectedHeaders([]);
    setUnknownHeaders([]);
    setShowMapping(false);
  };

  const loadStatuses = useCallback(async () => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/admin/sync/sheets", { headers, cache: "no-store" });
      const json = await res.json();
      if (res.ok && json?.success && Array.isArray(json.data)) {
        setStatuses(json.data as ModuleStatus[]);
      }
      if (res.ok && typeof json?.serviceRoleConfigured === "boolean") {
        setServiceRoleConfigured(json.serviceRoleConfigured);
      }
    } catch {
      // Status hanya informasi tambahan — abaikan kegagalan senyap
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    loadStatuses();
  }, [loadStatuses]);

  const handleSelectModule = (id: SheetSyncModuleId) => {
    setActiveModuleId(id);
    resetFeedback();
    setRunState("idle");
  };

  const handleModeChange = (next: PanelMode) => {
    setMode(next);
    resetFeedback();
    setRunState("idle");
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    resetFeedback();
    setRunState("idle");

    if (file.size > 5 * 1024 * 1024) {
      setRunState("error");
      setError("Berkas terlalu besar (maksimal 5 MB).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCsvContent(typeof reader.result === "string" ? reader.result : "");
      setFileName(file.name);
    };
    reader.onerror = () => {
      setRunState("error");
      setError("Berkas tidak dapat dibaca. Coba pilih ulang berkas CSV.");
    };
    reader.readAsText(file, "UTF-8");
  };

  const handleDownloadTemplate = () => {
    const template = buildCsvTemplate(activeModule);
    const blob = new Blob([template], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = buildCsvTemplateFileName(activeModule);
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const runAction = async (action: "preview" | "sync" | "rollback") => {
    resetFeedback();
    setRunState("working");

    try {
      const headers = await getAuthHeaders();
      const payload: Record<string, unknown> = { action, module: activeModuleId };

      if (action !== "rollback") {
        if (mode === "file") {
          if (!csvContent.trim()) {
            setRunState("error");
            setError('Pilih berkas CSV dari HP terlebih dahulu (tombol "Pilih File CSV").');
            return;
          }
          payload.csvContent = csvContent;
          payload.sheetName = fileName || undefined;
        } else {
          if (!sheetUrl.trim()) {
            setRunState("error");
            setError("Tempelkan tautan Google Sheets terlebih dahulu.");
            return;
          }
          payload.sheetUrl = sheetUrl.trim();
          payload.sheetName = sheetName.trim() || undefined;
        }
      }

      const res = await fetch("/api/admin/sync/sheets", {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });
      const json = (await res.json().catch(() => ({}))) as ApiResult;

      if (!res.ok || !json.success) {
        setRunState("error");
        setError(json.error || `Permintaan gagal (HTTP ${res.status}).`);
        return;
      }

      setRunState("success");
      setMessage(json.message || "Berhasil.");
      setWarnings(Array.isArray(json.warnings) ? json.warnings : []);
      setDetectedHeaders(Array.isArray(json.detectedHeaders) ? json.detectedHeaders : []);
      setUnknownHeaders(Array.isArray(json.unknownHeaders) ? json.unknownHeaders : []);

      if (action !== "rollback" && Array.isArray(json.previewItems)) {
        setPreview(json.previewItems);
      }

      await loadStatuses();

      if (action === "sync" || action === "rollback") {
        onSynced?.();
      }
    } catch (err) {
      setRunState("error");
      setError(
        err instanceof Error
          ? `${err.message} — periksa koneksi internet HP Anda lalu coba lagi.`
          : "Terjadi kesalahan tak terduga."
      );
    }
  };

  const busy = runState === "working";

  const steps = [
    "Unduh template CSV (atau siapkan Google Sheet) untuk modul yang dipilih.",
    "Isi datanya langsung dari HP — urutan kolom bebas, sistem mengenali judulnya.",
    "Tempel tautan atau unggah berkasnya, cek pratinjau, lalu simpan."
  ];

  return (
    <div className="space-y-6 lg:space-y-7">
      {/* ── Pengantar ─────────────────────────────────────────────────── */}
      <section className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50/60 p-5 shadow-sm sm:p-7">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
            📊
          </span>
          <div className="min-w-0 space-y-2">
            <h3 className="font-serif text-lg font-bold leading-snug text-emerald-950 sm:text-xl">
              Sinkronisasi Spreadsheet → Website (Bebas RLS)
            </h3>
            <p className="max-w-3xl text-sm leading-relaxed text-emerald-900/90">
              Data ditarik dari Google Sheets atau berkas CSV, dibersihkan di server, lalu disimpan memakai{" "}
              <strong className="font-semibold">Service Role Key</strong> — sehingga tidak pernah gagal karena
              Row-Level Security, termasuk saat mengunggah dari HP. Tautan foto Google Drive otomatis diubah
              menjadi CDN cepat{" "}
              <code className="rounded-md bg-white/80 px-1.5 py-0.5 font-mono text-[12px]">
                lh3.googleusercontent.com
              </code>
              .
            </p>
          </div>
        </div>

        <ol className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {steps.map((step, index) => (
            <li
              key={step}
              className="flex items-start gap-2.5 rounded-2xl bg-white/75 px-3.5 py-3 backdrop-blur-sm"
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-[11px] font-bold text-white">
                {index + 1}
              </span>
              <span className="text-[13px] leading-snug text-emerald-950">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Peringatan dini: Service Role Key belum diset ─────────────── */}
      {serviceRoleConfigured === false && (
        <section className="flex items-start gap-3.5 rounded-3xl border border-red-200 bg-red-50 p-5 shadow-sm">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-lg shadow-sm">
            🔐
          </span>
          <div className="space-y-1.5 text-sm leading-relaxed text-red-900">
            <p className="font-bold">Mode tulis belum aktif di server ini</p>
            <p>
              Variabel{" "}
              <code className="rounded-md bg-white/80 px-1.5 py-0.5 font-mono text-[12px]">
                SUPABASE_SERVICE_ROLE_KEY
              </code>{" "}
              belum diset. Pratinjau tetap bisa dijalankan, tetapi tombol{" "}
              <strong className="font-semibold">Simpan &amp; Publikasikan</strong> akan ditolak Row-Level
              Security. Set variabel tersebut pada server/deployment lalu muat ulang halaman ini.
            </p>
          </div>
        </section>
      )}

      {/* ── Pilihan modul ─────────────────────────────────────────────── */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h4 className="text-sm font-bold text-slate-900">Pilih modul yang akan disinkronkan</h4>
          <span className="text-xs text-slate-500">4 modul · data langsung tampil di halaman publik</span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {SHEET_MODULES.map((module) => {
            const isActive = module.id === activeModuleId;
            return (
              <button
                key={module.id}
                type="button"
                onClick={() => handleSelectModule(module.id)}
                aria-pressed={isActive}
                className={`group flex flex-col gap-2.5 rounded-2xl border p-4 text-left transition ${
                  isActive
                    ? "border-emerald-900 bg-emerald-800 text-white shadow-md"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-white hover:shadow-sm"
                }`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl text-base ${
                    isActive ? "bg-white/15" : "bg-white shadow-sm"
                  }`}
                >
                  {module.emoji}
                </span>
                <span className="block text-[13px] font-bold leading-snug">{module.label}</span>
                <span
                  className={`block truncate font-mono text-[11px] ${
                    isActive ? "text-emerald-200" : "text-slate-400"
                  }`}
                >
                  {module.target}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Status terakhir ───────────────────────────────────────────── */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Kondisi data saat ini</h4>
            <p className="mt-1 text-xs text-slate-500">{activeModule.label}</p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="rounded-xl bg-slate-100 px-4 py-2.5 text-[13px] font-bold text-slate-800 transition hover:bg-slate-200"
            >
              📥 Unduh Template CSV
            </button>
            <button
              type="button"
              disabled={busy || !activeStatus?.hasBackup}
              onClick={() => runAction("rollback")}
              className="rounded-xl bg-amber-100 px-4 py-2.5 text-[13px] font-bold text-amber-900 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-40"
              title={
                activeStatus?.hasBackup
                  ? "Pulihkan data ke kondisi sebelum sinkronisasi terakhir"
                  : "Belum ada backup untuk modul ini"
              }
            >
              ↩️ Rollback
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Tersimpan</p>
            <p className="mt-1.5 text-xl font-bold leading-none text-slate-900">
              {activeStatus ? activeStatus.itemCount : 0}
              <span className="ml-1.5 text-xs font-medium text-slate-500">baris</span>
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Sinkron terakhir</p>
            <p className="mt-1.5 text-sm font-semibold leading-snug text-slate-900">
              {formatDateTime(activeStatus?.syncedAt ?? null)}
            </p>
            {activeStatus?.source && (
              <p className="mt-0.5 truncate text-[11px] text-slate-500">{activeStatus.source}</p>
            )}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Cadangan</p>
            <p className="mt-1.5 text-sm font-semibold leading-snug text-slate-900">
              {activeStatus?.hasBackup ? formatDateTime(activeStatus.backupAt) : "Belum ada"}
            </p>
          </div>
        </div>

        <p className="mt-3 font-mono text-[11px] text-slate-400">key: {activeModule.siteContentKey}</p>
      </section>

      {/* ── Sumber data ───────────────────────────────────────────────── */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h4 className="text-sm font-bold text-slate-900">Ambil data dari mana?</h4>

        <div className="mt-4 grid grid-cols-1 gap-1.5 rounded-2xl bg-slate-100 p-1.5 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => handleModeChange("url")}
            aria-pressed={mode === "url"}
            className={`rounded-xl px-4 py-3 text-[13px] font-bold transition ${
              mode === "url"
                ? "bg-white text-emerald-900 shadow"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            🔗 Mode A — Tautan Google Sheets
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("file")}
            aria-pressed={mode === "file"}
            className={`rounded-xl px-4 py-3 text-[13px] font-bold transition ${
              mode === "file"
                ? "bg-white text-emerald-900 shadow"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            📁 Mode B — Unggah CSV dari HP
          </button>
        </div>

        <div className="mt-5">
          {mode === "url" ? (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="sync-sheet-url"
                  className="mb-1.5 block text-[13px] font-semibold text-slate-700"
                >
                  Tautan Google Sheets <span className="text-red-500">*</span>
                </label>
                <input
                  id="sync-sheet-url"
                  type="url"
                  inputMode="url"
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/ID_SPREADSHEET/edit"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div>
                <label
                  htmlFor="sync-sheet-name"
                  className="mb-1.5 block text-[13px] font-semibold text-slate-700"
                >
                  Nama Tab / Sheet <span className="font-normal text-slate-400">(opsional)</span>
                </label>
                <input
                  id="sync-sheet-name"
                  type="text"
                  value={sheetName}
                  onChange={(e) => setSheetName(e.target.value)}
                  placeholder="Contoh: Masyayikh"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
                <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                  Kosongkan bila data berada pada tab pertama. Pastikan akses sheet:{" "}
                  <em>Siapa saja yang memiliki link</em>.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv,text/plain"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-3xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 px-5 py-9 text-center transition hover:border-emerald-500 hover:bg-emerald-50"
              >
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                  📁
                </span>
                <span className="mt-3 block text-sm font-bold text-emerald-900">
                  Pilih File CSV dari HP
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-slate-600">
                  {fileName
                    ? `Terpilih: ${fileName} (${(csvContent.length / 1024).toFixed(1)} KB)`
                    : "Ketuk untuk membuka galeri / penyimpanan perangkat"}
                </span>
              </button>

              {csvContent.length > 0 && (
                <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-900">
                  ✓ Berkas siap diproses ({csvContent.split(/\r?\n/).length} baris terdeteksi).
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => runAction("preview")}
            className="rounded-2xl bg-slate-800 px-4 py-3.5 text-sm font-bold text-white transition hover:bg-slate-900 disabled:opacity-50"
          >
            {busy ? "⏳ Memproses..." : "👁️ Pratinjau Data (Preview)"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => runAction("sync")}
            className="rounded-2xl bg-emerald-700 px-4 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 disabled:opacity-50"
          >
            {busy ? "⏳ Menyimpan..." : "🚀 Simpan & Publikasikan ke Website"}
          </button>
        </div>
      </section>

      {/* ── Umpan balik ───────────────────────────────────────────────── */}
      <div aria-live="polite" className="space-y-3">
        {runState === "error" && error && (
          <section className="flex items-start gap-3.5 rounded-3xl border border-red-200 bg-red-50 p-5 shadow-sm">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-lg shadow-sm">
              ⚠️
            </span>
            <div className="min-w-0 space-y-1 text-sm leading-relaxed text-red-900">
              <p className="font-bold">Sinkronisasi gagal</p>
              <p className="break-words">{error}</p>
            </div>
          </section>
        )}

        {runState === "success" && message && (
          <section className="flex items-start gap-3.5 rounded-3xl border border-emerald-300 bg-emerald-50 p-5 shadow-sm">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-lg shadow-sm">
              ✅
            </span>
            <div className="min-w-0 space-y-1 text-sm leading-relaxed text-emerald-900">
              <p className="font-bold">{message}</p>
              <p>
                Buka{" "}
                <a
                  href={activeModule.target}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline underline-offset-2"
                >
                  {activeModule.target}
                </a>{" "}
                untuk memeriksa hasilnya di halaman publik.
              </p>
            </div>
          </section>
        )}

        {warnings.length > 0 && (
          <section className="flex items-start gap-3.5 rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-lg shadow-sm">
              ℹ️
            </span>
            <div className="min-w-0 space-y-2 text-sm leading-relaxed text-amber-900">
              <p className="font-bold">Catatan ({warnings.length})</p>
              <ul className="list-disc space-y-1 pl-4">
                {warnings.map((warning, index) => (
                  <li key={index} className="break-words">
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </div>

      {/* ── Pemetaan kolom ────────────────────────────────────────────── */}
      {detectedHeaders.length > 0 && (
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <button
            type="button"
            onClick={() => setShowMapping((prev) => !prev)}
            aria-expanded={showMapping}
            className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-slate-50 sm:px-6"
          >
            <span className="text-sm font-bold text-slate-800">
              🔎 Kolom terdeteksi ({detectedHeaders.length})
            </span>
            <span className="text-xs font-bold text-slate-500">{showMapping ? "▲ Tutup" : "▼ Buka"}</span>
          </button>

          {showMapping && (
            <div className="space-y-3 border-t border-slate-100 px-5 py-4 sm:px-6">
              <div className="flex flex-wrap gap-2">
                {detectedHeaders.map((header, index) => (
                  <span
                    key={`${header}-${index}`}
                    className="rounded-lg bg-slate-100 px-2.5 py-1.5 font-mono text-[11px] text-slate-700"
                  >
                    {header || "(kosong)"}
                  </span>
                ))}
              </div>
              {unknownHeaders.length > 0 && (
                <p className="text-xs leading-relaxed text-slate-500">
                  Kolom diabaikan: {unknownHeaders.join(", ")}
                </p>
              )}
            </div>
          )}
        </section>
      )}

      {/* ── Pratinjau ─────────────────────────────────────────────────── */}
      {preview && preview.length > 0 && (
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 px-5 py-4 sm:px-6">
            <h4 className="text-sm font-bold text-slate-800">👁️ Pratinjau {preview.length} baris pertama</h4>
            <span className="text-xs text-slate-500">Periksa nama, foto, dan jabatan sebelum disimpan</span>
          </div>

          <ul className="max-h-[520px] divide-y divide-slate-100 overflow-y-auto">
            {preview.map((item, index) => (
              <li key={`${item.name}-${index}`} className="flex items-center gap-4 px-5 py-4 sm:px-6">
                <SyncAvatar src={item.photoUrl} name={item.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{item.name}</p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">
                    {item.subtitle || item.meta || "—"}
                  </p>
                </div>
                {item.badge && (
                  <span className="shrink-0 rounded-lg bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
                    {item.badge}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Panduan kolom ─────────────────────────────────────────────── */}
      <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm sm:p-6">
        <h4 className="text-sm font-bold text-slate-800">
          📋 Susunan kolom untuk {activeModule.label}
        </h4>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          Urutan kolom bebas — sistem mengenali judul kolom secara otomatis.
        </p>

        <ul className="mt-4 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {activeModule.columns.map((column) => (
            <li
              key={column.key}
              className="grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-[minmax(0,14rem)_7rem_minmax(0,1fr)] sm:items-start sm:gap-4"
            >
              <span className="text-[13px] font-semibold text-slate-900">{column.label}</span>
              <span>
                {column.required ? (
                  <span className="inline-flex rounded-md bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-700">
                    Wajib
                  </span>
                ) : (
                  <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                    Opsional
                  </span>
                )}
              </span>
              <span className="text-xs leading-relaxed text-slate-500">{column.example}</span>
            </li>
          ))}
        </ul>

        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          Gunakan tombol <strong className="font-semibold text-slate-700">📥 Unduh Template CSV</strong> agar
          susunannya 100% pas, lalu isi dari HP dan unggah kembali.
        </p>
      </section>
    </div>
  );
}

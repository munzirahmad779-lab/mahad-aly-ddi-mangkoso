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
      <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0">
        {initials || "?"}
      </div>
    );
  }

  return (
    <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 shrink-0 relative">
      <Image
        src={src}
        alt={name}
        width={44}
        height={44}
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

  return (
    <div className="space-y-5">
      {/* ── Pengantar ─────────────────────────────────────────────────── */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="text-2xl shrink-0">📊</span>
          <div className="space-y-1">
            <h3 className="font-bold text-emerald-950 text-sm sm:text-base">
              Sinkronisasi Spreadsheet → Website (Bebas RLS)
            </h3>
            <p className="text-xs text-emerald-900 leading-relaxed">
              Data ditarik dari Google Sheets atau berkas CSV, dibersihkan di server, lalu disimpan
              memakai <strong>Service Role Key</strong> — sehingga tidak pernah gagal karena Row-Level
              Security, termasuk saat mengunggah dari HP. Link foto Google Drive otomatis diubah ke CDN
              cepat <code className="bg-white/70 px-1 rounded">lh3.googleusercontent.com</code>.
            </p>
          </div>
        </div>
      </div>

      {/* ── Peringatan dini: Service Role Key belum diset ─────────────── */}
      {serviceRoleConfigured === false && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-xl shrink-0">🔐</span>
          <div className="space-y-1 text-xs text-red-900 leading-relaxed">
            <p className="font-bold">Mode tulis belum aktif di server ini</p>
            <p>
              Variabel <code className="bg-white/80 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> belum
              diset. Pratinjau tetap bisa dijalankan, tetapi tombol{" "}
              <strong>Simpan &amp; Publikasikan</strong> akan ditolak Row-Level Security. Set variabel
              tersebut pada server/deployment lalu muat ulang halaman ini.
            </p>
          </div>
        </div>
      )}

      {/* ── Pilihan modul ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {SHEET_MODULES.map((module) => {
          const isActive = module.id === activeModuleId;
          return (
            <button
              key={module.id}
              type="button"
              onClick={() => handleSelectModule(module.id)}
              className={`text-left p-3 rounded-xl border transition ${
                isActive
                  ? "bg-emerald-800 text-white border-emerald-900 shadow"
                  : "bg-white text-slate-700 border-slate-200 hover:border-emerald-300"
              }`}
            >
              <span className="text-lg block">{module.emoji}</span>
              <span className="block text-xs font-bold mt-1 leading-tight">{module.label}</span>
              <span
                className={`block text-[10px] mt-1 ${isActive ? "text-emerald-200" : "text-slate-500"}`}
              >
                {module.target}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Status terakhir ───────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-slate-700 space-y-0.5">
          <p>
            <strong>Data tersimpan saat ini:</strong>{" "}
            {activeStatus ? `${activeStatus.itemCount} baris` : "—"}
          </p>
          <p className="text-slate-500">
            Sinkron terakhir: {formatDateTime(activeStatus?.syncedAt ?? null)}
            {activeStatus?.source ? ` • ${activeStatus.source}` : ""}
          </p>
          <p className="text-slate-500 font-mono text-[10px]">
            key: {activeModule.siteContentKey}
            {activeStatus?.hasBackup ? ` • backup: ${formatDateTime(activeStatus.backupAt)}` : ""}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="text-xs font-bold px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800"
          >
            📥 Unduh Template CSV
          </button>
          <button
            type="button"
            disabled={busy || !activeStatus?.hasBackup}
            onClick={() => runAction("rollback")}
            className="text-xs font-bold px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 disabled:opacity-40 disabled:cursor-not-allowed"
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

      {/* ── Sumber data ───────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleModeChange("url")}
            className={`flex-1 min-w-[140px] text-xs font-bold px-3 py-2.5 rounded-xl border transition ${
              mode === "url"
                ? "bg-emerald-800 text-white border-emerald-900"
                : "bg-slate-50 text-slate-700 border-slate-200"
            }`}
          >
            🔗 Mode A — Tautan Google Sheets
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("file")}
            className={`flex-1 min-w-[140px] text-xs font-bold px-3 py-2.5 rounded-xl border transition ${
              mode === "file"
                ? "bg-emerald-800 text-white border-emerald-900"
                : "bg-slate-50 text-slate-700 border-slate-200"
            }`}
          >
            📁 Mode B — Unggah CSV dari HP
          </button>
        </div>

        {mode === "url" ? (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tautan Google Sheets (wajib publik)
              </label>
              <input
                type="url"
                inputMode="url"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/ID_SPREADSHEET/edit"
                className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Tab / Sheet (opsional)
              </label>
              <input
                type="text"
                value={sheetName}
                onChange={(e) => setSheetName(e.target.value)}
                placeholder="Contoh: Masyayikh"
                className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">
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
              className="w-full border-2 border-dashed border-emerald-300 rounded-2xl p-6 text-center hover:bg-emerald-50 transition"
            >
              <span className="text-3xl block">📁</span>
              <span className="block text-sm font-bold text-emerald-900 mt-2">
                Pilih File CSV dari HP
              </span>
              <span className="block text-[11px] text-slate-600 mt-1">
                {fileName
                  ? `Terpilih: ${fileName} (${(csvContent.length / 1024).toFixed(1)} KB)`
                  : "Ketuk untuk membuka galeri / penyimpanan perangkat"}
              </span>
            </button>
            {csvContent.length > 0 && (
              <p className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                ✓ Berkas siap diproses ({csvContent.split(/\r?\n/).length} baris terdeteksi).
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <button
            type="button"
            disabled={busy}
            onClick={() => runAction("preview")}
            className="flex-1 text-xs font-bold px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white disabled:opacity-50"
          >
            {busy ? "⏳ Memproses..." : "👁️ Pratinjau Data (Preview)"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => runAction("sync")}
            className="flex-1 text-xs font-bold px-4 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white disabled:opacity-50 shadow"
          >
            {busy ? "⏳ Menyimpan..." : "🚀 Simpan & Publikasikan ke Website"}
          </button>
        </div>
      </div>

      {/* ── Umpan balik ───────────────────────────────────────────────── */}
      {runState === "error" && error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4 text-xs leading-relaxed">
          <strong className="block mb-1">⚠️ Sinkronisasi gagal</strong>
          {error}
        </div>
      )}

      {runState === "success" && message && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl p-4 text-xs leading-relaxed space-y-1">
          <strong className="block">✅ {message}</strong>
          <span>
            Buka{" "}
            <a
              href={activeModule.target}
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-bold"
            >
              {activeModule.target}
            </a>{" "}
            untuk memeriksa hasilnya di halaman publik.
          </span>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4 text-xs space-y-1">
          <strong className="block">ℹ️ Catatan ({warnings.length})</strong>
          <ul className="list-disc pl-4 space-y-0.5">
            {warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Pemetaan kolom ────────────────────────────────────────────── */}
      {detectedHeaders.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <button
            type="button"
            onClick={() => setShowMapping((prev) => !prev)}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-700"
          >
            <span>🔎 Kolom terdeteksi ({detectedHeaders.length})</span>
            <span>{showMapping ? "▲" : "▼"}</span>
          </button>
          {showMapping && (
            <div className="mt-3 space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {detectedHeaders.map((header, index) => (
                  <span
                    key={`${header}-${index}`}
                    className="text-[10px] px-2 py-1 rounded bg-slate-100 text-slate-700 font-mono"
                  >
                    {header || "(kosong)"}
                  </span>
                ))}
              </div>
              {unknownHeaders.length > 0 && (
                <p className="text-[11px] text-slate-500">
                  Kolom diabaikan: {unknownHeaders.join(", ")}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Pratinjau ─────────────────────────────────────────────────── */}
      {preview && preview.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b bg-slate-50 flex items-center justify-between flex-wrap gap-2">
            <h4 className="text-xs font-bold text-slate-800">
              👁️ Pratinjau {preview.length} baris pertama
            </h4>
            <span className="text-[11px] text-slate-500">
              Periksa nama, foto, dan jabatan sebelum dipublikasikan
            </span>
          </div>
          <div className="divide-y divide-slate-100 max-h-[460px] overflow-y-auto">
            {preview.map((item, index) => (
              <div key={`${item.name}-${index}`} className="p-3 flex items-center gap-3">
                <SyncAvatar src={item.photoUrl} name={item.name} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {item.subtitle || item.meta || "—"}
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded bg-emerald-100 text-emerald-800 whitespace-nowrap">
                  {item.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Panduan kolom ─────────────────────────────────────────────── */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
        <h4 className="text-xs font-bold text-slate-800">
          📋 Susunan kolom wajib untuk {activeModule.label}
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="py-1.5 pr-3 font-bold">Kolom</th>
                <th className="py-1.5 pr-3 font-bold">Wajib</th>
                <th className="py-1.5 font-bold">Contoh</th>
              </tr>
            </thead>
            <tbody>
              {activeModule.columns.map((column) => (
                <tr key={column.key} className="border-t border-slate-200">
                  <td className="py-1.5 pr-3 font-semibold text-slate-800 whitespace-nowrap">
                    {column.label}
                  </td>
                  <td className="py-1.5 pr-3">
                    {column.required ? (
                      <span className="text-red-600 font-bold">Wajib</span>
                    ) : (
                      <span className="text-slate-400">Opsional</span>
                    )}
                  </td>
                  <td className="py-1.5 text-slate-600">{column.example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-slate-500 pt-1">
          Urutan kolom bebas — sistem mengenali judul kolom secara otomatis. Gunakan tombol{" "}
          <strong>📥 Unduh Template CSV</strong> agar susunannya 100% pas, lalu isi dari HP dan unggah
          kembali.
        </p>
      </div>
    </div>
  );
}

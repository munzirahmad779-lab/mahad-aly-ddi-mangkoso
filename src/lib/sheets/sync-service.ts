/**
 * ══════════════════════════════════════════════════════════════════════════
 *  SPREADSHEET SYNC SERVICE — Server-only
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Semua penulisan ke PostgreSQL dilakukan dengan `supabaseAdmin`
 * (Service Role Key) sehingga TIDAK PERNAH terbentur Row-Level Security —
 * termasuk ketika admin mengunggah dari HP dengan sesi yang lemah.
 *
 * Alur simpan:
 *   1. Baca nilai lama pada key tujuan
 *   2. Snapshot ke `backup_before_sync_{module}`  (rollback 1 klik)
 *   3. Tulis payload baru ke key utama + key alias (PASAL 5)
 *   4. Catat jejak audit pada `activity_logs`
 */

import { supabaseAdmin } from "@/lib/supabase/server";
import type { DemaDivision, DemaMember, DemaSettings } from "@/lib/types";
import {
  normalizeDemaRows,
  normalizeKurikulumRows,
  normalizeMasyayikhRows,
  normalizeSaranaRows,
  parseSheetCsv,
  type SheetModuleDef
} from "@/lib/sheets/spreadsheet";

/** True bila Service Role Key tersedia — syarat agar penulisan bebas RLS. */
export function isServiceRoleConfigured(): boolean {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return key.trim().length > 0;
}

export class SyncError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "SyncError";
    this.status = status;
  }
}

const MAX_CSV_BYTES = 5 * 1024 * 1024; // 5 MB — cukup untuk ribuan baris
const DOWNLOAD_TIMEOUT_MS = 15_000;

const SYNC_GROUP: Record<string, string> = {
  masyayikh: "profile",
  kurikulum: "academics",
  sarana: "profile",
  dema: "dema"
};

const SYNC_LABEL: Record<string, string> = {
  masyayikh: "Data Masyayikh & Dewan Dosen (Sinkron Spreadsheet)",
  kurikulum: "Data Kurikulum & Mata Kuliah (Sinkron Spreadsheet)",
  sarana: "Data Sarana & Prasarana (Sinkron Spreadsheet)",
  dema: "Data Dewan Mahasantri / DeMa (Sinkron Spreadsheet)"
};

export function getBackupKey(moduleId: string): string {
  return `backup_before_sync_${moduleId}`;
}

// ──────────────────────────────────────────────────────────────────────────
// Unduh CSV dari Google Sheets
// ──────────────────────────────────────────────────────────────────────────

/**
 * Unduh teks CSV dari URL Google Sheets (gviz) dengan batas waktu & ukuran.
 * Memberi pesan ramah bila sheet belum dibagikan publik.
 */
export async function downloadSheetCsv(csvUrl: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT_MS);

  try {
    const response = await fetch(csvUrl, {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; MahadAlySheetsSync/1.0; +https://mahadaly-ddimangkoso.my.id)",
        Accept: "text/csv,text/plain,*/*"
      }
    });

    if (!response.ok) {
      throw new SyncError(
        `Google Sheets menolak permintaan (HTTP ${response.status}). ` +
          `Pastikan spreadsheet dibagikan sebagai "Siapa saja yang memiliki link".`,
        502
      );
    }

    const contentLength = Number(response.headers.get("content-length") || 0);
    if (contentLength > MAX_CSV_BYTES) {
      throw new SyncError("Ukuran spreadsheet terlalu besar (maksimal 5 MB).", 413);
    }

    const text = await response.text();

    if (text.length > MAX_CSV_BYTES) {
      throw new SyncError("Ukuran spreadsheet terlalu besar (maksimal 5 MB).", 413);
    }

    const head = text.trimStart().slice(0, 200).toLowerCase();
    if (head.startsWith("<!doctype") || head.startsWith("<html") || head.includes("<html")) {
      throw new SyncError(
        "Tautan mengembalikan halaman HTML, bukan CSV. Biasanya karena spreadsheet masih privat. " +
          'Buka Google Sheets → Bagikan → ubah akses menjadi "Siapa saja yang memiliki link", lalu coba lagi.',
        400
      );
    }

    if (!text.trim()) {
      throw new SyncError("Spreadsheet kosong — tidak ada data yang bisa ditarik.", 400);
    }

    return text;
  } catch (error) {
    if (error instanceof SyncError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new SyncError(
        "Pengunduhan spreadsheet melebihi 15 detik. Periksa koneksi internet lalu coba lagi.",
        504
      );
    }
    throw new SyncError(
      `Gagal mengunduh spreadsheet: ${error instanceof Error ? error.message : String(error)}`,
      502
    );
  } finally {
    clearTimeout(timer);
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Baca / tulis site_content
// ──────────────────────────────────────────────────────────────────────────

export async function readSiteContentValue(key: string): Promise<unknown> {
  const { data, error } = await supabaseAdmin
    .from("site_content")
    .select("value, updated_at")
    .eq("key", key)
    .maybeSingle();

  if (error) {
    // PGRST116 = tidak ada baris; bukan kesalahan fatal
    if (error.code === "PGRST116") return null;
    throw new SyncError(`Gagal membaca konten "${key}": ${error.message}`, 500);
  }

  return data?.value ?? null;
}

async function writeSiteContent(
  key: string,
  groupName: string,
  label: string,
  value: unknown
): Promise<void> {
  const { error } = await supabaseAdmin.from("site_content").upsert(
    {
      key,
      group_name: groupName,
      label,
      value,
      updated_at: new Date().toISOString()
    },
    { onConflict: "key" }
  );

  if (error) {
    const looksLikeRls =
      error.code === "42501" || /row-level security|permission denied|jwt/i.test(error.message || "");

    if (looksLikeRls) {
      throw new SyncError(
        `Database menolak penyimpanan "${key}" karena kebijakan Row-Level Security. ` +
          `Pastikan variabel lingkungan SUPABASE_SERVICE_ROLE_KEY (Service Role) sudah diset pada server/deployment, ` +
          `lalu ulangi sinkronisasi. Detail: ${error.message}`,
        503
      );
    }

    throw new SyncError(`Gagal menyimpan "${key}" ke database: ${error.message}`, 500);
  }
}

async function appendAuditLog(action: string, target: string, actorEmail: string): Promise<void> {
  try {
    const existing = await readSiteContentValue("activity_logs");
    const logs = Array.isArray(existing) ? existing : [];

    const entry = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      user: actorEmail || "Admin",
      action,
      target,
      timestamp: new Date().toLocaleString("id-ID", { timeZone: "Asia/Makassar" })
    };

    const merged = [entry, ...logs].slice(0, 300);

    await supabaseAdmin.from("site_content").upsert(
      {
        key: "activity_logs",
        group_name: "system",
        label: "Log Aktivitas Admin",
        value: merged,
        updated_at: new Date().toISOString()
      },
      { onConflict: "key" }
    );
  } catch (error) {
    // Jejak audit tidak boleh menggagalkan sinkronisasi utama
    console.warn("Gagal mencatat log aktivitas sinkronisasi:", error);
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Normalisasi per modul
// ──────────────────────────────────────────────────────────────────────────

export interface SyncPreviewItem {
  name: string;
  subtitle: string;
  badge: string;
  photoUrl: string;
  meta: string;
}

export interface SyncExecutionResult {
  module: string;
  moduleLabel: string;
  target: string;
  previewMode: boolean;
  count: number;
  items: unknown[];
  previewItems: SyncPreviewItem[];
  warnings: string[];
  skipped: { row: number; reason: string }[];
  missingRequired: string[];
  unknownHeaders: string[];
  headerCount: number;
  detectedHeaders: string[];
  backupKey: string;
  syncedAt: string;
  source: string;
  message: string;
}

function buildPreviewItems(moduleId: string, items: unknown[]): SyncPreviewItem[] {
  const list = items.slice(0, 40);

  if (moduleId === "kurikulum") {
    return list.map((raw) => {
      const item = raw as {
        name: string;
        code?: string;
        semester: number;
        credits: number;
        lecturer: string;
        mainBook: string;
      };
      return {
        name: item.name,
        subtitle: item.lecturer || "Dewan Masyaikh",
        badge: `Smtr ${item.semester} • ${item.credits} SKS`,
        photoUrl: "",
        meta: item.mainBook || item.code || ""
      };
    });
  }

  if (moduleId === "sarana") {
    return list.map((raw) => {
      const item = raw as { name: string; category: string; photoUrl: string; capacity?: string };
      return {
        name: item.name,
        subtitle: item.capacity || "",
        badge: item.category || "Fasilitas",
        photoUrl: item.photoUrl || "",
        meta: item.photoUrl ? "Foto CDN siap" : "Tanpa foto"
      };
    });
  }

  if (moduleId === "dema") {
    return list.map((raw) => {
      const item = raw as { name: string; role: string; nim?: string; photoUrl?: string; divisionId: string };
      return {
        name: item.name,
        subtitle: item.nim ? `NIM ${item.nim}` : "",
        badge: item.role || "Anggota",
        photoUrl: item.photoUrl || "",
        meta: item.divisionId || ""
      };
    });
  }

  return list.map((raw) => {
    const item = raw as {
      name: string;
      title: string;
      role: string;
      photoUrl: string;
      isActive: boolean;
    };
    return {
      name: item.name,
      subtitle: item.role || "",
      badge: item.title || "Dosen",
      photoUrl: item.photoUrl || "",
      meta: item.isActive ? "Aktif" : "Non-Aktif"
    };
  });
}

async function loadDemaContext(): Promise<{
  divisions: DemaDivision[];
  members: DemaMember[];
  currentSettings: DemaSettings | null;
}> {
  const value = await readSiteContentValue("dema_settings");
  const currentSettings = (value && typeof value === "object" ? value : null) as DemaSettings | null;

  return {
    divisions: Array.isArray(currentSettings?.divisions) ? currentSettings!.divisions : [],
    members: Array.isArray(currentSettings?.members) ? currentSettings!.members : [],
    currentSettings
  };
}

// ──────────────────────────────────────────────────────────────────────────
// Eksekusi sinkronisasi
// ──────────────────────────────────────────────────────────────────────────

export interface SyncExecutionInput {
  module: SheetModuleDef;
  csvText: string;
  sourceLabel: string;
  actorEmail: string;
  preview: boolean;
}

export async function executeSheetSync(
  input: SyncExecutionInput
): Promise<SyncExecutionResult> {
  const { module, csvText, sourceLabel, actorEmail, preview } = input;

  const parsed = parseSheetCsv(csvText, module);

  if (parsed.records.length === 0) {
    const detail =
      parsed.missingRequired.length > 0
        ? ` Kolom wajib tidak ditemukan: ${parsed.missingRequired.join(", ")}.`
        : parsed.droppedRows.length > 0
        ? ` ${parsed.droppedRows.length} baris berisi data tetapi kolom wajibnya kosong ` +
          `(contoh baris ${parsed.droppedRows[0].row}: ${parsed.droppedRows[0].reason}).`
        : " Pastikan baris pertama berisi judul kolom dan ada minimal satu baris data.";
    throw new SyncError(
      `Tidak ada baris data valid pada spreadsheet.${detail} ` +
        `Gunakan tombol "Unduh Template" agar susunan kolom 100% sesuai.`,
      400
    );
  }

  if (parsed.missingRequired.length > 0) {
    throw new SyncError(
      `Kolom wajib belum ada pada spreadsheet: ${parsed.missingRequired.join(", ")}. ` +
        `Unduh template CSV untuk melihat judul kolom yang benar.`,
      400
    );
  }

  let items: unknown[] = [];
  // Baris yang dibuang saat pembacaan CSV (kolom wajib kosong) + saat normalisasi
  const skipped: { row: number; reason: string }[] = [...parsed.droppedRows];

  if (module.id === "masyayikh") {
    const result = normalizeMasyayikhRows(parsed.records);
    items = result.items;
    skipped.push(...result.skipped);
  } else if (module.id === "kurikulum") {
    const result = normalizeKurikulumRows(parsed.records);
    items = result.items;
    skipped.push(...result.skipped);
  } else if (module.id === "sarana") {
    const result = normalizeSaranaRows(parsed.records);
    items = result.items;
    skipped.push(...result.skipped);
  } else {
    const context = await loadDemaContext();
    const result = normalizeDemaRows(parsed.records, {
      divisions: context.divisions,
      existingMembers: context.members
    });
    items = result.items;
    skipped.push(...result.skipped);
  }

  if (items.length === 0) {
    throw new SyncError(
      "Semua baris gagal diproses. Periksa kembali kolom nama (wajib terisi) pada spreadsheet Anda.",
      400
    );
  }

  const now = new Date().toISOString();
  const warnings = [...parsed.warnings];

  if (skipped.length > 0) {
    warnings.push(
      `${skipped.length} baris dilewati karena tidak memenuhi kolom wajib (contoh: baris ${skipped[0].row} — ${skipped[0].reason}).`
    );
  }

  if (module.id === "dema") {
    const context = await loadDemaContext();
    const unmatched = (items as DemaMember[]).filter((member) => !member.divisionId);
    if (unmatched.length > 0) {
      warnings.push(
        `${unmatched.length} pengurus tidak memiliki divisi yang cocok pada teks "Divisi / Amanah" — ` +
          `mereka tetap tampil pada filter "Semua Divisi".`
      );
    }
    if (!context.currentSettings) {
      warnings.push(
        "Konten DeMa (divisi & kabinet) belum ada di database; hanya daftar pengurus yang disimpan."
      );
    }
  }

  const previewItems = buildPreviewItems(module.id, items);

  if (preview) {
    return {
      module: module.id,
      moduleLabel: module.label,
      target: module.target,
      previewMode: true,
      count: items.length,
      items,
      previewItems,
      warnings,
      skipped,
      missingRequired: parsed.missingRequired,
      unknownHeaders: parsed.unknownHeaders,
      headerCount: parsed.headers.length,
      detectedHeaders: parsed.headers,
      backupKey: getBackupKey(module.id),
      syncedAt: now,
      source: sourceLabel,
      message: `Pratinjau siap: ${items.length} baris terbaca dan siap dipublikasikan.`
    };
  }

  // ── 1. Snapshot data lama (rollback 1 klik) ──────────────────────────────
  const backupKey = getBackupKey(module.id);
  const previousValue = await readSiteContentValue(module.siteContentKey);

  if (previousValue !== null && previousValue !== undefined) {
    await writeSiteContent(
      backupKey,
      "system",
      `Backup sebelum sinkronisasi ${module.label}`,
      {
        module: module.id,
        backedUpAt: now,
        previous: previousValue
      }
    );
  }

  // ── 2. Susun payload ────────────────────────────────────────────────────
  const meta = {
    module: module.id,
    syncedAt: now,
    source: sourceLabel,
    count: items.length,
    syncedBy: actorEmail
  };

  const group = SYNC_GROUP[module.id] || "profile";
  const label = SYNC_LABEL[module.id] || `Data ${module.label}`;

  // ── 3. Tulis ke database (Service Role → bebas RLS) ─────────────────────
  if (module.id === "dema") {
    const context = await loadDemaContext();
    const mergedSettings: Record<string, unknown> = {
      ...(context.currentSettings || {}),
      members: items,
      lastSync: meta
    };

    if (!context.currentSettings) {
      // Jangan menimpa pengaturan divisi bawaan di sisi klien
      delete mergedSettings.divisions;
    }

    await writeSiteContent(module.siteContentKey, group, label, mergedSettings);
  } else {
    const payload = { items, meta };
    await writeSiteContent(module.siteContentKey, group, label, payload);

    // Alias kompatibilitas PASAL 5 (lecturers_data / courses_data / facilities_data)
    for (const aliasKey of module.aliasKeys) {
      await writeSiteContent(aliasKey, group, label, payload);
    }
  }

  // ── 4. Jejak audit ──────────────────────────────────────────────────────
  await appendAuditLog(
    `Sinkronisasi Spreadsheet (${module.label})`,
    `${items.length} data — ${sourceLabel}`,
    actorEmail
  );

  return {
    module: module.id,
    moduleLabel: module.label,
    target: module.target,
    previewMode: false,
    count: items.length,
    items,
    previewItems,
    warnings,
    skipped,
    missingRequired: parsed.missingRequired,
    unknownHeaders: parsed.unknownHeaders,
    headerCount: parsed.headers.length,
    detectedHeaders: parsed.headers,
    backupKey,
    syncedAt: now,
    source: sourceLabel,
    message: `✓ Berhasil menyinkronkan ${items.length} ${module.label} ke website!`
  };
}

// ──────────────────────────────────────────────────────────────────────────
// Status & rollback
// ──────────────────────────────────────────────────────────────────────────

export interface SyncModuleStatus {
  module: string;
  moduleLabel: string;
  siteContentKey: string;
  itemCount: number;
  syncedAt: string | null;
  source: string | null;
  hasBackup: boolean;
  backupAt: string | null;
}

export async function getModuleStatus(module: SheetModuleDef): Promise<SyncModuleStatus> {
  const current = await readSiteContentValue(module.siteContentKey);
  const backup = await readSiteContentValue(getBackupKey(module.id));

  let itemCount = 0;
  let syncedAt: string | null = null;
  let source: string | null = null;

  if (module.id === "dema") {
    const dema = current as DemaSettings | null;
    itemCount = Array.isArray(dema?.members) ? dema!.members.length : 0;
    const lastSync = (current as { lastSync?: { syncedAt?: string; source?: string } } | null)?.lastSync;
    syncedAt = lastSync?.syncedAt ?? null;
    source = lastSync?.source ?? null;
  } else {
    const payload = current as { items?: unknown[]; meta?: { syncedAt?: string; source?: string } } | null;
    if (Array.isArray(current)) {
      itemCount = current.length;
    } else if (payload && Array.isArray(payload.items)) {
      itemCount = payload.items.length;
      syncedAt = payload.meta?.syncedAt ?? null;
      source = payload.meta?.source ?? null;
    }
  }

  const backupShape = backup as { backedUpAt?: string; previous?: unknown } | null;

  return {
    module: module.id,
    moduleLabel: module.label,
    siteContentKey: module.siteContentKey,
    itemCount,
    syncedAt,
    source,
    hasBackup: Boolean(backupShape && backupShape.previous !== undefined),
    backupAt: backupShape?.backedUpAt ?? null
  };
}

export async function rollbackModule(
  module: SheetModuleDef,
  actorEmail: string
): Promise<{ module: string; itemCount: number; message: string }> {
  const backupKey = getBackupKey(module.id);
  const backup = (await readSiteContentValue(backupKey)) as
    | { previous?: unknown; backedUpAt?: string }
    | null;

  if (!backup || backup.previous === undefined || backup.previous === null) {
    throw new SyncError(
      "Belum ada cadangan (backup) untuk modul ini. Backup otomatis dibuat setiap kali sinkronisasi pertama kali dijalankan.",
      404
    );
  }

  const restored = backup.previous;
  const group = SYNC_GROUP[module.id] || "profile";
  const label = SYNC_LABEL[module.id] || `Data ${module.label}`;

  // Simpan keadaan sekarang agar rollback pun bisa dibatalkan
  const current = await readSiteContentValue(module.siteContentKey);

  await writeSiteContent(module.siteContentKey, group, label, restored);

  for (const aliasKey of module.aliasKeys) {
    await writeSiteContent(aliasKey, group, label, restored);
  }

  await writeSiteContent(backupKey, "system", `Backup sebelum sinkronisasi ${module.label}`, {
    module: module.id,
    backedUpAt: new Date().toISOString(),
    previous: current
  });

  const restoredDema = restored as DemaSettings | null;
  const itemCount =
    module.id === "dema"
      ? Array.isArray(restoredDema?.members)
        ? restoredDema!.members.length
        : 0
      : Array.isArray(restored)
      ? restored.length
      : Array.isArray((restored as { items?: unknown[] })?.items)
      ? ((restored as { items: unknown[] }).items.length)
      : 0;

  await appendAuditLog(
    `Rollback Sinkronisasi (${module.label})`,
    `Dipulihkan ke versi ${backup.backedUpAt || "sebelumnya"}`,
    actorEmail
  );

  return {
    module: module.id,
    itemCount,
    message: `✓ Data ${module.label} berhasil dipulihkan ke versi sebelum sinkronisasi (${itemCount} baris).`
  };
}

import { NextResponse } from "next/server";
import { requireRole } from "@/lib/supabase/admin-guard";
import {
  getSheetModule,
  resolveSheetSource,
  SHEET_MODULES
} from "@/lib/sheets/spreadsheet";
import {
  downloadSheetCsv,
  executeSheetSync,
  getModuleStatus,
  isServiceRoleConfigured,
  rollbackModule,
  SyncError
} from "@/lib/sheets/sync-service";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_INLINE_CSV_CHARS = 5 * 1024 * 1024;

function errorResponse(error: unknown) {
  if (error instanceof SyncError) {
    return NextResponse.json({ success: false, error: error.message }, { status: error.status });
  }

  console.error("API /api/admin/sync/sheets error:", error);
  return NextResponse.json(
    {
      success: false,
      error:
        error instanceof Error ? error.message : "Terjadi kesalahan tak terduga saat sinkronisasi."
    },
    { status: 500 }
  );
}

/**
 * GET /api/admin/sync/sheets?module=masyayikh
 * Status sinkronisasi terakhir + ketersediaan backup untuk panel admin.
 */
export async function GET(request: Request) {
  const auth = await requireRole(request, ["super_admin", "editor"]);
  if (!auth.ok) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get("module");

    if (moduleId) {
      const sheetModule = getSheetModule(moduleId);
      if (!sheetModule) {
        return NextResponse.json(
          { success: false, error: `Modul "${moduleId}" tidak dikenal.` },
          { status: 400 }
        );
      }
      const status = await getModuleStatus(sheetModule);
      return NextResponse.json({
        success: true,
        data: status,
        serviceRoleConfigured: isServiceRoleConfigured()
      });
    }

    const statuses = await Promise.all(SHEET_MODULES.map((module) => getModuleStatus(module)));
    return NextResponse.json({
      success: true,
      data: statuses,
      serviceRoleConfigured: isServiceRoleConfigured(),
      modules: SHEET_MODULES.map((module) => ({
        id: module.id,
        label: module.label,
        emoji: module.emoji,
        target: module.target,
        description: module.description,
        siteContentKey: module.siteContentKey
      }))
    });
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * POST /api/admin/sync/sheets
 *
 * Body:
 * {
 *   action: "preview" | "sync" | "rollback",
 *   module: "masyayikh" | "kurikulum" | "sarana" | "dema",
 *   sheetUrl?: string,       // Mode A — tautan Google Sheets
 *   sheetName?: string,      // nama tab (opsional)
 *   csvContent?: string      // Mode B — isi file CSV dari HP
 * }
 */
export async function POST(request: Request) {
  const auth = await requireRole(request, ["super_admin", "editor"]);
  if (!auth.ok) return auth.response;

  try {
    const body = (await request.json().catch(() => null)) as
      | {
          action?: string;
          module?: string;
          sheetUrl?: string;
          sheetName?: string;
          csvContent?: string;
        }
      | null;

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Body permintaan tidak valid (harus JSON)." },
        { status: 400 }
      );
    }

    const action = (body.action || "sync").toLowerCase();
    const sheetModule = getSheetModule(body.module);
    if (!sheetModule) {
      return NextResponse.json(
        {
          success: false,
          error: `Modul sinkronisasi tidak dikenal. Pilih salah satu: ${SHEET_MODULES.map((m) => m.id).join(", ")}.`
        },
        { status: 400 }
      );
    }

    // ── Rollback 1 klik ────────────────────────────────────────────────────
    if (action === "rollback") {
      const result = await rollbackModule(sheetModule, auth.email);
      return NextResponse.json({ success: true, ...result });
    }

    // ── Ambil sumber CSV: Mode A (URL) atau Mode B (upload berkas) ─────────
    let csvText = "";
    let sourceLabel = "";

    const inlineCsv = typeof body.csvContent === "string" ? body.csvContent : "";

    if (inlineCsv.trim().length > 0) {
      if (inlineCsv.length > MAX_INLINE_CSV_CHARS) {
        return NextResponse.json(
          { success: false, error: "Berkas CSV terlalu besar (maksimal 5 MB)." },
          { status: 413 }
        );
      }
      csvText = inlineCsv;
      sourceLabel = body.sheetName?.trim()
        ? `Upload CSV — ${body.sheetName.trim()}`
        : "Upload CSV dari perangkat admin";
    } else if (body.sheetUrl?.trim()) {
      const source = resolveSheetSource(body.sheetUrl, body.sheetName);
      if (!source) {
        return NextResponse.json(
          {
            success: false,
            error:
              'Tautan Google Sheets tidak dikenali. Contoh yang benar: https://docs.google.com/spreadsheets/d/ID_SPREADSHEET/edit'
          },
          { status: 400 }
        );
      }

      csvText = await downloadSheetCsv(source.csvUrl);
      sourceLabel = source.sheetName
        ? `Google Sheets — tab "${source.sheetName}"`
        : `Google Sheets — ${source.sheetId}`;
    } else {
      return NextResponse.json(
        {
          success: false,
          error:
            'Sertakan "sheetUrl" (tautan Google Sheets) atau "csvContent" (isi berkas CSV) untuk memulai sinkronisasi.'
        },
        { status: 400 }
      );
    }

    const result = await executeSheetSync({
      module: sheetModule,
      csvText,
      sourceLabel,
      actorEmail: auth.email,
      preview: action === "preview"
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return errorResponse(error);
  }
}

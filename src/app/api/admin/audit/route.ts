import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireRole } from "@/lib/supabase/admin-guard";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, ["super_admin", "editor", "penulis"]);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const { data: record, error } = await supabaseAdmin
      .from("site_content")
      .select("value")
      .eq("key", "activity_logs")
      .maybeSingle();

    if (error) {
      console.error("Error reading activity_logs:", error);
    }

    const logs = Array.isArray(record?.value) ? record.value : [];

    return NextResponse.json(
      {
        success: true,
        logs
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache"
        }
      }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireRole(req, ["super_admin", "editor", "penulis"]);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { action, target, user } = body;

    if (!action || !target) {
      return NextResponse.json(
        { success: false, error: "Action dan target wajib diisi." },
        { status: 400 }
      );
    }

    const now = new Date();
    const formattedDate = now.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
    const formattedTime =
      now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit"
      }) + " WITA";

    const newLog = {
      id: "log-" + Date.now().toString(),
      user: user || auth.email || "Administrator",
      action,
      target,
      timestamp: `${formattedDate}, ${formattedTime}`
    };

    // Ambil log yang ada saat ini
    const { data: record } = await supabaseAdmin
      .from("site_content")
      .select("value")
      .eq("key", "activity_logs")
      .maybeSingle();

    const existingLogs = Array.isArray(record?.value) ? record.value : [];
    const updatedLogs = [newLog, ...existingLogs.slice(0, 249)]; // Simpan 250 log terakhir

    await supabaseAdmin.from("site_content").upsert(
      {
        key: "activity_logs",
        group_name: "audit",
        label: "Arsip Log Aktivitas Admin",
        value: updatedLogs,
        updated_at: new Date().toISOString()
      },
      { onConflict: "key" }
    );

    return NextResponse.json({
      success: true,
      log: newLog,
      totalLogs: updatedLogs.length
    });
  } catch (err: any) {
    console.error("Error creating audit log:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  // Hanya Super Admin yang berhak mengosongkan log audit
  const auth = await requireRole(req, ["super_admin"]);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    await supabaseAdmin.from("site_content").upsert(
      {
        key: "activity_logs",
        group_name: "audit",
        label: "Arsip Log Aktivitas Admin",
        value: [],
        updated_at: new Date().toISOString()
      },
      { onConflict: "key" }
    );

    return NextResponse.json({
      success: true,
      message: "Arsip log aktivitas berhasil dikosongkan."
    });
  } catch (err: any) {
    console.error("Error clearing audit logs:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

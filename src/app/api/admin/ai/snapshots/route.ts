import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/supabase/admin-guard";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, ["super_admin", "editor"]);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const { data } = await supabaseAdmin
      .from("site_content")
      .select("value")
      .eq("key", "ai_content_snapshots")
      .maybeSingle();

    const snapshots = Array.isArray(data?.value) ? data.value : [];
    return NextResponse.json({
      success: true,
      snapshots
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Gagal mengambil daftar snapshot." },
      { status: 500 }
    );
  }
}

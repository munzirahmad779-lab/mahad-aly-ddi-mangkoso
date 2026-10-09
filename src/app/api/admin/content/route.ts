import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (key) {
      const { data, error } = await supabaseAdmin
        .from("site_content")
        .select("*")
        .eq("key", key)
        .single();

      if (error && error.code !== "PGRST116") {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, data: data?.value || null });
    }

    const { data, error } = await supabaseAdmin
      .from("site_content")
      .select("*");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const mapped = (data || []).reduce((acc: Record<string, any>, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {});

    return NextResponse.json({ success: true, data: mapped });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal memuat konten" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { key, group_name, label, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: "Key dan value wajib diisi." }, { status: 400 });
    }

    const group = group_name || (key.startsWith("home.") ? "home" : key.startsWith("profile.") ? "profile" : "layout");
    const itemLabel = label || `Konten ${key}`;

    const { data, error } = await supabaseAdmin
      .from("site_content")
      .upsert(
        {
          key,
          group_name: group,
          label: itemLabel,
          value,
          updated_at: new Date().toISOString()
        },
        { onConflict: "key" }
      )
      .select();

    if (error) {
      console.error("Supabase site_content upsert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("API /api/admin/content error:", err);
    return NextResponse.json({ error: err.message || "Gagal menyimpan konten" }, { status: 500 });
  }
}

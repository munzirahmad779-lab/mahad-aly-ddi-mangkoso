import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireRole } from "@/lib/supabase/admin-guard";

// Daftar IZIN kunci site_content yang boleh dibaca/ditulis lewat rute ini.
// Disusun dari penelusuran pemanggil nyata rute ini di panel admin:
// ArticleContext.syncContentToBackend (src/context/ArticleContext.tsx)
// adalah satu-satunya jalur tulis panel ke rute ini, ditambah POST
// langsung dari src/app/admin/page.tsx. Kunci di luar daftar ini ditolak,
// termasuk kunci sensitif yang akses anon-nya sudah dikunci RLS
// (admin_permissions, activity_logs, ai_content_snapshots,
// backup_before_sync_sarana, global_traffic_stats, security_threats,
// locked_accounts, email_templates): rute ini membaca dan menulis lewat
// supabaseAdmin yang MELEWATI RLS, jadi daftar izin di sinilah pagarnya.
// Konsekuensi yang disadari: sinkronisasi panel untuk kunci sensitif itu
// (log aktivitas, log ancaman, templat email, hak akses, akun terkunci)
// kini ditolak 403; penulisannya hanya boleh lewat jalur server khusus,
// bukan rute konten umum ini.
const ALLOWED_KEYS = [
  // Tata letak dan beranda
  "header",
  "home.hero",
  "home_sections",
  "home_priorities",
  "category_rows",
  "history_timeline_entries",
  // Halaman dan teks publik
  "about_page",
  "page_texts",
  "page_seo",
  "coming_soon",
  "gallery_albums",
  // Pengaturan situs dan footer
  "site_settings",
  "footer",
  "footer_focus",
  "footer_nav",
  // Penerimaan mahasantri baru
  "pmb_settings",
  "pmb_waves",
  "pmb_faqs",
  // Konten kampus
  "bahtsul_masail",
  "calendar_events",
  "courses_list",
  "accreditations",
  "sarana_list",
  "masyayikh_list",
  // Donasi dan Dewan Mahasantri
  "donations",
  "dema_settings",
];

function keyNotAllowedResponse() {
  return NextResponse.json(
    { error: "Kunci konten tidak diizinkan untuk diakses lewat jalur ini." },
    { status: 403 }
  );
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    // Kunci di luar daftar izin ditolak untuk semua pembaca, termasuk
    // admin: kunci sensitif tidak lagi bisa dipanen lewat rute ini.
    if (key && !ALLOWED_KEYS.includes(key)) {
      return keyNotAllowedResponse();
    }

    // Permintaan dump penuh tanpa key membutuhkan otentikasi admin
    if (!key) {
      const auth = await requireRole(request, ["super_admin", "editor"]);
      if (!auth.ok) {
        return auth.response;
      }
    }

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

    // Dump penuh hanya memuat kunci yang diizinkan.
    const mapped = (data || [])
      .filter((item) => ALLOWED_KEYS.includes(item.key))
      .reduce((acc: Record<string, any>, item) => {
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
    // Menulis atau memperbarui site_content wajib memiliki sesi admin (editor atau super_admin)
    const auth = await requireRole(request, ["super_admin", "editor"]);
    if (!auth.ok) {
      return auth.response;
    }

    const body = await request.json();
    const { key, group_name, label, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: "Key dan value wajib diisi." }, { status: 400 });
    }

    // Hanya kunci dalam daftar izin yang boleh ditulis lewat rute ini.
    if (!ALLOWED_KEYS.includes(key)) {
      return keyNotAllowedResponse();
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

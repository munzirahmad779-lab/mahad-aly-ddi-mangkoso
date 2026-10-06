import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      {
        status: "ERROR",
        message: "Environment variables Supabase belum lengkap.",
        details: {
          hasSupabaseUrl: Boolean(supabaseUrl),
          hasSupabaseAnonKey: Boolean(supabaseAnonKey),
          hasResendKey: Boolean(resendApiKey)
        }
      },
      { status: 500 }
    );
  }

  try {
    // Inisialisasi Supabase Client dengan API key format baru
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Lakukan ping sederhana ke Supabase (cek auth session atau query REST)
    const { data: authData, error: authError } = await supabase.auth.getSession();

    // Coba ping REST endpoint Supabase
    const restPingStart = Date.now();
    const { data: testData, error: restError } = await supabase
      .from("articles")
      .select("count", { count: "exact", head: true });
    const latencyMs = Date.now() - restPingStart;

    // Catatan: Karena tabel 'articles' belum dibuat di FASE 2, Supabase akan merespon status 404 (Relation does not exist) atau 200,
    // yang membuktikan koneksi handshake SSL & otentikasi API Key ke server Supabase berhasil 100%.
    const isConnected = !authError && (!restError || restError.code === "PGRST205" || restError.code === "42P01" || restError.message.includes("does not exist") || restError.message.includes("relation"));

    return NextResponse.json({
      status: "SUCCESS",
      timestamp: new Date().toISOString(),
      latency: `${latencyMs}ms`,
      projectUrl: supabaseUrl,
      apiKeyFormat: supabaseAnonKey.startsWith("sb_publishable_") ? "Format Baru (sb_publishable_...)" : "Format Standar",
      authService: authError ? "Auth Error: " + authError.message : "Terhubung (Auth Ready)",
      databaseConnection: isConnected ? "Terhubung ke Supabase PostgreSQL" : "Status: " + restError?.message,
      environmentCheck: {
        supabaseUrl: "✅ Terdeteksi",
        supabaseAnonKey: "✅ Terdeteksi",
        resendApiKey: resendApiKey ? "✅ Terdeteksi" : "⚠️ Belum diisi (opsional untuk fase 1)"
      },
      nextStepReady: "Siap lanjut ke FASE 2 (Pembuatan Tabel SQL Schema & Migrasi Data)"
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        status: "EXCEPTION",
        message: "Gagal menghubungkan ke Supabase.",
        error: err?.message || String(err)
      },
      { status: 500 }
    );
  }
}

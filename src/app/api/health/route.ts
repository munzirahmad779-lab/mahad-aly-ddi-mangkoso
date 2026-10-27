import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Detail lingkungan TIDAK ditampilkan ke publik (temuan audit E8):
    // cukup status umum; rincian hanya untuk log server.
    console.error("Health check: environment Supabase belum lengkap.", {
      hasSupabaseUrl: Boolean(supabaseUrl),
      hasSupabaseAnonKey: Boolean(supabaseAnonKey),
      hasResendKey: Boolean(resendApiKey)
    });
    return NextResponse.json(
      { status: "ERROR", message: "Konfigurasi server belum lengkap." },
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

    if (authError) console.error("Health check auth:", authError.message);
    if (restError) console.error("Health check REST:", restError.message);
    // Respons publik dibuat ramping (audit E8): tanpa URL proyek, format
    // kunci, atau status environment — cukup status & latensi.
    return NextResponse.json({
      status: isConnected ? "SUCCESS" : "ERROR",
      timestamp: new Date().toISOString(),
      latency: `${latencyMs}ms`,
      databaseConnection: isConnected ? "Terhubung" : "Gangguan"
    });
  } catch (err: any) {
    console.error("Health check exception:", err?.message || String(err));
    return NextResponse.json(
      {
        status: "EXCEPTION",
        message: "Gagal menghubungkan ke database."
      },
      { status: 500 }
    );
  }
}

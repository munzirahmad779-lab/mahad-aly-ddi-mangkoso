import { NextRequest, NextResponse } from "next/server";
import { supabaseAnon, supabaseAdmin } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

// Proxy login server-side. Semua percobaan masuk melewati sini agar:
// 1. Rate limit & penguncian akun berlaku di SERVER (tidak bisa dihapus dari
//    localStorage browser seperti implementasi lama).
// 2. Kredensial diverifikasi via client anon, status akun dicek via service
//    role sebelum sesi diberikan.
// 3. Percobaan brute-force tercatat terpusat dan memicu notifikasi admin.

const MAX_ATTEMPTS_PER_EMAIL = 5;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS_PER_IP = 20;
const IP_WINDOW_MS = 10 * 60 * 1000;
const LOCK_DURATION_MS = 15 * 60 * 1000;

// Cooldown notifikasi agar inbox admin tidak banjir (1 email / 15 menit / email target)
const alertCooldown = new Map<string, number>();

function cleanEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) return null;
  return email;
}

async function sendBruteForceAlert(email: string, ip: string) {
  const now = Date.now();
  const last = alertCooldown.get(email) || 0;
  if (now - last < 15 * 60 * 1000) return;
  alertCooldown.set(email, now);
  try {
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/security/alert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        threatType: "brute_force",
        severity: "high",
        endpoint: "/api/auth/login",
        details: `Terdeteksi percobaan login berulang gagal untuk akun [${email}] dari IP ${ip}. Akun dikunci sementara ${LOCK_DURATION_MS / 60000} menit.`,
        ip
      })
    });
  } catch {
    // Notifikasi gagal tidak boleh memblokir alur login
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);

    // Lapis 1: rate limit per IP (mencegah spraying & bot massal)
    const ipRl = checkRateLimit(`login:ip:${ip}`, MAX_ATTEMPTS_PER_IP, IP_WINDOW_MS);
    if (!ipRl.allowed) return rateLimitResponse(ipRl);

    const body = await req.json().catch(() => ({}));
    const email = cleanEmail(body?.email);
    const password = typeof body?.password === "string" ? body.password : "";

    if (!email || !password || password.length < 6 || password.length > 128) {
      return NextResponse.json(
        { error: "Format email atau kata sandi tidak valid." },
        { status: 400 }
      );
    }

    // Lapis 2: rate limit per email
    const emailRl = checkRateLimit(`login:email:${email}`, MAX_ATTEMPTS_PER_EMAIL, ATTEMPT_WINDOW_MS);
    if (!emailRl.allowed) {
      return NextResponse.json(
        {
          error: `Terlalu banyak percobaan gagal untuk akun ini. Coba lagi dalam ${emailRl.retryAfterSeconds} detik atau hubungi Super Admin.`,
          locked: true
        },
        { status: 429 }
      );
    }

    // Verifikasi kredensial via anon client (RLS tetap berlaku)
    const { data, error } = await supabaseAnon.auth.signInWithPassword({
      email,
      password
    });

    if (error || !data?.session || !data?.user) {
      const remaining = emailRl.remaining;
      if (remaining <= 2) {
        await sendBruteForceAlert(email, ip);
      }
      return NextResponse.json(
        {
          error:
            error?.message === "Invalid login credentials"
              ? `Email atau kata sandi tidak cocok. Sisa percobaan: ${remaining}.`
              : "Gagal masuk. Silakan coba lagi.",
          remainingAttempts: remaining
        },
        { status: 401 }
      );
    }

    // Lapis 3: status akun & peran dicek server-side sebelum sesi diberikan
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("users")
      .select("role, is_active")
      .eq("id", data.user.id)
      .single();

    if (profileError || !profile || !profile.is_active) {
      await supabaseAnon.auth.signOut();
      return NextResponse.json(
        { error: "Akun Anda tidak aktif atau belum memiliki hak akses panel admin." },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at
      },
      user: {
        id: data.user.id,
        email: data.user.email,
        role: profile.role
      }
    });
  } catch (err: any) {
    console.error("API /api/auth/login error:", err?.message || err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat proses masuk. Coba lagi." },
      { status: 500 }
    );
  }
}

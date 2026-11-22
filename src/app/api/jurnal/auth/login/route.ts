import { NextRequest, NextResponse } from "next/server";
import { supabaseAnon } from "@/lib/supabase/server";
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse
} from "@/lib/rate-limit";
import { getJurnalRolesForUser } from "@/lib/jurnal/auth";

// Proxy login panel jurnal. Meniru /api/auth/login situs utama:
// rate limit per IP dan per email ditegakkan di server, kredensial
// diverifikasi lewat klien anon, dan hak masuk panel dicek dari peran
// jurnal (jurnal_user_roles) sebelum sesi diberikan. Bedanya dari login
// admin situs: akun tidak wajib punya profil di public.users, cukup
// punya peran jurnal; super admin situs tetap lolos sebagai
// journal_manager (bootstrap, lihat src/lib/jurnal/auth.ts).

const MAX_ATTEMPTS_PER_EMAIL = 5;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS_PER_IP = 20;
const IP_WINDOW_MS = 10 * 60 * 1000;

function cleanEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) {
    return null;
  }
  return email;
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);

    const ipRl = checkRateLimit(
      `jurnal-login:ip:${ip}`,
      MAX_ATTEMPTS_PER_IP,
      IP_WINDOW_MS
    );
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

    const emailRl = checkRateLimit(
      `jurnal-login:email:${email}`,
      MAX_ATTEMPTS_PER_EMAIL,
      ATTEMPT_WINDOW_MS
    );
    if (!emailRl.allowed) {
      return NextResponse.json(
        {
          error: `Terlalu banyak percobaan gagal untuk akun ini. Coba lagi dalam ${emailRl.retryAfterSeconds} detik.`,
          locked: true
        },
        { status: 429 }
      );
    }

    const { data, error } = await supabaseAnon.auth.signInWithPassword({
      email,
      password
    });

    if (error || !data?.session || !data?.user) {
      return NextResponse.json(
        {
          error:
            error?.message === "Invalid login credentials"
              ? `Email atau kata sandi tidak cocok. Sisa percobaan: ${emailRl.remaining}.`
              : "Gagal masuk. Silakan coba lagi.",
          remainingAttempts: emailRl.remaining
        },
        { status: 401 }
      );
    }

    const roles = await getJurnalRolesForUser(data.user.id, data.user.email || email);
    if (roles.length === 0) {
      return NextResponse.json(
        {
          error:
            "Akun ini belum memiliki peran jurnal. Minta Manajer Jurnal memberikan peran terlebih dahulu."
        },
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
        roles
      }
    });
  } catch (err) {
    console.error(
      "API /api/jurnal/auth/login error:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { error: "Terjadi kesalahan saat proses masuk. Coba lagi." },
      { status: 500 }
    );
  }
}

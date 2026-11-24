import { NextRequest, NextResponse } from "next/server";
import { supabaseAnon } from "@/lib/supabase/server";
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse
} from "@/lib/rate-limit";
import { getJurnalRolesForUser } from "@/lib/jurnal/auth";
import { getJurnalDataMode } from "@/lib/jurnal/store";
import {
  peranLokalLengkap,
  verifikasiAkunLokal
} from "@/lib/jurnal/store-local";
import { buatTokenSesiLokal } from "@/lib/jurnal/sesi-lokal";
import {
  bacaJsonTerbatas,
  catatPeristiwaKeamanan,
  responsBadanTerlaluBesar
} from "@/lib/jurnal/keamanan";

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

    const ipRl = await checkRateLimit(
      `jurnal-login:ip:${ip}`,
      MAX_ATTEMPTS_PER_IP,
      IP_WINDOW_MS
    );
    if (!ipRl.allowed) {
      await catatPeristiwaKeamanan("rate_limit", {
        ip,
        rincian: "login:per-ip"
      });
      return rateLimitResponse(ipRl);
    }

    const { data: body, terlaluBesar } = await bacaJsonTerbatas(req, 8 * 1024);
    if (terlaluBesar) return responsBadanTerlaluBesar();
    const email = cleanEmail(body?.email);
    const password = typeof body?.password === "string" ? body.password : "";

    if (!email || !password || password.length < 6 || password.length > 128) {
      return NextResponse.json(
        { error: "Format email atau kata sandi tidak valid." },
        { status: 400 }
      );
    }

    const emailRl = await checkRateLimit(
      `jurnal-login:email:${email}`,
      MAX_ATTEMPTS_PER_EMAIL,
      ATTEMPT_WINDOW_MS
    );
    if (!emailRl.allowed) {
      await catatPeristiwaKeamanan("rate_limit", {
        ip,
        email,
        rincian: "login:per-email"
      });
      return NextResponse.json(
        {
          error: `Terlalu banyak percobaan gagal untuk akun ini. Coba lagi dalam ${emailRl.retryAfterSeconds} detik.`,
          locked: true
        },
        { status: 429 }
      );
    }

    // Mode data lokal (uji): tidak ada Supabase Auth yang terhubung ke
    // tabel jurnal, jadi kredensial diperiksa ke akun uji lokal dan sesi
    // dinyatakan dengan token lokal bertanda tangan (sesi-lokal.ts).
    // Cabang ini tidak pernah berjalan pada mode supabase.
    if ((await getJurnalDataMode()) === "local") {
      const akun = await verifikasiAkunLokal(email, password);
      if (!akun) {
        await catatPeristiwaKeamanan("login_gagal", {
          ip,
          email,
          rincian: "mode-lokal"
        });
        return NextResponse.json(
          {
            error:
              "Email atau kata sandi akun uji lokal tidak cocok. Bila belum punya akun, daftar dulu di halaman pendaftaran penulis.",
            remainingAttempts: emailRl.remaining
          },
          { status: 401 }
        );
      }
      return NextResponse.json({
        success: true,
        mode: "local",
        localSession: {
          token: buatTokenSesiLokal(akun.email),
          email: akun.email,
          nama: akun.nama
        },
        user: {
          id: null,
          email: akun.email,
          // Peran diturunkan di server dari akun uji dan daftar staf uji
          // (env), bukan dari klien: akun staf uji memegang peran staf,
          // akun hasil klaim undangan memegang peran reviewer.
          roles: await peranLokalLengkap(akun.email)
        }
      });
    }

    const { data, error } = await supabaseAnon.auth.signInWithPassword({
      email,
      password
    });

    if (error || !data?.session || !data?.user) {
      await catatPeristiwaKeamanan("login_gagal", {
        ip,
        email,
        rincian: "mode-supabase"
      });
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

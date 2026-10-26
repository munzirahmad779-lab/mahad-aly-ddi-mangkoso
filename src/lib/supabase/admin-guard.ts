import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

import { SUPER_ADMIN_EMAIL } from "@/lib/admin-constants";

// Email bootstrap super admin: env server menang bila diset, selain itu
// konstanta bersama (dulu literal tersalin di sini).
const BOOTSTRAP_SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || SUPER_ADMIN_EMAIL;

type AuthorizationResult =
  | { ok: true; userId: string; email: string }
  | { ok: false; response: NextResponse };

export async function requireSuperAdmin(request: Request): Promise<AuthorizationResult> {
  const authorization = request.headers.get("authorization");
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();

  // Mode tamu/localhost SUDAH DIHAPUS (atas perintah pemilik situs):
  // tidak ada lagi token pintas — semua akses admin wajib sesi Supabase asli.

  if (!token) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Sesi admin tidak ditemukan. Silakan masuk ulang." }, { status: 401 })
    };
  }

  const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);
  const user = authData?.user;
  if (authError || !user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Sesi tidak valid atau sudah kedaluwarsa. Silakan masuk ulang." }, { status: 401 })
    };
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("users")
    .select("role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Gagal memverifikasi profil Super Admin:", profileError.message);
    return {
      ok: false,
      response: NextResponse.json({ error: "Gagal memverifikasi hak akses admin di database." }, { status: 500 })
    };
  }

  if (profile?.is_active === false) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Akun admin sedang dinonaktifkan." }, { status: 403 })
    };
  }

  const isDatabaseSuperAdmin = profile?.role === "super_admin" && profile.is_active === true;
  const isBootstrapSuperAdmin = user.email?.trim().toLowerCase() === BOOTSTRAP_SUPER_ADMIN_EMAIL;

  if (!isDatabaseSuperAdmin && !isBootstrapSuperAdmin) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Aksi ini hanya dapat dilakukan oleh Super Admin." }, { status: 403 })
    };
  }

  return { ok: true, userId: user.id, email: user.email || "" };
}

export type AllowedAdminRole = "super_admin" | "editor" | "penulis";

export function normalizeAdminRole(role: string | null | undefined): AllowedAdminRole {
  if (!role) return "penulis";
  const r = role.toLowerCase().trim();
  if (r === "super_admin" || r === "superadmin") return "super_admin";
  if (r === "editor" || r === "admin" || r === "redaksi") return "editor";
  return "penulis";
}

export type RoleAuthorizationResult =
  | { ok: true; userId: string; email: string; role: AllowedAdminRole }
  | { ok: false; response: NextResponse };

export async function requireRole(
  request: Request,
  allowedRoles: AllowedAdminRole[]
): Promise<RoleAuthorizationResult> {
  const authorization = request.headers.get("authorization");
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();

  // Mode tamu/localhost SUDAH DIHAPUS — lihat requireSuperAdmin di atas.

  if (!token) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Sesi admin tidak ditemukan. Silakan masuk ulang." },
        { status: 401 }
      )
    };
  }

  const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);
  const user = authData?.user;
  if (authError || !user) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Sesi tidak valid atau sudah kedaluwarsa. Silakan masuk ulang." },
        { status: 401 }
      )
    };
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("users")
    .select("role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Gagal memverifikasi profil admin:", profileError.message);
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Gagal memverifikasi hak akses admin di database." },
        { status: 500 }
      )
    };
  }

  if (profile?.is_active === false) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Akun admin sedang dinonaktifkan." },
        { status: 403 }
      )
    };
  }

  const isBootstrapSuperAdmin = user.email?.trim().toLowerCase() === BOOTSTRAP_SUPER_ADMIN_EMAIL;
  const userRole: AllowedAdminRole = isBootstrapSuperAdmin
    ? "super_admin"
    : normalizeAdminRole(profile?.role);

  if (!allowedRoles.includes(userRole) && !isBootstrapSuperAdmin) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: `Aksi ini memerlukan peran ${allowedRoles.join(" atau ")}.` },
        { status: 403 }
      )
    };
  }

  return { ok: true, userId: user.id, email: user.email || "", role: userRole };
}
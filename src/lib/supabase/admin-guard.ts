import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

const BOOTSTRAP_SUPER_ADMIN_EMAIL = "munzirahmad779@gmail.com";

type AuthorizationResult =
  | { ok: true; userId: string; email: string }
  | { ok: false; response: NextResponse };

export async function requireSuperAdmin(request: Request): Promise<AuthorizationResult> {
  const authorization = request.headers.get("authorization");
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();

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
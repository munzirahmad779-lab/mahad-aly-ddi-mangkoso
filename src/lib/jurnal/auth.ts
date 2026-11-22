// Penjaga peran jurnal untuk route server — SERVER ONLY.
//
// Polanya meniru src/lib/supabase/admin-guard.ts situs utama: token Bearer
// dari sesi Supabase Auth diverifikasi dengan supabaseAdmin.auth.getUser,
// lalu peran dibaca dari basis data. Bedanya hanya sumber peran: jurnal
// memakai jurnal_user_roles (migrasi 004), bukan public.users, supaya
// peran jurnal tidak mengubah skema situs utama.
//
// Bootstrap anti terkunci: super admin situs utama (peran super_admin di
// public.users yang aktif, atau email bootstrap SUPER_ADMIN_EMAIL) diakui
// sebagai journal_manager jurnal.

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { SUPER_ADMIN_EMAIL } from "@/lib/admin-constants";
import {
  JURNAL_ROLES,
  type JurnalRole
} from "./status";

const BOOTSTRAP_SUPER_ADMIN_EMAIL =
  process.env.SUPER_ADMIN_EMAIL || SUPER_ADMIN_EMAIL;

export async function getJurnalRolesForUser(
  userId: string,
  email: string
): Promise<JurnalRole[]> {
  const roles = new Set<JurnalRole>();

  const { data: profilJurnal } = await supabaseAdmin
    .from("jurnal_users")
    .select("is_active")
    .eq("id", userId)
    .maybeSingle();
  if (profilJurnal?.is_active === false) return [];

  const { data: barisPeran, error } = await supabaseAdmin
    .from("jurnal_user_roles")
    .select("role")
    .eq("user_id", userId);
  if (!error) {
    for (const baris of barisPeran ?? []) {
      const peran = baris.role as JurnalRole;
      if ((JURNAL_ROLES as readonly string[]).includes(peran)) {
        roles.add(peran);
      }
    }
  }

  const isBootstrap =
    email.trim().toLowerCase() === BOOTSTRAP_SUPER_ADMIN_EMAIL;
  if (isBootstrap) {
    roles.add("journal_manager");
  } else if (roles.size === 0 || !roles.has("journal_manager")) {
    const { data: profilSitus } = await supabaseAdmin
      .from("users")
      .select("role, is_active")
      .eq("id", userId)
      .maybeSingle();
    if (profilSitus?.role === "super_admin" && profilSitus?.is_active) {
      roles.add("journal_manager");
    }
  }

  return [...roles];
}

export type JurnalAuthResult =
  | { ok: true; userId: string; email: string; roles: JurnalRole[] }
  | { ok: false; response: NextResponse };

// Memverifikasi sesi dan (bila allowedRoles diberikan) menuntut minimal
// satu peran yang cocok. journal_manager selalu lolos pemeriksaan peran
// staf, mengikuti kedudukannya sebagai pengelola tertinggi jurnal.
export async function requireJurnalRole(
  request: Request,
  allowedRoles?: JurnalRole[]
): Promise<JurnalAuthResult> {
  const authorization = request.headers.get("authorization");
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();

  if (!token) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Sesi jurnal tidak ditemukan. Silakan masuk ulang." },
        { status: 401 }
      )
    };
  }

  const { data: authData, error: authError } =
    await supabaseAdmin.auth.getUser(token);
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

  const email = user.email || "";
  const roles = await getJurnalRolesForUser(user.id, email);

  if (allowedRoles && allowedRoles.length > 0) {
    const lolos =
      roles.includes("journal_manager") ||
      allowedRoles.some((r) => roles.includes(r));
    if (!lolos) {
      return {
        ok: false,
        response: NextResponse.json(
          {
            error:
              roles.length === 0
                ? "Akun ini belum memiliki peran jurnal. Minta Manajer Jurnal memberikan peran terlebih dahulu."
                : `Aksi ini memerlukan peran jurnal ${allowedRoles.join(" atau ")}.`
          },
          { status: 403 }
        )
      };
    }
  }

  return { ok: true, userId: user.id, email, roles };
}

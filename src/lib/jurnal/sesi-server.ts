// ─────────────────────────────────────────────────────────────────────────────
// Resolusi sesi jurnal untuk route server — SERVER ONLY (Tahap 3).
//
// Satu pintu untuk menjawab "siapa pemanggil ini dan apa perannya" pada
// kedua mode data, mengikuti pola yang sudah berjalan di route lain:
// - Mode supabase: token Bearer sesi Supabase Auth diverifikasi dengan
//   supabaseAdmin.auth.getUser, peran dibaca dari jurnal_user_roles
//   lewat getJurnalRolesForUser (auth.ts).
// - Mode lokal: token sesi lokal bertanda tangan (sesi-lokal.ts) memberi
//   email; peran lengkap dibaca dari akun uji lokal ditambah daftar staf
//   uji env (peranLokalLengkap di store-local.ts).
// Identitas dan peran tidak pernah dibaca dari badan permintaan.
// ─────────────────────────────────────────────────────────────────────────────

import { supabaseAdmin } from "@/lib/supabase/server";
import { getJurnalRolesForUser } from "./auth";
import { getJurnalDataMode, type JurnalDataMode } from "./store";
import { emailDariHeaderLokal } from "./sesi-lokal";
import { peranLokalLengkap } from "./store-local";
import type { JurnalRole } from "./status";

export interface SesiJurnalServer {
  mode: JurnalDataMode;
  email: string;
  userId: string | null; // hanya mode supabase
  roles: JurnalRole[];
}

export async function sesiJurnalDariRequest(
  req: Request
): Promise<SesiJurnalServer | null> {
  const mode = await getJurnalDataMode();

  if (mode === "local") {
    const email = emailDariHeaderLokal(req);
    if (!email) return null;
    return {
      mode,
      email,
      userId: null,
      roles: await peranLokalLengkap(email)
    };
  }

  const authorization = req.headers.get("authorization");
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
  if (!token) return null;
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) return null;
  const email = data.user.email || "";
  const roles = await getJurnalRolesForUser(data.user.id, email);
  return { mode, email, userId: data.user.id, roles };
}

// journal_manager selalu lolos pemeriksaan peran, mengikuti kedudukannya
// sebagai pengelola tertinggi jurnal (konsisten dengan requireJurnalRole).
export function sesiPunyaPeran(
  sesi: SesiJurnalServer,
  allowed: JurnalRole[]
): boolean {
  return (
    sesi.roles.includes("journal_manager") ||
    allowed.some((r) => sesi.roles.includes(r))
  );
}

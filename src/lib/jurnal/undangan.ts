// ─────────────────────────────────────────────────────────────────────────────
// Undangan reviewer jurnal — SERVER ONLY (Tahap 3).
//
// Editor menugaskan reviewer dari daftar pengguna berperan reviewer.
// Bila alamat belum terdaftar, editor membuat undangan: token klaim acak
// dibuat di sini, hanya hash SHA-256-nya yang disimpan (tabel
// jurnal_invitations pada mode supabase, migrasi 006; berkas lokal
// setara pada mode lokal), dan token mentah dikembalikan sekali kepada
// staf sebagai tautan klaim. Penerima mengklaim lewat halaman
// /jurnal/terima-undangan: mendaftar berpersetujuan mengikuti pola
// Tahap 2 atau masuk dengan akun yang sudah ada, lalu menerima peran
// reviewer. Pengiriman email undangan adalah pekerjaan Tahap 6.
// ─────────────────────────────────────────────────────────────────────────────

import { createHash, randomBytes, randomUUID } from "crypto";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getJurnalDataMode } from "./store";
import {
  muatUndanganLokal,
  simpanUndanganLokal,
  type UndanganLokal
} from "./store-local";

export const UNDANGAN_BERLAKU_HARI = 14;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export interface HasilBuatUndangan {
  email: string;
  token: string; // mentah, hanya untuk diserahkan sekali kepada staf
  kedaluwarsa: string; // ISO datetime
}

export async function buatUndanganReviewer(
  emailMentah: string,
  dibuatOleh: { userId?: string | null; email?: string | null }
): Promise<HasilBuatUndangan> {
  const email = emailMentah.trim().toLowerCase();
  const token = randomBytes(32).toString("hex");
  const kedaluwarsa = new Date(
    Date.now() + UNDANGAN_BERLAKU_HARI * 24 * 60 * 60 * 1000
  ).toISOString();
  const mode = await getJurnalDataMode();

  if (mode === "local") {
    const daftar = await muatUndanganLokal();
    const baru: UndanganLokal = {
      id: randomUUID(),
      email,
      tokenHash: hashToken(token),
      dibuatOleh: dibuatOleh.email ?? null,
      dibuatPada: new Date().toISOString(),
      kedaluwarsa,
      dipakaiPada: null
    };
    daftar.push(baru);
    await simpanUndanganLokal(daftar);
    return { email, token, kedaluwarsa };
  }

  const { error } = await supabaseAdmin.from("jurnal_invitations").insert({
    email,
    token_hash: hashToken(token),
    created_by: dibuatOleh.userId ?? null,
    expires_at: kedaluwarsa
  });
  if (error) {
    throw new Error(`Gagal membuat undangan reviewer: ${error.message}`);
  }
  return { email, token, kedaluwarsa };
}

export interface InfoUndangan {
  email: string;
  kedaluwarsa: string;
}

// Memeriksa token tanpa memakainya (halaman klaim menampilkan alamat
// tujuan). Token yang sudah dipakai atau kedaluwarsa dianggap tidak ada.
export async function periksaUndangan(
  token: string
): Promise<InfoUndangan | null> {
  if (!token || token.length < 32) return null;
  const mode = await getJurnalDataMode();
  const sekarang = new Date().toISOString();

  if (mode === "local") {
    const daftar = await muatUndanganLokal();
    const u = daftar.find((x) => x.tokenHash === hashToken(token));
    if (!u || u.dipakaiPada || u.kedaluwarsa <= sekarang) return null;
    return { email: u.email, kedaluwarsa: u.kedaluwarsa };
  }

  const { data, error } = await supabaseAdmin
    .from("jurnal_invitations")
    .select("email, expires_at, used_at")
    .eq("token_hash", hashToken(token))
    .maybeSingle();
  if (error) {
    throw new Error(`Gagal memeriksa undangan: ${error.message}`);
  }
  if (!data || data.used_at || (data.expires_at as string) <= sekarang) {
    return null;
  }
  return {
    email: data.email as string,
    kedaluwarsa: data.expires_at as string
  };
}

// Menandai undangan terpakai sesudah klaim berhasil. Mengembalikan info
// undangan, atau null bila token tidak sah lagi pada saat ditandai
// (dipakai ganda ditahan di sini).
export async function konsumsiUndangan(
  token: string
): Promise<InfoUndangan | null> {
  const info = await periksaUndangan(token);
  if (!info) return null;
  const mode = await getJurnalDataMode();

  if (mode === "local") {
    const daftar = await muatUndanganLokal();
    const u = daftar.find((x) => x.tokenHash === hashToken(token));
    if (!u || u.dipakaiPada) return null;
    u.dipakaiPada = new Date().toISOString();
    await simpanUndanganLokal(daftar);
    return info;
  }

  const { data, error } = await supabaseAdmin
    .from("jurnal_invitations")
    .update({ used_at: new Date().toISOString() })
    .eq("token_hash", hashToken(token))
    .is("used_at", null)
    .select("email")
    .maybeSingle();
  if (error) {
    throw new Error(`Gagal menandai undangan: ${error.message}`);
  }
  return data ? info : null;
}

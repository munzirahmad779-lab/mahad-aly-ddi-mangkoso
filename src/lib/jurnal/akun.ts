// ─────────────────────────────────────────────────────────────────────────────
// Pendaftaran akun penulis jurnal — SERVER ONLY.
//
// Mengikuti pola autentikasi repo (route admin users situs utama memakai
// supabaseAdmin.auth.admin.createUser dengan rollback deleteUser bila
// penulisan profil gagal):
// - Mode supabase: akun dibuat di Supabase Auth (auth.users yang sama
//   dengan web kampus), profil ditulis ke jurnal_users, dan peran
//   "author" diberikan di jurnal_user_roles (migrasi 004). Persetujuan
//   (consent) penulis dicatat di metadata akun dan profil.
// - Mode lokal: akun uji lokal di store-local.ts, jelas berlabel mode
//   uji; tidak menyentuh Supabase sama sekali.
// ─────────────────────────────────────────────────────────────────────────────

import { supabaseAdmin } from "@/lib/supabase/server";
import { getJurnalDataMode } from "./store";
import {
  daftarAkunLokal,
  tambahPeranAkunLokal,
  type AkunLokal
} from "./store-local";
import { JURNAL_CONSENT_VERSI } from "./wizard";
import type { JurnalRole } from "./status";

export interface InputDaftarPenulis {
  nama: string;
  email: string;
  kataSandi: string;
  afiliasi: string;
  negara?: string;
  orcid?: string;
}

export interface HasilDaftarPenulis {
  mode: "supabase" | "local";
  email: string;
  nama: string;
  peran: JurnalRole;
  akunLokal?: AkunLokal;
}

export async function daftarPenulis(
  input: InputDaftarPenulis
): Promise<HasilDaftarPenulis> {
  return daftarAkunDenganPeran(input, "author");
}

// Pendaftaran akun jurnal dengan peran tertentu (Tahap 3: klaim undangan
// reviewer memakai jalur yang sama dengan pendaftaran penulis Tahap 2,
// hanya perannya yang berbeda).
export async function daftarAkunDenganPeran(
  input: InputDaftarPenulis,
  peran: JurnalRole
): Promise<HasilDaftarPenulis> {
  const mode = await getJurnalDataMode();
  const email = input.email.trim().toLowerCase();

  if (mode === "local") {
    const akun = await daftarAkunLokal({
      nama: input.nama,
      email,
      kataSandi: input.kataSandi,
      afiliasi: input.afiliasi,
      negara: input.negara,
      orcid: input.orcid,
      consentVersi: JURNAL_CONSENT_VERSI,
      peran: [peran]
    });
    return { mode, email: akun.email, nama: akun.nama, peran, akunLokal: akun };
  }

  // Mode supabase: buat pengguna Auth, lalu profil dan peran jurnal.
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: input.kataSandi,
    email_confirm: true,
    user_metadata: {
      full_name: input.nama.trim(),
      jurnal_role: peran,
      jurnal_consent_versi: JURNAL_CONSENT_VERSI
    }
  });
  if (error || !data?.user) {
    throw new Error(
      error?.message?.includes("already been registered")
        ? "Email ini sudah terdaftar. Silakan masuk dengan akun yang ada."
        : `Gagal membuat akun: ${error?.message ?? "galat tidak dikenal"}`
    );
  }
  const userId = data.user.id;

  try {
    const { error: errProfil } = await supabaseAdmin.from("jurnal_users").insert({
      id: userId,
      email,
      full_name: input.nama.trim(),
      affiliation: input.afiliasi.trim() || null,
      country: input.negara?.trim() || null,
      orcid: input.orcid?.trim() || null
    });
    if (errProfil) throw new Error(errProfil.message);

    const { error: errPeran } = await supabaseAdmin
      .from("jurnal_user_roles")
      .insert({ user_id: userId, role: peran });
    if (errPeran) throw new Error(errPeran.message);
  } catch (err) {
    // Rollback: jangan tinggalkan akun Auth tanpa profil jurnal.
    await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => {});
    throw new Error(
      `Gagal menyimpan profil penulis jurnal: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  return { mode, email, nama: input.nama.trim(), peran };
}

// Memeriksa keberadaan akun jurnal menurut email (dipakai klaim
// undangan untuk memilih jalur masuk atau jalur daftar).
export async function akunJurnalAda(email: string): Promise<boolean> {
  const mode = await getJurnalDataMode();
  const target = email.trim().toLowerCase();
  if (mode === "local") {
    const { cariAkunLokal } = await import("./store-local");
    return (await cariAkunLokal(target)) !== null;
  }
  const { data, error } = await supabaseAdmin
    .from("jurnal_users")
    .select("id")
    .eq("email", target)
    .maybeSingle();
  if (error) {
    throw new Error(`Gagal membaca profil jurnal: ${error.message}`);
  }
  return data !== null;
}

// Memberi peran jurnal ke akun yang SUDAH terdaftar (klaim undangan oleh
// pemilik akun yang masuk). Mengembalikan false bila akun dengan email
// itu tidak ditemukan, supaya pemanggil bisa mengarahkan ke pendaftaran.
export async function berikanPeranKeAkun(
  email: string,
  peran: JurnalRole
): Promise<boolean> {
  const mode = await getJurnalDataMode();
  const target = email.trim().toLowerCase();

  if (mode === "local") {
    const akun = await tambahPeranAkunLokal(target, peran);
    return akun !== null;
  }

  const { data: profil, error } = await supabaseAdmin
    .from("jurnal_users")
    .select("id")
    .eq("email", target)
    .maybeSingle();
  if (error) {
    throw new Error(`Gagal membaca profil jurnal: ${error.message}`);
  }
  if (!profil) return false;
  const { error: errPeran } = await supabaseAdmin
    .from("jurnal_user_roles")
    .upsert(
      { user_id: profil.id as string, role: peran },
      { onConflict: "user_id,role" }
    );
  if (errPeran) {
    throw new Error(`Gagal memberi peran jurnal: ${errPeran.message}`);
  }
  return true;
}

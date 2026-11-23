// Kelola akun jurnal dan reset kata sandi (Tahap Penutup Celah,
// butir S4 dan prasyarat M2 audit lanjutan 24 Nov 2026) — SERVER ONLY.
//
// Manajemen akun hanya untuk journal_manager: daftar pengguna, ganti
// peran, nonaktifkan/aktifkan. Dua penjaga keras: akun sendiri tidak
// dapat dinonaktifkan, dan harus selalu tersisa minimal satu Manajer
// Jurnal aktif. Daftar pengguna menampilkan peran EFEKTIF: peran
// tersimpan digabung pengakuan bootstrap (staf uji lokal dari env;
// super admin situs utama atau email bootstrap pada mode supabase),
// supaya hitungan penjaga sama dengan peran yang diakui sesi masuk.
//
// Reset kata sandi mengikuti rancangan auditor di atas Supabase Auth:
// mode supabase memakai resetPasswordForEmail (tautan pemulihan resmi)
// dan penyelesaian lewat sesi pemulihan; mode lokal memakai token
// sekali pakai ber-hash SHA-256 (store-local). Jawaban permintaan reset
// selalu generik agar tidak membocorkan keberadaan akun.

import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin, supabaseAnon } from "@/lib/supabase/server";
import { getJurnalDataMode } from "./store";
import {
  buatTokenResetLokal,
  cariAkunLokal,
  daftarSemuaAkunLokal,
  pakaiTokenResetLokal,
  peranLokalLengkap,
  tetapkanAktifAkunLokal,
  tetapkanPeranAkunLokal
} from "./store-local";
import { SUPER_ADMIN_EMAIL } from "@/lib/admin-constants";
import { JURNAL_ROLES, type JurnalRole } from "./status";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://ymxijorgoucpsxgcvtgu.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_8Y6NE0t_5z4Jo2u3G50bbQ_e1qTTOB-";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export interface PenggunaJurnalView {
  email: string;
  nama: string;
  afiliasi: string;
  peran: JurnalRole[];
  aktif: boolean;
}

export async function daftarPenggunaJurnal(): Promise<PenggunaJurnalView[]> {
  const mode = await getJurnalDataMode();
  if (mode === "local") {
    const akun = await daftarSemuaAkunLokal();
    // Peran yang ditampilkan adalah peran EFEKTIF (tersimpan digabung
    // peran staf uji dari env), sama seperti yang diakui sesi masuk.
    // Tanpa gabungan ini akun staf terlihat hanya berperan author dan
    // penjaga minimal satu manajer salah hitung menjadi nol.
    return Promise.all(
      akun.map(async (a) => ({
        email: a.email,
        nama: a.nama,
        afiliasi: a.afiliasi,
        peran: await peranLokalLengkap(a.email),
        aktif: a.aktif !== false
      }))
    );
  }
  const { data: profil, error } = await supabaseAdmin
    .from("jurnal_users")
    .select("id, email, full_name, affiliation, is_active")
    .order("full_name", { ascending: true });
  if (error) throw new Error(`Gagal membaca pengguna jurnal: ${error.message}`);
  const { data: peranData, error: errPeran } = await supabaseAdmin
    .from("jurnal_user_roles")
    .select("user_id, role");
  if (errPeran) throw new Error(`Gagal membaca peran jurnal: ${errPeran.message}`);
  const petaPeran = new Map<string, JurnalRole[]>();
  for (const r of peranData ?? []) {
    const daftar = petaPeran.get(r.user_id as string) ?? [];
    daftar.push(r.role as JurnalRole);
    petaPeran.set(r.user_id as string, daftar);
  }
  // Peran efektif: super admin situs utama yang aktif dan email
  // bootstrap diakui sebagai journal_manager walau tanpa baris peran
  // tersimpan (pola yang sama dengan getJurnalRolesForUser di auth.ts).
  const emailBootstrap = (
    process.env.SUPER_ADMIN_EMAIL || SUPER_ADMIN_EMAIL
  )
    .trim()
    .toLowerCase();
  const ids = (profil ?? []).map((p) => p.id as string);
  const petaSitus = new Map<string, { role: string; is_active: boolean }>();
  if (ids.length > 0) {
    const { data: profilSitus } = await supabaseAdmin
      .from("users")
      .select("id, role, is_active")
      .in("id", ids);
    for (const u of profilSitus ?? []) {
      petaSitus.set(u.id as string, {
        role: u.role as string,
        is_active: u.is_active !== false
      });
    }
  }
  return (profil ?? []).map((p) => {
    const peran = new Set<JurnalRole>(petaPeran.get(p.id as string) ?? []);
    const situs = petaSitus.get(p.id as string);
    const bootstrap =
      (p.email as string).trim().toLowerCase() === emailBootstrap ||
      (situs?.role === "super_admin" && situs.is_active);
    if (bootstrap) peran.add("journal_manager");
    return {
      email: p.email as string,
      nama: p.full_name as string,
      afiliasi: (p.affiliation as string) ?? "",
      peran: [...peran],
      aktif: p.is_active !== false
    };
  });
}

export async function ubahPenggunaJurnal(
  email: string,
  patch: { aktif?: boolean; peran?: JurnalRole[] },
  aktorEmail: string
): Promise<string | null> {
  const target = email.trim().toLowerCase();
  const aktor = aktorEmail.trim().toLowerCase();
  const semua = await daftarPenggunaJurnal();
  const pengguna = semua.find((p) => p.email === target);
  if (!pengguna) return "Pengguna tidak ditemukan.";
  if (patch.peran) {
    for (const p of patch.peran) {
      if (!(JURNAL_ROLES as readonly string[]).includes(p)) {
        return `Peran tidak sah: ${p}`;
      }
    }
  }
  if (patch.aktif === false && target === aktor) {
    return "Tidak dapat menonaktifkan akun sendiri.";
  }
  // Simulasi hasil akhir: minimal satu Manajer Jurnal aktif harus sisa.
  const hasil = semua.map((p) =>
    p.email === target
      ? {
          ...p,
          aktif: patch.aktif ?? p.aktif,
          peran: patch.peran ?? p.peran
        }
      : p
  );
  const manajerAktif = hasil.filter(
    (p) => p.aktif && p.peran.includes("journal_manager")
  ).length;
  // Bila sasaran bukan aktor, aktor sendiri tetap Manajer Jurnal aktif
  // sesudah perubahan (gerbang rute sudah membuktikannya), jadi sisa
  // manajer tidak mungkin nol walau daftar tersimpan belum memuatnya,
  // misalnya manajer bootstrap yang belum punya baris peran.
  if (manajerAktif === 0 && target === aktor) {
    return "Harus ada minimal satu Manajer Jurnal aktif.";
  }

  const mode = await getJurnalDataMode();
  if (mode === "local") {
    if (patch.peran) await tetapkanPeranAkunLokal(target, patch.peran);
    if (patch.aktif !== undefined) {
      await tetapkanAktifAkunLokal(target, patch.aktif);
    }
    return null;
  }
  const { data: profil, error } = await supabaseAdmin
    .from("jurnal_users")
    .select("id")
    .eq("email", target)
    .maybeSingle();
  if (error) throw new Error(`Gagal membaca profil jurnal: ${error.message}`);
  if (!profil) return "Pengguna tidak ditemukan.";
  const userId = profil.id as string;
  if (patch.aktif !== undefined) {
    const { error: errAktif } = await supabaseAdmin
      .from("jurnal_users")
      .update({ is_active: patch.aktif })
      .eq("id", userId);
    if (errAktif) throw new Error(`Gagal mengubah status akun: ${errAktif.message}`);
  }
  if (patch.peran) {
    const { error: errHapus } = await supabaseAdmin
      .from("jurnal_user_roles")
      .delete()
      .eq("user_id", userId);
    if (errHapus) throw new Error(`Gagal mengganti peran: ${errHapus.message}`);
    if (patch.peran.length > 0) {
      const { error: errIsi } = await supabaseAdmin
        .from("jurnal_user_roles")
        .insert(patch.peran.map((role) => ({ user_id: userId, role })));
      if (errIsi) throw new Error(`Gagal mengganti peran: ${errIsi.message}`);
    }
  }
  return null;
}

// ── Reset kata sandi ────────────────────────────────────────────────────

export async function mintaResetSandi(
  email: string
): Promise<{ mode: "supabase" | "local"; tokenLokal: string | null }> {
  const mode = await getJurnalDataMode();
  const target = email.trim().toLowerCase();
  if (mode === "local") {
    const hasil = await buatTokenResetLokal(target);
    return { mode, tokenLokal: hasil?.token ?? null };
  }
  // Mode supabase: kirim hanya bila akun jurnal memang ada, tetapi
  // pemanggil selalu menjawab generik.
  const ada = await cariAkunJurnalSupabase(target);
  if (ada) {
    await supabaseAnon.auth.resetPasswordForEmail(target, {
      redirectTo: `${SITE_URL}/jurnal/sandi-baru`
    });
  }
  return { mode, tokenLokal: null };
}

async function cariAkunJurnalSupabase(email: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from("jurnal_users")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (error) throw new Error(`Gagal membaca profil jurnal: ${error.message}`);
  return Boolean(data);
}

export async function selesaikanResetSandi(input: {
  tokenLokal?: string;
  accessToken?: string;
  refreshToken?: string;
  kodePkce?: string;
  kataSandiBaru: string;
}): Promise<string | null> {
  const mode = await getJurnalDataMode();
  if (mode === "local") {
    if (!input.tokenLokal) return "Token reset tidak ditemukan.";
    const ok = await pakaiTokenResetLokal(input.tokenLokal, input.kataSandiBaru);
    return ok ? null : "Token reset tidak sah atau sudah kedaluwarsa.";
  }
  const klien = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  if (input.kodePkce) {
    const { error } = await klien.auth.exchangeCodeForSession(input.kodePkce);
    if (error) return "Tautan pemulihan tidak sah atau sudah kedaluwarsa.";
  } else if (input.accessToken && input.refreshToken) {
    const { error } = await klien.auth.setSession({
      access_token: input.accessToken,
      refresh_token: input.refreshToken
    });
    if (error) return "Tautan pemulihan tidak sah atau sudah kedaluwarsa.";
  } else {
    return "Sesi pemulihan tidak ditemukan. Minta tautan reset baru.";
  }
  const { error } = await klien.auth.updateUser({
    password: input.kataSandiBaru
  });
  await klien.auth.signOut().catch(() => {});
  if (error) return "Gagal mengganti kata sandi. Minta tautan reset baru.";
  return null;
}

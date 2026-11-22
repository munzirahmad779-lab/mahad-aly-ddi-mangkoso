// ─────────────────────────────────────────────────────────────────────────────
// Fasad lapisan data jurnal — SERVER ONLY.
//
// Dua backend di belakang satu antarmuka:
// - "supabase": tabel jurnal_* migrasi 004 lewat service role. Dipakai
//   bila SUPABASE_SERVICE_ROLE_KEY terpasang DAN pemeriksaan ringan ke
//   tabel jurnal_submissions berhasil (artinya migrasi sudah dijalankan
//   di proyek tujuan).
// - "local": berkas JSON uji di .jurnal-uji/ (store-local.ts). Dipakai
//   bila env tidak tersedia atau tabel belum ada, supaya build dan uji
//   lokal tidak pernah pecah dan tidak pernah menulis ke basis data
//   produksi kampus.
//
// Keputusan mode diperiksa sekali per proses dan disimpan. Kegagalan
// sesudah mode supabase terpilih dianggap galat sungguhan dan diteruskan
// ke route, bukan disembunyikan dengan jatuh diam-diam ke lokal.
// Paksa mode lewat env JURNAL_DATA_MODE=local|supabase bila perlu.
// ─────────────────────────────────────────────────────────────────────────────

import { supabaseAdmin } from "@/lib/supabase/server";
import type { JurnalStatus, JurnalSubmissionView } from "./status";
import {
  createLokal,
  createLokalLengkap,
  getLokal,
  listLokal,
  listLokalByEmail,
  updateStatusLokal
} from "./store-local";
import {
  createSupabase,
  createSupabaseLengkap,
  getSupabase,
  listSupabase,
  listSupabaseByOwner,
  updateStatusSupabase
} from "./store-supabase";
import {
  teksPernyataanAi,
  type JurnalWizardInput
} from "./wizard";

export type JurnalDataMode = "supabase" | "local";

let modePromise: Promise<JurnalDataMode> | null = null;

async function deteksiMode(): Promise<JurnalDataMode> {
  const paksa = (process.env.JURNAL_DATA_MODE || "").trim().toLowerCase();
  if (paksa === "local") return "local";

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    if (paksa === "supabase") {
      console.warn(
        "[jurnal] JURNAL_DATA_MODE=supabase tetapi SUPABASE_SERVICE_ROLE_KEY tidak terpasang; jatuh ke mode lokal."
      );
    }
    return "local";
  }

  try {
    const { error } = await supabaseAdmin
      .from("jurnal_submissions")
      .select("id", { head: true, count: "exact" })
      .limit(1);
    if (error) {
      console.warn(
        `[jurnal] Tabel jurnal belum tersedia (${error.message}); jatuh ke mode lokal. Jalankan migrasi 004 untuk mengaktifkan mode supabase.`
      );
      return "local";
    }
    return "supabase";
  } catch (err) {
    console.warn(
      `[jurnal] Pemeriksaan tabel jurnal gagal (${err instanceof Error ? err.message : String(err)}); jatuh ke mode lokal.`
    );
    return "local";
  }
}

export function getJurnalDataMode(): Promise<JurnalDataMode> {
  if (!modePromise) modePromise = deteksiMode();
  return modePromise;
}

// Panel dan route tulis wajib login berperan hanya pada mode supabase.
// Pada mode lokal panel berjalan sebagai mode uji terbuka (ditandai jelas
// di halaman), sama seperti versi uji sebelumnya.
export async function isJurnalAuthRequired(): Promise<boolean> {
  return (await getJurnalDataMode()) === "supabase";
}

export async function listSubmissions(): Promise<JurnalSubmissionView[]> {
  return (await getJurnalDataMode()) === "supabase"
    ? listSupabase()
    : listLokal();
}

export async function getSubmission(
  kode: string
): Promise<JurnalSubmissionView | null> {
  return (await getJurnalDataMode()) === "supabase"
    ? getSupabase(kode)
    : getLokal(kode);
}

export async function createSubmission(input: {
  judul: string;
  penulis: string;
  email: string;
  afiliasi: string;
  abstrak: string;
}): Promise<JurnalSubmissionView> {
  return (await getJurnalDataMode()) === "supabase"
    ? createSupabase(input)
    : createLokal(input);
}

export async function updateSubmissionStatus(
  kode: string,
  status: JurnalStatus,
  actor?: { userId?: string | null; label?: string | null },
  catatan?: string | null
): Promise<JurnalSubmissionView | null> {
  if ((await getJurnalDataMode()) === "supabase") {
    return updateStatusSupabase(kode, status, actor, catatan);
  }
  // Backend lokal tidak menyimpan pelaku; catatan tetap dicatat.
  return updateStatusLokal(kode, status, catatan);
}

// ── Tahap 2: wizard kirim lengkap dan daftar milik penulis ───────────────

export async function createSubmissionLengkap(
  input: JurnalWizardInput,
  submitterUserId?: string | null
): Promise<JurnalSubmissionView> {
  const pernyataanAiTeks = teksPernyataanAi(input.pernyataanAi);
  if ((await getJurnalDataMode()) === "supabase") {
    return createSupabaseLengkap(input, pernyataanAiTeks, submitterUserId);
  }
  return createLokalLengkap(input, pernyataanAiTeks);
}

// Daftar naskah milik satu penulis (halaman "Naskah Saya"). Penulis hanya
// pernah menerima naskahnya sendiri: backend supabase menyaring menurut
// submitter_user_id atau email pengirim, backend lokal menurut email.
export async function listSubmissionsByOwner(owner: {
  email: string;
  userId?: string | null;
}): Promise<JurnalSubmissionView[]> {
  if ((await getJurnalDataMode()) === "supabase") {
    return listSupabaseByOwner(owner);
  }
  return listLokalByEmail(owner.email);
}

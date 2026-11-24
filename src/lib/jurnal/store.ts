// ─────────────────────────────────────────────────────────────────────────────
// Fasad lapisan data jurnal — SERVER ONLY.
//
// Dua backend di belakang satu antarmuka:
// - "supabase": tabel jurnal_* migrasi 004 lewat service role. Dipakai
//   bila SUPABASE_SERVICE_ROLE_KEY terpasang DAN pemeriksaan ringan ke
//   tabel jurnal_submissions berhasil (artinya migrasi sudah dijalankan
//   di proyek tujuan).
// - "local": berkas JSON uji di .jurnal-uji/ (store-local.ts). Hanya
//   dipakai bila mode lokal dipilih secara eksplisit
//   (JURNAL_DATA_MODE=local) atau bila tidak ada konfigurasi supabase
//   sama sekali (kunci service role tidak terpasang), supaya build dan
//   uji lokal tidak pernah pecah.
//
// GAGAL-TERTUTUP (perbaikan audit Irisan 2): bila konfigurasi
// menunjukkan supabase yang dipilih (kunci service role terpasang atau
// JURNAL_DATA_MODE=supabase) tetapi pemeriksaan tabel gagal, deteksi
// mode MELEMPAR galat yang jelas. Jatuh diam-diam ke berkas JSON lokal
// pada keadaan itu akan membagi data produksi dan menghidupkan
// perilaku mode uji tanpa ada yang menyadari.
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
  appendEventSupabase,
  createSupabase,
  createSupabaseLengkap,
  getSupabase,
  listSupabase,
  listSupabaseByOwner,
  updateStatusSupabase
} from "./store-supabase";
import { tambahRiwayatLokal } from "./store-local";
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
      throw new Error(
        "[jurnal] JURNAL_DATA_MODE=supabase tetapi SUPABASE_SERVICE_ROLE_KEY tidak terpasang. Mode lokal tidak diaktifkan diam-diam; pasang kunci service role atau set JURNAL_DATA_MODE=local secara eksplisit untuk mode uji."
      );
    }
    // Tidak ada konfigurasi supabase sama sekali: mode lokal adalah
    // pilihan bawaan yang sah untuk build dan uji.
    return "local";
  }

  // Kunci service role terpasang berarti supabase adalah backend yang
  // dipilih konfigurasi. Kegagalan pemeriksaan tabel sesudah ini adalah
  // galat konfigurasi sungguhan dan gagal-tertutup: galat diteruskan ke
  // pemanggil, bukan ditelan dengan beralih ke berkas lokal.
  const { error } = await supabaseAdmin
    .from("jurnal_submissions")
    .select("id", { head: true, count: "exact" })
    .limit(1);
  if (error) {
    throw new Error(
      `[jurnal] Mode supabase dipilih tetapi tabel jurnal_submissions tidak dapat diperiksa (${error.message}). Jalankan migrasi 004 di proyek tujuan, atau set JURNAL_DATA_MODE=local secara eksplisit untuk mode uji.`
    );
  }
  return "supabase";
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

// ── Tahap 3: peristiwa linimasa tanpa perubahan status ──────────────────
// Dipakai mesin review untuk mencatat penugasan, penyerahan telaah,
// pembukaan putaran, keputusan revisi, dan unggahan revisi. Catatan
// terbaca penulis lewat lacak dan Naskah Saya, jadi isinya tidak pernah
// boleh memuat identitas reviewer.
export async function catatPeristiwaNaskah(
  kode: string,
  catatan: string,
  actor?: { userId?: string | null; label?: string | null },
  jenis = "review"
): Promise<void> {
  if ((await getJurnalDataMode()) === "supabase") {
    await appendEventSupabase(kode, catatan, actor, jenis);
    return;
  }
  await tambahRiwayatLokal(kode, catatan);
}

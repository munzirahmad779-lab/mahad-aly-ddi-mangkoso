// ─────────────────────────────────────────────────────────────────────────────
// Backend data Supabase jurnal — SERVER ONLY.
//
// Membaca dan menulis tabel jurnal_* dari migrasi 004 lewat klien service
// role repo (supabaseAdmin), mengikuti pola route server situs utama:
// RLS di basis data hanya mengatur bacaan langsung, sedangkan penulisan
// sah berjalan di sini sesudah pemeriksaan peran di route.
//
// Berkas naskah TIDAK pernah masuk ke sini: tabel jurnal_submission_files
// hanya menyimpan metadata dan kunci objek R2 (keputusan user 22 Nov
// 2026). Tahap 1 belum menulis berkas; fungsi berkas datang pada Tahap 2.
// ─────────────────────────────────────────────────────────────────────────────

import { supabaseAdmin } from "@/lib/supabase/server";
import {
  labelStatus,
  type JurnalRiwayatItem,
  type JurnalStatus,
  type JurnalSubmissionView
} from "./status";

interface BarisNaskah {
  id: string;
  tracking_code: string;
  submitter_name: string;
  submitter_email: string;
  title_id: string;
  abstract_id: string | null;
  status: JurnalStatus;
  date_submitted: string;
}

interface BarisPeristiwa {
  to_status: string | null;
  note: string | null;
  created_at: string;
}

const STATUS_SAH: JurnalStatus[] = [
  "submitted",
  "review",
  "copyediting",
  "production",
  "published",
  "declined"
];

function normalisasiStatus(v: string | null): JurnalStatus {
  return v && STATUS_SAH.includes(v as JurnalStatus)
    ? (v as JurnalStatus)
    : "submitted";
}

function keTampilan(
  n: BarisNaskah,
  afiliasi: string,
  peristiwa: BarisPeristiwa[]
): JurnalSubmissionView {
  const riwayat: JurnalRiwayatItem[] = peristiwa
    .filter((p) => p.to_status)
    .map((p) => {
      const status = normalisasiStatus(p.to_status);
      return {
        status,
        label: labelStatus(status),
        pada: p.created_at,
        catatan: p.note
      };
    });
  return {
    kode: n.tracking_code,
    judul: n.title_id,
    penulis: n.submitter_name,
    email: n.submitter_email,
    afiliasi,
    abstrak: n.abstract_id ?? "",
    status: n.status,
    statusLabel: labelStatus(n.status),
    riwayat,
    dibuatPada: n.date_submitted
  };
}

async function ambilAfiliasiUtama(
  submissionIds: string[]
): Promise<Map<string, string>> {
  const peta = new Map<string, string>();
  if (submissionIds.length === 0) return peta;
  const { data, error } = await supabaseAdmin
    .from("jurnal_submission_authors")
    .select("submission_id, affiliation")
    .in("submission_id", submissionIds)
    .eq("is_primary", true);
  if (error) throw new Error(`Gagal membaca penulis jurnal: ${error.message}`);
  for (const baris of data ?? []) {
    if (baris.affiliation) {
      peta.set(baris.submission_id as string, baris.affiliation as string);
    }
  }
  return peta;
}

async function ambilPeristiwa(
  submissionIds: string[]
): Promise<Map<string, BarisPeristiwa[]>> {
  const peta = new Map<string, BarisPeristiwa[]>();
  if (submissionIds.length === 0) return peta;
  const { data, error } = await supabaseAdmin
    .from("jurnal_submission_events")
    .select("submission_id, to_status, note, created_at")
    .in("submission_id", submissionIds)
    .order("created_at", { ascending: true });
  if (error) throw new Error(`Gagal membaca linimasa jurnal: ${error.message}`);
  for (const baris of data ?? []) {
    const id = baris.submission_id as string;
    const daftar = peta.get(id) ?? [];
    daftar.push({
      to_status: baris.to_status as string | null,
      note: baris.note as string | null,
      created_at: baris.created_at as string
    });
    peta.set(id, daftar);
  }
  return peta;
}

const KOLOM_NASKAH =
  "id, tracking_code, submitter_name, submitter_email, title_id, abstract_id, status, date_submitted";

export async function listSupabase(): Promise<JurnalSubmissionView[]> {
  const { data, error } = await supabaseAdmin
    .from("jurnal_submissions")
    .select(KOLOM_NASKAH)
    .order("date_submitted", { ascending: false })
    .limit(200);
  if (error) throw new Error(`Gagal membaca naskah jurnal: ${error.message}`);
  const baris = (data ?? []) as unknown as BarisNaskah[];
  const ids = baris.map((b) => b.id);
  const [afiliasi, peristiwa] = await Promise.all([
    ambilAfiliasiUtama(ids),
    ambilPeristiwa(ids)
  ]);
  return baris.map((b) =>
    keTampilan(b, afiliasi.get(b.id) ?? "", peristiwa.get(b.id) ?? [])
  );
}

export async function getSupabase(
  kode: string
): Promise<JurnalSubmissionView | null> {
  const target = kode.trim().toUpperCase();
  const { data, error } = await supabaseAdmin
    .from("jurnal_submissions")
    .select(KOLOM_NASKAH)
    .eq("tracking_code", target)
    .maybeSingle();
  if (error) throw new Error(`Gagal membaca naskah jurnal: ${error.message}`);
  if (!data) return null;
  const baris = data as unknown as BarisNaskah;
  const [afiliasi, peristiwa] = await Promise.all([
    ambilAfiliasiUtama([baris.id]),
    ambilPeristiwa([baris.id])
  ]);
  return keTampilan(
    baris,
    afiliasi.get(baris.id) ?? "",
    peristiwa.get(baris.id) ?? []
  );
}

function buatKode(): string {
  const tahun = new Date().getFullYear();
  const acak = Math.floor(1000 + Math.random() * 9000);
  return `JRN-${tahun}-${acak}`;
}

export async function createSupabase(input: {
  judul: string;
  penulis: string;
  email: string;
  afiliasi: string;
  abstrak: string;
}): Promise<JurnalSubmissionView> {
  // Kode lacak unik ditegakkan basis data; bentrok (23505) dicoba ulang.
  let kode = "";
  let idBaru = "";
  let lastError: string | null = null;
  for (let i = 0; i < 8 && !idBaru; i++) {
    kode = buatKode();
    const { data, error } = await supabaseAdmin
      .from("jurnal_submissions")
      .insert({
        tracking_code: kode,
        submitter_name: input.penulis,
        submitter_email: input.email,
        title_id: input.judul,
        abstract_id: input.abstrak,
        language: "id",
        status: "submitted"
      })
      .select("id")
      .single();
    if (!error && data) {
      idBaru = data.id as string;
    } else {
      lastError = error?.message ?? "galat tidak dikenal";
      if (error && error.code !== "23505") break;
    }
  }
  if (!idBaru) {
    throw new Error(`Gagal menyimpan naskah jurnal: ${lastError}`);
  }

  const { error: errPenulis } = await supabaseAdmin
    .from("jurnal_submission_authors")
    .insert({
      submission_id: idBaru,
      given_name: input.penulis,
      email: input.email,
      affiliation: input.afiliasi,
      is_primary: true,
      is_corresponding: true,
      sort_order: 0
    });
  if (errPenulis) {
    throw new Error(`Gagal menyimpan penulis jurnal: ${errPenulis.message}`);
  }

  const { error: errPeristiwa } = await supabaseAdmin
    .from("jurnal_submission_events")
    .insert({
      submission_id: idBaru,
      event_type: "status_change",
      to_status: "submitted",
      actor_label: "Penulis (formulir publik)"
    });
  if (errPeristiwa) {
    throw new Error(`Gagal mencatat linimasa jurnal: ${errPeristiwa.message}`);
  }

  const tampilan = await getSupabase(kode);
  if (!tampilan) throw new Error("Naskah tersimpan tetapi tidak terbaca kembali.");
  return tampilan;
}

export async function updateStatusSupabase(
  kode: string,
  status: JurnalStatus,
  actor?: { userId?: string | null; label?: string | null },
  catatan?: string | null
): Promise<JurnalSubmissionView | null> {
  const target = kode.trim().toUpperCase();
  const { data: lama, error: errBaca } = await supabaseAdmin
    .from("jurnal_submissions")
    .select("id, status")
    .eq("tracking_code", target)
    .maybeSingle();
  if (errBaca) throw new Error(`Gagal membaca naskah jurnal: ${errBaca.message}`);
  if (!lama) return null;

  const pembaruan: Record<string, unknown> = { status };
  if (status === "published") {
    pembaruan.date_published = new Date().toISOString();
  }
  const { error: errUbah } = await supabaseAdmin
    .from("jurnal_submissions")
    .update(pembaruan)
    .eq("id", lama.id as string);
  if (errUbah) throw new Error(`Gagal mengubah status jurnal: ${errUbah.message}`);

  const { error: errPeristiwa } = await supabaseAdmin
    .from("jurnal_submission_events")
    .insert({
      submission_id: lama.id as string,
      event_type: "status_change",
      from_status: lama.status as string,
      to_status: status,
      actor_user_id: actor?.userId ?? null,
      actor_label: actor?.label ?? null,
      note: catatan ?? null
    });
  if (errPeristiwa) {
    throw new Error(`Gagal mencatat linimasa jurnal: ${errPeristiwa.message}`);
  }

  return getSupabase(target);
}

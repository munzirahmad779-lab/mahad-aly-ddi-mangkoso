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
import {
  labelBagian,
  type JurnalWizardInput
} from "./wizard";

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

// ── Tahap 2: pengiriman lengkap dari wizard dan daftar per pemilik ───────

interface BarisNaskahLengkap extends BarisNaskah {
  section_id: string | null;
  language: string;
  title_en: string | null;
  abstract_en: string | null;
  keywords: string[] | null;
  ai_statement: string | null;
}

const KOLOM_NASKAH_LENGKAP =
  KOLOM_NASKAH +
  ", section_id, language, title_en, abstract_en, keywords, ai_statement";

interface BarisPenulisLengkap {
  submission_id: string;
  given_name: string;
  family_name: string | null;
  email: string | null;
  affiliation: string | null;
  orcid: string | null;
  is_primary: boolean;
  sort_order: number;
}

interface BarisBerkas {
  submission_id: string;
  stage: string;
  kind: string;
  original_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  r2_bucket: string;
  r2_key: string;
}

async function ambilSlugBagian(
  sectionIds: string[]
): Promise<Map<string, string>> {
  const peta = new Map<string, string>();
  const unik = [...new Set(sectionIds.filter(Boolean))];
  if (unik.length === 0) return peta;
  const { data, error } = await supabaseAdmin
    .from("jurnal_sections")
    .select("id, slug")
    .in("id", unik);
  if (error) throw new Error(`Gagal membaca bagian jurnal: ${error.message}`);
  for (const baris of data ?? []) {
    peta.set(baris.id as string, baris.slug as string);
  }
  return peta;
}

async function ambilPenulisSemua(
  submissionIds: string[]
): Promise<Map<string, BarisPenulisLengkap[]>> {
  const peta = new Map<string, BarisPenulisLengkap[]>();
  if (submissionIds.length === 0) return peta;
  const { data, error } = await supabaseAdmin
    .from("jurnal_submission_authors")
    .select(
      "submission_id, given_name, family_name, email, affiliation, orcid, is_primary, sort_order"
    )
    .in("submission_id", submissionIds)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(`Gagal membaca penulis jurnal: ${error.message}`);
  for (const baris of data ?? []) {
    const id = baris.submission_id as string;
    const daftar = peta.get(id) ?? [];
    daftar.push(baris as unknown as BarisPenulisLengkap);
    peta.set(id, daftar);
  }
  return peta;
}

async function ambilBerkas(
  submissionIds: string[]
): Promise<Map<string, BarisBerkas[]>> {
  const peta = new Map<string, BarisBerkas[]>();
  if (submissionIds.length === 0) return peta;
  const { data, error } = await supabaseAdmin
    .from("jurnal_submission_files")
    .select(
      "submission_id, stage, kind, original_name, mime_type, size_bytes, r2_bucket, r2_key"
    )
    .in("submission_id", submissionIds)
    .order("created_at", { ascending: true });
  if (error) throw new Error(`Gagal membaca berkas jurnal: ${error.message}`);
  for (const baris of data ?? []) {
    const id = baris.submission_id as string;
    const daftar = peta.get(id) ?? [];
    daftar.push(baris as unknown as BarisBerkas);
    peta.set(id, daftar);
  }
  return peta;
}

function namaLengkapPenulis(p: BarisPenulisLengkap): string {
  return [p.given_name, p.family_name].filter(Boolean).join(" ").trim();
}

function keTampilanLengkap(
  n: BarisNaskahLengkap,
  slugBagian: string | null,
  penulis: BarisPenulisLengkap[],
  berkas: BarisBerkas[],
  peristiwa: BarisPeristiwa[]
): JurnalSubmissionView {
  const utama = penulis.find((p) => p.is_primary) ?? penulis[0];
  const dasar = keTampilan(
    n,
    utama?.affiliation ?? "",
    peristiwa
  );
  return {
    ...dasar,
    penulis: utama ? namaLengkapPenulis(utama) : n.submitter_name,
    bagianSlug: slugBagian,
    bagianLabel: labelBagian(slugBagian),
    bahasa: n.language ?? "id",
    abstrakEn: n.abstract_en ?? "",
    kataKunci: n.keywords ?? [],
    penulisPendamping: penulis
      .filter((p) => p !== utama)
      .map((p) => ({
        nama: namaLengkapPenulis(p),
        email: p.email ?? "",
        afiliasi: p.affiliation ?? "",
        orcid: p.orcid
      })),
    berkas: berkas.map((b) => ({
      kategori:
        b.stage === "supplementary" || b.kind === "supplementary"
          ? ("pendukung" as const)
          : ("utama" as const),
      namaAsli: b.original_name,
      mime: b.mime_type ?? "",
      ukuran: b.size_bytes ?? 0,
      bucket: b.r2_bucket,
      kunci: b.r2_key
    })),
    pernyataanAi: n.ai_statement
  };
}

async function lengkapiTampilan(
  baris: BarisNaskahLengkap[]
): Promise<JurnalSubmissionView[]> {
  const ids = baris.map((b) => b.id);
  const [slug, penulis, berkas, peristiwa] = await Promise.all([
    ambilSlugBagian(baris.map((b) => b.section_id ?? "")),
    ambilPenulisSemua(ids),
    ambilBerkas(ids),
    ambilPeristiwa(ids)
  ]);
  return baris.map((b) =>
    keTampilanLengkap(
      b,
      b.section_id ? (slug.get(b.section_id) ?? null) : null,
      penulis.get(b.id) ?? [],
      berkas.get(b.id) ?? [],
      peristiwa.get(b.id) ?? []
    )
  );
}

export async function createSupabaseLengkap(
  input: JurnalWizardInput,
  pernyataanAiTeks: string,
  submitterUserId?: string | null
): Promise<JurnalSubmissionView> {
  // Petakan slug bagian ke id baris jurnal_sections.
  const { data: bagian, error: errBagian } = await supabaseAdmin
    .from("jurnal_sections")
    .select("id")
    .eq("slug", input.bagianSlug)
    .maybeSingle();
  if (errBagian) {
    throw new Error(`Gagal membaca bagian jurnal: ${errBagian.message}`);
  }
  if (!bagian) {
    throw new Error(`Bagian jurnal tidak dikenal: ${input.bagianSlug}`);
  }

  let kode = "";
  let idBaru = "";
  let lastError: string | null = null;
  for (let i = 0; i < 8 && !idBaru; i++) {
    kode = buatKode();
    const { data, error } = await supabaseAdmin
      .from("jurnal_submissions")
      .insert({
        tracking_code: kode,
        submitter_user_id: submitterUserId ?? null,
        submitter_name: input.penulisUtama.nama,
        submitter_email: input.penulisUtama.email.toLowerCase(),
        section_id: bagian.id as string,
        language: input.bahasa,
        title_id: input.judul,
        abstract_id: input.abstrakId,
        abstract_en: input.abstrakEn,
        keywords: input.kataKunci,
        ai_statement: pernyataanAiTeks,
        checklist: input.daftarPeriksa,
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

  const barisPenulis = [
    {
      submission_id: idBaru,
      given_name: input.penulisUtama.nama,
      email: input.penulisUtama.email.toLowerCase(),
      affiliation: input.penulisUtama.afiliasi,
      orcid: input.penulisUtama.orcid || null,
      is_primary: true,
      is_corresponding: true,
      sort_order: 0
    },
    ...input.penulisPendamping.map((p, idx) => ({
      submission_id: idBaru,
      given_name: p.nama,
      email: p.email.toLowerCase(),
      affiliation: p.afiliasi,
      orcid: p.orcid || null,
      is_primary: false,
      is_corresponding: false,
      sort_order: idx + 1
    }))
  ];
  const { error: errPenulis } = await supabaseAdmin
    .from("jurnal_submission_authors")
    .insert(barisPenulis);
  if (errPenulis) {
    throw new Error(`Gagal menyimpan penulis jurnal: ${errPenulis.message}`);
  }

  if (input.berkas.length > 0) {
    const barisBerkas = input.berkas.map((b) => ({
      submission_id: idBaru,
      stage: b.kategori === "utama" ? "submission" : "supplementary",
      kind: b.kategori === "utama" ? "manuscript" : "supplementary",
      original_name: b.namaAsli,
      mime_type: b.mime,
      size_bytes: b.ukuran,
      r2_bucket: b.bucket,
      r2_key: b.kunci,
      uploaded_by: submitterUserId ?? null
    }));
    const { error: errBerkas } = await supabaseAdmin
      .from("jurnal_submission_files")
      .insert(barisBerkas);
    if (errBerkas) {
      throw new Error(`Gagal menyimpan metadata berkas: ${errBerkas.message}`);
    }
  }

  const { error: errPeristiwa } = await supabaseAdmin
    .from("jurnal_submission_events")
    .insert({
      submission_id: idBaru,
      event_type: "status_change",
      to_status: "submitted",
      actor_user_id: submitterUserId ?? null,
      actor_label: "Penulis (wizard kirim)"
    });
  if (errPeristiwa) {
    throw new Error(`Gagal mencatat linimasa jurnal: ${errPeristiwa.message}`);
  }

  const { data: tersimpan, error: errBaca } = await supabaseAdmin
    .from("jurnal_submissions")
    .select(KOLOM_NASKAH_LENGKAP)
    .eq("id", idBaru)
    .single();
  if (errBaca || !tersimpan) {
    throw new Error("Naskah tersimpan tetapi tidak terbaca kembali.");
  }
  const [tampilan] = await lengkapiTampilan([
    tersimpan as unknown as BarisNaskahLengkap
  ]);
  return tampilan;
}

export async function listSupabaseByOwner(owner: {
  email: string;
  userId?: string | null;
}): Promise<JurnalSubmissionView[]> {
  let query = supabaseAdmin
    .from("jurnal_submissions")
    .select(KOLOM_NASKAH_LENGKAP)
    .order("date_submitted", { ascending: false })
    .limit(200);
  if (owner.userId) {
    query = query.or(
      `submitter_user_id.eq.${owner.userId},submitter_email.eq.${owner.email}`
    );
  } else {
    query = query.eq("submitter_email", owner.email);
  }
  const { data, error } = await query;
  if (error) throw new Error(`Gagal membaca naskah penulis: ${error.message}`);
  return lengkapiTampilan((data ?? []) as unknown as BarisNaskahLengkap[]);
}

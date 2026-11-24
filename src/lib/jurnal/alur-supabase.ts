// ─────────────────────────────────────────────────────────────────────────────
// Backend alur Tahap 4 MODE SUPABASE — SERVER ONLY.
//
// Memakai tabel migrasi 004 (jurnal_copyediting_tasks,
// jurnal_production_tasks, jurnal_issues, jurnal_submission_files,
// jurnal_article_daily_metrics, kolom penempatan pada
// jurnal_submissions) dan kolom tambahan migrasi 007, lewat service
// role sesudah pemeriksaan peran di route. Berkas tahap hanya berupa
// baris metadata di jurnal_submission_files dengan stage 'copyedit'
// atau 'galley'; isi berkas tetap di R2 (keputusan user 22 Nov 2026).
// ─────────────────────────────────────────────────────────────────────────────

import { supabaseAdmin } from "@/lib/supabase/server";
import type {
  AlurBackend,
  ArtikelPublikInternal,
  BerkasAlurInternal,
  PenempatanInternal,
  TerbitanInternal,
  TugasCopyInternal,
  TugasProduksiInternal
} from "./alur-internal";

async function ambilIdNaskah(kode: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from("jurnal_submissions")
    .select("id")
    .eq("tracking_code", kode.trim().toUpperCase())
    .maybeSingle();
  if (error) throw new Error(`Gagal membaca naskah jurnal: ${error.message}`);
  return data ? (data.id as string) : null;
}

async function petaPengguna(
  userIds: string[]
): Promise<Map<string, { email: string; nama: string; afiliasi: string }>> {
  const peta = new Map<
    string,
    { email: string; nama: string; afiliasi: string }
  >();
  const unik = [...new Set(userIds.filter(Boolean))];
  if (unik.length === 0) return peta;
  const { data, error } = await supabaseAdmin
    .from("jurnal_users")
    .select("id, email, full_name, affiliation")
    .in("id", unik);
  if (error) throw new Error(`Gagal membaca pengguna jurnal: ${error.message}`);
  for (const u of data ?? []) {
    peta.set(u.id as string, {
      email: (u.email as string) ?? "",
      nama: (u.full_name as string) ?? "",
      afiliasi: (u.affiliation as string) ?? ""
    });
  }
  return peta;
}

async function cariUserIdByEmail(email: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from("jurnal_users")
    .select("id")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();
  if (error) throw new Error(`Gagal membaca pengguna jurnal: ${error.message}`);
  return data ? (data.id as string) : null;
}

// Berkas tahap copyedit dan galley per naskah, dari jurnal_submission_files.
async function ambilBerkasAlurBySubmissionId(
  submissionId: string,
  kode: string
): Promise<BerkasAlurInternal[]> {
  const { data, error } = await supabaseAdmin
    .from("jurnal_submission_files")
    .select(
      "id, stage, kind, original_name, mime_type, size_bytes, r2_bucket, r2_key, uploaded_by, created_at"
    )
    .eq("submission_id", submissionId)
    .in("stage", ["copyedit", "galley"])
    .order("created_at", { ascending: true });
  if (error) throw new Error(`Gagal membaca berkas tahap: ${error.message}`);
  const uploaderIds = (data ?? [])
    .map((b) => b.uploaded_by as string | null)
    .filter((x): x is string => Boolean(x));
  const peta = await petaPengguna(uploaderIds);
  return (data ?? []).map<BerkasAlurInternal>((b) => ({
    id: b.id as string,
    kode,
    tahap: b.stage === "galley" ? "galley" : "copyedit",
    jenis:
      b.stage === "galley"
        ? b.kind === "galley_html"
          ? "galley_html"
          : "galley_pdf"
        : "copyedited",
    namaAsli: b.original_name as string,
    mime: (b.mime_type as string) ?? "",
    ukuran: (b.size_bytes as number) ?? 0,
    bucket: b.r2_bucket as string,
    kunci: b.r2_key as string,
    diunggahOleh: b.uploaded_by
      ? (peta.get(b.uploaded_by as string)?.email ?? null)
      : null,
    diunggahPada: b.created_at as string
  }));
}

interface BarisTugasCopy {
  id: string;
  submission_id: string;
  copyeditor_user_id: string | null;
  assigned_by: string | null;
  status: string;
  notes: string | null;
  date_completed: string | null;
  author_approved_at: string | null;
  created_at: string;
}

const KOLOM_TUGAS_COPY =
  "id, submission_id, copyeditor_user_id, assigned_by, status, notes, date_completed, author_approved_at, created_at";

interface BarisTugasProduksi {
  id: string;
  submission_id: string;
  layout_user_id: string | null;
  assigned_by: string | null;
  status: string;
  notes: string | null;
  proof_status: string;
  proof_note: string | null;
  proof_at: string | null;
  date_completed: string | null;
  created_at: string;
}

const KOLOM_TUGAS_PRODUKSI =
  "id, submission_id, layout_user_id, assigned_by, status, notes, proof_status, proof_note, proof_at, date_completed, created_at";

interface BarisTerbitan {
  id: string;
  slug: string;
  volume: number | null;
  number: number | null;
  year: number;
  title_id: string | null;
  description_id: string | null;
  status: string;
  is_current: boolean;
  published_at: string | null;
  created_at: string;
}

function terbitanKeInternal(b: BarisTerbitan): TerbitanInternal {
  return {
    id: b.id,
    slug: b.slug,
    volume: b.volume,
    number: b.number,
    year: b.year,
    judul: b.title_id,
    uraian: b.description_id,
    status: (["draft", "scheduled", "published"].includes(b.status)
      ? b.status
      : "draft") as TerbitanInternal["status"],
    isCurrent: b.is_current,
    tanggalTerbit: b.published_at,
    dibuatPada: b.created_at
  };
}

export const alurBackendSupabase: AlurBackend = {
  async daftarPetugas(peran) {
    const { data: peranBaris, error } = await supabaseAdmin
      .from("jurnal_user_roles")
      .select("user_id")
      .eq("role", peran);
    if (error) throw new Error(`Gagal membaca peran petugas: ${error.message}`);
    const ids = [
      ...new Set((peranBaris ?? []).map((p) => p.user_id as string))
    ];
    if (ids.length === 0) return [];
    const { data: users, error: errUsers } = await supabaseAdmin
      .from("jurnal_users")
      .select("id, email, full_name, affiliation, is_active")
      .in("id", ids)
      .eq("is_active", true)
      .order("full_name", { ascending: true });
    if (errUsers) {
      throw new Error(`Gagal membaca pengguna jurnal: ${errUsers.message}`);
    }
    return (users ?? []).map((u) => ({
      userId: u.id as string,
      email: (u.email as string) ?? "",
      nama: (u.full_name as string) ?? "",
      afiliasi: (u.affiliation as string) ?? ""
    }));
  },

  async ambilTugasCopy(kode) {
    const id = await ambilIdNaskah(kode);
    if (!id) return [];
    const { data, error } = await supabaseAdmin
      .from("jurnal_copyediting_tasks")
      .select(KOLOM_TUGAS_COPY)
      .eq("submission_id", id)
      .order("created_at", { ascending: true });
    if (error) throw new Error(`Gagal membaca tugas copyediting: ${error.message}`);
    const baris = (data ?? []) as unknown as BarisTugasCopy[];
    const peta = await petaPengguna(
      baris.map((b) => b.copyeditor_user_id ?? "").filter(Boolean)
    );
    const berkas = await ambilBerkasAlurBySubmissionId(id, kode);
    const hasilTerakhir = [...berkas]
      .filter((b) => b.tahap === "copyedit")
      .pop();
    return baris.map<TugasCopyInternal>((b) => ({
      id: b.id,
      kode: kode.trim().toUpperCase(),
      copyeditorUserId: b.copyeditor_user_id,
      copyeditorEmail: b.copyeditor_user_id
        ? (peta.get(b.copyeditor_user_id)?.email ?? "")
        : "",
      copyeditorNama: b.copyeditor_user_id
        ? (peta.get(b.copyeditor_user_id)?.nama ?? "")
        : "",
      ditugaskanOleh: b.assigned_by,
      status: b.status as TugasCopyInternal["status"],
      catatan: b.notes,
      berkasHasilId: hasilTerakhir?.id ?? null,
      persetujuanPenulisPada: b.author_approved_at,
      dibuatPada: b.created_at,
      selesaiPada: b.date_completed
    }));
  },

  async buatTugasCopy({ kode, petugas, ditugaskanOleh, catatan }) {
    const id = await ambilIdNaskah(kode);
    if (!id) throw new Error("Naskah tidak ditemukan.");
    const copyeditorId =
      petugas.userId ?? (await cariUserIdByEmail(petugas.email));
    if (!copyeditorId) {
      throw new Error("Akun copyeditor tidak ditemukan di jurnal_users.");
    }
    const { data, error } = await supabaseAdmin
      .from("jurnal_copyediting_tasks")
      .insert({
        submission_id: id,
        copyeditor_user_id: copyeditorId,
        assigned_by: ditugaskanOleh,
        status: "assigned",
        notes: catatan
      })
      .select(KOLOM_TUGAS_COPY)
      .single();
    if (error) throw new Error(`Gagal membuat tugas copyediting: ${error.message}`);
    const b = data as unknown as BarisTugasCopy;
    return {
      id: b.id,
      kode: kode.trim().toUpperCase(),
      copyeditorUserId: b.copyeditor_user_id,
      copyeditorEmail: petugas.email,
      copyeditorNama: petugas.nama,
      ditugaskanOleh: b.assigned_by,
      status: b.status as TugasCopyInternal["status"],
      catatan: b.notes,
      berkasHasilId: null,
      persetujuanPenulisPada: b.author_approved_at,
      dibuatPada: b.created_at,
      selesaiPada: b.date_completed
    };
  },

  async ubahTugasCopy(idTugas, patch) {
    const pembaruan: Record<string, unknown> = {};
    if (patch.status !== undefined) pembaruan.status = patch.status;
    if (patch.persetujuanPenulisPada !== undefined) {
      pembaruan.author_approved_at = patch.persetujuanPenulisPada;
    }
    if (patch.selesaiPada !== undefined) {
      pembaruan.date_completed = patch.selesaiPada;
    }
    // berkasHasilId tidak disimpan di tabel tugas: berkas hasil adalah
    // baris jurnal_submission_files tahap copyedit (lihat simpanBerkasAlur).
    if (Object.keys(pembaruan).length === 0) return;
    const { error } = await supabaseAdmin
      .from("jurnal_copyediting_tasks")
      .update(pembaruan)
      .eq("id", idTugas);
    if (error) throw new Error(`Gagal mengubah tugas copyediting: ${error.message}`);
  },

  async ambilTugasProduksi(kode) {
    const id = await ambilIdNaskah(kode);
    if (!id) return [];
    const { data, error } = await supabaseAdmin
      .from("jurnal_production_tasks")
      .select(KOLOM_TUGAS_PRODUKSI)
      .eq("submission_id", id)
      .order("created_at", { ascending: true });
    if (error) throw new Error(`Gagal membaca tugas produksi: ${error.message}`);
    const baris = (data ?? []) as unknown as BarisTugasProduksi[];
    const peta = await petaPengguna(
      baris.map((b) => b.layout_user_id ?? "").filter(Boolean)
    );
    return baris.map<TugasProduksiInternal>((b) => ({
      id: b.id,
      kode: kode.trim().toUpperCase(),
      layoutUserId: b.layout_user_id,
      layoutEmail: b.layout_user_id
        ? (peta.get(b.layout_user_id)?.email ?? "")
        : "",
      layoutNama: b.layout_user_id
        ? (peta.get(b.layout_user_id)?.nama ?? "")
        : "",
      ditugaskanOleh: b.assigned_by,
      status: b.status as TugasProduksiInternal["status"],
      catatan: b.notes,
      proofStatus: (["menunggu", "disetujui", "koreksi"].includes(b.proof_status)
        ? b.proof_status
        : "menunggu") as TugasProduksiInternal["proofStatus"],
      proofCatatan: b.proof_note,
      proofPada: b.proof_at,
      siapPada: b.status === "ready" ? b.date_completed : null,
      dibuatPada: b.created_at
    }));
  },

  async buatTugasProduksi({ kode, petugas, ditugaskanOleh, catatan }) {
    const id = await ambilIdNaskah(kode);
    if (!id) throw new Error("Naskah tidak ditemukan.");
    const layoutId = petugas.userId ?? (await cariUserIdByEmail(petugas.email));
    if (!layoutId) {
      throw new Error("Akun layout editor tidak ditemukan di jurnal_users.");
    }
    const { data, error } = await supabaseAdmin
      .from("jurnal_production_tasks")
      .insert({
        submission_id: id,
        layout_user_id: layoutId,
        assigned_by: ditugaskanOleh,
        status: "assigned",
        notes: catatan
      })
      .select(KOLOM_TUGAS_PRODUKSI)
      .single();
    if (error) throw new Error(`Gagal membuat tugas produksi: ${error.message}`);
    const b = data as unknown as BarisTugasProduksi;
    return {
      id: b.id,
      kode: kode.trim().toUpperCase(),
      layoutUserId: b.layout_user_id,
      layoutEmail: petugas.email,
      layoutNama: petugas.nama,
      ditugaskanOleh: b.assigned_by,
      status: b.status as TugasProduksiInternal["status"],
      catatan: b.notes,
      proofStatus: "menunggu",
      proofCatatan: b.proof_note,
      proofPada: b.proof_at,
      siapPada: null,
      dibuatPada: b.created_at
    };
  },

  async ubahTugasProduksi(idTugas, patch) {
    const pembaruan: Record<string, unknown> = {};
    if (patch.status !== undefined) pembaruan.status = patch.status;
    if (patch.proofStatus !== undefined) {
      pembaruan.proof_status = patch.proofStatus;
    }
    if (patch.proofCatatan !== undefined) {
      pembaruan.proof_note = patch.proofCatatan;
    }
    if (patch.proofPada !== undefined) pembaruan.proof_at = patch.proofPada;
    if (patch.siapPada !== undefined) {
      pembaruan.date_completed = patch.siapPada;
    }
    if (Object.keys(pembaruan).length === 0) return;
    const { error } = await supabaseAdmin
      .from("jurnal_production_tasks")
      .update(pembaruan)
      .eq("id", idTugas);
    if (error) throw new Error(`Gagal mengubah tugas produksi: ${error.message}`);
  },

  async simpanBerkasAlur({ kode, tahap, jenis, berkas, diunggahOleh }) {
    const id = await ambilIdNaskah(kode);
    if (!id) throw new Error("Naskah tidak ditemukan.");
    if (tahap === "galley") {
      // Galley per jenis tunggal: baris lama jenis yang sama diganti.
      const { error: errHapus } = await supabaseAdmin
        .from("jurnal_submission_files")
        .delete()
        .eq("submission_id", id)
        .eq("stage", "galley")
        .eq("kind", jenis);
      if (errHapus) {
        throw new Error(`Gagal mengganti galley lama: ${errHapus.message}`);
      }
    }
    const uploaderId = diunggahOleh
      ? await cariUserIdByEmail(diunggahOleh)
      : null;
    const { data, error } = await supabaseAdmin
      .from("jurnal_submission_files")
      .insert({
        submission_id: id,
        stage: tahap,
        kind: jenis,
        original_name: berkas.namaAsli,
        mime_type: berkas.mime,
        size_bytes: berkas.ukuran,
        r2_bucket: berkas.bucket,
        r2_key: berkas.kunci,
        uploaded_by: uploaderId
      })
      .select("id, created_at")
      .single();
    if (error) throw new Error(`Gagal menyimpan metadata berkas tahap: ${error.message}`);
    return {
      id: data.id as string,
      kode: kode.trim().toUpperCase(),
      tahap,
      jenis,
      namaAsli: berkas.namaAsli,
      mime: berkas.mime,
      ukuran: berkas.ukuran,
      bucket: berkas.bucket,
      kunci: berkas.kunci,
      diunggahOleh,
      diunggahPada: data.created_at as string
    };
  },

  async ambilBerkasAlur(kode) {
    const id = await ambilIdNaskah(kode);
    if (!id) return [];
    return ambilBerkasAlurBySubmissionId(id, kode.trim().toUpperCase());
  },

  async daftarTerbitan() {
    const { data, error } = await supabaseAdmin
      .from("jurnal_issues")
      .select(
        "id, slug, volume, number, year, title_id, description_id, status, is_current, published_at, created_at"
      )
      .order("created_at", { ascending: false });
    if (error) throw new Error(`Gagal membaca terbitan: ${error.message}`);
    return (data ?? []).map((b) =>
      terbitanKeInternal(b as unknown as BarisTerbitan)
    );
  },

  async ambilTerbitanBySlug(slug) {
    const { data, error } = await supabaseAdmin
      .from("jurnal_issues")
      .select(
        "id, slug, volume, number, year, title_id, description_id, status, is_current, published_at, created_at"
      )
      .eq("slug", slug.trim().toLowerCase())
      .maybeSingle();
    if (error) throw new Error(`Gagal membaca terbitan: ${error.message}`);
    return data ? terbitanKeInternal(data as unknown as BarisTerbitan) : null;
  },

  async buatTerbitan(input) {
    const { data, error } = await supabaseAdmin
      .from("jurnal_issues")
      .insert({
        slug: input.slug,
        volume: input.volume,
        number: input.number,
        year: input.year,
        title_id: input.judul,
        description_id: input.uraian,
        status: "draft",
        is_current: false
      })
      .select(
        "id, slug, volume, number, year, title_id, description_id, status, is_current, published_at, created_at"
      )
      .single();
    if (error) throw new Error(`Gagal membuat terbitan: ${error.message}`);
    return terbitanKeInternal(data as unknown as BarisTerbitan);
  },

  async ubahTerbitan(id, patch) {
    if (patch.isCurrent === true) {
      const { error: errLepas } = await supabaseAdmin
        .from("jurnal_issues")
        .update({ is_current: false })
        .neq("id", id);
      if (errLepas) {
        throw new Error(`Gagal melepas terbitan berjalan: ${errLepas.message}`);
      }
    }
    const pembaruan: Record<string, unknown> = {};
    if (patch.volume !== undefined) pembaruan.volume = patch.volume;
    if (patch.number !== undefined) pembaruan.number = patch.number;
    if (patch.year !== undefined) pembaruan.year = patch.year;
    if (patch.judul !== undefined) pembaruan.title_id = patch.judul;
    if (patch.uraian !== undefined) pembaruan.description_id = patch.uraian;
    if (patch.status !== undefined) pembaruan.status = patch.status;
    if (patch.isCurrent !== undefined) pembaruan.is_current = patch.isCurrent;
    if (patch.tanggalTerbit !== undefined) {
      pembaruan.published_at = patch.tanggalTerbit;
    }
    if (Object.keys(pembaruan).length === 0) return;
    const { error } = await supabaseAdmin
      .from("jurnal_issues")
      .update(pembaruan)
      .eq("id", id);
    if (error) throw new Error(`Gagal mengubah terbitan: ${error.message}`);
  },

  async ambilPenempatanSemua() {
    const { data, error } = await supabaseAdmin
      .from("jurnal_submissions")
      .select("tracking_code, issue_id, issue_order")
      .not("issue_id", "is", null);
    if (error) throw new Error(`Gagal membaca penempatan: ${error.message}`);
    return (data ?? []).map<PenempatanInternal>((b) => ({
      kode: b.tracking_code as string,
      issueId: b.issue_id as string,
      urutan: (b.issue_order as number) ?? 0
    }));
  },

  async tetapkanPenempatan(kode, issueId, urutan) {
    const { error } = await supabaseAdmin
      .from("jurnal_submissions")
      .update({ issue_id: issueId, issue_order: urutan })
      .eq("tracking_code", kode.trim().toUpperCase());
    if (error) throw new Error(`Gagal menetapkan artikel: ${error.message}`);
  },

  async hapusPenempatan(kode) {
    const { error } = await supabaseAdmin
      .from("jurnal_submissions")
      .update({ issue_id: null, issue_order: null })
      .eq("tracking_code", kode.trim().toUpperCase());
    if (error) throw new Error(`Gagal melepas penempatan: ${error.message}`);
  },

  async catatMetrik(kode, jenis) {
    const id = await ambilIdNaskah(kode);
    if (!id) return;
    const tanggal = new Date().toISOString().slice(0, 10);
    // Satu panggilan RPC atomik (migrasi 011): upsert metrik harian
    // dan kenaikan kumulatif berjalan dalam satu transaksi basis data.
    // Pola lama baca-ubah-tulis kehilangan kenaikan saat akses
    // bersamaan dan menelan galat tulis (temuan N1 Mega Audit).
    // Galat kini dilempar; fasad alur-server menangkapnya sebagai
    // peringatan agar halaman publik tidak pernah gagal karena metrik.
    const { error } = await supabaseAdmin.rpc("jurnal_catat_metrik", {
      p_submission_id: id,
      p_metric_date: tanggal,
      p_jenis: jenis
    });
    if (error) {
      throw new Error(`Gagal mencatat metrik jurnal: ${error.message}`);
    }
  },

  async daftarArtikelPublik() {
    const { data, error } = await supabaseAdmin
      .from("jurnal_submissions")
      .select(
        "id, tracking_code, title_id, abstract_id, abstract_en, keywords, language, pages, first_page, last_page, references_text, doi, license, ai_statement, section_id, issue_id, issue_order"
      )
      .eq("status", "published")
      .is("withdrawn_at", null)
      .order("issue_order", { ascending: true });
    if (error) throw new Error(`Gagal membaca artikel terbit: ${error.message}`);
    const baris = (data ?? []) as unknown as Record<string, unknown>[];
    const hasil: ArtikelPublikInternal[] = [];
    for (const b of baris) {
      const id = b.id as string;
      const [{ data: penulis }, { data: berkas }, slugBagian] =
        await Promise.all([
          supabaseAdmin
            .from("jurnal_submission_authors")
            .select("given_name, family_name, affiliation, orcid, is_primary, sort_order")
            .eq("submission_id", id)
            .order("sort_order", { ascending: true }),
          supabaseAdmin
            .from("jurnal_submission_files")
            .select("kind, mime_type, r2_bucket, r2_key")
            .eq("submission_id", id)
            .eq("stage", "galley"),
          (async () => {
            if (!b.section_id) return null;
            const { data: bagian } = await supabaseAdmin
              .from("jurnal_sections")
              .select("slug")
              .eq("id", b.section_id as string)
              .maybeSingle();
            return (bagian?.slug as string) ?? null;
          })()
        ]);
      const daftarPenulis = (penulis ?? []).map((p) => ({
        nama: [p.given_name, p.family_name].filter(Boolean).join(" ").trim(),
        afiliasi: (p.affiliation as string) ?? "",
        orcid: (p.orcid as string) ?? null,
        utama: p.is_primary as boolean
      }));
      hasil.push({
        kode: b.tracking_code as string,
        judul: b.title_id as string,
        penulis: daftarPenulis.map(({ nama, afiliasi, orcid }) => ({
          nama,
          afiliasi,
          orcid
        })),
        afiliasiUtama:
          daftarPenulis.find((p) => p.utama)?.afiliasi ??
          daftarPenulis[0]?.afiliasi ??
          "",
        bagianSlug: slugBagian,
        abstrak: (b.abstract_id as string) ?? "",
        abstrakEn: (b.abstract_en as string) ?? "",
        kataKunci: (b.keywords as string[]) ?? [],
        halaman: (b.pages as string) ?? null,
        halamanMulai: (b.first_page as number) ?? null,
        halamanSelesai: (b.last_page as number) ?? null,
        referensi: (b.references_text as string) ?? null,
        bahasa: (b.language as string) ?? "id",
        doi: (b.doi as string) ?? null,
        lisensi: (b.license as string) ?? "CC BY 4.0",
        pernyataanAi: (b.ai_statement as string) ?? null,
        issueId: (b.issue_id as string) ?? null,
        urutan: (b.issue_order as number) ?? 0,
        galley: (berkas ?? []).map((f) => ({
          jenis: (f.kind === "galley_html" ? "html" : "pdf") as
            | "pdf"
            | "html",
          bucket: f.r2_bucket as string,
          kunci: f.r2_key as string,
          mime: (f.mime_type as string) ?? ""
        }))
      });
    }
    return hasil;
  }
};

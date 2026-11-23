// ─────────────────────────────────────────────────────────────────────────────
// Backend review MODE SUPABASE — SERVER ONLY.
//
// Memakai tabel migrasi 004 (jurnal_review_rounds,
// jurnal_review_assignments, jurnal_submission_files) lewat service
// role, sesudah pemeriksaan peran di route. Kueri khusus reviewer
// (ambilNaskahAnonim) memang hanya memilih kolom yang aman: tidak ada
// submitter_name, submitter_email, atau baris jurnal_submission_authors
// yang dibaca untuk tampilan reviewer, jadi anonimitas ditegakkan di
// tingkat kueri, bukan dengan menyembunyikan kolom di tampilan.
// ─────────────────────────────────────────────────────────────────────────────

import { supabaseAdmin } from "@/lib/supabase/server";
import type { JurnalBerkasMeta } from "./wizard";
import type {
  JurnalReviewerOption
} from "./review";
import type {
  BerkasInternal,
  NaskahAnonimInternal,
  PenugasanInternal,
  PutaranInternal,
  ReviewBackend
} from "./review-internal";

async function ambilIdNaskah(kode: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from("jurnal_submissions")
    .select("id")
    .eq("tracking_code", kode.trim().toUpperCase())
    .maybeSingle();
  if (error) throw new Error(`Gagal membaca naskah jurnal: ${error.message}`);
  return data ? (data.id as string) : null;
}

interface BarisPutaran {
  id: string;
  round: number;
  status: string;
  decision: string | null;
  created_at: string;
  decided_at: string | null;
}

async function ambilBarisPutaran(
  submissionId: string
): Promise<BarisPutaran[]> {
  const { data, error } = await supabaseAdmin
    .from("jurnal_review_rounds")
    .select("id, round, status, decision, created_at, decided_at")
    .eq("submission_id", submissionId)
    .order("round", { ascending: true });
  if (error) throw new Error(`Gagal membaca putaran telaah: ${error.message}`);
  return (data ?? []) as unknown as BarisPutaran[];
}

interface BarisPenugasan {
  id: string;
  round_id: string;
  reviewer_user_id: string;
  status: string;
  date_assigned: string;
  date_due: string | null;
  date_completed: string | null;
  recommendation: string | null;
  comments_for_author: string | null;
  comments_for_editor: string | null;
  reminder_h7_at: string | null;
  reminder_h0_at: string | null;
  reminder_overdue_at: string | null;
}

async function lengkapiPenugasan(
  baris: BarisPenugasan[],
  petaPutaran: Map<string, { nomor: number; kode: string }>
): Promise<PenugasanInternal[]> {
  const userIds = [...new Set(baris.map((b) => b.reviewer_user_id))];
  const petaUser = new Map<string, { email: string; nama: string }>();
  if (userIds.length > 0) {
    const { data, error } = await supabaseAdmin
      .from("jurnal_users")
      .select("id, email, full_name")
      .in("id", userIds);
    if (error) throw new Error(`Gagal membaca pengguna jurnal: ${error.message}`);
    for (const u of data ?? []) {
      petaUser.set(u.id as string, {
        email: (u.email as string) ?? "",
        nama: (u.full_name as string) ?? ""
      });
    }
  }
  return baris.map((b) => {
    const info = petaPutaran.get(b.round_id);
    const user = petaUser.get(b.reviewer_user_id);
    return {
      id: b.id,
      kode: info?.kode ?? "",
      putaran: info?.nomor ?? 0,
      reviewerUserId: b.reviewer_user_id,
      reviewerEmail: user?.email ?? "",
      reviewerNama: user?.nama ?? "",
      status: b.status as PenugasanInternal["status"],
      ditugaskanPada: b.date_assigned,
      tenggat: b.date_due,
      rekomendasi:
        (b.recommendation as PenugasanInternal["rekomendasi"]) ?? null,
      komentarPenulis: b.comments_for_author,
      komentarEditor: b.comments_for_editor,
      diserahkanPada: b.date_completed,
      pengingatH7Pada: b.reminder_h7_at,
      pengingatH0Pada: b.reminder_h0_at,
      pengingatLewatPada: b.reminder_overdue_at
    };
  });
}

const KOLOM_PENUGASAN =
  "id, round_id, reviewer_user_id, status, date_assigned, date_due, date_completed, recommendation, comments_for_author, comments_for_editor, reminder_h7_at, reminder_h0_at, reminder_overdue_at";

export const reviewBackendSupabase: ReviewBackend = {
  async daftarPenugasanReviewer(reviewer) {
    let reviewerId = reviewer.userId;
    if (!reviewerId) {
      const { data: profil, error } = await supabaseAdmin
        .from("jurnal_users")
        .select("id")
        .eq("email", reviewer.email.toLowerCase())
        .maybeSingle();
      if (error) {
        throw new Error(`Gagal membaca pengguna jurnal: ${error.message}`);
      }
      reviewerId = (profil?.id as string) ?? null;
    }
    if (!reviewerId) return [];
    const { data, error } = await supabaseAdmin
      .from("jurnal_review_assignments")
      .select(`${KOLOM_PENUGASAN}, submission_id`)
      .eq("reviewer_user_id", reviewerId)
      .order("date_assigned", { ascending: false });
    if (error) {
      throw new Error(`Gagal membaca penugasan telaah: ${error.message}`);
    }
    const baris = (data ?? []) as unknown as (BarisPenugasan & {
      submission_id: string;
    })[];
    const hasil: PenugasanInternal[] = [];
    for (const b of baris) {
      const { data: naskah } = await supabaseAdmin
        .from("jurnal_submissions")
        .select("tracking_code")
        .eq("id", b.submission_id)
        .maybeSingle();
      const putaran = await ambilBarisPutaran(b.submission_id);
      const peta = new Map(
        putaran.map((p) => [
          p.id,
          { nomor: p.round, kode: (naskah?.tracking_code as string) ?? "" }
        ])
      );
      const [satu] = await lengkapiPenugasan([b], peta);
      if (satu) hasil.push(satu);
    }
    return hasil;
  },

  async daftarReviewer() {
    const { data: peran, error } = await supabaseAdmin
      .from("jurnal_user_roles")
      .select("user_id")
      .eq("role", "reviewer");
    if (error) throw new Error(`Gagal membaca peran reviewer: ${error.message}`);
    const ids = [...new Set((peran ?? []).map((p) => p.user_id as string))];
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
    return (users ?? []).map<JurnalReviewerOption>((u) => ({
      userId: u.id as string,
      email: (u.email as string) ?? "",
      nama: (u.full_name as string) ?? "",
      afiliasi: (u.affiliation as string) ?? ""
    }));
  },

  async ambilPutaran(kode) {
    const id = await ambilIdNaskah(kode);
    if (!id) return [];
    const baris = await ambilBarisPutaran(id);
    return baris.map<PutaranInternal>((b) => ({
      nomor: b.round,
      status: b.status === "closed" ? "closed" : "open",
      keputusan: (b.decision as PutaranInternal["keputusan"]) ?? null,
      dibuatPada: b.created_at,
      diputuskanPada: b.decided_at
    }));
  },

  async buatPutaran(kode, nomor) {
    const id = await ambilIdNaskah(kode);
    if (!id) throw new Error("Naskah tidak ditemukan.");
    const { error } = await supabaseAdmin.from("jurnal_review_rounds").insert({
      submission_id: id,
      round: nomor,
      status: "open"
    });
    if (error) throw new Error(`Gagal membuka putaran telaah: ${error.message}`);
    const { error: errKode } = await supabaseAdmin
      .from("jurnal_submissions")
      .update({ current_round: nomor })
      .eq("id", id);
    if (errKode) {
      throw new Error(`Gagal memperbarui putaran berjalan: ${errKode.message}`);
    }
  },

  async tutupPutaran(kode, nomor, keputusan) {
    const id = await ambilIdNaskah(kode);
    if (!id) throw new Error("Naskah tidak ditemukan.");
    const { error } = await supabaseAdmin
      .from("jurnal_review_rounds")
      .update({
        status: "closed",
        decision: keputusan,
        decided_at: new Date().toISOString()
      })
      .eq("submission_id", id)
      .eq("round", nomor);
    if (error) throw new Error(`Gagal menutup putaran telaah: ${error.message}`);
  },

  async ambilPenugasanSemua(kode) {
    const id = await ambilIdNaskah(kode);
    if (!id) return [];
    const putaran = await ambilBarisPutaran(id);
    const peta = new Map(
      putaran.map((p) => [p.id, { nomor: p.round, kode: kode.trim().toUpperCase() }])
    );
    if (putaran.length === 0) return [];
    const { data, error } = await supabaseAdmin
      .from("jurnal_review_assignments")
      .select(KOLOM_PENUGASAN)
      .eq("submission_id", id)
      .order("date_assigned", { ascending: true });
    if (error) throw new Error(`Gagal membaca penugasan telaah: ${error.message}`);
    return lengkapiPenugasan((data ?? []) as unknown as BarisPenugasan[], peta);
  },

  async daftarPenugasanAktifSemua() {
    const { data, error } = await supabaseAdmin
      .from("jurnal_review_assignments")
      .select(`${KOLOM_PENUGASAN}, submission_id`)
      .eq("status", "accepted")
      .not("date_due", "is", null)
      .order("date_due", { ascending: true });
    if (error) throw new Error(`Gagal membaca penugasan aktif: ${error.message}`);
    const baris = (data ?? []) as unknown as (BarisPenugasan & {
      submission_id: string;
    })[];
    if (baris.length === 0) return [];
    const submissionIds = [...new Set(baris.map((b) => b.submission_id))];
    const { data: naskahData, error: galatNaskah } = await supabaseAdmin
      .from("jurnal_submissions")
      .select("id, tracking_code")
      .in("id", submissionIds);
    if (galatNaskah) {
      throw new Error(`Gagal membaca naskah penugasan: ${galatNaskah.message}`);
    }
    const petaKode = new Map(
      (naskahData ?? []).map((n) => [n.id as string, n.tracking_code as string])
    );
    const peta = new Map<string, { nomor: number; kode: string }>();
    for (const sid of submissionIds) {
      const putaran = await ambilBarisPutaran(sid);
      for (const p of putaran) {
        peta.set(p.id, { nomor: p.round, kode: petaKode.get(sid) ?? "" });
      }
    }
    return lengkapiPenugasan(baris, peta);
  },

  async tandaiPengingat(idPenugasan, tahap, pada) {
    const kolom =
      tahap === "h7"
        ? "reminder_h7_at"
        : tahap === "h0"
          ? "reminder_h0_at"
          : "reminder_overdue_at";
    const { error } = await supabaseAdmin
      .from("jurnal_review_assignments")
      .update({ [kolom]: pada })
      .eq("id", idPenugasan);
    if (error) throw new Error(`Gagal menandai pengingat: ${error.message}`);
  },

  async ambilPenugasanById(idPenugasan) {
    const { data, error } = await supabaseAdmin
      .from("jurnal_review_assignments")
      .select(`${KOLOM_PENUGASAN}, submission_id`)
      .eq("id", idPenugasan)
      .maybeSingle();
    if (error) throw new Error(`Gagal membaca penugasan telaah: ${error.message}`);
    if (!data) return null;
    const submissionId = data.submission_id as string;
    const { data: naskah } = await supabaseAdmin
      .from("jurnal_submissions")
      .select("tracking_code")
      .eq("id", submissionId)
      .maybeSingle();
    const putaran = await ambilBarisPutaran(submissionId);
    const peta = new Map(
      putaran.map((p) => [
        p.id,
        { nomor: p.round, kode: (naskah?.tracking_code as string) ?? "" }
      ])
    );
    const [hasil] = await lengkapiPenugasan(
      [data as unknown as BarisPenugasan],
      peta
    );
    return hasil ?? null;
  },

  async buatPenugasan({ kode, putaran, reviewer, tenggat, ditugaskanOleh }) {
    const id = await ambilIdNaskah(kode);
    if (!id) throw new Error("Naskah tidak ditemukan.");
    const barisPutaran = await ambilBarisPutaran(id);
    const target = barisPutaran.find((p) => p.round === putaran);
    if (!target) throw new Error("Putaran telaah tidak ditemukan.");

    let reviewerId = reviewer.userId;
    if (!reviewerId) {
      const { data: profil, error } = await supabaseAdmin
        .from("jurnal_users")
        .select("id")
        .eq("email", reviewer.email.toLowerCase())
        .maybeSingle();
      if (error) throw new Error(`Gagal membaca pengguna jurnal: ${error.message}`);
      reviewerId = (profil?.id as string) ?? null;
    }
    if (!reviewerId) {
      throw new Error("Akun reviewer tidak ditemukan di jurnal_users.");
    }

    const { data, error } = await supabaseAdmin
      .from("jurnal_review_assignments")
      .insert({
        submission_id: id,
        round_id: target.id,
        reviewer_user_id: reviewerId,
        assigned_by: ditugaskanOleh,
        status: "invited",
        date_due: tenggat
      })
      .select(KOLOM_PENUGASAN)
      .single();
    if (error) {
      if (error.code === "23505") {
        throw new Error("Reviewer ini sudah ditugaskan pada putaran yang sama.");
      }
      throw new Error(`Gagal membuat penugasan telaah: ${error.message}`);
    }
    const peta = new Map([
      [target.id, { nomor: putaran, kode: kode.trim().toUpperCase() }]
    ]);
    const [hasil] = await lengkapiPenugasan(
      [data as unknown as BarisPenugasan],
      peta
    );
    return hasil;
  },

  async ubahPenugasan(idPenugasan, patch) {
    const pembaruan: Record<string, unknown> = {};
    if (patch.status !== undefined) pembaruan.status = patch.status;
    if (patch.rekomendasi !== undefined) {
      pembaruan.recommendation = patch.rekomendasi;
    }
    if (patch.komentarPenulis !== undefined) {
      pembaruan.comments_for_author = patch.komentarPenulis;
    }
    if (patch.komentarEditor !== undefined) {
      pembaruan.comments_for_editor = patch.komentarEditor;
    }
    if (patch.diserahkanPada !== undefined) {
      pembaruan.date_completed = patch.diserahkanPada;
    }
    if (patch.status === "accepted") {
      pembaruan.date_confirmed = new Date().toISOString();
    }
    const { error } = await supabaseAdmin
      .from("jurnal_review_assignments")
      .update(pembaruan)
      .eq("id", idPenugasan);
    if (error) throw new Error(`Gagal mengubah penugasan telaah: ${error.message}`);
  },

  async ambilNaskahAnonim(kode) {
    // Kueri ini SENGAJA hanya memilih kolom aman. Kolom identitas
    // pengirim dan tabel penulis tidak dibaca sama sekali.
    const { data, error } = await supabaseAdmin
      .from("jurnal_submissions")
      .select(
        "tracking_code, title_id, abstract_id, abstract_en, keywords, section_id, language, date_submitted"
      )
      .eq("tracking_code", kode.trim().toUpperCase())
      .maybeSingle();
    if (error) throw new Error(`Gagal membaca naskah jurnal: ${error.message}`);
    if (!data) return null;
    let slugBagian: string | null = null;
    if (data.section_id) {
      const { data: bagian } = await supabaseAdmin
        .from("jurnal_sections")
        .select("slug")
        .eq("id", data.section_id as string)
        .maybeSingle();
      slugBagian = (bagian?.slug as string) ?? null;
    }
    const anonim: NaskahAnonimInternal = {
      kode: data.tracking_code as string,
      judul: data.title_id as string,
      abstrak: (data.abstract_id as string) ?? "",
      abstrakEn: (data.abstract_en as string) ?? "",
      kataKunci: (data.keywords as string[]) ?? [],
      bagianSlug: slugBagian,
      bahasa: (data.language as string) ?? "id",
      dibuatPada: data.date_submitted as string
    };
    return anonim;
  },

  async ambilBerkasInternal(kode) {
    const id = await ambilIdNaskah(kode);
    if (!id) return [];
    const { data, error } = await supabaseAdmin
      .from("jurnal_submission_files")
      .select(
        "id, stage, kind, original_name, mime_type, size_bytes, r2_bucket, r2_key, round, created_at"
      )
      .eq("submission_id", id)
      .order("created_at", { ascending: true });
    if (error) throw new Error(`Gagal membaca berkas jurnal: ${error.message}`);
    return (data ?? []).map<BerkasInternal>((b) => ({
      id: b.id as string,
      tahap: b.stage as string,
      kategori:
        b.stage === "supplementary" || b.kind === "supplementary"
          ? "pendukung"
          : "utama",
      namaAsli: b.original_name as string,
      mime: (b.mime_type as string) ?? "",
      ukuran: (b.size_bytes as number) ?? 0,
      bucket: b.r2_bucket as string,
      kunci: b.r2_key as string,
      putaran: (b.round as number) ?? null,
      diunggahPada: b.created_at as string
    }));
  },

  async simpanBerkasRevisi(kode, putaran, berkas) {
    const id = await ambilIdNaskah(kode);
    if (!id) throw new Error("Naskah tidak ditemukan.");
    const baris = berkas.map((b) => ({
      submission_id: id,
      stage: "review",
      kind: b.kategori === "utama" ? "manuscript" : "supplementary",
      original_name: b.namaAsli,
      mime_type: b.mime,
      size_bytes: b.ukuran,
      r2_bucket: b.bucket,
      r2_key: b.kunci,
      round: putaran
    }));
    const { error } = await supabaseAdmin
      .from("jurnal_submission_files")
      .insert(baris);
    if (error) {
      throw new Error(`Gagal menyimpan metadata berkas revisi: ${error.message}`);
    }
  }
};

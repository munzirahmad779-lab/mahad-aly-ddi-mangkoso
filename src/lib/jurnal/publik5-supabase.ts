// ─────────────────────────────────────────────────────────────────────────────
// Backend Tahap 5 MODE SUPABASE — SERVER ONLY.
//
// Pengumuman membaca dan menulis jurnal_announcements (migrasi 004),
// DOI dan penarikan memakai kolom jurnal_submissions (004 dan 008),
// metrik membaca jurnal_article_daily_metrics, dan pencarian memakai
// ilike dengan pelarian \, %, _ sesuai KEAMANAN-OJS-VERSI-KITA.md.
// Semua akses lewat service role dari route yang sudah lolos gerbang
// peran; RLS tabel tidak memberi policy tulis langsung.
// ─────────────────────────────────────────────────────────────────────────────

import { supabaseAdmin } from "@/lib/supabase/server";
import {
  larikanPolaIlike,
  type MetrikMentah,
  type PengumumanInternal,
  type Publik5Backend
} from "./publik5-internal";

function pengumumanKeInternal(
  b: Record<string, unknown>
): PengumumanInternal {
  return {
    id: b.id as string,
    judul: (b.title_id as string) ?? "",
    isi: (b.body_id as string) ?? "",
    tayang: (b.is_published as boolean) ?? false,
    diterbitkanPada: (b.published_at as string) ?? null,
    kedaluwarsaPada: (b.expires_at as string) ?? null,
    dibuatPada: (b.created_at as string) ?? ""
  };
}

export const publik5BackendSupabase: Publik5Backend = {
  async daftarPengumumanSemua() {
    const { data, error } = await supabaseAdmin
      .from("jurnal_announcements")
      .select(
        "id, title_id, body_id, is_published, published_at, expires_at, created_at"
      )
      .order("created_at", { ascending: false });
    if (error) {
      throw new Error(`Gagal membaca pengumuman: ${error.message}`);
    }
    return ((data ?? []) as Record<string, unknown>[]).map(
      pengumumanKeInternal
    );
  },

  async buatPengumuman(input) {
    const { data, error } = await supabaseAdmin
      .from("jurnal_announcements")
      .insert({
        title_id: input.judul,
        body_id: input.isi,
        is_published: input.tayang,
        published_at: input.tayang ? new Date().toISOString() : null,
        expires_at: input.kedaluwarsaPada
      })
      .select(
        "id, title_id, body_id, is_published, published_at, expires_at, created_at"
      )
      .single();
    if (error) {
      throw new Error(`Gagal membuat pengumuman: ${error.message}`);
    }
    return pengumumanKeInternal(data as Record<string, unknown>);
  },

  async ubahPengumuman(id, patch) {
    const kolom: Record<string, unknown> = {};
    if (patch.judul !== undefined) kolom.title_id = patch.judul;
    if (patch.isi !== undefined) kolom.body_id = patch.isi;
    if (patch.tayang !== undefined) {
      kolom.is_published = patch.tayang;
      kolom.published_at = patch.tayang ? new Date().toISOString() : null;
    }
    if (patch.kedaluwarsaPada !== undefined) {
      kolom.expires_at = patch.kedaluwarsaPada;
    }
    const { error } = await supabaseAdmin
      .from("jurnal_announcements")
      .update(kolom)
      .eq("id", id);
    if (error) {
      throw new Error(`Gagal mengubah pengumuman: ${error.message}`);
    }
  },

  async hapusPengumuman(id) {
    const { error } = await supabaseAdmin
      .from("jurnal_announcements")
      .delete()
      .eq("id", id);
    if (error) {
      throw new Error(`Gagal menghapus pengumuman: ${error.message}`);
    }
  },

  async tetapkanDoi(kode, doi) {
    const { data, error } = await supabaseAdmin
      .from("jurnal_submissions")
      .update({ doi })
      .eq("tracking_code", kode.trim().toUpperCase())
      .select("id");
    if (error) throw new Error(`Gagal menetapkan DOI: ${error.message}`);
    return (data ?? []).length > 0;
  },

  async tarikArtikel(kode, alasan) {
    const { data, error } = await supabaseAdmin
      .from("jurnal_submissions")
      .update({
        withdrawn_at: new Date().toISOString(),
        withdrawal_reason: alasan
      })
      .eq("tracking_code", kode.trim().toUpperCase())
      .is("withdrawn_at", null)
      .select("id");
    if (error) throw new Error(`Gagal menarik artikel: ${error.message}`);
    return (data ?? []).length > 0;
  },

  async daftarTombstone() {
    const { data, error } = await supabaseAdmin
      .from("jurnal_submissions")
      .select(
        "tracking_code, title_id, withdrawn_at, withdrawal_reason, section_id"
      )
      .not("withdrawn_at", "is", null);
    if (error) {
      throw new Error(`Gagal membaca penarikan: ${error.message}`);
    }
    const baris = (data ?? []) as Record<string, unknown>[];
    const hasil = [];
    for (const b of baris) {
      let bagianSlug: string | null = null;
      if (b.section_id) {
        const { data: bagian } = await supabaseAdmin
          .from("jurnal_sections")
          .select("slug")
          .eq("id", b.section_id as string)
          .maybeSingle();
        bagianSlug = (bagian?.slug as string) ?? null;
      }
      hasil.push({
        kode: b.tracking_code as string,
        judul: (b.title_id as string) ?? "",
        bagianSlug,
        ditarikPada: b.withdrawn_at as string,
        alasanTarik: (b.withdrawal_reason as string) ?? null
      });
    }
    return hasil;
  },

  async ambilMetrikMentah(): Promise<MetrikMentah[]> {
    const { data, error } = await supabaseAdmin
      .from("jurnal_article_daily_metrics")
      .select("submission_id, metric_date, views, downloads");
    if (error) throw new Error(`Gagal membaca metrik: ${error.message}`);
    const perKode = new Map<string, MetrikMentah["perHari"]>();
    const idKeKode = new Map<string, string>();
    const baris = (data ?? []) as Record<string, unknown>[];
    if (baris.length > 0) {
      const { data: naskah } = await supabaseAdmin
        .from("jurnal_submissions")
        .select("id, tracking_code");
      for (const n of (naskah ?? []) as Record<string, unknown>[]) {
        idKeKode.set(n.id as string, n.tracking_code as string);
      }
    }
    for (const b of baris) {
      const kode = idKeKode.get(b.submission_id as string);
      if (!kode) continue;
      const perHari = perKode.get(kode) ?? {};
      perHari[b.metric_date as string] = {
        views: (b.views as number) ?? 0,
        downloads: (b.downloads as number) ?? 0
      };
      perKode.set(kode, perHari);
    }
    return [...perKode.entries()].map(([kode, perHari]) => ({
      kode,
      perHari
    }));
  },

  async cariKodeIlike(q) {
    const pola = `%${larikanPolaIlike(q.trim())}%`;
    const hasil = new Set<string>();
    const { data: naskah, error } = await supabaseAdmin
      .from("jurnal_submissions")
      .select("tracking_code")
      .eq("status", "published")
      .is("withdrawn_at", null)
      .or(
        `title_id.ilike.${pola},abstract_id.ilike.${pola},title_en.ilike.${pola},abstract_en.ilike.${pola}`
      );
    if (error) throw new Error(`Pencarian gagal: ${error.message}`);
    for (const b of (naskah ?? []) as Record<string, unknown>[]) {
      hasil.add(b.tracking_code as string);
    }
    // Kata kunci tersimpan sebagai array teks; cocokkan per elemen
    // lewat operator contains pada representasi teks tidak tersedia di
    // PostgREST secara aman, jadi kata kunci dicari di klien fasad dari
    // daftar publik. Nama penulis dicari di tabel penulisnya.
    const { data: penulis } = await supabaseAdmin
      .from("jurnal_submission_authors")
      .select("submission_id, given_name, family_name")
      .or(`given_name.ilike.${pola},family_name.ilike.${pola}`);
    const idPenulis = [
      ...new Set(
        ((penulis ?? []) as Record<string, unknown>[]).map(
          (p) => p.submission_id as string
        )
      )
    ];
    if (idPenulis.length > 0) {
      const { data: pemilik } = await supabaseAdmin
        .from("jurnal_submissions")
        .select("tracking_code")
        .eq("status", "published")
        .is("withdrawn_at", null)
        .in("id", idPenulis);
      for (const b of (pemilik ?? []) as Record<string, unknown>[]) {
        hasil.add(b.tracking_code as string);
      }
    }
    return hasil;
  }
};

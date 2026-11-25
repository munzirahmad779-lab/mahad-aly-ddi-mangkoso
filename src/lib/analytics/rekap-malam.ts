import { supabaseAdmin } from "@/lib/supabase/server";
import {
  EMPTY_TRAFFIC_AGGREGATES,
  mergeTrafficStats,
  normalizeTrafficAggregates,
  type TrafficAggregates
} from "@/lib/analytics/traffic-merge";

// Rekap bacaan malam: otomatisasi DI DALAM situs (perintah user
// 26 Nov 2026: web harus mengotomatisasi sendiri, bukan pekerjaan
// luar). Sekali tiap tengah malam, rute internal
// /api/analytics/internal/rekap-malam memanggil fungsi ini untuk:
//   1. Menghitung total baca tiap artikel dari peta kunjungan gabungan
//      (blob beku global_traffic_stats + agregat traffic_daily, persis
//      cara rute /api/analytics/stats membacanya).
//   2. Menyimpan potret harian ke site_content 'daily_read_counts':
//      berapa kali tiap artikel dibaca pada hari WITA yang baru
//      berakhir (selisih total terhadap potret malam sebelumnya) dan
//      totalnya. Potret inilah yang ditampilkan panel "Bacaan ..." di
//      beranda (komponen BacaanHariIni).
//   3. Menyelaraskan kolom articles.views ke total gabungan yang sama,
//      supaya angka di basis data tidak menyimpang dari yang tampil.
//
// Idempoten: bila potret tersimpan sudah bertanggal hari yang baru
// berakhir, fungsi berhenti tanpa menulis apa pun, jadi panggilan
// ganda pada malam yang sama aman.

export interface ItemRekapMalam {
  slug: string;
  judul: string;
  hariIni: number;
  total: number;
}

interface PotretBacaanTersimpan {
  date?: string;
  baseline?: boolean;
  items?: Array<{ slug?: unknown; total?: unknown }>;
}

export interface HasilRekapMalam {
  ok: true;
  dilewati?: boolean;
  tanggal?: string;
  jumlahArtikel?: number;
  totalHariIni?: number;
}

export async function jalankanRekapMalam(): Promise<HasilRekapMalam> {
  // Tanggal WITA yang baru berakhir: satu menit sebelum saat ini,
  // supaya panggilan tepat pukul 00:00 WITA tetap membaca hari yang
  // selesai, bukan hari yang baru mulai.
  const acuan = new Date(Date.now() - 60_000);
  const tanggal = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Makassar"
  }).format(acuan);
  const tanggalLabel = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Makassar",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(acuan);

  // Peta kunjungan gabungan, dimuat persis seperti rute stats.
  const { data: record, error: blobError } = await supabaseAdmin
    .from("site_content")
    .select("value")
    .eq("key", "global_traffic_stats")
    .maybeSingle();
  if (blobError) {
    throw new Error(`Gagal membaca arsip trafik: ${blobError.message}`);
  }

  let aggregates: TrafficAggregates = EMPTY_TRAFFIC_AGGREGATES;
  const { data: aggData, error: aggError } = await supabaseAdmin.rpc(
    "get_traffic_aggregates"
  );
  if (aggError) {
    throw new Error(`Gagal membaca agregat trafik: ${aggError.message}`);
  }
  aggregates = normalizeTrafficAggregates(aggData);

  const gabungan = mergeTrafficStats(record?.value ?? null, aggregates);
  const pages = gabungan.pages;

  // Artikel terbit beserta kolom views yang sekarang tercatat.
  const { data: artikelData, error: artikelError } = await supabaseAdmin
    .from("articles")
    .select("slug, title, views")
    .eq("status", "published");
  if (artikelError) {
    throw new Error(`Gagal membaca artikel: ${artikelError.message}`);
  }
  const artikel = artikelData ?? [];

  // Potret malam sebelumnya (boleh belum ada pada jalan pertama).
  const { data: potretRecord, error: potretError } = await supabaseAdmin
    .from("site_content")
    .select("value")
    .eq("key", "daily_read_counts")
    .maybeSingle();
  if (potretError) {
    throw new Error(`Gagal membaca potret bacaan: ${potretError.message}`);
  }
  const potretLama = (potretRecord?.value ?? null) as PotretBacaanTersimpan | null;

  // Idempoten: tanggal yang sama sudah pernah direkap malam ini.
  // Potret baseline TIDAK menghalangi: baseline adalah titik awal yang
  // boleh ditimpa jalan sungguhan pada tanggal yang sama, supaya malam
  // pertama sesudah pemasangan tetap menghasilkan rekap (selisih
  // dihitung terhadap total baseline).
  if (potretLama && potretLama.date === tanggal && !potretLama.baseline) {
    return { ok: true, dilewati: true };
  }

  const totalLama = new Map<string, number>();
  if (potretLama && Array.isArray(potretLama.items)) {
    for (const item of potretLama.items) {
      if (item && typeof item.slug === "string" && typeof item.total === "number") {
        totalLama.set(item.slug, item.total);
      }
    }
  }

  const items: ItemRekapMalam[] = artikel.map((a) => {
    const total = pages[`/artikel/${a.slug}`] || 0;
    const hariIni = potretLama
      ? Math.max(0, total - (totalLama.get(a.slug) ?? total))
      : 0;
    return { slug: a.slug, judul: a.title, hariIni, total };
  });
  items.sort((x, y) => y.hariIni - x.hariIni || y.total - x.total);

  // Simpan potret baru; jalan pertama ditandai baseline (hariIni semua
  // nol karena belum ada pembanding) dan panel beranda tidak
  // menampilkannya sebagai bacaan harian.
  const { error: tulisError } = await supabaseAdmin.from("site_content").upsert(
    {
      key: "daily_read_counts",
      value: {
        date: tanggal,
        tanggalLabel,
        updatedAt: new Date().toISOString(),
        baseline: !potretLama,
        items
      },
      updated_at: new Date().toISOString()
    },
    { onConflict: "key" }
  );
  if (tulisError) {
    throw new Error(`Gagal menyimpan potret bacaan: ${tulisError.message}`);
  }

  // Selaraskan kolom views ke total gabungan, per potongan 10 supaya
  // tidak membanjiri basis data dalam satu gelombang.
  const viewsSekarang = new Map<string, number>(
    artikel.map((a) => [a.slug, typeof a.views === "number" ? a.views : 0])
  );
  const perluSelaras = items.filter((it) => viewsSekarang.get(it.slug) !== it.total);
  for (let i = 0; i < perluSelaras.length; i += 10) {
    const potongan = perluSelaras.slice(i, i + 10);
    const hasil = await Promise.all(
      potongan.map((it) =>
        supabaseAdmin.from("articles").update({ views: it.total }).eq("slug", it.slug)
      )
    );
    const gagal = hasil.find((h) => h.error);
    if (gagal?.error) {
      throw new Error(`Gagal menyelaraskan kolom views: ${gagal.error.message}`);
    }
  }

  const totalHariIni = items.reduce((jumlah, it) => jumlah + it.hariIni, 0);
  return { ok: true, tanggal, jumlahArtikel: items.length, totalHariIni };
}

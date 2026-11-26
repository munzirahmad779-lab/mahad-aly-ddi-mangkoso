import { supabaseAdmin } from "@/lib/supabase/server";
import {
  EMPTY_TRAFFIC_AGGREGATES,
  mergeTrafficStats,
  normalizeTrafficAggregates,
  type TrafficAggregates
} from "@/lib/analytics/traffic-merge";
import { sendRawEmail } from "@/lib/email/service";
import { SUPER_ADMIN_EMAIL } from "@/lib/admin-constants";

// Rekap email pagi: otomatisasi DI DALAM situs (perintah user
// 27 Nov 2026: web dibuat bagus dan cerdas, jangan sampai harus
// diperbaiki manual setiap saat). Menggantikan skrip luar
// ~/workspace/rekap-bacaan/rekap.py yang berjalan dari VM Muse dan
// berulang kali gagal hanya karena jalur jaringan VM goyah.
//
// Sekali tiap pukul 06:00 WITA, Worker cron yang sama dengan rekap
// malam memanggil rute internal /api/analytics/internal/rekap-email,
// yang menjalankan fungsi ini untuk:
//   1. Menyusun rekap yang sama persis isinya dengan rekap lama:
//      jumlah dibaca kemarin (dari traffic_daily) dan total
//      keseluruhan (peta kunjungan gabungan) untuk artikel dan
//      berita, sepuluh terbanyak menurut total.
//   2. Mengirimnya ke email super admin lewat layanan email situs
//      sendiri (Resend, pengirim redaksi@ situs).
//   3. Mencatat penanda terkirim di site_content
//      'rekap_email_terakhir' supaya panggilan ganda pada hari yang
//      sama tidak mengirim email kedua (idempoten).
//
// Mode uji (uji: true) hanya menyusun dan mengembalikan isinya tanpa
// mengirim dan tanpa menulis penanda, untuk verifikasi sesudah pasang.

interface BarisRekap {
  judul: string;
  jenis: string;
  kemarin: number;
  total: number;
}

export interface HasilRekapEmail {
  ok: true;
  uji?: boolean;
  dilewati?: boolean;
  tanggal?: string;
  totalKemarin?: number;
  totalSemua?: number;
  jumlahDaftar?: number;
  subjek?: string;
  teks?: string;
  idEmail?: string;
}

function tanggalWita(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Makassar"
  }).format(d);
}

function labelWita(d: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Makassar",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(d);
}

function geserHari(tanggal: string, hari: number): string {
  const d = new Date(`${tanggal}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + hari);
  return d.toISOString().slice(0, 10);
}

function lolosHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function susunRekap(): Promise<{
  subjek: string;
  teks: string;
  html: string;
  totalKemarin: number;
  totalSemua: number;
  daftar: BarisRekap[];
  labelHariIni: string;
  labelKemarin: string;
}> {
  const kini = new Date();
  const hariIni = tanggalWita(kini);
  const kemarin = geserHari(hariIni, -1);
  const labelHariIni = labelWita(kini);
  const labelKemarin = labelWita(new Date(`${kemarin}T12:00:00+08:00`));

  // Total keseluruhan per jalur dari peta kunjungan gabungan, dibaca
  // persis seperti rute /api/analytics/stats dan rekap malam.
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
  const pages = mergeTrafficStats(record?.value ?? null, aggregates).pages;

  // Kemarin per jalur dari traffic_daily (ember tanggal tabel berjalan
  // 08.00 WITA sampai 08.00 WITA keesokan harinya, sama seperti yang
  // dipakai rekap lama, jadi pada kiriman 06.00 ember kemarin sudah
  // memuat hampir sehari penuh).
  const { data: harian, error: harianError } = await supabaseAdmin
    .from("traffic_daily")
    .select("pathname, views")
    .eq("date", kemarin)
    .limit(2000);
  if (harianError) {
    throw new Error(`Gagal membaca trafik harian: ${harianError.message}`);
  }
  const petaKemarin = new Map<string, number>();
  for (const b of harian ?? []) {
    if (
      typeof b.pathname === "string" &&
      (b.pathname.startsWith("/artikel/") || b.pathname.startsWith("/berita/")) &&
      typeof b.views === "number"
    ) {
      petaKemarin.set(b.pathname, (petaKemarin.get(b.pathname) ?? 0) + b.views);
    }
  }

  // Judul tulisan dari kedua tabel.
  const judul = new Map<string, { nama: string; jenis: string }>();
  const { data: artikel, error: artikelError } = await supabaseAdmin
    .from("articles")
    .select("slug, title")
    .limit(300);
  if (artikelError) {
    throw new Error(`Gagal membaca artikel: ${artikelError.message}`);
  }
  for (const a of artikel ?? []) {
    judul.set(`/artikel/${a.slug}`, { nama: a.title, jenis: "Artikel" });
  }
  const { data: berita, error: beritaError } = await supabaseAdmin
    .from("news")
    .select("slug, judul")
    .limit(100);
  if (beritaError) {
    throw new Error(`Gagal membaca berita: ${beritaError.message}`);
  }
  for (const n of berita ?? []) {
    judul.set(`/berita/${n.slug}`, { nama: n.judul, jenis: "Berita" });
  }

  const semua: BarisRekap[] = [];
  for (const [path, totalMentah] of Object.entries(pages)) {
    if (!path.startsWith("/artikel/") && !path.startsWith("/berita/")) continue;
    const total = typeof totalMentah === "number" ? totalMentah : 0;
    if (total <= 0) continue;
    const info = judul.get(path);
    semua.push({
      judul: info?.nama ?? path,
      jenis: info?.jenis ?? "Tulisan",
      kemarin: petaKemarin.get(path) ?? 0,
      total
    });
  }
  semua.sort(
    (x, y) =>
      y.total - x.total ||
      y.kemarin - x.kemarin ||
      x.judul.toLowerCase().localeCompare(y.judul.toLowerCase())
  );
  const totalKemarin = semua.reduce((j, d) => j + d.kemarin, 0);
  const totalSemua = semua.reduce((j, d) => j + d.total, 0);
  const daftar = semua.slice(0, 10);

  const garis: string[] = [
    "Rekap jumlah baca tulisan web Ma'had Aly DDI Mangkoso",
    `Dibaca kemarin (${labelKemarin}): ${totalKemarin} kali`,
    `Total keseluruhan sampai ${labelHariIni} pagi: ${totalSemua} kali`,
    "",
    "Sepuluh tulisan terbanyak dibaca (kemarin | total):",
    ...daftar.map(
      (d, i) => `${i + 1}. ${d.judul} (${d.jenis}): kemarin ${d.kemarin}, total ${d.total}`
    ),
    "",
    "Rekap otomatis dari web mahadaly-ddimangkoso.ac.id, dikirim tiap pagi pukul 06.00 WITA."
  ];
  const teks = garis.join("\n");
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.7; color: #1e293b; max-width: 640px; margin: 0 auto;">
      <h2 style="font-family: Georgia, serif; color: #064e3b; margin-bottom: 4px;">Rekap jumlah baca tulisan web Ma'had Aly DDI Mangkoso</h2>
      <p style="margin: 2px 0;">Dibaca kemarin (${lolosHtml(labelKemarin)}): <strong>${totalKemarin} kali</strong></p>
      <p style="margin: 2px 0;">Total keseluruhan sampai ${lolosHtml(labelHariIni)} pagi: <strong>${totalSemua} kali</strong></p>
      <h3 style="color: #064e3b; margin: 18px 0 6px;">Sepuluh tulisan terbanyak dibaca (kemarin | total):</h3>
      <ol style="margin: 0; padding-left: 20px;">
        ${daftar
          .map(
            (d) =>
              `<li style="margin: 4px 0;">${lolosHtml(d.judul)} (${d.jenis}): kemarin ${d.kemarin}, total ${d.total}</li>`
          )
          .join("\n")}
      </ol>
      <p style="font-size: 12px; color: #64748b; margin-top: 18px;">Rekap otomatis dari web mahadaly-ddimangkoso.ac.id, dikirim tiap pagi pukul 06.00 WITA.</p>
    </div>`;
  const subjek = `Rekap jumlah baca tulisan: ${labelHariIni}`;
  return { subjek, teks, html, totalKemarin, totalSemua, daftar, labelHariIni, labelKemarin };
}

export async function jalankanRekapEmail(uji: boolean): Promise<HasilRekapEmail> {
  const hariIni = tanggalWita(new Date());

  if (!uji) {
    const { data: penanda, error: penandaError } = await supabaseAdmin
      .from("site_content")
      .select("value")
      .eq("key", "rekap_email_terakhir")
      .maybeSingle();
    if (penandaError) {
      throw new Error(`Gagal membaca penanda rekap email: ${penandaError.message}`);
    }
    const nilai = (penanda?.value ?? null) as { date?: string } | null;
    if (nilai && nilai.date === hariIni) {
      return { ok: true, dilewati: true, tanggal: hariIni };
    }
  }

  const rekap = await susunRekap();

  if (uji) {
    return {
      ok: true,
      uji: true,
      tanggal: hariIni,
      totalKemarin: rekap.totalKemarin,
      totalSemua: rekap.totalSemua,
      jumlahDaftar: rekap.daftar.length,
      subjek: rekap.subjek,
      teks: rekap.teks
    };
  }

  const hasil = await sendRawEmail({
    to: SUPER_ADMIN_EMAIL,
    subject: rekap.subjek,
    html: rekap.html
  });
  if (!hasil.success) {
    throw new Error(`Gagal mengirim rekap email: ${hasil.error ?? "kesalahan tidak dikenal"}`);
  }
  const idEmail =
    (hasil.data as { data?: { id?: string } } | undefined)?.data?.id ??
    (hasil.data as { id?: string } | undefined)?.id;

  const { error: tulisError } = await supabaseAdmin.from("site_content").upsert(
    {
      key: "rekap_email_terakhir",
      // group_name dan label WAJIB ikut: keduanya NOT NULL tanpa nilai
      // bawaan di site_content (pelajaran pemasangan rekap malam).
      group_name: "analytics",
      label: "Penanda Rekap Email Harian",
      value: {
        date: hariIni,
        sentAt: new Date().toISOString(),
        idEmail: idEmail ?? null,
        totalKemarin: rekap.totalKemarin,
        totalSemua: rekap.totalSemua
      },
      updated_at: new Date().toISOString()
    },
    { onConflict: "key" }
  );
  if (tulisError) {
    // Email sudah terkirim; kegagalan menulis penanda hanya berarti
    // panggilan ulang di hari yang sama bisa mengirim lagi. Catat di
    // log server, jangan gagalkan jalan yang sudah berhasil.
    console.error("Gagal menulis penanda rekap email:", tulisError.message);
  }

  return {
    ok: true,
    tanggal: hariIni,
    totalKemarin: rekap.totalKemarin,
    totalSemua: rekap.totalSemua,
    jumlahDaftar: rekap.daftar.length,
    idEmail
  };
}

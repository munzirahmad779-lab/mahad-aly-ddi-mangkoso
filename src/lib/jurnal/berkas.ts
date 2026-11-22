// ─────────────────────────────────────────────────────────────────────────────
// Penyimpanan berkas naskah jurnal — SERVER ONLY.
//
// Keputusan user (22 Nov 2026): isi berkas TIDAK disimpan di basis data
// dan TIDAK di disk aplikasi. Jalur utama: route server menerbitkan URL
// unggah bertanda tangan (presigned PUT) ke penyimpanan S3-compatible
// (Cloudflare R2) milik kampus; klien mengunggah langsung ke R2; yang
// disimpan ke jurnal_submission_files hanya metadata dan kunci objek.
//
// Konfigurasi lewat env (nama khusus jurnal didahulukan, lalu env R2
// repo yang sudah ada sebagai cadangan):
//   JURNAL_R2_ENDPOINT        atau R2_ENDPOINT
//   JURNAL_R2_BUCKET          atau R2_BUCKET_NAME
//   JURNAL_R2_ACCESS_KEY_ID   atau R2_ACCESS_KEY_ID
//   JURNAL_R2_SECRET_ACCESS_KEY atau R2_SECRET_ACCESS_KEY
//
// Bila env tidak lengkap, mode cadangan UJI LOKAL aktif: berkas disimpan
// ke folder scratch klon .jurnal-uji/uploads/ (jelas berlabel uji, tidak
// ikut build produksi) dengan peringatan di log server, supaya seluruh
// alur wizard tetap bisa diuji ujung ke ujung.
// ─────────────────────────────────────────────────────────────────────────────

import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  ekstensiBerkas,
  mimeKanonisBerkas,
  validasiBerkasMeta,
  type JurnalBerkasKategori,
  type JurnalBerkasMeta
} from "./wizard";
import { BATAS_TEKS } from "./keamanan";

export const BUCKET_LOKAL_UJI = "lokal-uji";
const URL_KEDALUWARSA_DETIK = 10 * 60; // 10 menit: satu objek, satu PUT

interface KonfigurasiR2 {
  endpoint: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export function konfigurasiR2(): KonfigurasiR2 | null {
  const endpoint = (
    process.env.JURNAL_R2_ENDPOINT ||
    process.env.R2_ENDPOINT ||
    ""
  ).trim();
  const bucket = (
    process.env.JURNAL_R2_BUCKET ||
    process.env.R2_BUCKET_NAME ||
    ""
  ).trim();
  const accessKeyId = (
    process.env.JURNAL_R2_ACCESS_KEY_ID ||
    process.env.R2_ACCESS_KEY_ID ||
    ""
  ).trim();
  const secretAccessKey = (
    process.env.JURNAL_R2_SECRET_ACCESS_KEY ||
    process.env.R2_SECRET_ACCESS_KEY ||
    ""
  ).trim();
  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) return null;
  return { endpoint, bucket, accessKeyId, secretAccessKey };
}

export function isR2JurnalConfigured(): boolean {
  return konfigurasiR2() !== null;
}

export function namaAmanBerkas(nama: string): string {
  const dasar = nama.split(/[\\/]/).pop() ?? "berkas";
  const bersih = dasar
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
  return bersih || "berkas";
}

// Kunci objek dibuat server sebelum naskah punya kode lacak: memakai id
// batch unggahan dari klien untuk mengelompokkan berkas satu pengiriman.
// Nama berkasnya sendiri TIDAK ikut ke kunci (Tahap Keamanan): segmen
// terakhir murni UUID acak plus ekstensi yang sudah divalidasi, jadi
// tidak ada satu pun potongan jalur yang dikendalikan pengguna dan tidak
// ada berkas yang bisa ditimpa dengan menebak kunci. Nama asli berkas
// tetap tercatat sebagai metadata.
export function buatKunciObjek(
  batchId: string,
  kategori: JurnalBerkasKategori,
  namaAsli: string
): string {
  const batch = namaAmanBerkas(batchId).replace(/[^a-zA-Z0-9-]+/g, "");
  return `jurnal/naskah/${batch}/${kategori}/${randomUUID()}${ekstensiBerkas(namaAsli)}`;
}

export interface HasilTandaTangan {
  mode: "r2";
  uploadUrl: string;
  bucket: string;
  kunci: string;
  kedaluwarsaDetik: number;
}

// Menerbitkan URL unggah bertanda tangan untuk satu berkas. Validasi
// jenis dan ukuran ditegakkan di sini (server), bukan hanya di klien.
export async function tandaTanganiUnggahan(input: {
  batchId: string;
  kategori: JurnalBerkasKategori;
  namaAsli: string;
  mime: string;
  ukuran: number;
}): Promise< HasilTandaTangan> {
  const galat = validasiBerkasMeta(input);
  if (galat) throw new Error(galat);
  const cfg = konfigurasiR2();
  if (!cfg) {
    throw new Error(
      "Penyimpanan R2 belum terkonfigurasi di server; unggahan langsung tidak tersedia."
    );
  }
  const kunci = buatKunciObjek(input.batchId, input.kategori, input.namaAsli);
  const klien = new S3Client({
    region: "auto",
    endpoint: cfg.endpoint,
    credentials: {
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey
    }
  });
  const perintah = new PutObjectCommand({
    Bucket: cfg.bucket,
    Key: kunci,
    // Content-Type dikunci ke MIME kanonis dari ekstensi yang sudah
    // divalidasi, bukan ke MIME kiriman klien, dan Content-Length
    // dikunci ke ukuran yang dinyatakan; URL bertanda tangan menolak
    // unggahan yang menyimpang dari keduanya.
    ContentType: mimeKanonisBerkas(input.namaAsli),
    ContentLength: input.ukuran
  });
  const uploadUrl = await getSignedUrl(klien, perintah, {
    expiresIn: URL_KEDALUWARSA_DETIK
  });
  return {
    mode: "r2",
    uploadUrl,
    bucket: cfg.bucket,
    kunci,
    kedaluwarsaDetik: URL_KEDALUWARSA_DETIK
  };
}

// ── Cadangan uji lokal ────────────────────────────────────────────────────

const DIR_UNGGAH_UJI = path.join(process.cwd(), ".jurnal-uji", "uploads");

// ── Unduhan berkas (Tahap 3: reviewer mengunduh naskah yang ditugaskan) ──
// URL unduh bertanda tangan berumur pendek (10 menit) ke R2. Kunci objek
// adalah kunci buatan server yang tidak memuat identitas penulis, jadi
// URL ini aman diserahkan kepada reviewer yang berhak. Pemeriksaan hak
// aksesnya sendiri dilakukan pemanggil (route review) sebelum memanggil
// fungsi ini; fungsi ini hanya menandatangani.
const URL_UNDUH_KEDALUWARSA_DETIK = 10 * 60;

export async function tandaTanganiUnduhan(
  bucket: string,
  kunci: string
): Promise<string> {
  const cfg = konfigurasiR2();
  if (!cfg) {
    throw new Error("Penyimpanan R2 belum terkonfigurasi di server.");
  }
  if (bucket !== cfg.bucket) {
    throw new Error("Bucket berkas tidak cocok dengan bucket R2 jurnal.");
  }
  const klien = new S3Client({
    region: "auto",
    endpoint: cfg.endpoint,
    credentials: {
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey
    }
  });
  const perintah = new GetObjectCommand({ Bucket: bucket, Key: kunci });
  return getSignedUrl(klien, perintah, {
    expiresIn: URL_UNDUH_KEDALUWARSA_DETIK
  });
}

// Membaca isi berkas uji lokal dari folder scratch. Kunci diverifikasi
// terhadap pola kunci buatan server dan jalur hasil join ditahan di
// dalam folder unggahan, jadi kunci karangan tidak bisa membaca berkas
// di luar folder itu.
export async function bacaBerkasLokalUji(
  kunci: string
): Promise<Buffer | null> {
  if (!POLA_KUNCI_OBJEK.test(kunci)) return null;
  const tujuan = path.resolve(DIR_UNGGAH_UJI, kunci);
  const akar = path.resolve(DIR_UNGGAH_UJI);
  if (!tujuan.startsWith(akar + path.sep)) return null;
  try {
    return await fs.readFile(tujuan);
  } catch {
    return null;
  }
}

// Menyimpan berkas ke folder scratch lokal klon (MODE UJI). Mengembalikan
// metadata berkas dengan bucket penanda "lokal-uji".
export async function simpanBerkasLokalUji(input: {
  batchId: string;
  kategori: JurnalBerkasKategori;
  namaAsli: string;
  mime: string;
  isi: Buffer;
}): Promise<JurnalBerkasMeta> {
  const galat = validasiBerkasMeta({ ...input, ukuran: input.isi.length });
  if (galat) throw new Error(galat);
  const kunci = buatKunciObjek(input.batchId, input.kategori, input.namaAsli);
  const tujuan = path.join(DIR_UNGGAH_UJI, kunci);
  await fs.mkdir(path.dirname(tujuan), { recursive: true });
  await fs.writeFile(tujuan, input.isi);
  console.warn(
    `[jurnal] MODE UJI LOKAL: berkas "${input.namaAsli}" disimpan ke folder scratch klon (${kunci}), BUKAN ke R2. Isi berkas uji tidak boleh dipakai sebagai arsip naskah.`
  );
  return {
    kategori: input.kategori,
    namaAsli: input.namaAsli,
    mime: input.mime || mimeKanonisBerkas(input.namaAsli),
    ukuran: input.isi.length,
    bucket: BUCKET_LOKAL_UJI,
    kunci,
    mode: "local"
  };
}

// ── Verifikasi metadata berkas yang diserahkan balik ─────────────────────
// Pada POST /api/jurnal/submissions klien menyerahkan metadata berkas
// (bucket dan kunci) yang sebelumnya diterbitkan server. Metadata itu
// tidak dipercaya mentah: polanya harus persis pola kunci buatan server,
// bucketnya harus bucket yang sah untuk modenya, dan segmen kategori di
// kunci harus sama dengan kategori yang dinyatakan.
const POLA_KUNCI_OBJEK =
  /^jurnal\/naskah\/[A-Za-z0-9-]{1,64}\/(utama|pendukung|galley)\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(pdf|docx|xlsx|zip|html)$/;

// Memeriksa satu metadata berkas dari badan permintaan route alur
// (Tahap 4: hasil copyediting dan galley). Aturannya sama dengan route
// revisi Tahap 3: validasi jenis dan ukuran, kelengkapan bucket dan
// kunci, batas nama berkas, lalu verifikasi pola kunci buatan server.
export function periksaMetaBerkasDariBody(
  mentah: Record<string, unknown> | null | undefined
): { meta: JurnalBerkasMeta } | { galat: string } {
  const bersih = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const kategoriMentah = bersih(mentah?.kategori);
  const meta: JurnalBerkasMeta = {
    kategori:
      kategoriMentah === "pendukung"
        ? "pendukung"
        : kategoriMentah === "galley"
          ? "galley"
          : "utama",
    namaAsli: bersih(mentah?.namaAsli),
    mime: bersih(mentah?.mime),
    ukuran: typeof mentah?.ukuran === "number" ? mentah.ukuran : 0,
    bucket: bersih(mentah?.bucket),
    kunci: bersih(mentah?.kunci),
    mode: mentah?.mode === "r2" ? "r2" : "local"
  };
  const pesan = validasiBerkasMeta(meta);
  if (pesan) return { galat: pesan };
  if (!meta.bucket || !meta.kunci) {
    return {
      galat:
        "Metadata berkas tidak lengkap: unggah ulang berkas sampai server mencatat bucket dan kunci objeknya."
    };
  }
  if (meta.namaAsli.length > BATAS_TEKS.namaBerkas) {
    return { galat: "Nama berkas terlalu panjang." };
  }
  const pesanVerifikasi = verifikasiMetaBerkasTersimpan(meta);
  if (pesanVerifikasi) return { galat: pesanVerifikasi };
  return { meta };
}

export function verifikasiMetaBerkasTersimpan(
  meta: JurnalBerkasMeta
): string | null {
  const cocok = POLA_KUNCI_OBJEK.exec(meta.kunci);
  if (!cocok) {
    return "Kunci objek berkas tidak mengikuti pola yang diterbitkan server. Unggah ulang berkasnya.";
  }
  if (cocok[1] !== meta.kategori) {
    return "Kategori berkas tidak cocok dengan kunci objeknya.";
  }
  if (ekstensiBerkas(meta.namaAsli) !== `.${cocok[2]}`) {
    return "Ekstensi nama berkas tidak cocok dengan kunci objeknya.";
  }
  if (meta.mode === "local") {
    if (meta.bucket !== BUCKET_LOKAL_UJI) {
      return "Bucket berkas uji lokal tidak sah.";
    }
    return null;
  }
  const cfg = konfigurasiR2();
  if (!cfg) {
    return "Metadata berkas menyebut penyimpanan R2, tetapi R2 tidak terkonfigurasi di server.";
  }
  if (meta.bucket !== cfg.bucket) {
    return "Bucket berkas tidak cocok dengan bucket R2 jurnal.";
  }
  return null;
}

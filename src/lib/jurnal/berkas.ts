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
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  validasiBerkasMeta,
  type JurnalBerkasKategori,
  type JurnalBerkasMeta
} from "./wizard";

export const BUCKET_LOKAL_UJI = "lokal-uji";
const URL_KEDALUWARSA_DETIK = 15 * 60; // 15 menit

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

// Kunci objek dibuat sebelum naskah punya kode lacak: memakai id batch
// unggahan dari klien, sehingga satu pengiriman bisa mengelompokkan
// berkas utamanya dan berkas pendukungnya.
export function buatKunciObjek(
  batchId: string,
  kategori: JurnalBerkasKategori,
  namaAsli: string
): string {
  const batch = namaAmanBerkas(batchId).replace(/[^a-zA-Z0-9-]+/g, "");
  return `jurnal/naskah/${batch}/${kategori}/${randomUUID()}-${namaAmanBerkas(namaAsli)}`;
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
    ContentType: input.mime || "application/octet-stream",
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
    mime: input.mime,
    ukuran: input.isi.length,
    bucket: BUCKET_LOKAL_UJI,
    kunci,
    mode: "local"
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Sesi akun uji untuk MODE DATA LOKAL jurnal — SERVER ONLY.
//
// Pada mode supabase, sesi adalah sesi Supabase Auth sungguhan (lihat
// /api/jurnal/auth/login). Pada mode lokal tidak ada Supabase Auth yang
// terhubung ke tabel jurnal, jadi akun penulis uji disimpan lokal
// (store-local.ts) dan sesi dinyatakan dengan token bertanda tangan HMAC
// berisi email dan masa berlaku. Token ini HANYA berlaku pada mode lokal
// (mode uji) dan tidak pernah diterima pada mode supabase.
//
// Pengerasan Tahap Keamanan:
// - Masa berlaku dipersingkat dari 7 hari menjadi 24 jam.
// - Rahasia penanda tangan diambil dari env JURNAL_LOCAL_SECRET; bila
//   tidak terpasang, rahasia dibuat acak per proses. Tidak ada lagi
//   rahasia bawaan yang tertulis di kode sumber (siapa pun yang membaca
//   kode tidak bisa memalsukan token); konsekuensinya sesi lokal tidak
//   bertahan melewati mulai ulang server, yang memang wajar untuk mode
//   uji.
// - Peran lokal diturunkan dari email di server: akun biasa berperan
//   author; akun yang emailnya tercantum di env
//   JURNAL_LOCAL_STAFF_EMAILS (daftar pisah koma) berperan staf uji
//   (journal_manager) supaya panel lokal bisa diuji tanpa membuka panel
//   ke publik.
// ─────────────────────────────────────────────────────────────────────────────

import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import type { JurnalRole } from "./status";

const MASA_BERLAKU_MS = 24 * 60 * 60 * 1000; // 24 jam

let rahasiaProses: string | null = null;

function rahasia(): string {
  const dariEnv = (process.env.JURNAL_LOCAL_SECRET || "").trim();
  if (dariEnv) return dariEnv;
  if (!rahasiaProses) {
    rahasiaProses = randomBytes(32).toString("hex");
    console.warn(
      "[jurnal] JURNAL_LOCAL_SECRET tidak terpasang; sesi lokal uji memakai rahasia acak per proses (sesi tidak bertahan melewati mulai ulang server)."
    );
  }
  return rahasiaProses;
}

function tandaTangan(isi: string): string {
  return createHmac("sha256", rahasia()).update(isi).digest("base64url");
}

export function buatTokenSesiLokal(email: string): string {
  const kedaluwarsa = Date.now() + MASA_BERLAKU_MS;
  const isi = `${email.trim().toLowerCase()}.${kedaluwarsa}`;
  return `${Buffer.from(isi, "utf8").toString("base64url")}.${tandaTangan(isi)}`;
}

export function verifikasiTokenSesiLokal(token: string | null): string | null {
  if (!token) return null;
  const bagian = token.split(".");
  if (bagian.length !== 2) return null;
  let isi: string;
  try {
    isi = Buffer.from(bagian[0], "base64url").toString("utf8");
  } catch {
    return null;
  }
  const diharapkan = tandaTangan(isi);
  const a = Buffer.from(bagian[1]);
  const b = Buffer.from(diharapkan);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const titik = isi.lastIndexOf(".");
  if (titik < 0) return null;
  const email = isi.slice(0, titik);
  const kedaluwarsa = Number(isi.slice(titik + 1));
  if (!email || !Number.isFinite(kedaluwarsa) || Date.now() > kedaluwarsa) {
    return null;
  }
  return email;
}

// Ambil email pemilik sesi lokal dari header Authorization Bearer.
export function emailDariHeaderLokal(req: Request): string | null {
  const authorization = req.headers.get("authorization");
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
  return verifikasiTokenSesiLokal(token ?? null);
}

// Peran akun uji lokal diturunkan dari emailnya di server. Daftar staf
// uji berasal dari env JURNAL_LOCAL_STAFF_EMAILS; di luar daftar itu
// semua akun lokal hanya berperan author.
export function emailStafLokal(email: string): boolean {
  const daftar = (process.env.JURNAL_LOCAL_STAFF_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return daftar.includes(email.trim().toLowerCase());
}

export function peranLokalDariEmail(email: string): JurnalRole[] {
  return emailStafLokal(email)
    ? ["journal_manager", "author"]
    : ["author"];
}

export function sesiLokalStaf(req: Request): string | null {
  const email = emailDariHeaderLokal(req);
  return email && emailStafLokal(email) ? email : null;
}

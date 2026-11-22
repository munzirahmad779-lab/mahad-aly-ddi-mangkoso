// ─────────────────────────────────────────────────────────────────────────────
// Sesi akun uji untuk MODE DATA LOKAL jurnal — SERVER ONLY.
//
// Pada mode supabase, sesi adalah sesi Supabase Auth sungguhan (lihat
// /api/jurnal/auth/login). Pada mode lokal tidak ada Supabase Auth yang
// terhubung ke tabel jurnal, jadi akun penulis uji disimpan lokal
// (store-local.ts) dan sesi dinyatakan dengan token bertanda tangan HMAC
// berisi email dan masa berlaku. Token ini HANYA berlaku pada mode lokal
// (mode uji) dan tidak pernah diterima pada mode supabase.
// ─────────────────────────────────────────────────────────────────────────────

import { createHmac, timingSafeEqual } from "crypto";

const MASA_BERLAKU_MS = 7 * 24 * 60 * 60 * 1000; // 7 hari

function rahasia(): string {
  const dariEnv = (process.env.JURNAL_LOCAL_SECRET || "").trim();
  if (dariEnv) return dariEnv;
  console.warn(
    "[jurnal] JURNAL_LOCAL_SECRET tidak terpasang; sesi lokal uji memakai rahasia bawaan khusus mode uji."
  );
  return "jurnal-mode-lokal-uji-bukan-untuk-produksi";
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

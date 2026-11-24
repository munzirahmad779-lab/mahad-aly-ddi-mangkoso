// ─────────────────────────────────────────────────────────────────────────────
// Pembantu keamanan bersama route jurnal — SERVER ONLY (Tahap Keamanan).
//
// Satu tempat untuk: pembacaan JSON berbatas ukuran, rate limit yang
// konsisten (per IP dan per akun) dengan pencatatan hantaman, validasi
// format kode lacak, batas panjang kolom teks, pencatatan peristiwa
// keamanan, dan kait verifikasi Turnstile. Rancangan lengkapnya di
// ~/workspace/jurnal-mahadaly/KEAMANAN-OJS-VERSI-KITA.md.
//
// Pola yang diwarisi dari pengamanan web kampus: pembatas laju memakai
// pembantu repo src/lib/rate-limit.ts, dan tidak ada nilai dari klien
// yang dipercaya tanpa verifikasi ulang di server.
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse
} from "@/lib/rate-limit";
import { supabaseAdmin } from "@/lib/supabase/server";
import { catatPeristiwaKeamananLokal } from "./store-local";

// ── Peristiwa keamanan ───────────────────────────────────────────────────

export type JenisPeristiwaKeamanan =
  | "login_gagal"
  | "rate_limit"
  | "peran_ditolak"
  | "transisi_ditolak"
  | "unggah_ditolak"
  | "register_ditolak"
  | "turnstile_gagal"
  | "turnstile_dilewati"
  | "kode_tidak_sah"
  | "review_ditolak"
  | "reset_sandi_diminta"
  | "reset_sandi_gagal"
  | "reset_sandi_selesai"
  | "akses_publik_diubah";

export interface DetailPeristiwaKeamanan {
  ip?: string | null;
  email?: string | null;
  kode?: string | null;
  rincian?: string | null;
}

// Mencatat peristiwa keamanan ke tabel jurnal_security_events (mode
// supabase, migrasi 005) atau catatan lokal setara (mode lokal).
// Fungsi ini TIDAK PERNAH melempar: kegagalan mencatat hanya masuk log
// server, supaya pencatatan tidak pernah menggagalkan permintaan.
export async function catatPeristiwaKeamanan(
  jenis: JenisPeristiwaKeamanan,
  detail: DetailPeristiwaKeamanan = {}
): Promise<void> {
  try {
    // Impor dinamis untuk menghindari lingkaran impor dengan fasad store.
    const { getJurnalDataMode } = await import("./store");
    const mode = await getJurnalDataMode();
    if (mode === "supabase") {
      const { error } = await supabaseAdmin
        .from("jurnal_security_events")
        .insert({
          event_type: jenis,
          ip_address: detail.ip ?? null,
          actor_email: detail.email ?? null,
          tracking_code: detail.kode ?? null,
          detail: detail.rincian ? { rincian: detail.rincian } : null
        });
      if (error) {
        console.warn(
          `[jurnal] Gagal mencatat peristiwa keamanan ${jenis}: ${error.message}`
        );
      }
      return;
    }
    await catatPeristiwaKeamananLokal({
      jenis,
      ip: detail.ip ?? null,
      email: detail.email ?? null,
      kode: detail.kode ?? null,
      rincian: detail.rincian ?? null
    });
  } catch (err) {
    console.warn(
      `[jurnal] Gagal mencatat peristiwa keamanan ${jenis}:`,
      err instanceof Error ? err.message : err
    );
  }
}

// ── Pembacaan JSON berbatas ukuran ───────────────────────────────────────

export async function bacaJsonTerbatas(
  req: Request,
  maksByte: number
): Promise<{ data: Record<string, unknown> | null; terlaluBesar: boolean }> {
  let teks = "";
  try {
    teks = await req.text();
  } catch {
    return { data: null, terlaluBesar: false };
  }
  if (new TextEncoder().encode(teks).length > maksByte) {
    return { data: null, terlaluBesar: true };
  }
  try {
    const parsed: unknown = JSON.parse(teks);
    return {
      data:
        parsed && typeof parsed === "object" && !Array.isArray(parsed)
          ? (parsed as Record<string, unknown>)
          : null,
      terlaluBesar: false
    };
  } catch {
    return { data: null, terlaluBesar: false };
  }
}

export function responsBadanTerlaluBesar(): NextResponse {
  return NextResponse.json(
    { error: "Badan permintaan melebihi batas ukuran yang diizinkan." },
    { status: 413 }
  );
}

// ── Rate limit konsisten ─────────────────────────────────────────────────

interface BatasLaju {
  limit: number;
  windowMs: number;
}

// Menegakkan rate limit per IP dan (bila diberikan) per akun untuk satu
// cakupan route. Mengembalikan Response 429 bila terblokir (dan mencatat
// peristiwa rate_limit), atau null bila boleh lanjut.
export async function batasiLajuJurnal(
  req: Request,
  cakupan: string,
  opsi: { perIp: BatasLaju; perAkun?: BatasLaju },
  akun?: string | null
): Promise<Response | null> {
  const ip = getClientIp(req);
  const ipRl = checkRateLimit(
    `jurnal:${cakupan}:ip:${ip}`,
    opsi.perIp.limit,
    opsi.perIp.windowMs
  );
  if (!ipRl.allowed) {
    await catatPeristiwaKeamanan("rate_limit", {
      ip,
      email: akun ?? null,
      rincian: `${cakupan}:per-ip`
    });
    return rateLimitResponse(ipRl);
  }
  if (opsi.perAkun && akun) {
    const akunRl = checkRateLimit(
      `jurnal:${cakupan}:akun:${akun.trim().toLowerCase()}`,
      opsi.perAkun.limit,
      opsi.perAkun.windowMs
    );
    if (!akunRl.allowed) {
      await catatPeristiwaKeamanan("rate_limit", {
        ip,
        email: akun,
        rincian: `${cakupan}:per-akun`
      });
      return rateLimitResponse(akunRl);
    }
  }
  return null;
}

// ── Validasi kode lacak ──────────────────────────────────────────────────

// Format ketat kode lacak jurnal. Selain pola ini, semua nilai (termasuk
// yang memuat %, _, atau string mirip SQL) ditolak 400 sebelum menyentuh
// lapisan data. Lapisan data sendiri memakai pencocokan persis, bukan
// ilike, jadi tidak ada wildcard yang bisa hidup di jalur ini.
// Kode baru berformat 6 digit (JRN-YYYY-XXXXXX, perbaikan audit 25 Nov
// 2026); kode lama 4 digit yang sudah beredar tetap diterima.
export const POLA_KODE_LACAK = /^JRN-\d{4}-(\d{4}|\d{6})$/;

export function normalisasiKodeLacak(v: unknown): string | null {
  if (typeof v !== "string") return null;
  let terdekode = v;
  try {
    terdekode = decodeURIComponent(v);
  } catch {
    return null; // rangkaian persen yang rusak bukan kode yang sah
  }
  const kode = terdekode.trim().toUpperCase();
  return POLA_KODE_LACAK.test(kode) ? kode : null;
}

// ── Batas panjang kolom teks ─────────────────────────────────────────────

export const BATAS_TEKS = {
  judul: 300,
  nama: 120,
  afiliasi: 200,
  negara: 80,
  orcid: 40,
  email: 254,
  abstrak: 10000,
  kataKunciItem: 60,
  catatan: 2000,
  teksAi: 2000,
  namaBerkas: 255
} as const;

export function galatBatasTeks(
  daftar: { label: string; nilai: string; maks: number }[]
): string | null {
  for (const d of daftar) {
    if (d.nilai.length > d.maks) {
      return `${d.label} melebihi batas ${d.maks} karakter.`;
    }
  }
  return null;
}

// ── Kait Turnstile ───────────────────────────────────────────────────────

export type HasilTurnstile =
  | { lolos: true; dilewati: boolean }
  | { lolos: false; status: number; pesan: string };

// Verifikasi Turnstile sisi server untuk route register dan kirim.
// - Kunci rahasia (TURNSTILE_SECRET_KEY) terpasang: token wajib ada dan
//   diverifikasi ke Cloudflare; gagal berarti ditolak 403.
// - Mode supabase tanpa kunci: ditolak 503 (gagal tertutup) dengan pesan
//   konfigurasi, karena produksi tidak boleh berjalan tanpa gerbang bot.
// - Mode lokal uji tanpa kunci: dilewati dengan penanda jelas di log
//   server dan peristiwa turnstile_dilewati.
// Tidak ada kunci contoh di kode; kunci hanya dari env masa deploy.
export async function periksaTurnstile(
  req: Request,
  token: unknown,
  cakupan: string
): Promise<HasilTurnstile> {
  const ip = getClientIp(req);
  const rahasia = (process.env.TURNSTILE_SECRET_KEY || "").trim();

  if (!rahasia) {
    const { getJurnalDataMode } = await import("./store");
    const mode = await getJurnalDataMode();
    if (mode === "supabase") {
      await catatPeristiwaKeamanan("turnstile_gagal", {
        ip,
        rincian: `${cakupan}:kunci-belum-terpasang`
      });
      return {
        lolos: false,
        status: 503,
        pesan:
          "Verifikasi keamanan (Turnstile) belum terkonfigurasi di server. Hubungi pengelola jurnal."
      };
    }
    console.warn(
      `[jurnal] TURNSTILE DILEWATI pada ${cakupan}: TURNSTILE_SECRET_KEY tidak terpasang dan mode data lokal (uji) aktif. Penanda ini tidak pernah muncul pada mode supabase.`
    );
    await catatPeristiwaKeamanan("turnstile_dilewati", {
      ip,
      rincian: cakupan
    });
    return { lolos: true, dilewati: true };
  }

  if (typeof token !== "string" || !token.trim()) {
    await catatPeristiwaKeamanan("turnstile_gagal", {
      ip,
      rincian: `${cakupan}:token-kosong`
    });
    return {
      lolos: false,
      status: 403,
      pesan: "Verifikasi keamanan (Turnstile) wajib diselesaikan."
    };
  }

  try {
    const form = new URLSearchParams();
    form.set("secret", rahasia);
    form.set("response", token.trim());
    if (ip && ip !== "unknown") form.set("remoteip", ip);
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form.toString()
      }
    );
    const hasil = (await res.json().catch(() => null)) as {
      success?: boolean;
    } | null;
    if (!hasil?.success) {
      await catatPeristiwaKeamanan("turnstile_gagal", {
        ip,
        rincian: `${cakupan}:siteverify-menolak`
      });
      return {
        lolos: false,
        status: 403,
        pesan: "Verifikasi keamanan (Turnstile) tidak lolos. Muat ulang halaman dan coba lagi."
      };
    }
    return { lolos: true, dilewati: false };
  } catch (err) {
    console.error(
      `[jurnal] Verifikasi Turnstile gagal dihubungi pada ${cakupan}:`,
      err instanceof Error ? err.message : err
    );
    await catatPeristiwaKeamanan("turnstile_gagal", {
      ip,
      rincian: `${cakupan}:siteverify-tidak-terjangkau`
    });
    return {
      lolos: false,
      status: 403,
      pesan: "Verifikasi keamanan (Turnstile) tidak dapat diperiksa saat ini. Coba lagi."
    };
  }
}

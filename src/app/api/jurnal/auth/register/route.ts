import { NextRequest, NextResponse } from "next/server";
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse
} from "@/lib/rate-limit";
import { daftarPenulis } from "@/lib/jurnal/akun";
import {
  JURNAL_CONSENT_TEKS,
  JURNAL_CONSENT_VERSI,
  validasiKataSandi
} from "@/lib/jurnal/wizard";
import {
  BATAS_TEKS,
  bacaJsonTerbatas,
  catatPeristiwaKeamanan,
  galatBatasTeks,
  periksaTurnstile,
  responsBadanTerlaluBesar
} from "@/lib/jurnal/keamanan";

// Pendaftaran akun penulis jurnal (Tahap 2, dikeraskan Tahap Keamanan).
// Persetujuan (consent) eksplisit wajib: klien mengirim persetujuan=true
// sesudah penulis mencentang bunyi persetujuan yang tampil; versi bunyi
// persetujuan dicatat pada akun. Mode supabase membuat akun Supabase Auth
// dan memberi peran author; mode lokal membuat akun uji lokal berlabel
// mode uji. Rate limit per IP dan per email ditegakkan di server, kata
// sandi mengikuti kebijakan bersama di wizard.ts, dan kait Turnstile
// diperiksa sebelum akun dibuat (KEAMANAN-OJS-VERSI-KITA.md bagian 3).

const MAX_ATTEMPTS_PER_EMAIL = 5;
const ATTEMPT_WINDOW_MS = 60 * 60 * 1000;
const MAX_ATTEMPTS_PER_IP = 20;
const IP_WINDOW_MS = 10 * 60 * 1000;

function bersih(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const ipRl = checkRateLimit(
      `jurnal-register:ip:${ip}`,
      MAX_ATTEMPTS_PER_IP,
      IP_WINDOW_MS
    );
    if (!ipRl.allowed) {
      await catatPeristiwaKeamanan("rate_limit", {
        ip,
        rincian: "register:per-ip"
      });
      return rateLimitResponse(ipRl);
    }

    const { data: body, terlaluBesar } = await bacaJsonTerbatas(
      req,
      16 * 1024
    );
    if (terlaluBesar) return responsBadanTerlaluBesar();
    const data = {
      nama: bersih(body?.nama),
      email: bersih(body?.email).toLowerCase(),
      kataSandi: typeof body?.password === "string" ? body.password : "",
      afiliasi: bersih(body?.afiliasi),
      negara: bersih(body?.negara),
      orcid: bersih(body?.orcid),
      persetujuan: body?.persetujuan === true
    };

    if (!data.nama || !data.email || !data.afiliasi) {
      return NextResponse.json(
        { error: "Nama, email, dan afiliasi wajib diisi." },
        { status: 400 }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email) || data.email.length > 254) {
      return NextResponse.json(
        { error: "Format email tidak sah." },
        { status: 400 }
      );
    }
    const galatBatas = galatBatasTeks([
      { label: "Nama", nilai: data.nama, maks: BATAS_TEKS.nama },
      { label: "Afiliasi", nilai: data.afiliasi, maks: BATAS_TEKS.afiliasi },
      { label: "Negara", nilai: data.negara, maks: BATAS_TEKS.negara },
      { label: "ORCID", nilai: data.orcid, maks: BATAS_TEKS.orcid }
    ]);
    if (galatBatas) {
      return NextResponse.json({ error: galatBatas }, { status: 400 });
    }
    const galatSandi = validasiKataSandi(data.kataSandi);
    if (galatSandi) {
      return NextResponse.json({ error: galatSandi }, { status: 400 });
    }
    if (!data.persetujuan) {
      await catatPeristiwaKeamanan("register_ditolak", {
        ip,
        email: data.email,
        rincian: "tanpa-persetujuan"
      });
      return NextResponse.json(
        {
          error:
            "Persetujuan pembuatan akun wajib dicentang sebelum mendaftar."
        },
        { status: 400 }
      );
    }

    // Kait Turnstile: diperiksa sebelum akun dibuat.
    const turnstile = await periksaTurnstile(
      req,
      body?.turnstileToken,
      "register"
    );
    if (!turnstile.lolos) {
      return NextResponse.json(
        { error: turnstile.pesan },
        { status: turnstile.status }
      );
    }

    const emailRl = checkRateLimit(
      `jurnal-register:email:${data.email}`,
      MAX_ATTEMPTS_PER_EMAIL,
      ATTEMPT_WINDOW_MS
    );
    if (!emailRl.allowed) {
      await catatPeristiwaKeamanan("rate_limit", {
        ip,
        email: data.email,
        rincian: "register:per-email"
      });
      return rateLimitResponse(emailRl);
    }

    const hasil = await daftarPenulis({
      nama: data.nama,
      email: data.email,
      kataSandi: data.kataSandi,
      afiliasi: data.afiliasi,
      negara: data.negara || undefined,
      orcid: data.orcid || undefined
    });

    return NextResponse.json(
      {
        success: true,
        mode: hasil.mode,
        email: hasil.email,
        nama: hasil.nama,
        peran: hasil.peran,
        consentVersi: JURNAL_CONSENT_VERSI,
        consentTeks: JURNAL_CONSENT_TEKS
      },
      { status: 201 }
    );
  } catch (err) {
    const pesan = err instanceof Error ? err.message : "Pendaftaran gagal.";
    const status = /sudah terdaftar/i.test(pesan) ? 409 : 500;
    console.error("API /api/jurnal/auth/register error:", pesan);
    return NextResponse.json({ error: pesan }, { status });
  }
}

import { NextRequest, NextResponse } from "next/server";
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse
} from "@/lib/rate-limit";
import { daftarPenulis } from "@/lib/jurnal/akun";
import { JURNAL_CONSENT_TEKS, JURNAL_CONSENT_VERSI } from "@/lib/jurnal/wizard";

// Pendaftaran akun penulis jurnal (Tahap 2).
// Persetujuan (consent) eksplisit wajib: klien mengirim persetujuan=true
// sesudah penulis mencentang bunyi persetujuan yang tampil; versi bunyi
// persetujuan dicatat pada akun. Mode supabase membuat akun Supabase Auth
// dan memberi peran author; mode lokal membuat akun uji lokal berlabel
// mode uji. Mengikuti pola route login: rate limit per IP dan per email
// ditegakkan di server.

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
    if (!ipRl.allowed) return rateLimitResponse(ipRl);

    const body = await req.json().catch(() => null);
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
    if (data.kataSandi.length < 8 || data.kataSandi.length > 128) {
      return NextResponse.json(
        { error: "Kata sandi minimal 8 karakter." },
        { status: 400 }
      );
    }
    if (!data.persetujuan) {
      return NextResponse.json(
        {
          error:
            "Persetujuan pembuatan akun wajib dicentang sebelum mendaftar."
        },
        { status: 400 }
      );
    }

    const emailRl = checkRateLimit(
      `jurnal-register:email:${data.email}`,
      MAX_ATTEMPTS_PER_EMAIL,
      ATTEMPT_WINDOW_MS
    );
    if (!emailRl.allowed) return rateLimitResponse(emailRl);

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

import { NextRequest, NextResponse } from "next/server";
import {
  createSubmission,
  getJurnalDataMode,
  listSubmissions
} from "@/lib/jurnal/store";
import { requireJurnalRole } from "@/lib/jurnal/auth";
import { JURNAL_STAFF_ROLES, labelStatus } from "@/lib/jurnal/status";

// API naskah jurnal "OJS versi kita" (Tahap 1).
// Lapisan data dipilih fasad src/lib/jurnal/store.ts: tabel jurnal_*
// Supabase bila migrasi 004 sudah dijalankan dan env tersedia, selain itu
// data uji lokal. POST bersifat publik (pintu kirim naskah). GET daftar
// adalah antrean panel: pada mode supabase wajib login berperan staf;
// pada mode lokal terbuka sebagai mode uji.

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const mode = await getJurnalDataMode();
  let viewer: { email: string; roles: string[] } | null = null;

  if (mode === "supabase") {
    const auth = await requireJurnalRole(req, JURNAL_STAFF_ROLES);
    if (!auth.ok) return auth.response;
    viewer = { email: auth.email, roles: auth.roles };
  }

  try {
    const data = await listSubmissions();
    return NextResponse.json({
      mode,
      authRequired: mode === "supabase",
      viewer,
      submissions: data
    });
  } catch (err) {
    console.error(
      "GET /api/jurnal/submissions gagal:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { error: "Gagal memuat daftar naskah jurnal." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { judul, penulis, email, afiliasi, abstrak } = (body ?? {}) as {
    judul?: unknown;
    penulis?: unknown;
    email?: unknown;
    afiliasi?: unknown;
    abstrak?: unknown;
  };

  const bersih = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const data = {
    judul: bersih(judul),
    penulis: bersih(penulis),
    email: bersih(email),
    afiliasi: bersih(afiliasi),
    abstrak: bersih(abstrak)
  };

  if (!data.judul || !data.penulis || !data.email || !data.afiliasi || !data.abstrak) {
    return NextResponse.json(
      { error: "Semua kolom (judul, penulis, email, afiliasi, abstrak) wajib diisi." },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return NextResponse.json(
      { error: "Format email tidak sah." },
      { status: 400 }
    );
  }
  if (data.abstrak.length < 50) {
    return NextResponse.json(
      { error: "Abstrak terlalu pendek (minimal 50 karakter)." },
      { status: 400 }
    );
  }

  try {
    const naskah = await createSubmission(data);
    return NextResponse.json(
      {
        kode: naskah.kode,
        status: naskah.status,
        statusLabel: labelStatus(naskah.status),
        dibuatPada: naskah.dibuatPada
      },
      { status: 201 }
    );
  } catch (err) {
    console.error(
      "POST /api/jurnal/submissions gagal:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { error: "Pengiriman naskah gagal disimpan. Coba lagi." },
      { status: 500 }
    );
  }
}

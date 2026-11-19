import { NextRequest, NextResponse } from "next/server";
import { createNaskahUji, listNaskahUji } from "@/lib/jurnal/store";

// API naskah cabang jurnal VERSI UJI. Menyimpan ke lapisan data uji lokal
// (src/lib/jurnal/store.ts), BUKAN ke basis data produksi Supabase Mahadaly.

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await listNaskahUji();
  return NextResponse.json({ submissions: data });
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
      { error: "Abstrak terlalu pendek (minimal 50 karakter untuk versi uji)." },
      { status: 400 }
    );
  }

  const naskah = await createNaskahUji(data);
  return NextResponse.json(
    { kode: naskah.kode, status: naskah.status, dibuatPada: naskah.dibuatPada },
    { status: 201 }
  );
}

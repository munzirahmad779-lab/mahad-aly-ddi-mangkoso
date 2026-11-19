import { NextRequest, NextResponse } from "next/server";
import {
  getNaskahUji,
  updateStatusNaskahUji,
  STATUS_NASKAH_UJI,
  type StatusNaskahUji
} from "@/lib/jurnal/store";

// Satu naskah uji berdasarkan kode lacak JRN-YYYY-XXXX.
// GET dipakai halaman lacak; PATCH dipakai panel redaksi versi uji
// (tanpa login sungguhan — ditandai jelas di halaman panel).

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ kode: string }> }
) {
  const { kode } = await params;
  const naskah = await getNaskahUji(decodeURIComponent(kode));
  if (!naskah) {
    return NextResponse.json(
      { error: "Kode lacak tidak ditemukan di data uji." },
      { status: 404 }
    );
  }
  return NextResponse.json({ submission: naskah });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ kode: string }> }
) {
  const { kode } = await params;
  const body = await req.json().catch(() => null);
  const status = (body as { status?: unknown } | null)?.status;

  if (
    typeof status !== "string" ||
    !(STATUS_NASKAH_UJI as readonly string[]).includes(status)
  ) {
    return NextResponse.json(
      {
        error: `Status tidak dikenal. Pilihan sah: ${STATUS_NASKAH_UJI.join(", ")}.`
      },
      { status: 400 }
    );
  }

  const naskah = await updateStatusNaskahUji(
    decodeURIComponent(kode),
    status as StatusNaskahUji
  );
  if (!naskah) {
    return NextResponse.json(
      { error: "Kode lacak tidak ditemukan di data uji." },
      { status: 404 }
    );
  }
  return NextResponse.json({ submission: naskah });
}

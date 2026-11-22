import { NextRequest, NextResponse } from "next/server";
import { hapusPengumuman, ubahPengumuman } from "@/lib/jurnal/publik5-server";
import { tuntutStafJurnal } from "@/lib/jurnal/gerbang";
import {
  bacaJsonTerbatas,
  batasiLajuJurnal,
  galatBatasTeks,
  responsBadanTerlaluBesar
} from "@/lib/jurnal/keamanan";

// Sunting dan hapus pengumuman jurnal (Tahap 5). Hanya peran staf.

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const dibatasi = await batasiLajuJurnal(req, "pengumuman-ubah", {
    perIp: { limit: 60, windowMs: 60 * 60 * 1000 }
  });
  if (dibatasi) return dibatasi;
  const gerbang = await tuntutStafJurnal(req, "pengumuman-ubah");
  if (!gerbang.ok) return gerbang.response;
  const { id } = await params;

  const { data: body, terlaluBesar } = await bacaJsonTerbatas(req, 32 * 1024);
  if (terlaluBesar) return responsBadanTerlaluBesar();

  const patch: {
    judul?: string;
    isi?: string;
    tayang?: boolean;
    kedaluwarsaPada?: string | null;
  } = {};
  if (typeof body?.judul === "string") patch.judul = body.judul.trim();
  if (typeof body?.isi === "string") patch.isi = body.isi.trim();
  if (typeof body?.tayang === "boolean") patch.tayang = body.tayang;
  if (body?.kedaluwarsaPada === null) patch.kedaluwarsaPada = null;
  if (
    typeof body?.kedaluwarsaPada === "string" &&
    body.kedaluwarsaPada.trim()
  ) {
    patch.kedaluwarsaPada = body.kedaluwarsaPada.trim();
  }
  if (patch.judul !== undefined || patch.isi !== undefined) {
    const galat = galatBatasTeks([
      { label: "Judul pengumuman", nilai: patch.judul ?? "x", maks: 300 },
      { label: "Isi pengumuman", nilai: patch.isi ?? "x", maks: 10000 }
    ]);
    if (galat) return NextResponse.json({ error: galat }, { status: 400 });
  }
  if (
    patch.kedaluwarsaPada &&
    Number.isNaN(new Date(patch.kedaluwarsaPada).getTime())
  ) {
    return NextResponse.json(
      { error: "Tanggal kedaluwarsa tidak sah." },
      { status: 400 }
    );
  }

  try {
    await ubahPengumuman(id, patch);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(
      "PATCH /api/jurnal/pengumuman/[id] gagal:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { error: "Gagal mengubah pengumuman." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const dibatasi = await batasiLajuJurnal(req, "pengumuman-hapus", {
    perIp: { limit: 30, windowMs: 60 * 60 * 1000 }
  });
  if (dibatasi) return dibatasi;
  const gerbang = await tuntutStafJurnal(req, "pengumuman-hapus");
  if (!gerbang.ok) return gerbang.response;
  const { id } = await params;
  try {
    await hapusPengumuman(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(
      "DELETE /api/jurnal/pengumuman/[id] gagal:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { error: "Gagal menghapus pengumuman." },
      { status: 500 }
    );
  }
}

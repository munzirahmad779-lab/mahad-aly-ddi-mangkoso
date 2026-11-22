import { NextRequest, NextResponse } from "next/server";
import { ubahTerbitanStaf } from "@/lib/jurnal/alur-server";
import { tuntutStafJurnal } from "@/lib/jurnal/gerbang";
import {
  BATAS_TEKS,
  bacaJsonTerbatas,
  batasiLajuJurnal,
  responsBadanTerlaluBesar
} from "@/lib/jurnal/keamanan";

// Menyunting metadata terbitan yang belum terbit (Tahap 4): volume,
// nomor, tahun, judul, uraian. Slug tidak berubah sesudah dibuat supaya
// tautan yang sudah dibagikan tidak rusak. Hanya peran staf.

export const dynamic = "force-dynamic";

function angkaAtauNull(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return Math.trunc(v);
  if (typeof v === "string" && v.trim() && !Number.isNaN(Number(v))) {
    return Math.trunc(Number(v));
  }
  return null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const dibatasi = await batasiLajuJurnal(req, "terbitan-sunting", {
    perIp: { limit: 60, windowMs: 60 * 1000 }
  });
  if (dibatasi) return dibatasi;

  const gerbang = await tuntutStafJurnal(req, "terbitan-sunting");
  if (!gerbang.ok) return gerbang.response;

  const { slug } = await params;
  const { data: body, terlaluBesar } = await bacaJsonTerbatas(req, 16 * 1024);
  if (terlaluBesar) return responsBadanTerlaluBesar();
  if (!body) {
    return NextResponse.json(
      { error: "Badan permintaan tidak sah." },
      { status: 400 }
    );
  }

  const patch: {
    volume?: number | null;
    number?: number | null;
    year?: number;
    judul?: string | null;
    uraian?: string | null;
    tanggalTerbit?: string | null;
  } = {};
  if ("volume" in body) patch.volume = angkaAtauNull(body.volume);
  if ("number" in body) patch.number = angkaAtauNull(body.number);
  if ("year" in body) {
    const year = angkaAtauNull(body.year);
    if (!year || year < 1900 || year > 2200) {
      return NextResponse.json(
        { error: "Tahun terbitan tidak sah." },
        { status: 400 }
      );
    }
    patch.year = year;
  }
  if ("judul" in body) {
    const judul =
      typeof body.judul === "string" && body.judul.trim()
        ? body.judul.trim()
        : null;
    if (judul && judul.length > BATAS_TEKS.judul) {
      return NextResponse.json(
        { error: "Judul terbitan terlalu panjang." },
        { status: 400 }
      );
    }
    patch.judul = judul;
  }
  if ("uraian" in body) {
    const uraian =
      typeof body.uraian === "string" && body.uraian.trim()
        ? body.uraian.trim()
        : null;
    if (uraian && uraian.length > BATAS_TEKS.abstrak) {
      return NextResponse.json(
        { error: "Uraian terbitan terlalu panjang." },
        { status: 400 }
      );
    }
    patch.uraian = uraian;
  }
  if ("tanggalTerbit" in body) {
    // Tanggal terbit rencana; disimpan sebagai tanggal terbit
    // terbitan dan digantikan tanggal sesungguhnya saat diterbitkan
    // bila staf tidak menetapkannya lagi.
    const mentah =
      typeof body.tanggalTerbit === "string" ? body.tanggalTerbit.trim() : "";
    if (mentah === "") {
      patch.tanggalTerbit = null;
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(mentah)) {
      patch.tanggalTerbit = new Date(`${mentah}T00:00:00.000Z`).toISOString();
    } else {
      return NextResponse.json(
        { error: "Tanggal terbit harus berformat YYYY-MM-DD." },
        { status: 400 }
      );
    }
  }

  try {
    await ubahTerbitanStaf(decodeURIComponent(slug), patch);
    return NextResponse.json({ success: true });
  } catch (err) {
    const pesan =
      err instanceof Error ? err.message : "Gagal menyunting terbitan.";
    const status = /tidak ditemukan/i.test(pesan) ? 404 : 400;
    return NextResponse.json({ error: pesan }, { status });
  }
}

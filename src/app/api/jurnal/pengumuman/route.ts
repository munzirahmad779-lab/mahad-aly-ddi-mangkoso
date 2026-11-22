import { NextRequest, NextResponse } from "next/server";
import {
  buatPengumumanBaru,
  daftarPengumumanPublik,
  daftarPengumumanStaf
} from "@/lib/jurnal/publik5-server";
import { sesiJurnalDariRequest, sesiPunyaPeran } from "@/lib/jurnal/sesi-server";
import { tuntutStafJurnal } from "@/lib/jurnal/gerbang";
import { JURNAL_STAFF_ROLES } from "@/lib/jurnal/status";
import {
  bacaJsonTerbatas,
  batasiLajuJurnal,
  galatBatasTeks,
  responsBadanTerlaluBesar
} from "@/lib/jurnal/keamanan";

// Pengumuman jurnal (Tahap 5). GET tanpa sesi staf menjawab daftar
// publik (hanya yang tayang); GET dengan sesi staf menjawab semua
// termasuk draf. POST membuat pengumuman baru dan hanya untuk staf.

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const dibatasi = await batasiLajuJurnal(req, "pengumuman-daftar", {
    perIp: { limit: 120, windowMs: 60 * 1000 }
  });
  if (dibatasi) return dibatasi;
  try {
    const sesi = await sesiJurnalDariRequest(req);
    const staf = sesi ? sesiPunyaPeran(sesi, JURNAL_STAFF_ROLES) : false;
    const daftar = staf
      ? await daftarPengumumanStaf()
      : await daftarPengumumanPublik();
    return NextResponse.json({ pengumuman: daftar, modeStaf: staf });
  } catch (err) {
    console.error(
      "GET /api/jurnal/pengumuman gagal:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { error: "Gagal memuat pengumuman." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const dibatasi = await batasiLajuJurnal(req, "pengumuman-buat", {
    perIp: { limit: 30, windowMs: 60 * 60 * 1000 }
  });
  if (dibatasi) return dibatasi;

  const gerbang = await tuntutStafJurnal(req, "pengumuman-buat");
  if (!gerbang.ok) return gerbang.response;

  const { data: body, terlaluBesar } = await bacaJsonTerbatas(req, 32 * 1024);
  if (terlaluBesar) return responsBadanTerlaluBesar();

  const judul = typeof body?.judul === "string" ? body.judul.trim() : "";
  const isi = typeof body?.isi === "string" ? body.isi.trim() : "";
  const tayang = body?.tayang === true;
  const kedaluwarsaPada =
    typeof body?.kedaluwarsaPada === "string" && body.kedaluwarsaPada.trim()
      ? body.kedaluwarsaPada.trim()
      : null;
  if (!judul || !isi) {
    return NextResponse.json(
      { error: "Judul dan isi pengumuman wajib diisi." },
      { status: 400 }
    );
  }
  const galat = galatBatasTeks([
    { label: "Judul pengumuman", nilai: judul, maks: 300 },
    { label: "Isi pengumuman", nilai: isi, maks: 10000 }
  ]);
  if (galat) return NextResponse.json({ error: galat }, { status: 400 });
  if (kedaluwarsaPada && Number.isNaN(new Date(kedaluwarsaPada).getTime())) {
    return NextResponse.json(
      { error: "Tanggal kedaluwarsa tidak sah." },
      { status: 400 }
    );
  }

  try {
    const baru = await buatPengumumanBaru({
      judul,
      isi,
      tayang,
      kedaluwarsaPada
    });
    return NextResponse.json({ pengumuman: baru }, { status: 201 });
  } catch (err) {
    console.error(
      "POST /api/jurnal/pengumuman gagal:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { error: "Gagal membuat pengumuman." },
      { status: 500 }
    );
  }
}

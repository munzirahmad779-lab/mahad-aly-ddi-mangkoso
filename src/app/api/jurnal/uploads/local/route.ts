import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "@/lib/rate-limit";
import { simpanBerkasLokalUji } from "@/lib/jurnal/berkas";
import { getJurnalDataMode } from "@/lib/jurnal/store";
import { emailDariHeaderLokal } from "@/lib/jurnal/sesi-lokal";
import type { JurnalBerkasKategori } from "@/lib/jurnal/wizard";
import {
  batasiLajuJurnal,
  catatPeristiwaKeamanan
} from "@/lib/jurnal/keamanan";

// Unggahan cadangan MODE UJI LOKAL: hanya dipakai bila R2 belum
// terkonfigurasi. Berkas disimpan ke folder scratch klon
// (.jurnal-uji/uploads/) yang jelas berlabel uji dan tidak ikut build
// produksi; metadata yang dikembalikan memakai bucket penanda
// "lokal-uji" supaya tidak pernah tertukar dengan berkas R2 sungguhan.
// Validasi jenis dan ukuran ditegakkan di server (berkas.ts).
//
// Tahap Keamanan: route ini menjawab 404 pada mode supabase (jalur
// cadangan tidak boleh hidup di produksi), mewajibkan sesi penulis
// lokal, dibatasi laju, dan menolak badan yang jelas melebihi batas
// berkas sebelum dibaca ke memori.

export const dynamic = "force-dynamic";

// 20 MB berkas + ruang untuk pembungkus multipart.
const BATAS_BADAN_BYTES = 22 * 1024 * 1024;

export async function POST(req: NextRequest) {
  if ((await getJurnalDataMode()) === "supabase") {
    return NextResponse.json(
      { error: "Jalur unggahan uji lokal tidak tersedia." },
      { status: 404 }
    );
  }

  const email = emailDariHeaderLokal(req);
  if (!email) {
    return NextResponse.json(
      {
        error:
          "Unggahan uji lokal memerlukan akun penulis. Silakan masuk terlebih dahulu."
      },
      { status: 401 }
    );
  }

  const dibatasi = await batasiLajuJurnal(
    req,
    "unggah-lokal",
    {
      perIp: { limit: 30, windowMs: 60 * 60 * 1000 },
      perAkun: { limit: 30, windowMs: 60 * 60 * 1000 }
    },
    email
  );
  if (dibatasi) return dibatasi;

  const panjangDinyatakan = Number(req.headers.get("content-length") || 0);
  if (panjangDinyatakan > BATAS_BADAN_BYTES) {
    return NextResponse.json(
      { error: "Badan unggahan melebihi batas ukuran yang diizinkan." },
      { status: 413 }
    );
  }

  const form = await req.formData().catch(() => null);
  if (!form) {
    return NextResponse.json(
      { error: "Badan unggahan harus multipart form-data." },
      { status: 400 }
    );
  }
  const berkas = form.get("berkas");
  const kategori = form.get("kategori");
  const batchId = form.get("batchId");

  if (!(berkas instanceof File)) {
    return NextResponse.json(
      { error: "Kolom berkas wajib berisi satu berkas." },
      { status: 400 }
    );
  }
  if (
    kategori !== "utama" &&
    kategori !== "pendukung" &&
    kategori !== "galley"
  ) {
    return NextResponse.json(
      { error: "Kategori berkas harus 'utama', 'pendukung', atau 'galley'." },
      { status: 400 }
    );
  }
  if (typeof batchId !== "string" || !/^[A-Za-z0-9-]{8,64}$/.test(batchId)) {
    return NextResponse.json(
      { error: "batchId wajib dikirim dalam format yang sah." },
      { status: 400 }
    );
  }

  try {
    const isi = Buffer.from(await berkas.arrayBuffer());
    const meta = await simpanBerkasLokalUji({
      batchId,
      kategori: kategori as JurnalBerkasKategori,
      namaAsli: berkas.name,
      mime: berkas.type || "",
      isi
    });
    return NextResponse.json({ mode: "local", berkas: meta }, { status: 201 });
  } catch (err) {
    const pesan =
      err instanceof Error ? err.message : "Unggahan uji lokal gagal.";
    await catatPeristiwaKeamanan("unggah_ditolak", {
      ip: getClientIp(req),
      email,
      rincian: `unggah-lokal:${pesan}`
    });
    return NextResponse.json({ error: pesan }, { status: 400 });
  }
}

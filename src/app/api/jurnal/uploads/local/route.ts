import { NextRequest, NextResponse } from "next/server";
import { simpanBerkasLokalUji } from "@/lib/jurnal/berkas";
import type { JurnalBerkasKategori } from "@/lib/jurnal/wizard";

// Unggahan cadangan MODE UJI LOKAL: hanya dipakai bila R2 belum
// terkonfigurasi. Berkas disimpan ke folder scratch klon
// (.jurnal-uji/uploads/) yang jelas berlabel uji dan tidak ikut build
// produksi; metadata yang dikembalikan memakai bucket penanda
// "lokal-uji" supaya tidak pernah tertukar dengan berkas R2 sungguhan.
// Validasi jenis dan ukuran ditegakkan di server (berkas.ts).

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
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
  if (kategori !== "utama" && kategori !== "pendukung") {
    return NextResponse.json(
      { error: "Kategori berkas harus 'utama' atau 'pendukung'." },
      { status: 400 }
    );
  }
  if (typeof batchId !== "string" || !batchId) {
    return NextResponse.json(
      { error: "batchId wajib dikirim." },
      { status: 400 }
    );
  }

  try {
    const isi = Buffer.from(await berkas.arrayBuffer());
    const meta = await simpanBerkasLokalUji({
      batchId,
      kategori: kategori as JurnalBerkasKategori,
      namaAsli: berkas.name,
      mime: berkas.type || "application/octet-stream",
      isi
    });
    return NextResponse.json({ mode: "local", berkas: meta }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unggahan uji lokal gagal." },
      { status: 400 }
    );
  }
}

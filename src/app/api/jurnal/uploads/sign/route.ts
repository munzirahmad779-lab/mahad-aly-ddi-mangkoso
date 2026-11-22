import { NextRequest, NextResponse } from "next/server";
import {
  isR2JurnalConfigured,
  tandaTanganiUnggahan
} from "@/lib/jurnal/berkas";
import type { JurnalBerkasKategori } from "@/lib/jurnal/wizard";

// Menerbitkan URL unggah bertanda tangan ke R2 untuk satu berkas wizard.
// Klien memanggil route ini per berkas, mengunggah langsung ke R2 dengan
// PUT ke uploadUrl, lalu menyerahkan metadata berkas (bucket dan kunci)
// pada POST /api/jurnal/submissions. Isi berkas tidak pernah melewati
// server aplikasi dan tidak disimpan di basis data (keputusan user).
//
// Bila R2 belum terkonfigurasi, route menjawab mode "local" dan klien
// diarahkan mengunggah lewat /api/jurnal/uploads/local (cadangan uji).

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const kategori = body?.kategori as JurnalBerkasKategori;
  const batchId = typeof body?.batchId === "string" ? body.batchId : "";
  const namaAsli = typeof body?.namaAsli === "string" ? body.namaAsli : "";
  const mime = typeof body?.mime === "string" ? body.mime : "";
  const ukuran = typeof body?.ukuran === "number" ? body.ukuran : 0;

  if (kategori !== "utama" && kategori !== "pendukung") {
    return NextResponse.json(
      { error: "Kategori berkas harus 'utama' atau 'pendukung'." },
      { status: 400 }
    );
  }
  if (!batchId || !namaAsli) {
    return NextResponse.json(
      { error: "batchId dan namaAsli wajib dikirim." },
      { status: 400 }
    );
  }

  if (!isR2JurnalConfigured()) {
    return NextResponse.json({
      mode: "local",
      pesan:
        "Penyimpanan R2 belum terkonfigurasi; gunakan unggahan cadangan uji lokal."
    });
  }

  try {
    const hasil = await tandaTanganiUnggahan({
      batchId,
      kategori,
      namaAsli,
      mime,
      ukuran
    });
    return NextResponse.json(hasil);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal menandatangani unggahan." },
      { status: 400 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "@/lib/rate-limit";
import {
  isR2JurnalConfigured,
  tandaTanganiUnggahan
} from "@/lib/jurnal/berkas";
import { getJurnalDataMode } from "@/lib/jurnal/store";
import { requireJurnalRole } from "@/lib/jurnal/auth";
import { emailDariHeaderLokal } from "@/lib/jurnal/sesi-lokal";
import {
  validasiBerkasMeta,
  type JurnalBerkasKategori
} from "@/lib/jurnal/wizard";
import {
  bacaJsonTerbatas,
  batasiLajuJurnal,
  catatPeristiwaKeamanan,
  responsBadanTerlaluBesar
} from "@/lib/jurnal/keamanan";

// Menerbitkan URL unggah bertanda tangan ke R2 untuk satu berkas wizard.
// Klien memanggil route ini per berkas, mengunggah langsung ke R2 dengan
// PUT ke uploadUrl, lalu menyerahkan metadata berkas (bucket dan kunci)
// pada POST /api/jurnal/submissions. Isi berkas tidak pernah melewati
// server aplikasi dan tidak disimpan di basis data (keputusan user).
//
// Bila R2 belum terkonfigurasi, route menjawab mode "local" dan klien
// diarahkan mengunggah lewat /api/jurnal/uploads/local (cadangan uji).
//
// Tahap Keamanan: route ini mewajibkan sesi penulis yang sah pada kedua
// mode dan dibatasi laju per IP dan per akun; URL yang diterbitkan
// mengunci Content-Type kanonis dan Content-Length (lihat berkas.ts).

export const dynamic = "force-dynamic";

const POLA_BATCH_ID = /^[A-Za-z0-9-]{8,64}$/;

export async function POST(req: NextRequest) {
  const mode = await getJurnalDataMode();
  let emailAkun = "";
  if (mode === "supabase") {
    const auth = await requireJurnalRole(req);
    if (!auth.ok) return auth.response;
    emailAkun = auth.email.toLowerCase();
  } else {
    const email = emailDariHeaderLokal(req);
    if (!email) {
      return NextResponse.json(
        {
          error:
            "Unggahan memerlukan akun penulis. Silakan masuk atau daftar terlebih dahulu."
        },
        { status: 401 }
      );
    }
    emailAkun = email;
  }

  const dibatasi = await batasiLajuJurnal(
    req,
    "unggah-sign",
    {
      perIp: { limit: 60, windowMs: 60 * 60 * 1000 },
      perAkun: { limit: 30, windowMs: 60 * 60 * 1000 }
    },
    emailAkun
  );
  if (dibatasi) return dibatasi;

  const { data: body, terlaluBesar } = await bacaJsonTerbatas(req, 8 * 1024);
  if (terlaluBesar) return responsBadanTerlaluBesar();
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
  if (!POLA_BATCH_ID.test(batchId) || !namaAsli) {
    return NextResponse.json(
      { error: "batchId dan namaAsli wajib dikirim dalam format yang sah." },
      { status: 400 }
    );
  }

  // Validasi jenis berkas ditegakkan di langkah sign pada kedua mode,
  // termasuk pemeriksaan silang ekstensi dengan MIME yang dinyatakan,
  // sebelum mode penyimpanan ditentukan.
  const galatBerkas = validasiBerkasMeta({
    kategori,
    namaAsli,
    mime,
    ukuran
  });
  if (galatBerkas) {
    await catatPeristiwaKeamanan("unggah_ditolak", {
      ip: getClientIp(req),
      email: emailAkun,
      rincian: `sign-validasi:${galatBerkas}`
    });
    return NextResponse.json({ error: galatBerkas }, { status: 400 });
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
    const pesan =
      err instanceof Error ? err.message : "Gagal menandatangani unggahan.";
    await catatPeristiwaKeamanan("unggah_ditolak", {
      ip: getClientIp(req),
      email: emailAkun,
      rincian: `sign:${pesan}`
    });
    return NextResponse.json({ error: pesan }, { status: 400 });
  }
}

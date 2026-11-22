import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "@/lib/rate-limit";
import { daftarkanRevisi } from "@/lib/jurnal/review-server";
import { sesiJurnalDariRequest } from "@/lib/jurnal/sesi-server";
import { verifikasiMetaBerkasTersimpan } from "@/lib/jurnal/berkas";
import {
  BERKAS_PENDUKUNG_MAX_JUMLAH,
  validasiBerkasMeta,
  type JurnalBerkasMeta
} from "@/lib/jurnal/wizard";
import {
  BATAS_TEKS,
  bacaJsonTerbatas,
  batasiLajuJurnal,
  catatPeristiwaKeamanan,
  normalisasiKodeLacak,
  responsBadanTerlaluBesar
} from "@/lib/jurnal/keamanan";

// Mendaftarkan berkas revisi penulis (Tahap 3). Berkasnya sendiri sudah
// diunggah penulis lewat alur unggah Tahap 2 (sign lalu PUT ke R2, atau
// cadangan uji lokal); route ini menerima metadatanya, memverifikasinya
// dengan aturan yang sama seperti wizard, dan mengikatnya ke putaran
// yang keputusannya meminta revisi. Hanya pemilik naskah yang masuk
// yang boleh memanggilnya; kepemilikan diperiksa ulang di fasad
// menurut email sesi, bukan menurut isian badan permintaan.

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ kode: string }> }
) {
  const dibatasi = await batasiLajuJurnal(req, "review-revisi", {
    perIp: { limit: 30, windowMs: 60 * 60 * 1000 }
  });
  if (dibatasi) return dibatasi;

  const { kode: kodeMentah } = await params;
  const kode = normalisasiKodeLacak(kodeMentah);
  if (!kode) {
    return NextResponse.json(
      { error: "Format kode lacak tidak sah." },
      { status: 400 }
    );
  }

  const sesi = await sesiJurnalDariRequest(req);
  if (!sesi) {
    return NextResponse.json(
      {
        error:
          "Unggah revisi memerlukan akun penulis. Silakan masuk terlebih dahulu."
      },
      { status: 401 }
    );
  }

  const { data: body, terlaluBesar } = await bacaJsonTerbatas(
    req,
    32 * 1024
  );
  if (terlaluBesar) return responsBadanTerlaluBesar();

  const bersih = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const berkas: JurnalBerkasMeta[] = [];
  if (Array.isArray(body?.berkas)) {
    for (const mentah of body.berkas as Record<string, unknown>[]) {
      const meta: JurnalBerkasMeta = {
        kategori: mentah?.kategori === "pendukung" ? "pendukung" : "utama",
        namaAsli: bersih(mentah?.namaAsli),
        mime: bersih(mentah?.mime),
        ukuran: typeof mentah?.ukuran === "number" ? mentah.ukuran : 0,
        bucket: bersih(mentah?.bucket),
        kunci: bersih(mentah?.kunci),
        mode: mentah?.mode === "r2" ? "r2" : "local"
      };
      const pesan = validasiBerkasMeta(meta);
      if (pesan) {
        return NextResponse.json({ error: pesan }, { status: 400 });
      }
      if (!meta.bucket || !meta.kunci) {
        return NextResponse.json(
          {
            error:
              "Metadata berkas tidak lengkap: unggah ulang berkas sampai server mencatat bucket dan kunci objeknya."
          },
          { status: 400 }
        );
      }
      if (meta.namaAsli.length > BATAS_TEKS.namaBerkas) {
        return NextResponse.json(
          { error: "Nama berkas terlalu panjang." },
          { status: 400 }
        );
      }
      const pesanVerifikasi = verifikasiMetaBerkasTersimpan(meta);
      if (pesanVerifikasi) {
        await catatPeristiwaKeamanan("unggah_ditolak", {
          ip: getClientIp(req),
          email: sesi.email,
          kode,
          rincian: `metadata-revisi:${pesanVerifikasi}`
        });
        return NextResponse.json(
          { error: pesanVerifikasi },
          { status: 400 }
        );
      }
      berkas.push(meta);
    }
  }
  if (!berkas.some((b) => b.kategori === "utama")) {
    return NextResponse.json(
      { error: "Berkas revisi utama wajib diunggah sebelum mendaftarkan revisi." },
      { status: 400 }
    );
  }
  if (
    berkas.filter((b) => b.kategori === "pendukung").length >
    BERKAS_PENDUKUNG_MAX_JUMLAH
  ) {
    return NextResponse.json(
      {
        error: `Berkas pendukung maksimal ${BERKAS_PENDUKUNG_MAX_JUMLAH} berkas.`
      },
      { status: 400 }
    );
  }

  try {
    const hasil = await daftarkanRevisi(kode, berkas, sesi.email);
    return NextResponse.json(hasil, { status: 201 });
  } catch (err) {
    const pesan =
      err instanceof Error ? err.message : "Gagal mendaftarkan revisi.";
    const status = /tidak ditemukan/i.test(pesan)
      ? 404
      : /bukan milik/i.test(pesan)
        ? 403
        : 400;
    if (status === 403) {
      await catatPeristiwaKeamanan("review_ditolak", {
        ip: getClientIp(req),
        email: sesi.email,
        kode,
        rincian: "revisi:bukan-pemilik"
      });
    }
    return NextResponse.json({ error: pesan }, { status });
  }
}

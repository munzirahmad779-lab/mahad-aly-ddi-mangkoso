import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "@/lib/rate-limit";
import { daftarkanGalley } from "@/lib/jurnal/alur-server";
import { sesiJurnalDariRequest, sesiPunyaPeran } from "@/lib/jurnal/sesi-server";
import { periksaMetaBerkasDariBody } from "@/lib/jurnal/berkas";
import { JURNAL_STAFF_ROLES } from "@/lib/jurnal/status";
import {
  bacaJsonTerbatas,
  batasiLajuJurnal,
  catatPeristiwaKeamanan,
  normalisasiKodeLacak,
  responsBadanTerlaluBesar
} from "@/lib/jurnal/keamanan";

// Mendaftarkan satu galley produksi, PDF atau HTML (Tahap 4).
// Berkasnya sudah diunggah lewat alur unggah yang ada dengan kategori
// "galley"; route ini memverifikasi metadatanya dan mengikatnya ke
// tugas produksi. Pemanggil: staf, atau layout editor yang ditugaskan
// pada tugas itu (diperiksa ulang di fasad menurut email sesi).

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ kode: string }> }
) {
  const dibatasi = await batasiLajuJurnal(req, "alur-produksi-galley", {
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
      { error: "Sesi jurnal tidak ditemukan. Silakan masuk ulang." },
      { status: 401 }
    );
  }
  const adalahStaf = sesiPunyaPeran(sesi, JURNAL_STAFF_ROLES);
  const adalahLayout = sesiPunyaPeran(sesi, ["layout_editor"]);
  if (!adalahStaf && !adalahLayout) {
    await catatPeristiwaKeamanan("review_ditolak", {
      ip: getClientIp(req),
      email: sesi.email,
      kode,
      rincian: "produksi-galley:peran"
    });
    return NextResponse.json(
      { error: "Aksi ini memerlukan peran staf atau layout editor." },
      { status: 403 }
    );
  }

  const { data: body, terlaluBesar } = await bacaJsonTerbatas(req, 16 * 1024);
  if (terlaluBesar) return responsBadanTerlaluBesar();
  const tugasId = typeof body?.tugasId === "string" ? body.tugasId : "";
  const jenis = body?.jenis === "html" ? "html" : body?.jenis === "pdf" ? "pdf" : null;
  if (!tugasId || !jenis) {
    return NextResponse.json(
      { error: "tugasId dan jenis galley ('pdf' atau 'html') wajib dikirim." },
      { status: 400 }
    );
  }
  const periksa = periksaMetaBerkasDariBody(
    (body?.berkas ?? null) as Record<string, unknown> | null
  );
  if ("galat" in periksa) {
    await catatPeristiwaKeamanan("unggah_ditolak", {
      ip: getClientIp(req),
      email: sesi.email,
      kode,
      rincian: `produksi-galley:${periksa.galat}`
    });
    return NextResponse.json({ error: periksa.galat }, { status: 400 });
  }
  // Jenis galley harus cocok dengan ekstensi berkasnya.
  const ekstensi = periksa.meta.namaAsli.toLowerCase();
  if (
    (jenis === "pdf" && !ekstensi.endsWith(".pdf")) ||
    (jenis === "html" && !ekstensi.endsWith(".html"))
  ) {
    return NextResponse.json(
      { error: "Jenis galley tidak cocok dengan ekstensi berkasnya." },
      { status: 400 }
    );
  }

  try {
    await daftarkanGalley(
      kode,
      tugasId,
      jenis,
      periksa.meta,
      { userId: sesi.userId, email: sesi.email },
      adalahStaf
    );
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    const pesan =
      err instanceof Error ? err.message : "Gagal mendaftarkan galley.";
    const status = /tidak ditemukan/i.test(pesan)
      ? 404
      : /Hanya layout editor/i.test(pesan)
        ? 403
        : 400;
    return NextResponse.json({ error: pesan }, { status });
  }
}

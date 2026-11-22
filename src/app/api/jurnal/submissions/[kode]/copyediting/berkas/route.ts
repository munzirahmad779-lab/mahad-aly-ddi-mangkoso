import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "@/lib/rate-limit";
import { daftarkanHasilCopyediting } from "@/lib/jurnal/alur-server";
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

// Mendaftarkan berkas hasil copyediting (Tahap 4). Berkasnya sudah
// diunggah lewat alur unggah yang ada (sign lalu PUT ke R2, atau
// cadangan uji lokal); route ini memverifikasi metadatanya dengan
// pemeriksa yang sama seperti wizard dan revisi, lalu mengikatnya ke
// tugas copyediting. Pemanggil: staf, atau copyeditor yang ditugaskan
// pada tugas itu (diperiksa ulang di fasad menurut email sesi).

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ kode: string }> }
) {
  const dibatasi = await batasiLajuJurnal(req, "alur-copy-berkas", {
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
  const adalahCopyeditor = sesiPunyaPeran(sesi, ["copyeditor"]);
  if (!adalahStaf && !adalahCopyeditor) {
    await catatPeristiwaKeamanan("review_ditolak", {
      ip: getClientIp(req),
      email: sesi.email,
      kode,
      rincian: "copyediting-berkas:peran"
    });
    return NextResponse.json(
      { error: "Aksi ini memerlukan peran staf atau copyeditor." },
      { status: 403 }
    );
  }

  const { data: body, terlaluBesar } = await bacaJsonTerbatas(req, 16 * 1024);
  if (terlaluBesar) return responsBadanTerlaluBesar();
  const tugasId = typeof body?.tugasId === "string" ? body.tugasId : "";
  if (!tugasId) {
    return NextResponse.json(
      { error: "tugasId wajib dikirim." },
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
      rincian: `copyediting-berkas:${periksa.galat}`
    });
    return NextResponse.json({ error: periksa.galat }, { status: 400 });
  }

  try {
    await daftarkanHasilCopyediting(
      kode,
      tugasId,
      periksa.meta,
      { userId: sesi.userId, email: sesi.email },
      adalahStaf
    );
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    const pesan =
      err instanceof Error ? err.message : "Gagal mendaftarkan hasil copyediting.";
    const status = /tidak ditemukan/i.test(pesan)
      ? 404
      : /Hanya copyeditor/i.test(pesan)
        ? 403
        : 400;
    return NextResponse.json({ error: pesan }, { status });
  }
}

import { NextRequest, NextResponse } from "next/server";
import {
  getJurnalDataMode,
  listSubmissionsByOwner
} from "@/lib/jurnal/store";
import { requireJurnalRole } from "@/lib/jurnal/auth";
import { emailDariHeaderLokal } from "@/lib/jurnal/sesi-lokal";
import { hasilReviewUntukPenulis } from "@/lib/jurnal/review-server";
import type { JurnalHasilReviewPenulis } from "@/lib/jurnal/review";
import { alurUntukPenulis } from "@/lib/jurnal/alur-server";
import type { JurnalAlurPenulisView } from "@/lib/jurnal/alur";
import { batasiLajuJurnal } from "@/lib/jurnal/keamanan";

// Daftar naskah milik penulis yang sedang masuk (halaman "Naskah Saya").
// Penulis hanya pernah menerima naskahnya sendiri:
// - Mode supabase: sesi Supabase Auth diverifikasi, daftar disaring
//   menurut submitter_user_id atau email pengirim akun itu.
// - Mode lokal: token sesi lokal diverifikasi, daftar disaring menurut
//   email pemilik token.

export const dynamic = "force-dynamic";

// Hasil review yang boleh dilihat penulis, dipetakan menurut kode
// lacak. Fasad review-server hanya mengembalikan putaran yang sudah
// diputuskan editor dan tidak memuat identitas reviewer sama sekali.
async function kumpulkanHasilReview(
  submissions: { kode: string }[]
): Promise<Record<string, JurnalHasilReviewPenulis[]>> {
  const peta: Record<string, JurnalHasilReviewPenulis[]> = {};
  for (const s of submissions) {
    const hasil = await hasilReviewUntukPenulis(s.kode);
    if (hasil.length > 0) peta[s.kode] = hasil;
  }
  return peta;
}

// Keadaan alur Tahap 4 yang perlu ditindaklanjuti penulis (persetujuan
// copyediting dan proofread galley), dipetakan menurut kode lacak.
// Hanya naskah yang punya tugas tahap yang masuk peta.
async function kumpulkanAlur(
  submissions: { kode: string }[]
): Promise<Record<string, JurnalAlurPenulisView>> {
  const peta: Record<string, JurnalAlurPenulisView> = {};
  for (const s of submissions) {
    const alur = await alurUntukPenulis(s.kode);
    if (alur.copyediting || alur.produksi) peta[s.kode] = alur;
  }
  return peta;
}

export async function GET(req: NextRequest) {
  const dibatasi = await batasiLajuJurnal(req, "naskah-saya", {
    perIp: { limit: 120, windowMs: 60 * 1000 }
  });
  if (dibatasi) return dibatasi;

  const mode = await getJurnalDataMode();
  try {
    if (mode === "supabase") {
      const auth = await requireJurnalRole(req);
      if (!auth.ok) return auth.response;
      const submissions = await listSubmissionsByOwner({
        email: auth.email.toLowerCase(),
        userId: auth.userId
      });
      return NextResponse.json({
        mode,
        viewer: { email: auth.email, roles: auth.roles },
        submissions,
        hasilReview: await kumpulkanHasilReview(submissions),
        alur: await kumpulkanAlur(submissions)
      });
    }

    const email = emailDariHeaderLokal(req);
    if (!email) {
      return NextResponse.json(
        { error: "Sesi penulis tidak ditemukan. Silakan masuk ulang." },
        { status: 401 }
      );
    }
    const submissions = await listSubmissionsByOwner({ email });
    return NextResponse.json({
      mode,
      viewer: { email, roles: ["author"] },
      submissions,
      hasilReview: await kumpulkanHasilReview(submissions),
      alur: await kumpulkanAlur(submissions)
    });
  } catch (err) {
    console.error(
      "GET /api/jurnal/naskah-saya gagal:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { error: "Gagal memuat naskah Anda." },
      { status: 500 }
    );
  }
}

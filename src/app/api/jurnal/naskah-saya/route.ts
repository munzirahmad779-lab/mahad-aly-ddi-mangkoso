import { NextRequest, NextResponse } from "next/server";
import {
  getJurnalDataMode,
  listSubmissionsByOwner
} from "@/lib/jurnal/store";
import { requireJurnalRole } from "@/lib/jurnal/auth";
import { emailDariHeaderLokal } from "@/lib/jurnal/sesi-lokal";

// Daftar naskah milik penulis yang sedang masuk (halaman "Naskah Saya").
// Penulis hanya pernah menerima naskahnya sendiri:
// - Mode supabase: sesi Supabase Auth diverifikasi, daftar disaring
//   menurut submitter_user_id atau email pengirim akun itu.
// - Mode lokal: token sesi lokal diverifikasi, daftar disaring menurut
//   email pemilik token.

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
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
        submissions
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
      submissions
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

import { NextRequest, NextResponse } from "next/server";
import {
  getSubmission,
  isJurnalAuthRequired,
  updateSubmissionStatus
} from "@/lib/jurnal/store";
import { requireJurnalRole } from "@/lib/jurnal/auth";
import {
  isJurnalStatus,
  JURNAL_STAFF_ROLES,
  JURNAL_STATUSES
} from "@/lib/jurnal/status";

// Satu naskah berdasarkan kode lacak JRN-YYYY-XXXX.
// GET dipakai halaman lacak (publik, kode lacak adalah kuncinya).
// PATCH dipakai panel redaksi untuk mengubah status mengikuti kosakata
// alur OJS; pada mode supabase wajib login berperan staf, pada mode
// lokal terbuka sebagai mode uji. Setiap perubahan menulis linimasa.

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ kode: string }> }
) {
  const { kode } = await params;
  try {
    const naskah = await getSubmission(decodeURIComponent(kode));
    if (!naskah) {
      return NextResponse.json(
        { error: "Kode lacak tidak ditemukan." },
        { status: 404 }
      );
    }
    return NextResponse.json({ submission: naskah });
  } catch (err) {
    console.error(
      "GET /api/jurnal/submissions/[kode] gagal:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { error: "Gagal membaca naskah." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ kode: string }> }
) {
  const { kode } = await params;
  const body = await req.json().catch(() => null);
  const status = (body as { status?: unknown } | null)?.status;
  const catatanMentah = (body as { catatan?: unknown } | null)?.catatan;
  const catatan =
    typeof catatanMentah === "string" && catatanMentah.trim()
      ? catatanMentah.trim()
      : null;

  if (!isJurnalStatus(status)) {
    return NextResponse.json(
      {
        error: `Status tidak dikenal. Pilihan sah: ${JURNAL_STATUSES.join(", ")}.`
      },
      { status: 400 }
    );
  }

  let actor: { userId?: string | null; label?: string | null } | undefined;
  if (await isJurnalAuthRequired()) {
    const auth = await requireJurnalRole(req, JURNAL_STAFF_ROLES);
    if (!auth.ok) return auth.response;
    actor = { userId: auth.userId, label: auth.email };
  }

  try {
    const naskah = await updateSubmissionStatus(
      decodeURIComponent(kode),
      status,
      actor,
      catatan
    );
    if (!naskah) {
      return NextResponse.json(
        { error: "Kode lacak tidak ditemukan." },
        { status: 404 }
      );
    }
    return NextResponse.json({ submission: naskah });
  } catch (err) {
    console.error(
      "PATCH /api/jurnal/submissions/[kode] gagal:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { error: "Gagal mengubah status naskah." },
      { status: 500 }
    );
  }
}

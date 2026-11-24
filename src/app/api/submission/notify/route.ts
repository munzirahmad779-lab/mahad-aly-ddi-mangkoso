import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireRole } from "@/lib/supabase/admin-guard";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";
import { sendStatusNotificationToAuthor } from "@/lib/email/service";
import { EmailTemplateItem } from "@/lib/types";

// Endpoint notifikasi status naskah: KHUSUS admin yang sedang masuk
// (super_admin / editor). Sebelumnya route ini publik tanpa autentikasi dan
// memercayai body.accessCode, sehingga siapa pun yang tahu UUID naskah dapat
// memicu email Kode Akses Tahap 2 berisi kode karangannya sendiri.
// Perbaikan ini satu paket dengan pemindahan bacaan ke supabaseAdmin:
// gerbang peran dipasang pada perubahan yang sama, tidak sesudahnya.
//
// Kode akses TIDAK PERNAH diambil dari body pemanggil. Satu-satunya sumber
// yang sah adalah metadata tersimpan di catatan_admin naskah (ditulis alur
// admin saat status diubah, sebelum endpoint ini dipanggil).

// Nilai status yang dikenal alur naskah (lihat Submission["status"] di
// src/lib/types.ts, termasuk varian lama "revisi"/"publish").
const VALID_STATUSES = new Set([
  "submitted",
  "review",
  "under_review",
  "revision",
  "revisi",
  "accepted",
  "rejected",
  "published",
  "publish"
]);

export async function POST(req: NextRequest) {
  // Batas laju lebih dulu, sebelum pekerjaan sesi/basis data apa pun.
  // checkRateLimit memakai penyimpanan bersama (RPC Supabase) dengan
  // cadangan in-memory bila RPC gagal.
  const rl = await checkRateLimit(`notify:${getClientIp(req)}`, 30, 60 * 1000);
  if (!rl.allowed) return rateLimitResponse(rl);

  // Gerbang sesi admin yang sah di sisi server (pola admin-guard yang sama
  // seperti route admin lain). Tanpa sesi: 401 sebelum data apa pun dibaca.
  const auth = await requireRole(req, ["super_admin", "editor"]);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const body = await req.json().catch(() => null);
    const { id, status, note, publishedArticleLink } = (body ?? {}) as {
      id?: unknown;
      status?: unknown;
      note?: unknown;
      publishedArticleLink?: unknown;
    };

    if (typeof id !== "string" || !id || typeof status !== "string" || !status) {
      return NextResponse.json(
        { error: "Parameter 'id' dan 'status' wajib diisi." },
        { status: 400 }
      );
    }
    if (!VALID_STATUSES.has(status)) {
      return NextResponse.json(
        { error: `Status "${status}" tidak dikenal.` },
        { status: 400 }
      );
    }
    const noteText = typeof note === "string" ? note : undefined;
    const publishedLink =
      typeof publishedArticleLink === "string" ? publishedArticleLink : undefined;

    // 1. Baca naskah memakai klien server (service role), BUKAN klien anon:
    // sesudah gerbang peran di atas, bacaan ini tidak lagi bergantung pada
    // lolos/tidaknya RLS untuk kunci publishable.
    const { data: subData, error: subError } = await supabaseAdmin
      .from("submissions")
      .select("*")
      .eq("id", id)
      .single();

    if (subError || !subData) {
      return NextResponse.json(
        { error: "Naskah tidak ditemukan di database." },
        { status: 404 }
      );
    }

    let extraMeta: any = {};
    if (subData.catatan_admin) {
      try {
        extraMeta = JSON.parse(subData.catatan_admin);
      } catch {
        extraMeta = { feedback: subData.catatan_admin };
      }
    }

    // Kode lacak HANYA dari metadata tersimpan. Bila tidak ada, email
    // menampilkan keterangan bahwa kode tidak tersedia; kode TIDAK PERNAH
    // dikarang dari potongan UUID (perilaku lama menyesatkan penulis
    // karena kode karangan itu tidak akan pernah cocok di halaman lacak).
    const trackingCode = extraMeta.trackingCode || "tidak tersedia";

    // 2. Ambil templat email kustom bila ada (juga lewat klien server)
    let customTemplates: EmailTemplateItem[] | undefined;
    const { data: tmplRow } = await supabaseAdmin
      .from("site_content")
      .select("value")
      .eq("key", "email_templates")
      .single();
    if (tmplRow?.value && Array.isArray(tmplRow.value)) {
      customTemplates = tmplRow.value;
    }

    // Kode akses HANYA dari metadata tersimpan. body.accessCode sengaja
    // tidak dibaca sama sekali.
    const accessCode = extraMeta.accessCode;

    // 3. Send email to author
    let emailResult: any;
    if (status === "accepted" && accessCode) {
      const { sendStage2AccessCodeEmail } = await import("@/lib/email/service");
      emailResult = await sendStage2AccessCodeEmail({
        authorEmail: subData.email,
        authorName: subData.nama,
        title: subData.judul,
        trackingCode,
        accessCode,
        customTemplates
      });
    } else {
      emailResult = await sendStatusNotificationToAuthor({
        authorEmail: subData.email,
        authorName: subData.nama,
        title: subData.judul,
        trackingCode,
        status: status as "revision" | "accepted" | "rejected" | "published",
        note: noteText || extraMeta.feedback || "",
        publishedArticleLink: publishedLink,
        customTemplates
      });
    }

    return NextResponse.json({
      success: true,
      emailResult
    });
  } catch (error: any) {
    console.error("Submission notify error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

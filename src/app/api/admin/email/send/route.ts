import { NextRequest, NextResponse } from "next/server";
import { sendRawEmail } from "@/lib/email/service";
import { requireSuperAdmin } from "@/lib/supabase/admin-guard";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  // Gerbang dinaikkan ke super_admin saja: route ini mengirim email HTML
  // bebas ke alamat mana pun dari pengirim resmi kampus, jadi peran
  // editor tidak lagi cukup (akun editor bocor dapat mengirim phishing
  // berkedok kampus tanpa jejak).
  const auth = await requireSuperAdmin(req);
  if (!auth.ok) {
    return auth.response;
  }

  // Batas laju per pemanggil sebagai lapis tambahan.
  const rl = await checkRateLimit(`admin-email-send:${auth.email || getClientIp(req)}`, 10, 60 * 1000);
  if (!rl.allowed) return rateLimitResponse(rl);

  try {
    const body = await req.json();
    const { to, subject, html, replyTo, submissionId } = body;

    if (!to || !subject || !html) {
      return NextResponse.json(
        { success: false, error: "Parameter 'to', 'subject', dan 'html' wajib diisi." },
        { status: 400 }
      );
    }

    const emailResult = await sendRawEmail({
      to,
      subject,
      html,
      replyTo
    });

    if (!emailResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: emailResult.error || "Gagal mengirim email via Resend API",
          submissionId
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: emailResult.data,
      resendId: (emailResult.data as any)?.id,
      submissionId
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error saat pengiriman email." },
      { status: 500 }
    );
  }
}

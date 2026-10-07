import { NextRequest, NextResponse } from "next/server";
import { sendRawEmail } from "@/lib/email/service";

export async function POST(req: NextRequest) {
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

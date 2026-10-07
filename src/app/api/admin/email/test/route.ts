import { NextRequest, NextResponse } from "next/server";
import { sendRawEmail } from "@/lib/email/service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const targetEmail = body?.to || process.env.ADMIN_NOTIFICATION_EMAIL || "munzirahmad779@gmail.com";

    const testTime = new Date().toLocaleString("id-ID", {
      timeZone: "Asia/Makassar",
      dateStyle: "full",
      timeStyle: "medium"
    });

    const customSubject = body?.subject;
    const customMessage = body?.message;

    const testSubject = customSubject || `[TEST RESEND API] Uji Coba Konfigurasi Email Ma'had Aly (${new Date().toLocaleTimeString("id-ID")})`;

    const htmlContent = customMessage
      ? `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #064e3b; color: #ffffff; padding: 24px; text-align: center;">
            <h2 style="margin: 0; font-family: Georgia, serif;">Ma'had Aly DDI Mangkoso</h2>
            <p style="margin: 6px 0 0; font-size: 13px; color: #a7f3d0;">Uji Koneksi Resend API</p>
          </div>
          <div style="padding: 24px; background: #ffffff;">
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 0; font-weight: bold; color: #166534; font-size: 15px;">✓ Pesan Uji Coba Kustom</p>
              <div style="margin: 8px 0 0; font-size: 14px; color: #15803d; white-space: pre-line;">${customMessage}</div>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="padding: 6px 0; color: #64748b; width: 140px;"><strong>Tujuan:</strong></td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: bold;">${targetEmail}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;"><strong>Waktu Kirim:</strong></td>
                <td style="padding: 6px 0; color: #0f172a;">${testTime} WITA</td>
              </tr>
            </table>
          </div>
        </div>
      `
      : `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #064e3b; color: #ffffff; padding: 24px; text-align: center;">
          <h2 style="margin: 0; font-family: Georgia, serif;">Ma'had Aly DDI Mangkoso</h2>
          <p style="margin: 6px 0 0; font-size: 13px; color: #a7f3d0;">Uji Koneksi Resend API Berhasil ✓</p>
        </div>
        <div style="padding: 24px; background: #ffffff;">
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0; font-weight: bold; color: #166534; font-size: 15px;">✓ Koneksi Resend API Aktif &amp; Terverifikasi</p>
            <p style="margin: 4px 0 0; font-size: 13px; color: #15803d;">Email ini adalah bukti otentik bahwa integrasi backend Resend pada website Ma'had Aly DDI Mangkoso berjalan normal.</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; width: 140px;"><strong>Tujuan:</strong></td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: bold;">${targetEmail}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;"><strong>Waktu Kirim:</strong></td>
              <td style="padding: 6px 0; color: #0f172a;">${testTime} WITA</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;"><strong>Environment:</strong></td>
              <td style="padding: 6px 0; color: #0f172a;">Production / Next.js Server</td>
            </tr>
          </table>

          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #64748b; text-align: center;">
            Jika email ini sampai di folder Promosi atau Spam, Anda dapat menandainya sebagai "Bukan Spam" (Not Spam) agar notifikasi naskah masuk langsung ke Inbox Utama.
          </div>
        </div>
      </div>
    `;

    const result = await sendRawEmail({
      to: targetEmail,
      subject: testSubject,
      html: htmlContent
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Gagal mengirim email tes ke Resend API"
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      to: targetEmail,
      resendId: (result.data as any)?.id,
      message: `Email uji coba berhasil dikirim ke ${targetEmail} via Resend API.`
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error saat uji email." },
      { status: 500 }
    );
  }
}

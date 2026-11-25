import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";
import { sendRawEmail } from "@/lib/email/service";
import { SUPER_ADMIN_EMAIL } from "@/lib/admin-constants";

export const dynamic = "force-dynamic";

// Saran dari panel Hari Guru masuk lewat route ini: disimpan ke tabel
// hari_guru_saran (pengunjung anonim tidak lagi menyisipkan langsung
// dari peramban), lalu diteruskan sebagai email pemberitahuan ke
// admin. Kegagalan email tidak menggagalkan pengiriman karena saran
// sudah tersimpan lebih dulu di basis data.

function escapeHtml(teks: string): string {
  return teks
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatWaktuWita(waktu: Date): string {
  const bagian = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Makassar",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(waktu);
  const ambil = (tipe: string) =>
    bagian.find((b) => b.type === tipe)?.value ?? "";
  return `${ambil("day")} ${ambil("month")} ${ambil("year")} pukul ${ambil("hour")}.${ambil("minute")} WITA`;
}

export async function POST(req: NextRequest) {
  // Rate limit: formulir publik, batasi kiriman beruntun dari satu IP
  const rl = await checkRateLimit(`saran:${getClientIp(req)}`, 10, 10 * 60 * 1000);
  if (!rl.allowed) return rateLimitResponse(rl);

  try {
    const body = await req.json().catch(() => ({}));
    const nama = typeof body.nama === "string" ? body.nama.trim() : "";
    const slugTulisan =
      typeof body.slug_tulisan === "string" ? body.slug_tulisan.trim() : "";
    const judulTulisan =
      typeof body.judul_tulisan === "string" ? body.judul_tulisan.trim() : "";
    const saran = typeof body.saran === "string" ? body.saran.trim() : "";

    if (
      nama.length < 1 ||
      nama.length > 100 ||
      slugTulisan.length < 1 ||
      slugTulisan.length > 200 ||
      judulTulisan.length < 1 ||
      judulTulisan.length > 300 ||
      saran.length < 5 ||
      saran.length > 2000
    ) {
      return NextResponse.json(
        { success: false, error: "Data saran tidak valid." },
        { status: 400 }
      );
    }

    // Simpan dulu ke basis data; email hanya pemberitahuan tambahan.
    const { error: insertError } = await supabaseAdmin
      .from("hari_guru_saran")
      .insert({
        nama,
        slug_tulisan: slugTulisan,
        judul_tulisan: judulTulisan,
        saran
      });

    if (insertError) {
      console.error("Gagal menyimpan saran Hari Guru:", insertError.message);
      return NextResponse.json(
        { success: false, error: "Gagal menyimpan saran." },
        { status: 500 }
      );
    }

    const waktu = formatWaktuWita(new Date());
    const tautan = `https://mahadaly-ddimangkoso.ac.id/berita/${slugTulisan}`;
    const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #064e3b; color: #ffffff; padding: 20px; text-align: center;">
        <h2 style="margin: 0; font-family: Georgia, serif;">Ma'had Aly DDI Mangkoso</h2>
        <p style="margin: 4px 0 0; font-size: 13px; color: #d1fae5;">Saran Baru dari Panel Hari Guru</p>
      </div>
      <div style="padding: 24px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; width: 90px;"><strong>Nama:</strong></td>
            <td style="padding: 6px 0; color: #0f172a;">${escapeHtml(nama)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;"><strong>Tulisan:</strong></td>
            <td style="padding: 6px 0; color: #0f172a;">${escapeHtml(judulTulisan)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;"><strong>Waktu:</strong></td>
            <td style="padding: 6px 0; color: #0f172a;">${escapeHtml(waktu)}</td>
          </tr>
        </table>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <h4 style="margin: 0 0 8px; font-size: 12px; text-transform: uppercase; color: #475569;">Isi Saran:</h4>
          <p style="margin: 0; font-size: 14px; color: #334155; white-space: pre-wrap;">${escapeHtml(saran)}</p>
        </div>
        <p style="font-size: 13px; color: #475569;">Baca tulisannya di: <a href="${escapeHtml(tautan)}" style="color: #064e3b; font-weight: bold;">${escapeHtml(tautan)}</a></p>
      </div>
      <div style="background-color: #f8fafc; padding: 14px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        Email otomatis dari Portal Resmi Ma'had Aly DDI Mangkoso
      </div>
    </div>
  `;

    try {
      const hasilEmail = await sendRawEmail({
        to: SUPER_ADMIN_EMAIL,
        subject: `Saran baru: ${judulTulisan}`,
        html
      });
      if (!hasilEmail.success) {
        console.error(
          "Saran tersimpan, tetapi email ke admin gagal:",
          hasilEmail.error
        );
      }
    } catch (err) {
      console.error("Saran tersimpan, tetapi email ke admin gagal:", err);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Gagal memproses saran Hari Guru:", err);
    return NextResponse.json(
      { success: false, error: "Gagal menyimpan saran." },
      { status: 500 }
    );
  }
}

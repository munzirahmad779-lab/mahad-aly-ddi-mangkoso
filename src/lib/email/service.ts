import { Resend } from "resend";
import { INITIAL_EMAIL_TEMPLATES } from "@/lib/mock-data";
import { EmailTemplateItem } from "@/lib/types";

const resendApiKey = process.env.RESEND_API_KEY;
const isResendConfigured = Boolean(resendApiKey && resendApiKey !== "ISI_DISINI" && resendApiKey.startsWith("re_"));
const resend = isResendConfigured ? new Resend(resendApiKey) : null;

const SENDER_EMAIL = process.env.SENDER_EMAIL || "Ma'had Aly DDI Mangkoso <onboarding@resend.dev>";
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "munzirahmad779@gmail.com";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function replaceVariables(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, val] of Object.entries(vars)) {
    result = result.replace(new RegExp(`{${key}}`, "g"), val || "");
  }
  return result;
}

export async function sendSubmissionEmailToAdmin({
  submission,
  fileBuffer,
  fileName,
  customTemplates
}: {
  submission: {
    trackingCode: string;
    nama: string;
    email: string;
    hp?: string;
    afiliasi?: string;
    tipeNaskah?: string;
    kategori?: string;
    judul: string;
    abstrak: string;
    keywords: string;
    fileSizeStr?: string;
  };
  fileBuffer: Buffer;
  fileName: string;
  customTemplates?: EmailTemplateItem[];
}) {
  const templates = customTemplates || INITIAL_EMAIL_TEMPLATES;
  const tmpl = templates.find((t) => t.id === "submission_admin") || INITIAL_EMAIL_TEMPLATES[0];

  const adminLink = `${SITE_URL}/admin`;
  const trackingLink = `${SITE_URL}/submission/track?kode=${submission.trackingCode}`;

  const vars = {
    nama: submission.nama,
    judul: submission.judul,
    kode: submission.trackingCode,
    catatan: `Tipe: ${submission.tipeNaskah || "Artikel"} | Kategori: ${submission.kategori} | Abstrak: ${submission.abstrak.slice(0, 150)}...`,
    link: adminLink
  };

  const subject = replaceVariables(tmpl.subject, vars);
  
  // Rich HTML body for Admin
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #064e3b; color: #ffffff; padding: 20px; text-align: center;">
        <h2 style="margin: 0; font-family: Georgia, serif;">Ma'had Aly DDI Mangkoso</h2>
        <p style="margin: 4px 0 0; font-size: 13px; color: #d1fae5;">Pemberitahuan Naskah Masuk Baru</p>
      </div>
      <div style="padding: 24px;">
        <div style="background: #f8fafc; border-left: 4px solid #059669; padding: 12px 16px; margin-bottom: 20px; border-radius: 0 8px 8px 0;">
          <span style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #059669; letter-spacing: 1px;">KODE PELACAKAN</span>
          <p style="font-size: 20px; font-weight: bold; color: #064e3b; margin: 2px 0 0; font-family: monospace;">${submission.trackingCode}</p>
        </div>

        <h3 style="color: #0f172a; margin-top: 0;">${submission.judul}</h3>
        
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; width: 140px;"><strong>Penulis:</strong></td>
            <td style="padding: 6px 0; color: #0f172a;">${submission.nama} (${submission.email})</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;"><strong>No. HP/WA:</strong></td>
            <td style="padding: 6px 0; color: #0f172a;">${submission.hp || "-"}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;"><strong>Afiliasi:</strong></td>
            <td style="padding: 6px 0; color: #0f172a;">${submission.afiliasi || "-"}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;"><strong>Tipe Naskah:</strong></td>
            <td style="padding: 6px 0; color: #0f172a;">${submission.tipeNaskah || "Artikel Ilmiah"}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;"><strong>Kategori:</strong></td>
            <td style="padding: 6px 0; color: #0f172a;">${submission.kategori}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;"><strong>Kata Kunci:</strong></td>
            <td style="padding: 6px 0; color: #0f172a;">${submission.keywords}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;"><strong>Lampiran File:</strong></td>
            <td style="padding: 6px 0; color: #059669; font-weight: bold;">📎 ${fileName} (${submission.fileSizeStr || "Word Document"})</td>
          </tr>
        </table>

        <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
          <h4 style="margin: 0 0 8px; font-size: 13px; text-transform: uppercase; color: #475569;">Abstrak Naskah:</h4>
          <p style="margin: 0; font-size: 13px; color: #334155; line-height: 1.6; white-space: pre-line;">${submission.abstrak}</p>
        </div>

        <div style="text-align: center; margin: 25px 0 10px;">
          <a href="${adminLink}" style="background-color: #064e3b; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">Buka Panel Review Redaksi</a>
        </div>
      </div>
      <div style="background-color: #f8fafc; padding: 14px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        Email otomatis dari Portal Resmi Ma'had Aly DDI Mangkoso
      </div>
    </div>
  `;

  if (!isResendConfigured || !resend) {
    const errMsg = "❌ Gagal: RESEND_API_KEY belum dikonfigurasi di .env.local (masih ISI_DISINI). Email naskah ke admin belum dapat dikirimkan.";
    console.error(errMsg);
    return { success: false, simulated: false, error: errMsg };
  }

  try {
    const data = await resend.emails.send({
      from: SENDER_EMAIL,
      to: [ADMIN_EMAIL],
      subject,
      html: htmlBody,
      attachments: [
        {
          filename: fileName,
          content: fileBuffer
        }
      ]
    });

    if ((data as any)?.error) {
      const apiErr = (data as any).error;
      const errMsg = `Resend API Error: ${apiErr.message || JSON.stringify(apiErr)}`;
      console.error(errMsg);
      return { success: false, error: errMsg };
    }

    return { success: true, data };
  } catch (err: any) {
    let errMsg = err.message || "Gagal mengirim email ke admin via Resend.";
    if (errMsg.includes("API key is invalid") || errMsg.includes("401")) {
      errMsg = "API key Resend tidak valid (401). Periksa kembali nilai RESEND_API_KEY di .env.local.";
    }
    console.error("Gagal mengirim email ke admin via Resend:", errMsg);
    return { success: false, error: errMsg };
  }
}

export async function sendConfirmationEmailToAuthor({
  authorEmail,
  authorName,
  title,
  trackingCode,
  customTemplates
}: {
  authorEmail: string;
  authorName: string;
  title: string;
  trackingCode: string;
  customTemplates?: EmailTemplateItem[];
}) {
  const templates = customTemplates || INITIAL_EMAIL_TEMPLATES;
  const tmpl = templates.find((t) => t.id === "confirmation_author") || INITIAL_EMAIL_TEMPLATES[1];

  const trackingLink = `${SITE_URL}/submission/track?kode=${trackingCode}`;

  const vars = {
    nama: authorName,
    judul: title,
    kode: trackingCode,
    catatan: "Naskah telah masuk ke sistem dan dilampirkan ke Dewan Redaksi.",
    link: trackingLink
  };

  const subject = replaceVariables(tmpl.subject, vars);
  const bodyHtml = replaceVariables(tmpl.body, vars);

  const finalHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #064e3b; color: #ffffff; padding: 20px; text-align: center;">
        <h2 style="margin: 0; font-family: Georgia, serif;">Ma'had Aly DDI Mangkoso</h2>
        <p style="margin: 4px 0 0; font-size: 13px; color: #d1fae5;">Pendidikan Tinggi Kader Ulama • Fiqh Mu'asarah</p>
      </div>
      <div style="padding: 24px;">
        ${bodyHtml}
      </div>
      <div style="background-color: #f8fafc; padding: 14px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        Pondok Pesantren DDI Mangkoso, Barru, Sulawesi Selatan • Website: ${SITE_URL}
      </div>
    </div>
  `;

  if (!isResendConfigured || !resend) {
    const errMsg = "⚠️ RESEND_API_KEY belum dikonfigurasi di .env.local (masih ISI_DISINI). Email konfirmasi ke penulis tidak dapat dikirim.";
    console.warn(errMsg);
    return { success: false, simulated: false, error: errMsg };
  }

  try {
    const data = await resend.emails.send({
      from: SENDER_EMAIL,
      to: [authorEmail],
      subject,
      html: finalHtml
    });

    if ((data as any)?.error) {
      const apiErr = (data as any).error;
      let errMsg = apiErr.message || JSON.stringify(apiErr);
      if (errMsg.includes("testing emails to your own email address") || errMsg.includes("403")) {
        errMsg = `Resend Domain Restriction: Domain default 'onboarding@resend.dev' hanya diizinkan mengirim ke email pemilik akun Resend. Untuk mengirim ke email penulis umum (${authorEmail}), domain web resmi perlu diverifikasi di resend.com.`;
      }
      console.warn("Resend API warning for author email:", errMsg);
      return { success: false, error: errMsg };
    }

    return { success: true, data };
  } catch (err: any) {
    let errMsg = err.message || "Gagal mengirim email konfirmasi penulis via Resend.";
    if (errMsg.includes("testing emails to your own email address") || errMsg.includes("403")) {
      errMsg = `Resend Domain Restriction: Domain default 'onboarding@resend.dev' hanya diizinkan mengirim ke email pemilik akun Resend. Untuk mengirim ke email penulis umum (${authorEmail}), domain web resmi perlu diverifikasi di resend.com.`;
    }
    console.error("Gagal mengirim email konfirmasi penulis via Resend:", errMsg);
    return { success: false, error: errMsg };
  }
}

export async function sendStatusNotificationToAuthor({
  authorEmail,
  authorName,
  title,
  trackingCode,
  status,
  note,
  publishedArticleLink,
  customTemplates
}: {
  authorEmail: string;
  authorName: string;
  title: string;
  trackingCode: string;
  status: "revision" | "accepted" | "rejected" | "published";
  note?: string;
  publishedArticleLink?: string;
  customTemplates?: EmailTemplateItem[];
}) {
  const templates = customTemplates || INITIAL_EMAIL_TEMPLATES;
  
  let templateId = "confirmation_author";
  if (status === "revision") templateId = "revision_author";
  else if (status === "accepted") templateId = "accepted_author";
  else if (status === "rejected") templateId = "rejected_author";
  else if (status === "published") templateId = "published_author";

  const tmpl = templates.find((t) => t.id === templateId) || INITIAL_EMAIL_TEMPLATES[1];

  const trackingLink = `${SITE_URL}/submission/track?kode=${trackingCode}`;
  const targetLink = status === "published" && publishedArticleLink ? publishedArticleLink : trackingLink;

  const vars = {
    nama: authorName,
    judul: title,
    kode: trackingCode,
    catatan: note || "Tidak ada catatan tambahan dari redaksi.",
    link: targetLink
  };

  const subject = replaceVariables(tmpl.subject, vars);
  const bodyHtml = replaceVariables(tmpl.body, vars);

  const finalHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #064e3b; color: #ffffff; padding: 20px; text-align: center;">
        <h2 style="margin: 0; font-family: Georgia, serif;">Ma'had Aly DDI Mangkoso</h2>
        <p style="margin: 4px 0 0; font-size: 13px; color: #d1fae5;">Pemberitahuan Status Naskah</p>
      </div>
      <div style="padding: 24px;">
        ${bodyHtml}
      </div>
      <div style="background-color: #f8fafc; padding: 14px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        Pondok Pesantren DDI Mangkoso, Barru, Sulawesi Selatan
      </div>
    </div>
  `;

  if (!isResendConfigured || !resend) {
    const errMsg = `⚠️ RESEND_API_KEY belum dikonfigurasi di .env.local (masih ISI_DISINI). Notifikasi status (${status}) tidak dapat dikirim via email.`;
    console.warn(errMsg);
    return { success: false, simulated: false, error: errMsg };
  }

  try {
    const data = await resend.emails.send({
      from: SENDER_EMAIL,
      to: [authorEmail],
      subject,
      html: finalHtml
    });

    if ((data as any)?.error) {
      const apiErr = (data as any).error;
      let errMsg = apiErr.message || JSON.stringify(apiErr);
      if (errMsg.includes("testing emails to your own email address") || errMsg.includes("403")) {
        errMsg = `Resend Domain Restriction: Domain default 'onboarding@resend.dev' hanya dapat mengirim ke email pemilik akun Resend. Untuk mengirim ke email penulis (${authorEmail}), domain web resmi perlu diverifikasi di resend.com.`;
      }
      return { success: false, error: errMsg };
    }

    return { success: true, data };
  } catch (err: any) {
    let errMsg = err.message || `Gagal mengirim email status (${status}) via Resend.`;
    if (errMsg.includes("testing emails to your own email address") || errMsg.includes("403")) {
      errMsg = `Resend Domain Restriction: Domain default 'onboarding@resend.dev' hanya dapat mengirim ke email pemilik akun Resend. Untuk mengirim ke email penulis (${authorEmail}), domain web resmi perlu diverifikasi di resend.com.`;
    }
    console.error(`Gagal mengirim email status (${status}) via Resend:`, errMsg);
    return { success: false, error: errMsg };
  }
}

export async function sendStage2AccessCodeEmail({
  authorEmail,
  authorName,
  title,
  trackingCode,
  accessCode,
  customTemplates
}: {
  authorEmail: string;
  authorName: string;
  title: string;
  trackingCode: string;
  accessCode: string;
  customTemplates?: EmailTemplateItem[];
}) {
  const templates = customTemplates || INITIAL_EMAIL_TEMPLATES;
  const tmpl = templates.find((t) => t.id === "submission_accepted" || t.id === "accepted_author") || INITIAL_EMAIL_TEMPLATES[3];

  const fullPaperLink = `${SITE_URL}/submission/full-paper`;

  const vars = {
    nama: authorName,
    judul: title,
    kode: accessCode,
    catatan: `Selamat! Abstrak Anda telah disetujui (ACC). Silakan lanjutkan pengisian Naskah Lengkap (Tahap 2) dengan Kode Akses: ${accessCode}`,
    link: fullPaperLink
  };

  const subject = `[ACC Tahap 2] Abstrak Disetujui — Kode Akses: ${accessCode}`;
  
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #064e3b; color: #ffffff; padding: 20px; text-align: center;">
        <h2 style="margin: 0; font-family: Georgia, serif;">Ma'had Aly DDI Mangkoso</h2>
        <p style="margin: 4px 0 0; font-size: 13px; color: #d1fae5;">Pemberitahuan Persetujuan Abstrak & Akses Tahap 2</p>
      </div>
      <div style="padding: 24px;">
        <p>Assalamu'alaikum Warahmatullahi Wabarakatuh,</p>
        <p>Yth. <strong>${authorName}</strong>,</p>
        <p>Alhamdulillah, abstrak naskah Anda yang berjudul: <em>"${title}"</em> (Kode Pelacakan: <code>${trackingCode}</code>) telah <strong>DISETUJUI (ACC)</strong> oleh Dewan Redaksi Ma'had Aly DDI Mangkoso.</p>
        
        <div style="background: #ecfdf5; border: 2px dashed #059669; padding: 16px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <span style="font-size: 12px; font-weight: bold; text-transform: uppercase; color: #047857; letter-spacing: 1px;">KODE AKSES TAHAP 2 (FULL PAPER)</span>
          <p style="font-size: 24px; font-weight: bold; color: #064e3b; margin: 6px 0; font-family: monospace; letter-spacing: 2px;">${accessCode}</p>
          <span style="font-size: 12px; color: #64748b;">Gunakan kode ini bersama Nama Anda untuk login di formulir Tahap 2</span>
        </div>

        <p>Silakan isi dan kirimkan Naskah Lengkap (Full Paper) Anda melalui tautan berikut:</p>
        <div style="text-align: center; margin: 25px 0;">
          <a href="${fullPaperLink}" style="background-color: #064e3b; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">Masuk ke Formulir Full Paper</a>
        </div>

        <p style="font-size: 13px; color: #64748b;">Tautan alternatif: <a href="${fullPaperLink}" style="color: #064e3b; font-weight: bold; text-decoration: underline;">Buka Formulir Full Paper di Peramban</a></p>
        <p>Wassalamu'alaikum Warahmatullahi Wabarakatuh,<br/><strong>Dewan Redaksi Ma'had Aly DDI Mangkoso</strong></p>
      </div>
      <div style="background-color: #f8fafc; padding: 14px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        Pondok Pesantren DDI Mangkoso, Barru, Sulawesi Selatan &bull; Portal Resmi Ma'had Aly DDI Mangkoso
      </div>
    </div>
  `;

  return sendRawEmail({
    to: authorEmail,
    subject,
    html: htmlBody
  });
}

export async function sendRawEmail({
  to,
  subject,
  html,
  replyTo
}: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}) {
  if (!isResendConfigured || !resend) {
    const errMsg = "❌ RESEND_API_KEY belum dikonfigurasi di .env.local.";
    console.error(errMsg);
    return { success: false, error: errMsg };
  }

  try {
    const data = await resend.emails.send({
      from: SENDER_EMAIL,
      to: [to],
      subject,
      html,
      replyTo: replyTo || ADMIN_EMAIL
    });

    if ((data as any)?.error) {
      const apiErr = (data as any).error;
      let errMsg = apiErr.message || JSON.stringify(apiErr);
      if (errMsg.includes("testing emails to your own email address") || errMsg.includes("403")) {
        errMsg = `Resend Domain Restriction: Domain default 'onboarding@resend.dev' hanya diizinkan mengirim ke email akun Resend (${ADMIN_EMAIL}). Untuk mengirim ke alamat email lain (${to}), domain web resmi perlu diverifikasi di resend.com.`;
      }
      return { success: false, error: errMsg };
    }

    return { success: true, data };
  } catch (err: any) {
    let errMsg = err.message || "Gagal mengirim email via Resend.";
    if (errMsg.includes("testing emails to your own email address") || errMsg.includes("403")) {
      errMsg = `Resend Domain Restriction: Domain default 'onboarding@resend.dev' hanya diizinkan mengirim ke email akun Resend (${ADMIN_EMAIL}). Untuk mengirim ke alamat email lain (${to}), domain web resmi perlu diverifikasi di resend.com.`;
    }
    console.error("Gagal mengirim raw email via Resend:", errMsg);
    return { success: false, error: errMsg };
  }
}


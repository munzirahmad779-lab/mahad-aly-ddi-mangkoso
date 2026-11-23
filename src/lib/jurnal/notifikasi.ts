// ─────────────────────────────────────────────────────────────────────────────
// Notifikasi email jurnal — SERVER ONLY (Tahap 6).
//
// Semua peristiwa alur editorial mengirim email lewat layanan email situs
// yang sudah terbukti (src/lib/email/service.ts, Resend, pengirim
// redaksi@mahadaly-ddimangkoso.ac.id):
// - naskah diterima        : ke penulis dan ke editor
// - reviewer ditugaskan    : ke reviewer, TANPA identitas penulis
// - review diserahkan      : ke editor
// - keputusan revisi       : ke penulis (komentar rahasia editor TIDAK ikut)
// - keputusan diterima     : ke penulis
// - keputusan ditolak      : ke penulis
// - persetujuan copyediting: ke penulis
// - permintaan proofread   : ke penulis
// - artikel diterbitkan    : ke penulis, memuat tautan artikel dan DOI
//
// Aturan keras:
// - Fungsi di berkas ini TIDAK PERNAH melempar galat. Kegagalan kirim
//   dicatat dan alur editorial tetap berjalan.
// - Setiap percobaan dicatat sebagai peristiwa linimasa naskah bertipe
//   "email" lewat catatPeristiwaNaskah (jenis peristiwa "email"), dengan
//   catatan yang aman dibaca penulis lewat lacak: tidak memuat alamat
//   email reviewer, komentar rahasia, atau identitas yang dilindungi
//   double-blind.
// - Mode lokal berjalan sebagai MODE CATAT SAJA (dry-run): tidak ada
//   panggilan Resend sama sekali; peristiwa dicatat dengan penanda
//   "mode uji, dicatat saja" supaya seluruh rantai bisa diuji tanpa
//   kredensial. Mode supabase mengirim sungguhan dan mencatat hasilnya.
// ─────────────────────────────────────────────────────────────────────────────

import { sendRawEmail } from "@/lib/email/service";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getJurnalDataMode, catatPeristiwaNaskah } from "./store";
import type { JurnalReviewDecision } from "./review";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const NAMA_JURNAL =
  "Turatsuna (Usulan Nama - Versi Uji) — Jurnal Ma'had Aly DDI Mangkoso";

function larikanHtml(v: string): string {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function badanEmail(judulSurat: string, isiHtml: string): string {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #064e3b; color: #ffffff; padding: 20px; text-align: center;">
        <h2 style="margin: 0; font-family: Georgia, serif;">${larikanHtml(NAMA_JURNAL)}</h2>
        <p style="margin: 4px 0 0; font-size: 13px; color: #d1fae5;">${larikanHtml(judulSurat)}</p>
      </div>
      <div style="padding: 24px;">
        ${isiHtml}
      </div>
      <div style="background-color: #f8fafc; padding: 14px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        Email otomatis dari sistem jurnal Ma'had Aly DDI Mangkoso. Balasan ke alamat ini diteruskan ke redaksi.
      </div>
    </div>
  `;
}

// Daftar email editor penerima pemberitahuan redaksi.
// Mode supabase: pengguna berperan journal_manager, editor, atau
// section_editor dari tabel jurnal_user_roles dan jurnal_users.
// Mode lokal: daftar staf uji dari env JURNAL_LOCAL_STAFF_EMAILS.
export async function emailEditorJurnal(): Promise<string[]> {
  try {
    const mode = await getJurnalDataMode();
    if (mode === "local") {
      return (process.env.JURNAL_LOCAL_STAFF_EMAILS || "")
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
    }
    const { data: peran, error: errPeran } = await supabaseAdmin
      .from("jurnal_user_roles")
      .select("user_id")
      .in("role", ["journal_manager", "editor", "section_editor"]);
    if (errPeran || !peran || peran.length === 0) return [];
    const ids = [...new Set(peran.map((r) => r.user_id as string))];
    const { data: pengguna, error: errPengguna } = await supabaseAdmin
      .from("jurnal_users")
      .select("email")
      .in("id", ids);
    if (errPengguna || !pengguna) return [];
    return pengguna
      .map((p) => String(p.email || "").trim().toLowerCase())
      .filter(Boolean);
  } catch {
    return [];
  }
}

interface SasaranEmail {
  ke: string;
  subjek: string;
  html: string;
}

// Inti pengiriman: dry-run pada mode lokal, kirim sungguhan pada mode
// supabase, selalu mencatat peristiwa linimasa, tidak pernah melempar.
async function kirimDanCatat(
  kode: string,
  labelPeristiwa: string,
  sasaran: SasaranEmail[]
): Promise<void> {
  try {
    if (sasaran.length === 0) {
      console.warn(
        `[jurnal-email] ${labelPeristiwa} untuk ${kode}: tidak ada penerima, dilewati.`
      );
      return;
    }
    const mode = await getJurnalDataMode();
    if (mode === "local") {
      console.log(
        `[jurnal-email] DRY-RUN ${labelPeristiwa} ${kode} -> ${sasaran.length} penerima (mode uji, tidak dikirim).`
      );
      await catatPeristiwaNaskah(
        kode,
        `Email ${labelPeristiwa} dicatat (mode uji, tidak dikirim sungguhan).`,
        { userId: null, label: "Sistem Email Jurnal" },
        "email"
      );
      return;
    }
    let sukses = 0;
    let gagal = 0;
    for (const s of sasaran) {
      try {
        const hasil = await sendRawEmail({
          to: s.ke,
          subject: s.subjek,
          html: s.html
        });
        if (hasil.success) sukses += 1;
        else gagal += 1;
      } catch {
        gagal += 1;
      }
    }
    await catatPeristiwaNaskah(
      kode,
      gagal === 0
        ? `Email ${labelPeristiwa} terkirim (${sukses} penerima).`
        : `Email ${labelPeristiwa} tercatat dengan kegagalan kirim (${sukses} terkirim, ${gagal} gagal); alur tetap berjalan.`,
      { userId: null, label: "Sistem Email Jurnal" },
      "email"
    );
  } catch (err) {
    // Pencatatan pun gagal: cukup log server, alur tidak boleh terganggu.
    console.error(
      `[jurnal-email] Gagal memproses ${labelPeristiwa} untuk ${kode}:`,
      err instanceof Error ? err.message : err
    );
  }
}

export interface KonteksNaskahEmail {
  kode: string;
  judul: string;
  penulis: string;
  email: string;
}

// 1. Naskah diterima: penulis menerima kode lacak, editor menerima
// pemberitahuan naskah baru.
export async function notifNaskahDiterima(n: KonteksNaskahEmail): Promise<void> {
  const tautanLacak = `${SITE_URL}/jurnal/lacak`;
  const sasaran: SasaranEmail[] = [
    {
      ke: n.email,
      subjek: `[${n.kode}] Naskah Anda telah diterima redaksi`,
      html: badanEmail(
        "Penerimaan Naskah",
        `<p>Assalamu'alaikum Warahmatullahi Wabarakatuh,</p>
         <p>Yth. <strong>${larikanHtml(n.penulis)}</strong>,</p>
         <p>Naskah Anda berjudul <em>"${larikanHtml(n.judul)}"</em> telah diterima sistem jurnal dan menunggu pemeriksaan awal redaksi.</p>
         <p>Kode lacak naskah Anda: <strong style="font-family: monospace;">${larikanHtml(n.kode)}</strong></p>
         <p>Kemajuan naskah dapat dipantau lewat halaman <a href="${tautanLacak}">Lacak Naskah</a> atau halaman Naskah Saya sesudah masuk.</p>
         <p>Wassalamu'alaikum Warahmatullahi Wabarakatuh,<br/><strong>Redaksi ${larikanHtml(NAMA_JURNAL)}</strong></p>`
      )
    }
  ];
  const editor = await emailEditorJurnal();
  for (const ke of editor) {
    if (ke === n.email.toLowerCase()) continue;
    sasaran.push({
      ke,
      subjek: `[${n.kode}] Naskah baru masuk: ${n.judul}`,
      html: badanEmail(
        "Naskah Baru Masuk",
        `<p>Naskah baru telah masuk dan menunggu pemeriksaan awal.</p>
         <table style="font-size: 14px;">
           <tr><td><strong>Kode</strong></td><td>: ${larikanHtml(n.kode)}</td></tr>
           <tr><td><strong>Judul</strong></td><td>: ${larikanHtml(n.judul)}</td></tr>
           <tr><td><strong>Penulis</strong></td><td>: ${larikanHtml(n.penulis)} (${larikanHtml(n.email)})</td></tr>
         </table>
         <p>Silakan periksa antrean pada Panel Redaksi jurnal.</p>`
      )
    });
  }
  await kirimDanCatat(n.kode, "penerimaan naskah", sasaran);
}

// 2. Reviewer ditugaskan: isi surat TIDAK memuat identitas penulis
// (tanpa nama, email, dan afiliasi penulis), sesuai double-blind.
export async function notifReviewerDitugaskan(input: {
  kode: string;
  judul: string;
  reviewerEmail: string;
  putaran: number;
  tenggatIso: string;
}): Promise<void> {
  const tenggat = new Date(input.tenggatIso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  await kirimDanCatat(input.kode, "undangan telaah ke reviewer", [
    {
      ke: input.reviewerEmail,
      subjek: `[${input.kode}] Undangan menelaah naskah (putaran ${input.putaran})`,
      html: badanEmail(
        "Undangan Telaah",
        `<p>Assalamu'alaikum Warahmatullahi Wabarakatuh,</p>
         <p>Redaksi mengundang Anda menelaah naskah berjudul <em>"${larikanHtml(input.judul)}"</em> (kode ${larikanHtml(input.kode)}, putaran ${input.putaran}).</p>
         <p>Sesuai asas double-blind, identitas penulis tidak dicantumkan dalam surat ini dan tidak tampil pada dasbor telaah Anda.</p>
         <p>Tenggat penyerahan telaah: <strong>${larikanHtml(tenggat)}</strong>.</p>
         <p>Silakan tanggapi undangan ini lewat Dasbor Reviewer pada laman jurnal.</p>
         <p>Wassalamu'alaikum Warahmatullahi Wabarakatuh,<br/><strong>Redaksi ${larikanHtml(NAMA_JURNAL)}</strong></p>`
      )
    }
  ]);
}

// 2b. Pengingat tenggat reviewer (Tahap Penutup Celah, butir S3).
// Dipanggil jalur terjadwal; tahap menentukan bunyi surat. Identitas
// penulis tidak pernah dicantumkan (double-blind).
export async function notifPengingatReviewer(input: {
  kode: string;
  judul: string;
  reviewerEmail: string;
  putaran: number;
  tenggatIso: string;
  tahap: "h7" | "h0" | "lewat";
}): Promise<void> {
  const tenggat = new Date(input.tenggatIso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  const pembuka =
    input.tahap === "h7"
      ? `Tenggat penyerahan telaah Anda untuk naskah berikut tinggal tujuh hari lagi, yaitu <strong>${larikanHtml(tenggat)}</strong>.`
      : input.tahap === "h0"
        ? `Hari ini adalah tenggat penyerahan telaah Anda untuk naskah berikut (<strong>${larikanHtml(tenggat)}</strong>).`
        : `Tenggat penyerahan telaah Anda untuk naskah berikut telah lewat tujuh hari (tenggat <strong>${larikanHtml(tenggat)}</strong>). Bila ada kendala, mohon kabari redaksi lewat Dasbor Reviewer.`;
  await kirimDanCatat(input.kode, `pengingat tenggat telaah (${input.tahap})`, [
    {
      ke: input.reviewerEmail,
      subjek: `[${input.kode}] Pengingat tenggat telaah putaran ${input.putaran}`,
      html: badanEmail(
        "Pengingat Tenggat Telaah",
        `<p>Assalamu'alaikum Warahmatullahi Wabarakatuh,</p>
         <p>${pembuka}</p>
         <p>Naskah: <em>"${larikanHtml(input.judul)}"</em> (kode ${larikanHtml(input.kode)}, putaran ${input.putaran}).</p>
         <p>Silakan serahkan telaah Anda lewat Dasbor Reviewer pada laman jurnal.</p>
         <p>Wassalamu'alaikum Warahmatullahi Wabarakatuh,<br/><strong>Redaksi ${larikanHtml(NAMA_JURNAL)}</strong></p>`
      )
    }
  ]);
}

// 3. Review diserahkan: ke editor. Identitas reviewer tidak dicantumkan,
// sejalan dengan catatan linimasa yang anonim.
export async function notifReviewDiserahkan(input: {
  kode: string;
  judul: string;
  putaran: number;
}): Promise<void> {
  const editor = await emailEditorJurnal();
  const sasaran: SasaranEmail[] = editor.map((ke) => ({
    ke,
    subjek: `[${input.kode}] Satu telaah putaran ${input.putaran} telah diserahkan`,
    html: badanEmail(
      "Telaah Diserahkan",
      `<p>Satu telaah untuk naskah <em>"${larikanHtml(input.judul)}"</em> (kode ${larikanHtml(input.kode)}, putaran ${input.putaran}) telah diserahkan reviewer dan menunggu keputusan editor pada panel redaksi.</p>`
    )
  }));
  await kirimDanCatat(input.kode, "pemberitahuan telaah diserahkan", sasaran);
}

// 4 sampai 6. Keputusan editor ke penulis. Komentar yang disertakan HANYA
// komentar untuk penulis dari reviewer; komentar rahasia untuk editor
// tidak pernah masuk surat ini.
export async function notifKeputusan(input: {
  naskah: KonteksNaskahEmail;
  keputusan: JurnalReviewDecision;
  catatan?: string | null;
  komentarUntukPenulis?: string[];
}): Promise<void> {
  const peta: Record<
    JurnalReviewDecision,
    { label: string; subjek: string; pembuka: string }
  > = {
    accept: {
      label: "keputusan diterima",
      subjek: `[${input.naskah.kode}] Naskah Anda diterima`,
      pembuka:
        "Alhamdulillah, naskah Anda dinyatakan <strong>diterima</strong> dan bergerak ke tahap penyuntingan (copyediting)."
    },
    minor_revisions: {
      label: "keputusan revisi",
      subjek: `[${input.naskah.kode}] Keputusan: revisi minor`,
      pembuka:
        "Redaksi memutuskan naskah Anda memerlukan <strong>revisi minor</strong>. Silakan perbaiki naskah mengikuti catatan di bawah ini lalu unggah berkas revisi lewat halaman Naskah Saya."
    },
    major_revisions: {
      label: "keputusan revisi",
      subjek: `[${input.naskah.kode}] Keputusan: revisi besar`,
      pembuka:
        "Redaksi memutuskan naskah Anda memerlukan <strong>revisi besar</strong>. Silakan perbaiki naskah mengikuti catatan di bawah ini lalu unggah berkas revisi lewat halaman Naskah Saya."
    },
    decline: {
      label: "keputusan ditolak",
      subjek: `[${input.naskah.kode}] Keputusan redaksi atas naskah Anda`,
      pembuka:
        "Dengan hormat kami sampaikan bahwa redaksi memutuskan naskah Anda <strong>belum dapat diterbitkan</strong> pada jurnal ini. Terima kasih atas kepercayaan Anda mengirimkan naskah kepada kami."
    }
  };
  const info = peta[input.keputusan];
  const komentar = (input.komentarUntukPenulis || []).filter(Boolean);
  const blokKomentar =
    komentar.length > 0
      ? `<div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin: 16px 0;">
           <h4 style="margin: 0 0 8px; font-size: 13px; text-transform: uppercase; color: #475569;">Catatan reviewer untuk penulis</h4>
           ${komentar
             .map(
               (k, i) =>
                 `<p style="margin: 0 0 10px; font-size: 14px; white-space: pre-line;"><strong>Reviewer ${i + 1}:</strong> ${larikanHtml(k)}</p>`
             )
             .join("")}
         </div>`
      : "";
  const blokCatatan = input.catatan?.trim()
    ? `<p><strong>Catatan editor:</strong> ${larikanHtml(input.catatan.trim())}</p>`
    : "";
  await kirimDanCatat(input.naskah.kode, info.label, [
    {
      ke: input.naskah.email,
      subjek: info.subjek,
      html: badanEmail(
        "Keputusan Redaksi",
        `<p>Assalamu'alaikum Warahmatullahi Wabarakatuh,</p>
         <p>Yth. <strong>${larikanHtml(input.naskah.penulis)}</strong>,</p>
         <p>${info.pembuka}</p>
         <p>Naskah: <em>"${larikanHtml(input.naskah.judul)}"</em> (kode ${larikanHtml(input.naskah.kode)}).</p>
         ${blokCatatan}
         ${blokKomentar}
         <p>Wassalamu'alaikum Warahmatullahi Wabarakatuh,<br/><strong>Redaksi ${larikanHtml(NAMA_JURNAL)}</strong></p>`
      )
    }
  ]);
}

// 7. Permintaan persetujuan hasil copyediting ke penulis.
export async function notifPersetujuanCopyediting(
  n: KonteksNaskahEmail
): Promise<void> {
  await kirimDanCatat(n.kode, "permintaan persetujuan copyediting", [
    {
      ke: n.email,
      subjek: `[${n.kode}] Hasil copyediting menunggu persetujuan Anda`,
      html: badanEmail(
        "Persetujuan Copyediting",
        `<p>Assalamu'alaikum Warahmatullahi Wabarakatuh,</p>
         <p>Yth. <strong>${larikanHtml(n.penulis)}</strong>,</p>
         <p>Hasil penyuntingan (copyediting) naskah <em>"${larikanHtml(n.judul)}"</em> (kode ${larikanHtml(n.kode)}) telah diunggah dan menunggu persetujuan Anda.</p>
         <p>Silakan periksa hasilnya lalu setujui atau sampaikan tanggapan lewat halaman Naskah Saya.</p>
         <p>Wassalamu'alaikum Warahmatullahi Wabarakatuh,<br/><strong>Redaksi ${larikanHtml(NAMA_JURNAL)}</strong></p>`
      )
    }
  ]);
}

// 8. Permintaan proofread galley ke penulis.
export async function notifPermintaanProofread(
  n: KonteksNaskahEmail
): Promise<void> {
  await kirimDanCatat(n.kode, "permintaan proofread galley", [
    {
      ke: n.email,
      subjek: `[${n.kode}] Galley menunggu proofread Anda`,
      html: badanEmail(
        "Proofread Galley",
        `<p>Assalamu'alaikum Warahmatullahi Wabarakatuh,</p>
         <p>Yth. <strong>${larikanHtml(n.penulis)}</strong>,</p>
         <p>Galley PDF dan HTML naskah <em>"${larikanHtml(n.judul)}"</em> (kode ${larikanHtml(n.kode)}) telah lengkap dan menunggu proofread akhir dari Anda sebelum naskah dinyatakan siap terbit.</p>
         <p>Silakan periksa galley lewat halaman Naskah Saya, lalu setujui atau sampaikan catatan koreksi di sana.</p>
         <p>Wassalamu'alaikum Warahmatullahi Wabarakatuh,<br/><strong>Redaksi ${larikanHtml(NAMA_JURNAL)}</strong></p>`
      )
    }
  ]);
}

// 9. Artikel diterbitkan: memuat tautan artikel dan DOI bila ada.
export async function notifArtikelTerbit(input: {
  naskah: KonteksNaskahEmail;
  slugArtikel: string;
  doi?: string | null;
}): Promise<void> {
  const tautan = `${SITE_URL}/jurnal/artikel/${input.slugArtikel}`;
  const blokDoi = input.doi
    ? `<p>DOI artikel: <a href="https://doi.org/${larikanHtml(input.doi)}">https://doi.org/${larikanHtml(input.doi)}</a></p>`
    : `<p>DOI artikel belum diterbitkan; halaman artikel akan memuatnya sesudah DOI didaftarkan redaksi.</p>`;
  await kirimDanCatat(input.naskah.kode, "pemberitahuan artikel terbit", [
    {
      ke: input.naskah.email,
      subjek: `[${input.naskah.kode}] Artikel Anda telah terbit`,
      html: badanEmail(
        "Artikel Terbit",
        `<p>Assalamu'alaikum Warahmatullahi Wabarakatuh,</p>
         <p>Yth. <strong>${larikanHtml(input.naskah.penulis)}</strong>,</p>
         <p>Alhamdulillah, artikel Anda <em>"${larikanHtml(input.naskah.judul)}"</em> (kode ${larikanHtml(input.naskah.kode)}) telah <strong>terbit</strong> dan dapat dibaca publik.</p>
         <p>Tautan artikel: <a href="${tautan}">${tautan}</a></p>
         ${blokDoi}
         <p>Terima kasih atas sumbangan keilmuan Anda.</p>
         <p>Wassalamu'alaikum Warahmatullahi Wabarakatuh,<br/><strong>Redaksi ${larikanHtml(NAMA_JURNAL)}</strong></p>`
      )
    }
  ]);
}

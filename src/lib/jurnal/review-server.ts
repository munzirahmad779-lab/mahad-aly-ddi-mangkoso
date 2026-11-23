// ─────────────────────────────────────────────────────────────────────────────
// Fasad mesin review jurnal — SERVER ONLY (Tahap 3).
//
// Aturan bisnis alur telaah OJS ditegakkan di sini, di atas backend
// lokal atau Supabase (dipilih fasad store menurut mode data):
// - Putaran dibuka editor; putaran pertama menggerakkan naskah dari
//   submitted ke review mengikuti tabel transisi Tahap Keamanan.
// - Keputusan editor mensyaratkan minimal 2 penugasan reviewer aktif
//   pada putaran itu; accept menutup putaran dan menggerakkan naskah ke
//   copyediting, decline menjadi declined, revisi menutup putaran dan
//   menunggu berkas revisi penulis sebelum putaran berikutnya dibuka.
// - Double-blind ditegakkan secara struktural: tampilan reviewer
//   dibangun dari ambilNaskahAnonim backend (kueri tanpa kolom identitas
//   penulis) dan daftar berkas yang disaring menurut putaran tanpa nama
//   berkas asli; tampilan hasil untuk penulis hanya memuat putaran yang
//   sudah diputuskan dan tidak memuat identitas reviewer sama sekali.
// - Setiap peristiwa dicatat ke linimasa naskah lewat fasad store;
//   catatan linimasa tidak pernah memuat identitas reviewer karena
//   linimasa terbaca penulis.
// ─────────────────────────────────────────────────────────────────────────────

import {
  catatPeristiwaNaskah,
  getJurnalDataMode,
  getSubmission,
  updateSubmissionStatus
} from "./store";
import { labelBagian, type JurnalBerkasMeta } from "./wizard";
import {
  JURNAL_ASSIGNMENT_STATUS_LABEL_ID,
  JURNAL_MIN_REVIEWER_KEPUTUSAN,
  JURNAL_RECOMMENDATION_LABEL_ID,
  JURNAL_REVIEW_DECISION_LABEL_ID,
  JURNAL_TENGGET_BAKU_HARI,
  type JurnalAssignmentReviewerView,
  type JurnalBerkasReviewerView,
  type JurnalBerkasStaffView,
  type JurnalHasilReviewPenulis,
  type JurnalRecommendation,
  type JurnalReviewDecision,
  type JurnalReviewerOption,
  type JurnalRoundStaffView
} from "./review";
import type {
  BerkasInternal,
  PenugasanInternal,
  ReviewBackend
} from "./review-internal";
import { reviewBackendLokal } from "./review-local";
import { reviewBackendSupabase } from "./review-supabase";
import {
  notifKeputusan,
  notifPengingatReviewer,
  notifReviewDiserahkan,
  notifReviewerDitugaskan
} from "./notifikasi";

async function backend(): Promise<ReviewBackend> {
  return (await getJurnalDataMode()) === "supabase"
    ? reviewBackendSupabase
    : reviewBackendLokal;
}

export interface PelakuReview {
  userId: string | null;
  email: string;
}

function labelPelaku(p: PelakuReview): { userId: string | null; label: string } {
  return { userId: p.userId, label: p.email };
}

// Berkas yang boleh dilihat penugasan pada putaran N: berkas pengiriman
// awal dan berkas pendukung, ditambah berkas revisi dari putaran yang
// lebih awal (revisi hasil keputusan putaran r ditelaah pada putaran
// r+1 dan sesudahnya).
function berkasTerlihatPadaPutaran(
  berkas: BerkasInternal[],
  putaran: number
): BerkasInternal[] {
  return berkas.filter(
    (b) =>
      b.tahap === "submission" ||
      b.tahap === "supplementary" ||
      (b.tahap === "review" && (b.putaran ?? 0) < putaran)
  );
}

function berkasKeTampilanReviewer(
  berkas: BerkasInternal[]
): JurnalBerkasReviewerView[] {
  // Nama berkas asli, bucket, dan kunci objek SENGAJA tidak disalin:
  // nama berkas bisa memuat nama penulis.
  return berkas.map((b) => ({
    id: b.id,
    tahap: b.tahap,
    kategori: b.kategori,
    mime: b.mime,
    ukuran: b.ukuran,
    putaran: b.putaran
  }));
}

function penugasanMilikReviewer(
  p: PenugasanInternal,
  reviewer: PelakuReview
): boolean {
  if (reviewer.userId && p.reviewerUserId) {
    return p.reviewerUserId === reviewer.userId;
  }
  return p.reviewerEmail.toLowerCase() === reviewer.email.toLowerCase();
}

// ── Staf: daftar reviewer dan keadaan review satu naskah ────────────────

export async function daftarReviewerTersedia(): Promise<
  JurnalReviewerOption[]
> {
  return (await backend()).daftarReviewer();
}

export interface KeadaanReviewStaf {
  putaranBerjalan: number | null; // nomor putaran terbuka, bila ada
  putaran: JurnalRoundStaffView[];
  berkas: JurnalBerkasStaffView[];
}

export async function keadaanReviewUntukStaf(
  kode: string
): Promise<KeadaanReviewStaf | null> {
  const b = await backend();
  const naskah = await getSubmission(kode);
  if (!naskah) return null;
  const [putaran, penugasan, berkas] = await Promise.all([
    b.ambilPutaran(kode),
    b.ambilPenugasanSemua(kode),
    b.ambilBerkasInternal(kode)
  ]);
  const terbuka = putaran.find((p) => p.status === "open");
  return {
    putaranBerjalan: terbuka ? terbuka.nomor : null,
    putaran: putaran.map((p) => ({
      nomor: p.nomor,
      status: p.status,
      keputusan: p.keputusan,
      keputusanLabel: p.keputusan
        ? JURNAL_REVIEW_DECISION_LABEL_ID[p.keputusan]
        : null,
      dibuatPada: p.dibuatPada,
      diputuskanPada: p.diputuskanPada,
      penugasan: penugasan
        .filter((a) => a.putaran === p.nomor)
        .map((a) => ({
          id: a.id,
          putaran: a.putaran,
          reviewerEmail: a.reviewerEmail,
          reviewerNama: a.reviewerNama,
          status: a.status,
          statusLabel: JURNAL_ASSIGNMENT_STATUS_LABEL_ID[a.status],
          ditugaskanPada: a.ditugaskanPada,
          tenggat: a.tenggat,
          rekomendasi: a.rekomendasi,
          rekomendasiLabel: a.rekomendasi
            ? JURNAL_RECOMMENDATION_LABEL_ID[a.rekomendasi]
            : null,
          komentarPenulis: a.komentarPenulis,
          komentarEditor: a.komentarEditor,
          diserahkanPada: a.diserahkanPada
        }))
    })),
    berkas: berkas.map((f) => ({
      id: f.id,
      tahap: f.tahap,
      kategori: f.kategori,
      namaAsli: f.namaAsli,
      mime: f.mime,
      ukuran: f.ukuran,
      putaran: f.putaran,
      diunggahPada: f.diunggahPada
    }))
  };
}

// ── Staf: buka putaran, tugaskan reviewer, putuskan ─────────────────────

export async function bukaPutaran(
  kode: string,
  actor: PelakuReview
): Promise<{ nomor: number }> {
  const b = await backend();
  const naskah = await getSubmission(kode);
  if (!naskah) throw new Error("Naskah tidak ditemukan.");
  const putaran = await b.ambilPutaran(kode);
  if (putaran.some((p) => p.status === "open")) {
    throw new Error(
      "Masih ada putaran telaah yang terbuka. Tutup putaran itu lewat keputusan editor sebelum membuka putaran baru."
    );
  }

  if (naskah.status === "submitted") {
    if (putaran.length > 0) {
      throw new Error("Keadaan putaran tidak konsisten dengan status naskah.");
    }
    await b.buatPutaran(kode, 1);
    await updateSubmissionStatus(kode, "review", labelPelaku(actor),
      "Putaran telaah 1 dibuka editor.");
    return { nomor: 1 };
  }

  if (naskah.status !== "review") {
    throw new Error(
      `Putaran telaah tidak dapat dibuka pada status "${naskah.status}".`
    );
  }

  const terakhir = putaran[putaran.length - 1];
  if (!terakhir) {
    await b.buatPutaran(kode, 1);
    await catatPeristiwaNaskah(
      kode,
      "Putaran telaah 1 dibuka editor.",
      labelPelaku(actor)
    );
    return { nomor: 1 };
  }
  if (
    terakhir.keputusan !== "minor_revisions" &&
    terakhir.keputusan !== "major_revisions"
  ) {
    throw new Error(
      "Putaran baru hanya dibuka sesudah keputusan revisi pada putaran sebelumnya."
    );
  }
  const berkas = await b.ambilBerkasInternal(kode);
  const adaRevisi = berkas.some(
    (f) => f.tahap === "review" && f.putaran === terakhir.nomor
  );
  if (!adaRevisi) {
    throw new Error(
      "Penulis belum mengunggah berkas revisi untuk putaran sebelumnya; putaran baru belum dapat dibuka."
    );
  }
  const nomor = terakhir.nomor + 1;
  await b.buatPutaran(kode, nomor);
  await catatPeristiwaNaskah(
    kode,
    `Putaran telaah ${nomor} dibuka editor.`,
    labelPelaku(actor)
  );
  return { nomor };
}

export async function tugaskanReviewer(
  kode: string,
  input: { reviewerEmail: string; tenggatHari?: number },
  actor: PelakuReview
): Promise<{ id: string; putaran: number }> {
  const b = await backend();
  const naskah = await getSubmission(kode);
  if (!naskah) throw new Error("Naskah tidak ditemukan.");
  const putaran = await b.ambilPutaran(kode);
  const terbuka = putaran.find((p) => p.status === "open");
  if (!terbuka) {
    throw new Error(
      "Belum ada putaran telaah yang terbuka. Buka putaran terlebih dahulu."
    );
  }
  const email = input.reviewerEmail.trim().toLowerCase();
  const tersedia = await b.daftarReviewer();
  const reviewer = tersedia.find((r) => r.email.toLowerCase() === email);
  if (!reviewer) {
    throw new Error(
      "Alamat itu belum terdaftar sebagai reviewer. Undang dulu lewat formulir undangan reviewer, atau pilih reviewer yang sudah terdaftar."
    );
  }
  if (email === naskah.email.toLowerCase()) {
    throw new Error("Penulis naskah tidak dapat ditugaskan menelaah naskahnya sendiri.");
  }
  const semua = await b.ambilPenugasanSemua(kode);
  const duplikat = semua.some(
    (a) =>
      a.putaran === terbuka.nomor &&
      a.reviewerEmail.toLowerCase() === email &&
      a.status !== "cancelled"
  );
  if (duplikat) {
    throw new Error("Reviewer ini sudah ditugaskan pada putaran yang sama.");
  }
  const hari =
    input.tenggatHari && input.tenggatHari > 0
      ? input.tenggatHari
      : JURNAL_TENGGET_BAKU_HARI;
  const tenggat = new Date(
    Date.now() + hari * 24 * 60 * 60 * 1000
  ).toISOString();
  const dibuat = await b.buatPenugasan({
    kode,
    putaran: terbuka.nomor,
    reviewer,
    tenggat,
    ditugaskanOleh: actor.userId
  });
  await catatPeristiwaNaskah(
    kode,
    `Reviewer ditugaskan untuk putaran ${terbuka.nomor} (tenggat ${hari} hari).`,
    labelPelaku(actor)
  );
  // Email undangan telaah (Tahap 6): tanpa identitas penulis, dan
  // kegagalannya tidak pernah menggagalkan penugasan.
  await notifReviewerDitugaskan({
    kode,
    judul: naskah.judul,
    reviewerEmail: email,
    putaran: terbuka.nomor,
    tenggatIso: tenggat
  });
  return { id: dibuat.id, putaran: terbuka.nomor };
}

export async function keputusanPutaran(
  kode: string,
  input: { keputusan: JurnalReviewDecision; catatan?: string | null },
  actor: PelakuReview
): Promise<{ putaran: number }> {
  const b = await backend();
  const naskah = await getSubmission(kode);
  if (!naskah) throw new Error("Naskah tidak ditemukan.");
  if (naskah.status !== "review") {
    throw new Error(
      `Keputusan telaah hanya dapat diambil pada status review (status sekarang: ${naskah.status}).`
    );
  }
  const putaran = await b.ambilPutaran(kode);
  const terbuka = putaran.find((p) => p.status === "open");
  if (!terbuka) {
    throw new Error("Tidak ada putaran telaah yang terbuka untuk diputuskan.");
  }
  const penugasan = await b.ambilPenugasanSemua(kode);
  const aktif = penugasan.filter(
    (a) =>
      a.putaran === terbuka.nomor &&
      a.status !== "cancelled" &&
      a.status !== "declined"
  );
  if (aktif.length < JURNAL_MIN_REVIEWER_KEPUTUSAN) {
    throw new Error(
      `Keputusan memerlukan minimal ${JURNAL_MIN_REVIEWER_KEPUTUSAN} reviewer aktif pada putaran ini (sekarang ${aktif.length}). Tugaskan reviewer tambahan terlebih dahulu.`
    );
  }

  await b.tutupPutaran(kode, terbuka.nomor, input.keputusan);
  const label = JURNAL_REVIEW_DECISION_LABEL_ID[input.keputusan];
  const catatan =
    input.catatan?.trim() ||
    `Keputusan putaran ${terbuka.nomor}: ${label}.`;

  if (input.keputusan === "accept") {
    await updateSubmissionStatus(
      kode,
      "copyediting",
      labelPelaku(actor),
      catatan
    );
  } else if (input.keputusan === "decline") {
    await updateSubmissionStatus(kode, "declined", labelPelaku(actor), catatan);
  } else {
    await catatPeristiwaNaskah(kode, catatan, labelPelaku(actor), "review_decision");
  }
  // Email keputusan ke penulis (Tahap 6). Yang disertakan hanya catatan
  // editor dari badan keputusan dan komentar reviewer UNTUK PENULIS;
  // komentar rahasia untuk editor tidak pernah ikut.
  const komentarUntukPenulis = penugasan
    .filter(
      (a) =>
        a.putaran === terbuka.nomor &&
        a.status === "completed" &&
        a.komentarPenulis
    )
    .map((a) => a.komentarPenulis as string);
  await notifKeputusan({
    naskah: {
      kode,
      judul: naskah.judul,
      penulis: naskah.penulis,
      email: naskah.email
    },
    keputusan: input.keputusan,
    catatan: input.catatan?.trim() || null,
    komentarUntukPenulis
  });
  return { putaran: terbuka.nomor };
}

// ── Reviewer: daftar, rincian, tanggapan, penyerahan ────────────────────

async function bangunTampilanReviewer(
  b: ReviewBackend,
  p: PenugasanInternal
): Promise<JurnalAssignmentReviewerView | null> {
  const anonim = await b.ambilNaskahAnonim(p.kode);
  if (!anonim) return null;
  const berkas = await b.ambilBerkasInternal(p.kode);
  return {
    id: p.id,
    kode: p.kode,
    putaran: p.putaran,
    status: p.status,
    statusLabel: JURNAL_ASSIGNMENT_STATUS_LABEL_ID[p.status],
    ditugaskanPada: p.ditugaskanPada,
    tenggat: p.tenggat,
    judul: anonim.judul,
    abstrak: anonim.abstrak,
    abstrakEn: anonim.abstrakEn,
    kataKunci: anonim.kataKunci,
    bagianLabel: labelBagian(anonim.bagianSlug),
    bahasa: anonim.bahasa,
    naskahDikirimPada: anonim.dibuatPada,
    berkas: berkasKeTampilanReviewer(
      berkasTerlihatPadaPutaran(berkas, p.putaran)
    ),
    rekomendasi: p.rekomendasi,
    rekomendasiLabel: p.rekomendasi
      ? JURNAL_RECOMMENDATION_LABEL_ID[p.rekomendasi]
      : null,
    komentarPenulis: p.komentarPenulis,
    komentarEditor: p.komentarEditor,
    diserahkanPada: p.diserahkanPada
  };
}

export async function daftarPenugasanReviewer(
  reviewer: PelakuReview
): Promise<JurnalAssignmentReviewerView[]> {
  const b = await backend();
  // Penyaringan kepemilikan terjadi di lapisan data backend (kueri
  // menurut reviewer yang masuk), dan tiap penugasan dibangun menjadi
  // tampilan anonim sebelum meninggalkan server.
  const milik = await b.daftarPenugasanReviewer(reviewer);
  const hasil: JurnalAssignmentReviewerView[] = [];
  for (const p of milik.sort((a, z) =>
    a.ditugaskanPada < z.ditugaskanPada ? 1 : -1
  )) {
    const tampilan = await bangunTampilanReviewer(b, p);
    if (tampilan) hasil.push(tampilan);
  }
  return hasil;
}

export async function rincianPenugasanReviewer(
  id: string,
  reviewer: PelakuReview
): Promise<JurnalAssignmentReviewerView | null> {
  const b = await backend();
  const p = await b.ambilPenugasanById(id);
  if (!p || !penugasanMilikReviewer(p, reviewer)) return null;
  return bangunTampilanReviewer(b, p);
}

export async function tanggapiPenugasan(
  id: string,
  terima: boolean,
  reviewer: PelakuReview
): Promise<void> {
  const b = await backend();
  const p = await b.ambilPenugasanById(id);
  if (!p || !penugasanMilikReviewer(p, reviewer)) {
    throw new Error("Penugasan tidak ditemukan.");
  }
  if (p.status !== "invited") {
    throw new Error("Undangan telaah ini sudah ditanggapi atau sudah selesai.");
  }
  await b.ubahPenugasan(id, { status: terima ? "accepted" : "declined" });
}

export async function serahkanReview(
  id: string,
  input: {
    rekomendasi: JurnalRecommendation;
    komentarPenulis?: string | null;
    komentarEditor?: string | null;
  },
  reviewer: PelakuReview
): Promise<void> {
  const b = await backend();
  const p = await b.ambilPenugasanById(id);
  if (!p || !penugasanMilikReviewer(p, reviewer)) {
    throw new Error("Penugasan tidak ditemukan.");
  }
  if (p.status === "completed") {
    throw new Error("Telaah untuk penugasan ini sudah diserahkan.");
  }
  if (p.status === "declined" || p.status === "cancelled") {
    throw new Error("Penugasan ini tidak aktif lagi.");
  }
  const putaran = await b.ambilPutaran(p.kode);
  const putaranIni = putaran.find((x) => x.nomor === p.putaran);
  if (!putaranIni || putaranIni.status !== "open") {
    throw new Error("Putaran telaah ini sudah ditutup editor.");
  }
  await b.ubahPenugasan(id, {
    status: "completed",
    rekomendasi: input.rekomendasi,
    komentarPenulis: input.komentarPenulis?.trim() || null,
    komentarEditor: input.komentarEditor?.trim() || null,
    diserahkanPada: new Date().toISOString()
  });
  await catatPeristiwaNaskah(
    p.kode,
    `Satu telaah putaran ${p.putaran} telah diserahkan reviewer.`,
    { userId: null, label: "Reviewer" },
    "review_submitted"
  );
  // Email ke editor bahwa satu telaah masuk (Tahap 6), tanpa identitas
  // reviewer di isi surat.
  const naskah = await getSubmission(p.kode);
  if (naskah) {
    await notifReviewDiserahkan({
      kode: p.kode,
      judul: naskah.judul,
      putaran: p.putaran
    });
  }
}

// Mengembalikan sasaran unduhan satu berkas untuk reviewer pemilik
// penugasan, atau null bila penugasan atau berkas tidak termasuk yang
// boleh ia lihat pada putarannya.
export async function berkasUntukUnduhanReviewer(
  id: string,
  berkasId: string,
  reviewer: PelakuReview
): Promise<{ bucket: string; kunci: string; mime: string; ekstensi: string } | null> {
  const b = await backend();
  const p = await b.ambilPenugasanById(id);
  if (!p || !penugasanMilikReviewer(p, reviewer)) return null;
  const berkas = await b.ambilBerkasInternal(p.kode);
  const terlihat = berkasTerlihatPadaPutaran(berkas, p.putaran);
  const target = terlihat.find((f) => f.id === berkasId);
  if (!target) return null;
  const titik = target.kunci.lastIndexOf(".");
  return {
    bucket: target.bucket,
    kunci: target.kunci,
    mime: target.mime,
    ekstensi: titik >= 0 ? target.kunci.slice(titik) : ""
  };
}

// ── Penulis: unggah revisi dan hasil review ─────────────────────────────

export async function daftarkanRevisi(
  kode: string,
  berkas: JurnalBerkasMeta[],
  ownerEmail: string
): Promise<{ putaran: number }> {
  const b = await backend();
  const naskah = await getSubmission(kode);
  if (!naskah) throw new Error("Naskah tidak ditemukan.");
  if (naskah.email.toLowerCase() !== ownerEmail.toLowerCase()) {
    throw new Error("Naskah ini bukan milik akun Anda.");
  }
  if (naskah.status !== "review") {
    throw new Error("Berkas revisi hanya diunggah saat naskah berstatus review.");
  }
  const putaran = await b.ambilPutaran(kode);
  if (putaran.some((p) => p.status === "open")) {
    throw new Error(
      "Putaran telaah sedang berjalan; revisi diunggah sesudah editor memutuskan revisi pada putaran yang berjalan."
    );
  }
  const terakhir = putaran[putaran.length - 1];
  if (
    !terakhir ||
    (terakhir.keputusan !== "minor_revisions" &&
      terakhir.keputusan !== "major_revisions")
  ) {
    throw new Error(
      "Belum ada keputusan revisi dari editor; berkas revisi belum dapat diunggah."
    );
  }
  if (!berkas.some((f) => f.kategori === "utama")) {
    throw new Error("Berkas revisi utama wajib diunggah.");
  }
  await b.simpanBerkasRevisi(kode, terakhir.nomor, berkas);
  await catatPeristiwaNaskah(
    kode,
    `Penulis mengunggah berkas revisi untuk putaran ${terakhir.nomor}.`,
    { userId: null, label: ownerEmail },
    "revision_uploaded"
  );
  return { putaran: terakhir.nomor };
}

export async function hasilReviewUntukPenulis(
  kode: string
): Promise<JurnalHasilReviewPenulis[]> {
  const b = await backend();
  const [putaran, penugasan] = await Promise.all([
    b.ambilPutaran(kode),
    b.ambilPenugasanSemua(kode)
  ]);
  const hasil: JurnalHasilReviewPenulis[] = [];
  for (const p of putaran) {
    // Gerbang keputusan: tanpa keputusan editor pada putaran itu,
    // penulis tidak menerima isi telaah apa pun.
    if (p.status !== "closed" || !p.keputusan) continue;
    const ulasan = penugasan
      .filter((a) => a.putaran === p.nomor && a.status === "completed")
      .sort((a, z) =>
        (a.diserahkanPada ?? "") < (z.diserahkanPada ?? "") ? -1 : 1
      )
      .map((a, i) => ({
        label: `Reviewer ${i + 1}`,
        rekomendasi: a.rekomendasi,
        rekomendasiLabel: a.rekomendasi
          ? JURNAL_RECOMMENDATION_LABEL_ID[a.rekomendasi]
          : null,
        komentar: a.komentarPenulis
      }));
    hasil.push({
      putaran: p.nomor,
      keputusan: p.keputusan,
      keputusanLabel: JURNAL_REVIEW_DECISION_LABEL_ID[p.keputusan],
      diputuskanPada: p.diputuskanPada,
      ulasan
    });
  }
  return hasil;
}

// ── Tahap Penutup Celah: pengingat tenggat reviewer terjadwal ───────────
// Dipanggil rute internal berpenjaga rahasia bersama (pemicu: Worker
// cron Cloudflare). Satu tahap terurgent yang belum terkirim per
// penugasan per larian; tahap dicatat sesudah surat dikirim agar
// larian berikutnya tidak mengulang (idempoten per tahap).
export type TahapPengingat = "h7" | "h0" | "lewat";

export async function jalankanPengingatReviewer(
  sekarang: Date = new Date()
): Promise<{ terkirim: { kode: string; tahap: TahapPengingat }[] }> {
  const b = await backend();
  const aktif = await b.daftarPenugasanAktifSemua();
  const terkirim: { kode: string; tahap: TahapPengingat }[] = [];
  for (const a of aktif) {
    if (!a.tenggat) continue;
    const sisaHari =
      (new Date(a.tenggat).getTime() - sekarang.getTime()) / 86400000;
    let tahap: TahapPengingat | null = null;
    if (sisaHari <= -7 && !a.pengingatLewatPada) tahap = "lewat";
    else if (sisaHari <= 0 && !a.pengingatH0Pada) tahap = "h0";
    else if (sisaHari <= 7 && !a.pengingatH7Pada) tahap = "h7";
    if (!tahap) continue;
    const naskah = await getSubmission(a.kode);
    await notifPengingatReviewer({
      kode: a.kode,
      judul: naskah?.judul ?? a.kode,
      reviewerEmail: a.reviewerEmail,
      putaran: a.putaran,
      tenggatIso: a.tenggat,
      tahap
    });
    await b.tandaiPengingat(a.id, tahap, sekarang.toISOString());
    terkirim.push({ kode: a.kode, tahap });
  }
  return { terkirim };
}

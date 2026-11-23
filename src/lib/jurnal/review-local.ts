// ─────────────────────────────────────────────────────────────────────────────
// Backend review MODE LOKAL — SERVER ONLY.
//
// Menyimpan putaran, penugasan, dan metadata berkas revisi di
// .jurnal-uji/review.json (lihat store-local.ts), akun reviewer dari
// daftar akun uji lokal, dan naskah dari catatan lokal. Fungsi khusus
// reviewer (ambilNaskahAnonim) membangun objek baru yang memang tidak
// memuat kolom identitas penulis; berkas untuk reviewer disaring fasad
// menurut putaran dari ambilBerkasInternal tanpa nama berkas asli.
// ─────────────────────────────────────────────────────────────────────────────

import { randomUUID } from "crypto";
import {
  ambilCatatanLokalByKode,
  daftarSemuaAkunLokal,
  muatDataReviewLokal,
  simpanDataReviewLokal,
  type BerkasRevisiLokal,
  type PenugasanReviewLokal
} from "./store-local";
import type { JurnalBerkasMeta } from "./wizard";
import type {
  JurnalAssignmentStatus,
  JurnalReviewDecision,
  JurnalReviewerOption
} from "./review";
import type {
  BerkasInternal,
  NaskahAnonimInternal,
  PenugasanInternal,
  PutaranInternal,
  ReviewBackend
} from "./review-internal";

function penugasanKeInternal(p: PenugasanReviewLokal): PenugasanInternal {
  return {
    id: p.id,
    kode: p.kode,
    putaran: p.putaran,
    reviewerUserId: null,
    reviewerEmail: p.reviewerEmail,
    reviewerNama: p.reviewerNama,
    status: p.status as JurnalAssignmentStatus,
    ditugaskanPada: p.ditugaskanPada,
    tenggat: p.tenggat,
    rekomendasi: (p.rekomendasi as PenugasanInternal["rekomendasi"]) ?? null,
    komentarPenulis: p.komentarPenulis,
    komentarEditor: p.komentarEditor,
    diserahkanPada: p.diserahkanPada
  };
}

export const reviewBackendLokal: ReviewBackend = {
  async daftarReviewer() {
    const akun = await daftarSemuaAkunLokal();
    return akun
      .filter((a) => a.peran.includes("reviewer"))
      .map<JurnalReviewerOption>((a) => ({
        userId: null,
        email: a.email,
        nama: a.nama,
        afiliasi: a.afiliasi
      }))
      .sort((a, b) => a.email.localeCompare(b.email));
  },

  async daftarPenugasanReviewer(reviewer) {
    const data = await muatDataReviewLokal();
    const email = reviewer.email.trim().toLowerCase();
    return data.penugasan
      .filter((p) => p.reviewerEmail.toLowerCase() === email)
      .map(penugasanKeInternal);
  },

  async ambilPutaran(kode) {
    const data = await muatDataReviewLokal();
    const daftar = data.putaran[kode.trim().toUpperCase()] ?? [];
    return daftar
      .map<PutaranInternal>((p) => ({
        nomor: p.nomor,
        status: p.status,
        keputusan: (p.keputusan as JurnalReviewDecision | null) ?? null,
        dibuatPada: p.dibuatPada,
        diputuskanPada: p.diputuskanPada
      }))
      .sort((a, b) => a.nomor - b.nomor);
  },

  async buatPutaran(kode, nomor) {
    const data = await muatDataReviewLokal();
    const kunci = kode.trim().toUpperCase();
    const daftar = data.putaran[kunci] ?? [];
    daftar.push({
      nomor,
      status: "open",
      keputusan: null,
      dibuatPada: new Date().toISOString(),
      diputuskanPada: null
    });
    data.putaran[kunci] = daftar;
    await simpanDataReviewLokal(data);
  },

  async tutupPutaran(kode, nomor, keputusan) {
    const data = await muatDataReviewLokal();
    const daftar = data.putaran[kode.trim().toUpperCase()] ?? [];
    const target = daftar.find((p) => p.nomor === nomor);
    if (!target) throw new Error("Putaran telaah tidak ditemukan.");
    target.status = "closed";
    target.keputusan = keputusan;
    target.diputuskanPada = new Date().toISOString();
    await simpanDataReviewLokal(data);
  },

  async ambilPenugasanSemua(kode) {
    const data = await muatDataReviewLokal();
    const target = kode.trim().toUpperCase();
    return data.penugasan
      .filter((p) => p.kode === target)
      .map(penugasanKeInternal)
      .sort((a, b) => (a.ditugaskanPada < b.ditugaskanPada ? -1 : 1));
  },

  async ambilPenugasanById(id) {
    const data = await muatDataReviewLokal();
    const target = data.penugasan.find((p) => p.id === id);
    return target ? penugasanKeInternal(target) : null;
  },

  async buatPenugasan({ kode, putaran, reviewer, tenggat }) {
    const data = await muatDataReviewLokal();
    const baru: PenugasanReviewLokal = {
      id: randomUUID(),
      kode: kode.trim().toUpperCase(),
      putaran,
      reviewerEmail: reviewer.email.toLowerCase(),
      reviewerNama: reviewer.nama,
      status: "invited",
      ditugaskanPada: new Date().toISOString(),
      tenggat,
      rekomendasi: null,
      komentarPenulis: null,
      komentarEditor: null,
      diserahkanPada: null
    };
    data.penugasan.push(baru);
    await simpanDataReviewLokal(data);
    return penugasanKeInternal(baru);
  },

  async ubahPenugasan(id, patch) {
    const data = await muatDataReviewLokal();
    const target = data.penugasan.find((p) => p.id === id);
    if (!target) throw new Error("Penugasan telaah tidak ditemukan.");
    if (patch.status !== undefined) target.status = patch.status;
    if (patch.rekomendasi !== undefined) {
      target.rekomendasi = patch.rekomendasi;
    }
    if (patch.komentarPenulis !== undefined) {
      target.komentarPenulis = patch.komentarPenulis;
    }
    if (patch.komentarEditor !== undefined) {
      target.komentarEditor = patch.komentarEditor;
    }
    if (patch.diserahkanPada !== undefined) {
      target.diserahkanPada = patch.diserahkanPada;
    }
    await simpanDataReviewLokal(data);
  },

  async ambilNaskahAnonim(kode) {
    const n = await ambilCatatanLokalByKode(kode);
    if (!n) return null;
    // Objek baru tanpa kolom identitas: nama, email, dan afiliasi
    // penulis serta penulis pendamping memang tidak disalin ke sini.
    const anonim: NaskahAnonimInternal = {
      kode: n.kode,
      judul: n.judul,
      abstrak: n.abstrak,
      abstrakEn: n.abstrakEn ?? "",
      kataKunci: n.kataKunci ?? [],
      bagianSlug: n.bagianSlug ?? null,
      bahasa: n.bahasa ?? "id",
      dibuatPada: n.dibuatPada
    };
    return anonim;
  },

  async ambilBerkasInternal(kode) {
    const target = kode.trim().toUpperCase();
    const n = await ambilCatatanLokalByKode(target);
    const data = await muatDataReviewLokal();
    const hasil: BerkasInternal[] = [];
    (n?.berkas ?? []).forEach((b, i) => {
      hasil.push({
        id: `asal-${i}`,
        tahap: b.kategori === "utama" ? "submission" : "supplementary",
        kategori: b.kategori === "utama" ? "utama" : "pendukung",
        namaAsli: b.namaAsli,
        mime: b.mime,
        ukuran: b.ukuran,
        bucket: b.bucket,
        kunci: b.kunci,
        putaran: null,
        diunggahPada: n?.dibuatPada ?? ""
      });
    });
    for (const b of data.berkasRevisi.filter((x) => x.kode === target)) {
      hasil.push({
        id: b.id,
        tahap: "review",
        kategori: b.kategori === "utama" ? "utama" : "pendukung",
        namaAsli: b.namaAsli,
        mime: b.mime,
        ukuran: b.ukuran,
        bucket: b.bucket,
        kunci: b.kunci,
        putaran: b.putaran,
        diunggahPada: b.diunggahPada
      });
    }
    return hasil;
  },

  async simpanBerkasRevisi(kode, putaran, berkas) {
    const data = await muatDataReviewLokal();
    const target = kode.trim().toUpperCase();
    const sekarang = new Date().toISOString();
    for (const b of berkas) {
      const baris: BerkasRevisiLokal = {
        id: randomUUID(),
        kode: target,
        putaran,
        kategori: b.kategori === "utama" ? "utama" : "pendukung",
        namaAsli: b.namaAsli,
        mime: b.mime,
        ukuran: b.ukuran,
        bucket: b.bucket,
        kunci: b.kunci,
        diunggahPada: sekarang
      };
      data.berkasRevisi.push(baris);
    }
    await simpanDataReviewLokal(data);
  }
};

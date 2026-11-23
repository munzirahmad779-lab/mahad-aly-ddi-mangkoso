// Tampilan asesor (Tahap Penutup Celah, gerbang M2 audit lanjutan
// 24 Nov 2026) — SERVER ONLY.
//
// Asesor ARJUNA harus dapat masuk dan memverifikasi proses editorial
// per naskah: penugasan reviewer, tenggat, ulasan yang diserahkan,
// keputusan, dan linimasa. Pada double-blind asesor TIDAK boleh
// melihat identitas penulis. Modul ini adalah satu-satunya jalur data
// asesor dan ia membangun objek baru yang memang tidak memuat nama,
// email, atau afiliasi penulis dan penulis pendamping, serta tidak
// memuat nama atau email reviewer (reviewer tampil sebagai label
// "Reviewer 1", "Reviewer 2", per putaran).

import { getSubmission, listSubmissions } from "./store";
import { keadaanReviewUntukStaf } from "./review-server";
import { keadaanAlurUntukStaf } from "./alur-server";
import { labelStatus } from "./status";

export interface PenugasanAsesorView {
  label: string;
  status: string;
  ditugaskanPada: string;
  tenggat: string | null;
  diserahkanPada: string | null;
  rekomendasi: string | null;
}

export interface PutaranAsesorView {
  nomor: number;
  status: string;
  keputusan: string | null;
  keputusanLabel: string | null;
  dibuatPada: string;
  diputuskanPada: string | null;
  penugasan: PenugasanAsesorView[];
}

export interface NaskahAsesorRingkasan {
  kode: string;
  judul: string;
  bagianLabel: string | null;
  status: string;
  statusLabel: string;
  dibuatPada: string;
  jumlahPutaran: number;
}

export interface NaskahAsesorRincian extends NaskahAsesorRingkasan {
  bahasa: string;
  kataKunci: string[];
  riwayat: { status: string; label: string; pada: string }[];
  putaran: PutaranAsesorView[];
  copyediting: { status: string; statusLabel: string } | null;
  produksi: {
    status: string;
    statusLabel: string;
    proofStatus: string;
    punyaPdf: boolean;
    punyaHtml: boolean;
  } | null;
}

export async function daftarNaskahAsesor(): Promise<NaskahAsesorRingkasan[]> {
  const semua = await listSubmissions();
  const hasil: NaskahAsesorRingkasan[] = [];
  for (const n of semua) {
    const keadaan = await keadaanReviewUntukStaf(n.kode);
    hasil.push({
      kode: n.kode,
      judul: n.judul,
      bagianLabel: n.bagianLabel ?? null,
      status: n.status,
      statusLabel: labelStatus(n.status),
      dibuatPada: n.dibuatPada,
      jumlahPutaran: keadaan?.putaran.length ?? 0
    });
  }
  return hasil;
}

export async function rincianNaskahAsesor(
  kode: string
): Promise<NaskahAsesorRincian | null> {
  const n = await getSubmission(kode);
  if (!n) return null;
  const [review, alur] = await Promise.all([
    keadaanReviewUntukStaf(n.kode),
    keadaanAlurUntukStaf(n.kode)
  ]);
  const putaran: PutaranAsesorView[] = (review?.putaran ?? []).map((p) => ({
    nomor: p.nomor,
    status: p.status,
    keputusan: p.keputusan,
    keputusanLabel: p.keputusanLabel,
    dibuatPada: p.dibuatPada,
    diputuskanPada: p.diputuskanPada,
    penugasan: [...p.penugasan]
      .sort((a, b) => (a.ditugaskanPada < b.ditugaskanPada ? -1 : 1))
      .map((a, i) => ({
        label: `Reviewer ${i + 1}`,
        status: a.status,
        ditugaskanPada: a.ditugaskanPada,
        tenggat: a.tenggat,
        diserahkanPada: a.diserahkanPada,
        rekomendasi: a.rekomendasi
      }))
  }));
  return {
    kode: n.kode,
    judul: n.judul,
    bagianLabel: n.bagianLabel ?? null,
    status: n.status,
    statusLabel: labelStatus(n.status),
    dibuatPada: n.dibuatPada,
    jumlahPutaran: putaran.length,
    bahasa: n.bahasa ?? "id",
    kataKunci: n.kataKunci ?? [],
    riwayat: n.riwayat.map((r) => ({
      status: r.status,
      label: r.label,
      pada: r.pada
    })),
    putaran,
    copyediting: (() => {
      const tugas = alur?.copyediting ?? [];
      const terakhir = tugas[tugas.length - 1];
      return terakhir
        ? { status: terakhir.status, statusLabel: terakhir.statusLabel }
        : null;
    })(),
    produksi: (() => {
      const tugas = alur?.produksi ?? [];
      const terakhir = tugas[tugas.length - 1];
      return terakhir
        ? {
            status: terakhir.status,
            statusLabel: terakhir.statusLabel,
            proofStatus: terakhir.proofStatus,
            punyaPdf: terakhir.galleyPdf !== null,
            punyaHtml: terakhir.galleyHtml !== null
          }
        : null;
    })()
  };
}

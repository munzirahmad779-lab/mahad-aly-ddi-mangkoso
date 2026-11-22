// ─────────────────────────────────────────────────────────────────────────────
// Konstanta dan tipe wizard kirim naskah jurnal — modul bersama klien dan
// server (jangan mengimpor modul server di sini).
//
// Isi mengikuti RANCANGAN-OJS-VERSI-KITA.md Tahap 2 dan
// SUSUNAN-ISI-JURNAL.md: tiga bagian jurnal dari penyemaian migrasi 004,
// daftar periksa pengiriman 6 butir, dan pernyataan pemakaian AI yang
// wajib. Batas berkas dinyatakan eksplisit di sini dan ditegakkan ulang
// di server (src/lib/jurnal/berkas.ts).
// ─────────────────────────────────────────────────────────────────────────────

export interface JurnalBagian {
  slug: string;
  judulId: string;
  judulEn: string;
  singkatan: string;
}

// Sama dengan penyemaian jurnal_sections pada migrasi 004.
export const JURNAL_BAGIAN: JurnalBagian[] = [
  {
    slug: "artikel-penelitian",
    judulId: "Artikel Penelitian",
    judulEn: "Research Articles",
    singkatan: "AP"
  },
  {
    slug: "kajian-pustaka-turats",
    judulId: "Kajian Pustaka dan Turats",
    judulEn: "Literature and Turats Studies",
    singkatan: "KPT"
  },
  {
    slug: "pemikiran-bahtsul-masail",
    judulId: "Pemikiran dan Bahtsul Masa'il",
    judulEn: "Thought and Bahtsul Masa'il",
    singkatan: "PBM"
  }
];

export function labelBagian(slug: string | null | undefined): string {
  if (!slug) return "";
  return JURNAL_BAGIAN.find((b) => b.slug === slug)?.judulId ?? slug;
}

// Daftar periksa pengiriman 6 butir (submission checklist). Semua wajib
// dicentang sebelum kirim selesai; disimpan sebagai JSON per naskah.
export const JURNAL_CHECKLIST = [
  {
    kunci: "orisinalitas",
    label:
      "Naskah ini adalah karya asli penulis, bukan hasil plagiarisme, dan penulis bertanggung jawab penuh atas isinya."
  },
  {
    kunci: "belum_terbit",
    label:
      "Naskah belum pernah diterbitkan dan tidak sedang diajukan ke jurnal atau penerbit lain."
  },
  {
    kunci: "abstrak_dua_bahasa",
    label:
      "Abstrak tersedia dalam dua bahasa: Bahasa Indonesia dan Bahasa Inggris."
  },
  {
    kunci: "gaya_chicago",
    label:
      "Sitasi dan daftar pustaka mengikuti gaya Chicago edisi ke-17 (catatan kaki dan daftar pustaka) sesuai pedoman penulisan Ma'had Aly."
  },
  {
    kunci: "pernyataan_ai",
    label:
      "Pemakaian AI (bila ada) telah dinyatakan dengan jujur pada langkah pernyataan AI; AI tidak dicantumkan sebagai penulis."
  },
  {
    kunci: "pustaka_terverifikasi",
    label:
      "Seluruh referensi dalam daftar pustaka telah diverifikasi keberadaannya dan ketepatan sitasinya."
  }
] as const;

export type JurnalChecklistKey = (typeof JURNAL_CHECKLIST)[number]["kunci"];

export type JurnalDaftarPeriksa = Record<JurnalChecklistKey, boolean>;

export function daftarPeriksaKosong(): JurnalDaftarPeriksa {
  return {
    orisinalitas: false,
    belum_terbit: false,
    abstrak_dua_bahasa: false,
    gaya_chicago: false,
    pernyataan_ai: false,
    pustaka_terverifikasi: false
  };
}

export function daftarPeriksaLengkap(d: Partial<JurnalDaftarPeriksa>): boolean {
  return JURNAL_CHECKLIST.every((item) => d?.[item.kunci] === true);
}

// Pernyataan pemakaian AI: dua bentuk terstruktur. "memakai" wajib
// disertai penjelasan bebas (alat apa, untuk apa).
export type JurnalAiMode = "tidak_memakai" | "memakai";

export interface JurnalPernyataanAi {
  mode: JurnalAiMode;
  teks: string; // penjelasan bebas; wajib terisi bila mode "memakai"
}

export function teksPernyataanAi(p: JurnalPernyataanAi): string {
  return p.mode === "tidak_memakai"
    ? "Penulis menyatakan tidak memakai AI dalam penulisan naskah ini."
    : `Penulis menyatakan memakai AI: ${p.teks.trim()}`;
}

// ── Berkas ────────────────────────────────────────────────────────────────
// Keputusan user: isi berkas TIDAK disimpan di basis data dan TIDAK di
// disk aplikasi. Yang disimpan hanya metadata dan kunci objek pada
// penyimpanan S3-compatible (Cloudflare R2). Batas di bawah ditegakkan
// di klien (kenyamanan) dan di server (kebenaran).

export type JurnalBerkasKategori = "utama" | "pendukung";

// Naskah utama: PDF atau DOCX, maksimal 20 MB per berkas.
export const BERKAS_UTAMA_EKSTENSI = [".pdf", ".docx"] as const;
export const BERKAS_UTAMA_MIME = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
] as const;
export const BERKAS_UTAMA_MAX_BYTES = 20 * 1024 * 1024; // 20 MB

// Berkas pendukung: PDF, DOCX, XLSX, atau ZIP, maksimal 20 MB per berkas,
// maksimal 5 berkas per pengiriman.
export const BERKAS_PENDUKUNG_EKSTENSI = [".pdf", ".docx", ".xlsx", ".zip"] as const;
export const BERKAS_PENDUKUNG_MAX_BYTES = 20 * 1024 * 1024; // 20 MB
export const BERKAS_PENDUKUNG_MAX_JUMLAH = 5;

export interface JurnalBerkasMeta {
  kategori: JurnalBerkasKategori;
  namaAsli: string;
  mime: string;
  ukuran: number;
  bucket: string;
  kunci: string;
  mode: "r2" | "local";
}

export function ekstensiBerkas(nama: string): string {
  const titik = nama.lastIndexOf(".");
  return titik >= 0 ? nama.slice(titik).toLowerCase() : "";
}

// Validasi satu berkas berdasarkan nama, mime, dan ukuran. Mengembalikan
// pesan galat Bahasa Indonesia, atau null bila sah. Dipakai klien dan
// server supaya aturannya tidak bercabang.
export function validasiBerkasMeta(input: {
  kategori: JurnalBerkasKategori;
  namaAsli: string;
  mime: string;
  ukuran: number;
}): string | null {
  const ekstensi = ekstensiBerkas(input.namaAsli);
  if (input.kategori === "utama") {
    if (!(BERKAS_UTAMA_EKSTENSI as readonly string[]).includes(ekstensi)) {
      return "Berkas naskah utama harus berformat PDF atau DOCX.";
    }
    if (input.ukuran > BERKAS_UTAMA_MAX_BYTES) {
      return "Berkas naskah utama melebihi batas 20 MB.";
    }
  } else {
    if (!(BERKAS_PENDUKUNG_EKSTENSI as readonly string[]).includes(ekstensi)) {
      return "Berkas pendukung harus berformat PDF, DOCX, XLSX, atau ZIP.";
    }
    if (input.ukuran > BERKAS_PENDUKUNG_MAX_BYTES) {
      return "Berkas pendukung melebihi batas 20 MB per berkas.";
    }
  }
  if (!input.ukuran || input.ukuran <= 0) {
    return "Berkas kosong tidak dapat diunggah.";
  }
  return null;
}

// ── Bentuk masukan wizard dan tampilan rinci ─────────────────────────────

export interface JurnalPenulisInput {
  nama: string;
  email: string;
  afiliasi: string;
  orcid?: string;
}

export interface JurnalWizardInput {
  bagianSlug: string;
  bahasa: "id" | "en" | "ar";
  daftarPeriksa: JurnalDaftarPeriksa;
  judul: string;
  abstrakId: string;
  abstrakEn: string;
  kataKunci: string[];
  penulisUtama: JurnalPenulisInput;
  penulisPendamping: JurnalPenulisInput[];
  berkas: JurnalBerkasMeta[];
  pernyataanAi: JurnalPernyataanAi;
}

// Teks persetujuan (consent) pendaftaran akun penulis. Versi dinyatakan
// supaya perubahan bunyi persetujuan kelak bisa dilacak.
export const JURNAL_CONSENT_VERSI = "2026-11-23";
export const JURNAL_CONSENT_TEKS =
  "Saya menyetujui pembuatan akun penulis pada jurnal ini, menyetujui data yang saya berikan (nama, email, afiliasi, dan ORCID bila diisi) disimpan untuk keperluan proses editorial, dan menyatakan data tersebut benar. Saya juga menyetujui kebijakan etika publikasi jurnal, termasuk kewajiban menyatakan pemakaian AI dan larangan mengajukan naskah yang sama ke jurnal lain secara bersamaan.";

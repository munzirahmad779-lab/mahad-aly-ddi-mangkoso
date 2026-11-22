import { NextRequest, NextResponse } from "next/server";
import {
  createSubmission,
  createSubmissionLengkap,
  getJurnalDataMode,
  listSubmissions
} from "@/lib/jurnal/store";
import { requireJurnalRole } from "@/lib/jurnal/auth";
import { emailDariHeaderLokal } from "@/lib/jurnal/sesi-lokal";
import { JURNAL_STAFF_ROLES, labelStatus } from "@/lib/jurnal/status";
import {
  BERKAS_PENDUKUNG_MAX_JUMLAH,
  JURNAL_BAGIAN,
  daftarPeriksaLengkap,
  validasiBerkasMeta,
  type JurnalBerkasMeta,
  type JurnalWizardInput
} from "@/lib/jurnal/wizard";

// API naskah jurnal "OJS versi kita" (Tahap 1).
// Lapisan data dipilih fasad src/lib/jurnal/store.ts: tabel jurnal_*
// Supabase bila migrasi 004 sudah dijalankan dan env tersedia, selain itu
// data uji lokal. POST bersifat publik (pintu kirim naskah). GET daftar
// adalah antrean panel: pada mode supabase wajib login berperan staf;
// pada mode lokal terbuka sebagai mode uji.

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const mode = await getJurnalDataMode();
  let viewer: { email: string; roles: string[] } | null = null;

  if (mode === "supabase") {
    const auth = await requireJurnalRole(req, JURNAL_STAFF_ROLES);
    if (!auth.ok) return auth.response;
    viewer = { email: auth.email, roles: auth.roles };
  }

  try {
    const data = await listSubmissions();
    return NextResponse.json({
      mode,
      authRequired: mode === "supabase",
      viewer,
      submissions: data
    });
  } catch (err) {
    console.error(
      "GET /api/jurnal/submissions gagal:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { error: "Gagal memuat daftar naskah jurnal." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  // Muatan wizard Tahap 2 dikenali dari adanya bagianSlug. Jalur lama
  // (formulir satu halaman versi uji) tetap dilayani di bawah.
  if (body && typeof body === "object" && "bagianSlug" in body) {
    return tanganiWizard(req, body as Record<string, unknown>);
  }

  const { judul, penulis, email, afiliasi, abstrak } = (body ?? {}) as {
    judul?: unknown;
    penulis?: unknown;
    email?: unknown;
    afiliasi?: unknown;
    abstrak?: unknown;
  };

  const bersih = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const data = {
    judul: bersih(judul),
    penulis: bersih(penulis),
    email: bersih(email),
    afiliasi: bersih(afiliasi),
    abstrak: bersih(abstrak)
  };

  if (!data.judul || !data.penulis || !data.email || !data.afiliasi || !data.abstrak) {
    return NextResponse.json(
      { error: "Semua kolom (judul, penulis, email, afiliasi, abstrak) wajib diisi." },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return NextResponse.json(
      { error: "Format email tidak sah." },
      { status: 400 }
    );
  }
  if (data.abstrak.length < 50) {
    return NextResponse.json(
      { error: "Abstrak terlalu pendek (minimal 50 karakter)." },
      { status: 400 }
    );
  }

  try {
    const naskah = await createSubmission(data);
    return NextResponse.json(
      {
        kode: naskah.kode,
        status: naskah.status,
        statusLabel: labelStatus(naskah.status),
        dibuatPada: naskah.dibuatPada
      },
      { status: 201 }
    );
  } catch (err) {
    console.error(
      "POST /api/jurnal/submissions gagal:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { error: "Pengiriman naskah gagal disimpan. Coba lagi." },
      { status: 500 }
    );
  }
}

// ── Penanganan muatan wizard (Tahap 2) ────────────────────────────────────
// Kirim lewat wizard memerlukan akun penulis (seperti OJS: pengiriman
// selalu atas nama akun). Identitas pengirim diambil dari sesi, bukan
// dari isian formulir: mode supabase memakai sesi Supabase Auth, mode
// lokal memakai token sesi lokal. Email penulis utama diselaraskan ke
// email akun pengirim supaya halaman "Naskah Saya" selalu menemukan
// naskahnya.

async function tanganiWizard(
  req: NextRequest,
  body: Record<string, unknown>
): Promise<NextResponse> {
  const mode = await getJurnalDataMode();
  let submitterUserId: string | null = null;
  let emailPengirim = "";

  if (mode === "supabase") {
    const auth = await requireJurnalRole(req);
    if (!auth.ok) return auth.response;
    submitterUserId = auth.userId;
    emailPengirim = auth.email.toLowerCase();
  } else {
    const email = emailDariHeaderLokal(req);
    if (!email) {
      return NextResponse.json(
        {
          error:
            "Kirim naskah lewat wizard memerlukan akun penulis. Silakan masuk atau daftar terlebih dahulu."
        },
        { status: 401 }
      );
    }
    emailPengirim = email;
  }

  const bersih = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const galat = (pesan: string) =>
    NextResponse.json({ error: pesan }, { status: 400 });

  const bagianSlug = bersih(body.bagianSlug);
  if (!JURNAL_BAGIAN.some((b) => b.slug === bagianSlug)) {
    return galat("Bagian jurnal tidak dikenal. Pilih salah satu dari tiga bagian.");
  }
  const bahasaMentah = bersih(body.bahasa);
  const bahasa = (["id", "en", "ar"].includes(bahasaMentah)
    ? bahasaMentah
    : "id") as JurnalWizardInput["bahasa"];

  const daftarPeriksa = (body.daftarPeriksa ?? {}) as JurnalWizardInput["daftarPeriksa"];
  if (!daftarPeriksaLengkap(daftarPeriksa)) {
    return galat(
      "Daftar periksa pengiriman belum lengkap: keenam butir wajib dicentang."
    );
  }

  const judul = bersih(body.judul);
  const abstrakId = bersih(body.abstrakId);
  const abstrakEn = bersih(body.abstrakEn);
  if (!judul) return galat("Judul naskah wajib diisi.");
  if (abstrakId.length < 50) {
    return galat("Abstrak Bahasa Indonesia terlalu pendek (minimal 50 karakter).");
  }
  if (abstrakEn.length < 30) {
    return galat("Abstrak Bahasa Inggris wajib diisi (minimal 30 karakter).");
  }
  const kataKunci = Array.isArray(body.kataKunci)
    ? (body.kataKunci as unknown[])
        .map((k) => bersih(k))
        .filter(Boolean)
        .slice(0, 10)
    : [];
  if (kataKunci.length === 0) {
    return galat("Kata kunci wajib diisi, minimal satu.");
  }

  const pu = (body.penulisUtama ?? {}) as Record<string, unknown>;
  const penulisUtama = {
    nama: bersih(pu.nama),
    email: emailPengirim, // pengirim adalah akun yang masuk
    afiliasi: bersih(pu.afiliasi),
    orcid: bersih(pu.orcid) || undefined
  };
  if (!penulisUtama.nama || !penulisUtama.afiliasi) {
    return galat("Nama dan afiliasi penulis utama wajib diisi.");
  }

  const penulisPendamping: JurnalWizardInput["penulisPendamping"] = [];
  if (Array.isArray(body.penulisPendamping)) {
    for (const mentah of body.penulisPendamping as Record<string, unknown>[]) {
      const p = {
        nama: bersih(mentah?.nama),
        email: bersih(mentah?.email).toLowerCase(),
        afiliasi: bersih(mentah?.afiliasi),
        orcid: bersih(mentah?.orcid) || undefined
      };
      if (!p.nama || !p.afiliasi || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) {
        return galat(
          "Setiap penulis pendamping wajib memiliki nama, email yang sah, dan afiliasi."
        );
      }
      penulisPendamping.push(p);
    }
  }
  if (penulisPendamping.length > 10) {
    return galat("Penulis pendamping maksimal 10 orang.");
  }

  const berkas: JurnalBerkasMeta[] = [];
  if (Array.isArray(body.berkas)) {
    for (const mentah of body.berkas as Record<string, unknown>[]) {
      const meta: JurnalBerkasMeta = {
        kategori: mentah?.kategori === "pendukung" ? "pendukung" : "utama",
        namaAsli: bersih(mentah?.namaAsli),
        mime: bersih(mentah?.mime),
        ukuran: typeof mentah?.ukuran === "number" ? mentah.ukuran : 0,
        bucket: bersih(mentah?.bucket),
        kunci: bersih(mentah?.kunci),
        mode: mentah?.mode === "r2" ? "r2" : "local"
      };
      const pesan = validasiBerkasMeta(meta);
      if (pesan) return galat(pesan);
      if (!meta.bucket || !meta.kunci) {
        return galat(
          "Metadata berkas tidak lengkap: unggah ulang berkas sampai server mencatat bucket dan kunci objeknya."
        );
      }
      berkas.push(meta);
    }
  }
  if (!berkas.some((b) => b.kategori === "utama")) {
    return galat("Berkas naskah utama wajib diunggah sebelum mengirim.");
  }
  if (berkas.filter((b) => b.kategori === "pendukung").length > BERKAS_PENDUKUNG_MAX_JUMLAH) {
    return galat(
      `Berkas pendukung maksimal ${BERKAS_PENDUKUNG_MAX_JUMLAH} berkas.`
    );
  }

  const ai = (body.pernyataanAi ?? {}) as Record<string, unknown>;
  const modeAi = ai.mode === "memakai" ? "memakai" : "tidak_memakai";
  const teksAi = bersih(ai.teks);
  if (modeAi === "memakai" && !teksAi) {
    return galat(
      "Pernyataan pemakaian AI wajib disertai penjelasan alat dan tujuannya."
    );
  }

  const input: JurnalWizardInput = {
    bagianSlug,
    bahasa,
    daftarPeriksa,
    judul,
    abstrakId,
    abstrakEn,
    kataKunci,
    penulisUtama,
    penulisPendamping,
    berkas,
    pernyataanAi: { mode: modeAi, teks: teksAi }
  };

  try {
    const naskah = await createSubmissionLengkap(input, submitterUserId);
    return NextResponse.json(
      {
        kode: naskah.kode,
        status: naskah.status,
        statusLabel: labelStatus(naskah.status),
        dibuatPada: naskah.dibuatPada
      },
      { status: 201 }
    );
  } catch (err) {
    console.error(
      "POST /api/jurnal/submissions (wizard) gagal:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { error: "Pengiriman naskah gagal disimpan. Coba lagi." },
      { status: 500 }
    );
  }
}

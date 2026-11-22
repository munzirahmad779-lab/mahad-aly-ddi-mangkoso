import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "@/lib/rate-limit";
import {
  createSubmission,
  createSubmissionLengkap,
  getJurnalDataMode,
  listSubmissions
} from "@/lib/jurnal/store";
import { requireJurnalRole } from "@/lib/jurnal/auth";
import {
  emailDariHeaderLokal,
  sesiLokalStaf
} from "@/lib/jurnal/sesi-lokal";
import { peranLokalLengkap } from "@/lib/jurnal/store-local";
import { JURNAL_STAFF_ROLES, labelStatus } from "@/lib/jurnal/status";
import {
  BERKAS_PENDUKUNG_MAX_JUMLAH,
  JURNAL_BAGIAN,
  daftarPeriksaLengkap,
  validasiBerkasMeta,
  type JurnalBerkasMeta,
  type JurnalWizardInput
} from "@/lib/jurnal/wizard";
import { verifikasiMetaBerkasTersimpan } from "@/lib/jurnal/berkas";
import {
  BATAS_TEKS,
  bacaJsonTerbatas,
  batasiLajuJurnal,
  catatPeristiwaKeamanan,
  galatBatasTeks,
  periksaTurnstile,
  responsBadanTerlaluBesar
} from "@/lib/jurnal/keamanan";

// API naskah jurnal "OJS versi kita" (Tahap 1 dan 2, dikeraskan Tahap
// Keamanan). Lapisan data dipilih fasad src/lib/jurnal/store.ts: tabel
// jurnal_* Supabase bila migrasi 004 sudah dijalankan dan env tersedia,
// selain itu data uji lokal. GET daftar adalah antrean panel dan
// mewajibkan sesi berperan staf pada KEDUA mode (mode lokal: akun staf
// uji dari env JURNAL_LOCAL_STAFF_EMAILS). POST wizard mewajibkan sesi
// penulis dan kait Turnstile; POST lama (formulir satu halaman versi
// uji) dibatasi laju per IP dan per email.

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const dibatasi = await batasiLajuJurnal(req, "panel-daftar", {
    perIp: { limit: 120, windowMs: 60 * 1000 }
  });
  if (dibatasi) return dibatasi;

  const mode = await getJurnalDataMode();
  let viewer: { email: string; roles: string[] } | null = null;

  if (mode === "supabase") {
    const auth = await requireJurnalRole(req, JURNAL_STAFF_ROLES);
    if (!auth.ok) return auth.response;
    viewer = { email: auth.email, roles: auth.roles };
  } else {
    const emailStaf = sesiLokalStaf(req);
    if (!emailStaf) {
      const emailPemanggil = emailDariHeaderLokal(req);
      await catatPeristiwaKeamanan("peran_ditolak", {
        ip: getClientIp(req),
        email: emailPemanggil,
        rincian: emailPemanggil
          ? "daftar-panel:akun-lokal-bukan-staf"
          : "daftar-panel:tanpa-sesi"
      });
      return NextResponse.json(
        {
          error: emailPemanggil
            ? "Daftar panel hanya untuk akun staf jurnal."
            : "Sesi staf jurnal tidak ditemukan. Silakan masuk lewat panel redaksi.",
          mode
        },
        { status: emailPemanggil ? 403 : 401 }
      );
    }
    viewer = { email: emailStaf, roles: await peranLokalLengkap(emailStaf) };
  }

  try {
    const data = await listSubmissions();
    return NextResponse.json({
      mode,
      authRequired: true,
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
  const { data: body, terlaluBesar } = await bacaJsonTerbatas(
    req,
    64 * 1024
  );
  if (terlaluBesar) return responsBadanTerlaluBesar();

  // Muatan wizard Tahap 2 dikenali dari adanya bagianSlug. Jalur lama
  // (formulir satu halaman versi uji) tetap dilayani di bawah.
  if (body && typeof body === "object" && "bagianSlug" in body) {
    return tanganiWizard(req, body as Record<string, unknown>);
  }

  const dibatasi = await batasiLajuJurnal(
    req,
    "kirim-lama",
    {
      perIp: { limit: 20, windowMs: 60 * 60 * 1000 },
      perAkun: { limit: 5, windowMs: 60 * 60 * 1000 }
    },
    typeof body?.email === "string" ? body.email : null
  );
  if (dibatasi) return dibatasi;

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
  const galatBatasLama = galatBatasTeks([
    { label: "Judul", nilai: data.judul, maks: BATAS_TEKS.judul },
    { label: "Nama penulis", nilai: data.penulis, maks: BATAS_TEKS.nama },
    { label: "Afiliasi", nilai: data.afiliasi, maks: BATAS_TEKS.afiliasi },
    { label: "Abstrak", nilai: data.abstrak, maks: BATAS_TEKS.abstrak }
  ]);
  if (galatBatasLama) {
    return NextResponse.json({ error: galatBatasLama }, { status: 400 });
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
// naskahnya. Peran atau pemilik yang dikirim klien di badan permintaan
// tidak pernah dibaca.

async function tanganiWizard(
  req: NextRequest,
  body: Record<string, unknown>
): Promise<Response> {
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

  const dibatasi = await batasiLajuJurnal(
    req,
    "kirim-wizard",
    {
      perIp: { limit: 20, windowMs: 60 * 60 * 1000 },
      perAkun: { limit: 10, windowMs: 60 * 60 * 1000 }
    },
    emailPengirim
  );
  if (dibatasi) return dibatasi;

  // Kait Turnstile sesudah sesi dan rate limit, sebelum data diproses.
  const turnstile = await periksaTurnstile(
    req,
    body.turnstileToken,
    "kirim-wizard"
  );
  if (!turnstile.lolos) {
    return NextResponse.json(
      { error: turnstile.pesan },
      { status: turnstile.status }
    );
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
  const galatBatas = galatBatasTeks([
    { label: "Judul", nilai: judul, maks: BATAS_TEKS.judul },
    { label: "Abstrak Bahasa Indonesia", nilai: abstrakId, maks: BATAS_TEKS.abstrak },
    { label: "Abstrak Bahasa Inggris", nilai: abstrakEn, maks: BATAS_TEKS.abstrak },
    ...kataKunci.map((k) => ({
      label: "Kata kunci",
      nilai: k,
      maks: BATAS_TEKS.kataKunciItem
    }))
  ]);
  if (galatBatas) return galat(galatBatas);

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
  const galatBatasUtama = galatBatasTeks([
    { label: "Nama penulis utama", nilai: penulisUtama.nama, maks: BATAS_TEKS.nama },
    { label: "Afiliasi penulis utama", nilai: penulisUtama.afiliasi, maks: BATAS_TEKS.afiliasi },
    { label: "ORCID penulis utama", nilai: penulisUtama.orcid ?? "", maks: BATAS_TEKS.orcid }
  ]);
  if (galatBatasUtama) return galat(galatBatasUtama);

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
      const galatBatasP = galatBatasTeks([
        { label: "Nama penulis pendamping", nilai: p.nama, maks: BATAS_TEKS.nama },
        { label: "Afiliasi penulis pendamping", nilai: p.afiliasi, maks: BATAS_TEKS.afiliasi },
        { label: "ORCID penulis pendamping", nilai: p.orcid ?? "", maks: BATAS_TEKS.orcid }
      ]);
      if (galatBatasP) return galat(galatBatasP);
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
      if (meta.namaAsli.length > BATAS_TEKS.namaBerkas) {
        return galat("Nama berkas terlalu panjang.");
      }
      // Metadata yang diterbitkan server diverifikasi polanya; kunci
      // karangan klien ditolak di sini.
      const pesanVerifikasi = verifikasiMetaBerkasTersimpan(meta);
      if (pesanVerifikasi) {
        await catatPeristiwaKeamanan("unggah_ditolak", {
          ip: getClientIp(req),
          email: emailPengirim,
          rincian: `metadata-berkas:${pesanVerifikasi}`
        });
        return galat(pesanVerifikasi);
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
  if (teksAi.length > BATAS_TEKS.teksAi) {
    return galat(
      `Penjelasan pemakaian AI melebihi batas ${BATAS_TEKS.teksAi} karakter.`
    );
  }
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

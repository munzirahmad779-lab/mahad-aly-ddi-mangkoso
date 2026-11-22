import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "@/lib/rate-limit";
import {
  akunJurnalAda,
  berikanPeranKeAkun,
  daftarAkunDenganPeran
} from "@/lib/jurnal/akun";
import {
  konsumsiUndangan,
  periksaUndangan
} from "@/lib/jurnal/undangan";
import { sesiJurnalDariRequest } from "@/lib/jurnal/sesi-server";
import { validasiKataSandi } from "@/lib/jurnal/wizard";
import {
  BATAS_TEKS,
  bacaJsonTerbatas,
  batasiLajuJurnal,
  catatPeristiwaKeamanan,
  galatBatasTeks,
  responsBadanTerlaluBesar
} from "@/lib/jurnal/keamanan";

// Klaim undangan reviewer (Tahap 3).
// GET ?token=... memeriksa tautan dan mengembalikan alamat tujuannya.
// POST mengklaim: bila alamat belum punya akun, penerima mendaftar
// berpersetujuan mengikuti pola daftar Tahap 2 dan langsung menerima
// peran reviewer; bila sudah punya akun, penerima wajib masuk dengan
// akun itu (email sesi harus sama dengan alamat undangan) dan peran
// reviewer ditambahkan ke akunnya. Token hanya disimpan sebagai hash
// dan gugur sesudah dipakai atau kedaluwarsa.

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const dibatasi = await batasiLajuJurnal(req, "klaim-undangan-periksa", {
    perIp: { limit: 60, windowMs: 60 * 1000 }
  });
  if (dibatasi) return dibatasi;

  const token = req.nextUrl.searchParams.get("token") ?? "";
  try {
    const info = await periksaUndangan(token);
    if (!info) {
      return NextResponse.json(
        {
          error:
            "Tautan undangan tidak sah, sudah dipakai, atau sudah kedaluwarsa. Minta tautan baru kepada redaksi."
        },
        { status: 404 }
      );
    }
    const sudahAda = await akunJurnalAda(info.email);
    return NextResponse.json({
      email: info.email,
      kedaluwarsa: info.kedaluwarsa,
      akunSudahAda: sudahAda
    });
  } catch (err) {
    console.error(
      "GET /api/jurnal/auth/klaim-undangan gagal:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { error: "Gagal memeriksa undangan." },
      { status: 500 }
    );
  }
}

function bersih(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

export async function POST(req: NextRequest) {
  const dibatasi = await batasiLajuJurnal(req, "klaim-undangan", {
    perIp: { limit: 20, windowMs: 10 * 60 * 1000 }
  });
  if (dibatasi) return dibatasi;

  const { data: body, terlaluBesar } = await bacaJsonTerbatas(
    req,
    16 * 1024
  );
  if (terlaluBesar) return responsBadanTerlaluBesar();
  const token = bersih(body?.token);
  if (!token) {
    return NextResponse.json(
      { error: "Token undangan wajib dikirim." },
      { status: 400 }
    );
  }

  try {
    const info = await periksaUndangan(token);
    if (!info) {
      await catatPeristiwaKeamanan("review_ditolak", {
        ip: getClientIp(req),
        rincian: "klaim-undangan:token-tidak-sah"
      });
      return NextResponse.json(
        {
          error:
            "Tautan undangan tidak sah, sudah dipakai, atau sudah kedaluwarsa. Minta tautan baru kepada redaksi."
        },
        { status: 400 }
      );
    }

    const sudahAda = await akunJurnalAda(info.email);

    if (sudahAda) {
      // Jalur akun yang sudah ada: sesi wajib milik alamat undangan.
      const sesi = await sesiJurnalDariRequest(req);
      if (!sesi) {
        return NextResponse.json(
          {
            error:
              "Alamat ini sudah memiliki akun jurnal. Masuk terlebih dahulu dengan akun itu, lalu buka tautan undangan ini lagi untuk menerima peran reviewer.",
            perluMasuk: true
          },
          { status: 401 }
        );
      }
      if (sesi.email.toLowerCase() !== info.email.toLowerCase()) {
        await catatPeristiwaKeamanan("review_ditolak", {
          ip: getClientIp(req),
          email: sesi.email,
          rincian: "klaim-undangan:email-sesi-berbeda"
        });
        return NextResponse.json(
          {
            error:
              "Undangan ini ditujukan ke alamat lain. Masuk dengan akun yang alamatnya sama dengan undangan."
          },
          { status: 403 }
        );
      }
      await berikanPeranKeAkun(info.email, "reviewer");
      await konsumsiUndangan(token);
      return NextResponse.json({
        success: true,
        email: info.email,
        peran: "reviewer",
        jalur: "akun-sudah-ada"
      });
    }

    // Jalur pendaftaran baru berpersetujuan (pola daftar Tahap 2).
    const data = {
      nama: bersih(body?.nama),
      afiliasi: bersih(body?.afiliasi),
      kataSandi: typeof body?.password === "string" ? body.password : "",
      negara: bersih(body?.negara),
      orcid: bersih(body?.orcid),
      persetujuan: body?.persetujuan === true
    };
    if (!data.nama || !data.afiliasi) {
      return NextResponse.json(
        { error: "Nama dan afiliasi wajib diisi." },
        { status: 400 }
      );
    }
    const galatBatas = galatBatasTeks([
      { label: "Nama", nilai: data.nama, maks: BATAS_TEKS.nama },
      { label: "Afiliasi", nilai: data.afiliasi, maks: BATAS_TEKS.afiliasi },
      { label: "Negara", nilai: data.negara, maks: BATAS_TEKS.negara },
      { label: "ORCID", nilai: data.orcid, maks: BATAS_TEKS.orcid }
    ]);
    if (galatBatas) {
      return NextResponse.json({ error: galatBatas }, { status: 400 });
    }
    const galatSandi = validasiKataSandi(data.kataSandi);
    if (galatSandi) {
      return NextResponse.json({ error: galatSandi }, { status: 400 });
    }
    if (!data.persetujuan) {
      return NextResponse.json(
        {
          error:
            "Persetujuan pembuatan akun wajib dicentang sebelum mendaftar."
        },
        { status: 400 }
      );
    }

    const hasil = await daftarAkunDenganPeran(
      {
        nama: data.nama,
        email: info.email,
        kataSandi: data.kataSandi,
        afiliasi: data.afiliasi,
        negara: data.negara || undefined,
        orcid: data.orcid || undefined
      },
      "reviewer"
    );
    await konsumsiUndangan(token);
    return NextResponse.json(
      {
        success: true,
        email: hasil.email,
        nama: hasil.nama,
        peran: "reviewer",
        jalur: "daftar-baru"
      },
      { status: 201 }
    );
  } catch (err) {
    const pesan = err instanceof Error ? err.message : "Klaim undangan gagal.";
    const status = /sudah terdaftar/i.test(pesan) ? 409 : 500;
    console.error("POST /api/jurnal/auth/klaim-undangan error:", pesan);
    return NextResponse.json({ error: pesan }, { status });
  }
}

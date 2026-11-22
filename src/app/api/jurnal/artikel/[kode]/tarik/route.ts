import { NextRequest, NextResponse } from "next/server";
import { tarikArtikelTerbit } from "@/lib/jurnal/publik5-server";
import { catatPeristiwaNaskah } from "@/lib/jurnal/store";
import { tuntutPeranJurnal } from "@/lib/jurnal/gerbang";
import {
  bacaJsonTerbatas,
  batasiLajuJurnal,
  normalisasiKodeLacak,
  responsBadanTerlaluBesar
} from "@/lib/jurnal/keamanan";

// Penarikan artikel terbit (Tahap 5). Hanya journal_manager. Artikel
// tidak dihapus: ia ditandai ditarik, hilang dari permukaan publik,
// halamannya menjadi pemberitahuan penarikan, dan rekod OAI-PMH-nya
// berubah menjadi header bertanda deleted secara persisten.

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ kode: string }> }
) {
  const dibatasi = await batasiLajuJurnal(req, "artikel-tarik", {
    perIp: { limit: 30, windowMs: 60 * 60 * 1000 }
  });
  if (dibatasi) return dibatasi;
  const gerbang = await tuntutPeranJurnal(req, "artikel-tarik", [
    "journal_manager"
  ]);
  if (!gerbang.ok) return gerbang.response;

  const { kode: kodeMentah } = await params;
  const kode = normalisasiKodeLacak(kodeMentah);
  if (!kode) {
    return NextResponse.json(
      { error: "Kode lacak tidak sah." },
      { status: 400 }
    );
  }

  const { data: body, terlaluBesar } = await bacaJsonTerbatas(req, 8 * 1024);
  if (terlaluBesar) return responsBadanTerlaluBesar();
  const alasan =
    typeof body?.alasan === "string" && body.alasan.trim()
      ? body.alasan.trim().slice(0, 2000)
      : null;

  const galat = await tarikArtikelTerbit(kode, alasan);
  if (galat) return NextResponse.json({ error: galat }, { status: 400 });
  await catatPeristiwaNaskah(
    kode,
    `Artikel ditarik dari publikasi oleh manajer jurnal${alasan ? `: ${alasan}` : ""}`,
    { label: gerbang.sesi.email },
    "penarikan"
  );
  return NextResponse.json({ ok: true });
}

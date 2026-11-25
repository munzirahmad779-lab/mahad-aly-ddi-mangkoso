import { NextRequest, NextResponse } from "next/server";

// Jalur foto sampul satu asal (perbaikan 26 Nov 2026): sampul artikel
// selama ini dimuat langsung dari alamat publik r2.dev, yaitu alamat
// kelas pengembang yang sesekali gagal dijangkau peramban pembaca;
// pada peramban user sendiri sampul Lima Nasihat Gurutta Moh. Asy'ari
// terus-menerus gagal termuat padahal berkasnya sehat. Kini sampul
// disajikan dari domain kampus sendiri lewat jalur ini: peladen
// mengambil berkasnya dari bucket, menyajikannya dengan tembolok
// tepi, dan alamat barunya sekaligus membebaskan peramban dari
// catatan gagal lama untuk alamat sebelumnya. Bila berkas di bucket
// sedang tidak terjangkau, jalur ini membalas sampul penanda resmi
// (SVG) supaya pembaca tidak pernah melihat gambar rusak.

const ASAL_BUCKET =
  "https://pub-03993bc561244e92aa680c268c4d4b9d.r2.dev/foto/";
const ASAL_BUCKET_AKAR = "https://pub-03993bc561244e92aa680c268c4d4b9d.r2.dev/";

const PENANDA_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#064e3b'/><stop offset='1' stop-color='#047857'/></linearGradient></defs><rect width='800' height='450' fill='url(#g)'/><g transform='translate(352 177) scale(4)' fill='none' stroke='#a7f3d0' stroke-width='1.3' stroke-linecap='round' stroke-linejoin='round'><path d='M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z'/><path d='M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z'/></g></svg>`;

function balasPenanda(): NextResponse {
  return new NextResponse(PENANDA_SVG, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=300",
    },
  });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ berkas: string }> }
) {
  const { berkas } = await params;

  // Nama berkas dibatasi ketat: satu segmen, tanpa penjelajahan
  // direktori, hanya ekstensi gambar yang dikenal.
  if (
    !/^[A-Za-z0-9._-]+$/.test(berkas) ||
    berkas.includes("..") ||
    !/\.(webp|jpe?g|png|gif|avif)$/i.test(berkas)
  ) {
    return balasPenanda();
  }

  try {
    // Berkas sampul tersimpan di dua tempat di bucket: sebagian di
    // folder foto/, sebagian di akar bucket. Coba folder dulu, lalu
    // akar, sebelum menyerah ke sampul penanda.
    let asal = await fetch(`${ASAL_BUCKET}${berkas}`, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!asal.ok) {
      asal = await fetch(`${ASAL_BUCKET_AKAR}${berkas}`, {
        headers: { "User-Agent": "Mozilla/5.0" },
      });
    }
    if (!asal.ok) return balasPenanda();
    const tipe = asal.headers.get("content-type") || "image/webp";
    const badan = await asal.arrayBuffer();
    return new NextResponse(badan, {
      status: 200,
      headers: {
        "Content-Type": tipe,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return balasPenanda();
  }
}

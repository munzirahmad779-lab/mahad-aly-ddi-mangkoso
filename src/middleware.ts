import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Daftar jalur jebakan (Honeypot Traps) untuk bot scanner liar
const HONEYPOT_PATHS = [
  "/wp-login.php",
  "/wp-admin",
  "/wp-content",
  "/xmlrpc.php",
  "/.env",
  "/.git",
  "/phpmyadmin",
  "/admin.php",
  "/shell.php",
  "/eval-stdin.php"
];

// Cache bendera akses publik jurnal per isolat Worker (30 detik), supaya
// middleware tidak memanggil basis data pada setiap permintaan.
let cacheAksesJurnal: { tertutup: boolean; pada: number } | null = null;

// Nilai cookie gerbang jurnal adalah turunan HMAC-SHA256 dari kunci
// gerbang dengan pesan tetap di bawah ini, BUKAN kunci gerbang itu
// sendiri. Cookie yang bocor (tangkapan layar, log, perangkat bersama)
// tidak lagi membocorkan kunci induk, dan kunci dapat diganti untuk
// mencabut semua cookie lama sekaligus. Middleware berjalan di edge
// runtime, jadi perhitungan memakai Web Crypto (crypto.subtle) dan
// pemeriksaan memakai subtle.verify yang berwaktu tetap.
const PESAN_COOKIE_GERBANG = "gerbang-jurnal-v1";

async function hitungNilaiCookieGerbang(kunciGerbang: string): Promise<string> {
  const enc = new TextEncoder();
  const kunci = await crypto.subtle.importKey(
    "raw",
    enc.encode(kunciGerbang),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const tanda = await crypto.subtle.sign(
    "HMAC",
    kunci,
    enc.encode(PESAN_COOKIE_GERBANG)
  );
  return Array.from(new Uint8Array(tanda))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function cookieGerbangSah(
  kunciGerbang: string,
  nilaiCookie: string | undefined
): Promise<boolean> {
  if (!kunciGerbang || !nilaiCookie || !/^[0-9a-f]{64}$/i.test(nilaiCookie)) {
    return false;
  }
  try {
    const enc = new TextEncoder();
    const kunci = await crypto.subtle.importKey(
      "raw",
      enc.encode(kunciGerbang),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const tanda = new Uint8Array(
      nilaiCookie.match(/.{2}/g)!.map((h) => parseInt(h, 16))
    );
    return await crypto.subtle.verify(
      "HMAC",
      kunci,
      tanda,
      enc.encode(PESAN_COOKIE_GERBANG)
    );
  } catch {
    return false;
  }
}

// Keadaan gerbang jurnal. Urutan keputusan:
// 1. Env JURNAL_AKSES = "terbuka" membuka paksa, "tertutup" menutup
//    paksa (penimpa darurat ops, di atas segalanya).
// 2. Tanpa SUPABASE_SERVICE_ROLE_KEY (mode lokal/uji): gerbang tidak
//    aktif, sama seperti perilaku rangkaian uji selama ini.
// 3. Selain itu nilai dibaca dari tabel jurnal_pengaturan
//    (kunci 'akses_publik', migrasi 010) yang diatur Manajer Jurnal
//    dari panel admin. Gagal baca berarti tetap tertutup (fail closed).
async function jurnalTertutupUntukPublik(): Promise<boolean> {
  const env = process.env.JURNAL_AKSES;
  if (env === "terbuka") return false;
  if (env === "tertutup") return true;
  const kunci = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!kunci) return false;
  const sekarang = Date.now();
  if (cacheAksesJurnal && sekarang - cacheAksesJurnal.pada < 30_000) {
    return cacheAksesJurnal.tertutup;
  }
  let tertutup = true;
  try {
    const url =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      "https://ymxijorgoucpsxgcvtgu.supabase.co";
    const res = await fetch(
      `${url}/rest/v1/jurnal_pengaturan?kunci=eq.akses_publik&select=nilai`,
      { headers: { apikey: kunci, Authorization: `Bearer ${kunci}` } }
    );
    if (res.ok) {
      const baris = (await res.json()) as Array<{ nilai?: string }>;
      tertutup = baris?.[0]?.nilai !== "terbuka";
    }
  } catch {
    // Basis data tidak terjangkau: jurnal tetap tertutup.
  }
  cacheAksesJurnal = { tertutup, pada: sekarang };
  return tertutup;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const proto = request.headers.get("x-forwarded-proto");
  const host = request.headers.get("host") || "";

  // 0. Paksa redirect HTTP ke HTTPS permanen (301) untuk optimasi SEO & keamanan
  if (proto === "http" && !host.includes("localhost") && !host.includes("127.0.0.1")) {
    const httpsUrl = request.nextUrl.clone();
    httpsUrl.protocol = "https:";
    httpsUrl.host = host;
    return NextResponse.redirect(httpsUrl, 301);
  }

  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("cf-connecting-ip") ||
    "127.0.0.1";

  // 0b. Gerbang penutupan jurnal: selama akses publik tertutup, seluruh
  // jalur /jurnal dan /api/jurnal menjawab 503 untuk publik. Keadaan
  // gerbang diputuskan jurnalTertutupUntukPublik(): penimpa env
  // JURNAL_AKSES, atau bendera jurnal_pengaturan yang diatur Manajer
  // Jurnal dari panel admin. Jalan masuk tim penguji hanya lewat
  // /api/jurnal/gerbang?k=<JURNAL_GATE_KEY>, yang menetapkan cookie
  // gerbang berisi turunan HMAC dari kunci (bukan kuncinya sendiri).
  const jalurJurnal =
    pathname === "/jurnal" ||
    pathname.startsWith("/jurnal/") ||
    pathname === "/api/jurnal" ||
    pathname.startsWith("/api/jurnal/");
  if (jalurJurnal && (await jurnalTertutupUntukPublik())) {
    const kunciGerbang = process.env.JURNAL_GATE_KEY || "";
    if (pathname === "/api/jurnal/gerbang") {
      const kunci = request.nextUrl.searchParams.get("k") || "";
      if (kunciGerbang && kunci === kunciGerbang) {
        const tujuan = request.nextUrl.clone();
        tujuan.pathname = "/jurnal";
        tujuan.search = "";
        const res = NextResponse.redirect(tujuan);
        res.cookies.set(
          "gerbang_jurnal",
          await hitungNilaiCookieGerbang(kunciGerbang),
          {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 30
          }
        );
        return res;
      }
      return new NextResponse("Tidak ditemukan.", { status: 404 });
    }
    const lolos = await cookieGerbangSah(
      kunciGerbang,
      request.cookies.get("gerbang_jurnal")?.value
    );
    if (!lolos) {
      if (pathname.startsWith("/api/")) {
        return new NextResponse(
          JSON.stringify({
            error:
              "Jurnal sedang dalam tahap penyiapan dan belum dibuka untuk publik."
          }),
          {
            status: 503,
            headers: { "Content-Type": "application/json" }
          }
        );
      }
      return new NextResponse(
        `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>المجلة قيد الإعداد</title></head>
<body style="font-family: Georgia, 'Times New Roman', serif; background: #faf7f0; color: #1c2420; display: flex; min-height: 100vh; align-items: center; justify-content: center; margin: 0;">
<main style="max-width: 34rem; padding: 2rem; text-align: center;">
<p style="font-size: 1.6rem; margin: 0 0 0.75rem;">المجلة قيد الإعداد</p>
<p style="font-size: 1rem; line-height: 1.8; margin: 0 0 1.5rem;">مجلة معهد علي دي دي منغكوسو العلمية ما تزال في مرحلة الإعداد، ولم تُفتح للجمهور بعد.</p>
<p lang="id" dir="ltr" style="font-size: 0.95rem; line-height: 1.7; color: #444;">Jurnal Ma'had Aly DDI Mangkoso sedang dalam tahap penyiapan dan belum dibuka untuk publik.</p>
</main>
</body>
</html>`,
        {
          status: 503,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Retry-After": "86400"
          }
        }
      );
    }
  }

  // 1. Lapisan Honeypot Trap: Hadang scanner otomatis dan catat telemetri
  const isMaliciousPath = HONEYPOT_PATHS.some(
    (trap) => pathname === trap || pathname.startsWith(trap + "/")
  );

  if (isMaliciousPath) {
    console.warn(`[SECURITY HONEYPOT BLOCKED] Malicious probe from IP ${clientIp} to ${pathname}`);
    return new NextResponse(
      JSON.stringify({
        status: 403,
        error: "Forbidden",
        message: "Access Denied: Malicious scanner probe detected and blocked by Mahad Aly Defense Shield."
      }),
      {
        status: 403,
        headers: {
          "Content-Type": "application/json",
          "X-Security-Action": "Blocked-Honeypot-Sensor"
        }
      }
    );
  }

  // 2. Proteksi Halaman Admin & Penambahan Security Headers
  const response = NextResponse.next();
  applySecurityHeaders(response);
  return response;
}

function applySecurityHeaders(res: NextResponse) {
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.headers.set("X-XSS-Protection", "1; mode=block");
}

export const config = {
  // PENTING: matcher dibatasi, JANGAN diperluas dengan regex lookahead luas.
  // Matcher yang menyentuh /_next/image membuat optimizer gambar Next 16
  // gagal ("received null") sehingga logo/gambar lokal tidak tampil.
  // Security headers untuk seluruh situs ditangani next.config.ts headers().
  matcher: [
    "/admin/:path*",
    "/jurnal",
    "/jurnal/:path*",
    "/api/jurnal/:path*",
    "/wp-login.php",
    "/wp-admin/:path*",
    "/wp-content/:path*",
    "/xmlrpc.php",
    "/.env",
    "/.git/:path*",
    "/phpmyadmin/:path*",
    "/shell.php",
    "/eval-stdin.php",
    "/admin.php"
  ]
};

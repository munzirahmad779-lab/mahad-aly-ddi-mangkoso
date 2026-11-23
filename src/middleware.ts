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

export function middleware(request: NextRequest) {
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

  // 0b. Gerbang penutupan jurnal: selama env JURNAL_AKSES bernilai
  // "tertutup", seluruh jalur /jurnal dan /api/jurnal menjawab 503 untuk
  // publik. Jalan masuk tim penguji hanya lewat cookie gerbang yang
  // ditetapkan oleh /api/jurnal/gerbang?k=<JURNAL_GATE_KEY>. Bila env
  // tidak dipasang atau bernilai lain, gerbang tidak aktif sama sekali.
  const jalurJurnal =
    pathname === "/jurnal" ||
    pathname.startsWith("/jurnal/") ||
    pathname === "/api/jurnal" ||
    pathname.startsWith("/api/jurnal/");
  if (jalurJurnal && process.env.JURNAL_AKSES === "tertutup") {
    const kunciGerbang = process.env.JURNAL_GATE_KEY || "";
    if (pathname === "/api/jurnal/gerbang") {
      const kunci = request.nextUrl.searchParams.get("k") || "";
      if (kunciGerbang && kunci === kunciGerbang) {
        const tujuan = request.nextUrl.clone();
        tujuan.pathname = "/jurnal";
        tujuan.search = "";
        const res = NextResponse.redirect(tujuan);
        res.cookies.set("gerbang_jurnal", kunciGerbang, {
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 30
        });
        return res;
      }
      return new NextResponse("Tidak ditemukan.", { status: 404 });
    }
    const lolos =
      kunciGerbang !== "" &&
      request.cookies.get("gerbang_jurnal")?.value === kunciGerbang;
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

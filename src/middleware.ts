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
  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("cf-connecting-ip") ||
    "127.0.0.1";

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
  matcher: [
    "/admin/:path*",
    "/wp-login.php",
    "/wp-admin/:path*",
    "/wp-content/:path*",
    "/xmlrpc.php",
    "/.env",
    "/.git/:path*",
    "/phpmyadmin/:path*",
    "/shell.php"
  ]
};

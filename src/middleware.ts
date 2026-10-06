import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Izinkan akses bebas ke halaman login admin dan endpoint API
  if (pathname === "/admin/login" || pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Jika mencoba mengakses panel admin (/admin, /admin/users, /admin/...)
  if (pathname.startsWith("/admin")) {
    // Cek keberadaan session cookie Supabase
    const allCookies = request.cookies.getAll();
    const hasAuthCookie = allCookies.some((c: { name: string; value: string }) =>
      c.name.startsWith("sb-") && c.name.endsWith("-auth-token")
    );

    // Pada masa transisi, komponen admin juga melakukan client-side check
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};

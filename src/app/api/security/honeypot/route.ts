import { NextRequest, NextResponse } from "next/server";
import { sendSecurityAlertEmailToAdmins } from "@/lib/email/service";

export async function ALL_METHODS(req: NextRequest) {
  const clientIp =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") ||
    "127.0.0.1";
  const userAgent = req.headers.get("user-agent") || "Unknown Scanner";
  const url = req.nextUrl.pathname;

  console.warn(`[HONEYPOT TRAP] Malicious probe blocked from IP ${clientIp} to ${url}`);

  // Send security alert email asynchronously without blocking response
  try {
    sendSecurityAlertEmailToAdmins({
      threatType: "honeypot_trap",
      severity: "high",
      ip: clientIp,
      endpoint: url,
      details: `Automated vulnerability bot probe detected and blocked. Method: ${req.method}, User-Agent: ${userAgent}`
    }).catch((e) => console.error("Honeypot email dispatch error:", e));
  } catch (e) {}

  return new NextResponse(
    JSON.stringify({
      status: 403,
      error: "Forbidden",
      message: "Access Denied: Malicious probe detected and IP flagged by Portal Defense System."
    }),
    {
      status: 403,
      headers: {
        "Content-Type": "application/json",
        "X-Security-Action": "Blocked-By-Honeypot-Sensor"
      }
    }
  );
}

export const GET = ALL_METHODS;
export const POST = ALL_METHODS;
export const PUT = ALL_METHODS;
export const DELETE = ALL_METHODS;
export const PATCH = ALL_METHODS;

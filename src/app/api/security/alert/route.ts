import { NextRequest, NextResponse } from "next/server";
import { sendSecurityAlertEmailToAdmins } from "@/lib/email/service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { threatType, severity, ip, endpoint, details, adminEmails } = body;

    const clientIp =
      ip ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      "127.0.0.1";

    const userAgent = req.headers.get("user-agent") || "Unknown";

    const alertResult = await sendSecurityAlertEmailToAdmins({
      threatType: threatType || "suspicious_scanner",
      severity: severity || "high",
      ip: clientIp,
      endpoint: endpoint || "/unknown",
      details: details ? `${details} (User-Agent: ${userAgent})` : `User-Agent: ${userAgent}`,
      adminEmails
    });

    return NextResponse.json({
      success: true,
      message: "Security alert broadcasted to administrators successfully",
      details: alertResult
    });
  } catch (error: any) {
    console.error("Security alert API error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

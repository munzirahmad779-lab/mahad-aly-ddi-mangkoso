import { NextRequest, NextResponse } from "next/server";
import { sendSecurityAlertEmailToAdmins } from "@/lib/email/service";
import { supabaseAdmin } from "@/lib/supabase/server";

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

    // Sinkronkan ke database Supabase agar langsung tampil di Pusat Pertahanan & Panel Akun Terkunci
    try {
      const now = new Date();
      const formattedDate = now.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
      const formattedTime = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WITA";
      
      const newThreat = {
        id: "threat-" + Date.now().toString(),
        threatType: threatType || "brute_force",
        severity: severity || "high",
        ip: clientIp,
        endpoint: endpoint || "/admin/login",
        details: details ? `${details} (User-Agent: ${userAgent})` : `User-Agent: ${userAgent}`,
        timestamp: `${formattedDate}, ${formattedTime}`,
        status: "blocked",
        alertSent: true
      };

      // 1. Ambil data security_threats yang ada di Supabase
      const { data: existingData } = await supabaseAdmin
        .from("site_content")
        .select("value")
        .eq("key", "security_threats")
        .single();

      const existingThreats = Array.isArray(existingData?.value) ? existingData.value : [];
      const updatedThreats = [newThreat, ...existingThreats.slice(0, 99)];

      await supabaseAdmin.from("site_content").upsert({
        key: "security_threats",
        value: updatedThreats
      }, { onConflict: "key" });

      // 2. Jika merupakan brute force salah sandi, sinkronkan juga ke database locked_accounts
      if (threatType === "brute_force") {
        const { data: lockedData } = await supabaseAdmin
          .from("site_content")
          .select("value")
          .eq("key", "locked_accounts")
          .single();

        const currentLocked = lockedData?.value && typeof lockedData.value === "object" ? lockedData.value : {};
        
        // Ekstrak email jika tersedia
        const emailMatch = details?.match(/\[(.*?)\]/);
        const lockedEmail = emailMatch ? emailMatch[1].toLowerCase() : "unknown@admin";
        
        currentLocked[lockedEmail] = {
          email: lockedEmail,
          failedCount: 3,
          lockedAt: new Date().toISOString(),
          reason: "3 kali salah memasukkan kata sandi"
        };

        await supabaseAdmin.from("site_content").upsert({
          key: "locked_accounts",
          value: currentLocked
        }, { onConflict: "key" });
      }
    } catch (dbErr) {
      console.warn("Gagal mencatat log keamanan ke Supabase:", dbErr);
    }

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

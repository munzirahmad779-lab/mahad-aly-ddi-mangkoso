import { NextRequest, NextResponse } from "next/server";
import { sendSecurityAlertEmailToAdmins } from "@/lib/email/service";
import { supabaseAdmin } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";
import { SUPER_ADMIN_EMAIL } from "@/lib/admin-constants";
import { normalizeAdminRole } from "@/lib/supabase/admin-guard";

export async function POST(req: NextRequest) {
  try {
    // Endpoint ini mengirim email nyata ke admin: tanpa batas, bot bisa membanjiri inbox.
    const rl = await checkRateLimit(`alert:${getClientIp(req)}`, 5, 5 * 60 * 1000);
    if (!rl.allowed) return rateLimitResponse(rl);

    const body = await req.json().catch(() => ({}));

    // 1. IP Sanitization - Prioritaskan header server di atas body input
    const serverHeaderIp =
      req.headers.get("cf-connecting-ip")?.trim() ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip")?.trim();

    const rawBodyIp = typeof body.ip === "string" ? body.ip.trim() : "";
    const safeBodyIp = rawBodyIp.replace(/[^a-zA-Z0-9.:_-]/g, "").slice(0, 45);
    const clientIp = serverHeaderIp || safeBodyIp || "127.0.0.1";

    const userAgent = req.headers.get("user-agent")?.slice(0, 200) || "Unknown";

    // 2. Sanitasi threatType & severity ke allowed enum
    const ALLOWED_THREAT_TYPES = [
      "brute_force",
      "suspicious_scanner",
      "sql_injection",
      "xss_attempt",
      "unauthorized_access",
      "rate_limit_exceeded"
    ];
    const rawThreat = typeof body.threatType === "string" ? body.threatType.trim().toLowerCase() : "";
    const safeThreatType = ALLOWED_THREAT_TYPES.includes(rawThreat) ? rawThreat : "brute_force";

    const ALLOWED_SEVERITIES = ["critical", "high", "medium", "low"] as const;
    const rawSeverity = typeof body.severity === "string" ? body.severity.trim().toLowerCase() : "";
    const safeSeverity = (ALLOWED_SEVERITIES.includes(rawSeverity as any) ? rawSeverity : "high") as "critical" | "high" | "medium" | "low";

    // 3. Sanitasi endpoint & details
    const rawEndpoint = typeof body.endpoint === "string" ? body.endpoint.trim() : "/admin/login";
    const safeEndpoint = rawEndpoint.slice(0, 100).replace(/[^\w\-/.]/g, "") || "/admin/login";

    const rawDetails = typeof body.details === "string" ? body.details.trim() : "";
    const safeDetails = rawDetails.slice(0, 500).replace(/<[^>]*>?/gm, "");

    // 4. Resolusi email penerima dari database (JANGAN percaya input adminEmails dari klien!)
    // Hanya peran admin (super_admin dan editor) yang menerima peringatan
    // keamanan; akun penulis aktif TIDAK ikut menerima IP penyerang dan
    // rincian ancaman (perilaku lama mengirim ke semua akun aktif).
    // Peran disaring memakai normalizeAdminRole yang sama seperti gerbang
    // admin, supaya varian penulisan peran di basis data tertangani.
    let verifiedAdminEmails: string[] = [];
    try {
      const { data: dbAdmins } = await supabaseAdmin
        .from("users")
        .select("email, role")
        .eq("is_active", true);

      verifiedAdminEmails = (dbAdmins || [])
        .filter((u: any) => {
          const role = normalizeAdminRole(u.role);
          return role === "super_admin" || role === "editor";
        })
        .map((u: any) => u.email?.trim().toLowerCase())
        .filter(Boolean);
    } catch (fetchErr) {
      console.warn("Gagal mengambil email admin dari database:", fetchErr);
    }

    const defaultAdminEmail = (process.env.ADMIN_NOTIFICATION_EMAIL || SUPER_ADMIN_EMAIL).trim().toLowerCase();
    if (!verifiedAdminEmails.includes(defaultAdminEmail)) {
      verifiedAdminEmails.push(defaultAdminEmail);
    }

    await sendSecurityAlertEmailToAdmins({
      threatType: safeThreatType,
      severity: safeSeverity,
      ip: clientIp,
      endpoint: safeEndpoint,
      details: safeDetails ? `${safeDetails} (User-Agent: ${userAgent})` : `User-Agent: ${userAgent}`,
      adminEmails: verifiedAdminEmails
    });

    // 5. Sinkronkan ke database Supabase agar langsung tampil di Pusat Pertahanan & Panel Akun Terkunci.
    // Kegagalan tulis di langkah ini dicatat eksplisit dan dilaporkan
    // lewat field dbSynced pada respons, bukan ditelan: PostgREST
    // mengembalikan { error } dan tidak melempar ke catch di bawah.
    let dbSynced = true;
    try {
      // Zona Asia/Makassar eksplisit: server berjalan UTC, tanpa ini cap
      // waktu log ancaman tercatat 8 jam lebih awal dari label WITA-nya.
      const now = new Date();
      const formattedDate = now.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Makassar" });
      const formattedTime = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Makassar" }) + " WITA";

      const newThreat = {
        id: "threat-" + Date.now().toString(),
        threatType: safeThreatType,
        severity: safeSeverity,
        ip: clientIp,
        endpoint: safeEndpoint,
        details: safeDetails ? `${safeDetails} (User-Agent: ${userAgent})` : `User-Agent: ${userAgent}`,
        timestamp: `${formattedDate}, ${formattedTime}`,
        status: "blocked",
        alertSent: true
      };

      // 5a. Ambil data security_threats yang ada di Supabase
      const { data: existingData } = await supabaseAdmin
        .from("site_content")
        .select("value")
        .eq("key", "security_threats")
        .single();

      const existingThreats = Array.isArray(existingData?.value) ? existingData.value : [];

      // Auto Pruning: Bersihkan log yang umurnya sudah melebihi 7 hari (7 * 24 * 60 * 60 * 1000 ms).
      // Entri tanpa createdAt dianggap tertua dan ikut terpangkas; perilaku
      // lama mempertahankannya selamanya sehingga log tumbuh tanpa batas.
      const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
      const nowMs = now.getTime();
      const validThreats = existingThreats.filter((t: any) => {
        if (!t.createdAt) return false;
        const logAge = nowMs - new Date(t.createdAt).getTime();
        return logAge < SEVEN_DAYS_MS;
      });

      const updatedThreats = [
        { ...newThreat, createdAt: now.toISOString() },
        ...validThreats.slice(0, 99)
      ];

      const { error: threatWriteErr } = await supabaseAdmin.from("site_content").upsert({
        key: "security_threats",
        group_name: "security",
        label: "Daftar Ancaman & Sensor Siber",
        value: updatedThreats,
        updated_at: new Date().toISOString()
      }, { onConflict: "key" });
      if (threatWriteErr) {
        dbSynced = false;
        console.error("Gagal menyimpan security_threats:", threatWriteErr.message);
      }

      // 5b. Jika brute force salah sandi, sinkronkan ke locked_accounts
      if (safeThreatType === "brute_force") {
        const emailMatch = safeDetails.match(/\[([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\]/);
        const lockedEmail = emailMatch ? emailMatch[1].toLowerCase() : null;

        if (lockedEmail) {
          const { data: lockedData } = await supabaseAdmin
            .from("site_content")
            .select("value")
            .eq("key", "locked_accounts")
            .single();

          const currentLocked = lockedData?.value && typeof lockedData.value === "object" ? lockedData.value : {};

          currentLocked[lockedEmail] = {
            email: lockedEmail,
            failedCount: 3,
            lockedAt: new Date().toISOString(),
            reason: "3 kali salah memasukkan kata sandi"
          };

          const { error: lockedWriteErr } = await supabaseAdmin.from("site_content").upsert({
            key: "locked_accounts",
            group_name: "security",
            label: "Daftar Akun Terkunci",
            value: currentLocked,
            updated_at: new Date().toISOString()
          }, { onConflict: "key" });
          if (lockedWriteErr) {
            dbSynced = false;
            console.error("Gagal menyimpan locked_accounts:", lockedWriteErr.message);
          }
        }
      }
    } catch (dbErr) {
      dbSynced = false;
      console.warn("Gagal mencatat log keamanan ke Supabase:", dbErr);
    }

    // Respons ke pemanggil tanpa sesi cukup sukses generik: rincian
    // pengiriman email (alamat penerima, hasil per alamat) tidak lagi
    // dimuat karena dapat dipakai memastikan alamat admin yang aktif.
    return NextResponse.json({
      success: true,
      message: "Security alert broadcasted to administrators successfully",
      dbSynced
    });
  } catch (error: any) {
    console.error("Security alert API error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

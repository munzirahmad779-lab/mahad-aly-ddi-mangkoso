import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/supabase/admin-guard";
import { isAllowedAiKey } from "@/lib/ai/editor-service";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  // Hanya Super Admin yang diizinkan menyetujui dan mempublikasikan konten
  const auth = await requireRole(req, ["super_admin"]);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { targetKey, proposedData, summary } = body;

    if (!targetKey || !isAllowedAiKey(targetKey)) {
      return NextResponse.json(
        { success: false, error: `Kunci konten '${targetKey}' tidak valid.` },
        { status: 400 }
      );
    }

    if (!proposedData) {
      return NextResponse.json(
        { success: false, error: "Data usulan konten (proposedData) wajib disertakan." },
        { status: 400 }
      );
    }

    // 1. Ambil data saat ini untuk dijadikan riwayat snapshot rollback
    const { data: currentRecord } = await supabaseAdmin
      .from("site_content")
      .select("value")
      .eq("key", targetKey)
      .maybeSingle();

    const previousValue = currentRecord?.value || null;

    // 2. Buat snapshot riwayat versi
    const snapshotId = `snap-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newSnapshot = {
      id: snapshotId,
      targetKey,
      summary: summary || "Pembaruan konten via AI Website Editor",
      previousValue,
      newValue: proposedData,
      appliedBy: auth.email,
      appliedAt: new Date().toISOString()
    };

    // Ambil daftar snapshot yang ada
    const { data: snapRecord } = await supabaseAdmin
      .from("site_content")
      .select("value")
      .eq("key", "ai_content_snapshots")
      .maybeSingle();

    const existingSnapshots = Array.isArray(snapRecord?.value) ? snapRecord.value : [];
    const updatedSnapshots = [newSnapshot, ...existingSnapshots].slice(0, 50); // Simpan 50 riwayat terakhir

    // Simpan snapshot
    await supabaseAdmin.from("site_content").upsert({
      key: "ai_content_snapshots",
      group_name: "ai_system",
      label: "AI Content Version Snapshots",
      value: updatedSnapshots,
      updated_at: new Date().toISOString()
    }, { onConflict: "key" });

    // 3. Terapkan pembaruan ke kunci konten tujuan
    const group =
      targetKey.startsWith("home.") ? "home"
      : targetKey.startsWith("about") ? "about"
      : targetKey === "masyayikh" || targetKey === "facilities" ? "profile"
      : targetKey === "academic" ? "academic"
      : targetKey === "donations" ? "donations"
      : targetKey === "dema_settings" ? "dema"
      : targetKey === "email_templates" ? "email"
      : "layout";

    const itemLabel = `Konten ${targetKey} (AI)`;

    const { error: upsertErr } = await supabaseAdmin.from("site_content").upsert({
      key: targetKey,
      group_name: group,
      label: itemLabel,
      value: proposedData,
      updated_at: new Date().toISOString()
    }, { onConflict: "key" });

    if (upsertErr) {
      throw new Error(`Gagal menyimpan ke database Supabase: ${upsertErr.message}`);
    }

    // 4. Sinkronkan juga ke tabel collections jika modul bertipe koleksi
    if (targetKey === "masyayikh" && Array.isArray(proposedData)) {
      for (const lec of proposedData) {
        if (lec.id && lec.name) {
          try {
            await supabaseAdmin.from("collections").upsert({
              id: lec.id,
              collection_type: "masyayikh",
              data: lec,
              order_index: lec.order || 1,
              is_published: lec.isActive !== false
            }, { onConflict: "id" });
          } catch {
            // Abaikan jika tabel collections di localhost belum ada
          }
        }
      }
    } else if (targetKey === "facilities" && Array.isArray(proposedData)) {
      for (const fac of proposedData) {
        if (fac.id && fac.name) {
          try {
            await supabaseAdmin.from("collections").upsert({
              id: fac.id,
              collection_type: "sarana",
              data: fac,
              order_index: fac.order || 1,
              is_published: true
            }, { onConflict: "id" });
          } catch {
            // Abaikan jika tabel collections di localhost belum ada
          }
        }
      }
    } else if (targetKey === "academic" && Array.isArray(proposedData)) {
      for (const crs of proposedData) {
        if (crs.id && crs.name) {
          try {
            await supabaseAdmin.from("collections").upsert({
              id: crs.id,
              collection_type: "courses",
              data: crs,
              order_index: crs.order || 1,
              is_published: true
            }, { onConflict: "id" });
          } catch {
            // Abaikan jika tabel collections di localhost belum ada
          }
        }
      }
    }

    // 5. Catat ke arsip Log Aktivitas Admin agar tab Audit Trail langsung terupdate
    try {
      const now = new Date();
      const formattedDate = now.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
      const formattedTime = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WITA";
      const newAuditLog = {
        id: "log-" + Date.now(),
        user: auth.email || "Super Admin",
        action: `Penerapan AI: Modul ${targetKey}`,
        target: summary || `Konten ${targetKey}`,
        timestamp: `${formattedDate}, ${formattedTime}`
      };

      const { data: actRecord } = await supabaseAdmin
        .from("site_content")
        .select("value")
        .eq("key", "activity_logs")
        .maybeSingle();

      const existingActLogs = Array.isArray(actRecord?.value) ? actRecord.value : [];
      await supabaseAdmin.from("site_content").upsert({
        key: "activity_logs",
        group_name: "audit",
        label: "Arsip Log Aktivitas Admin",
        value: [newAuditLog, ...existingActLogs.slice(0, 249)],
        updated_at: new Date().toISOString()
      }, { onConflict: "key" });
    } catch (logErr) {
      console.warn("Gagal mencatat audit log AI apply:", logErr);
    }

    return NextResponse.json({
      success: true,
      snapshotId,
      message: `Konten '${targetKey}' berhasil dipublikasikan dan snapshot versi #${snapshotId} telah dicatat untuk rollback.`
    });
  } catch (err: any) {
    console.error("AI Apply API error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Gagal menerapkan konten AI." },
      { status: 500 }
    );
  }
}

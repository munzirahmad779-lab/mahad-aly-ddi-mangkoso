import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/supabase/admin-guard";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  // Hanya Super Admin yang berhak melakukan rollback
  const auth = await requireRole(req, ["super_admin"]);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { snapshotId } = body;

    if (!snapshotId) {
      return NextResponse.json(
        { success: false, error: "Parameter 'snapshotId' wajib disertakan." },
        { status: 400 }
      );
    }

    // 1. Ambil data snapshot
    const { data: snapRecord } = await supabaseAdmin
      .from("site_content")
      .select("value")
      .eq("key", "ai_content_snapshots")
      .maybeSingle();

    const existingSnapshots = Array.isArray(snapRecord?.value) ? snapRecord.value : [];
    const targetSnapshot = existingSnapshots.find((s: any) => s.id === snapshotId);

    if (!targetSnapshot) {
      return NextResponse.json(
        { success: false, error: "Snapshot riwayat tidak ditemukan." },
        { status: 404 }
      );
    }

    if (targetSnapshot.previousValue === undefined) {
      return NextResponse.json(
        { success: false, error: "Snapshot ini tidak memiliki rekaman data versi sebelumnya untuk dipulihkan." },
        { status: 400 }
      );
    }

    // 2. Pulihkan data ke targetKey
    const group =
      targetSnapshot.targetKey.startsWith("home.") ? "home"
      : targetSnapshot.targetKey.startsWith("about") ? "about"
      : targetSnapshot.targetKey === "masyayikh" || targetSnapshot.targetKey === "facilities" ? "profile"
      : targetSnapshot.targetKey === "academic" ? "academic"
      : targetSnapshot.targetKey === "donations" ? "donations"
      : targetSnapshot.targetKey === "dema_settings" ? "dema"
      : targetSnapshot.targetKey === "email_templates" ? "email"
      : "layout";

    const itemLabel = `Konten ${targetSnapshot.targetKey} (Rollback)`;
    const restoreValue = targetSnapshot.previousValue;

    if (restoreValue === null || restoreValue === undefined) {
      // Jika sebelumnya tidak ada data pada kunci ini, hapus baris yang baru dibuat
      const { error: delErr } = await supabaseAdmin
        .from("site_content")
        .delete()
        .eq("key", targetSnapshot.targetKey);
      if (delErr) {
        throw new Error(`Gagal memulihkan ke kondisi kosong: ${delErr.message}`);
      }
    } else {
      const { error: restoreErr } = await supabaseAdmin.from("site_content").upsert({
        key: targetSnapshot.targetKey,
        group_name: group,
        label: itemLabel,
        value: restoreValue,
        updated_at: new Date().toISOString()
      }, { onConflict: "key" });

      if (restoreErr) {
        throw new Error(`Gagal memulihkan data: ${restoreErr.message}`);
      }
    }

    // 3. Sinkronkan juga ke tabel collections bila modul bertipe koleksi,
    // mencerminkan langkah sinkronisasi yang sama di route apply. Tanpa
    // langkah ini site_content hasil rollback dan tabel collections
    // berbeda pendapat dan halaman yang membaca collections tetap
    // menampilkan versi yang dibatalkan.
    const collectionTypeByKey: Record<string, string> = {
      masyayikh: "masyayikh",
      facilities: "sarana",
      academic: "courses"
    };
    const collectionType = collectionTypeByKey[targetSnapshot.targetKey];
    if (collectionType) {
      try {
        if (Array.isArray(restoreValue)) {
          for (const item of restoreValue) {
            if (item.id && item.name) {
              const { error: colErr } = await supabaseAdmin.from("collections").upsert({
                id: item.id,
                collection_type: collectionType,
                data: item,
                order_index: item.order || 1,
                is_published:
                  targetSnapshot.targetKey === "masyayikh" ? item.isActive !== false : true
              }, { onConflict: "id" });
              if (colErr) {
                console.warn("Sinkron collections rollback gagal:", colErr.message);
              }
            }
          }
        } else if (restoreValue === null) {
          // Nilai sebelumnya memang kosong: baris collections untuk tipe
          // ini ikut dikosongkan agar kedua sumber data sepakat.
          const { error: colDelErr } = await supabaseAdmin
            .from("collections")
            .delete()
            .eq("collection_type", collectionType);
          if (colDelErr) {
            console.warn("Pembersihan collections rollback gagal:", colDelErr.message);
          }
        }
      } catch {
        // Abaikan jika tabel collections belum ada
      }
    }

    // 4. Catat entri rollback baru ke snapshot
    const rollbackLogSnapshot = {
      id: `snap-rb-${Date.now()}`,
      targetKey: targetSnapshot.targetKey,
      summary: `[ROLLBACK] Memulihkan kembali ke kondisi sebelum perubahan '${targetSnapshot.summary}'`,
      previousValue: targetSnapshot.newValue,
      newValue: targetSnapshot.previousValue,
      appliedBy: auth.email,
      appliedAt: new Date().toISOString()
    };

    const { error: snapLogErr } = await supabaseAdmin.from("site_content").upsert({
      key: "ai_content_snapshots",
      group_name: "ai_system",
      label: "AI Content Version Snapshots",
      value: [rollbackLogSnapshot, ...existingSnapshots].slice(0, 50),
      updated_at: new Date().toISOString()
    }, { onConflict: "key" });
    if (snapLogErr) {
      throw new Error(`Gagal mencatat riwayat rollback: ${snapLogErr.message}`);
    }

    // 5. Catat aksi rollback ke arsip Log Aktivitas Admin
    try {
      const now = new Date();
      const formattedDate = now.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Makassar" });
      const formattedTime = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Makassar" }) + " WITA";
      const newAuditLog = {
        id: "log-rb-" + Date.now(),
        user: auth.email || "Super Admin",
        action: `Rollback Versi: Modul ${targetSnapshot.targetKey}`,
        target: `Dipulihkan ke kondisi sebelum '${targetSnapshot.summary}'`,
        timestamp: `${formattedDate}, ${formattedTime}`
      };

      const { data: actRecord } = await supabaseAdmin
        .from("site_content")
        .select("value")
        .eq("key", "activity_logs")
        .maybeSingle();

      const existingActLogs = Array.isArray(actRecord?.value) ? actRecord.value : [];
      const { error: logWriteErr } = await supabaseAdmin.from("site_content").upsert({
        key: "activity_logs",
        group_name: "audit",
        label: "Arsip Log Aktivitas Admin",
        value: [newAuditLog, ...existingActLogs.slice(0, 249)],
        updated_at: new Date().toISOString()
      }, { onConflict: "key" });
      if (logWriteErr) {
        console.warn("Gagal mencatat audit log rollback:", logWriteErr.message);
      }
    } catch (logErr) {
      console.warn("Gagal mencatat audit log rollback:", logErr);
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil melakukan rollback untuk '${targetSnapshot.targetKey}'. Konten telah dikembalikan ke kondisi sebelumnya.`
    });
  } catch (err: any) {
    console.error("AI Rollback API error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Gagal melakukan rollback." },
      { status: 500 }
    );
  }
}

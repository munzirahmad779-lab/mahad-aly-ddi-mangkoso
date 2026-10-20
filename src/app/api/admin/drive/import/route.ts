import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/supabase/admin-guard";
import { transferGoogleDriveImageToR2 } from "@/lib/drive/drive-importer";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = await requireRole(req, ["super_admin", "editor", "penulis"]);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { url, targetFolder = "masyayikh", customName } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { success: false, error: "Tautan (URL) Google Drive wajib diisi." },
        { status: 400 }
      );
    }

    const result = await transferGoogleDriveImageToR2(url, targetFolder, customName);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Gagal memproses gambar dari Google Drive." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      fileId: result.fileId,
      provider: result.provider,
      message: `Gambar berhasil dipindahkan dari Google Drive ke ${result.provider}!`
    });
  } catch (err: any) {
    console.error("Google Drive import error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Gagal mengimpor gambar dari Google Drive." },
      { status: 500 }
    );
  }
}

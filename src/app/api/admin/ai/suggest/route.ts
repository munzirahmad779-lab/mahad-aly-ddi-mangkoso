import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/supabase/admin-guard";
import { isAllowedAiKey, generateContentSuggestion, AllowedAiKey } from "@/lib/ai/editor-service";
import { supabaseAdmin } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

const MAX_PROMPT_CHARS = 8000;

export async function POST(req: NextRequest) {
  const auth = await requireRole(req, ["super_admin", "editor"]);
  if (!auth.ok) {
    return auth.response;
  }

  // Batas laju: endpoint ini memanggil layanan AI berbayar, jadi sesi
  // admin yang bocor tidak boleh membakar kuota tanpa batas.
  const rl = await checkRateLimit(`ai-suggest:${auth.email || getClientIp(req)}`, 20, 60 * 1000);
  if (!rl.allowed) return rateLimitResponse(rl);

  try {
    const body = await req.json().catch(() => ({}));
    const { prompt, targetKey, sourceUrl, currentData: clientCurrentData } = body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Prompt atau instruksi wajib diisi." },
        { status: 400 }
      );
    }

    if (prompt.length > MAX_PROMPT_CHARS) {
      return NextResponse.json(
        { success: false, error: `Prompt terlalu panjang (${prompt.length} karakter). Maksimal ${MAX_PROMPT_CHARS} karakter.` },
        { status: 400 }
      );
    }

    if (!targetKey || !isAllowedAiKey(targetKey)) {
      return NextResponse.json(
        {
          success: false,
          error: `Kunci konten '${targetKey}' tidak diizinkan untuk diubah oleh AI. Kunci yang diizinkan: home.hero, home_sections, about_page, page_texts, footer, header.`
        },
        { status: 400 }
      );
    }

    // Ambil data saat ini dari database Supabase jika tidak dikirim dari klien
    let currentData = clientCurrentData;
    if (!currentData) {
      const { data: dbData } = await supabaseAdmin
        .from("site_content")
        .select("value")
        .eq("key", targetKey)
        .maybeSingle();

      currentData = dbData?.value || {};
    }

    const suggestion = await generateContentSuggestion({
      prompt: prompt.trim(),
      targetKey: targetKey as AllowedAiKey,
      currentData,
      sourceUrl: typeof sourceUrl === "string" ? sourceUrl.trim() : undefined
    });

    return NextResponse.json({
      success: true,
      data: suggestion
    });
  } catch (err: any) {
    console.error("AI Suggest API error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Gagal memproses usulan AI." },
      { status: 500 }
    );
  }
}

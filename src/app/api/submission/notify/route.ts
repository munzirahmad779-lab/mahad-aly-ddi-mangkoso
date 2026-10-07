import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { sendStatusNotificationToAuthor } from "@/lib/email/service";
import { EmailTemplateItem } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, note, publishedArticleLink } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "Parameter 'id' dan 'status' wajib diisi." },
        { status: 400 }
      );
    }

    // 1. Fetch submission data from Supabase
    const { data: subData, error: subError } = await supabase
      .from("submissions")
      .select("*")
      .eq("id", id)
      .single();

    if (subError || !subData) {
      return NextResponse.json(
        { error: "Naskah tidak ditemukan di database." },
        { status: 404 }
      );
    }

    let extraMeta: any = {};
    if (subData.catatan_admin) {
      try {
        extraMeta = JSON.parse(subData.catatan_admin);
      } catch {
        extraMeta = { feedback: subData.catatan_admin };
      }
    }

    const trackingCode = extraMeta.trackingCode || `MAD-${new Date().getFullYear()}-${id.slice(0, 4)}`;

    // 2. Fetch custom email templates if any
    let customTemplates: EmailTemplateItem[] | undefined;
    const { data: tmplRow } = await supabase
      .from("site_content")
      .select("value")
      .eq("key", "email_templates")
      .single();
    if (tmplRow?.value && Array.isArray(tmplRow.value)) {
      customTemplates = tmplRow.value;
    }

    const accessCode = body.accessCode || extraMeta.accessCode;

    // 3. Send email to author
    let emailResult: any;
    if (status === "accepted" && accessCode) {
      const { sendStage2AccessCodeEmail } = await import("@/lib/email/service");
      emailResult = await sendStage2AccessCodeEmail({
        authorEmail: subData.email,
        authorName: subData.nama,
        title: subData.judul,
        trackingCode,
        accessCode,
        customTemplates
      });
    } else {
      emailResult = await sendStatusNotificationToAuthor({
        authorEmail: subData.email,
        authorName: subData.nama,
        title: subData.judul,
        trackingCode,
        status,
        note: note || extraMeta.feedback || "",
        publishedArticleLink,
        customTemplates
      });
    }

    return NextResponse.json({
      success: true,
      emailResult
    });
  } catch (error: any) {
    console.error("Submission notify error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

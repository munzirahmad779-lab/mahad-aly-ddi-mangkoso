import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, role, nama_lengkap } = body;

    if (!email || !role) {
      return NextResponse.json(
        { error: "Email dan Role wajib diisi." },
        { status: 400 }
      );
    }

    // 1. Kirim undangan via Supabase Auth Admin API
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email.trim());

    if (inviteError) {
      return NextResponse.json(
        { error: inviteError.message },
        { status: 400 }
      );
    }

    // 2. Simpan profil ke public.users
    if (inviteData?.user) {
      const { error: insertProfileError } = await supabaseAdmin.from("users").upsert(
        {
          id: inviteData.user.id,
          email: email.trim(),
          nama_lengkap: nama_lengkap?.trim() || email.split("@")[0],
          role: role, // 'editor' | 'penulis' | 'super_admin'
          is_active: true,
          updated_at: new Date().toISOString()
        },
        { onConflict: "id" }
      );

      if (insertProfileError) {
        console.error("Gagal simpan profil user:", insertProfileError.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Undangan email berhasil dikirim ke ${email}.`
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}

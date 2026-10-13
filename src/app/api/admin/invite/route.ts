import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/supabase/admin-guard";

type AppRole = "super_admin" | "editor" | "penulis";

function normalizeRole(value: unknown): AppRole | null {
  if (value === "admin" || value === "editor") return "editor";
  if (value === "super_admin" || value === "penulis") return value;
  return null;
}

export async function POST(request: Request) {
  try {
    const authorization = await requireSuperAdmin(request);
    if (!authorization.ok) return authorization.response;

    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const role = normalizeRole(body.role);
    const namaLengkap = typeof body.nama_lengkap === "string" && body.nama_lengkap.trim()
      ? body.nama_lengkap.trim()
      : email.split("@")[0];

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !role) {
      return NextResponse.json({ error: "Email valid dan role yang diizinkan wajib diisi." }, { status: 400 });
    }

    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { nama_lengkap: namaLengkap }
    });
    if (inviteError) return NextResponse.json({ error: inviteError.message }, { status: 400 });

    if (!inviteData?.user) {
      return NextResponse.json({ error: "Undangan tidak menghasilkan akun Auth yang dapat diverifikasi." }, { status: 500 });
    }

    const { error: profileError } = await supabaseAdmin
      .from("users")
      .upsert({
        id: inviteData.user.id,
        email,
        nama_lengkap: namaLengkap,
        role,
        is_active: true,
        updated_at: new Date().toISOString()
      }, { onConflict: "id" })
      .select("id")
      .single();

    if (profileError) {
      console.error("Gagal menyimpan profil undangan:", profileError.message);
      const { error: rollbackError } = await supabaseAdmin.auth.admin.deleteUser(inviteData.user.id);
      if (rollbackError) console.error("Gagal membatalkan akun undangan setelah profil gagal:", rollbackError.message);
      return NextResponse.json({
        error: `Undangan tidak dinyatakan berhasil karena profil database gagal disimpan: ${profileError.message}${rollbackError ? "; akun undangan perlu diperiksa manual." : "; akun undangan yang baru dibuat telah dibatalkan."}`
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Undangan email berhasil dikirim ke ${email}.`,
      user: { id: inviteData.user.id, email, nama_lengkap: namaLengkap, role, is_active: true }
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan pada server.";
    console.error("API admin invite error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
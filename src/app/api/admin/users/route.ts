import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, userId, email, password, nama_lengkap, role, is_active } = body;

    // 1. BUAT PENGGUNA BARU LANGSUNG (DENGAN USERNAME & KATA SANDI)
    if (action === "create_user") {
      if (!email || !password) {
        return NextResponse.json({ error: "Email dan Kata Sandi wajib diisi." }, { status: 400 });
      }
      if (password.length < 6) {
        return NextResponse.json({ error: "Kata Sandi minimal 6 karakter." }, { status: 400 });
      }

      // Buat akun di Supabase Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: email.trim(),
        password: password,
        email_confirm: true,
        user_metadata: {
          nama_lengkap: nama_lengkap?.trim() || email.split("@")[0]
        }
      });

      if (authError) {
        return NextResponse.json({ error: authError.message }, { status: 400 });
      }

      if (!authData?.user) {
        return NextResponse.json({ error: "Gagal membuat kredensial akun pengguna." }, { status: 500 });
      }

      // Simpan metadata ke tabel public.users
      const { error: dbError } = await supabaseAdmin.from("users").upsert({
        id: authData.user.id,
        email: email.trim(),
        nama_lengkap: nama_lengkap?.trim() || email.split("@")[0],
        role: role || "admin",
        is_active: is_active !== false,
        updated_at: new Date().toISOString()
      }, { onConflict: "id" });

      if (dbError) {
        console.warn("DB notice saat insert public.users:", dbError.message);
      }

      return NextResponse.json({
        success: true,
        message: `Akun untuk ${email} berhasil dibuat dengan kata sandi baru!`,
        user: {
          id: authData.user.id,
          email: email.trim(),
          nama_lengkap: nama_lengkap?.trim() || email.split("@")[0],
          role: role || "admin",
          is_active: true
        }
      });
    }

    // 2. RESET / GANTI KATA SANDI PENGGUNA (OLEH SUPER ADMIN)
    if (action === "reset_password") {
      if (!userId || !password) {
        return NextResponse.json({ error: "User ID dan Kata Sandi baru wajib diisi." }, { status: 400 });
      }
      if (password.length < 6) {
        return NextResponse.json({ error: "Kata sandi baru minimal 6 karakter." }, { status: 400 });
      }

      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: password
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: `Kata sandi untuk pengguna berhasil diperbarui!`
      });
    }

    // 3. EDIT NAMA LENGKAP / PROFIL PENGGUNA
    if (action === "update_profile") {
      if (!userId) {
        return NextResponse.json({ error: "User ID wajib disertakan." }, { status: 400 });
      }

      const updateData: any = {
        updated_at: new Date().toISOString()
      };
      if (nama_lengkap !== undefined) updateData.nama_lengkap = nama_lengkap.trim();
      if (role !== undefined) updateData.role = role;
      if (is_active !== undefined) updateData.is_active = Boolean(is_active);

      const { error: dbError } = await supabaseAdmin
        .from("users")
        .update(updateData)
        .eq("id", userId);

      if (dbError) {
        return NextResponse.json({ error: dbError.message }, { status: 400 });
      }

      if (nama_lengkap) {
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          user_metadata: { nama_lengkap: nama_lengkap.trim() }
        });
      }

      return NextResponse.json({
        success: true,
        message: "Profil pengguna berhasil diperbarui!"
      });
    }

    // 4. HAPUS PENGGUNA
    if (action === "delete_user") {
      if (!userId) {
        return NextResponse.json({ error: "User ID wajib disertakan." }, { status: 400 });
      }

      // Hapus dari public.users
      await supabaseAdmin.from("users").delete().eq("id", userId);

      // Hapus dari auth.users
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: "Pengguna berhasil dihapus secara permanen dari sistem."
      });
    }

    return NextResponse.json({ error: "Aksi tidak dikenali." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Terjadi kesalahan internal pada server." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/supabase/admin-guard";

type AppRole = "super_admin" | "editor" | "penulis";

function normalizeRole(value: unknown): AppRole | null {
  // UI menyebut peran ini "admin", sedangkan constraint database/RLS memakai "editor".
  if (value === "admin" || value === "editor") return "editor";
  if (value === "super_admin" || value === "penulis") return value;
  return null;
}

function isDuplicateEmailError(error: { message?: string; code?: string }): boolean {
  return error.code === "email_exists" || /already\s+(been\s+)?registered|already exists|email_exists|duplicate/i.test(error.message || "");
}

async function findAuthUserByEmail(email: string) {
  const perPage = 100;
  for (let page = 1; page <= 100; page += 1) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(`Gagal memeriksa akun Auth yang sudah ada: ${error.message}`);
    const users = data.users || [];
    const match = users.find((user) => user.email?.trim().toLowerCase() === email);
    if (match) return match;
    if (users.length < perPage) return null;
  }
  throw new Error("Pencarian akun melebihi batas aman. Periksa akun Auth secara manual.");
}

async function upsertPublicProfile(input: {
  id: string;
  email: string;
  nama_lengkap: string;
  role: AppRole;
  is_active: boolean;
}) {
  const { error } = await supabaseAdmin
    .from("users")
    .upsert({ ...input, updated_at: new Date().toISOString() }, { onConflict: "id" })
    .select("id")
    .single();
  return error;
}

export async function POST(request: Request) {
  try {
    const authorization = await requireSuperAdmin(request);
    if (!authorization.ok) return authorization.response;

    const body = await request.json();
    const { action, userId, password, nama_lengkap, is_active } = body;
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const displayName = typeof nama_lengkap === "string" && nama_lengkap.trim()
      ? nama_lengkap.trim()
      : email.split("@")[0];

    if (action === "create_user") {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || typeof password !== "string") {
        return NextResponse.json({ error: "Alamat email valid dan kata sandi wajib diisi." }, { status: 400 });
      }
      if (password.length < 6) {
        return NextResponse.json({ error: "Kata sandi minimal 6 karakter." }, { status: 400 });
      }

      const normalizedRole = normalizeRole(body.role ?? "admin");
      if (!normalizedRole) {
        return NextResponse.json({ error: "Role tidak valid. Gunakan Admin, Penulis, atau Super Admin." }, { status: 400 });
      }
      const active = is_active !== false;

      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { nama_lengkap: displayName }
      });

      if (authError) {
        // Pulihkan akun lama yang pernah dibuat Auth tetapi gagal mendapat baris public.users.
        if (!isDuplicateEmailError(authError)) {
          return NextResponse.json({ error: authError.message }, { status: 400 });
        }

        let existingAuthUser;
        try {
          existingAuthUser = await findAuthUserByEmail(email);
        } catch (lookupError) {
          return NextResponse.json({ error: lookupError instanceof Error ? lookupError.message : "Gagal memeriksa akun lama." }, { status: 500 });
        }
        if (!existingAuthUser) {
          return NextResponse.json({ error: authError.message }, { status: 400 });
        }

        const { data: existingProfile, error: profileLookupError } = await supabaseAdmin
          .from("users")
          .select("id")
          .eq("id", existingAuthUser.id)
          .maybeSingle();

        if (profileLookupError) {
          return NextResponse.json({ error: `Gagal memeriksa profil akun: ${profileLookupError.message}` }, { status: 500 });
        }
        if (existingProfile) {
          return NextResponse.json({ error: "Akun dengan email ini sudah memiliki profil. Tidak ada perubahan yang dilakukan; gunakan fitur reset kata sandi bila diperlukan." }, { status: 409 });
        }

        const profileError = await upsertPublicProfile({
          id: existingAuthUser.id,
          email,
          nama_lengkap: displayName,
          role: normalizedRole,
          is_active: active
        });
        if (profileError) {
          console.error("Gagal memulihkan profil akun Auth lama:", profileError.message);
          return NextResponse.json({ error: `Akun Auth sudah ada, tetapi profil database gagal dibuat: ${profileError.message}` }, { status: 500 });
        }

        const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(existingAuthUser.id, {
          password,
          email_confirm: true,
          user_metadata: { nama_lengkap: displayName }
        });
        if (passwordError) {
          const { error: cleanupError } = await supabaseAdmin.from("users").delete().eq("id", existingAuthUser.id);
          if (cleanupError) console.error("Gagal membersihkan profil setelah pemulihan gagal:", cleanupError.message);
          return NextResponse.json({ error: `Profil ditemukan kembali, tetapi kata sandi akun lama gagal diperbarui: ${passwordError.message}` }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          message: `Akun lama ${email} berhasil dipulihkan. Profil database sudah dibuat dan kata sandi diperbarui.`,
          user: { id: existingAuthUser.id, email, nama_lengkap: displayName, role: normalizedRole, is_active: active },
          recovered: true
        });
      }

      if (!authData?.user) {
        return NextResponse.json({ error: "Supabase Auth tidak mengembalikan data pengguna; akun tidak dapat diverifikasi." }, { status: 500 });
      }

      const profileError = await upsertPublicProfile({
        id: authData.user.id,
        email,
        nama_lengkap: displayName,
        role: normalizedRole,
        is_active: active
      });

      if (profileError) {
        console.error("Gagal menyimpan profil pengguna baru:", profileError.message);
        const { error: rollbackError } = await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        if (rollbackError) console.error("Gagal membatalkan akun Auth setelah penyimpanan profil gagal:", rollbackError.message);
        return NextResponse.json({
          error: `Akun tidak dinyatakan berhasil karena profil database gagal disimpan: ${profileError.message}${rollbackError ? "; pembersihan akun Auth juga gagal dan perlu pemeriksaan manual." : "; pembuatan akun Auth yang baru telah dibatalkan."}`
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `Akun ${email} berhasil dibuat dan profil login tersimpan.`,
        user: { id: authData.user.id, email, nama_lengkap: displayName, role: normalizedRole, is_active: active }
      });
    }

    if (action === "reset_password") {
      if (typeof userId !== "string" || !userId || typeof password !== "string") {
        return NextResponse.json({ error: "User ID dan kata sandi baru wajib diisi." }, { status: 400 });
      }
      if (password.length < 6) {
        return NextResponse.json({ error: "Kata sandi baru minimal 6 karakter." }, { status: 400 });
      }
      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, { password });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ success: true, message: "Kata sandi pengguna berhasil diperbarui." });
    }

    if (action === "update_profile") {
      if (typeof userId !== "string" || !userId) {
        return NextResponse.json({ error: "User ID wajib disertakan." }, { status: 400 });
      }
      const updateData: { updated_at: string; nama_lengkap?: string; role?: AppRole; is_active?: boolean } = {
        updated_at: new Date().toISOString()
      };
      if (nama_lengkap !== undefined) {
        if (typeof nama_lengkap !== "string" || !nama_lengkap.trim()) {
          return NextResponse.json({ error: "Nama lengkap tidak valid." }, { status: 400 });
        }
        updateData.nama_lengkap = nama_lengkap.trim();
      }
      if (body.role !== undefined) {
        const normalizedRole = normalizeRole(body.role);
        if (!normalizedRole) return NextResponse.json({ error: "Role tidak valid." }, { status: 400 });
        updateData.role = normalizedRole;
      }
      if (is_active !== undefined) updateData.is_active = Boolean(is_active);

      const { data: updatedProfile, error: dbError } = await supabaseAdmin
        .from("users")
        .update(updateData)
        .eq("id", userId)
        .select("id")
        .maybeSingle();
      if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 });
      if (!updatedProfile) return NextResponse.json({ error: "Profil pengguna tidak ditemukan." }, { status: 404 });

      if (updateData.nama_lengkap) {
        const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
          user_metadata: { nama_lengkap: updateData.nama_lengkap }
        });
        if (authUpdateError) {
          return NextResponse.json({ error: `Profil database tersimpan, tetapi metadata Auth gagal diperbarui: ${authUpdateError.message}` }, { status: 500 });
        }
      }
      return NextResponse.json({ success: true, message: "Profil pengguna berhasil diperbarui." });
    }

    if (action === "delete_user") {
      if (typeof userId !== "string" || !userId) {
        return NextResponse.json({ error: "User ID wajib disertakan." }, { status: 400 });
      }
      // Relasi public.users menggunakan ON DELETE CASCADE terhadap auth.users.
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ success: true, message: "Pengguna berhasil dihapus dari sistem." });
    }

    return NextResponse.json({ error: "Aksi tidak dikenali." }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan internal pada server.";
    console.error("API admin users error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
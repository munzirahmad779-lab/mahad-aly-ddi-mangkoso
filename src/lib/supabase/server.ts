import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ymxijorgoucpsxgcvtgu.supabase.co";

// Kunci publik cadangan (sama dengan yang dipakai client). Bukan rahasia: hanya
// publishable/anon key. Mencegah galat "Invalid API key" saat env belum diset,
// sementara penulisan tetap dibatasi Row-Level Security.
const SUPABASE_PUBLISHABLE_FALLBACK = "sb_publishable_8Y6NE0t_5z4Jo2u3G50bbQ_e1qTTOB-";

const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  SUPABASE_PUBLISHABLE_FALLBACK;

// Server client with administrative privileges (for secure server actions / routes)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

// Client anon untuk operasi auth di server (mis. proxy login) — TIDAK punya
// hak istimewa; RLS tetap berlaku. Verifikasi kredensial tidak boleh memakai
// service role.
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_PUBLISHABLE_FALLBACK;

export const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ymxijorgoucpsxgcvtgu.supabase.co";

// Kunci publik cadangan (sama dengan yang dipakai client). Bukan rahasia: hanya
// publishable/anon key. Mencegah galat "Invalid API key" saat env belum diset,
// sementara penulisan tetap dibatasi Row-Level Security.
// Fallback ini HANYA untuk klien anon (supabaseAnon di bawah). Klien admin
// TIDAK PERNAH boleh jatuh ke kunci ini.
const SUPABASE_PUBLISHABLE_FALLBACK = "sb_publishable_8Y6NE0t_5z4Jo2u3G50bbQ_e1qTTOB-";

// ---------------------------------------------------------------------------
// supabaseAdmin: klien server berhak istimewa (service role).
//
// Dulu kunci admin berjenjang jatuh ke NEXT_PUBLIC_SUPABASE_ANON_KEY lalu ke
// konstanta publishable bila SUPABASE_SERVICE_ROLE_KEY kosong. Akibatnya, di
// lingkungan yang env-nya hilang, klien "admin" diam-diam beroperasi sebagai
// anon dan kegagalannya tampak seperti misteri RLS.
//
// Sekarang kegagalan itu EKSPLISIT: tanpa SUPABASE_SERVICE_ROLE_KEY, pemakaian
// supabaseAdmin melempar galat yang menyebut env yang hilang. Pelemparan
// ditunda sampai klien benar-benar dipakai (Proxy malas), BUKAN saat modul
// dimuat, supaya build dan alur publik yang hanya memakai supabaseAnon tidak
// ikut patah di lingkungan tanpa kunci service role.
// ---------------------------------------------------------------------------

const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function createSupabaseAdminClient() {
  return createClient(supabaseUrl, supabaseServiceRoleKey as string, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

type SupabaseAdminClient = ReturnType<typeof createSupabaseAdminClient>;

let cachedAdminClient: SupabaseAdminClient | null = null;

function requireSupabaseAdmin(): SupabaseAdminClient {
  if (!supabaseServiceRoleKey) {
    const message =
      "SUPABASE_SERVICE_ROLE_KEY tidak terpasang di server. supabaseAdmin menolak berjalan dengan kunci anon/publishable; pasang env service role pada server (Cloudflare) sebelum memakai route admin.";
    console.error(message);
    throw new Error(message);
  }
  if (!cachedAdminClient) {
    cachedAdminClient = createSupabaseAdminClient();
  }
  return cachedAdminClient;
}

type AnyFunction = (this: unknown, ...args: unknown[]) => unknown;

// Server client with administrative privileges (for secure server actions / routes)
export const supabaseAdmin: SupabaseAdminClient = new Proxy({} as SupabaseAdminClient, {
  get(_target, prop) {
    const client = requireSupabaseAdmin();
    const value = (client as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === "function" ? (value as AnyFunction).bind(client) : value;
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

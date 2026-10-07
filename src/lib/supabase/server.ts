import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ymxijorgoucpsxgcvtgu.supabase.co";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "fallback-build-key";

// Server client with administrative privileges (for secure server actions / routes)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ymxijorgoucpsxgcvtgu.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_8Y6NE0t_5z4Jo2u3G50bbQ_e1qTTOB-";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

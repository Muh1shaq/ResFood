import { createClient } from "@supabase/supabase-js";

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-url.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

// Clean trailing '/rest/v1/' or '/rest/v1' from URL if present
if (supabaseUrl) {
  if (supabaseUrl.endsWith('/rest/v1/')) {
    supabaseUrl = supabaseUrl.slice(0, -'/rest/v1/'.length);
  } else if (supabaseUrl.endsWith('/rest/v1')) {
    supabaseUrl = supabaseUrl.slice(0, -'/rest/v1'.length);
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

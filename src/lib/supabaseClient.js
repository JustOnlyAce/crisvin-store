import { createClient } from "@supabase/supabase-js";

// These come from your .env file (see .env.example). Never hardcode real
// keys here directly, so the project stays safe to share/push publicly.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

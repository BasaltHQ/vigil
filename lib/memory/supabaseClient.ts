import { createClient } from "@supabase/supabase-js";

// Uses the user's provided credentials, defaults to empty strings to avoid crashes before they are set
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

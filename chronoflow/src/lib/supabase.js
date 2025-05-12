import { createClient } from "@supabase/supabase-js";

// Utilise les variables d'environnement Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export de supabase.auth.getUser pour autocomplétion si besoin
export const getUser = supabase.auth.getUser;

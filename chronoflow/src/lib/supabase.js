// Note: Ce fichier ne doit plus être utilisé pour l'authentification.
// Utilisez vos endpoints backend pour login/signup.

import { createClient } from "@supabase/supabase-js";

// Utilise les variables d'environnement Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

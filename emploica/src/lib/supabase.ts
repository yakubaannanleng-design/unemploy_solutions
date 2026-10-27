// Client Supabase pour Workca.
// Variables d'environnement requises (fichier .env) :
//   VITE_SUPABASE_URL=https://vmmvniqdxnvpkmqhrbxb.supabase.co
//   VITE_SUPABASE_ANON_KEY=<votre anon key>
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Client null si les variables ne sont pas configurées (évite le crash en prod sans .env).
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
// Client Supabase pour Workca.
// Variables d'environnement requises (fichier .env) :
//   VITE_SUPABASE_URL=https://vmmvniqdxnvpkmqhrbxb.supabase.co
//   VITE_SUPABASE_ANON_KEY=<votre anon key>
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
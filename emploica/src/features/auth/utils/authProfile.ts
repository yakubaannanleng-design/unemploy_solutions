import type { User as SupabaseAuthUser } from "@supabase/supabase-js";
import type { User } from "@/types";
import { supabase } from "@/lib/supabase";

type UserProfileRow = {
  id: string;
  role: User["role"];
  name: string;
  phone: string;
  email: string | null;
  status: User["status"];
  verification: string;
  created_at: string;
};

function mapUser(row: UserProfileRow): User {
  return {
    id: row.id,
    role: row.role,
    name: row.name,
    phone: row.phone,
    email: row.email ?? undefined,
    passwordHash: "",
    status: row.status,
    verification: row.verification === "verifie" ? "vérifié" : "déclaré",
    createdAt: row.created_at,
  };
}

export async function resolveWorkcaUser(authUser: SupabaseAuthUser): Promise<User> {
  if (!supabase) throw new Error("Connexion à Supabase indisponible.");

  const loadProfile = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("id,role,name,phone,email,status,verification,created_at")
      .eq("id", authUser.id)
      .maybeSingle();
    if (error) throw error;
    return data as UserProfileRow | null;
  };

  let profile = await loadProfile();
  if (!profile) {
    const metadata = authUser.user_metadata ?? {};
    const email = authUser.email ?? "";
    const name = typeof metadata.name === "string" && metadata.name.trim()
      ? metadata.name.trim()
      : email.split("@")[0] || "Utilisateur Workca";
    const role: User["role"] = metadata.role === "employeur" ? "employeur" : "chercheur";
    const phone = typeof metadata.phone === "string" ? metadata.phone.trim() : "";
    const { data, error } = await supabase
      .from("users")
      .insert({
        id: authUser.id,
        role,
        name,
        phone,
        email,
        password_hash: "",
        status: "actif",
        verification: "declare",
        created_at: authUser.created_at,
      })
      .select("id,role,name,phone,email,status,verification,created_at")
      .maybeSingle();

    if (error && error.code !== "23505") throw error;
    profile = data ?? await loadProfile();
  }

  if (!profile) throw new Error("Le profil Workca associé au compte n'a pas pu être chargé.");
  return mapUser(profile);
}

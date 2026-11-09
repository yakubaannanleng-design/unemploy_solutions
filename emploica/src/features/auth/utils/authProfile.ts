import type { User as SupabaseAuthUser } from "@supabase/supabase-js";
import type { User, WorkspaceRole } from "@/types";
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
  active_role?: WorkspaceRole | null;
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
    activeRole: row.active_role === "entreprise" || row.active_role === "employeur" || row.active_role === "chercheur"
      ? row.active_role
      : row.role === "employeur" ? "employeur" : "chercheur",
  };
}

export async function resolveWorkcaUser(authUser: SupabaseAuthUser): Promise<User> {
  if (!supabase) throw new Error("Connexion à Supabase indisponible.");

  const loadProfile = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("id,role,name,phone,email,status,verification,created_at,active_role")
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
      .select("id,role,name,phone,email,status,verification,created_at,active_role")
      .maybeSingle();

    if (error && error.code !== "23505") throw error;
    profile = data ?? await loadProfile();
  }

  if (!profile) throw new Error("Le profil Workca associé au compte n'a pas pu être chargé.");
  const user = mapUser(profile);
  let roleRows: Array<{ role?: string }> = [];
  try {
    const rolesTable = supabase.from("user_roles") as {
      select?: (columns: string) => {
        eq?: (column: string, value: string) => Promise<{
          data?: Array<{ role?: string }> | null;
          error?: unknown;
        }>;
      };
    };
    const roleQuery = typeof rolesTable?.select === "function" ? rolesTable.select("role") : null;
    if (roleQuery && typeof roleQuery.eq === "function") {
      const result = await roleQuery.eq("user_id", authUser.id);
      roleRows = result.data ?? [];
    }
  } catch {
    // Older previews can run before the role migration is available.
  }
  const roles = (roleRows ?? [])
    .map((row) => row.role)
    .filter((role): role is WorkspaceRole => role === "chercheur" || role === "employeur" || role === "entreprise");
  const normalizedRoles = roles.length > 0 ? roles : [user.activeRole ?? "chercheur"];
  if (roles.length === 0) {
    try {
      const rolesTable = supabase.from("user_roles") as {
        upsert?: (values: Record<string, unknown>, options?: Record<string, unknown>) => Promise<unknown>;
      };
      if (rolesTable?.upsert) {
        await rolesTable.upsert(
          { user_id: authUser.id, role: normalizedRoles[0] },
          { onConflict: "user_id,role" },
        );
      }
    } catch {
      // Keep authentication successful while an older preview lacks user_roles.
    }
  }
  return { ...user, roles: normalizedRoles };
}

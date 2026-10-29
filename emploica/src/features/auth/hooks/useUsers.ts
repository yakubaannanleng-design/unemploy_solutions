import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { User } from "../types";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      if (!supabase) return [];
      const { data, error } = await supabase.from("users").select("*");
      if (error) throw error;
      return (data ?? []).map((u: Record<string, unknown>) => ({
        id: u.id,
        role: u.role,
        name: u.name,
        phone: u.phone,
        email: u.email,
        passwordHash: u.password_hash ?? "",
        status: u.status,
        verification: u.verification === "verifie" ? "vérifié" : "déclaré",
        createdAt: u.created_at,
      })) as User[];
    },
    enabled: !!supabase,
  });
}

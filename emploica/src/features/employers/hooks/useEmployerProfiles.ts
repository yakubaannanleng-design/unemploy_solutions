import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { EmployerProfile } from "../types";

export function useEmployerProfiles() {
  return useQuery({
    queryKey: ["employerProfiles"],
    queryFn: async () => {
      if (!supabase) return [];
      const { data, error } = await supabase.from("employer_profiles").select("*");
      if (error) throw error;
      return (data ?? []).map((e: Record<string, unknown>) => ({
        userId: e.user_id,
        orgName: e.org_name,
        description: e.description ?? "",
        orgType: e.org_type,
        verification: e.verification === "verifie" ? "vérifié" : "déclaré",
        verifiedAt: e.verified_at,
        verificationRequested: e.verification_requested,
        verificationRequestedAt: e.verification_requested_at,
      })) as EmployerProfile[];
    },
    enabled: !!supabase,
  });
}

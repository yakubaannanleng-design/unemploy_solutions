import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { Application } from "../types";

export function useApplications() {
  return useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      if (!supabase) return [];
      const { data, error } = await supabase.from("applications").select("*");
      if (error) throw error;
      return (data ?? []).map((a: Record<string, unknown>) => ({
        id: a.id,
        offerId: a.offer_id,
        seekerId: a.seeker_id,
        status: a.status,
        createdAt: a.created_at,
      })) as Application[];
    },
    enabled: !!supabase,
  });
}

export function useUserApplications(userId: string | null) {
  return useQuery({
    queryKey: ["applications", userId],
    queryFn: async () => {
      if (!supabase || !userId) return [];
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("seeker_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((a: Record<string, unknown>) => ({
        id: a.id,
        offerId: a.offer_id,
        seekerId: a.seeker_id,
        status: a.status,
        createdAt: a.created_at,
      })) as Application[];
    },
    enabled: !!supabase && !!userId,
  });
}

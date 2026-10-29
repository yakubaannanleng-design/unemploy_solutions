import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { Signalement } from "../types";

export function useSignalements() {
  return useQuery({
    queryKey: ["signalements"],
    queryFn: async () => {
      if (!supabase) return [];
      const { data, error } = await supabase.from("signalements").select("*");
      if (error) throw error;
      return (data ?? []).map((s: Record<string, unknown>) => ({
        id: s.id,
        authorId: s.author_id,
        targetType: s.target_type,
        targetId: s.target_id,
        reason: s.reason,
        createdAt: s.created_at,
        status: s.status,
      })) as Signalement[];
    },
    enabled: !!supabase,
  });
}

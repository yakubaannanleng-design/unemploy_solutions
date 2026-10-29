import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Transaction } from "../types";

export function useTransactions() {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      if (!supabase) return [];
      const { data, error } = await supabase.from("transactions").select("*");
      if (error) throw error;
      return (data ?? []).map((t: Record<string, unknown>) => ({
        id: t.id,
        userId: t.user_id,
        type: t.type,
        amount: t.amount,
        operator: t.operator,
        status: t.status,
        createdAt: t.created_at,
      })) as Transaction[];
    },
    enabled: !!supabase,
  });
}

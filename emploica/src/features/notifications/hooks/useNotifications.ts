import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Notification } from "../types";

export function useNotifications(userId: string | null) {
  return useQuery({
    queryKey: ["notifications", userId],
    queryFn: async () => {
      if (!supabase || !userId) return [];
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((n: Record<string, unknown>) => ({
        id: n.id,
        userId: n.user_id,
        type: n.type,
        body: n.body,
        createdAt: n.created_at,
        read: n.read,
      })) as Notification[];
    },
    enabled: !!supabase && !!userId,
  });
}

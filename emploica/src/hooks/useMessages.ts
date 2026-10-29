import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { Message } from "../types";

export function useMessages(conversationId: string | null) {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!supabase || !conversationId) return [];
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((m: Record<string, unknown>) => ({
        id: m.id,
        senderId: m.sender_id,
        receiverId: m.receiver_id,
        body: m.body,
        createdAt: m.created_at,
        status: m.status,
      })) as Message[];
    },
    enabled: !!supabase && !!conversationId,
  });
}

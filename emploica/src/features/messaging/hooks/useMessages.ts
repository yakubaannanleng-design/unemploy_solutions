import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Message } from "../types";

export function useMessages(conversationId: string | null) {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!supabase || !conversationId) throw new Error("Supabase et une conversation sont nécessaires.");
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((row): Message => ({
        id: typeof row.id === "string" ? row.id : "",
        senderId: typeof row.sender_id === "string" ? row.sender_id : "",
        receiverId: typeof row.receiver_id === "string" ? row.receiver_id : "",
        body: typeof row.body === "string" ? row.body : "",
        createdAt: typeof row.created_at === "string" ? row.created_at : "",
        status: row.status === "lu" ? "lu" : "envoyé",
      }));
    },
    enabled: !!supabase && !!conversationId,
  });
}

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Conversation, Message } from "../types";

function mapMessage(row: Record<string, unknown>): Message {
  return {
    id: typeof row.id === "string" ? row.id : "",
    senderId: typeof row.sender_id === "string" ? row.sender_id : "",
    receiverId: typeof row.receiver_id === "string" ? row.receiver_id : "",
    body: typeof row.body === "string" ? row.body : "",
    createdAt: typeof row.created_at === "string" ? row.created_at : "",
    status: row.status === "lu" ? "lu" : "envoyé",
  };
}

export function useConversations(userId: string | null) {
  return useQuery({
    queryKey: ["conversations", userId],
    queryFn: async () => {
      if (!supabase || !userId) throw new Error("Supabase et un compte utilisateur sont nécessaires.");
      const { data: rows, error } = await supabase
        .from("conversations")
        .select("*")
        .contains("participants", [userId]);
      if (error) throw error;

      const conversationRows = rows ?? [];
      if (conversationRows.length === 0) return [] as Conversation[];
      const ids = conversationRows.map((row) => row.id);
      const { data: messageRows, error: messagesError } = await supabase
        .from("messages")
        .select("*")
        .in("conversation_id", ids)
        .order("created_at", { ascending: true });
      if (messagesError) throw messagesError;

      const messagesByConversation = new Map<string, Message[]>();
      for (const row of messageRows ?? []) {
        const message = mapMessage(row as Record<string, unknown>);
        const list = messagesByConversation.get(row.conversation_id) ?? [];
        list.push(message);
        messagesByConversation.set(row.conversation_id, list);
      }

      return conversationRows.map((row) => ({
        id: row.id,
        participants: row.participants,
        messages: messagesByConversation.get(row.id) ?? [],
      })) as Conversation[];
    },
    enabled: !!supabase && !!userId,
  });
}

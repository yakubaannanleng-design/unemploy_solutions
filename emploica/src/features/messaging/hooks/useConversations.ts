import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Conversation } from "../types";

export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      if (!supabase) return [];
      const { data: convs, error: cErr } = await supabase.from("conversations").select("*");
      if (cErr) throw cErr;
      const { data: msgs, error: mErr } = await supabase.from("messages").select("*");
      if (mErr) throw mErr;
      const byConv = new Map<string, { id: string; senderId: string; receiverId: string; body: string; createdAt: string; status: string }[]>();
      for (const m of msgs ?? []) {
        const list = byConv.get(m.conversation_id) ?? [];
        list.push({
          id: m.id,
          senderId: m.sender_id,
          receiverId: m.receiver_id,
          body: m.body,
          createdAt: m.created_at,
          status: m.status,
        });
        byConv.set(m.conversation_id, list);
      }
      return (convs ?? []).map((c: Record<string, unknown>) => ({
        id: c.id,
        participants: c.participants,
        messages: byConv.get(c.id as string) ?? [],
      })) as Conversation[];
    },
    enabled: !!supabase,
  });
}

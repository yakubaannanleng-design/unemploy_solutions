/**
 * PROBLÈME RÉSOLU : affiche le fil de discussion d'une conversation et permet d'envoyer un message.
 * RESPONSABILITÉ  : rendu du thread, marquage des messages comme lus (store), envoi de message (store + Supabase insert message/conversation).
 * NE FAIT PAS     : ne liste pas les conversations (délégué à MessagesView).
 * DÉPEND DE       : lib/store, lib/supabase, lib/i18n, components/ui/*, types/Message.
 * UTILISÉ PAR     : features/messaging/components/MessagesView.
 */
import { useState, useEffect } from "react";
import { useStore } from "lib/store";
import { supabase } from "lib/supabase";
import { useLang, t } from "lib/i18n";
import { Input } from "components/ui/input";
import { Button } from "components/ui/button";
import { Badge } from "components/ui/badge";
import { ScrollArea } from "components/ui/scroll-area";
import { Separator } from "components/ui/separator";
import type { Conversation, Message } from "@/types";

interface MessagingProps {
  conversationId: string | null;
  otherId: string | null;
}

export default function Messaging({ conversationId, otherId }: MessagingProps) {
  const { lang } = useLang();
  const { state, replace, update, currentUser } = useStore();
  const [text, setText] = useState("");
  const conv = state.conversations.find((c) => c.id === conversationId);
  useEffect(() => {
    if (!conv) return;
    const hasUnread = conv.messages.some((m) => m.receiverId === currentUser.id && m.status !== "lu");
    if (!hasUnread) return;
    update(
      "conversations",
      state.conversations.map((c) =>
        c.id === conv!.id
          ? { ...c, messages: c.messages.map((m) => (m.receiverId === currentUser.id ? { ...m, status: "lu" } : m)) }
          : c
      ) as Conversation[]
    );
  }, [conversationId]);

  const other = otherId ? state.users.find((u) => u.id === otherId) : null;

  const send = () => {
    if (!text.trim() || !conv || !otherId) return;
    const msg: Message = {
      id: "msg-" + Math.random().toString(36).slice(2, 9),
      senderId: currentUser.id,
      receiverId: otherId,
      body: text.trim(),
      createdAt: new Date().toISOString(),
      status: "envoyé",
    };
    replace("conversations", { ...conv, messages: [...conv.messages, msg] });
    if (supabase) {
      supabase.from("messages").insert({
        id: msg.id,
        conversation_id: conv.id,
        sender_id: msg.senderId,
        receiver_id: msg.receiverId,
        body: msg.body,
        created_at: msg.createdAt,
        status: "envoye",
      }).then(({ error }) => {
        if (error) console.error("Supabase insert message error:", error);
      });
      // Créer la conversation si absente
      const exists = state.conversations.some((c) => c.id === conv!.id);
      if (!exists) {
        supabase.from("conversations").insert({
          id: conv.id,
          participants: conv.participants,
          created_at: new Date().toISOString(),
        }).then(({ error }) => {
          if (error) console.error("Supabase insert conversation error:", error);
        });
      }
    }
    setText("");
  };

  if (!conv) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-muted-foreground">
        {t("noResults", lang)}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[70vh]">
      <div className="px-4 py-2 border-b flex items-center gap-2">
        <Badge variant="secondary">{other?.name ?? t("unknownUser", lang)}</Badge>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2">
          {conv.messages.map((m) => {
            const mine = m.senderId === currentUser.id;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                    mine ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  {m.body}
                  <div className={`text-[10px] mt-1 opacity-70 ${mine ? "text-right" : ""}`}>
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
      <div className="p-3 border-t flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("writeMessage", lang)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
        />
        <Button onClick={send}>{t("send", lang)}</Button>
      </div>
    </div>
  );
}
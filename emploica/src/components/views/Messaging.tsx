import { useState } from "react";
import { useStore } from "../../lib/store";
import { useLang, t } from "../../lib/i18n";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import type { Message } from "../../types";

interface MessagingProps {
  conversationId: string | null;
  otherId: string | null;
}

export default function Messaging({ conversationId, otherId }: MessagingProps) {
  const { lang } = useLang();
  const { state, replace, currentUser } = useStore();
  const [text, setText] = useState("");
  const conv = state.conversations.find((c) => c.id === conversationId);
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
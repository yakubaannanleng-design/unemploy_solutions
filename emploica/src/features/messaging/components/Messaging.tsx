import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { useStore } from "@/lib/store";
import { useLang, t } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMessages } from "../hooks/useMessages";
import type { Conversation } from "../types";

interface MessagingProps {
  conversation: Conversation | null;
  otherId: string | null;
}

export default function Messaging({ conversation, otherId }: MessagingProps) {
  const { lang } = useLang();
  const { state, currentUser } = useStore();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const readConversation = useRef<string | null>(null);
  const messagesQuery = useMessages(conversation?.id ?? null);
  const messages = useMemo(() => messagesQuery.data ?? [], [messagesQuery.data]);
  const other = otherId ? state.users.find((user) => user.id === otherId) : null;

  const sendMessage = useMutation({
    mutationFn: async (body: string) => {
      if (!supabase || !conversation || !otherId) {
        throw new Error(lang === "fr" ? "La conversation est indisponible." : "This conversation is unavailable.");
      }
      const { error } = await supabase.from("messages").insert({
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        conversation_id: conversation.id,
        sender_id: currentUser.id,
        receiver_id: otherId,
        body,
        status: "envoye",
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      setText("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["messages", conversation?.id] }),
        queryClient.invalidateQueries({ queryKey: ["conversations", currentUser.id] }),
      ]);
    },
    onError: (error) => toast.error(error instanceof Error
      ? error.message
      : lang === "fr" ? "Le message n'a pas pu être envoyé." : "The message could not be sent.",
    ),
  });

  const { mutate: markMessagesRead, isPending: isMarkingRead } = useMutation({
    mutationFn: async () => {
      if (!supabase || !conversation) {
        throw new Error(lang === "fr" ? "La conversation est indisponible." : "This conversation is unavailable.");
      }
      const { error } = await supabase
        .from("messages")
        .update({ status: "lu" })
        .eq("conversation_id", conversation.id)
        .eq("receiver_id", currentUser.id)
        .eq("status", "envoye");
      if (error) throw error;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["messages", conversation?.id] }),
        queryClient.invalidateQueries({ queryKey: ["conversations", currentUser.id] }),
      ]);
    },
    onError: (error) => {
      readConversation.current = null;
      toast.error(error instanceof Error
        ? error.message
        : lang === "fr" ? "Impossible de marquer les messages comme lus." : "Could not mark messages as read.",
      );
    },
  });

  useEffect(() => {
    setText("");
    readConversation.current = null;
  }, [conversation?.id]);

  useEffect(() => {
    if (!conversation || !messages.some((message) =>
      message.receiverId === currentUser.id && message.status !== "lu",
    ) || readConversation.current === conversation.id || isMarkingRead) return;
    readConversation.current = conversation.id;
    markMessagesRead();
  }, [conversation, currentUser.id, isMarkingRead, markMessagesRead, messages]);

  const send = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = text.trim();
    if (!body || sendMessage.isPending) return;
    sendMessage.mutate(body);
  };

  if (!conversation) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6 text-center text-sm text-muted-foreground">
        {otherId
          ? lang === "fr" ? "Ouverture de la conversation…" : "Opening conversation…"
          : lang === "fr" ? "Sélectionnez une conversation." : "Select a conversation."}
      </div>
    );
  }

  return (
    <section className="flex h-[65vh] flex-col" aria-label={other?.name ?? t("unknownUser", lang)}>
      <header className="flex items-center gap-3 border-b px-4 py-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
          {other?.name.trim().charAt(0).toUpperCase() ?? "?"}
        </span>
        <h2 className="truncate font-medium">{other?.name ?? t("unknownUser", lang)}</h2>
      </header>
      {messagesQuery.isLoading ? (
        <p role="status" className="flex-1 p-4 text-center text-sm text-muted-foreground">
          {lang === "fr" ? "Chargement des messages…" : "Loading messages…"}
        </p>
      ) : messagesQuery.isError ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-4">
          <p role="alert" className="text-sm text-destructive">
            {messagesQuery.error instanceof Error
              ? messagesQuery.error.message
              : lang === "fr" ? "Impossible de charger les messages." : "Could not load messages."}
          </p>
          <Button type="button" variant="outline" onClick={() => void messagesQuery.refetch()}>
            {lang === "fr" ? "Réessayer" : "Try again"}
          </Button>
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-4 text-sm text-muted-foreground">
          {lang === "fr" ? "Envoyez le premier message." : "Send the first message."}
        </div>
      ) : (
        <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
          {messages.map((message) => {
            const mine = message.senderId === currentUser.id;
            const timestamp = new Date(message.createdAt);
            return (
              <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <article className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm sm:max-w-[75%] ${
                  mine ? "rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm bg-muted"
                }`}>
                  <p className="whitespace-pre-wrap break-words">{message.body}</p>
                  <time
                    className="mt-1 block text-right text-[10px] opacity-70"
                    dateTime={message.createdAt}
                  >
                    {Number.isFinite(timestamp.getTime())
                      ? timestamp.toLocaleTimeString(lang === "fr" ? "fr-FR" : "en-US", { hour: "2-digit", minute: "2-digit" })
                      : ""}
                  </time>
                </article>
              </div>
            );
          })}
        </div>
      )}
      <form onSubmit={send} className="flex items-end gap-2 border-t p-3">
        <Textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={t("writeMessage", lang)}
          aria-label={t("writeMessage", lang)}
          rows={1}
          className="min-h-10 resize-none"
          disabled={sendMessage.isPending}
        />
        <Button
          type="submit"
          size="icon"
          aria-label={t("send", lang)}
          disabled={!text.trim() || sendMessage.isPending}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </section>
  );
}

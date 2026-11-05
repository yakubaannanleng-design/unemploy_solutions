import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, MessageSquare, Search } from "lucide-react";
import { useStore } from "@/lib/store";
import { useLang, t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useConversations } from "../hooks/useConversations";
import Messaging from "./Messaging";
import type { Conversation } from "../types";

interface MessagingLocationState {
  conversationId?: string;
  otherId?: string;
}

function getLocationState(value: unknown): MessagingLocationState {
  if (typeof value !== "object" || value === null) return {};
  const state = value as Record<string, unknown>;
  return {
    conversationId: typeof state.conversationId === "string" ? state.conversationId : undefined,
    otherId: typeof state.otherId === "string" ? state.otherId : undefined,
  };
}

function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("") || "?";
}

function formatConversationTime(value: string, lang: "fr" | "en"): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  const sameDay = date.toDateString() === new Date().toDateString();
  return sameDay
    ? date.toLocaleTimeString(lang === "fr" ? "fr-FR" : "en-US", { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", { day: "numeric", month: "short" });
}

export default function MessagesView() {
  const { lang } = useLang();
  const { state, currentUser } = useStore();
  const location = useLocation();
  const queryClient = useQueryClient();
  const locationState = getLocationState(location.state);
  const [active, setActive] = useState<string | null>(locationState.conversationId ?? null);
  const [search, setSearch] = useState("");
  const attemptedOtherId = useRef<string | null>(null);
  const conversationsQuery = useConversations(currentUser.id);
  const conversations = useMemo(() => conversationsQuery.data ?? [], [conversationsQuery.data]);
  const requestedOtherId = locationState.otherId;

  const { mutate: createConversation } = useMutation({
    mutationFn: async (otherId: string): Promise<Conversation> => {
      if (!supabase) throw new Error(lang === "fr" ? "Connexion à Supabase indisponible." : "Supabase is unavailable.");
      const { data: existing, error: existingError } = await supabase
        .from("conversations")
        .select("*")
        .contains("participants", [currentUser.id, otherId]);
      if (existingError) throw existingError;
      const conversation = existing?.find((row) =>
        row.participants.includes(currentUser.id) && row.participants.includes(otherId),
      );
      if (conversation) {
        return {
          id: conversation.id,
          participants: conversation.participants,
          messages: [],
        };
      }

      const id = `conv-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const { data, error } = await supabase
        .from("conversations")
        .insert({ id, participants: [currentUser.id, otherId] })
        .select("*")
        .single();
      if (error) throw error;
      if (!data) throw new Error(lang === "fr" ? "La conversation n'a pas pu être créée." : "Could not create the conversation.");
      return { id: data.id, participants: data.participants, messages: [] };
    },
    onSuccess: async (conversation) => {
      setActive(conversation.id);
      await queryClient.invalidateQueries({ queryKey: ["conversations", currentUser.id] });
    },
    onError: (error) => toast.error(error instanceof Error
      ? error.message
      : lang === "fr" ? "Impossible d'ouvrir la conversation." : "Could not open the conversation.",
    ),
  });

  useEffect(() => {
    if (!requestedOtherId || conversationsQuery.isLoading || !supabase) return;
    const existing = conversations.find((conversation) =>
      conversation.participants.includes(currentUser.id) &&
      conversation.participants.includes(requestedOtherId),
    );
    if (existing) {
      setActive(existing.id);
      attemptedOtherId.current = requestedOtherId;
      return;
    }
    if (attemptedOtherId.current === requestedOtherId) return;
    attemptedOtherId.current = requestedOtherId;
    createConversation(requestedOtherId);
  }, [conversations, conversationsQuery.isLoading, createConversation, currentUser.id, requestedOtherId]);

  const visibleConversations = useMemo(() => conversations
    .map((conversation) => {
      const otherId = conversation.participants.find((participant) => participant !== currentUser.id) ?? "";
      const other = state.users.find((user) => user.id === otherId);
      const latest = conversation.messages[conversation.messages.length - 1];
      const unreadCount = conversation.messages.filter((message) =>
        message.receiverId === currentUser.id && message.status !== "lu",
      ).length;
      return { conversation, otherId, other, latest, unreadCount };
    })
    .filter(({ other, latest }) =>
      `${other?.name ?? ""} ${latest?.body ?? ""}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()),
    )
    .sort((a, b) =>
      new Date(b.latest?.createdAt ?? 0).getTime() - new Date(a.latest?.createdAt ?? 0).getTime(),
    ), [conversations, currentUser.id, search, state.users]);

  const activeConversation = conversations.find((conversation) => conversation.id === active) ?? null;
  const activeOtherId = activeConversation?.participants.find((participant) => participant !== currentUser.id) ?? requestedOtherId ?? null;
  const error = !supabase
    ? lang === "fr"
      ? "Connexion à Supabase indisponible. Vos conversations ne peuvent pas être chargées."
      : "Supabase is unavailable. Your conversations cannot be loaded."
    : conversationsQuery.error instanceof Error
      ? conversationsQuery.error.message
      : conversationsQuery.error
        ? lang === "fr" ? "Impossible de charger vos conversations." : "Could not load your conversations."
        : undefined;

  return (
    <main className="mx-auto max-w-5xl px-4 py-4">
      <h1 className="mb-4 flex items-center gap-2 text-xl font-semibold">
        <MessageSquare className="h-5 w-5" /> {t("messages", lang)}
      </h1>
      {conversationsQuery.isLoading ? (
        <p role="status" className="py-12 text-center text-sm text-muted-foreground">
          {lang === "fr" ? "Chargement des conversations…" : "Loading conversations…"}
        </p>
      ) : error ? (
        <div className="space-y-3 rounded-lg border p-4">
          <p role="alert" className="text-sm text-destructive">{error}</p>
          {supabase && (
            <Button type="button" variant="outline" onClick={() => void conversationsQuery.refetch()}>
              {lang === "fr" ? "Réessayer" : "Try again"}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid min-h-[65vh] overflow-hidden rounded-lg border md:grid-cols-3">
          <section className={`border-r ${active ? "hidden md:block" : ""}`}>
            <div className="border-b p-3">
              <label className="relative block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={lang === "fr" ? "Rechercher une conversation" : "Search conversations"}
                  aria-label={lang === "fr" ? "Rechercher une conversation" : "Search conversations"}
                  className="pl-9"
                />
              </label>
            </div>
            {visibleConversations.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">
                {search
                  ? t("noResults", lang)
                  : lang === "fr" ? "Aucune conversation pour le moment." : "No conversations yet."}
              </p>
            ) : (
              <ul>
                {visibleConversations.map(({ conversation, other, latest, unreadCount }) => (
                  <li key={conversation.id}>
                    <button
                      type="button"
                      onClick={() => setActive(conversation.id)}
                      aria-current={active === conversation.id ? "true" : undefined}
                      className={`flex min-h-[72px] w-full items-center gap-3 border-b px-3 py-2 text-left hover:bg-accent ${
                        active === conversation.id ? "bg-accent" : ""
                      }`}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {initials(other?.name ?? "?")}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{other?.name ?? t("unknownUser", lang)}</span>
                        <span className="block truncate text-xs text-muted-foreground">{latest?.body ?? ""}</span>
                      </span>
                      <span className="flex shrink-0 flex-col items-end gap-1">
                        <time className="text-[11px] text-muted-foreground">
                          {latest ? formatConversationTime(latest.createdAt, lang) : ""}
                        </time>
                        {unreadCount > 0 && (
                          <span className="min-w-5 rounded-full bg-orange-500 px-1.5 py-0.5 text-center text-[11px] font-semibold text-white">
                            {unreadCount}
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className={`md:col-span-2 ${active ? "" : "hidden md:block"}`}>
            {active ? (
              <div className="h-full">
                <Button
                  type="button"
                  variant="ghost"
                  className="md:hidden"
                  onClick={() => setActive(null)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {lang === "fr" ? "Conversations" : "Conversations"}
                </Button>
                <Messaging
                  conversation={activeConversation}
                  otherId={activeOtherId}
                />
              </div>
            ) : (
              <div className="hidden h-full items-center justify-center text-sm text-muted-foreground md:flex">
                {lang === "fr" ? "Sélectionnez une conversation." : "Select a conversation."}
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}

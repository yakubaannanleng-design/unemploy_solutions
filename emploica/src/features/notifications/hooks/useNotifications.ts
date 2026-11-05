import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLang } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import type { Notification } from "../types";

function mapNotification(row: Record<string, unknown>): Notification {
  const type = row.type;
  return {
    id: typeof row.id === "string" ? row.id : "",
    userId: typeof row.user_id === "string" ? row.user_id : "",
    type: type === "offre" || type === "message" || type === "candidature" || type === "alerte"
      ? type
      : "alerte",
    body: typeof row.body === "string" ? row.body : "",
    createdAt: typeof row.created_at === "string" ? row.created_at : "",
    read: row.read === true,
  };
}

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return fallback;
}

export function useNotifications(userId: string | null) {
  const { lang } = useLang();
  const queryClient = useQueryClient();
  const queryKey = ["notifications", userId];
  const notificationsQuery = useQuery({
    queryKey,
    queryFn: async () => {
      if (!supabase || !userId) throw new Error("Supabase et un compte utilisateur sont nécessaires.");
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((row) => mapNotification(row as Record<string, unknown>));
    },
    enabled: !!supabase && !!userId,
  });

  const updateNotifications = useMutation({
    mutationFn: async (notificationId?: string) => {
      if (!supabase || !userId) {
        throw new Error(lang === "fr" ? "Connexion à Supabase indisponible." : "Supabase is unavailable.");
      }
      let request = supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", userId);
      if (notificationId) request = request.eq("id", notificationId);
      else request = request.eq("read", false);
      const { error } = await request;
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => toast.error(errorMessage(
      error,
      lang === "fr" ? "Impossible de mettre à jour les notifications." : "Could not update notifications.",
    )),
  });

  const notifications = notificationsQuery.data ?? [];
  return {
    notifications,
    unreadCount: notifications.filter((notification) => !notification.read).length,
    isLoading: notificationsQuery.isLoading,
    error: notificationsQuery.error,
    refetch: notificationsQuery.refetch,
    markRead: (notificationId: string) => updateNotifications.mutate(notificationId),
    markAllRead: () => updateNotifications.mutate(undefined),
    isUpdating: updateNotifications.isPending,
  };
}

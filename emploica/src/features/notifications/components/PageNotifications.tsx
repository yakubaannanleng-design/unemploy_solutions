import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang, t } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import { useNotifications } from "../hooks/useNotifications";
import ElementNotification from "./ElementNotification";

interface PageNotificationsProps {
  userId: string;
}

export default function PageNotifications({ userId }: PageNotificationsProps) {
  const { lang } = useLang();
  const notifications = useNotifications(userId);
  const error = !supabase
    ? lang === "fr"
      ? "Connexion à Supabase indisponible. Vos notifications ne peuvent pas être chargées."
      : "Supabase is unavailable. Your notifications cannot be loaded."
    : notifications.error instanceof Error
      ? notifications.error.message
      : notifications.error
        ? lang === "fr" ? "Impossible de charger vos notifications." : "Could not load your notifications."
        : undefined;

  return (
    <main className="mx-auto max-w-2xl space-y-4 px-4 py-6">
      <header className="flex items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-xl font-semibold">
          <Bell className="h-5 w-5" /> {t("notifications", lang)}
        </h1>
        {notifications.unreadCount > 0 && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={notifications.markAllRead}
            disabled={notifications.isUpdating}
          >
            <CheckCheck className="mr-1 h-4 w-4" /> {t("markAllRead", lang)}
          </Button>
        )}
      </header>
      {notifications.isLoading ? (
        <p role="status" className="py-6 text-sm text-muted-foreground">
          {lang === "fr" ? "Chargement des notifications…" : "Loading notifications…"}
        </p>
      ) : error ? (
        <div className="space-y-3">
          <p role="alert" className="text-sm text-destructive">{error}</p>
          {supabase && (
            <Button type="button" variant="outline" onClick={() => void notifications.refetch()}>
              {lang === "fr" ? "Réessayer" : "Try again"}
            </Button>
          )}
        </div>
      ) : notifications.notifications.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("noResults", lang)}</p>
      ) : (
        <section aria-label={t("notifications", lang)} className="overflow-hidden rounded-lg border">
          {notifications.notifications.map((notification) => (
            <ElementNotification
              key={notification.id}
              notification={notification}
              onMarkRead={() => notifications.markRead(notification.id)}
            />
          ))}
        </section>
      )}
    </main>
  );
}

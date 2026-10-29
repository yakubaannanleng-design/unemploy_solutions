/**
 * PROBLÈME RÉSOLU : affiche les notifications de l'utilisateur connecté et permet de les marquer comme lues.
 * RESPONSABILITÉ  : rendu de l'écran Notifications, filtrage par utilisateur et mise à jour du statut de lecture dans le store.
 * NE FAIT PAS     : ne parle pas directement à Supabase ; ne crée pas de notifications.
 * DÉPEND DE       : lib/store, lib/i18n, components/ui/*.
 * UTILISÉ PAR     : app (route /notifications).
 */
import { Bell, CheckCheck } from "lucide-react";
import { useLang, t } from "lib/i18n";
import { useStore } from "lib/store";
import { Button } from "components/ui/button";
import { ScrollArea } from "components/ui/scroll-area";
import { Separator } from "components/ui/separator";

export default function NotificationsView() {
  const { lang } = useLang();
  const { state, update, currentUser } = useStore();
  const mine = currentUser.id;
  const notifs = state.notifications
    .filter((n) => n.userId === mine)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const markAllRead = () =>
    update("notifications", state.notifications.map((n) => (n.userId === mine ? { ...n, read: true } : n)));

  const markRead = (id: string) =>
    update("notifications", state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Bell className="h-5 w-5" /> {t("notifications", lang)}
        </h2>
        <Button size="sm" variant="outline" onClick={markAllRead}>
          <CheckCheck className="h-4 w-4 mr-1" /> {t("markAllRead", lang)}
        </Button>
      </div>
      {notifs.length === 0 ? (
        <p className="text-muted-foreground text-sm">{t("noResults", lang)}</p>
      ) : (
        <ScrollArea className="h-[60vh] rounded-lg border">
          <div className="divide-y">
            {notifs.map((n) => (
              <div
                key={n.id}
                className={`p-4 flex items-start gap-3 cursor-pointer hover:bg-accent/50 ${
                  !n.read ? "bg-primary/5" : ""
                }`}
                onClick={() => markRead(n.id)}
              >
                <div className={`mt-1 h-2 w-2 rounded-full ${n.read ? "bg-transparent" : "bg-primary"}`} />
                <div className="flex-1">
                  <div className="text-sm">{n.body}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(n.createdAt).toLocaleString("fr-FR")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
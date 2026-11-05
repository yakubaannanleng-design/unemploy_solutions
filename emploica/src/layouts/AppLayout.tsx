/**
 * PROBLÈME RÉSOLU : structure commune de navigation des pages authentifiées.
 * RESPONSABILITÉ  : affiche l'en-tête, le contenu de page et la navigation inférieure.
 * NE FAIT PAS     : ne gère pas le routage des pages ni la persistance métier.
 * DÉPEND DE       : components/navigation/*, lib/i18n, types/User.
 * UTILISÉ PAR     : App.tsx.
 */
import { Bell } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import BottomNav from "@/components/navigation/BottomNav";
import MenuPlus from "@/components/navigation/MenuPlus";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useLang } from "@/lib/i18n";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import type { User } from "@/types";

interface AppLayoutProps {
  children: ReactNode;
  currentUser: User;
  onLogout: () => void;
}

export default function AppLayout({ children, currentUser, onLogout }: AppLayoutProps) {
  const { lang } = useLang();
  const notifications = useNotifications(currentUser.id);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-14 items-center justify-between gap-3 px-4">
          <Link
            to={`/${currentUser.role}`}
            aria-label="Workca — accueil"
            className="text-lg font-semibold tracking-tight text-foreground"
          >
            work<span className="text-primary">ca</span>
          </Link>
          <div className="flex items-center gap-1">
            <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={notifications.unreadCount > 0
                    ? lang === "fr"
                      ? `Notifications et alertes, ${notifications.unreadCount} notification${notifications.unreadCount > 1 ? "s" : ""} non lue${notifications.unreadCount > 1 ? "s" : ""}`
                      : `Notifications and alerts, ${notifications.unreadCount} unread notification${notifications.unreadCount > 1 ? "s" : ""}`
                    : lang === "fr" ? "Notifications et alertes" : "Notifications and alerts"}
                >
                  <Bell className="h-5 w-5" />
                  {notifications.unreadCount > 0 && (
                    <span
                      aria-hidden="true"
                      className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] leading-none text-white"
                    >
                      {notifications.unreadCount > 99 ? "99+" : notifications.unreadCount}
                    </span>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent overlayClassName="bg-black/60" className="bg-background sm:max-w-sm">
                <DialogHeader>
                <DialogTitle>{lang === "fr" ? "Notifications" : "Notifications"}</DialogTitle>
                <DialogDescription>
                  {lang === "fr" ? "Consultez vos notifications et alertes emploi." : "Check your notifications and job alerts."}
                </DialogDescription>
                </DialogHeader>
                <div className="grid gap-2">
                <Button asChild variant="outline" className="justify-start">
                  <Link to="/notifications" onClick={() => setNotificationsOpen(false)}>
                    {lang === "fr" ? "Toutes les notifications" : "All notifications"}
                    {notifications.unreadCount > 0 ? ` (${notifications.unreadCount})` : ""}
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start">
                  <Link to="/alertes" onClick={() => setNotificationsOpen(false)}>
                    {lang === "fr" ? "Alertes emploi" : "Job alerts"}
                  </Link>
                </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button asChild variant="ghost" size="icon" aria-label={lang === "fr" ? "Mon profil" : "My profile"}>
              <Link
                to="/profil"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-semibold"
              >
                {currentUser.name.trim().charAt(0).toUpperCase()}
              </Link>
            </Button>
            <MenuPlus currentUser={currentUser} onLogout={onLogout} />
          </div>
        </div>
      </header>
      <div aria-hidden="true" className="h-14" />
      {children}
      <BottomNav currentUser={currentUser} />
    </>
  );
}

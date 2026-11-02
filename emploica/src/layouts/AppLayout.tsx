/**
 * PROBLÈME RÉSOLU : structure commune de navigation des pages authentifiées.
 * RESPONSABILITÉ  : affiche l'en-tête, le contenu de page et la navigation inférieure.
 * NE FAIT PAS     : ne gère pas le routage des pages ni la persistance métier.
 * DÉPEND DE       : components/navigation/*, lib/i18n, types/User.
 * UTILISÉ PAR     : App.tsx.
 */
import { Bell } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import BottomNav from "@/components/navigation/BottomNav";
import MenuPlus from "@/components/navigation/MenuPlus";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";
import type { User } from "@/types";

interface AppLayoutProps {
  children: ReactNode;
  currentUser: User;
  onLogout: () => void;
}

export default function AppLayout({ children, currentUser, onLogout }: AppLayoutProps) {
  const { lang } = useLang();

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center justify-between gap-3 px-4">
          <Link
            to={`/${currentUser.role}`}
            aria-label="Workca — accueil"
            className="text-lg font-semibold tracking-tight text-foreground"
          >
            work<span className="text-primary">ca</span>
          </Link>
          <div className="flex items-center gap-1">
            <Button asChild variant="ghost" size="icon" aria-label={lang === "fr" ? "Notifications" : "Notifications"}>
              <Link to="/notifications">
                <Bell className="h-5 w-5" />
              </Link>
            </Button>
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
      {children}
      <BottomNav currentUser={currentUser} />
    </>
  );
}

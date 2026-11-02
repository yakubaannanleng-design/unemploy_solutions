/**
 * PROBLÈME RÉSOLU : menu complémentaire de navigation de l'application.
 * RESPONSABILITÉ  : donne accès aux destinations secondaires et à la déconnexion.
 * NE FAIT PAS     : ne gère ni les sessions ni les données métier.
 * DÉPEND DE       : components/ui/dropdown-menu, lib/i18n, react-router-dom.
 * UTILISÉ PAR     : layouts/AppLayout.
 */
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useLang, t } from "@/lib/i18n";
import type { User } from "@/types";
import { Globe, Heart, MoreVertical, Search, Settings, Shield, LogOut, Zap } from "lucide-react";
import { Link } from "react-router-dom";

interface MenuPlusProps {
  currentUser: User;
  onLogout: () => void;
}

export default function MenuPlus({ currentUser, onLogout }: MenuPlusProps) {
  const { lang, setLang } = useLang();
  const items = [
    { to: "/recherche", icon: Search, label: lang === "fr" ? "Recherche" : "Search" },
    { to: "/favoris", icon: Heart, label: t("favorites", lang) },
    { to: "/boulots-eclair", icon: Zap, label: t("flash", lang) },
    { to: "/parametres", icon: Settings, label: t("settings", lang) },
    ...(currentUser.role === "admin"
      ? [{ to: "/admin", icon: Shield, label: t("admin", lang) }]
      : []),
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={lang === "fr" ? "Ouvrir le menu" : "Open menu"}
        >
          <MoreVertical className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {items.map(({ to, icon: Icon, label }) => (
          <DropdownMenuItem key={to} asChild>
            <Link to={to}>
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => setLang(lang === "fr" ? "en" : "fr")}>
          <Globe className="h-4 w-4" />
          {lang === "fr" ? "English" : "Français"}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onLogout} className="text-destructive focus:text-destructive">
          <LogOut className="h-4 w-4" />
          {t("logout", lang)}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

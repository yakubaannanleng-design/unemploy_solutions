// En-tête de navigation de l'application Workca.
// Contient le logo, le statut de connexion, les liens de navigation, le sélecteur de langue,
// le menu utilisateur déroulant et le menu mobile.
import { Bell, Globe, LogOut, Menu, User, Zap, Sun, Moon, Settings as SettingsIcon, Heart } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLang, t } from "../../lib/i18n";
import Logo from "./Logo";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { useStore } from "../../lib/store";
import type { User as UserType } from "../../types";

interface HeaderProps {
  currentUser: UserType | null;
  onLogout: () => void;
  onSwitchUser: (id: string) => void;
  demoUsers: UserType[];
}

  const location = useLocation();
  const [open, setOpen] = useState(false);

export default function Header({ currentUser, onLogout, onSwitchUser, demoUsers }: HeaderProps) {
  const { lang, setLang } = useLang();
  const { state } = useStore();
  const unread = currentUser
    ? state.conversations.reduce(
        (n, c) =>
          n +
          c.messages.filter((m) => m.receiverId === currentUser.id && m.status !== "lu").length,
        0
      )
    : 0;

  const nav = (to: string, label: string) => (
    <Link
      to={to}
      onClick={() => setOpen(false)}
      className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        location.pathname === to
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Logo size={36} showText />
          {currentUser && (
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-brand-100 dark:bg-brand-900/40 px-2 py-0.5 text-xs font-medium text-brand-700 dark:text-brand-300">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              Connecté : {currentUser.name}
            </span>
          )}
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {currentUser && nav("/" + currentUser.role, t("home", lang))}
          {currentUser && nav("/offres", t("offers", lang))}
          {currentUser && nav("/favoris", t("favorites", lang) ?? "Favoris")}
          {currentUser && nav("/boulots-eclair", t("flash", lang))}
          {currentUser && nav("/notifications", t("notifications", lang))}
          {currentUser && nav("/parametres", t("settings", lang) ?? "Paramètres")}
          {currentUser && nav("/messages", t("messages", lang))}
          {currentUser?.role === "employeur" && nav("/offres/nouveau", t("createOffer", lang))}
          {currentUser?.role === "admin" && nav("/admin", t("admin", lang))}
        </nav>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLang(lang === "fr" ? "en" : "fr")}
            title={t("language", lang)}
          >
            <Globe className="h-4 w-4" />
          </Button>

          {currentUser ? (
            <>
              <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                <Bell className="h-4 w-4" />
                {unread > 0 && (
                 <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                   {unread}
                 </span>
               )}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{currentUser.name}</span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {t(currentUser.role === "chercheur" ? "jobSeeker" : currentUser.role === "employeur" ? "employer" : "admin", lang)}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profil">{t("profile", lang)}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    {t("demoAccounts", lang) ?? "Comptes démo"}
                  </DropdownMenuLabel>
                  {demoUsers.map((u) => (
                    <DropdownMenuItem key={u.id} onClick={() => onSwitchUser(u.id)}>
                      {u.name} — {t(u.role === "chercheur" ? "jobSeeker" : u.role === "employeur" ? "employer" : "admin", lang)}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> {t("logout", lang)}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button asChild>
              <Link to="/login">{t("login", lang)}</Link>
            </Button>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col gap-2 mt-4">
                {currentUser && nav("/" + currentUser.role, t("home", lang))}
                {currentUser && nav("/offres", t("offers", lang))}
                {currentUser && nav("/messages", t("messages", lang))}
                {currentUser && nav("/parametres", t("settings", lang) ?? "Paramètres")}
                {currentUser?.role === "employeur" && nav("/offres/nouveau", t("createOffer", lang))}
                {currentUser?.role === "admin" && nav("/admin", t("admin", lang))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
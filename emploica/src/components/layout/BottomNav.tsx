// Barre de navigation inférieure (style WhatsApp) avec menu "Plus" (3 points).
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLang, t } from "../../lib/i18n";
import { useStore } from "../../lib/store";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Home, Briefcase, MessageSquare, User, MoreVertical, Settings, Heart, Bell, Zap, Shield, PlusCircle, LogOut } from "lucide-react";

interface BottomNavProps {
  currentUser: any;
}

export default function BottomNav({ currentUser }: BottomNavProps) {
  const { lang } = useLang();
  const { state } = useStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  if (!currentUser) return null;

  const unreadMsg = state.conversations.reduce(
    (n: number, c: any) => n + c.messages.filter((m: any) => m.receiverId === currentUser.id && m.status !== "lu").length,
    0
  );

  const items = [
    { to: "/" + currentUser.role, icon: Home, label: t("home", lang) },
    { to: "/offres", icon: Briefcase, label: t("offers", lang) },
    { to: "/messages", icon: MessageSquare, label: t("messages", lang), badge: unreadMsg },
    { to: "/profil", icon: User, label: t("profile", lang) },
  ];

  const moreItems = [
    { to: "/favoris", icon: Heart, label: t("favorites", lang) },
    { to: "/parametres", icon: Settings, label: t("settings", lang) },
    { to: "/notifications", icon: Bell, label: t("notifications", lang) },
    { to: "/boulots-eclair", icon: Zap, label: t("flash", lang) },
  ];
  if (currentUser.role === "employeur") moreItems.unshift({ to: "/offres/nouveau", icon: PlusCircle, label: t("createOffer", lang) });
  if (currentUser.role === "admin") moreItems.push({ to: "/admin", icon: Shield, label: t("admin", lang) });

  return (
    <>
      {/* Barre inférieure (mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur flex items-center justify-around h-14">
        {items.map((it) => (
          <Link key={it.to} to={it.to} className="flex flex-col items-center justify-center flex-1 text-xs text-muted-foreground hover:text-primary relative">
            <it.icon className="h-5 w-5" />
            <span>{it.label}</span>
            {it.badge && it.badge > 0 && (
              <span className="absolute top-1 right-1/4 h-4 min-w-4 px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                {it.badge}
              </span>
            )}
          </Link>
        ))}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center justify-center flex-1 text-xs text-muted-foreground hover:text-primary" aria-label="Plus">
              <MoreVertical className="h-5 w-5" />
              <span>{lang === "fr" ? "Plus" : "More"}</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto">
            <div className="grid grid-cols-3 gap-3 py-4">
              {moreItems.map((it) => (
                <Link key={it.to} to={it.to} onClick={() => setOpen(false)} className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-accent">
                  <it.icon className="h-5 w-5 text-primary" />
                  <span className="text-xs text-center">{it.label}</span>
                </Link>
              ))}
              <button onClick={() => { setOpen(false); window.localStorage.removeItem("workca:me"); window.location.href = "/login"; }} className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-accent text-red-600">
                <LogOut className="h-5 w-5" />
                <span className="text-xs text-center">{t("logout", lang)}</span>
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
      {/* Spacer pour éviter que le contenu soit masqué par la barre */}
      <div className="md:hidden h-14" />
    </>
  );
}
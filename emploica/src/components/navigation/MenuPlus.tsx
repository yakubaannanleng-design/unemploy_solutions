import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Bell, BriefcaseBusiness, Globe, Heart, LogOut, MessageCircle, MoreVertical, Search, Settings, Shield, UserRound, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEmployerProfiles } from "@/features/employers/hooks/useEmployerProfiles";
import { useLang, t } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import type { User } from "@/types";

interface MenuPlusProps {
  currentUser: User;
  onLogout: () => void;
}

export default function MenuPlus({ currentUser, onLogout }: MenuPlusProps) {
  const { lang, setLang } = useLang();
  const { state, setActiveSpace } = useStore();
  const navigate = useNavigate();
  const employerProfiles = useEmployerProfiles();
  const [open, setOpen] = useState(false);
  const items = [
    { to: "/recherche", icon: Search, label: lang === "fr" ? "Recherche" : "Search" },
    { to: "/favoris", icon: Heart, label: t("favorites", lang) },
    { to: "/alertes", icon: Bell, label: lang === "fr" ? "Alertes emploi" : "Job alerts" },
    { to: "/canaux", icon: MessageCircle, label: lang === "fr" ? "Nos canaux" : "Our channels" },
    { to: "/boulots-eclair", icon: Zap, label: t("flash", lang) },
    { to: "/parametres", icon: Settings, label: t("settings", lang) },
    ...(currentUser.role === "admin"
      ? [{ to: "/admin", icon: Shield, label: t("admin", lang) }]
      : []),
  ];

  const switchSpace = () => {
    if (currentUser.role === "admin") return;
    if (currentUser.role === "employeur") {
      setActiveSpace("chercheur");
      setOpen(false);
      navigate("/chercheur");
      return;
    }

    if (employerProfiles.isLoading) {
      toast.info(lang === "fr" ? "Chargement de votre profil professionnel…" : "Loading your professional profile…");
      return;
    }
    if (employerProfiles.isError) {
      toast.error(lang === "fr" ? "Impossible de vérifier votre profil professionnel." : "Could not check your professional profile.");
      return;
    }

    setActiveSpace("employeur");
    setOpen(false);
    const hasProfile = (employerProfiles.data ?? state.employers)
      .some((profile) => profile.userId === currentUser.id);
    navigate(hasProfile ? "/employeur" : "/profil-employeur");
  };

  const switchLabel = currentUser.role === "employeur"
    ? lang === "fr" ? "Passer à l'espace chercheur" : "Switch to job seeker"
    : lang === "fr" ? "Passer à l'espace employeur" : "Switch to employer";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={lang === "fr" ? "Ouvrir le menu" : "Open menu"}
        >
          <MoreVertical className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent overlayClassName="bg-black/60" className="max-h-[85dvh] overflow-y-auto bg-background sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{lang === "fr" ? "Menu Workca" : "Workca menu"}</DialogTitle>
          <DialogDescription>
            {lang === "fr" ? "Choisissez une page ou changez d'espace." : "Choose a page or switch workspace."}
          </DialogDescription>
        </DialogHeader>
        <nav aria-label={lang === "fr" ? "Menu secondaire" : "Secondary menu"} className="grid gap-1">
          {items.map(({ to, icon: Icon, label }) => (
            <Button key={to} asChild variant="ghost" className="h-11 justify-start gap-3">
              <Link to={to} onClick={() => setOpen(false)}>
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </Link>
            </Button>
          ))}
        </nav>
        <div className="grid gap-2 border-t pt-3">
          {currentUser.role !== "admin" && (
            <Button type="button" variant="outline" className="justify-start gap-3" onClick={switchSpace}>
              {currentUser.role === "employeur"
                ? <UserRound className="h-4 w-4" aria-hidden="true" />
                : <BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />}
              {switchLabel}
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            className="justify-start gap-3"
            onClick={() => setLang(lang === "fr" ? "en" : "fr")}
          >
            <Globe className="h-4 w-4" aria-hidden="true" />
            {lang === "fr" ? "English" : "Français"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="justify-start gap-3 text-destructive hover:text-destructive"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            {t("logout", lang)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * PROBLÈME RÉSOLU : navigation persistante pour les espaces candidat et employeur.
 * RESPONSABILITÉ  : affiche les destinations principales et le raccourci de publication.
 * NE FAIT PAS     : ne gère ni les sessions ni les données métier.
 * DÉPEND DE       : lib/i18n, lib/store, react-router-dom.
 * UTILISÉ PAR     : layouts/AppLayout.
 */
import { useState } from "react";
import { BriefcaseBusiness, FileText, Home, MessageCircle } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useLang, t } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { useEmployerProfiles } from "@/features/employers/hooks/useEmployerProfiles";
import { useConversations } from "@/features/messaging/hooks/useConversations";
import FenetrePublier from "@/features/compte/components/FenetrePublier";
import BoutonNouvelleOffre from "@/features/employeur/components/BoutonNouvelleOffre";
import type { User } from "@/types";

interface BottomNavProps {
  currentUser: User;
}

export default function BottomNav({ currentUser }: BottomNavProps) {
  const { lang } = useLang();
  const { state, setActiveSpace } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const employerProfilesQuery = useEmployerProfiles();
  const conversationsQuery = useConversations(currentUser.id);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);

  if (currentUser.role === "admin") return null;

  const unreadMessages = (conversationsQuery.data ?? []).reduce(
    (count, conversation) => count + conversation.messages.filter(
      (message) => message.receiverId === currentUser.id && message.status !== "lu",
    ).length,
    0,
  );
  const isEmployer = currentUser.role === "employeur";
  const hasEmployerProfile = (employerProfilesQuery.data ?? state.employers)
    .some((profile) => profile.userId === currentUser.id);
  const handlePublish = () => {
    if (employerProfilesQuery.isLoading) {
      toast.info(lang === "fr" ? "Chargement de votre profil de publication…" : "Loading your posting profile…");
      return;
    }
    if (employerProfilesQuery.isError) {
      toast.error(lang === "fr" ? "Impossible de vérifier votre profil de publication." : "Could not check your posting profile.");
      return;
    }
    if (hasEmployerProfile) {
      setActiveSpace("employeur");
      navigate("/offres/nouveau");
      return;
    }
    setPublishDialogOpen(true);
  };
  const items = isEmployer
    ? [
        { to: "/employeur", icon: Home, label: t("home", lang) },
        { to: "/employeur/offres", icon: BriefcaseBusiness, label: lang === "fr" ? "Mes offres" : "My jobs" },
        { to: "/recherche?type=candidats", icon: FileText, label: lang === "fr" ? "Candidats" : "Candidates" },
        { to: "/messages", icon: MessageCircle, label: t("messages", lang), badge: unreadMessages },
      ]
    : [
        { to: "/chercheur", icon: Home, label: t("home", lang) },
        { to: "/offres", icon: BriefcaseBusiness, label: t("offers", lang) },
        { to: "/candidatures", icon: FileText, label: t("applications", lang) },
        { to: "/messages", icon: MessageCircle, label: t("messages", lang), badge: unreadMessages },
      ];

  const isActive = (to: string) => {
    const [pathname, query] = to.split("?");
    if (location.pathname !== pathname) return false;
    return !query || new URLSearchParams(query).toString() === location.search.slice(1);
  };

  return (
    <>
      <nav
        aria-label={lang === "fr" ? "Navigation principale" : "Main navigation"}
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t bg-background"
        style={{
          height: "calc(4rem + env(safe-area-inset-bottom, 0px))",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {items.slice(0, 2).map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={active ? "page" : undefined}
              className={`relative flex min-h-11 flex-col items-center justify-center gap-0.5 text-[11px] transition-colors ${
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span>{item.label}</span>
              {"badge" in item && item.badge > 0 && (
                <span className="absolute right-1/4 top-1 h-4 min-w-4 rounded-full bg-destructive px-1 text-center text-[10px] leading-4 text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
        <BoutonNouvelleOffre label={t("publish", lang)} onClick={handlePublish} />
        {items.slice(2).map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={active ? "page" : undefined}
              className={`relative flex min-h-11 flex-col items-center justify-center gap-0.5 text-[11px] transition-colors ${
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span>{item.label}</span>
              {"badge" in item && item.badge > 0 && (
                <span className="absolute right-1/4 top-1 h-4 min-w-4 rounded-full bg-destructive px-1 text-center text-[10px] leading-4 text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div
        aria-hidden="true"
        style={{ height: "calc(4rem + env(safe-area-inset-bottom, 0px))" }}
      />
      <FenetrePublier
        open={publishDialogOpen}
        onOpenChange={setPublishDialogOpen}
        onCreateProfile={() => {
          setPublishDialogOpen(false);
          navigate("/profil-employeur?redirect=%2Foffres%2Fnouveau");
        }}
      />
    </>
  );
}

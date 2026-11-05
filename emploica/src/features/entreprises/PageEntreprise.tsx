// PROBLÈME RÉSOLU : expose le profil public d'une entreprise et ses offres actives.
import { useMemo } from "react";
import { ArrowLeft, Building2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { BadgeVerifie } from "@/features/jobs";
import { Button } from "@/components/ui/button";
import { useEmployerProfiles } from "@/features/employers/hooks/useEmployerProfiles";
import { useOffers } from "@/features/jobs/hooks/useOffers";
import { isCandidateOfferVisible } from "@/features/jobs/utils/filledOffers";
import { useLang } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import type { EmployerProfile } from "@/types";
import { useSuivreEntreprise } from "./hooks/useSuivreEntreprise";
import OffresEntreprise from "./OffresEntreprise";

interface PageEntrepriseProps {
  followerId: string | null;
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toLocaleUpperCase())
    .join("") || "W";
}

export default function PageEntreprise({ followerId }: PageEntrepriseProps) {
  const { id = "" } = useParams<{ id: string }>();
  const { lang } = useLang();
  const navigate = useNavigate();
  const profilesQuery = useEmployerProfiles();
  const offersQuery = useOffers();
  const profile: EmployerProfile | undefined = profilesQuery.data?.find((item) => item.userId === id);
  const follow = useSuivreEntreprise(id, followerId);
  const activeOffers = useMemo(
    () => (offersQuery.data ?? []).filter((offer) =>
      offer.employerId === id && isCandidateOfferVisible(offer),
    ),
    [offersQuery.data, id],
  );

  if (profilesQuery.isLoading || offersQuery.isLoading) {
    return <p role="status" className="py-10 text-center text-muted-foreground">
      {lang === "fr" ? "Chargement de l'entreprise…" : "Loading company…"}
    </p>;
  }

  let pageError: string | undefined;
  if (!supabase) {
    pageError = lang === "fr" ? "Connexion à Supabase indisponible." : "Supabase is unavailable.";
  } else if (profilesQuery.isError) {
    pageError = lang === "fr"
      ? "Impossible de charger le profil entreprise."
      : "Could not load the company profile.";
  } else if (offersQuery.isError) {
    pageError = lang === "fr"
      ? "Impossible de charger les offres de cette entreprise."
      : "Could not load this company's jobs.";
  } else if (!profile) {
    pageError = lang === "fr" ? "Cette entreprise est introuvable." : "This company was not found.";
  }
  if (pageError || !profile) {
    return (
      <section className="space-y-4 py-8">
        <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft aria-hidden="true" />
          {lang === "fr" ? "Retour" : "Back"}
        </Button>
        <p role="alert" className="text-sm text-destructive">{pageError}</p>
      </section>
    );
  }

  const companyInitials = initials(profile.orgName);
  const locationLine = [profile.sector, profile.city].filter(Boolean).join(" · ");
  let followError: string | undefined;
  if (follow.error instanceof Error) {
    followError = follow.error.message;
  } else if (follow.error) {
    followError = lang === "fr" ? "Impossible de vérifier le suivi." : "Could not check the follow status.";
  } else if (follow.requiresSupabaseAuth) {
    followError = lang === "fr"
      ? "Une session Supabase est nécessaire pour suivre une entreprise."
      : "A Supabase session is required to follow a company.";
  }

  return (
    <article className="space-y-6">
      <Button type="button" variant="ghost" className="-ml-3" onClick={() => navigate(-1)}>
        <ArrowLeft aria-hidden="true" />
        {lang === "fr" ? "Retour" : "Back"}
      </Button>

      <header className="space-y-4 text-center">
        {profile.logoUrl ? (
          <img
            src={profile.logoUrl}
            alt={lang === "fr" ? `Logo de ${profile.orgName}` : `${profile.orgName} logo`}
            className="mx-auto h-16 w-16 rounded-2xl border object-cover"
          />
        ) : (
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-lg font-semibold text-primary">
            {profile.orgName ? companyInitials : <Building2 aria-hidden="true" />}
          </span>
        )}
        <div>
          <h1 className="text-2xl font-semibold">{profile.orgName}</h1>
          {locationLine && <p className="mt-1 text-sm text-muted-foreground">{locationLine}</p>}
        </div>
        <div className="flex justify-center">
          <BadgeVerifie verification={profile.verification} />
        </div>
        {profile.description && (
          <p className="mx-auto max-w-2xl whitespace-pre-line text-sm leading-6 text-muted-foreground">
            {profile.description}
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-2">
          {followerId ? (
            <Button
              type="button"
              onClick={follow.toggle}
              disabled={!follow.canFollow || follow.isLoading || follow.isPending || !!followError}
            >
              {follow.isFollowing
                ? lang === "fr" ? "Suivie" : "Following"
                : lang === "fr" ? "Suivre" : "Follow"}
            </Button>
          ) : (
            <Button type="button" onClick={() => navigate("/login")}>
              {lang === "fr" ? "Se connecter pour suivre" : "Sign in to follow"}
            </Button>
          )}
          <span className="inline-flex min-h-11 items-center rounded-md bg-muted px-4 text-sm">
            {activeOffers.length} {lang === "fr" ? "offre(s)" : "job(s)"}
          </span>
        </div>
        {followError && <p role="alert" className="text-sm text-destructive">{followError}</p>}
      </header>

      <OffresEntreprise company={profile} offers={activeOffers} />
    </article>
  );
}

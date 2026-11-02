/**
 * PROBLÈME RÉSOLU : accueil candidat avec recherche, catégories et offres récentes.
 * RESPONSABILITÉ  : présente les offres issues de Supabase et dirige vers la recherche détaillée.
 * NE FAIT PAS     : ne crée pas de données fictives ni de rubrique employeurs (étape séparée).
 * DÉPEND DE       : features/categories, features/jobs, lib/store, lib/supabase.
 * UTILISÉ PAR     : app/routes (/chercheur).
 */
import { Link, useNavigate } from "react-router-dom";
import { useLang, t } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { useOffers } from "@/features/jobs/hooks/useOffers";
import { useEmployerProfiles } from "@/features/employers/hooks/useEmployerProfiles";
import GrilleCategories from "@/features/categories/GrilleCategories";
import RecherchesRecentes from "@/features/jobs/components/RecherchesRecentes";
import type { Offer } from "@/types";
import { isCandidateOfferVisible } from "@/features/jobs/utils/filledOffers";
import { RubriqueEntreprises } from "@/features/entreprises";
import { getRecruitingCompanies } from "@/features/entreprises/companies";

export default function PageAccueil() {
  const { lang } = useLang();
  const { currentUser } = useStore();
  const navigate = useNavigate();
  const offersQuery = useOffers();
  const employerProfilesQuery = useEmployerProfiles();
  const employerNames = new Map(
    (employerProfilesQuery.data ?? []).map((profile) => [profile.userId, profile.orgName]),
  );
  const recruitingCompanies = getRecruitingCompanies(
    employerProfilesQuery.data ?? [],
    offersQuery.data ?? [],
  );
  const recentOffers = (offersQuery.data ?? [])
    .filter((offer) => isCandidateOfferVisible(offer))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const companiesError = !supabase
    ? lang === "fr"
      ? "Connexion à Supabase indisponible. Les entreprises ne peuvent pas être chargées."
      : "Supabase is unavailable. Companies cannot be loaded."
    : employerProfilesQuery.isError
      ? employerProfilesQuery.error instanceof Error
        ? employerProfilesQuery.error.message
        : lang === "fr" ? "Impossible de charger les entreprises." : "Could not load companies."
      : offersQuery.isError
        ? offersQuery.error instanceof Error
          ? offersQuery.error.message
          : lang === "fr" ? "Impossible de charger les offres." : "Could not load jobs."
        : undefined;
  const offersError = !supabase
    ? lang === "fr"
      ? "Connexion à Supabase indisponible. Les offres ne peuvent pas être chargées."
      : "Supabase is unavailable. Jobs cannot be loaded."
    : offersQuery.isError
      ? offersQuery.error instanceof Error
        ? offersQuery.error.message
        : lang === "fr" ? "Impossible de charger les offres." : "Could not load jobs."
      : undefined;

  const search = (query: string) => {
    navigate(`/offres?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="space-y-7">
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">{t("jobSeeker", lang)}</p>
        <h1 className="text-2xl font-semibold">
          {lang === "fr" ? `Bonjour ${currentUser.name}` : `Hello ${currentUser.name}`}
        </h1>
      </header>

      <section aria-label={lang === "fr" ? "Recherche d'offres" : "Job search"}>
        <RecherchesRecentes onSearch={search} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{lang === "fr" ? "Catégories" : "Categories"}</h2>
        <GrilleCategories onSelect={(categoryId) => navigate(`/offres?category=${encodeURIComponent(categoryId)}`)} />
      </section>

      <RubriqueEntreprises
        companies={recruitingCompanies}
        loading={offersQuery.isLoading || employerProfilesQuery.isLoading}
        error={companiesError}
      />

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">{lang === "fr" ? "Offres récentes" : "Recent jobs"}</h2>
          <Link to="/offres" className="shrink-0 text-sm font-medium text-primary hover:underline">
            {lang === "fr" ? "Voir toutes les offres" : "View all jobs"}
          </Link>
        </div>

        {offersQuery.isLoading ? (
          <p role="status" className="py-6 text-sm text-muted-foreground">
            {lang === "fr" ? "Chargement des offres…" : "Loading jobs…"}
          </p>
        ) : offersError ? (
          <p role="alert" className="py-6 text-sm text-destructive">{offersError}</p>
        ) : recentOffers.length === 0 ? (
          <p className="py-6 text-sm text-muted-foreground">{t("noResults", lang)}</p>
        ) : (
          <div className="space-y-3">
            {recentOffers.map((offer) => (
              <RecentOffer
                key={offer.id}
                offer={offer}
                employerName={employerNames.get(offer.employerId) ?? ""}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function RecentOffer({ offer, employerName }: { offer: Offer; employerName: string }) {
  const companyInitials = employerName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toLocaleUpperCase())
    .join("") || "W";

  return (
    <article className="flex items-center gap-3 rounded-2xl border bg-card p-4 transition-colors hover:border-primary/50">
      <span
        aria-hidden="true"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary"
      >
        {companyInitials}
      </span>
      <span className="min-w-0 flex-1">
        <Link
          to={`/offres/${encodeURIComponent(offer.id)}`}
          className="block truncate font-medium hover:text-primary"
        >
          {offer.title}
        </Link>
        <span className="mt-1 block truncate text-sm text-muted-foreground">
          {employerName && (
            <Link
              to={`/entreprises/${encodeURIComponent(offer.employerId)}`}
              className="hover:text-primary hover:underline"
            >
              {employerName}
            </Link>
          )}
          {employerName && offer.location.city && " · "}
          {offer.location.city}
        </span>
      </span>
      <span className="shrink-0 text-right text-xs text-muted-foreground">
        {offer.pay}
      </span>
    </article>
  );
}

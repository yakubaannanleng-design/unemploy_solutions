// PROBLÈME RÉSOLU : affiche le suivi filtrable des candidatures chargées depuis Supabase.
import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useEmployerProfiles } from "@/features/employers/hooks/useEmployerProfiles";
import { useOffers } from "@/features/jobs/hooks/useOffers";
import { useLang } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import type { User } from "@/types";
import { useUserApplications } from "../hooks/useApplications";
import CarteCandidature from "./CarteCandidature";
import FiltresStatut from "./FiltresStatut";
import {
  APPLICATION_STATUS_FILTERS,
  filterApplications,
  type ApplicationStatusFilter,
} from "../utils/applicationStatus";

interface SeekerApplicationsViewProps {
  currentUser: User | null;
}

export default function SeekerApplicationsView({ currentUser }: SeekerApplicationsViewProps) {
  const { lang } = useLang();
  const [statusFilter, setStatusFilter] = useState<ApplicationStatusFilter>("all");
  const applicationsQuery = useUserApplications(currentUser?.id ?? null);
  const offersQuery = useOffers();
  const profilesQuery = useEmployerProfiles();
  const applications = useMemo(() => applicationsQuery.data ?? [], [applicationsQuery.data]);
  const offers = offersQuery.data ?? [];
  const profiles = profilesQuery.data ?? [];

  const counts = useMemo(() => {
    const result = Object.fromEntries(
      APPLICATION_STATUS_FILTERS.map((filter) => [filter, 0]),
    ) as Record<ApplicationStatusFilter, number>;
    result.all = applications.length;
    for (const application of applications) {
      const filter = application.status === "envoyée" || application.status === "consultée"
        ? "review"
        : application.status === "retenue"
          ? "retained"
          : application.status === "refusée"
            ? "rejected"
            : "withdrawn";
      result[filter] += 1;
    }
    return result;
  }, [applications]);

  const filteredApplications = useMemo(
    () => filterApplications(applications, statusFilter),
    [applications, statusFilter],
  );

  const loading =
    applicationsQuery.isLoading ||
    offersQuery.isLoading ||
    profilesQuery.isLoading;
  const failedQuery = [
    applicationsQuery,
    offersQuery,
    profilesQuery,
  ].find((query) => query.isError);
  const errorMessage = !supabase
    ? lang === "fr"
      ? "Connexion à Supabase indisponible. Vos candidatures ne peuvent pas être chargées."
      : "Supabase is unavailable. Your applications cannot be loaded."
    : failedQuery
      ? failedQuery.error instanceof Error
        ? failedQuery.error.message
        : lang === "fr"
          ? "Impossible de charger vos candidatures."
          : "Could not load your applications."
      : undefined;

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">{lang === "fr" ? "Mes candidatures" : "My applications"}</h1>
        <p role="status" className="text-muted-foreground">
          {lang === "fr" ? "Chargement…" : "Loading…"}
        </p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <section className="space-y-3">
        <h1 className="text-xl font-semibold">{lang === "fr" ? "Mes candidatures" : "My applications"}</h1>
        <p role="alert" className="text-sm text-destructive">{errorMessage}</p>
        {supabase && (
          <button
            type="button"
            className="min-h-10 rounded-md border px-3 text-sm font-medium hover:bg-accent"
            onClick={() => {
              void Promise.all([
                applicationsQuery.refetch(),
                offersQuery.refetch(),
                profilesQuery.refetch(),
              ]);
            }}
          >
            {lang === "fr" ? "Réessayer" : "Try again"}
          </button>
        )}
      </section>
    );
  }

  const emptyLabel = applications.length === 0
    ? lang === "fr"
      ? "Vous n'avez pas encore postulé à des offres."
      : "You haven't applied to any jobs yet."
    : lang === "fr"
      ? "Aucune candidature dans cette catégorie."
      : "No applications in this category.";

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">{lang === "fr" ? "Mes candidatures" : "My applications"}</h1>
        <span className="text-sm text-muted-foreground">
          {applications.length} {lang === "fr" ? "candidature(s)" : "application(s)"}
        </span>
      </header>

      <FiltresStatut
        value={statusFilter}
        counts={counts}
        onChange={setStatusFilter}
      />

      {filteredApplications.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            <p>{emptyLabel}</p>
            {applications.length === 0 && (
              <p className="mt-2 text-xs">
                {lang === "fr" ? "Consultez les offres disponibles pour postuler." : "Browse available jobs to apply."}
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredApplications.map((application) => {
            const offer = offers.find((item) => item.id === application.offerId);
            const employerName = profiles.find((profile) => profile.userId === offer?.employerId)?.orgName;
            return (
              <CarteCandidature
                key={application.id}
                application={application}
                offer={offer}
                employerName={employerName}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}

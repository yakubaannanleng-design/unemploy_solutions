import { useQuery } from "@tanstack/react-query";
import { useApplications } from "@/features/applications/hooks/useApplications";
import { useEmployerProfiles } from "@/features/employers/hooks/useEmployerProfiles";
import { useOffers } from "@/features/jobs/hooks/useOffers";
import { useUsers } from "@/features/auth/hooks/useUsers";
import { isOfferExpired } from "@/features/jobs/utils/filledOffers";
import { supabase } from "@/lib/supabase";
import type { ApplicationStatus, Offer } from "@/types";

export interface EmployerDashboardMetrics {
  activeOffers: number;
  applications: number;
  monthlyViews: number;
  toReview: number;
}

export interface RecentCandidate {
  applicationId: string;
  userName: string;
  offerTitle: string;
  status: ApplicationStatus;
  createdAt: string;
}

function isActiveOffer(offer: Offer, now: number): boolean {
  return offer.status === "publiée" && offer.isFilled !== true && !isOfferExpired(offer, now);
}

export function useEmployerDashboard(userId: string) {
  const offersQuery = useOffers();
  const applicationsQuery = useApplications();
  const usersQuery = useUsers();
  const profilesQuery = useEmployerProfiles();
  const offers = offersQuery.data ?? [];
  const myOffers = offers.filter((offer) => offer.employerId === userId);
  const offerIds = myOffers.map((offer) => offer.id);
  const monthlyViewsQuery = useQuery({
    queryKey: ["employerMonthlyViews", userId, offerIds],
    enabled: !!supabase && offerIds.length > 0,
    queryFn: async () => {
      if (!supabase) throw new Error("Connexion à Supabase indisponible.");
      if (offerIds.length === 0) return 0;
      const monthStart = new Date();
      monthStart.setUTCDate(1);
      monthStart.setUTCHours(0, 0, 0, 0);
      const { count, error } = await supabase
        .from("offer_views")
        .select("offer_id", { count: "exact", head: true })
        .in("offer_id", offerIds)
        .gte("viewed_at", monthStart.toISOString());
      if (error) throw error;
      return count ?? 0;
    },
  });

  const applications = (applicationsQuery.data ?? []).filter((application) =>
    offerIds.includes(application.offerId),
  );
  const users = usersQuery.data ?? [];
  const candidates = applications
    .map((application) => {
      const offer = myOffers.find((item) => item.id === application.offerId);
      const user = users.find((item) => item.id === application.seekerId);
      return {
        applicationId: application.id,
        userName: user?.name ?? "Candidat",
        offerTitle: offer?.title ?? "Offre",
        status: application.status,
        createdAt: application.createdAt,
      };
    })
    .sort((left, right) => {
      const leftDate = new Date(left.createdAt).getTime();
      const rightDate = new Date(right.createdAt).getTime();
      return (Number.isFinite(rightDate) ? rightDate : 0) - (Number.isFinite(leftDate) ? leftDate : 0);
    })
    .slice(0, 5);
  const failedQuery = [
    offersQuery,
    applicationsQuery,
    usersQuery,
    profilesQuery,
    monthlyViewsQuery,
  ].find((query) => query.isError);
  const queryError = failedQuery?.error;

  return {
    companyName:
      profilesQuery.data?.find((profile) => profile.userId === userId)?.orgName ?? "",
    metrics: {
      activeOffers: myOffers.filter((offer) => isActiveOffer(offer, Date.now())).length,
      applications: applications.length,
      monthlyViews: monthlyViewsQuery.data ?? 0,
      toReview: applications.filter((application) => application.status === "envoyée").length,
    } satisfies EmployerDashboardMetrics,
    recentCandidates: candidates,
    isLoading:
      !!supabase &&
      (offersQuery.isLoading ||
        applicationsQuery.isLoading ||
        usersQuery.isLoading ||
        profilesQuery.isLoading ||
        (offerIds.length > 0 && monthlyViewsQuery.isLoading)),
    error: !supabase
      ? new Error("Connexion à Supabase indisponible. Les données du tableau de bord ne peuvent pas être chargées.")
      : failedQuery
        ? queryError instanceof Error
          ? queryError
          : new Error("Impossible de charger les données du tableau de bord.")
        : undefined,
    retry: () => {
      if (!supabase) return;
      void Promise.allSettled([
        offersQuery.refetch(),
        applicationsQuery.refetch(),
        usersQuery.refetch(),
        profilesQuery.refetch(),
        ...(offerIds.length > 0 ? [monthlyViewsQuery.refetch()] : []),
      ]);
    },
  };
}

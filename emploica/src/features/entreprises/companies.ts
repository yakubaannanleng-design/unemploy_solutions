// PROBLÈME RÉSOLU : ne compte que les offres visibles pour présenter les entreprises qui recrutent.
import { isCandidateOfferVisible } from "@/features/jobs/utils/filledOffers";
import type { EmployerProfile, Offer } from "@/types";
import type { RecruitingCompany } from "./RubriqueEntreprises";

export function getRecruitingCompanies(
  profiles: EmployerProfile[],
  offers: Offer[],
): RecruitingCompany[] {
  const activeOfferCounts = new Map<string, number>();
  for (const offer of offers) {
    if (isCandidateOfferVisible(offer)) {
      activeOfferCounts.set(
        offer.employerId,
        (activeOfferCounts.get(offer.employerId) ?? 0) + 1,
      );
    }
  }

  return profiles
    .flatMap((profile) => {
      const activeOfferCount = activeOfferCounts.get(profile.userId) ?? 0;
      return activeOfferCount > 0
        ? [{
            id: profile.userId,
            name: profile.orgName,
            logoUrl: profile.logoUrl,
            activeOfferCount,
          }]
        : [];
    })
    .sort((a, b) => b.activeOfferCount - a.activeOfferCount || a.name.localeCompare(b.name));
}

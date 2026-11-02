/**
 * PROBLÈME RÉSOLU : définit la durée de visibilité et les règles de liste des offres pourvues.
 * RESPONSABILITÉ  : centralise le délai de sept jours utilisé par les listes et les détails.
 * NE FAIT PAS     : ne modifie pas les offres ni leur statut en base.
 * DÉPEND DE       : types/Offer.
 * UTILISÉ PAR     : features/jobs, features/search, features/dashboard.
 */
import type { Offer } from "@/types";

export const DELAI_AFFICHAGE_POURVU_JOURS = 7;

const FILLED_OFFER_VISIBILITY_MS = DELAI_AFFICHAGE_POURVU_JOURS * 24 * 60 * 60 * 1000;

export function isRecentlyFilledOffer(offer: Offer, now = Date.now()): boolean {
  if (!offer.isFilled || !offer.filledAt) return false;
  const filledAt = new Date(offer.filledAt).getTime();
  const age = now - filledAt;
  return Number.isFinite(filledAt) && age >= 0 && age <= FILLED_OFFER_VISIBILITY_MS;
}

export function isOfferExpired(offer: Offer, now = Date.now()): boolean {
  if (offer.status === "expirée") return true;
  if (!offer.expiresAt) return false;
  const expiresAt = new Date(offer.expiresAt).getTime();
  return !Number.isFinite(expiresAt) || expiresAt <= now;
}

export function isCandidateOfferVisible(
  offer: Offer,
  hideFilled = true,
  now = Date.now(),
): boolean {
  if (offer.isFilled) {
    const closedStatus = offer.status === "publiée" || offer.status === "clôturée";
    return !hideFilled && closedStatus && isRecentlyFilledOffer(offer, now);
  }
  return offer.status === "publiée" && !isOfferExpired(offer, now);
}

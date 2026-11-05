import { describe, expect, it } from "vitest";
import {
  DELAI_AFFICHAGE_POURVU_JOURS,
  isCandidateOfferVisible,
  isOfferExpired,
  isRecentlyFilledOffer,
} from "../features/jobs/utils/filledOffers";
import type { Offer } from "../types";

const now = Date.parse("2026-11-10T12:00:00Z");
const baseOffer: Offer = {
  id: "off-filled",
  employerId: "employer-1",
  title: "Comptable",
  description: "",
  tasks: [],
  category: "finance",
  skills: [],
  location: { region: "Centre", city: "Yaoundé" },
  contract: "permanent",
  duration: "CDI",
  schedule: "",
  pay: "",
  payMode: "fixe",
  createdAt: "2026-11-01T10:00:00Z",
  status: "clôturée",
  boost: false,
  views: 0,
};

describe("filled offers", () => {
  it("keeps a filled offer hidden by default and exposes it only for seven days", () => {
    const recentlyFilled: Offer = {
      ...baseOffer,
      isFilled: true,
      filledAt: new Date(now - 6 * 24 * 60 * 60 * 1000).toISOString(),
    };
    const expired: Offer = {
      ...recentlyFilled,
      filledAt: new Date(now - 8 * 24 * 60 * 60 * 1000).toISOString(),
    };

    expect(DELAI_AFFICHAGE_POURVU_JOURS).toBe(7);
    expect(isCandidateOfferVisible(recentlyFilled, true, now)).toBe(false);
    expect(isCandidateOfferVisible(recentlyFilled, false, now)).toBe(true);
    expect(isRecentlyFilledOffer(expired, now)).toBe(false);
    expect(isCandidateOfferVisible(expired, false, now)).toBe(false);
  });

  it("does not keep filled offers with a missing or invalid closure date", () => {
    expect(isCandidateOfferVisible({ ...baseOffer, isFilled: true }, false, now)).toBe(false);
    expect(isRecentlyFilledOffer({ ...baseOffer, isFilled: true, filledAt: "invalid" }, now)).toBe(false);
  });

  it("hides deadline-expired offers from candidate lists even before the scheduled status update", () => {
    const expired: Offer = {
      ...baseOffer,
      status: "publiée",
      expiresAt: new Date(now - 1).toISOString(),
    };
    const active: Offer = {
      ...baseOffer,
      status: "publiée",
      expiresAt: new Date(now + 1).toISOString(),
    };

    expect(isOfferExpired(expired, now)).toBe(true);
    expect(isCandidateOfferVisible(expired, false, now)).toBe(false);
    expect(isOfferExpired(active, now)).toBe(false);
    expect(isOfferExpired({ ...active, expiresAt: "invalid" }, now)).toBe(true);
  });
});

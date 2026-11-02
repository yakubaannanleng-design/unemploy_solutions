import { describe, expect, it } from "vitest";
import { filterOffers } from "../features/jobs/hooks/useOffers";
import type { Offer } from "../types";

const offers: Offer[] = [
  {
    id: "job-1",
    employerId: "company-1",
    title: "Développeur web junior",
    description: "Créer des applications web",
    tasks: [],
    category: "informatique",
    skills: ["React"],
    location: { region: "Littoral", city: "Douala" },
    contract: "permanent",
    duration: "CDI",
    schedule: "Temps plein",
    pay: "250 000 FCFA",
    payMode: "fixe",
    createdAt: "2026-11-02T10:00:00Z",
    status: "publiée",
    boost: false,
    views: 0,
  },
  {
    id: "job-2",
    employerId: "company-2",
    title: "Stage marketing",
    description: "Accompagner l'équipe marketing",
    tasks: [],
    category: "commerce",
    skills: [],
    location: { region: "Centre", city: "Yaoundé" },
    contract: "stage",
    duration: "3 mois",
    schedule: "Temps plein",
    pay: "Indemnisé",
    payMode: "fixe",
    createdAt: "2026-11-01T10:00:00Z",
    status: "publiée",
    boost: false,
    views: 0,
  },
];

describe("filterOffers", () => {
  it("recherche dans le titre, le lieu et l'entreprise", () => {
    const companyNames = new Map([
      ["company-1", "Entreprise Alpha"],
      ["company-2", "Agence Kora"],
    ]);

    expect(filterOffers(offers, { search: "alpha" }, companyNames).map(({ id }) => id)).toEqual(["job-1"]);
    expect(filterOffers(offers, { search: "YAOUNDE" }).map(({ id }) => id)).toEqual(["job-2"]);
  });

  it("combine les filtres de ville et de contrat en ignorant les accents", () => {
    expect(filterOffers(offers, { city: "Yaounde", contract: "stage" }).map(({ id }) => id)).toEqual(["job-2"]);
    expect(filterOffers(offers, { city: "Douala", contract: "stage" })).toEqual([]);
  });

  it("combine quartier, niveau, expérience, salaire et statut pourvu", () => {
    const enrichedOffer: Offer = {
      ...offers[0],
      location: { ...offers[0].location, quartier: "Akwa" },
      educationLevel: "licence",
      experienceLevel: "1-3",
      salaryMin: 200_000,
      salaryMax: 350_000,
      isFilled: false,
    };
    const filledOffer: Offer = { ...enrichedOffer, id: "job-filled", isFilled: true };
    const options = {
      quartier: "Akwa",
      educationLevel: "licence",
      experienceLevel: "1-3",
      salaryMin: 250_000,
      salaryMax: 400_000,
      hideFilled: true,
    };

    expect(filterOffers([enrichedOffer, filledOffer], options).map(({ id }) => id)).toEqual(["job-1"]);
    expect(filterOffers([enrichedOffer], { ...options, salaryMin: 400_000 })).toEqual([]);
  });
});

// PROBLÈME RÉSOLU : vérifie la sélection des entreprises et les liens publics associés.
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { EmployerProfile, Offer } from "@/types";
import { getRecruitingCompanies } from "@/features/entreprises/companies";
import { RubriqueEntreprises } from "@/features/entreprises";
import OffresEntreprise from "@/features/entreprises/OffresEntreprise";

function offer(
  id: string,
  employerId: string,
  overrides: Partial<Offer> = {},
): Offer {
  return {
    id,
    employerId,
    title: `Offre ${id}`,
    description: "",
    tasks: [],
    category: "commerce",
    skills: [],
    location: { region: "Littoral", city: "Douala" },
    contract: "permanent",
    duration: "",
    schedule: "",
    pay: "",
    payMode: "fixe",
    createdAt: "2026-01-01T00:00:00.000Z",
    status: "publiée",
    boost: false,
    views: 0,
    ...overrides,
  };
}

function company(userId: string, orgName: string): EmployerProfile {
  return {
    userId,
    orgName,
    description: "Entreprise de test",
    orgType: "entreprise",
    verification: "déclaré",
  };
}

describe("Entreprises qui recrutent", () => {
  it("ne compte que les offres actuellement visibles et ignore les entreprises sans offre", () => {
    const profiles = [
      company("company-a", "Alpha"),
      company("company-b", "Beta"),
      company("company-c", "Gamma"),
    ];
    const companies = getRecruitingCompanies(profiles, [
      offer("a1", "company-a"),
      offer("a2", "company-a"),
      offer("b1", "company-b"),
      offer("b2", "company-b", { status: "expirée" }),
      offer("c1", "company-c", { status: "clôturée", isFilled: true }),
      offer("unlinked", "missing-profile"),
    ]);

    expect(companies).toEqual([
      { id: "company-a", name: "Alpha", logoUrl: undefined, activeOfferCount: 2 },
      { id: "company-b", name: "Beta", logoUrl: undefined, activeOfferCount: 1 },
    ]);
  });

  it("affiche les entreprises avec un lien vers leur page publique", () => {
    render(
      <MemoryRouter>
        <RubriqueEntreprises
          companies={[{ id: "company/1", name: "Alpha", activeOfferCount: 3 }]}
          loading={false}
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: /Alpha.*3 offre/ })).toHaveAttribute(
      "href",
      "/entreprises/company%2F1",
    );
  });

  it("réutilise les cartes d'offres et relie le nom de l'entreprise à sa page", () => {
    const profile = company("company-a", "Alpha");
    render(
      <MemoryRouter>
        <OffresEntreprise company={profile} offers={[offer("job-1", profile.userId)]} />
      </MemoryRouter>,
    );

    expect(screen.getByRole("button", { name: "Offre job-1" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Alpha" })).toHaveAttribute(
      "href",
      "/entreprises/company-a",
    );
  });
});

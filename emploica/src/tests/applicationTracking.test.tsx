// PROBLÈME RÉSOLU : vérifie les filtres de suivi des candidatures et l'accès au détail de l'offre.
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import SeekerApplicationsView from "@/features/applications/components/SeekerApplicationsView";
import type { Application, EmployerProfile, Offer, User } from "@/types";

const mocks = vi.hoisted(() => ({
  applications: [] as Application[],
  offers: [] as Offer[],
  profiles: [] as EmployerProfile[],
  supabase: {},
}));

vi.mock("@/features/applications/hooks/useApplications", () => ({
  useUserApplications: () => ({ data: mocks.applications, isLoading: false, isError: false }),
}));

vi.mock("@/features/jobs/hooks/useOffers", () => ({
  useOffers: () => ({ data: mocks.offers, isLoading: false, isError: false }),
}));

vi.mock("@/features/employers/hooks/useEmployerProfiles", () => ({
  useEmployerProfiles: () => ({ data: mocks.profiles, isLoading: false, isError: false }),
}));

vi.mock("@/lib/supabase", () => ({ supabase: mocks.supabase }));

const seeker: User = {
  id: "seeker-1",
  role: "chercheur",
  name: "Candidat",
  phone: "+237 600 000 000",
  passwordHash: "",
  status: "actif",
  verification: "déclaré",
  createdAt: "2026-01-01T00:00:00.000Z",
};

const offer: Offer = {
  id: "job-1",
  employerId: "company-1",
  title: "Assistante comptable",
  description: "",
  tasks: [],
  category: "finance",
  skills: [],
  location: { region: "Centre", city: "Yaoundé" },
  contract: "permanent",
  duration: "",
  schedule: "",
  pay: "",
  payMode: "fixe",
  createdAt: "2026-01-01T00:00:00.000Z",
  status: "publiée",
  boost: false,
  views: 0,
};

function application(id: string, status: Application["status"]): Application {
  return {
    id,
    offerId: offer.id,
    seekerId: seeker.id,
    status,
    createdAt: "2026-02-01T00:00:00.000Z",
  };
}

function renderView() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <SeekerApplicationsView currentUser={seeker} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("Suivi des candidatures", () => {
  afterEach(cleanup);

  it("filtre les statuts persistés et navigue vers l'offre correspondante", () => {
    mocks.applications = [
      application("app-sent", "envoyée"),
      application("app-viewed", "consultée"),
      application("app-retained", "retenue"),
      application("app-rejected", "refusée"),
      application("app-withdrawn", "retirée"),
    ];
    mocks.offers = [offer];
    mocks.profiles = [{
      userId: "company-1",
      orgName: "Entreprise Alpha",
      description: "",
      orgType: "entreprise",
      verification: "déclaré",
    }];
    renderView();

    expect(screen.getByText("5 candidature(s)")).toBeInTheDocument();
    expect(screen.getAllByText("Entreprise Alpha · Yaoundé")).toHaveLength(5);
    const offerLinks = screen.getAllByRole("link", { name: "Voir l'offre" });
    expect(offerLinks).toHaveLength(5);
    expect(offerLinks[0]).toHaveAttribute("href", "/offres/job-1");

    fireEvent.click(screen.getByRole("button", { name: /En revue/ }));
    expect(screen.getAllByText("Assistante comptable")).toHaveLength(2);
    expect(screen.queryByText("Retenue")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Non retenues/ }));
    expect(screen.getByText("Non retenue")).toBeInTheDocument();
    expect(screen.getAllByText("Assistante comptable")).toHaveLength(1);
  });
});

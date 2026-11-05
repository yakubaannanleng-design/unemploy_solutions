import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import MesOffres from "../features/employeur/MesOffres";
import type { Application, EmployerProfile, Offer, User } from "../types";

const mocks = vi.hoisted(() => ({
  offers: [] as Offer[],
  applications: [] as Application[],
  profiles: [] as EmployerProfile[],
  rpc: vi.fn(),
}));

vi.mock("../features/jobs/hooks/useOffers", () => ({
  useOffers: () => ({ data: mocks.offers, isLoading: false, isError: false }),
}));

vi.mock("../features/applications/hooks/useApplications", () => ({
  useApplications: () => ({ data: mocks.applications, isLoading: false, isError: false }),
}));

vi.mock("../features/employers/hooks/useEmployerProfiles", () => ({
  useEmployerProfiles: () => ({ data: mocks.profiles, isLoading: false, isError: false }),
}));

vi.mock("../lib/supabase", () => ({
  supabase: { rpc: mocks.rpc },
}));

const employer: User = {
  id: "employer-1",
  role: "employeur",
  name: "Employeur",
  phone: "+237 600 000 000",
  passwordHash: "",
  status: "actif",
  verification: "déclaré",
  createdAt: "2026-01-01T00:00:00Z",
};

function offer(id: string, overrides: Partial<Offer> = {}): Offer {
  return {
    id,
    employerId: employer.id,
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
    createdAt: "2026-01-01T00:00:00Z",
    expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
    status: "publiée",
    boost: false,
    views: 0,
    ...overrides,
  };
}

function renderOffers() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <MesOffres currentUser={employer} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("MesOffres", () => {
  beforeEach(() => {
    mocks.offers = [
      offer("active"),
      offer("filled", { isFilled: true, status: "clôturée", filledAt: new Date().toISOString() }),
      offer("expired", { status: "expirée", expiresAt: new Date(Date.now() - 86_400_000).toISOString() }),
    ];
    mocks.applications = [{
      id: "application-1",
      offerId: "active",
      seekerId: "seeker-1",
      status: "envoyée",
      createdAt: new Date().toISOString(),
    }];
    mocks.profiles = [{
      userId: employer.id,
      orgName: "Entreprise Alpha",
      description: "",
      orgType: "entreprise",
      verification: "déclaré",
    }];
    mocks.rpc.mockReset();
    mocks.rpc.mockImplementation(async (name: string) => ({
      data: name === "mark_offer_filled" ? true : 0,
      error: null,
    }));
  });
  afterEach(cleanup);

  it("filtre les offres par état et permet de confirmer un poste pourvu", async () => {
    renderOffers();

    expect(await screen.findByText("Offre active")).toBeInTheDocument();
    expect(screen.getByText("Offre active").parentElement).toHaveTextContent(/1\s+candidature/);

    fireEvent.click(screen.getByRole("tab", { name: /Pourvues/ }));
    expect(await screen.findByText("Offre filled")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: /Expirées/ }));
    expect(await screen.findByText("Offre expired")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: /Actives/ }));
    fireEvent.click(await screen.findByRole("button", { name: "Poste pourvu" }));
    expect(screen.getByText(/Les candidats ne pourront plus postuler/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Confirmer" }));

    await waitFor(() => {
      expect(mocks.rpc).toHaveBeenCalledWith("mark_offer_filled", { p_offer_id: "active" });
    });
  });
});

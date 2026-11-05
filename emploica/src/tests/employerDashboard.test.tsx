import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import DashboardEmployeur from "../features/employeur/DashboardEmployeur";
import type { Application, EmployerProfile, Offer, User } from "../types";

const mocks = vi.hoisted(() => ({
  offers: [] as Offer[],
  applications: [] as Application[],
  users: [] as User[],
  profiles: [] as EmployerProfile[],
  from: vi.fn(),
  select: vi.fn(),
  in: vi.fn(),
  gte: vi.fn(),
}));

vi.mock("../features/jobs/hooks/useOffers", () => ({
  useOffers: () => ({ data: mocks.offers, isLoading: false, error: null }),
}));

vi.mock("../features/applications/hooks/useApplications", () => ({
  useApplications: () => ({ data: mocks.applications, isLoading: false, error: null }),
}));

vi.mock("../features/auth/hooks/useUsers", () => ({
  useUsers: () => ({ data: mocks.users, isLoading: false, error: null }),
}));

vi.mock("../features/employers/hooks/useEmployerProfiles", () => ({
  useEmployerProfiles: () => ({ data: mocks.profiles, isLoading: false, error: null }),
}));

vi.mock("../lib/supabase", () => ({
  supabase: { from: mocks.from },
}));

const employer: User = {
  id: "employer-1",
  role: "employeur",
  name: "Employeur",
  phone: "",
  passwordHash: "",
  status: "actif",
  verification: "déclaré",
  createdAt: "2026-01-01T00:00:00Z",
};

function offer(id: string, employerId: string, overrides: Partial<Offer> = {}): Offer {
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
    createdAt: "2026-01-01T00:00:00Z",
    expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
    status: "publiée",
    boost: false,
    views: 0,
    ...overrides,
  };
}

function user(id: string, name: string): User {
  return {
    ...employer,
    id,
    role: "chercheur",
    name,
  };
}

function renderDashboard() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <DashboardEmployeur currentUser={employer} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("DashboardEmployeur", () => {
  beforeEach(() => {
    mocks.offers = [
      offer("my-active", employer.id),
      offer("my-filled", employer.id, { isFilled: true }),
      offer("other-employer", "employer-2"),
    ];
    mocks.applications = [
      {
        id: "application-old",
        offerId: "my-active",
        seekerId: "seeker-old",
        status: "consultée",
        createdAt: "2026-02-01T10:00:00Z",
      },
      {
        id: "application-new",
        offerId: "my-active",
        seekerId: "seeker-new",
        status: "envoyée",
        createdAt: "2026-02-02T10:00:00Z",
      },
      {
        id: "application-other",
        offerId: "other-employer",
        seekerId: "seeker-new",
        status: "envoyée",
        createdAt: "2026-02-03T10:00:00Z",
      },
    ];
    mocks.users = [user("seeker-old", "Jean Tchoumi"), user("seeker-new", "Aïcha Ngono")];
    mocks.profiles = [{
      userId: employer.id,
      orgName: "Entreprise Alpha",
      description: "",
      orgType: "entreprise",
      verification: "déclaré",
    }];
    mocks.gte.mockResolvedValue({ count: 12, error: null });
    mocks.in.mockReturnValue({ gte: mocks.gte });
    mocks.select.mockReturnValue({ in: mocks.in });
    mocks.from.mockReturnValue({ select: mocks.select });
  });

  it("affiche les métriques Supabase agrégées pour les offres de l'employeur", async () => {
    renderDashboard();

    expect(await screen.findByRole("heading", { name: "Entreprise Alpha" })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("Vues ce mois").parentElement).toHaveTextContent("12");
    });
    expect(screen.getByText("Offres actives").parentElement).toHaveTextContent("1");
    expect(screen.getByText("Candidatures").parentElement).toHaveTextContent("2");
    expect(screen.getByText("À examiner").parentElement).toHaveTextContent("1");
    expect(screen.getByText("Aïcha Ngono")).toBeInTheDocument();
    expect(mocks.from).toHaveBeenCalledWith("offer_views");
    expect(mocks.in).toHaveBeenCalledWith("offer_id", ["my-active", "my-filled"]);
  });
});

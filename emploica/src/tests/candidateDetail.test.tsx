// PROBLÈME RÉSOLU : vérifie que l'employeur peut consulter et traiter uniquement une candidature issue de Supabase.
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { Application, Offer, SeekerProfile, User } from "@/types";
import DetailCandidat from "@/features/employeur/DetailCandidat";

const mocks = vi.hoisted(() => ({
  applications: [] as Application[],
  offers: [] as Offer[],
  users: [] as User[],
  profiles: [] as SeekerProfile[],
  rpc: vi.fn(),
}));

vi.mock("@/features/applications/hooks/useApplications", () => ({
  useApplications: () => ({ data: mocks.applications, isLoading: false, isError: false }),
}));

vi.mock("@/features/jobs/hooks/useOffers", () => ({
  useOffers: () => ({ data: mocks.offers, isLoading: false, isError: false }),
}));

vi.mock("@/features/auth/hooks/useUsers", () => ({
  useUsers: () => ({ data: mocks.users, isLoading: false, isError: false }),
}));

vi.mock("@/features/seekers/hooks/useSeekerProfiles", () => ({
  useSeekerProfiles: () => ({ data: mocks.profiles, isLoading: false, isError: false }),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: { rpc: mocks.rpc },
}));

const employer: User = {
  id: "employer-1",
  role: "employeur",
  name: "Employeur Alpha",
  phone: "+237 600 000 000",
  passwordHash: "",
  status: "actif",
  verification: "déclaré",
  createdAt: "2026-01-01T00:00:00.000Z",
};

const candidate: User = {
  ...employer,
  id: "candidate-1",
  role: "chercheur",
  name: "Aïcha N.",
};

const offer: Offer = {
  id: "job-1",
  employerId: employer.id,
  title: "Développeuse web",
  description: "",
  tasks: [],
  category: "informatique",
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

function resetMocks() {
  mocks.applications = [{
    id: "application-1",
    offerId: offer.id,
    seekerId: candidate.id,
    status: "envoyée",
    createdAt: "2026-02-01T00:00:00.000Z",
  }];
  mocks.offers = [offer];
  mocks.users = [candidate];
  mocks.profiles = [{
    userId: candidate.id,
    bio: "",
    skills: ["React", "TypeScript"],
    categories: [],
    contractWanted: [],
    availability: "immediately",
    zone: { region: "Centre", city: "Yaoundé" },
    radiusKm: 10,
    experience: "",
    education: "Licence en informatique",
    cvUrl: "https://storage.example/candidate/cv.pdf",
    languages: [],
    missionsDone: 0,
  }];
  mocks.rpc.mockReset();
  mocks.rpc.mockResolvedValue({ data: true, error: null });
}

function renderCandidate() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/employeur/candidatures/application-1"]}>
        <Routes>
          <Route
            path="/employeur/candidatures/:id"
            element={<DetailCandidat currentUser={employer} />}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("Détail candidat côté employeur", () => {
  afterEach(cleanup);

  it("affiche le profil et persiste la décision de présélection", async () => {
    resetMocks();
    renderCandidate();

    expect(screen.getByRole("heading", { name: "Aïcha N." })).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Voir le CV" })).toHaveAttribute(
      "href",
      "https://storage.example/candidate/cv.pdf",
    );
    fireEvent.click(screen.getByRole("button", { name: "Convoquer" }));

    await waitFor(() => {
      expect(mocks.rpc).toHaveBeenCalledWith("update_application_status", {
        p_application_id: "application-1",
        p_status: "retenue",
      });
    });
  });

  it("enregistre le refus via la même mutation serveur", async () => {
    resetMocks();
    renderCandidate();
    fireEvent.click(screen.getByRole("button", { name: "Refuser" }));

    await waitFor(() => {
      expect(mocks.rpc).toHaveBeenCalledWith("update_application_status", {
        p_application_id: "application-1",
        p_status: "refusee",
      });
    });
  });

  it("refuse l'accès à une candidature appartenant à une autre entreprise", () => {
    resetMocks();
    const anotherEmployerOffer: Offer = { ...offer, employerId: "employer-2" };
    mocks.offers = [anotherEmployerOffer];
    renderCandidate();

    expect(screen.getByRole("alert")).toHaveTextContent("ne vous appartient pas");
    expect(screen.queryByRole("button", { name: "Convoquer" })).not.toBeInTheDocument();
  });
});

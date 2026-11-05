// PROBLÈME RÉSOLU : vérifie la persistance Supabase et l'accès à la création d'alertes emploi.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import PageAlertes from "@/features/alertes/PageAlertes";
import SearchView from "@/features/search/components/SearchView";

const mocks = vi.hoisted(() => ({
  alerts: [] as Record<string, unknown>[],
  offers: [] as never[],
  from: vi.fn(),
}));

vi.mock("@/lib/store", () => ({
  useStore: () => ({
    currentUser: { id: "seeker-1" },
    state: { users: [], conversations: [] },
  }),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: { from: mocks.from },
}));

vi.mock("@/features/jobs/hooks/useOffers", () => ({
  useOffers: () => ({ data: mocks.offers, isLoading: false, isError: false }),
}));

function renderWithRouter(element: React.ReactNode, initialEntry = "/alertes") {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        {element}
        <CurrentLocation />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function CurrentLocation() {
  const location = useLocation();
  return <output data-testid="location">{location.pathname}{location.search}</output>;
}

function SearchAndAlertRoutes() {
  return (
    <Routes>
      <Route path="/recherche" element={<SearchView />} />
      <Route path="/alertes" element={<PageAlertes />} />
    </Routes>
  );
}

describe("Alertes emploi", () => {
  beforeEach(() => {
    mocks.alerts = [];
    mocks.offers = [];
    mocks.from.mockImplementation(() => ({
      select: () => ({
        eq: (_column: string, userId: string) => ({
          order: async () => ({
            data: mocks.alerts.filter((alert) => alert.user_id === userId),
            error: null,
          }),
        }),
      }),
      insert: async (row: Record<string, unknown>) => {
        mocks.alerts.push({ ...row, active: true, created_at: new Date().toISOString() });
        return { error: null };
      },
      update: (values: Record<string, unknown>) => ({
        eq: (_column: string, id: string) => ({
          eq: async () => {
            const alert = mocks.alerts.find((item) => item.id === id);
            if (alert) Object.assign(alert, values);
            return { error: null };
          },
        }),
      }),
      delete: () => ({
        eq: (_column: string, id: string) => ({
          eq: async () => {
            mocks.alerts = mocks.alerts.filter((alert) => alert.id !== id);
            return { error: null };
          },
        }),
      }),
    }));
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("crée une alerte dans Supabase avec les critères et la fréquence choisis", async () => {
    renderWithRouter(<PageAlertes />);
    fireEvent.click(screen.getAllByRole("button", { name: "Créer une alerte" })[0]);
    fireEvent.change(screen.getByLabelText("Catégorie"), { target: { value: "informatique" } });
    fireEvent.change(screen.getByLabelText("Ville"), { target: { value: "Douala" } });
    fireEvent.change(screen.getByLabelText("Type de contrat"), { target: { value: "permanent" } });
    fireEvent.change(screen.getByLabelText("Fréquence"), { target: { value: "daily" } });
    fireEvent.click(screen.getByRole("button", { name: "Créer l'alerte" }));

    await waitFor(() => {
      expect(mocks.alerts).toEqual([
        expect.objectContaining({
          user_id: "seeker-1",
          category: "informatique",
          city: "Douala",
          contract: "permanent",
          frequency: "daily",
          active: true,
        }),
      ]);
    });
    expect(await screen.findByText("Informatique et numérique · Douala")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("switch", { name: "Désactiver l'alerte Informatique et numérique" }));
    await waitFor(() => {
      expect(mocks.alerts[0].active).toBe(false);
    });
    expect(await screen.findByText("Inactive")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Supprimer l'alerte" }));
    await waitFor(() => {
      expect(mocks.alerts).toEqual([]);
    });
  });

  it("ouvre le formulaire depuis une recherche d'offres sans résultat", async () => {
    renderWithRouter(<SearchAndAlertRoutes />, "/recherche");
    fireEvent.change(
      screen.getByPlaceholderText("Rechercher des offres, utilisateurs, messages..."),
      { target: { value: "emploi introuvable" } },
    );

    fireEvent.click(await screen.findByRole("button", { name: "Créer une alerte" }));

    await waitFor(() => {
      expect(screen.getByTestId("location")).toHaveTextContent("/alertes?create=1");
    });
    expect(await screen.findByText("Nouvelle alerte emploi")).toBeInTheDocument();
  });
});

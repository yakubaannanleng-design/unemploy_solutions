// PROBLÈME RÉSOLU : vérifie que la page des favoris lit et modifie les données Supabase.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Offer } from "@/types";
import FavoritesView from "@/features/favorites/components/FavoritesView";

const mocks = vi.hoisted(() => ({
  favorites: [] as { offer_id: string }[],
  from: vi.fn(),
  updateStore: vi.fn(),
}));

vi.mock("@/lib/store", () => ({
  useStore: () => ({ currentUser: { id: "seeker-1" }, update: mocks.updateStore }),
}));

vi.mock("@/features/jobs/hooks/useOffers", () => ({
  useOffers: () => ({
    data: [offer],
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: { from: mocks.from },
}));

const offer: Offer = {
  id: "job-1",
  employerId: "employer-1",
  title: "Développeuse web",
  description: "Une offre de test",
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

function renderFavorites() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <FavoritesView />
    </QueryClientProvider>,
  );
}

describe("Offres enregistrées", () => {
  beforeEach(() => {
    mocks.favorites = [{ offer_id: offer.id }];
    mocks.from.mockImplementation(() => ({
      select: () => ({
        eq: async () => ({ data: [...mocks.favorites], error: null }),
      }),
      delete: () => ({
        eq: () => ({
          eq: async (_column: string, offerId: string) => {
            mocks.favorites = mocks.favorites.filter((favorite) => favorite.offer_id !== offerId);
            return { error: null };
          },
        }),
      }),
      insert: async (favorite: { offer_id: string }) => {
        mocks.favorites.push(favorite);
        return { error: null };
      },
    }));
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("charge les favoris et persiste leur retrait dans Supabase", async () => {
    renderFavorites();
    expect(await screen.findByText(offer.title)).toBeInTheDocument();
    expect(mocks.updateStore).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Retirer des favoris" }));

    await waitFor(() => {
      expect(mocks.favorites).toEqual([]);
      expect(screen.queryByText(offer.title)).not.toBeInTheDocument();
    });
  });
});

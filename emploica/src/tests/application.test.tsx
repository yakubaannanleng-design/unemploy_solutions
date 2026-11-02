import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient";
import { StoreProvider } from "../lib/store";
import { OffersView } from "features/jobs";

vi.mock("../lib/supabase", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: async () => ({ data: [], error: null }),
      }),
    }),
  },
}));

vi.mock("../features/jobs/hooks/useOffers", () => ({
  filterOffers: (offers: unknown[]) => offers,
  useOffers: () => ({
    data: [
      {
        id: "off-1",
        employerId: "u-employer",
        title: "Mécanicien automobile",
        status: "publiée",
        category: "mecanique",
        location: { region: "Littoral", city: "Douala", quartier: "" },
        skills: [],
        tasks: [],
        contract: "permanent",
        duration: "CDI",
        schedule: "",
        pay: "120 000 FCFA",
        payMode: "fixe",
        createdAt: "2026-10-22T09:00:00Z",
        boost: false,
        views: 0,
      },
    ],
    isLoading: false,
  }),
}));

vi.mock("../features/employers/hooks/useEmployerProfiles", () => ({
  useEmployerProfiles: () => ({ data: [], isLoading: false, isError: false }),
}));

vi.mock("../features/applications/hooks/useApplications", () => ({
  useUserApplications: () => ({ data: [], isLoading: false, isError: false }),
}));

describe("OffersView - application", () => {
  it("affiche l'offre disponible", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <StoreProvider>
          <BrowserRouter>
            <OffersView />
          </BrowserRouter>
        </StoreProvider>
      </QueryClientProvider>
    );
    expect(screen.getByText("Mécanicien automobile")).toBeTruthy();
  });
});

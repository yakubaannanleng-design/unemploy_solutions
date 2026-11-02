import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { StoreProvider } from "../lib/store";
import DetailOffre from "../features/jobs/components/DetailOffre";
import type { Offer } from "../types";

const offer: Offer = {
  id: "off-detail",
  employerId: "u-employer",
  title: "Développeur web junior",
  description: "Rejoignez l'équipe produit pour développer des applications web.",
  tasks: ["Développer les applications"],
  category: "informatique",
  skills: ["React", "JavaScript"],
  location: { region: "Littoral", city: "Douala" },
  contract: "permanent",
  duration: "CDI",
  schedule: "Hybride",
  pay: "250 000 FCFA",
  payMode: "fixe",
  createdAt: "2026-10-22T09:00:00Z",
  status: "publiée",
  boost: false,
  views: 0,
};

const mockOffers = vi.hoisted(() => ({ value: [] as unknown[] }));
const mockRpc = vi.hoisted(() => vi.fn(async () => ({ error: null })));

vi.mock("../features/jobs/hooks/useOffers", () => ({
  useOffers: () => ({ data: mockOffers.value, isLoading: false, isError: false }),
}));

vi.mock("../features/employers/hooks/useEmployerProfiles", () => ({
  useEmployerProfiles: () => ({
    data: [{ userId: "u-employer", orgName: "Orange Cameroun", verification: "vérifié" }],
    isLoading: false,
    isError: false,
  }),
}));

vi.mock("../features/applications/hooks/useApplications", () => ({
  useUserApplications: () => ({ data: [], isLoading: false, isError: false }),
}));

vi.mock("../lib/supabase", () => ({
  supabase: {
    rpc: mockRpc,
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { phone: "+237 600 000 002" }, error: null }) }) }),
      insert: async () => ({ error: null }),
    }),
  },
}));

function renderDetail() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <MemoryRouter initialEntries={["/offres/off-detail"]}>
          <Routes>
            <Route path="/offres/:id" element={<DetailOffre />} />
          </Routes>
        </MemoryRouter>
      </StoreProvider>
    </QueryClientProvider>,
  );
}

describe("DetailOffre", () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockOffers.value = [offer];
    mockRpc.mockClear();
  });
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("affiche les informations de l'offre et partage son URL de détail", async () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    renderDetail();

    await waitFor(() => {
      expect(mockRpc).toHaveBeenCalledWith("record_offer_view", { p_offer_id: "off-detail" });
    });
    expect(screen.getByRole("heading", { name: "Développeur web junior" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Orange Cameroun" })).toHaveAttribute(
      "href",
      "/entreprises/u-employer",
    );
    expect(screen.getByText("Littoral · Douala")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Employeur vérifié")).toBeInTheDocument();
    expect(screen.getByText("Un employeur sérieux ne demande jamais d'argent pour postuler.")).toBeInTheDocument();
    expect(await screen.findByRole("link", { name: "WhatsApp" })).toHaveAttribute(
      "href",
      expect.stringContaining("wa.me/237600000002"),
    );

    fireEvent.click(screen.getByRole("button", { name: "Partager l'offre" }));
    const sharedUrl = open.mock.calls[0]?.[0];
    if (typeof sharedUrl !== "string") throw new Error("WhatsApp n'a pas été ouvert.");
    const encodedUrl = new URL(sharedUrl).searchParams.get("text");
    expect(decodeURIComponent(encodedUrl ?? "")).toContain(`${window.location.origin}/offres/off-detail`);
  });

  it("envoie la candidature et désactive ensuite le bouton", async () => {
    renderDetail();
    fireEvent.click(screen.getByRole("button", { name: "Postuler" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Candidature envoyée" })).toBeDisabled();
    });
  });

  it("enregistre un signalement avec le motif choisi", async () => {
    renderDetail();
    fireEvent.click(screen.getByRole("button", { name: "Signaler cette offre" }));
    fireEvent.click(screen.getByLabelText("Fausse offre"));
    fireEvent.click(screen.getByRole("button", { name: "Envoyer" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Offre signalée" })).toBeDisabled();
    });
  });

  it("affiche l'état pourvu, ses offres similaires et bloque les actions de contact et de candidature", async () => {
    const filledOffer: Offer = {
      ...offer,
      status: "clôturée",
      isFilled: true,
      filledAt: new Date().toISOString(),
    };
    const similarOffer: Offer = { ...offer, id: "off-similar", title: "Comptable junior" };
    mockOffers.value = [filledOffer, similarOffer];
    renderDetail();

    expect(screen.getByText("Ce poste a déjà été pourvu")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Comptable junior/ })).toHaveAttribute(
      "href",
      "/offres/off-similar",
    );
    expect(screen.getByRole("button", { name: "Poste pourvu" })).toBeDisabled();
    expect(await screen.findByRole("button", { name: "WhatsApp" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Appeler" })).toBeDisabled();
  });
});

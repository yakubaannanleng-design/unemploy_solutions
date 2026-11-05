import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import AdminPanel from "@/features/admin/components/AdminPanel";
import type { Offer } from "@/types";

const mocks = vi.hoisted(() => ({
  invoke: vi.fn(),
  rpc: vi.fn(),
  update: vi.fn(),
}));

const offer: Offer = {
  id: "off-42",
  employerId: "employer-1",
  title: "Comptable",
  description: "Rejoignez notre équipe.",
  tasks: [],
  category: "finance",
  skills: [],
  location: { region: "Centre", city: "Yaoundé" },
  contract: "permanent",
  duration: "",
  schedule: "",
  pay: "150 000 FCFA",
  payMode: "fixe",
  createdAt: "2026-01-01T00:00:00.000Z",
  status: "en-attente",
  boost: false,
  views: 0,
  shareTelegram: true,
};

vi.mock("@/lib/supabase", () => ({
  supabase: {
    functions: { invoke: mocks.invoke },
    rpc: mocks.rpc,
  },
}));

vi.mock("@/features/auth/hooks/useUsers", () => ({
  useUsers: () => ({ data: [{ id: "admin-1", role: "admin" }], isLoading: false, isError: false }),
}));

vi.mock("@/features/jobs/hooks/useOffers", () => ({
  useOffers: () => ({
    data: [{
      id: "off-42",
      employerId: "employer-1",
      title: "Comptable",
      description: "Rejoignez notre équipe.",
      tasks: [],
      category: "finance",
      skills: [],
      location: { region: "Centre", city: "Yaoundé" },
      contract: "permanent",
      duration: "",
      schedule: "",
      pay: "150 000 FCFA",
      payMode: "fixe",
      createdAt: "2026-01-01T00:00:00.000Z",
      status: "en-attente",
      boost: false,
      views: 0,
      shareTelegram: true,
    }],
    isLoading: false,
    isError: false,
  }),
}));

vi.mock("lib/store", () => ({
  useStore: () => ({
    state: {
      currentUserId: "admin-1",
      users: [{ id: "admin-1", role: "admin" }],
      offers: [],
      signalements: [],
      employers: [],
    },
    update: mocks.update,
    patch: vi.fn(),
  }),
}));

describe("Admin offer review", () => {
  afterEach(() => {
    cleanup();
    mocks.invoke.mockReset();
    mocks.rpc.mockReset();
    mocks.update.mockReset();
  });

  it("persists approval before publishing a requested offer to Telegram", async () => {
    mocks.rpc.mockResolvedValue({ data: true, error: null });
    mocks.invoke.mockResolvedValue({ data: { sent: true }, error: null });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminPanel />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Approuver" }));

    await waitFor(() => {
      expect(mocks.rpc).toHaveBeenCalledWith("review_offer", {
        p_offer_id: offer.id,
        p_approved: true,
      });
      expect(mocks.invoke).toHaveBeenCalledWith("publier-telegram", {
        body: { offer_id: offer.id },
      });
    });
  });
});

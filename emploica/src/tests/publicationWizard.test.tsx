import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { StoreProvider } from "../lib/store";
import PublicationOffre from "../features/employeur/publication/PublicationOffre";

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  insert: vi.fn(),
}));

vi.mock("../lib/supabase", () => ({
  supabase: { from: mocks.from },
}));

function renderWizard() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <MemoryRouter>
          <PublicationOffre employerId="employer-1" employerPhone="+237 600 000 000" />
        </MemoryRouter>
      </StoreProvider>
    </QueryClientProvider>,
  );
}

describe("PublicationOffre", () => {
  beforeEach(() => {
    window.HTMLElement.prototype.scrollIntoView = () => {};
    mocks.from.mockClear();
    mocks.insert.mockClear();
    mocks.insert.mockResolvedValue({ error: null });
    mocks.from.mockReturnValue({ insert: mocks.insert });
  });
  afterEach(cleanup);

  it("guide la publication et enregistre l'offre et ses choix dans Supabase", async () => {
    renderWizard();

    fireEvent.click(screen.getByRole("button", { name: "Vendeur" }));
    fireEvent.click(screen.getByRole("button", { name: "Continuer" }));

    const regionSelect = screen.getAllByRole("combobox")[0];
    fireEvent.click(regionSelect);
    fireEvent.click(await screen.findByRole("option", { name: "Littoral" }));
    fireEvent.click(screen.getAllByRole("combobox")[1]);
    fireEvent.click(await screen.findByRole("option", { name: "Douala" }));
    fireEvent.click(screen.getByRole("button", { name: "Continuer" }));

    fireEvent.click(screen.getByRole("switch", { name: "Partager aussi sur Telegram" }));
    fireEvent.click(screen.getByRole("button", { name: "Envoyer l'offre" }));

    await waitFor(() => expect(mocks.insert).toHaveBeenCalledOnce());
    expect(mocks.from).toHaveBeenCalledWith("offers");
    expect(mocks.insert).toHaveBeenCalledWith(expect.objectContaining({
      employer_id: "employer-1",
      title: "Vendeur(se)",
      category: "commerce",
      location_region: "Littoral",
      location_city: "Douala",
      contact_mode: "profil",
      share_telegram: true,
      status: "en-attente",
    }));
  });

  it("empêche de continuer sans renseigner les champs obligatoires du poste", () => {
    renderWizard();
    fireEvent.click(screen.getByRole("button", { name: "Continuer" }));
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
    expect(mocks.insert).not.toHaveBeenCalled();
  });
});

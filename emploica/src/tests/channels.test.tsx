// PROBLÈME RÉSOLU : couvre l'affichage conditionnel et la sécurité des liens de canaux.
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { StoreProvider } from "@/lib/store";
import PageCanaux from "@/features/canaux/PageCanaux";
import CarteCanal from "@/features/canaux/CarteCanal";
import BanniereCanaux from "@/features/canaux/BanniereCanaux";
import MenuPlus from "@/components/navigation/MenuPlus";
import { DEMO_USERS } from "@/data/mockData";

const mocks = vi.hoisted(() => ({
  whatsappLink: "",
  telegramLink: "",
}));

vi.mock("@/config/canaux", () => ({
  get LIEN_CANAL_WHATSAPP() { return mocks.whatsappLink; },
  get LIEN_CANAL_TELEGRAM() { return mocks.telegramLink; },
}));

vi.mock("@/features/employers/hooks/useEmployerProfiles", () => ({
  useEmployerProfiles: () => ({ data: [], isLoading: false, isError: false }),
}));

describe("Canaux Workca — partie A", () => {
  afterEach(() => {
    cleanup();
    mocks.whatsappLink = "";
    mocks.telegramLink = "";
  });

  it("masque les canaux non configurés et indique qu'ils seront ajoutés", () => {
    render(<PageCanaux />);

    expect(screen.getByText("Les liens de nos canaux seront disponibles prochainement.")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Rejoindre le canal" })).not.toBeInTheDocument();
  });

  it("n'affiche que les liens configurés et utilise un lien externe protégé", () => {
    mocks.whatsappLink = "https://whatsapp.com/channel/example";
    render(<PageCanaux />);

    const joinLink = screen.getByRole("link", { name: "Rejoindre le canal" });
    expect(joinLink).toHaveAttribute("href", mocks.whatsappLink);
    expect(joinLink).toHaveAttribute("target", "_blank");
    expect(joinLink).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByText("Canal WhatsApp")).toBeInTheDocument();
    expect(screen.queryByText("Canal Telegram")).not.toBeInTheDocument();
  });

  it("masque les URL de protocole non web et la bannière si aucun canal n'est configuré", () => {
    const { rerender } = render(<CarteCanal channel="telegram" link="javascript:alert(1)" />);
    expect(screen.queryByText("Canal Telegram")).not.toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <BanniereCanaux />
      </MemoryRouter>,
    );
    expect(screen.queryByText("Recevez les nouvelles offres sur nos canaux.")).not.toBeInTheDocument();
  });

  it("affiche la bannière des offres dès qu'un canal possède un lien", () => {
    mocks.telegramLink = "https://t.me/workca";
    render(
      <MemoryRouter>
        <BanniereCanaux />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Découvrir" })).toHaveAttribute("href", "/canaux");
  });

  it("donne accès aux canaux depuis le menu trois points", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={queryClient}>
        <StoreProvider>
          <MemoryRouter>
            <MenuPlus currentUser={DEMO_USERS[0]} onLogout={vi.fn()} />
          </MemoryRouter>
        </StoreProvider>
      </QueryClientProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Ouvrir le menu" }));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Nos canaux" })).toHaveAttribute("href", "/canaux");
    });
    expect(document.querySelector('[data-slot="dialog-overlay"]')).toHaveClass("bg-black/60");
  });

  it("permet au même compte chercheur d'ouvrir son espace de publication", () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={queryClient}>
        <StoreProvider>
          <MemoryRouter initialEntries={["/chercheur"]}>
            <Routes>
              <Route path="/chercheur" element={<MenuPlus currentUser={DEMO_USERS[0]} onLogout={vi.fn()} />} />
              <Route path="/profil-employeur" element={<p>Profil professionnel du recruteur</p>} />
            </Routes>
          </MemoryRouter>
        </StoreProvider>
      </QueryClientProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Ouvrir le menu" }));
    fireEvent.click(screen.getByRole("button", { name: "Passer à l'espace employeur" }));

    expect(screen.getByText("Profil professionnel du recruteur")).toBeInTheDocument();
  });
});

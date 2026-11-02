import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import BottomNav from "../components/navigation/BottomNav";
import { StoreProvider } from "../lib/store";
import { DEMO_USERS } from "../data/mockData";

vi.mock("../features/employers/hooks/useEmployerProfiles", () => ({
  useEmployerProfiles: () => ({ data: [], isLoading: false, isError: false }),
}));

describe("BottomNav", () => {
  it("affiche la navigation candidat et son accès à la publication", () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={queryClient}>
        <StoreProvider>
          <MemoryRouter>
            <BottomNav currentUser={DEMO_USERS[0]} />
          </MemoryRouter>
        </StoreProvider>
      </QueryClientProvider>,
    );

    expect(screen.getByRole("link", { name: "Candidatures" })).toHaveAttribute("href", "/candidatures");
    expect(screen.getByRole("button", { name: "Publier" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Publier" }));
    expect(screen.getByText("Pour publier, créez votre profil employeur")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Plus tard" }));
    expect(screen.queryByText("Pour publier, créez votre profil employeur")).not.toBeInTheDocument();
  });
});

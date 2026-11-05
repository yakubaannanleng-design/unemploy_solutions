import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import FormulaireProfilEntreprise from "@/features/compte/components/FormulaireProfilEntreprise";
import { StoreProvider } from "@/lib/store";

const mocks = vi.hoisted(() => {
  const query = {
    upsert: vi.fn(),
    select: vi.fn(),
    eq: vi.fn(),
    single: vi.fn(),
  };
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  return {
    query,
    from: vi.fn(() => query),
    toastSuccess: vi.fn(),
    toastError: vi.fn(),
  };
});

vi.mock("@/lib/supabase", () => ({
  supabase: { from: mocks.from },
}));

vi.mock("@/features/employers/hooks/useEmployerProfiles", () => ({
  useEmployerProfiles: () => ({ data: [], isLoading: false, isError: false }),
}));

vi.mock("sonner", () => ({
  toast: { success: mocks.toastSuccess, error: mocks.toastError },
}));

function renderProfileForm() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <MemoryRouter initialEntries={["/profil-employeur?redirect=%2Foffres%2Fnouveau"]}>
          <Routes>
            <Route path="/profil-employeur" element={<FormulaireProfilEntreprise />} />
            <Route path="/offres/nouveau" element={<p>Formulaire de publication atteint</p>} />
          </Routes>
        </MemoryRouter>
      </StoreProvider>
    </QueryClientProvider>,
  );
}

describe("Profil professionnel", () => {
  beforeEach(() => {
    window.HTMLElement.prototype.scrollIntoView = () => {};
    mocks.from.mockClear();
    mocks.query.upsert.mockReset().mockResolvedValue({ error: null });
    mocks.query.single.mockReset().mockResolvedValue({ data: { user_id: "u-seeker" }, error: null });
    mocks.toastSuccess.mockReset();
    mocks.toastError.mockReset();
    window.localStorage.clear();
  });

  afterEach(cleanup);

  it("enregistre le profil de recruteur indépendant avant de reprendre la publication", async () => {
    renderProfileForm();
    fireEvent.click(screen.getByRole("combobox", { name: "Qui publie les offres ?" }));
    fireEvent.click(await screen.findByRole("option", { name: "Un particulier" }));
    fireEvent.change(screen.getByLabelText("Nom du recruteur ou de l'activité"), {
      target: { value: "Atelier de démonstration" },
    });
    fireEvent.change(screen.getByLabelText("Secteur"), { target: { value: "Réparation" } });
    fireEvent.change(screen.getByLabelText("Ville"), { target: { value: "Douala" } });
    fireEvent.click(screen.getByRole("button", { name: "Enregistrer" }));

    await waitFor(() => {
      expect(mocks.query.upsert).toHaveBeenCalledWith(expect.objectContaining({
        user_id: "u-seeker",
        org_name: "Atelier de démonstration",
        org_type: "particulier",
        sector: "Réparation",
        city: "Douala",
      }), { onConflict: "user_id" });
    });
    expect(await screen.findByText("Formulaire de publication atteint")).toBeInTheDocument();
    expect(mocks.toastSuccess).toHaveBeenCalledWith("Profil de l'entreprise enregistré avec succès.");
    expect(mocks.toastError).not.toHaveBeenCalled();
  });
});

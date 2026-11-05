import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ChoixTypeCompte from "../features/compte/components/ChoixTypeCompte";
import { StoreProvider, useStore } from "../lib/store";

function EmployerWorkspace() {
  const { currentUser } = useStore();
  return <p>{currentUser.role}</p>;
}

describe("ChoixTypeCompte", () => {
  it("enregistre l'espace choisi sans changer l'identifiant du compte", () => {
    window.localStorage.clear();
    render(
      <StoreProvider>
        <MemoryRouter initialEntries={["/"]}>
          <Routes>
            <Route path="/" element={<ChoixTypeCompte />} />
            <Route path="/employeur" element={<EmployerWorkspace />} />
          </Routes>
        </MemoryRouter>
      </StoreProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Je suis une entreprise/ }));
    fireEvent.click(screen.getByRole("button", { name: "Continuer" }));

    expect(screen.getByText("employeur")).toBeInTheDocument();
  });
});

import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import GrilleCategories from "../features/categories/GrilleCategories";
import RecherchesRecentes from "../features/jobs/components/RecherchesRecentes";
import { HOME_CATEGORIES, matchesHomeCategory } from "../features/categories/categories";

describe("Accueil", () => {
  it("affiche les onze catégories et transmet la catégorie sélectionnée", () => {
    const onSelect = vi.fn();
    render(<GrilleCategories onSelect={onSelect} />);

    expect(HOME_CATEGORIES).toHaveLength(11);
    fireEvent.click(screen.getByRole("button", { name: "Banque et finance" }));
    expect(onSelect).toHaveBeenCalledWith("banque");
  });

  it("construit une recherche récente et propose des suggestions", () => {
    window.localStorage.clear();
    const onSearch = vi.fn();
    render(<RecherchesRecentes onSearch={onSearch} />);

    fireEvent.change(screen.getByRole("textbox", { name: "Rechercher des offres" }), {
      target: { value: "inform" },
    });
    const suggestions = within(screen.getByRole("list", { name: "Suggestions" }));
    expect(suggestions.getByRole("button", { name: "Informatique" })).toBeInTheDocument();
    fireEvent.click(suggestions.getByRole("button", { name: "Informatique" }));

    expect(onSearch).toHaveBeenCalledWith("Informatique");
    expect(JSON.parse(window.localStorage.getItem("workca:recent-searches") ?? "[]")).toEqual(["Informatique"]);
    expect(screen.getByRole("region", { name: "Recherches récentes" })).toBeInTheDocument();
  });

  it("relie chaque catégorie à ses offres correspondantes", () => {
    const banking = HOME_CATEGORIES.find((category) => category.id === "banque");
    const internship = HOME_CATEGORIES.find((category) => category.id === "stages");
    if (!banking || !internship) throw new Error("Les catégories attendues sont absentes.");
    expect(matchesHomeCategory(banking, { category: "finance", contract: "permanent" })).toBe(true);
    expect(matchesHomeCategory(internship, { category: "commerce", contract: "stage" })).toBe(true);
  });
});

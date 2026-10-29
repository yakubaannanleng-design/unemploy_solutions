import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { OfferForm } from "features/jobs";

vi.mock("../lib/store", () => ({
  useStore: () => ({
    state: {
      currentUserId: "u-employer",
    },
  }),
}));

vi.mock("../lib/supabase", () => ({
  supabase: null,
}));

describe("OfferForm", () => {
  it("rend le formulaire de publication d'offre", () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    render(<OfferForm onSubmit={onSubmit} onCancel={onCancel} />);
    expect(screen.getAllByPlaceholderText(/Ex: Mécanicien automobile/)[0]).toBeTruthy();
    expect(screen.getAllByRole("button", { name: /Publier/ })[0]).toBeTruthy();
  });

  it("n'appelle pas onSubmit si le titre est vide", () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    render(<OfferForm onSubmit={onSubmit} onCancel={onCancel} />);
    fireEvent.click(screen.getAllByRole("button", { name: /Publier/ })[0]);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

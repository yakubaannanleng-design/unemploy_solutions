import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient";
import AuthPage from "../pages/AuthPage";

vi.mock("../lib/supabase", () => ({
  supabase: null,
}));

vi.mock("../hooks/useUsers", () => ({
  useUsers: () => ({ data: [], isLoading: false }),
}));

describe("AuthPage", () => {
  it("rend le formulaire de connexion sans erreur", () => {
    const onLogin = vi.fn();
    render(
      <QueryClientProvider client={queryClient}>
        <AuthPage onLogin={onLogin} />
      </QueryClientProvider>
    );
    expect(screen.getByText("Connexion")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Se connecter/ })).toBeTruthy();
  });
});

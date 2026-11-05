import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient";
import AuthPage from "../features/auth";

vi.mock("../lib/supabase", () => ({
  supabase: null,
}));

vi.mock("../features/auth/hooks/useUsers", () => ({
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

  it("n'invente pas de compte local quand l'inscription Supabase est indisponible", async () => {
    const onLogin = vi.fn();
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <AuthPage initialMode="register" onLogin={onLogin} />
      </QueryClientProvider>
    );

    expect(screen.getByRole("heading", { name: "Inscription" })).toBeInTheDocument();
    const registrationForm = container.querySelectorAll("form")[1];
    fireEvent.change(registrationForm.querySelector<HTMLInputElement>('input[name="username"]')!, {
      target: { value: "Entreprise test" },
    });
    fireEvent.change(registrationForm.querySelector<HTMLInputElement>('input[name="email"]')!, {
      target: { value: "entreprise@example.com" },
    });
    fireEvent.change(registrationForm.querySelector<HTMLInputElement>('input[name="password"]')!, {
      target: { value: "mot-de-passe-test" },
    });
    fireEvent.change(registrationForm.querySelector<HTMLSelectElement>('select[name="role"]')!, {
      target: { value: "employeur" },
    });
    fireEvent.submit(registrationForm);

    expect(await screen.findByRole("alert")).toHaveTextContent("service d'inscription est indisponible");
    expect(onLogin).not.toHaveBeenCalled();
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AuthPage from "@/features/auth/components/AuthPage";
import ResetPasswordPage from "@/features/auth/components/ResetPasswordPage";

const mocks = vi.hoisted(() => {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle: vi.fn(),
    insert: vi.fn(),
  };
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  query.insert.mockReturnValue(query);

  return {
    query,
    from: vi.fn(() => query),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    verifyOtp: vi.fn(),
    resend: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    updateUser: vi.fn(),
    signOut: vi.fn(),
  };
});

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: mocks.from,
    auth: {
      signInWithPassword: mocks.signInWithPassword,
      signUp: mocks.signUp,
      verifyOtp: mocks.verifyOtp,
      resend: mocks.resend,
      resetPasswordForEmail: mocks.resetPasswordForEmail,
      updateUser: mocks.updateUser,
      signOut: mocks.signOut,
    },
  },
}));

const profile = {
  id: "auth-user-1",
  role: "employeur" as const,
  name: "Entreprise test",
  phone: "",
  email: "entreprise@example.com",
  status: "actif" as const,
  verification: "declare",
  created_at: "2026-11-04T00:00:00.000Z",
};

const authUser = {
  id: "auth-user-1",
  email: "entreprise@example.com",
  created_at: "2026-11-04T00:00:00.000Z",
  user_metadata: { name: "Entreprise test", role: "employeur" },
};

function openRegistration(container: HTMLElement) {
  const form = container.querySelectorAll("form")[1];
  fireEvent.change(form.querySelector<HTMLInputElement>('input[name="username"]')!, {
    target: { value: "Entreprise test" },
  });
  fireEvent.change(form.querySelector<HTMLInputElement>('input[name="email"]')!, {
    target: { value: "Entreprise@example.com" },
  });
  fireEvent.change(form.querySelector<HTMLInputElement>('input[name="password"]')!, {
    target: { value: "strong-test-password" },
  });
  fireEvent.change(form.querySelector<HTMLSelectElement>('select[name="role"]')!, {
    target: { value: "employeur" },
  });
  return form;
}

describe("Authentification Supabase", () => {
  beforeEach(() => {
    window.HTMLElement.prototype.scrollIntoView = () => {};
    mocks.signInWithPassword.mockReset();
    mocks.signUp.mockReset();
    mocks.verifyOtp.mockReset();
    mocks.resend.mockReset();
    mocks.resetPasswordForEmail.mockReset();
    mocks.updateUser.mockReset();
    mocks.signOut.mockReset().mockResolvedValue({ error: null });
    mocks.from.mockClear();
    mocks.query.maybeSingle.mockReset();
    mocks.query.insert.mockClear();
  });

  afterEach(cleanup);

  it("reconnecte le compte par email et recharge son profil distant", async () => {
    mocks.signInWithPassword.mockResolvedValue({ data: { user: authUser }, error: null });
    mocks.query.maybeSingle.mockResolvedValue({ data: profile, error: null });
    const onLogin = vi.fn();
    const { container } = render(<AuthPage onLogin={onLogin} />);

    const form = container.querySelectorAll("form")[0];
    fireEvent.change(form.querySelector<HTMLInputElement>('input[name="email"]')!, {
      target: { value: "entreprise@example.com" },
    });
    fireEvent.change(form.querySelector<HTMLInputElement>('input[name="password"]')!, {
      target: { value: "strong-test-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Se connecter" }));

    await waitFor(() => expect(onLogin).toHaveBeenCalledWith(expect.objectContaining({
      id: "auth-user-1",
      role: "employeur",
      email: "entreprise@example.com",
    })));
    expect(mocks.signInWithPassword).toHaveBeenCalledWith({
      email: "entreprise@example.com",
      password: "strong-test-password",
    });
    expect(mocks.from).toHaveBeenCalledWith("users");
  });

  it("propose la vérification par code si le compte existant n'est pas confirmé", async () => {
    mocks.signInWithPassword.mockRejectedValue(Object.assign(new Error("Email not confirmed"), {
      code: "email_not_confirmed",
    }));
    const { container } = render(<AuthPage onLogin={vi.fn()} />);
    const form = container.querySelectorAll("form")[0];
    fireEvent.change(form.querySelector<HTMLInputElement>('input[name="email"]')!, {
      target: { value: "entreprise@example.com" },
    });
    fireEvent.change(form.querySelector<HTMLInputElement>('input[name="password"]')!, {
      target: { value: "strong-test-password" },
    });
    fireEvent.submit(form);

    expect(await screen.findByRole("textbox", { name: "Code de vérification à 6 chiffres" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Renvoyer le code" })).toBeInTheDocument();
  });

  it("demande le code de confirmation sans créer de session avant sa validation", async () => {
    mocks.signUp.mockResolvedValue({ data: { user: authUser, session: null }, error: null });
    const onLogin = vi.fn();
    const { container } = render(<AuthPage initialMode="register" onLogin={onLogin} />);

    const form = openRegistration(container);
    fireEvent.submit(form);

    await waitFor(() => expect(mocks.signUp).toHaveBeenCalledWith(expect.objectContaining({
      email: "entreprise@example.com",
      options: expect.objectContaining({
        data: { name: "Entreprise test", role: "employeur" },
      }),
    })));
    expect(await screen.findByRole("status")).toHaveTextContent("Saisissez le code de vérification");
    expect(screen.getByRole("textbox", { name: "Code de vérification à 6 chiffres" })).toBeInTheDocument();
    expect(onLogin).not.toHaveBeenCalled();
    expect(mocks.query.insert).not.toHaveBeenCalled();
  });

  it("vérifie le code puis ouvre la session Workca", async () => {
    mocks.signUp.mockResolvedValue({ data: { user: authUser, session: null }, error: null });
    mocks.verifyOtp.mockResolvedValue({ data: { user: authUser, session: { user: authUser } }, error: null });
    mocks.query.maybeSingle.mockResolvedValue({ data: profile, error: null });
    const onLogin = vi.fn();
    const { container } = render(<AuthPage initialMode="register" onLogin={onLogin} />);

    fireEvent.submit(openRegistration(container));
    await screen.findByRole("textbox", { name: "Code de vérification à 6 chiffres" });
    fireEvent.change(screen.getByRole("textbox", { name: "Code de vérification à 6 chiffres" }), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Vérifier et continuer" }));

    await waitFor(() => expect(onLogin).toHaveBeenCalledWith(expect.objectContaining({
      id: "auth-user-1",
      role: "employeur",
    })));
    expect(mocks.verifyOtp).toHaveBeenCalledWith({
      email: "entreprise@example.com",
      token: "123456",
      type: "signup",
    });
  });

  it("renvoie un code sur demande", async () => {
    mocks.signUp.mockResolvedValue({ data: { user: authUser, session: null }, error: null });
    mocks.resend.mockResolvedValue({ data: {}, error: null });
    const { container } = render(<AuthPage initialMode="register" />);

    fireEvent.submit(openRegistration(container));
    fireEvent.click(await screen.findByRole("button", { name: "Renvoyer le code" }));

    await waitFor(() => expect(mocks.resend).toHaveBeenCalledWith({
      type: "signup",
      email: "entreprise@example.com",
    }));
    expect(await screen.findByRole("status")).toHaveTextContent("Un nouveau code a été envoyé");
  });

  it("envoie le lien de mot de passe oublié vers la page de réinitialisation", async () => {
    mocks.resetPasswordForEmail.mockResolvedValue({ data: {}, error: null });
    const { container } = render(<AuthPage />);
    fireEvent.click(screen.getByRole("button", { name: "Mot de passe oublié ?" }));
    fireEvent.change(container.querySelector<HTMLInputElement>('input[name="recoveryEmail"]')!, {
      target: { value: "entreprise@example.com" },
    });
    fireEvent.submit(container.querySelector("form")!);

    await waitFor(() => expect(mocks.resetPasswordForEmail).toHaveBeenCalledWith(
      "entreprise@example.com",
      { redirectTo: expect.stringContaining("/reset-password") },
    ));
    expect(await screen.findByRole("status")).toHaveTextContent("un lien de réinitialisation a été envoyé");
  });

  it("valide et enregistre le nouveau mot de passe depuis le lien email", async () => {
    mocks.updateUser.mockResolvedValue({ data: { user: authUser }, error: null });
    const { container } = render(
      <MemoryRouter>
        <ResetPasswordPage />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByLabelText("Nouveau mot de passe"), {
      target: { value: "new-strong-password" },
    });
    fireEvent.change(screen.getByLabelText("Confirmer le mot de passe"), {
      target: { value: "new-strong-password" },
    });
    fireEvent.submit(container.querySelector("form")!);

    await waitFor(() => expect(mocks.updateUser).toHaveBeenCalledWith({ password: "new-strong-password" }));
    expect(await screen.findByText("Réinitialiser le mot de passe")).toBeInTheDocument();
  });

  it("crée le profil Workca pour un nouveau compte déjà confirmé", async () => {
    mocks.signUp.mockResolvedValue({
      data: { user: authUser, session: { user: authUser } },
      error: null,
    });
    mocks.query.maybeSingle
      .mockResolvedValueOnce({ data: null, error: null })
      .mockResolvedValueOnce({ data: profile, error: null });
    const onLogin = vi.fn();
    const { container } = render(<AuthPage initialMode="register" onLogin={onLogin} />);

    fireEvent.submit(openRegistration(container));

    await waitFor(() => expect(onLogin).toHaveBeenCalledWith(expect.objectContaining({
      id: "auth-user-1",
      role: "employeur",
    })));
    expect(mocks.query.insert).toHaveBeenCalledWith(expect.objectContaining({
      id: "auth-user-1",
      role: "employeur",
      email: "entreprise@example.com",
    }));
  });
});

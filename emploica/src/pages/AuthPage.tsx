// Page d'authentification de Workca (animée) — intégrée avec Supabase Auth.
import { useState } from "react";
import { useUsers } from "../hooks/useUsers";
import type { User } from "../types";
import AuthAnimated from "../components/auth/AuthAnimated";
import { useLang } from "../lib/i18n";
import { supabase } from "../lib/supabase";

interface AuthPageProps {
  onLogin?: (u: User) => void;
}

export default function AuthPage({ onLogin }: AuthPageProps = {}) {
  const { lang } = useLang();
  const { data: users = [] } = useUsers();
  const [error, setError] = useState("");

  const handleLogin = async (values: { username: string; password: string }) => {
    // Resoudre l'email a utiliser pour Supabase Auth
    let emailToTry = values.username;
    if (!values.username.includes("@")) {
      const candidate = users.find(
        (x) =>
          x.name === values.username ||
          x.phone === values.username ||
          x.email === values.username
      );
      if (candidate?.email) emailToTry = candidate.email;
    }

    // 1) Tentative Supabase Auth (email)
    let supabaseError: string | null = null;
    if (supabase && emailToTry.includes("@")) {
      try {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: emailToTry,
          password: values.password,
        });
        if (!authError && data.user) {
          let u = users.find((x) => x.email === emailToTry || x.id === data.user.id);
          if (!u) {
            u = {
              id: data.user.id,
              role: values.role ?? "chercheur",
              name: data.user.user_metadata?.name ?? emailToTry.split("@")[0],
              phone: data.user.user_metadata?.phone ?? "",
              email: emailToTry,
              passwordHash: "",
              status: "actif",
              verification: "déclaré",
              createdAt: new Date().toISOString(),
            };

          setError("");
          onLogin?.(u);
          return;
        }
        }
        if (authError) supabaseError = authError.message;
      } catch (e: Error) {
        supabaseError = e.message ?? null;
      }
    }

    // 2) Fallback : comptes démo / locaux
    const u = users.find(
      (x) =>
        (x.phone === values.username ||
          x.email === values.username ||
          x.name === values.username ||
          x.email === emailToTry)
    );
    if (u) {
      // Si un hash est stocké, il doit correspondre ; sinon (compte Supabase non confirmé) on laisse passer
      if (u.passwordHash === "" || u.passwordHash === values.password) {
        setError("");
        onLogin?.(u);
        return;
      }
    }

    const msg =
      supabaseError && /confirm/i.test(supabaseError)
        ? "Confirme ton email avant de te connecter (vérifie ta boîte mail), ou crée un compte."
        : "Email ou mot de passe incorrect. Réessaie, ou crée un compte.";
    setError(lang === "fr" ? msg : "Incorrect email or password. Try again, or create an account.");
  };

  const handleRegister = async (values: { username: string; email: string; password: string; role?: "chercheur" | "employeur" }) => {
    const username = values.username.trim();
    const password = values.password;
    if (!username || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    // 1) Supabase Auth
    if (supabase) {
      const email = values.email || `${username.replace(/\s+/g, "").toLowerCase()}@workca.local`;
      try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name: username } },
      });
      if (!authError && data.user) {
        const newUser: User = {
          id: data.user.id,
          role: values.role ?? "chercheur",
          name: username,
          phone: username.startsWith("+") ? username : "+237 " + username,
          email,
          passwordHash: "",
          status: "actif",
          verification: "déclaré",
          createdAt: new Date().toISOString(),
        };
        setError("");
        onLogin?.(newUser);
        return;
      }
    } catch {
      /* fallback local */
    }
    }


    // 2) Fallback local
    const newUser: User = {
      id: "u-" + Math.random().toString(36).slice(2, 9),
      role: values.role ?? "chercheur",
      name: username,
      phone: username.startsWith("+") ? username : "+237 " + username,
      email: values.email || undefined,
      passwordHash: "",
      status: "actif",
      verification: "déclaré",
      createdAt: new Date().toISOString(),
    };
    setError("");
    onLogin?.(newUser);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AuthAnimated onLogin={handleLogin} onRegister={handleRegister} error={error} />
    </div>
  );
}

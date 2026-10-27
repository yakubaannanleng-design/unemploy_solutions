// Page d'authentification de Workca (animée) — intégrée avec Supabase Auth.
import { useState } from "react";
import { useStore } from "../lib/store";
import type { User } from "../types";
import AuthAnimated from "../components/auth/AuthAnimated";
import { supabase } from "../lib/supabase";

interface AuthPageProps {
  onLogin?: (u: User) => void;
}

export default function AuthPage({ onLogin }: AuthPageProps = {}) {
  const { state, patch } = useStore();
  const [error, setError] = useState("");

  const handleLogin = async (values: { username: string; password: string }) => {
    // 1) Tentative Supabase Auth (email)
    if (supabase && values.username.includes("@")) {
      try {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: values.username,
          password: values.password,
        });
        if (!authError && data.user) {
          // Trouver ou créer le profil local
          let u = state.users.find((x) => x.email === values.username || x.id === data.user.id);
          if (!u) {
            u = {
              id: data.user.id,
              role: "chercheur",
              name: data.user.user_metadata?.name ?? values.username.split("@")[0],
              phone: data.user.user_metadata?.phone ?? "",
              email: values.username,
              passwordHash: "",
              status: "actif",
              verification: "déclaré",
              createdAt: new Date().toISOString(),
            };
            patch("users", u);
          }
          setError("");
          onLogin?.(u);
          return;
        }
      } catch {
        /* fallback local */
      }
    }

    // 2) Fallback : comptes démo / locaux
    const u = state.users.find(
      (x) =>
        (x.phone === values.username ||
          x.email === values.username ||
          x.name === values.username) &&
        x.passwordHash === values.password
    );
    if (u) {
      setError("");
      onLogin?.(u);
    } else {
      setError("Identifiants invalides. Utilisez les comptes démo (mot de passe demo123).");
    }
  };

  const handleRegister = async (values: { username: string; email: string; password: string }) => {
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
          role: "chercheur",
          name: username,
          phone: username.startsWith("+") ? username : "+237 " + username,
          email,
          passwordHash: "",
          status: "actif",
          verification: "déclaré",
          createdAt: new Date().toISOString(),
        };
        patch("users", newUser);
        patch("seekers", {
          userId: newUser.id,
          bio: "",
          skills: [],
          categories: [],
          contractWanted: [],
          availability: "immédiatement",
          zone: { region: "Centre", city: "Yaoundé", quartier: "" },
          radiusKm: 10,
          experience: "",
          languages: ["français"],
          missionsDone: 0,
        } as any);
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
      role: "chercheur",
      name: username,
      phone: username.startsWith("+") ? username : "+237 " + username,
      email: values.email || undefined,
      passwordHash: password,
      status: "actif",
      verification: "déclaré",
      createdAt: new Date().toISOString(),
    };
    patch("users", newUser);
    patch("seekers", {
      userId: newUser.id,
      bio: "",
      skills: [],
      categories: [],
      contractWanted: [],
      availability: "immédiatement",
      zone: { region: "Centre", city: "Yaoundé", quartier: "" },
      radiusKm: 10,
      experience: "",
      languages: ["français"],
      missionsDone: 0,
    } as any);
    setError("");
    onLogin?.(newUser);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AuthAnimated onLogin={handleLogin} onRegister={handleRegister} error={error} />
    </div>
  );
}
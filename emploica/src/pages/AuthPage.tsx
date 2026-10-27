// Page d'authentification de Workca (animée).
// Branche la logique réelle de connexion/inscription sur AuthAnimated.
import { useState } from "react";
import { useStore } from "../lib/store";
import type { User } from "../types";
import AuthAnimated from "../components/auth/AuthAnimated";

interface AuthPageProps {
  onLogin?: (u: User) => void;
}

export default function AuthPage({ onLogin }: AuthPageProps = {}) {
  const { state, patch } = useStore();
  const [error, setError] = useState("");

  const handleLogin = async (values: { username: string; password: string }) => {
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
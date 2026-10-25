// Page d'authentification de Workca.
// Affiche le formulaire de connexion/inscription animé (AuthAnimated) et gère la tentative de connexion.
import { useState } from "react";
import { useStore } from "../lib/store";
import type { User } from "../types";
import AuthAnimated from "../components/auth/AuthAnimated";

interface AuthPageProps {
  onLogin: (u: User) => void;
}

export default function AuthPage({ onLogin }: AuthPageProps) {
  const { state } = useStore();
  const [phone, setPhone] = useState("");
  const [pw, setPw] = useState("");

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const u = state.users.find((x) => x.phone === phone && x.passwordHash === pw);
    if (u) onLogin(u);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AuthAnimated onSubmit={onSubmit} />
    </div>
  );
}
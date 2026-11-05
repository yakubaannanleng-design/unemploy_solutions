/**
 * PROBLÈME RÉSOLU : propose le choix initial entre l'espace candidat et employeur.
 * RESPONSABILITÉ  : conserve le choix d'espace et ouvre l'accueil correspondant.
 * NE FAIT PAS     : ne modifie pas l'inscription ni ne crée de profil métier.
 * DÉPEND DE       : features/compte/hooks/useTypeCompte, lib/i18n.
 * UTILISÉ PAR     : app (première connexion).
 */
import { useState } from "react";
import { BriefcaseBusiness, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";
import useTypeCompte from "../hooks/useTypeCompte";
import type { Workspace } from "@/lib/store";

export default function ChoixTypeCompte() {
  const { lang } = useLang();
  const navigate = useNavigate();
  const { selectSpace } = useTypeCompte();
  const [selected, setSelected] = useState<Workspace | null>(null);

  const continueToSpace = () => {
    if (!selected) return;
    selectSpace(selected);
    navigate(`/${selected}`, { replace: true });
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center gap-6 px-4 py-10">
      <header className="space-y-2 text-center">
        <p className="text-2xl font-bold tracking-tight">
          work<span className="text-primary">ca</span>
        </p>
        <h1 className="text-xl font-semibold">{lang === "fr" ? "Vous êtes ?" : "Which space do you need?"}</h1>
      </header>

      <div className="space-y-3">
        <button
          type="button"
          aria-pressed={selected === "chercheur"}
          onClick={() => setSelected("chercheur")}
          className={`flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition-colors ${
            selected === "chercheur" ? "border-primary bg-primary/5" : "hover:border-primary/50"
          }`}
        >
          <UserRound className="h-6 w-6 text-primary" aria-hidden="true" />
          <span>
            <span className="block font-semibold">{lang === "fr" ? "Je cherche un emploi" : "I'm looking for a job"}</span>
            <span className="mt-1 block text-sm text-muted-foreground">
              {lang === "fr" ? "Postuler, enregistrer, recevoir des alertes" : "Apply, save jobs, receive alerts"}
            </span>
          </span>
        </button>
        <button
          type="button"
          aria-pressed={selected === "employeur"}
          onClick={() => setSelected("employeur")}
          className={`flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition-colors ${
            selected === "employeur" ? "border-primary bg-primary/5" : "hover:border-primary/50"
          }`}
        >
          <BriefcaseBusiness className="h-6 w-6 text-primary" aria-hidden="true" />
          <span>
            <span className="block font-semibold">{lang === "fr" ? "Je suis une entreprise" : "I'm an employer"}</span>
            <span className="mt-1 block text-sm text-muted-foreground">
              {lang === "fr" ? "Publier des offres et gérer les candidats" : "Post jobs and manage candidates"}
            </span>
          </span>
        </button>
      </div>

      <Button className="w-full" disabled={!selected} onClick={continueToSpace}>
        {lang === "fr" ? "Continuer" : "Continue"}
      </Button>
    </main>
  );
}

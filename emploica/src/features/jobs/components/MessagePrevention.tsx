/**
 * PROBLÈME RÉSOLU : rappelle aux candidats les précautions contre les arnaques.
 * RESPONSABILITÉ  : affiche un avertissement permanent sur la page d'une offre.
 * NE FAIT PAS     : ne collecte aucune donnée ni n'effectue de contrôle d'offre.
 * DÉPEND DE       : lib/i18n.
 * UTILISÉ PAR     : features/jobs/DetailOffre.
 */
import { ShieldAlert } from "lucide-react";
import { useLang } from "@/lib/i18n";

export default function MessagePrevention() {
  const { lang } = useLang();

  return (
    <aside className="flex gap-3 rounded-xl bg-muted p-4 text-sm text-muted-foreground">
      <ShieldAlert className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
      <p>
        {lang === "fr"
          ? "Un employeur sérieux ne demande jamais d'argent pour postuler."
          : "A legitimate employer never asks you to pay to apply."}
      </p>
    </aside>
  );
}

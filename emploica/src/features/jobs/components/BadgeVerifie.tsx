/**
 * PROBLÈME RÉSOLU : rend visible le statut de vérification d'un employeur.
 * RESPONSABILITÉ  : affiche le badge uniquement si l'employeur est vérifié.
 * NE FAIT PAS     : ne détermine ni ne modifie le statut de vérification.
 * DÉPEND DE       : components/ui/badge, types/VerificationLevel.
 * UTILISÉ PAR     : features/jobs/DetailOffre.
 */
import { BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/lib/i18n";
import type { VerificationLevel } from "@/types";

export default function BadgeVerifie({ verification }: { verification?: VerificationLevel }) {
  const { lang } = useLang();
  if (verification !== "vérifié") return null;

  return (
    <Badge variant="secondary" className="gap-1">
      <BadgeCheck aria-hidden="true" className="h-3.5 w-3.5" />
      {lang === "fr" ? "Employeur vérifié" : "Verified employer"}
    </Badge>
  );
}

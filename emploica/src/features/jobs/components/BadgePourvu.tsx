/**
 * PROBLÈME RÉSOLU : indique clairement qu'une offre a été pourvue et quand.
 * RESPONSABILITÉ  : affiche le badge gris et sa date de clôture disponible.
 * NE FAIT PAS     : ne modifie pas le statut de l'offre.
 * DÉPEND DE       : lib/i18n.
 * UTILISÉ PAR     : features/jobs/CarteOffre.
 */
import { useLang } from "@/lib/i18n";

export default function BadgePourvu({ filledAt }: { filledAt?: string }) {
  const { lang } = useLang();
  const date = filledAt ? new Date(filledAt) : null;
  const formattedDate = date && Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-US", { dateStyle: "medium" }).format(date)
    : "";

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
      {lang === "fr" ? "Poste pourvu" : "Position filled"}
      {formattedDate && <time dateTime={date?.toISOString()}>{formattedDate}</time>}
    </span>
  );
}

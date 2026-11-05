/**
 * PROBLÈME RÉSOLU : explique la fermeture d'une offre et propose des postes similaires.
 * RESPONSABILITÉ  : informe le candidat et liste les offres actives de même ville et catégorie.
 * NE FAIT PAS     : ne charge pas de données et ne permet pas de candidater à l'offre pourvue.
 * DÉPEND DE       : features/jobs/utils/filledOffers, lib/i18n, react-router-dom.
 * UTILISÉ PAR     : features/jobs/DetailOffre.
 */
import { Link } from "react-router-dom";
import { useLang } from "@/lib/i18n";
import { isCandidateOfferVisible } from "@/features/jobs/utils/filledOffers";
import type { Offer } from "@/types";

interface BandeauOffrePourvueProps {
  offer: Offer;
  offers: Offer[];
  employerNames: ReadonlyMap<string, string>;
}

export default function BandeauOffrePourvue({
  offer,
  offers,
  employerNames,
}: BandeauOffrePourvueProps) {
  const { lang } = useLang();
  const similarOffers = offers
    .filter((candidate) =>
      candidate.id !== offer.id &&
      candidate.category === offer.category &&
      candidate.location.city === offer.location.city &&
      isCandidateOfferVisible(candidate),
    )
    .slice(0, 3);

  return (
    <section className="space-y-4 rounded-xl border border-muted bg-muted/50 p-4">
      <div>
        <h2 className="font-semibold">
          {lang === "fr" ? "Ce poste a déjà été pourvu" : "This position has already been filled"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {lang === "fr"
            ? "Les candidatures sont fermées pour cette offre."
            : "Applications are closed for this job."}
        </p>
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold">
          {lang === "fr" ? "Offres similaires" : "Similar jobs"}
        </h3>
        {similarOffers.length > 0 ? (
          <ul className="space-y-2">
            {similarOffers.map((candidate) => (
              <li key={candidate.id}>
                <Link
                  to={`/offres/${encodeURIComponent(candidate.id)}`}
                  className="block rounded-lg border bg-background p-3 hover:border-primary/50"
                >
                  <span className="block font-medium">{candidate.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {[employerNames.get(candidate.employerId), candidate.location.city].filter(Boolean).join(" · ")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            {lang === "fr" ? "Aucune offre similaire pour le moment." : "No similar jobs right now."}
          </p>
        )}
      </div>
    </section>
  );
}

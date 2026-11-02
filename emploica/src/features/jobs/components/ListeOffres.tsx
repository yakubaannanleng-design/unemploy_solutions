/**
 * PROBLÈME RÉSOLU : liste d'offres avec états de chargement, erreur et absence de résultats.
 * RESPONSABILITÉ  : rend une collection de cartes et ouvre l'offre sélectionnée.
 * NE FAIT PAS     : ne charge pas les données et ne gère pas leurs mutations.
 * DÉPEND DE       : features/jobs/CarteOffre, lib/i18n, types/Offer.
 * UTILISÉ PAR     : features/jobs/OffersView.
 */
import CarteOffre from "./CarteOffre";
import type { Offer } from "@/types";
import { useLang } from "@/lib/i18n";

export interface OfferListItem {
  offer: Offer;
  employerName: string;
}

interface ListeOffresProps {
  items: OfferListItem[];
  savedIds: ReadonlySet<string>;
  loading: boolean;
  error?: string;
  onOpen: (offer: Offer) => void;
  onToggleSaved: (offer: Offer) => void;
}

export default function ListeOffres({
  items,
  savedIds,
  loading,
  error,
  onOpen,
  onToggleSaved,
}: ListeOffresProps) {
  const { lang } = useLang();

  if (loading) {
    return <p role="status" className="py-10 text-center text-muted-foreground">
      {lang === "fr" ? "Chargement des offres…" : "Loading jobs…"}
    </p>;
  }
  if (error) {
    return <p role="alert" className="py-10 text-center text-destructive">{error}</p>;
  }
  if (items.length === 0) {
    return <p className="py-10 text-center text-muted-foreground">
      {lang === "fr" ? "Aucune offre ne correspond à votre recherche." : "No jobs match your search."}
    </p>;
  }

  return (
    <div className="space-y-3">
      {items.map(({ offer, employerName }) => (
        <CarteOffre
          key={offer.id}
          offer={offer}
          employerName={employerName}
          saved={savedIds.has(offer.id)}
          onOpen={() => onOpen(offer)}
          onToggleSaved={() => onToggleSaved(offer)}
        />
      ))}
    </div>
  );
}

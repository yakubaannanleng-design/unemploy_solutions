/**
 * PROBLÈME RÉSOLU : affiche les offres favorites de l'utilisateur connecté et permet de les retirer.
 * RESPONSABILITÉ  : rend les offres enregistrées et délègue leurs mutations au hook Supabase.
 * NE FAIT PAS     : ne conserve pas les favoris dans le store local.
 * DÉPEND DE       : features/favorites/hooks/useFavorites, features/jobs, lib/store, lib/i18n.
 * UTILISÉ PAR     : app (route /favoris).
 */
// Vue des offres favorites de l'utilisateur connecté.
import { useState } from "react";
import { useStore } from "@/lib/store";
import { useLang, t } from "@/lib/i18n";
import { useOffers } from "@/features/jobs/hooks/useOffers";
import { useFavorites } from "../hooks/useFavorites";
import { supabase } from "@/lib/supabase";
import { Heart } from "lucide-react";
import { OfferCard, OfferDetailModal } from "@/features/jobs";
import { isCandidateOfferVisible } from "@/features/jobs/utils/filledOffers";
import type { Offer } from "@/types";

export default function FavoritesView() {
  const { lang } = useLang();
  const { currentUser } = useStore();
  const offersQuery = useOffers();
  const favorites = useFavorites(currentUser.id);
  const [selected, setSelected] = useState<Offer | null>(null);
  const favOffers = (offersQuery.data ?? []).filter(
    (offer) => favorites.savedIds.includes(offer.id) && isCandidateOfferVisible(offer),
  );

  const error = !supabase
    ? lang === "fr"
      ? "Connexion à Supabase indisponible. Vos offres enregistrées ne peuvent pas être chargées."
      : "Supabase is unavailable. Saved jobs cannot be loaded."
    : offersQuery.isError
      ? offersQuery.error instanceof Error
        ? offersQuery.error.message
        : lang === "fr" ? "Impossible de charger les offres." : "Could not load jobs."
      : favorites.error instanceof Error
        ? favorites.error.message
        : favorites.error
          ? lang === "fr" ? "Impossible de charger vos offres enregistrées." : "Could not load your saved jobs."
          : undefined;
  const isLoading = offersQuery.isLoading || favorites.isLoading;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <Heart className="h-5 w-5 text-red-500" /> {t("favorites", lang) ?? "Favoris"}
      </h2>
      {isLoading ? (
        <p role="status" className="py-6 text-sm text-muted-foreground">
          {lang === "fr" ? "Chargement de vos offres enregistrées…" : "Loading saved jobs…"}
        </p>
      ) : error ? (
        <div className="space-y-3">
          <p role="alert" className="text-sm text-destructive">{error}</p>
          {supabase && (
            <button
              type="button"
              onClick={() => {
                void Promise.all([offersQuery.refetch(), favorites.refetch()]);
              }}
              className="min-h-10 rounded-md border px-3 text-sm font-medium hover:bg-accent"
            >
              {lang === "fr" ? "Réessayer" : "Try again"}
            </button>
          )}
        </div>
      ) : favOffers.length === 0 ? (
        <p className="text-muted-foreground text-sm">{t("noResults", lang)}</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {favOffers.map((o) => (
            <OfferCard
              key={o.id}
              offer={o}
              onClick={() => setSelected(o)}
              isFavorite={true}
              onToggleFavorite={() => favorites.toggle(o.id)}
            />
          ))}
        </div>
      )}
      <OfferDetailModal
        offer={selected}
        open={!!selected}
        onOpenChange={(v) => !v && setSelected(null)}
      />
    </div>
  );
}
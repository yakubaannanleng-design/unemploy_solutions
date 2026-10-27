// Vue des offres favorites de l'utilisateur connecté.
import { useState } from "react";
import { useStore } from "../../lib/store";
import { useLang, t } from "../../lib/i18n";
import { Heart } from "lucide-react";
import OfferCard from "../offers/OfferCard";
import OfferDetailModal from "../offers/OfferDetailModal";
import type { Offer } from "../../types";

export default function FavoritesView() {
  const { lang } = useLang();
  const { state, update } = useStore();
  const [selected, setSelected] = useState<Offer | null>(null);
  const favOffers = state.offers.filter((o) => state.favorites.includes(o.id));

  const toggleFav = (id: string) => {
    const next = state.favorites.includes(id)
      ? state.favorites.filter((x) => x !== id)
      : [...state.favorites, id];
    update("favorites", next);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <Heart className="h-5 w-5 text-red-500" /> {t("favorites", lang) ?? "Favoris"}
      </h2>
      {favOffers.length === 0 ? (
        <p className="text-muted-foreground text-sm">{t("noResults", lang)}</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {favOffers.map((o) => (
            <OfferCard
              key={o.id}
              offer={o}
              onClick={() => setSelected(o)}
              isFavorite={true}
              onToggleFavorite={() => toggleFav(o.id)}
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
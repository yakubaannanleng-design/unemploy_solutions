/**
 * PROBLÈME RÉSOLU : affiche une carte résumée d'une offre d'emploi.
 * RESPONSABILITÉ  : rendu de la carte offre (titre, catégorie, lieu, rémunération, actions postuler/favori).
 * NE FAIT PAS     : ne parle pas à Supabase ; ne gère pas le détail complet (délégué à OfferDetailModal).
 * DÉPEND DE       : lib/i18n, lib/iconMap, data/categories, components/ui/*.
 * UTILISÉ PAR     : features/jobs (OffersView, FlashOffersView), features/favorites, features/search.
 */
import { MapPin, Clock, Banknote, Briefcase, Eye, Heart } from "lucide-react";
import { useLang, t } from "lib/i18n";
import { categoryById } from "@/data/categories";
import { getIcon } from "lib/iconMap";
import { Badge } from "components/ui/badge";
import { Button } from "components/ui/button";
import type { Offer } from "@/types";

interface OfferCardProps {
  offer: Offer;
  onClick: () => void;
  onApply?: () => void;
  alreadyApplied?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export default function OfferCard({ offer, onClick, onApply, alreadyApplied, isFavorite, onToggleFavorite }: OfferCardProps) {
  const { lang } = useLang();
  const cat = categoryById(offer.category);
  const Icon = getIcon(cat?.icon ?? "briefcase");
  const payLabel = offer.payMode === "négocier" ? t("contact", lang) : offer.pay;
  return (
    <div
      className="rounded-lg border bg-card p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" aria-hidden />
          <div>
            <h3 className="font-semibold leading-tight">{offer.title}</h3>
            <span className="text-xs text-muted-foreground">
              {lang === "fr" ? cat?.name : cat?.nameEn}
            </span>
          </div>
        </div>
        {onToggleFavorite && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
            className="p-1 rounded-full hover:bg-accent"
            aria-label="favorite"
          >
            <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
          </button>
        )}
        {offer.verification && offer.verification === "vérifié" && (
          <Badge variant="secondary" className="text-xs">{t("verifiedEmployer", lang)}</Badge>
        )}
      </div>
      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{offer.description}</p>
      {offer.imageUrl && (
        <img src={offer.imageUrl} alt={offer.title} className="mt-3 rounded-md max-h-48 w-full object-cover" />
      )}
      {offer.documentUrl && (
        <a href={offer.documentUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline">
          📄 {lang === "fr" ? "Voir le document" : "View document"}
        </a>
      )}
      <div className="mt-3 space-y-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {offer.location.city}{offer.location.quartier ? `, ${offer.location.quartier}` : ""}</div>
        <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {offer.schedule}</div>
        <div className="flex items-center gap-1.5"><Banknote className="h-3.5 w-3.5" /> {payLabel}</div>
        <div className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" /> {offer.duration} · {offer.contract}</div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-muted-foreground flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {offer.views} {t("views", lang) ?? "vues"}</span>
        {onApply && (
          <Button size="sm" onClick={(e) => { e.stopPropagation(); onApply(); }} disabled={alreadyApplied}>
            {alreadyApplied ? t("applied", lang) : t("apply", lang)}
          </Button>
        )}
      </div>
    </div>
  );
}
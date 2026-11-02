import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Offer } from "@/types";
import { isOfferExpired } from "@/features/jobs/utils/filledOffers";

interface CarteOffreEmployeurProps {
  offer: Offer;
  applicationCount: number;
  lang: "fr" | "en";
  onMarkFilled: (offer: Offer) => void;
  onCopyFilledMessage: (offer: Offer) => void;
}

function statusLabel(offer: Offer, lang: "fr" | "en"): string {
  if (offer.isFilled) return lang === "fr" ? "Pourvue" : "Filled";
  if (isOfferExpired(offer)) return lang === "fr" ? "Expirée" : "Expired";
  if (offer.status === "en-attente") return lang === "fr" ? "En validation" : "In review";
  if (offer.status === "brouillon") return lang === "fr" ? "Brouillon" : "Draft";
  return lang === "fr" ? "Active" : "Active";
}

function formattedDate(value: string | undefined, lang: "fr" | "en"): string {
  if (!value) return lang === "fr" ? "Sans date limite" : "No deadline";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return lang === "fr" ? "Date invalide" : "Invalid date";
  return new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function CarteOffreEmployeur({
  offer,
  applicationCount,
  lang,
  onMarkFilled,
  onCopyFilledMessage,
}: CarteOffreEmployeurProps) {
  const expired = isOfferExpired(offer);
  const canEdit = offer.isFilled !== true;
  const canMarkFilled = offer.status === "publiée" && !offer.isFilled && !expired;

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-semibold">{offer.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {applicationCount} {lang === "fr" ? "candidature(s)" : "application(s)"} ·{" "}
              {lang === "fr" ? "expire le" : "expires"} {formattedDate(offer.expiresAt, lang)}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-medium">
            {statusLabel(offer, lang)}
          </span>
        </div>
        {offer.shareTelegram && (
          <p className="text-xs text-muted-foreground">
            {lang === "fr"
              ? "Partage Telegram demandé ; le canal n'est pas encore connecté."
              : "Telegram sharing requested; the channel is not connected yet."}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {canMarkFilled && (
            <Button type="button" size="sm" onClick={() => onMarkFilled(offer)}>
              {lang === "fr" ? "Poste pourvu" : "Mark as filled"}
            </Button>
          )}
          {canEdit && (
            <Button asChild type="button" size="sm" variant="outline">
              <Link to={`/offres/${encodeURIComponent(offer.id)}/modifier`}>
                {lang === "fr" ? "Modifier" : "Edit"}
              </Link>
            </Button>
          )}
          {offer.isFilled && (
            <Button type="button" size="sm" variant="outline" onClick={() => onCopyFilledMessage(offer)}>
              {lang === "fr" ? "Copier le message Poste pourvu" : "Copy filled-job message"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

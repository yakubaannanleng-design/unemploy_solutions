import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import { LIEN_CANAL_WHATSAPP } from "@/config/canaux";
import { isValidChannelLink } from "@/features/canaux/utils/channelLink";
import type { Offer } from "@/types";
import { isOfferExpired } from "@/features/jobs/utils/filledOffers";

interface CarteOffreEmployeurProps {
  offer: Offer;
  applicationCount: number;
  lang: "fr" | "en";
  onMarkFilled: (offer: Offer) => void;
  onCopyFilledMessage: (offer: Offer) => void;
  onCopyOfferMessage: (offer: Offer) => void;
  onPublishTelegram: (offer: Offer) => void;
  telegramPending: boolean;
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
  onCopyOfferMessage,
  onPublishTelegram,
  telegramPending,
}: CarteOffreEmployeurProps) {
  const expired = isOfferExpired(offer);
  const canEdit = offer.isFilled !== true;
  const canMarkFilled = offer.status === "publiée" && !offer.isFilled && !expired;
  const canShareWhatsapp = offer.status === "publiée" && isValidChannelLink(LIEN_CANAL_WHATSAPP);

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
            {offer.telegramMessageId
              ? lang === "fr" ? "Publiée sur Telegram." : "Published on Telegram."
              : lang === "fr" ? "Publication Telegram demandée." : "Telegram publishing requested."}
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
          {canShareWhatsapp && (
            <>
              <Button type="button" size="sm" variant="outline" onClick={() => onCopyOfferMessage(offer)}>
                {lang === "fr" ? "Copier le message" : "Copy message"}
              </Button>
              <Button asChild type="button" size="sm" variant="outline">
                <a href={LIEN_CANAL_WHATSAPP} target="_blank" rel="noopener noreferrer">
                  {lang === "fr" ? "Ouvrir le canal" : "Open channel"}
                  <ExternalLink aria-hidden="true" />
                </a>
              </Button>
            </>
          )}
          {offer.status === "publiée" && offer.shareTelegram && !offer.telegramMessageId && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={telegramPending}
              onClick={() => onPublishTelegram(offer)}
            >
              {telegramPending
                ? lang === "fr" ? "Publication…" : "Publishing…"
                : lang === "fr" ? "Publier sur Telegram" : "Publish on Telegram"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

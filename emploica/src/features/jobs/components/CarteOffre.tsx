/**
 * PROBLÈME RÉSOLU : carte compacte d'une offre pour la liste de recherche.
 * RESPONSABILITÉ  : présente l'employeur et les informations essentielles avec ses actions.
 * NE FAIT PAS     : ne charge ni ne modifie les données.
 * DÉPEND DE       : components/ui/dropdown-menu, lib/i18n, types/Offer.
 * UTILISÉ PAR     : features/jobs/ListeOffres.
 */
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLang } from "@/lib/i18n";
import { partagerOffre } from "@/utils/partageWhatsApp";
import BadgePourvu from "./BadgePourvu";
import type { Offer } from "@/types";
import { Bookmark, MoreVertical, Share2 } from "lucide-react";

interface CarteOffreProps {
  offer: Offer;
  employerName: string;
  saved: boolean;
  onOpen: () => void;
  onToggleSaved?: () => void;
}

function formatPostedDate(date: string, lang: string): string {
  const postedAt = new Date(date);
  if (Number.isNaN(postedAt.getTime())) return "";
  const elapsedHours = Math.max(0, Math.floor((Date.now() - postedAt.getTime()) / 3_600_000));
  if (elapsedHours < 1) return lang === "fr" ? "À l’instant" : "Just now";
  if (elapsedHours < 24) {
    return lang === "fr" ? `Il y a ${elapsedHours} h` : `${elapsedHours}h ago`;
  }
  const elapsedDays = Math.floor(elapsedHours / 24);
  return lang === "fr" ? `Il y a ${elapsedDays} j` : `${elapsedDays}d ago`;
}

export default function CarteOffre({
  offer,
  employerName,
  saved,
  onOpen,
  onToggleSaved,
}: CarteOffreProps) {
  const { lang } = useLang();
  const initials = employerName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toLocaleUpperCase())
    .join("") || "W";
  const contractLabel =
    offer.contract === "permanent"
      ? "CDI"
      : offer.contract === "stage"
        ? lang === "fr" ? "Stage" : "Internship"
        : offer.contract;

  return (
    <article className={`flex gap-3 rounded-2xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md ${offer.isFilled ? "opacity-60" : ""}`}>
      <div
        aria-hidden="true"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary"
      >
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <button
          type="button"
          onClick={onOpen}
          className="block max-w-full truncate text-left font-semibold hover:text-primary"
        >
          {offer.title}
        </button>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">
          {employerName && (
            <Link
              to={`/entreprises/${encodeURIComponent(offer.employerId)}`}
              className="hover:text-primary hover:underline"
            >
              {employerName}
            </Link>
          )}
          {employerName && offer.location.city && " · "}
          {offer.location.city}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          {offer.isFilled ? (
            <BadgePourvu filledAt={offer.filledAt} />
          ) : (
            <>
              <span className="rounded-full bg-secondary px-2.5 py-1 text-secondary-foreground">{contractLabel}</span>
              {offer.pay && (
                <span className="rounded-full bg-muted px-2.5 py-1 text-foreground">{offer.pay}</span>
              )}
              <span className="text-muted-foreground">{formatPostedDate(offer.createdAt, lang)}</span>
            </>
          )}
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
            aria-label={lang === "fr" ? `Actions pour ${offer.title}` : `Actions for ${offer.title}`}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => partagerOffre(offer, employerName)}>
            <Share2 className="h-4 w-4" />
            {lang === "fr" ? "Partager sur WhatsApp" : "Share on WhatsApp"}
          </DropdownMenuItem>
          {onToggleSaved && (
            <DropdownMenuItem onSelect={onToggleSaved}>
              <Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
              {saved
                ? lang === "fr" ? "Retirer des favoris" : "Remove saved job"
                : lang === "fr" ? "Enregistrer" : "Save job"}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </article>
  );
}

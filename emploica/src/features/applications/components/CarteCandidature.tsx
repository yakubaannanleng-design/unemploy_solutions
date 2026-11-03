// PROBLÈME RÉSOLU : affiche une candidature Supabase avec son offre, son entreprise et son statut.
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import type { Application, Offer } from "@/types";
import { useLang } from "@/lib/i18n";

interface CarteCandidatureProps {
  application: Application;
  offer?: Offer;
  employerName?: string;
}

function applicationStatusPresentation(status: Application["status"], lang: string) {
  switch (status) {
    case "envoyée":
      return {
        label: lang === "fr" ? "Envoyée" : "Submitted",
        className: "bg-secondary text-secondary-foreground",
      };
    case "consultée":
      return {
        label: lang === "fr" ? "En revue" : "In review",
        className: "bg-primary/10 text-primary",
      };
    case "retenue":
      return {
        label: lang === "fr" ? "Retenue" : "Shortlisted",
        className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
      };
    case "refusée":
      return {
        label: lang === "fr" ? "Non retenue" : "Not selected",
        className: "bg-destructive/10 text-destructive",
      };
    case "retirée":
      return {
        label: lang === "fr" ? "Retirée" : "Withdrawn",
        className: "bg-muted text-muted-foreground",
      };
  }
}

export default function CarteCandidature({
  application,
  offer,
  employerName,
}: CarteCandidatureProps) {
  const { lang } = useLang();
  const status = applicationStatusPresentation(application.status, lang);
  const date = new Date(application.createdAt);
  const formattedDate = Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary"
          >
            {(employerName || "W")
              .trim()
              .split(/\s+/)
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part[0].toLocaleUpperCase())
              .join("") || "W"}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">
              {offer?.title ?? (lang === "fr" ? "Offre indisponible" : "Job unavailable")}
            </p>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {[employerName, offer?.location.city].filter(Boolean).join(" · ")}
            </p>
            {formattedDate && (
              <p className="mt-1 text-xs text-muted-foreground">
                {lang === "fr" ? "Candidature envoyée le" : "Applied on"} {formattedDate}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}>
            {status.label}
          </span>
          {offer && (
            <Link
              to={`/offres/${encodeURIComponent(offer.id)}`}
              className="inline-flex min-h-10 items-center rounded-md border px-3 text-sm font-medium hover:bg-accent"
            >
              {lang === "fr" ? "Voir l'offre" : "View job"}
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

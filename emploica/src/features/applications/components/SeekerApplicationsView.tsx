// Page de suivi des candidatures pour le chercheur d'emploi.
// Affiche la liste des candidatures envoyées avec leur statut et la date.
import { useLang, t } from "lib/i18n";
import { useUserApplications } from "../hooks/useApplications";
import { useOffers } from "features/jobs";
import { useUsers } from "features/auth";
import { Card, CardContent } from "components/ui/card";
import { Badge } from "components/ui/badge";
import { Button } from "components/ui/button";
import type { User as UserType } from "@/types";

interface SeekerApplicationsViewProps {
  currentUser: UserType | null;
}

const STATUS_LABELS: Record<string, { label: string; variant: string }> = {
  envoyée: { label: "envoyée", variant: "outline" },
  consultée: { label: "consultée", variant: "secondary" },
  retenue: { label: "retenue", variant: "success" },
  refusée: { label: "refusée", variant: "destructive" },
  retirée: { label: "retirée", variant: "secondary" },
};

export default function SeekerApplicationsView({ currentUser }: SeekerApplicationsViewProps) {
  const { lang } = useLang();
  const mine = currentUser?.id;
  const { data: applications = [], isLoading } = useUserApplications(mine);
  const { data: offers = [] } = useOffers();
  const { data: users = [] } = useUsers();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{t("profile", lang)}</h2>
        <p className="text-muted-foreground">{lang === "fr" ? "Chargement…" : "Loading…"}</p>
      </div>
    );
  }

  const enriched = applications.map((a) => {
    const offer = offers.find((o) => o.id === a.offerId);
    const employer = offer ? users.find((u) => u.id === offer.employerId) : null;
    return { application: a, offer, employer };
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{lang === "fr" ? "Mes candidatures" : "My applications"}</h2>
        <p className="text-muted-foreground">
          {enriched.length} {lang === "fr" ? "candidature(s)" : "application(s)"}
        </p>
      </div>

      {enriched.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <p>{lang === "fr" ? "Vous n'avez pas encore postulé à des offres." : "You haven't applied to any offers yet."}</p>
          <p className="text-xs mt-2">{lang === "fr" ? "Consultez les offres disponibles pour postuler." : "Browse available offers to apply."}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {enriched.map(({ application, offer, employer }) => (
            <Card key={application.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4">
                      <div className="flex-1">
                        <div className="font-semibold">{offer?.title || t("unknownOffer", lang)}</div>
                        <div className="text-xs text-muted-foreground">
                          {offer?.location.city || ""} · {offer?.contract || ""}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {employer?.orgName || employer?.name || t("unknownUser", lang)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={STATUS_LABELS[application.status]?.variant ?? "secondary"}>
                          {STATUS_LABELS[application.status]?.label ?? application.status}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {new Date(application.createdAt).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", {
                            day: "numeric",
                            month: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (offer) {
                        // Navigation sera gérée par le parent via onViewOffer si besoin
                      }
                    }}
                  >
                    {lang === "fr" ? "Voir l'offre" : "View offer"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

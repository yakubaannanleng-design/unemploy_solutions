import { BriefcaseBusiness, Eye, FileText, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";
import type { User } from "@/types";
import CarteChiffre from "./components/CarteChiffre";
import ListeCandidatsRecents from "./components/ListeCandidatsRecents";
import { useEmployerDashboard } from "./hooks/useEmployerDashboard";

interface DashboardEmployeurProps {
  currentUser: User;
}

export default function DashboardEmployeur({ currentUser }: DashboardEmployeurProps) {
  const { lang } = useLang();
  const dashboard = useEmployerDashboard(currentUser.id);

  if (dashboard.isLoading) {
    return <p role="status" className="py-10 text-center text-muted-foreground">
      {lang === "fr" ? "Chargement du tableau de bord…" : "Loading dashboard…"}
    </p>;
  }

  if (dashboard.error) {
    return (
      <section className="space-y-4 py-8">
        <h1 className="text-2xl font-semibold">
          {lang === "fr" ? "Tableau de bord employeur" : "Employer dashboard"}
        </h1>
        <p role="alert" className="text-sm text-destructive">{dashboard.error.message}</p>
        <Button type="button" variant="outline" onClick={dashboard.retry}>
          {lang === "fr" ? "Réessayer" : "Retry"}
        </Button>
      </section>
    );
  }

  const metrics = dashboard.metrics;
  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            {lang === "fr" ? "Espace employeur" : "Employer space"}
          </p>
          <h1 className="text-2xl font-semibold">
            {dashboard.companyName || currentUser.name}
          </h1>
        </div>
        <Button asChild>
          <Link to="/employeur/offres">
            {lang === "fr" ? "Gérer mes offres" : "Manage my jobs"}
          </Link>
        </Button>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <CarteChiffre
          label={lang === "fr" ? "Offres actives" : "Active jobs"}
          value={metrics.activeOffers}
          icon={BriefcaseBusiness}
        />
        <CarteChiffre
          label={lang === "fr" ? "Candidatures" : "Applications"}
          value={metrics.applications}
          icon={Users}
        />
        <CarteChiffre
          label={lang === "fr" ? "Vues ce mois" : "Views this month"}
          value={metrics.monthlyViews}
          icon={Eye}
          description={lang === "fr" ? "Une vue par personne et par jour." : "One view per person per day."}
        />
        <CarteChiffre
          label={lang === "fr" ? "À examiner" : "To review"}
          value={metrics.toReview}
          icon={FileText}
        />
      </div>

      <ListeCandidatsRecents candidates={dashboard.recentCandidates} lang={lang} />
    </section>
  );
}

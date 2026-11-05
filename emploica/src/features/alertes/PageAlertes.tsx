import { useEffect, useState } from "react";
import { Bell, Plus } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import FormulaireAlerte from "./FormulaireAlerte";
import CarteAlerte from "./CarteAlerte";
import { useJobAlerts } from "./hooks/useJobAlerts";
import type { NewJobAlert } from "./types";

export default function PageAlertes() {
  const { lang } = useLang();
  const { currentUser } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [formOpen, setFormOpen] = useState(searchParams.get("create") === "1");
  const alerts = useJobAlerts(currentUser.id);

  useEffect(() => {
    setFormOpen(searchParams.get("create") === "1");
  }, [searchParams]);

  const closeForm = () => {
    setFormOpen(false);
    if (searchParams.has("create")) setSearchParams({});
  };
  const createAlert = (draft: NewJobAlert) => {
    alerts.create(draft, closeForm);
  };
  const error = !supabase
    ? lang === "fr"
      ? "Connexion à Supabase indisponible. Vos alertes ne peuvent pas être chargées."
      : "Supabase is unavailable. Your alerts cannot be loaded."
    : alerts.error instanceof Error
      ? alerts.error.message
      : alerts.error && typeof alerts.error === "object" && "message" in alerts.error
        ? String(alerts.error.message)
        : alerts.error
          ? lang === "fr" ? "Impossible de charger vos alertes." : "Could not load your alerts."
          : undefined;

  return (
    <main className="mx-auto max-w-2xl space-y-4 px-4 py-6">
      <header className="flex items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-xl font-semibold">
          <Bell className="h-5 w-5" /> {lang === "fr" ? "Mes alertes" : "My alerts"}
        </h1>
        {!formOpen && (
          <Button type="button" onClick={() => setFormOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> {lang === "fr" ? "Créer une alerte" : "Create alert"}
          </Button>
        )}
      </header>

      {formOpen && (
        <FormulaireAlerte
          onSubmit={createAlert}
          onCancel={closeForm}
          isSaving={alerts.isCreating}
        />
      )}
      {alerts.isLoading ? (
        <p role="status" className="py-6 text-sm text-muted-foreground">
          {lang === "fr" ? "Chargement de vos alertes…" : "Loading your alerts…"}
        </p>
      ) : error ? (
        <div className="space-y-3">
          <p role="alert" className="text-sm text-destructive">{error}</p>
          {supabase && (
            <Button type="button" variant="outline" onClick={() => void alerts.refetch()}>
              {lang === "fr" ? "Réessayer" : "Try again"}
            </Button>
          )}
        </div>
      ) : alerts.alerts.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-center">
          <p className="text-sm text-muted-foreground">
            {lang === "fr" ? "Vous n'avez pas encore créé d'alerte emploi." : "You have not created a job alert yet."}
          </p>
          {!formOpen && (
            <Button type="button" variant="outline" className="mt-3" onClick={() => setFormOpen(true)}>
              {lang === "fr" ? "Créer une alerte" : "Create alert"}
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.alerts.map((alert) => (
            <CarteAlerte
              key={alert.id}
              alert={alert}
              onToggle={(active) => alerts.setActive(alert.id, active)}
              onDelete={() => alerts.remove(alert.id)}
            />
          ))}
        </div>
      )}
    </main>
  );
}

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useLang } from "@/lib/i18n";
import { categoryById } from "@/data/categories";
import type { JobAlert } from "./types";

interface CarteAlerteProps {
  alert: JobAlert;
  onToggle: (active: boolean) => void;
  onDelete: () => void;
}

const contractLabels: Record<string, { fr: string; en: string }> = {
  permanent: { fr: "CDI", en: "Permanent" },
  temporaire: { fr: "Temporaire", en: "Temporary" },
  mission: { fr: "Mission", en: "Contract assignment" },
  stage: { fr: "Stage", en: "Internship" },
  "temps-partiel": { fr: "Temps partiel", en: "Part-time" },
  indépendant: { fr: "Indépendant", en: "Freelance" },
};

export default function CarteAlerte({ alert, onToggle, onDelete }: CarteAlerteProps) {
  const { lang } = useLang();
  const category = categoryById(alert.category);
  const title = category
    ? lang === "fr" ? category.name : category.nameEn
    : lang === "fr" ? "Toutes les catégories" : "All categories";
  const city = alert.city || (lang === "fr" ? "Toutes les villes" : "All cities");
  const contract = alert.contract
    ? contractLabels[alert.contract]?.[lang] ?? alert.contract
    : lang === "fr" ? "Tous les contrats" : "All contracts";
  const frequency = alert.frequency === "immediate"
    ? lang === "fr" ? "notification immédiate" : "immediate notification"
    : lang === "fr" ? "1 fois par jour" : "once a day";

  return (
    <article className="flex items-center gap-3 rounded-lg border bg-card p-4">
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold">{title} · {city}</h3>
        <p className="text-sm text-muted-foreground">{contract} · {frequency}</p>
        <p className={`mt-1 text-xs font-medium ${alert.active ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground"}`}>
          {alert.active ? lang === "fr" ? "Active" : "Active" : lang === "fr" ? "Inactive" : "Inactive"}
        </p>
      </div>
      <Switch
        checked={alert.active}
        onCheckedChange={onToggle}
        aria-label={alert.active
          ? lang === "fr" ? `Désactiver l'alerte ${title}` : `Disable ${title} alert`
          : lang === "fr" ? `Activer l'alerte ${title}` : `Enable ${title} alert`}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onDelete}
        aria-label={lang === "fr" ? "Supprimer l'alerte" : "Delete alert"}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </article>
  );
}

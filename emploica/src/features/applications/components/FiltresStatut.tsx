// PROBLÈME RÉSOLU : filtre les candidatures par état sans modifier les données Supabase.
import { useLang } from "@/lib/i18n";
import {
  APPLICATION_STATUS_FILTERS,
  type ApplicationStatusFilter,
} from "../utils/applicationStatus";

interface FiltresStatutProps {
  value: ApplicationStatusFilter;
  counts: Record<ApplicationStatusFilter, number>;
  onChange: (filter: ApplicationStatusFilter) => void;
}

const LABELS: Record<ApplicationStatusFilter, { fr: string; en: string }> = {
  all: { fr: "Toutes", en: "All" },
  review: { fr: "En revue", en: "In review" },
  retained: { fr: "Retenues", en: "Shortlisted" },
  rejected: { fr: "Non retenues", en: "Not selected" },
  withdrawn: { fr: "Retirées", en: "Withdrawn" },
};

export default function FiltresStatut({ value, counts, onChange }: FiltresStatutProps) {
  const { lang } = useLang();

  return (
    <div
      role="group"
      aria-label={lang === "fr" ? "Filtrer par statut" : "Filter by status"}
      className="flex gap-2 overflow-x-auto pb-1"
    >
      {APPLICATION_STATUS_FILTERS.map((filter) => (
        <button
          key={filter}
          type="button"
          aria-pressed={value === filter}
          onClick={() => onChange(filter)}
          className={`min-h-10 shrink-0 rounded-full border px-3 text-sm transition-colors ${
            value === filter
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background text-muted-foreground hover:text-foreground"
          }`}
        >
          {lang === "fr" ? LABELS[filter].fr : LABELS[filter].en}
          <span className="ml-1.5 opacity-80">{counts[filter]}</span>
        </button>
      ))}
    </div>
  );
}

/**
 * PROBLÈME RÉSOLU : filtres rapides de la liste des offres.
 * RESPONSABILITÉ  : expose les filtres toutes, ville et type de contrat.
 * NE FAIT PAS     : ne filtre pas les données et ne charge pas Supabase.
 * DÉPEND DE       : lib/i18n.
 * UTILISÉ PAR     : features/jobs/OffersView.
 */
import { useLang } from "@/lib/i18n";

export interface OfferQuickFilters {
  city: string;
  contract: string;
}

interface FiltresOffresProps {
  value: OfferQuickFilters;
  onChange: (filters: OfferQuickFilters) => void;
}

export default function FiltresOffres({ value, onChange }: FiltresOffresProps) {
  const { lang } = useLang();
  const filters = [
    { label: lang === "fr" ? "Toutes" : "All", city: "", contract: "" },
    { label: "Douala", city: "Douala", contract: "" },
    { label: "Yaoundé", city: "Yaoundé", contract: "" },
    { label: "CDI", city: "", contract: "permanent" },
    { label: lang === "fr" ? "Stage" : "Internship", city: "", contract: "stage" },
  ];

  return (
    <div
      role="group"
      aria-label={lang === "fr" ? "Filtres rapides des offres" : "Quick job filters"}
      className="flex flex-wrap gap-2 pb-1"
    >
      {filters.map((filter) => {
        const active = value.city === filter.city && value.contract === filter.contract;
        return (
          <button
            key={filter.label}
            type="button"
            aria-pressed={active}
            onClick={() => onChange({ city: filter.city, contract: filter.contract })}
            className={`min-h-10 whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-colors ${
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:border-primary/50"
            }`}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}

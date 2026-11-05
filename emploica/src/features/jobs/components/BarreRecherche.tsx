/**
 * PROBLÈME RÉSOLU : recherche des offres par métier, entreprise ou mot-clé.
 * RESPONSABILITÉ  : affiche le champ de recherche et transmet sa valeur.
 * NE FAIT PAS     : ne charge pas les offres et ne gère pas les filtres.
 * DÉPEND DE       : components/ui/input, lib/i18n.
 * UTILISÉ PAR     : features/jobs/OffersView.
 */
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLang } from "@/lib/i18n";

interface BarreRechercheProps {
  value: string;
  onChange: (value: string) => void;
}

export default function BarreRecherche({ value, onChange }: BarreRechercheProps) {
  const { lang } = useLang();

  return (
    <label className="relative block">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={
          lang === "fr"
            ? "Métier, entreprise, mot-clé"
            : "Job, company, keyword"
        }
        aria-label={lang === "fr" ? "Rechercher une offre" : "Search jobs"}
        className="h-12 rounded-xl pl-10"
      />
    </label>
  );
}

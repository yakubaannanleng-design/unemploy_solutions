/**
 * PROBLÈME RÉSOLU : recherche sur l'accueil avec suggestions et recherches récentes.
 * RESPONSABILITÉ  : conserve cinq recherches locales et transmet les recherches choisies.
 * NE FAIT PAS     : ne stocke aucune donnée métier et ne charge pas les offres.
 * DÉPEND DE       : components/ui/input, features/categories/categories, lib/i18n.
 * UTILISÉ PAR     : features/accueil/PageAccueil.
 */
import { useMemo, useState, type FormEvent } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { HOME_CATEGORIES } from "@/features/categories/categories";
import { useLang } from "@/lib/i18n";

const RECENT_SEARCH_KEY = "workca:recent-searches";
const MAX_RECENT_SEARCHES = 5;

function readRecentSearches(): string[] {
  try {
    const stored = window.localStorage.getItem(RECENT_SEARCH_KEY);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed) || !parsed.every((item) => typeof item === "string")) {
      throw new Error("Format de recherches récentes invalide.");
    }
    return parsed.slice(0, MAX_RECENT_SEARCHES);
  } catch (error) {
    console.error("Impossible de lire les recherches récentes :", error);
    return [];
  }
}

function normalize(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
}

interface RecherchesRecentesProps {
  onSearch: (query: string) => void;
}

export default function RecherchesRecentes({ onSearch }: RecherchesRecentesProps) {
  const { lang } = useLang();
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState(readRecentSearches);
  const suggestions = useMemo(() => {
    const candidates = [
      ...recent,
      ...HOME_CATEGORIES.map((category) => lang === "fr" ? category.name : category.nameEn),
    ];
    const normalizedQuery = normalize(query.trim());
    if (!normalizedQuery) return [];
    return [...new Set(candidates)]
      .filter((candidate) => normalize(candidate).includes(normalizedQuery))
      .slice(0, 5);
  }, [lang, query, recent]);

  const submit = (value: string) => {
    const nextQuery = value.trim();
    if (!nextQuery) return;
    const nextRecent = [
      nextQuery,
      ...recent.filter((item) => normalize(item) !== normalize(nextQuery)),
    ].slice(0, MAX_RECENT_SEARCHES);
    try {
      window.localStorage.setItem(RECENT_SEARCH_KEY, JSON.stringify(nextRecent));
    } catch (error) {
      console.error("Impossible d'enregistrer la recherche récente :", error);
    }
    setRecent(nextRecent);
    setQuery(nextQuery);
    onSearch(nextQuery);
  };

  const clearRecent = () => {
    try {
      window.localStorage.removeItem(RECENT_SEARCH_KEY);
    } catch (error) {
      console.error("Impossible d'effacer les recherches récentes :", error);
    }
    setRecent([]);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit(query);
  };

  return (
    <div className="space-y-3">
      <form onSubmit={onSubmit} className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={lang === "fr" ? "Métier, entreprise, mot-clé" : "Job, company, keyword"}
          aria-label={lang === "fr" ? "Rechercher des offres" : "Search jobs"}
          className="h-12 rounded-xl pl-10 pr-12"
        />
        <button
          type="submit"
          aria-label={lang === "fr" ? "Rechercher" : "Search"}
          className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg bg-primary text-primary-foreground"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>

      {suggestions.length > 0 && (
        <ul aria-label={lang === "fr" ? "Suggestions" : "Suggestions"} className="space-y-1">
          {suggestions.map((suggestion) => (
            <li key={suggestion}>
              <button
                type="button"
                onClick={() => submit(suggestion)}
                className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-accent"
              >
                {suggestion}
              </button>
            </li>
          ))}
        </ul>
      )}

      {recent.length > 0 && (
        <section aria-label={lang === "fr" ? "Recherches récentes" : "Recent searches"} className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">{lang === "fr" ? "Recherches récentes" : "Recent searches"}</h2>
            <button type="button" onClick={clearRecent} className="text-xs text-muted-foreground hover:text-foreground">
              <X className="mr-1 inline h-3 w-3" aria-hidden="true" />
              {lang === "fr" ? "Effacer" : "Clear"}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recent.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => submit(item)}
                className="rounded-full bg-muted px-3 py-1.5 text-xs hover:bg-accent"
              >
                {item}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

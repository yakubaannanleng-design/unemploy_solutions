/**
 * PROBLÈME RÉSOLU : navigation vers les offres par catégorie depuis l'accueil.
 * RESPONSABILITÉ  : affiche la grille de catégories et transmet la catégorie choisie.
 * NE FAIT PAS     : ne charge pas les offres et ne les filtre pas.
 * DÉPEND DE       : features/categories/categories, lib/i18n.
 * UTILISÉ PAR     : features/accueil/PageAccueil.
 */
import { HOME_CATEGORIES } from "./categories";
import { useLang } from "@/lib/i18n";

interface GrilleCategoriesProps {
  onSelect: (categoryId: string) => void;
}

export default function GrilleCategories({ onSelect }: GrilleCategoriesProps) {
  const { lang } = useLang();

  return (
    <div className="grid grid-cols-3 gap-3">
      {HOME_CATEGORIES.map(({ id, name, nameEn, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onSelect(id)}
          className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border bg-card p-3 text-center transition-colors hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
          <span className="text-xs font-medium leading-tight">{lang === "fr" ? name : nameEn}</span>
        </button>
      ))}
    </div>
  );
}

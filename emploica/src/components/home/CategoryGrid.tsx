/**
 * PROBLÈME RÉSOLU : grille de sélection de catégories.
 * RESPONSABILITÉ  : affichage et sélection de catégories.
 * NE FAIT PAS     : ne parle pas à Supabase.
 * DÉPEND DE       : lib/i18n, @/data/categories, lib/iconMap.
 * UTILISÉ PAR     : features/jobs, features/search.
 */
import { useLang, t } from "lib/i18n";
import { CATEGORIES } from "@/data/categories";
import { getIcon } from "lib/iconMap";

const iconColors: Record<string, string> = {
  informatique: "text-blue-500",
  mecanique: "text-orange-500",
  sante: "text-red-500",
  batiment: "text-amber-600",
  commerce: "text-green-500",
  transport: "text-sky-500",
  agriculture: "text-emerald-500",
  hotellerie: "text-purple-500",
  administration: "text-indigo-500",
  electricite: "text-yellow-500",
  artisanat: "text-pink-500",
  autres: "text-muted-foreground",
};

interface CategoryGridProps {
  selected: string[];
  onToggle: (id: string) => void;
}

export default function CategoryGrid({ selected, onToggle }: CategoryGridProps) {
  const { lang } = useLang();
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
      {CATEGORIES.map((c) => {
        const active = selected.includes(c.id);
        const Icon = getIcon(c.icon);
        const color = iconColors[c.id] ?? "text-muted-foreground";
        return (
          <button
            key={c.id}
            onClick={() => onToggle(c.id)}
            className={`flex flex-col items-center justify-center gap-2 rounded-lg border p-3 text-center transition-colors min-h-[88px] ${active ? "border-primary bg-primary/5" : "hover:bg-accent"}`}
          >
            <Icon className={`h-6 w-6 ${color}`} aria-hidden />
            <span className="text-xs font-medium leading-tight line-clamp-2">
              {lang === "fr" ? c.name : c.nameEn}
            </span>
          </button>
        );
      })}
    </div>
  );
}

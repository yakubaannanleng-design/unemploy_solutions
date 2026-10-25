import { useLang, t } from "../../lib/i18n";
import { CATEGORIES } from "../../data/categories";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

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
        return (
          <button
            key={c.id}
            onClick={() => onToggle(c.id)}
            className={`flex items-center gap-2 rounded-lg border p-3 text-left transition-colors ${
              active ? "border-primary bg-primary/5" : "hover:bg-accent"
            }`}
          >
            <span className="text-lg" aria-hidden>
              {c.icon}
            </span>
            <span className="text-sm font-medium">
              {lang === "fr" ? c.name : c.nameEn}
            </span>
          </button>
        );
      })}
    </div>
  );
}
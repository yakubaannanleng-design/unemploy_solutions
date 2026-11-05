// Mapping nom d'icone (chaine) -> composant lucide-react.
// Utilise par CategoryGrid et partout ou une icone est referencee par son nom.
import type { LucideIcon } from "lucide-react";
import {
  Laptop,
  Wrench,
  Heart,
  Hammer,
  ShoppingBag,
  Truck,
  Utensils,
  Leaf,
  FileText,
  Zap,
  Scissors,
  Briefcase,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  laptop: Laptop,
  wrench: Wrench,
  heart: Heart,
  hammer: Hammer,
  "shopping-bag": ShoppingBag,
  shoppingbag: ShoppingBag,
  truck: Truck,
  utensils: Utensils,
  leaf: Leaf,
  "file-text": FileText,
  filetext: FileText,
  zap: Zap,
  scissors: Scissors,
  briefcase: Briefcase,
};

export function getIcon(name: string): LucideIcon {
  const key = String(name ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
  return iconMap[key] ?? iconMap[key.replace(/-/g, "")] ?? Briefcase;
}

export default iconMap;

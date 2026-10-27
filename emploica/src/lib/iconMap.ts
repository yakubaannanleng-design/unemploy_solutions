// Mapping nom d'icône (chaîne) → composant lucide-react.
// Utilisé par CategoryGrid et partout où une icône est référencée par son nom.
import React from "react";
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

const iconMap: Record<string, React.ComponentType<any>> = {
  laptop: Laptop,
  wrench: Wrench,
  heart: Heart,
  hammer: Hammer,
  "shopping-bag": ShoppingBag,
  truck: Truck,
  utensils: Utensils,
  leaf: Leaf,
  "file-text": FileText,
  zap: Zap,
  scissors: Scissors,
  briefcase: Briefcase,
};

export function getIcon(name: string): React.ComponentType<any> {
  return iconMap[name] ?? Briefcase;
}

export default iconMap;
/**
 * PROBLÈME RÉSOLU : définit les catégories accessibles depuis l'accueil.
 * RESPONSABILITÉ  : associe libellés, icônes et catégories d'offres compatibles.
 * NE FAIT PAS     : ne charge pas les offres et ne gère pas la navigation.
 * DÉPEND DE       : lucide-react.
 * UTILISÉ PAR     : features/categories/GrilleCategories, features/jobs/OffersView.
 */
import {
  BookOpen,
  Building2,
  GraduationCap,
  HardHat,
  HeartPulse,
  Landmark,
  Monitor,
  Scissors,
  ShoppingBag,
  Truck,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import type { Offer } from "@/types";

export interface HomeCategory {
  id: string;
  name: string;
  nameEn: string;
  icon: LucideIcon;
  offerCategories?: string[];
  contract?: string;
}

export const HOME_CATEGORIES: HomeCategory[] = [
  { id: "informatique", name: "Informatique", nameEn: "IT", icon: Monitor, offerCategories: ["informatique"] },
  { id: "commerce", name: "Commerce et vente", nameEn: "Sales & commerce", icon: ShoppingBag, offerCategories: ["commerce"] },
  { id: "banque", name: "Banque et finance", nameEn: "Banking & finance", icon: Landmark, offerCategories: ["banque", "finance"] },
  { id: "sante", name: "Santé", nameEn: "Healthcare", icon: HeartPulse, offerCategories: ["sante"] },
  { id: "education", name: "Éducation", nameEn: "Education", icon: BookOpen, offerCategories: ["education", "enseignement"] },
  { id: "batiment", name: "BTP", nameEn: "Construction", icon: HardHat, offerCategories: ["batiment", "btp", "construction"] },
  { id: "transport", name: "Transport", nameEn: "Transport", icon: Truck, offerCategories: ["transport"] },
  { id: "hotellerie", name: "Restauration et hôtellerie", nameEn: "Hospitality & catering", icon: UtensilsCrossed, offerCategories: ["hotellerie", "restauration"] },
  { id: "petits-metiers", name: "Petits métiers", nameEn: "Skilled trades", icon: Scissors, offerCategories: ["autres", "artisanat", "mecanique", "electricite", "agriculture"] },
  { id: "administration", name: "Administration", nameEn: "Administration", icon: Building2, offerCategories: ["administration"] },
  { id: "stages", name: "Stages", nameEn: "Internships", icon: GraduationCap, contract: "stage" },
];

export function matchesHomeCategory(category: HomeCategory, offer: Pick<Offer, "category" | "contract">): boolean {
  if (category.contract) return offer.contract === category.contract;
  const normalize = (value: string) =>
    value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
  return category.offerCategories?.some((candidate) => normalize(candidate) === normalize(offer.category)) ?? false;
}

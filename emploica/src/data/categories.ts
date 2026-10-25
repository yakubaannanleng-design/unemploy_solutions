import type { Category } from "../types";

export const CATEGORIES: Category[] = [
  { id: "informatique", name: "Informatique et numérique", nameEn: "IT & Digital", icon: "laptop", description: "Développement, support, data, bureautique." },
  { id: "mecanique", name: "Mécanique et maintenance", nameEn: "Mechanics & Maintenance", icon: "wrench", description: "Véhicules, moteurs, entretien." },
  { id: "sante", name: "Santé et soins", nameEn: "Health & Care", icon: "heart", description: "Soins infirmiers, aide à domicile, pharmacie." },
  { id: "batiment", name: "Bâtiment et travaux", nameEn: "Construction", icon: "hammer", description: "Maçonnerie, peinture, plomberie, carrelage." },
  { id: "commerce", name: "Commerce et vente", nameEn: "Sales & Commerce", icon: "shopping-bag", description: "Vente, caisse, stock, accueil." },
  { id: "transport", name: "Transport et logistique", nameEn: "Transport & Logistics", icon: "truck", description: "Livreur, chauffeur, magasinier." },
  { id: "agriculture", name: "Agriculture et élevage", nameEn: "Agriculture & Livestock", icon: "leaf", description: "Culture, élevage, transformation." },
  { id: "hotellerie", name: "Hôtellerie, restauration et services", nameEn: "Hospitality", icon: "utensils", description: "Cuisine, serveur, ménage, réception." },
  { id: "administration", name: "Administration et secrétariat", nameEn: "Admin & Secretariat", icon: "file-text", description: "Bureautique, accueil, gestion." },
  { id: "electricite", name: "Électricité et énergie", nameEn: "Electricity & Energy", icon: "zap", description: "Électricité civile, énergies." },
  { id: "artisanat", name: "Artisanat", nameEn: "Crafts", icon: "scissors", description: "Couture, menuiserie, décor." },
  { id: "autres", name: "Autres métiers", nameEn: "Other trades", icon: "briefcase", description: "Métiers non listés." },
];

export function categoryById(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}
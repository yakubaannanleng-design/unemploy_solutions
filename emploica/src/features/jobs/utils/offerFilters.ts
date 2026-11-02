/**
 * PROBLÈME RÉSOLU : définit les filtres détaillés des offres et leurs valeurs initiales.
 * RESPONSABILITÉ  : centralise le contrat de filtres utilisé par la page et son panneau.
 * NE FAIT PAS     : ne rend pas d'interface et ne charge pas de données.
 * DÉPEND DE       : features/jobs/components/FiltresOffres.
 * UTILISÉ PAR     : features/jobs/OffersView, features/jobs/PanneauFiltres.
 */
import type { OfferQuickFilters } from "../components/FiltresOffres";

export interface CompleteOfferFilters extends OfferQuickFilters {
  quartier: string;
  educationLevel: string;
  experienceLevel: string;
  salaryMin?: number;
  salaryMax?: number;
  publishedWithinDays?: number;
  hideFilled: boolean;
}

export const DEFAULT_OFFER_FILTERS: CompleteOfferFilters = {
  city: "",
  contract: "",
  quartier: "",
  educationLevel: "",
  experienceLevel: "",
  salaryMin: undefined,
  salaryMax: undefined,
  publishedWithinDays: undefined,
  hideFilled: true,
};

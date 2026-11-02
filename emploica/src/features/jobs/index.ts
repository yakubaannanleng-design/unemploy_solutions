/**
 * PROBLÈME RÉSOLU : point d'entrée public du module jobs (encapsulation).
 * RESPONSABILITÉ  : ré-exporte uniquement ce que le module jobs expose au reste de l'application.
 * NE FAIT PAS     : ne contient aucune logique métier ni accès à la base de données.
 * DÉPEND DE       : features/jobs/components/*.
 * UTILISÉ PAR     : app, features/favorites, features/search, features/dashboard (temporaire).
 */
export { default as OfferCard } from "./components/OfferCard";
export { default as CarteOffre } from "./components/CarteOffre";
export { default as BarreRecherche } from "./components/BarreRecherche";
export { default as FiltresOffres } from "./components/FiltresOffres";
export { default as ListeOffres } from "./components/ListeOffres";
export { default as PanneauFiltres } from "./components/PanneauFiltres";
export { default as RecherchesRecentes } from "./components/RecherchesRecentes";
export { default as OfferDetailModal } from "./components/OfferDetailModal";
export { default as DetailOffre } from "./components/DetailOffre";
export { default as BadgeVerifie } from "./components/BadgeVerifie";
export { default as MessagePrevention } from "./components/MessagePrevention";
export { default as SignalerOffre } from "./components/SignalerOffre";
export { default as BadgePourvu } from "./components/BadgePourvu";
export { default as BandeauOffrePourvue } from "./components/BandeauOffrePourvue";
export { isCandidateOfferVisible, isRecentlyFilledOffer, DELAI_AFFICHAGE_POURVU_JOURS } from "./utils/filledOffers";
export { default as OfferForm } from "./components/OfferForm";
export { default as OffersView } from "./components/OffersView";
export { default as FlashOffersView } from "./components/FlashOffersView";
export { filterOffers, useOffers } from "./hooks/useOffers";

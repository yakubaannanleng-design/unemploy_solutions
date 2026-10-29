/**
 * PROBLÈME RÉSOLU : point d'entrée public du module jobs (encapsulation).
 * RESPONSABILITÉ  : ré-exporte uniquement ce que le module jobs expose au reste de l'application.
 * NE FAIT PAS     : ne contient aucune logique métier ni accès à la base de données.
 * DÉPEND DE       : features/jobs/components/*.
 * UTILISÉ PAR     : app, features/favorites, features/search, features/dashboard (temporaire).
 */
export { default as OfferCard } from "./components/OfferCard";
export { default as OfferDetailModal } from "./components/OfferDetailModal";
export { default as OfferForm } from "./components/OfferForm";
export { default as OffersView } from "./components/OffersView";
export { default as FlashOffersView } from "./components/FlashOffersView";
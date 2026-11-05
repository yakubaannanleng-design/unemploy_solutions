/**
 * PROBLÈME RÉSOLU : point d'entrée public du module ratings (encapsulation).
 * RESPONSABILITÉ  : ré-exporte uniquement ce que le module ratings expose au reste de l'application.
 * NE FAIT PAS     : ne contient aucune logique métier ni accès à la base de données.
 * DÉPEND DE       : features/ratings/components/RatingModal.
 * UTILISÉ PAR     : features/jobs (OffersView, temporaire), features/profiles (ProfileView, temporaire).
 */
export { default as RatingModal } from "./components/RatingModal";
export { default } from "./components/RatingModal";
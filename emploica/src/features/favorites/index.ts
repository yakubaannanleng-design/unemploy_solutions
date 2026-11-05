/**
 * PROBLÈME RÉSOLU : point d'entrée public du module favorites (encapsulation).
 * RESPONSABILITÉ  : ré-exporte uniquement ce que le module favorites expose au reste de l'application.
 * NE FAIT PAS     : ne contient aucune logique métier ni accès à la base de données.
 * DÉPEND DE       : features/favorites/components/FavoritesView.
 * UTILISÉ PAR     : app (route /favoris).
 */
export { default as FavoritesView } from "./components/FavoritesView";
export { default } from "./components/FavoritesView";
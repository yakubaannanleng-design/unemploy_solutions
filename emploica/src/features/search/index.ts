/**
 * PROBLÈME RÉSOLU : point d'entrée public du module search (encapsulation).
 * RESPONSABILITÉ  : ré-exporte uniquement ce que le module search expose au reste de l'application.
 * NE FAIT PAS     : ne contient aucune logique métier ni accès à la base de données.
 * DÉPEND DE       : features/search/components/SearchView.
 * UTILISÉ PAR     : app (route /recherche).
 */
export { default as SearchView } from "./components/SearchView";
export { default } from "./components/SearchView";
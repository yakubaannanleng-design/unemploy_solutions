/**
 * PROBLÈME RÉSOLU : point d'entrée des hooks du module favorites.
 * RESPONSABILITÉ  : expose le hook Supabase de suivi des offres enregistrées.
 * NE FAIT PAS     : ne contient pas la logique d'accès à la base de données.
 * DÉPEND DE       : useFavorites.
 * UTILISÉ PAR     : features/favorites, features/jobs.
 */
export { useFavorites } from "./useFavorites";